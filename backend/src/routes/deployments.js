const express  = require('express');
const db       = require('../dbHelpers');
const deployer = require('../deployer');
const router   = express.Router();

const requireAuth = (req, res, next) =>
  req.user ? next() : res.status(401).json({ error: 'Unauthorized' });

router.get('/project/:projectId', requireAuth, (req, res) => {
  const p = db.prepare('SELECT * FROM projects WHERE id = ? AND user_id = ?')
    .get(req.params.projectId, req.user.id);
  if (!p) return res.status(404).json({ error: 'Project not found' });
  res.json(
    db.prepare('SELECT * FROM deployments WHERE project_id = ? ORDER BY created_at DESC LIMIT 20')
      .all(p.id)
  );
});

router.post('/project/:projectId/deploy', requireAuth, (req, res) => {
  const p = db.prepare('SELECT * FROM projects WHERE id = ? AND user_id = ?')
    .get(req.params.projectId, req.user.id);
  if (!p) return res.status(404).json({ error: 'Project not found' });
  const { lastInsertRowid: deploymentId } = db.prepare(
    "INSERT INTO deployments (project_id, status) VALUES (?, 'queued')"
  ).run(p.id);
  deployer.queueDeploy(deploymentId).catch(console.error);
  res.status(202).json({ deploymentId, status: 'queued' });
});

router.get('/:id', requireAuth, (req, res) => {
  const dep = db.prepare('SELECT * FROM deployments WHERE id = ?').get(req.params.id);
  if (!dep) return res.status(404).json({ error: 'Not found' });
  res.json(dep);
});

router.get('/:id/logs', requireAuth, (req, res) => {
  const dep = db.prepare('SELECT * FROM deployments WHERE id = ?').get(req.params.id);
  if (!dep) return res.status(404).json({ error: 'Not found' });

  res.setHeader('Content-Type',  'text/event-stream');
  res.setHeader('Cache-Control', 'no-cache');
  res.setHeader('Connection',    'keep-alive');
  res.flushHeaders();

  db.prepare('SELECT * FROM logs WHERE deployment_id = ? ORDER BY id ASC')
    .all(dep.id)
    .forEach(log => {
      res.write(`data: ${JSON.stringify({
        stream: log.stream, message: log.message, ts: log.created_at,
      })}\n\n`);
    });

  if (['ready', 'failed', 'cancelled'].includes(dep.status)) {
    res.write(`data: ${JSON.stringify({ stream: 'system', message: '[END]' })}\n\n`);
    return res.end();
  }

  deployer.registerSSE(dep.id, res);
  req.on('close', () => deployer.unregisterSSE(dep.id, res));
});

router.delete('/:id', requireAuth, (req, res) => {
  const dep = db.prepare('SELECT * FROM deployments WHERE id = ?').get(req.params.id);
  if (!dep) return res.status(404).json({ error: 'Not found' });
  deployer.stopDeployment(dep.id);
  res.json({ ok: true });
});

module.exports = router;
