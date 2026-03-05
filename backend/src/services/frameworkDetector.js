const fs = require('fs');
const path = require('path');

const PRESETS = {
  next: {
    framework: 'next',
    build: 'npm install && npm run build',
    start: 'npm start',
  },
  vite: {
    framework: 'vite',
    build: 'npm install && npm run build',
    start: 'npx serve dist',
  },
  node: {
    framework: 'node',
    build: 'npm install',
    start: 'npm start',
  },
  static: {
    framework: 'static',
    build: null,
    start: 'npx serve .',
  },
};

function fileExists(projectPath, fileName) {
  return fs.existsSync(path.join(projectPath, fileName));
}

function detectFramework(projectPath) {
  if (fileExists(projectPath, 'next.config.js')) return PRESETS.next;
  if (fileExists(projectPath, 'vite.config.js')) return PRESETS.vite;
  if (fileExists(projectPath, 'package.json')) return PRESETS.node;
  if (fileExists(projectPath, 'index.html') && !fileExists(projectPath, 'package.json')) {
    return PRESETS.static;
  }
  return PRESETS.node;
}

module.exports = {
  PRESETS,
  detectFramework,
};
