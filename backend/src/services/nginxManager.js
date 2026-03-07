const fs = require('fs');
const path = require('path');
const { runCommand } = require('./buildRunner');

const ROOT_DIR = path.join(__dirname, '../../..');
const NGINX_SITES_ENABLED_DIR = process.env.NGINX_SITES_ENABLED_DIR || path.join(ROOT_DIR, 'nginx', 'sites-enabled');
const NGINX_RELOAD_CMD = process.env.NGINX_RELOAD_CMD || 'nginx -s reload';
const NGINX_LISTEN_PORT = Number(process.env.NGINX_LISTEN_PORT || '4000');

function renderSiteConfig({ host, port }) {
  return [
    'server {',
    `    listen ${NGINX_LISTEN_PORT};`,
    `    server_name ${host};`,
    '',
    '    location / {',
    `        proxy_pass http://127.0.0.1:${port};`,
    '        proxy_http_version 1.1;',
    '        proxy_set_header Host $host;',
    '        proxy_set_header Upgrade $http_upgrade;',
    '        proxy_set_header Connection "upgrade";',
    '        proxy_set_header X-Real-IP $remote_addr;',
    '        proxy_set_header X-Forwarded-For $proxy_add_x_forwarded_for;',
    '        proxy_set_header X-Forwarded-Proto $scheme;',
    '        proxy_read_timeout 86400s;',
    '    }',
    '}',
    '',
  ].join('\n');
}

function ensureSitesDirectory() {
  fs.mkdirSync(NGINX_SITES_ENABLED_DIR, { recursive: true });
}

async function reloadNginx(onLog = () => {}) {
  await runCommand({
    command: NGINX_RELOAD_CMD,
    cwd: ROOT_DIR,
    onLog,
  });
}

async function upsertProjectRoute({ projectName, host, port, onLog = () => {} }) {
  ensureSitesDirectory();
  const filePath = path.join(NGINX_SITES_ENABLED_DIR, `${projectName}.conf`);
  const nextContent = renderSiteConfig({ host, port });

  const current = fs.existsSync(filePath) ? fs.readFileSync(filePath, 'utf8') : null;
  const changed = current !== nextContent;

  if (changed) {
    fs.writeFileSync(filePath, nextContent);
    onLog('system', `Wrote nginx config: ${filePath}`);
    await reloadNginx(onLog);
  } else {
    onLog('system', `Nginx config unchanged for ${projectName}`);
  }

  return { filePath, changed };
}

async function removeProjectRoute({ projectName, onLog = () => {} }) {
  ensureSitesDirectory();
  const filePath = path.join(NGINX_SITES_ENABLED_DIR, `${projectName}.conf`);

  if (!fs.existsSync(filePath)) {
    onLog('system', `No nginx config found for ${projectName}`);
    return { filePath, removed: false };
  }

  fs.rmSync(filePath, { force: true });
  onLog('system', `Removed nginx config: ${filePath}`);
  await reloadNginx(onLog);
  return { filePath, removed: true };
}

module.exports = {
  NGINX_SITES_ENABLED_DIR,
  NGINX_RELOAD_CMD,
  NGINX_LISTEN_PORT,
  renderSiteConfig,
  ensureSitesDirectory,
  reloadNginx,
  upsertProjectRoute,
  removeProjectRoute,
};