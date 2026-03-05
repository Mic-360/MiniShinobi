const express = require('express');
const db = require('../dbHelpers');
const deployer = require('../deployer');
const { sanitizeProjectName } = require('../services/gitManager');

const router = express.Router();

function resolveProject(projectRef) {
  const normalized = sanitizeProjectName(projectRef);

  let project = db.prepare('SELECT * FROM projects WHERE slug = ?').get(normalized);
  if (project) return project;

  project = db.prepare('SELECT * FROM projects WHERE LOWER(name) = ?').get(String(projectRef || '').toLowerCase());
  return project || null;
}

router.get('/:project', (req, res) => {
  const project = resolveProject(req.params.project);
  if (!project) return res.status(404).json({ error: 'Project not found' });

  const requestedDeploymentId = Number(req.query.deploymentId);
  const deployment = Number.isFinite(requestedDeploymentId)
    ? db.prepare('SELECT * FROM deployments WHERE id = ? AND project_id = ?').get(requestedDeploymentId, project.id)
    : db.prepare('SELECT * FROM deployments WHERE project_id = ? ORDER BY created_at DESC LIMIT 1').get(project.id);

  if (!deployment) return res.status(404).json({ error: 'No deployments found for project' });

  res.setHeader('Content-Type', 'text/event-stream');
  res.setHeader('Cache-Control', 'no-cache');
  res.setHeader('Connection', 'keep-alive');
  res.flushHeaders();

  db.prepare('SELECT * FROM logs WHERE deployment_id = ? ORDER BY id ASC')
    .all(deployment.id)
    .forEach(log => {
      res.write(`data: ${JSON.stringify({
        stream: log.stream,
        message: log.message,
        ts: log.created_at,
      })}\n\n`);
    });

  if (['ready', 'failed', 'cancelled'].includes(deployment.status)) {
    res.write(`data: ${JSON.stringify({ stream: 'system', message: '[END]' })}\n\n`);
    return res.end();
  }

  deployer.registerSSE(deployment.id, res);
  req.on('close', () => deployer.unregisterSSE(deployment.id, res));
});

module.exports = router;