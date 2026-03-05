const express = require('express');
const fs = require('fs');
const path = require('path');

const { getProject, listProjects, removeProject: removeProjectFromRegistry, upsertProject } = require('../services/runtimeRegistry');
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

function findProject(projectName) {
  const normalized = sanitizeProjectName(projectName);
  const registry = listProjects();

  if (registry[normalized]) {
    return { key: normalized, project: registry[normalized] };
  }

  const match = Object.entries(registry).find(([key, value]) => {
    if (key === normalized) return true;
    const name = sanitizeProjectName(value?.name || '');
    return name === normalized;
  });

  if (!match) return null;
  return { key: match[0], project: match[1] };
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
  const registry = listProjects();
  const apps = Object.entries(registry).map(([name, value]) => ({
    project: name,
    name: value.name || name,
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
  const located = findProject(req.params.project);
  if (!located) return res.status(404).json({ error: 'Project not found in runtime registry' });

  const messages = [];
  const onLog = toLogFn(messages);

  if (!located.project.startCommand) {
    return res.status(400).json({ error: 'No start command recorded for project; redeploy first' });
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

    res.json({ ok: true, project: located.key, status: 'running', pid: proc.pid, logs: messages });
  } catch (err) {
    res.status(500).json({ error: err.message, logs: messages });
  }
});

router.post('/:project/stop', async (req, res) => {
  const located = findProject(req.params.project);
  if (!located) return res.status(404).json({ error: 'Project not found in runtime registry' });

  const messages = [];
  const onLog = toLogFn(messages);

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

  res.json({ ok: true, project: located.key, status: 'stopped', forced: !stopped, logs: messages });
});

router.delete('/:project', async (req, res) => {
  const located = findProject(req.params.project);
  if (!located) return res.status(404).json({ error: 'Project not found in runtime registry' });

  const messages = [];
  const onLog = toLogFn(messages);

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
    return res.status(500).json({ error: `Failed to remove nginx route: ${err.message}`, logs: messages });
  }

  removeProjectFromRegistry(located.key);

  res.json({ ok: true, project: located.key, removed: true, logs: messages });
});

module.exports = router;
