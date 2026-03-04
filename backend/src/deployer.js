const { spawn, execSync } = require('child_process');
const path = require('path');
const fs = require('fs');
const treeKill = require('tree-kill');
const db = require('./dbHelpers');
const { getFreePort } = require('./portManager');
require('dotenv').config({ path: path.join(__dirname, '../.env') });

const DEPLOYMENTS_DIR = process.env.DEPLOYMENTS_DIR;
const sseClients = new Map();

function registerSSE(id, res) {
  if (!sseClients.has(id)) sseClients.set(id, new Set());
  sseClients.get(id).add(res);
}

function unregisterSSE(id, res) {
  sseClients.get(id)?.delete(res);
}

function broadcastLog(deploymentId, stream, message) {
  const clean = message.replace(/\x1b\[[0-9;]*m/g, '').replace(/\r/g, '');
  if (!clean.trim()) return;
  db.prepare('INSERT INTO logs (deployment_id, stream, message) VALUES (?, ?, ?)')
    .run(deploymentId, stream, clean);
  const payload = JSON.stringify({ stream, message: clean, ts: new Date().toISOString() });
  (sseClients.get(deploymentId) || new Set()).forEach(res => {
    try { res.write(`data: ${payload}\n\n`); } catch (_) { }
  });
}

function updateDeployment(id, fields) {
  const sets = Object.keys(fields).map(k => `${k} = ?`).join(', ');
  db.prepare(`UPDATE deployments SET ${sets} WHERE id = ?`).run(...Object.values(fields), id);
}

function runCommand(deploymentId, cwd, command, extraEnv = {}) {
  return new Promise((resolve, reject) => {
    broadcastLog(deploymentId, 'system', `$ ${command}`);
    const proc = spawn('sh', ['-c', command], {
      cwd,
      env: {
        ...process.env,
        PATH: `${path.join(cwd, 'node_modules', '.bin')}${path.delimiter}${process.env.PATH}`,
        NO_COLOR: '1', FORCE_COLOR: '0', CI: 'true',
        NODE_OPTIONS: '--max-old-space-size=512',
        NODE_ENV: 'development', // Default to development to ensure devDeps are used/installed
        ...extraEnv,
      },
      stdio: ['ignore', 'pipe', 'pipe'],
    });
    let outBuf = '', errBuf = '';
    proc.stdout.on('data', chunk => {
      outBuf += chunk.toString();
      const lines = outBuf.split('\n');
      outBuf = lines.pop();
      lines.forEach(l => broadcastLog(deploymentId, 'stdout', l));
    });
    proc.stderr.on('data', chunk => {
      errBuf += chunk.toString();
      const lines = errBuf.split('\n');
      errBuf = lines.pop();
      lines.forEach(l => broadcastLog(deploymentId, 'stderr', l));
    });
    proc.on('close', code => {
      if (outBuf) broadcastLog(deploymentId, 'stdout', outBuf);
      if (errBuf) broadcastLog(deploymentId, 'stderr', errBuf);
      code === 0 ? resolve() : reject(new Error(`"${command}" exited with code ${code}`));
    });
    proc.on('error', reject);
  });
}

// One build at a time — SD660 with 4GB cannot safely run concurrent builds
let buildInProgress = false;
const buildQueue = [];

async function queueDeploy(deploymentId) {
  if (buildInProgress) {
    buildQueue.push(deploymentId);
    broadcastLog(deploymentId, 'system', 'Another build is running. Queued...');
    return;
  }
  buildInProgress = true;
  try {
    await deploy(deploymentId);
  } finally {
    buildInProgress = false;
    if (buildQueue.length > 0) queueDeploy(buildQueue.shift()).catch(console.error);
  }
}

async function deploy(deploymentId) {
  const deployment = db.prepare('SELECT * FROM deployments WHERE id = ?').get(deploymentId);
  const project = db.prepare('SELECT * FROM projects WHERE id = ?').get(deployment.project_id);
  updateDeployment(deploymentId, { status: 'building', started_at: new Date().toISOString() });
  broadcastLog(deploymentId, 'system', `Deployment #${deploymentId} started for "${project.name}"`);
  const buildDir = path.join(DEPLOYMENTS_DIR, `${project.id}-${deploymentId}`);

  try {
    // Step 1: Clone
    broadcastLog(deploymentId, 'system', `Cloning ${project.repo_url} (${project.branch})`);
    fs.mkdirSync(buildDir, { recursive: true });
    await runCommand(deploymentId, DEPLOYMENTS_DIR,
      `git clone --depth 1 --branch ${project.branch} ${project.repo_url} "${buildDir}"`);

    // Step 2: Commit info
    const sha = execSync('git rev-parse --short HEAD', { cwd: buildDir }).toString().trim();
    const msg = execSync('git log -1 --pretty=%s', { cwd: buildDir }).toString().trim();
    db.prepare('UPDATE deployments SET commit_sha=?, commit_msg=? WHERE id=?').run(sha, msg, deploymentId);
    broadcastLog(deploymentId, 'system', `Commit: ${sha} -- ${msg}`);

    // Step 3: Install
    broadcastLog(deploymentId, 'system', `Running: ${project.install_command}`);
    await runCommand(deploymentId, buildDir, project.install_command, { NODE_ENV: 'development' });

    // Step 4: Build
    if (project.build_command?.trim()) {
      broadcastLog(deploymentId, 'system', `Running: ${project.build_command}`);
      await runCommand(deploymentId, buildDir, project.build_command, { NODE_ENV: 'production' });
    }

    // Step 5: Serve
    const port = await getFreePort();
    let appPid;

    const startCmd = project.start_command?.trim();
    const outputPath = project.output_dir ? path.join(buildDir, project.output_dir) : null;
    const isStaticSite = !startCmd && outputPath && fs.existsSync(outputPath);

    if (isStaticSite) {
      // True static site (e.g. Vite, CRA) — no start command, just serve build output as files
      broadcastLog(deploymentId, 'system', `Serving static files from "${project.output_dir}" on port ${port}`);
      const p = spawn('serve', ['-s', outputPath, '-l', String(port)],
        { detached: true, stdio: 'ignore' });
      p.unref();
      appPid = p.pid;
    } else {
      // Node server app (Next.js, Express, etc.) — run start_command or fall back to npm start
      const cmd = startCmd || 'npm start';
      broadcastLog(deploymentId, 'system', `Starting Node server with: ${cmd} on port ${port}`);
      const p = spawn('sh', ['-c', cmd], {
        cwd: buildDir,
        env: { ...process.env, PORT: String(port), NODE_ENV: 'production' },
        detached: true,
        stdio: 'ignore',
      });
      p.unref();
      appPid = p.pid;
    }

    // Step 6: Tunnel
    broadcastLog(deploymentId, 'system', `Creating Cloudflare tunnel for port ${port}...`);
    const deploymentSlug = project.slug || project.name.toLowerCase().replace(/[^a-z0-9]/g, '-').replace(/-+/g, '-').replace(/^-|-$/g, '');
    const tunnelUrl = await createNamedTunnel(deploymentId, deploymentSlug, port);

    // Step 7: Done
    updateDeployment(deploymentId, {
      status: 'ready', port, pid: appPid,
      tunnel_url: tunnelUrl, finished_at: new Date().toISOString(),
    });
    broadcastLog(deploymentId, 'system', `Deployment ready: ${tunnelUrl}`);
    broadcastLog(deploymentId, 'system', '[END]');

  } catch (err) {
    broadcastLog(deploymentId, 'stderr', `Deployment failed: ${err.message}`);
    updateDeployment(deploymentId, {
      status: 'failed', error_message: err.message,
      finished_at: new Date().toISOString(),
    });
    broadcastLog(deploymentId, 'system', '[END]');
    try { fs.rmSync(buildDir, { recursive: true, force: true }); } catch (_) { }
  }
}

// function createQuickTunnel(deploymentId, port) {
//   return new Promise((resolve, reject) => {
//     const proc = spawn(
//       'cloudflared', ['tunnel', '--url', `http://localhost:${port}`],
//       { detached: true, stdio: ['ignore', 'pipe', 'pipe'] }
//     );
//     let resolved = false;
//     function tryResolve(data) {
//       const match = data.toString().match(/https:\/\/[a-z0-9-]+\.trycloudflare\.com/);
//       if (match && !resolved) {
//         resolved = true;
//         db.prepare('UPDATE deployments SET tunnel_pid=? WHERE id=?').run(proc.pid, deploymentId);
//         resolve(match[0]);
//       }
//     }
//     proc.stdout.on('data', tryResolve);
//     proc.stderr.on('data', tryResolve);
//     proc.unref();
//     setTimeout(() => {
//       if (!resolved) reject(new Error('Tunnel URL not received within 30s'));
//     }, 30000);
//   });
// }

async function createNamedTunnel(deploymentId, projectSlug, port) {
  const subdomain = `${projectSlug}.bhaumicsingh.tech`;
  broadcastLog(deploymentId, 'system', `Routing DNS for ${subdomain}...`);
  try {
    execSync(`cloudflared tunnel route dns minishinobi-dashboard ${subdomain}`);
  } catch (err) {
    broadcastLog(deploymentId, 'stderr', `Failed to route DNS: ${err.message}`);
  }

  const os = require('os');
  const projectConfigPath = path.join(__dirname, '../../.cloudflared/config.yml');
  const homeConfigPath = path.join(os.homedir(), '.cloudflared/config.yml');
  const configPath = fs.existsSync(projectConfigPath) ? projectConfigPath : homeConfigPath;

  if (fs.existsSync(configPath)) {
    broadcastLog(deploymentId, 'system', `Updating cloudflared config...`);
    let configContent = fs.readFileSync(configPath, 'utf8');
    const newIngress = `  - hostname: ${subdomain}\n    service: http://localhost:${port}\n  - service: http_status:404`;

    if (configContent.includes('  - service: http_status:404') && !configContent.includes(`hostname: ${subdomain}`)) {
      configContent = configContent.replace('  - service: http_status:404', newIngress);
      fs.writeFileSync(configPath, configContent);
      broadcastLog(deploymentId, 'system', 'Ingress rules updated.');

      try {
        if (process.platform === 'android' || process.platform === 'linux') {
          execSync('pkill -HUP cloudflared');
          broadcastLog(deploymentId, 'system', 'Reloaded cloudflared configuration.');
        } else {
          broadcastLog(deploymentId, 'system', 'Please manually restart cloudflared if needed on Windows.');
        }
      } catch (err) {
        broadcastLog(deploymentId, 'stderr', `Failed to reload cloudflared: ${err.message}`);
      }
    }
  } else {
    broadcastLog(deploymentId, 'stderr', `Could not find cloudflared config.yml to update ingress.`);
  }

  return `https://${subdomain}`;
}

function stopDeployment(deploymentId) {
  const dep = db.prepare('SELECT * FROM deployments WHERE id = ?').get(deploymentId);
  if (!dep) return;
  if (dep.pid) try { treeKill(Number(dep.pid), 'SIGTERM'); } catch (_) { }
  if (dep.tunnel_pid) try { treeKill(Number(dep.tunnel_pid), 'SIGTERM'); } catch (_) { }
  updateDeployment(deploymentId, { status: 'cancelled' });
  const project = db.prepare('SELECT * FROM projects WHERE id = ?').get(dep.project_id);
  const buildDir = path.join(DEPLOYMENTS_DIR, `${project.id}-${deploymentId}`);
  try { fs.rmSync(buildDir, { recursive: true, force: true }); } catch (_) { }
}

module.exports = { queueDeploy, stopDeployment, registerSSE, unregisterSSE };
