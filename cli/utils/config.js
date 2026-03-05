const fs = require('fs');
const os = require('os');
const path = require('path');

const CONFIG_DIR = path.join(os.homedir(), '.minishinobi');
const CONFIG_PATH = path.join(CONFIG_DIR, 'config.json');

const DEFAULT_CONFIG = {
  server: 'http://localhost:3000',
};

function ensureConfigDir() {
  fs.mkdirSync(CONFIG_DIR, { recursive: true });
}

function loadConfig() {
  ensureConfigDir();
  if (!fs.existsSync(CONFIG_PATH)) {
    saveConfig(DEFAULT_CONFIG);
    return { ...DEFAULT_CONFIG };
  }

  try {
    const raw = fs.readFileSync(CONFIG_PATH, 'utf8').trim();
    if (!raw) return { ...DEFAULT_CONFIG };
    return { ...DEFAULT_CONFIG, ...JSON.parse(raw) };
  } catch (_err) {
    return { ...DEFAULT_CONFIG };
  }
}

function saveConfig(config) {
  ensureConfigDir();
  fs.writeFileSync(CONFIG_PATH, JSON.stringify(config, null, 2));
}

function setServer(url) {
  const current = loadConfig();
  const next = { ...current, server: url };
  saveConfig(next);
  return next;
}

module.exports = {
  CONFIG_DIR,
  CONFIG_PATH,
  DEFAULT_CONFIG,
  ensureConfigDir,
  loadConfig,
  saveConfig,
  setServer,
};
