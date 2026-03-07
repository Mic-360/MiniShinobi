const express = require('express');
const fs = require('fs');
const path = require('path');

const { listProjects, getProject, removeProject: removeProjectFromRegistry, upsertProject } = require('../services/runtimeRegistry');
const { restartProcess, stopProcess } = require('../services/processManager');
const { removeProjectRoute } = require('../services/nginxManager');
const { sanitizeProjectName } = require('../services/gitManager');
const { APPS_DIR } = require('../controllers/deploymentController');

const router = express.Router();

function toLogFn(messages) {
  return (stream, message) => {
    messages.push({ stream, message, ts: new Date().toISOString() });
  };
}

function resolveProject(projectRef) {
  const normalized = sanitizeProjectName(projectRef);
  const direct = getProject(normalized);
  if (direct) return { key: normalized, project: direct };

  const entries = Object.entries(listProjects());
  const found = entries.find(([key, value]) => {
    if (key === normalized) return true;
    const derived = sanitizeProjectName(value?.name || '');
    return derived === normalized;
  });

  if (!found) return null;
  return { key: found[0], project: found[1] };
}

function killByPid(pid) {
  if (!pid) return false;
  try {
    process.kill(Number(pid), 'SIGTERM');
    return true;
  } catch (_) {
    return false;
  }
}

router.get('/', (_req, res) => {
  const apps = Object.entries(listProjects()).map(([project, value]) => ({
    project,
    name: value.name || project,
    host: value.host || null,
    port: value.port || null,
    status: value.status || 'unknown',
    pid: value.pid || null,
    path: value.path || null,
    framework: value.framework || null,
    updatedAt: value.updatedAt || null,
  }));

  res.json({ apps });
});

router.post('/:project/restart', async (req, res) => {
  const located = resolveProject(req.params.project);
  if (!located) {
    return res.status(404).json({ error: 'Project not found in runtime registry' });
  }

  const logs = [];
  const onLog = toLogFn(logs);

  if (!located.project.startCommand) {
    return res.status(400).json({ error: 'No start command recorded for this project. Redeploy once first.' });
  }

  try {
    const proc = await restartProcess({
      name: located.key,
      path: located.project.path,
      port: Number(located.project.port),
      startCommand: located.project.startCommand,
      env: {
        PROJECT_NAME: located.key,
        PROJECT_HOST: located.project.host,
      },
    }, { onLog });

    upsertProject(located.key, {
      status: 'running',
      pid: proc.pid,
      restartedAt: new Date().toISOString(),
    });

    res.json({ ok: true, project: located.key, status: 'running', pid: proc.pid, logs });
  } catch (err) {
    res.status(500).json({ error: err.message, logs });
  }
});

router.post('/:project/stop', async (req, res) => {
  const located = resolveProject(req.params.project);
  if (!located) {
    return res.status(404).json({ error: 'Project not found in runtime registry' });
  }

  const logs = [];
  const onLog = toLogFn(logs);

  let stopped = false;
  try {
    stopped = await stopProcess(located.key, { onLog });
  } catch (_) {
    stopped = false;
  }

  if (!stopped) {
    stopped = killByPid(located.project.pid);
  }

  upsertProject(located.key, {
    status: 'stopped',
    pid: null,
    stoppedAt: new Date().toISOString(),
  });

  res.json({ ok: true, project: located.key, status: 'stopped', usedPidFallback: !stopped, logs });
});

router.delete('/:project', async (req, res) => {
  const located = resolveProject(req.params.project);
  if (!located) {
    return res.status(404).json({ error: 'Project not found in runtime registry' });
  }

  const logs = [];
  const onLog = toLogFn(logs);

  try {
    await stopProcess(located.key, { onLog });
  } catch (_) {
    // ignore
  }

  if (located.project.pid) {
    killByPid(located.project.pid);
  }

  const appPath = located.project.path || path.join(APPS_DIR, located.key);
  if (appPath && fs.existsSync(appPath)) {
    fs.rmSync(appPath, { recursive: true, force: true });
    onLog('system', `Removed app directory: ${appPath}`);
  }

  try {
    await removeProjectRoute({ projectName: located.key, onLog });
  } catch (err) {
    return res.status(500).json({ error: `Failed removing nginx config: ${err.message}`, logs });
  }

  removeProjectFromRegistry(located.key);

  res.json({ ok: true, project: located.key, removed: true, logs });
});

module.exports = router;