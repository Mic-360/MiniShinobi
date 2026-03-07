const fs = require('fs');
const path = require('path');
const { spawn } = require('child_process');

function sanitizeProjectName(name) {
  return String(name || '')
    .toLowerCase()
    .replace(/[^a-z0-9]/g, '-')
    .replace(/-+/g, '-')
    .replace(/^-|-$/g, '') || 'app';
}

function projectNameFromRepoUrl(repoUrl) {
  const clean = String(repoUrl || '').replace(/\.git$/i, '');
  const lastPart = clean.split('/').filter(Boolean).pop() || 'app';
  return sanitizeProjectName(lastPart);
}

function runGit(args, cwd, onLog = () => { }) {
  return new Promise((resolve, reject) => {
    onLog('system', `$ git ${args.join(' ')}`);
    const proc = spawn('git', args, { cwd, stdio: ['ignore', 'pipe', 'pipe'] });
    let outBuf = '';
    let errBuf = '';

    proc.stdout.on('data', chunk => {
      outBuf += chunk.toString();
      const lines = outBuf.split('\n');
      outBuf = lines.pop() || '';
      lines.forEach(line => onLog('stdout', line));
    });

    proc.stderr.on('data', chunk => {
      errBuf += chunk.toString();
      const lines = errBuf.split('\n');
      errBuf = lines.pop() || '';
      lines.forEach(line => onLog('stderr', line));
    });

    proc.on('error', reject);
    proc.on('close', code => {
      if (outBuf) onLog('stdout', outBuf);
      if (errBuf) onLog('stderr', errBuf);
      if (code === 0) return resolve();
      reject(new Error(`git ${args.join(' ')} failed with code ${code}`));
    });
  });
}

async function ensureRepo({ appsDir, projectName, repoUrl, branch, onLog }) {
  const projectPath = path.join(appsDir, projectName);
  fs.mkdirSync(appsDir, { recursive: true });

  if (!fs.existsSync(path.join(projectPath, '.git'))) {
    onLog('system', `Cloning ${repoUrl} into ${projectPath}`);
    await runGit(['clone', '--branch', branch, '--single-branch', repoUrl, projectPath], appsDir, onLog);
  } else {
    onLog('system', `Updating existing repository at ${projectPath}`);
    await runGit(['fetch', '--all', '--prune'], projectPath, onLog);
    await runGit(['reset', '--hard', `origin/${branch}`], projectPath, onLog);
    await runGit(['clean', '-fd'], projectPath, onLog);
    await runGit(['checkout', branch], projectPath, onLog);
  }

  return projectPath;
}

async function getCommitInfo(projectPath) {
  const sha = await readGitOutput(['rev-parse', '--short', 'HEAD'], projectPath);
  const msg = await readGitOutput(['log', '-1', '--pretty=%s'], projectPath);
  return { sha, msg };
}

function readGitOutput(args, cwd) {
  return new Promise((resolve, reject) => {
    const proc = spawn('git', args, { cwd, stdio: ['ignore', 'pipe', 'pipe'] });
    let out = '';
    let err = '';
    proc.stdout.on('data', chunk => (out += chunk.toString()));
    proc.stderr.on('data', chunk => (err += chunk.toString()));
    proc.on('error', reject);
    proc.on('close', code => {
      if (code === 0) return resolve(out.trim());
      reject(new Error(err.trim() || `git ${args.join(' ')} failed with code ${code}`));
    });
  });
}

module.exports = {
  sanitizeProjectName,
  projectNameFromRepoUrl,
  ensureRepo,
  getCommitInfo,
};
