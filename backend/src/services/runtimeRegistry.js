const fs = require('fs');
const path = require('path');

const ROOT_DIR = path.join(__dirname, '../../..');
const RUNTIME_DIR = process.env.RUNTIME_DIR || path.join(ROOT_DIR, 'runtime');
const RUNTIME_LOGS_DIR = path.join(RUNTIME_DIR, 'logs');
const RUNTIME_NGINX_DIR = path.join(RUNTIME_DIR, 'nginx');
const PROJECTS_FILE = path.join(RUNTIME_DIR, 'projects.json');

function ensureRuntimeArtifacts() {
  fs.mkdirSync(RUNTIME_DIR, { recursive: true });
  fs.mkdirSync(RUNTIME_LOGS_DIR, { recursive: true });
  fs.mkdirSync(RUNTIME_NGINX_DIR, { recursive: true });
  if (!fs.existsSync(PROJECTS_FILE)) {
    fs.writeFileSync(PROJECTS_FILE, JSON.stringify({}, null, 2));
  }
}

function loadRegistry() {
  ensureRuntimeArtifacts();
  try {
    const raw = fs.readFileSync(PROJECTS_FILE, 'utf8').trim();
    if (!raw) return {};
    const parsed = JSON.parse(raw);
    return typeof parsed === 'object' && parsed ? parsed : {};
  } catch (_err) {
    const backupPath = `${PROJECTS_FILE}.corrupt.${Date.now()}`;
    try {
      fs.copyFileSync(PROJECTS_FILE, backupPath);
    } catch (_) {
      // ignore backup failures in recovery path
    }
    fs.writeFileSync(PROJECTS_FILE, JSON.stringify({}, null, 2));
    return {};
  }
}

function saveRegistry(registry) {
  ensureRuntimeArtifacts();
  fs.writeFileSync(PROJECTS_FILE, JSON.stringify(registry, null, 2));
}

function upsertProject(name, data) {
  const registry = loadRegistry();
  const now = new Date().toISOString();
  const existing = registry[name] || {};
  registry[name] = {
    ...existing,
    ...data,
    updatedAt: now,
    createdAt: existing.createdAt || now,
  };
  saveRegistry(registry);
  return registry[name];
}

function getProject(name) {
  const registry = loadRegistry();
  return registry[name] || null;
}

function removeProject(name) {
  const registry = loadRegistry();
  if (!registry[name]) return false;
  delete registry[name];
  saveRegistry(registry);
  return true;
}

function listProjects() {
  return loadRegistry();
}

module.exports = {
  RUNTIME_DIR,
  RUNTIME_LOGS_DIR,
  RUNTIME_NGINX_DIR,
  PROJECTS_FILE,
  ensureRuntimeArtifacts,
  loadRegistry,
  saveRegistry,
  upsertProject,
  getProject,
  removeProject,
  listProjects,
};
