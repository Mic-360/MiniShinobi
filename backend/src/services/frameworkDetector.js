const fs = require('fs');
const path = require('path');

const PRESETS = {
  next: {
    framework: 'next',
    build: 'npm install && npm run build',
    start: 'npm start',
  },
  nuxt: {
    framework: 'nuxt',
    build: 'npm install && npm run build',
    start: 'npm run start',
  },
  remix: {
    framework: 'remix',
    build: 'npm install && npm run build',
    start: 'npm run start',
  },
  astro: {
    framework: 'astro',
    build: 'npm install && npm run build',
    start: 'npx serve dist',
  },
  sveltekit: {
    framework: 'sveltekit',
    build: 'npm install && npm run build',
    start: 'npm run preview',
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

const CONFIG_FILES = {
  next: ['next.config.js', 'next.config.mjs', 'next.config.cjs', 'next.config.ts', 'next.config.mts', 'next.config.cts'],
  nuxt: ['nuxt.config.js', 'nuxt.config.mjs', 'nuxt.config.cjs', 'nuxt.config.ts', 'nuxt.config.mts', 'nuxt.config.cts'],
  remix: ['remix.config.js', 'remix.config.mjs', 'remix.config.cjs', 'remix.config.ts', 'remix.config.mts', 'remix.config.cts'],
  astro: ['astro.config.js', 'astro.config.mjs', 'astro.config.cjs', 'astro.config.ts', 'astro.config.mts', 'astro.config.cts'],
  sveltekit: ['svelte.config.js', 'svelte.config.mjs', 'svelte.config.cjs', 'svelte.config.ts', 'svelte.config.mts', 'svelte.config.cts'],
  vite: ['vite.config.js', 'vite.config.mjs', 'vite.config.cjs', 'vite.config.ts', 'vite.config.mts', 'vite.config.cts'],
};

function fileExists(projectPath, fileName) {
  return fs.existsSync(path.join(projectPath, fileName));
}

function hasAnyFile(projectPath, fileNames) {
  return fileNames.some(fileName => fileExists(projectPath, fileName));
}

function readPackageJson(projectPath) {
  const packagePath = path.join(projectPath, 'package.json');
  if (!fs.existsSync(packagePath)) return null;

  try {
    const raw = fs.readFileSync(packagePath, 'utf8');
    return JSON.parse(raw);
  } catch (_err) {
    return null;
  }
}

function hasDependency(pkg, depName) {
  if (!pkg) return false;
  return Boolean(
    pkg.dependencies?.[depName] ||
    pkg.devDependencies?.[depName] ||
    pkg.peerDependencies?.[depName]
  );
}

function detectFramework(projectPath) {
  const pkg = readPackageJson(projectPath);

  if (hasAnyFile(projectPath, CONFIG_FILES.next)) return PRESETS.next;
  if (hasAnyFile(projectPath, CONFIG_FILES.nuxt)) return PRESETS.nuxt;
  if (hasAnyFile(projectPath, CONFIG_FILES.remix)) return PRESETS.remix;
  if (hasAnyFile(projectPath, CONFIG_FILES.astro)) return PRESETS.astro;
  if (hasAnyFile(projectPath, CONFIG_FILES.sveltekit) && hasDependency(pkg, '@sveltejs/kit')) return PRESETS.sveltekit;
  if (hasAnyFile(projectPath, CONFIG_FILES.vite)) return PRESETS.vite;

  if (hasDependency(pkg, 'next')) return PRESETS.next;
  if (hasDependency(pkg, 'nuxt')) return PRESETS.nuxt;
  if (hasDependency(pkg, '@remix-run/node') || hasDependency(pkg, '@remix-run/react')) return PRESETS.remix;
  if (hasDependency(pkg, 'astro')) return PRESETS.astro;
  if (hasDependency(pkg, '@sveltejs/kit')) return PRESETS.sveltekit;
  if (pkg) return PRESETS.node;

  if (fileExists(projectPath, 'index.html')) return PRESETS.static;
  return PRESETS.node;
}

module.exports = {
  PRESETS,
  CONFIG_FILES,
  detectFramework,
};
