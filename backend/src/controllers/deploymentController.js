const fs = require('fs');
const path = require('path');

const db = require('../dbHelpers');
const { getFreePort } = require('../portManager');
const { runCommand } = require('../services/buildRunner');
const { detectFramework } = require('../services/frameworkDetector');
const { ensureRepo, getCommitInfo, projectNameFromRepoUrl, sanitizeProjectName } = require('../services/gitManager');
const { restartProcess, stopProcess } = require('../services/processManager');
const { upsertProjectRoute } = require('../services/nginxManager');
const { ensureRuntimeArtifacts, getProject, upsertProject } = require('../services/runtimeRegistry');

const ROOT_DIR = path.join(__dirname, '../../..');
const APPS_DIR = process.env.APPS_DIR || path.join(ROOT_DIR, 'apps');
const BASE_DOMAIN = process.env.BASE_DOMAIN || 'minishinobi.dev';
const SYSTEM_USER_GITHUB_ID = 'system-webhook';

function parseBranch(ref, fallback = 'main') {
  if (!ref) return fallback;
  if (ref.startsWith('refs/heads/')) return ref.replace('refs/heads/', '');
  return ref;
}

function updateDeployment(id, fields) {
  const keys = Object.keys(fields);
  if (!keys.length) return;
  const sets = keys.map(k => `${k} = ?`).join(', ');
  db.prepare(`UPDATE deployments SET ${sets} WHERE id = ?`).run(...keys.map(k => fields[k]), id);
}

function ensureSystemUser() {
  const existing = db.prepare('SELECT * FROM users WHERE github_id = ?').get(SYSTEM_USER_GITHUB_ID);
  if (existing) return existing;

  const { lastInsertRowid } = db.prepare(
    'INSERT INTO users (github_id, username, avatar_url, access_token) VALUES (?, ?, ?, ?)'
  ).run(SYSTEM_USER_GITHUB_ID, 'system-webhook', null, null);

  return db.prepare('SELECT * FROM users WHERE id = ?').get(lastInsertRowid);
}

function hasCustomProjectCommands(project) {
  const install = (project.install_command || '').trim();
  const build = (project.build_command || '').trim();
  const start = (project.start_command || '').trim();
  return Boolean(
    (install && install !== 'npm install') ||
    (build && build !== 'npm run build') ||
    start
  );
}

function readMiniShinobiConfig(projectPath) {
  const configPath = path.join(projectPath, '.minishinobi.json');
  if (!fs.existsSync(configPath)) return null;
  const raw = fs.readFileSync(configPath, 'utf8');
  return JSON.parse(raw);
}

function resolveProjectCommands({ project, projectPath, onLog }) {
  let fileConfig = null;
  try {
    fileConfig = readMiniShinobiConfig(projectPath);
    if (fileConfig) onLog('system', 'Found .minishinobi.json, applying command overrides');
  } catch (err) {
    onLog('stderr', `Invalid .minishinobi.json: ${err.message}`);
  }

  const detected = detectFramework(projectPath);
  const customCommands = hasCustomProjectCommands(project);

  let buildCommand = detected.build;
  let startCommand = detected.start;

  if (customCommands) {
    const install = (project.install_command || '').trim();
    const build = (project.build_command || '').trim();
    const combined = [install, build].filter(Boolean).join(' && ');
    buildCommand = combined || buildCommand;

    if (project.start_command?.trim()) {
      startCommand = project.start_command.trim();
    } else if (project.output_dir?.trim()) {
      startCommand = `npx serve ${project.output_dir.trim()}`;
    }
  }

  if (fileConfig?.build) buildCommand = String(fileConfig.build).trim();
  if (fileConfig?.start) startCommand = String(fileConfig.start).trim();

  return {
    framework: detected.framework,
    buildCommand,
    startCommand,
    usedFileConfig: Boolean(fileConfig),
  };
}

function deploymentLogger(deploymentId, onLog) {
  return (stream, message) => onLog(deploymentId, stream, message);
}

function normalizeRepoUrl(url) {
  return String(url || '').toLowerCase().trim().replace(/\.git$/i, '');
}

async function createWebhookDeployment({ repoUrl, ref }) {
  if (!repoUrl) throw new Error('repository.clone_url is required');

  const branch = parseBranch(ref, 'main');
  const normalizedIncoming = normalizeRepoUrl(repoUrl);

  // Search across all projects for a matching normalized URL
  const allProjects = db.prepare('SELECT * FROM projects').all();
  let project = allProjects.find(p => normalizeRepoUrl(p.repo_url) === normalizedIncoming);

  if (!project) {
    const user = ensureSystemUser();
    const projectName = projectNameFromRepoUrl(repoUrl);
    const slug = sanitizeProjectName(projectName);

    // Fallback: search by slug for system user
    project = db.prepare('SELECT * FROM projects WHERE user_id = ? AND slug = ?').get(user.id, slug);

    if (!project) {
      const { lastInsertRowid } = db.prepare(
        `INSERT INTO projects
          (user_id, name, slug, repo_url, branch, install_command, build_command, output_dir, start_command, framework)
         VALUES (?, ?, ?, ?, ?, ?, ?, ?, ?, ?)`
      ).run(user.id, projectName, slug, repoUrl, branch, 'npm install', 'npm run build', null, null, null);

      project = db.prepare('SELECT * FROM projects WHERE id = ?').get(lastInsertRowid);
    }
  } else {
    // If found, ensure we use the incoming branch for this specific webhook trigger
    db.prepare('UPDATE projects SET repo_url = ?, branch = ? WHERE id = ?').run(repoUrl, branch, project.id);
    project = db.prepare('SELECT * FROM projects WHERE id = ?').get(project.id);
  }

  const { lastInsertRowid: deploymentId } = db.prepare(
    "INSERT INTO deployments (project_id, status) VALUES (?, 'queued')"
  ).run(project.id);

  return { deploymentId, projectId: project.id, projectName: project.name, branch };
}

async function executeDeployment(deploymentId, onLog) {
  ensureRuntimeArtifacts();

  const log = deploymentLogger(deploymentId, onLog);
  const deployment = db.prepare('SELECT * FROM deployments WHERE id = ?').get(deploymentId);
  if (!deployment) throw new Error(`Deployment ${deploymentId} not found`);

  const project = db.prepare('SELECT * FROM projects WHERE id = ?').get(deployment.project_id);
  if (!project) throw new Error(`Project ${deployment.project_id} not found`);

  const projectName = sanitizeProjectName(project.slug || project.name || projectNameFromRepoUrl(project.repo_url));
  const branch = project.branch || 'main';
  const host = `${projectName}.${BASE_DOMAIN}`;

  updateDeployment(deploymentId, {
    status: 'building',
    started_at: new Date().toISOString(),
    error_message: null,
  });

  upsertProject(projectName, {
    name: projectName,
    status: 'building',
    repoUrl: project.repo_url,
    branch,
    deploymentId,
  });

  log('system', `Deployment #${deploymentId} started for ${projectName}`);

  try {
    const projectPath = await ensureRepo({
      appsDir: APPS_DIR,
      projectName,
      repoUrl: project.repo_url,
      branch,
      onLog: log,
    });

    const { sha, msg } = await getCommitInfo(projectPath);
    updateDeployment(deploymentId, { commit_sha: sha, commit_msg: msg });
    log('system', `Commit: ${sha} -- ${msg}`);

    const resolved = resolveProjectCommands({ project, projectPath, onLog: log });
    db.prepare('UPDATE projects SET framework = ? WHERE id = ?').run(resolved.framework, project.id);
    log('system', `Framework detected: ${resolved.framework}`);

    if (resolved.buildCommand) {
      log('system', `Running build: ${resolved.buildCommand}`);
      await runCommand({
        command: resolved.buildCommand,
        cwd: projectPath,
        env: { NODE_ENV: 'production' },
        onLog: log,
      });
    } else {
      log('system', 'No build command required for this project');
    }

    const runtime = getProject(projectName);
    const port = runtime?.port ? Number(runtime.port) : await getFreePort();

    const proc = await restartProcess({
      name: projectName,
      path: projectPath,
      port,
      startCommand: resolved.startCommand,
      env: {
        PROJECT_NAME: projectName,
        PROJECT_HOST: host,
      },
    }, {
      onLog: log,
      onExit: ({ status, code, signal }) => {
        if (status === 'crashed') {
          const reason = `Process crashed (code=${code}, signal=${signal})`;
          log('stderr', reason);
          updateDeployment(deploymentId, {
            status: 'failed',
            error_message: reason,
            finished_at: new Date().toISOString(),
          });
        }
      },
    });

    await upsertProjectRoute({
      projectName,
      host,
      port,
      onLog: log,
    });

    upsertProject(projectName, {
      name: projectName,
      host,
      path: projectPath,
      port,
      status: 'running',
      pid: proc.pid,
      repoUrl: project.repo_url,
      branch,
      framework: resolved.framework,
      buildCommand: resolved.buildCommand,
      startCommand: resolved.startCommand,
      deploymentId,
    });

    updateDeployment(deploymentId, {
      status: 'ready',
      port,
      pid: proc.pid,
      tunnel_url: `https://${host}`,
      finished_at: new Date().toISOString(),
    });

    log('system', `Deployment ready: https://${host}`);
    log('system', '[END]');
  } catch (err) {
    log('stderr', `Deployment failed: ${err.message}`);
    upsertProject(projectName, {
      status: 'failed',
      lastError: err.message,
      deploymentId,
    });
    updateDeployment(deploymentId, {
      status: 'failed',
      error_message: err.message,
      finished_at: new Date().toISOString(),
    });
    log('system', '[END]');
    throw err;
  }
}

async function cancelDeployment(deploymentId, onLog) {
  const log = deploymentLogger(deploymentId, onLog);
  const dep = db.prepare('SELECT * FROM deployments WHERE id = ?').get(deploymentId);
  if (!dep) return;

  const project = db.prepare('SELECT * FROM projects WHERE id = ?').get(dep.project_id);
  if (!project) return;

  const projectName = sanitizeProjectName(project.slug || project.name || projectNameFromRepoUrl(project.repo_url));

  await stopProcess(projectName, { onLog: log });

  upsertProject(projectName, {
    status: 'stopped',
    pid: null,
    stoppedAt: new Date().toISOString(),
  });

  updateDeployment(deploymentId, {
    status: 'cancelled',
    finished_at: new Date().toISOString(),
  });

  log('system', 'Deployment cancelled');
  log('system', '[END]');
}

module.exports = {
  APPS_DIR,
  BASE_DOMAIN,
  parseBranch,
  createWebhookDeployment,
  executeDeployment,
  cancelDeployment,
};
