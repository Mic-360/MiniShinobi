const db = require('./dbHelpers');
const deploymentController = require('./controllers/deploymentController');

const sseClients = new Map();
const deploymentQueue = [];
let activeDeploymentId = null;

function registerSSE(id, res) {
  if (!sseClients.has(id)) sseClients.set(id, new Set());
  sseClients.get(id).add(res);
}

function unregisterSSE(id, res) {
  sseClients.get(id)?.delete(res);
}

function broadcastLog(deploymentId, stream, message) {
  const clean = String(message || '').replace(/\x1b\[[0-9;]*m/g, '').replace(/\r/g, '');
  if (!clean.trim()) return;

  db.prepare('INSERT INTO logs (deployment_id, stream, message) VALUES (?, ?, ?)')
    .run(deploymentId, stream, clean);

  const payload = JSON.stringify({
    stream,
    message: clean,
    ts: new Date().toISOString(),
  });

  (sseClients.get(deploymentId) || new Set()).forEach(res => {
    try {
      res.write(`data: ${payload}\n\n`);
    } catch (_) {
      // ignore dead streams
    }
  });
}

function enqueueDeployment(deploymentId) {
  if (!deploymentQueue.includes(deploymentId)) {
    deploymentQueue.push(deploymentId);
  }
  broadcastLog(deploymentId, 'system', 'Deployment queued');
  void drainQueue();
}

async function queueDeploy(deploymentId) {
  enqueueDeployment(deploymentId);
}

async function queueWebhookDeploy({ repoUrl, ref }) {
  const { deploymentId } = await deploymentController.createWebhookDeployment({ repoUrl, ref });
  enqueueDeployment(deploymentId);
  return deploymentId;
}

async function drainQueue() {
  if (activeDeploymentId !== null) return;
  const next = deploymentQueue.shift();
  if (!next) return;

  activeDeploymentId = next;

  if (deploymentQueue.length > 0) {
    broadcastLog(next, 'system', `Queue depth: ${deploymentQueue.length + 1}`);
  }

  try {
    await deploymentController.executeDeployment(next, broadcastLog);
  } catch (err) {
    broadcastLog(next, 'stderr', `Unhandled deployment error: ${err.message}`);
  } finally {
    activeDeploymentId = null;
    if (deploymentQueue.length > 0) {
      void drainQueue();
    }
  }
}

function stopDeployment(deploymentId) {
  const idx = deploymentQueue.indexOf(deploymentId);
  if (idx !== -1) {
    deploymentQueue.splice(idx, 1);
    db.prepare("UPDATE deployments SET status='cancelled', finished_at=? WHERE id=?")
      .run(new Date().toISOString(), deploymentId);
    broadcastLog(deploymentId, 'system', 'Cancelled queued deployment');
    broadcastLog(deploymentId, 'system', '[END]');
    return;
  }

  if (activeDeploymentId === deploymentId) {
    deploymentController.cancelDeployment(deploymentId, broadcastLog).catch(err => {
      broadcastLog(deploymentId, 'stderr', `Failed to cancel deployment: ${err.message}`);
    });
    return;
  }

  deploymentController.cancelDeployment(deploymentId, broadcastLog).catch(err => {
    broadcastLog(deploymentId, 'stderr', `Failed to stop deployment: ${err.message}`);
  });
}

module.exports = {
  queueDeploy,
  queueWebhookDeploy,
  stopDeployment,
  registerSSE,
  unregisterSSE,
};
