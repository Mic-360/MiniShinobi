const crypto = require('crypto');
const express = require('express');
const deployer = require('../deployer');
const { projectNameFromRepoUrl } = require('../services/gitManager');

const router = express.Router();

function safeCompare(a, b) {
  const aBuf = Buffer.from(a || '', 'utf8');
  const bBuf = Buffer.from(b || '', 'utf8');
  if (aBuf.length !== bBuf.length) return false;
  return crypto.timingSafeEqual(aBuf, bBuf);
}

function validateSignature(req) {
  const secret = process.env.WEBHOOK_SECRET;
  if (!secret) return false;

  const rawBody = req.rawBody || Buffer.from(JSON.stringify(req.body || {}));
  const provided = req.headers['x-hub-signature-256'] || req.headers['x-minishinobi-signature'];
  if (!provided) return false;

  const digest = `sha256=${crypto.createHmac('sha256', secret).update(rawBody).digest('hex')}`;
  return safeCompare(String(provided), digest);
}

function validateCliSecret(req) {
  const secret = process.env.WEBHOOK_SECRET;
  if (!secret) return true;

  const provided = req.headers['x-minishinobi-secret'];
  if (!provided) return false;
  return safeCompare(String(provided), secret);
}

router.post('/', async (req, res) => {
  try {
    const webhookRepoUrl = req.body?.repository?.clone_url;
    const cliRepoUrl = req.body?.repo;

    if (webhookRepoUrl) {
      if (!validateSignature(req)) {
        return res.status(401).json({ error: 'Invalid webhook signature' });
      }

      const ref = req.body?.ref || 'refs/heads/main';
      const deploymentId = await deployer.queueWebhookDeploy({ repoUrl: webhookRepoUrl, ref });
      return res.status(202).json({
        deploymentId,
        project: projectNameFromRepoUrl(webhookRepoUrl),
        status: 'queued',
        mode: 'webhook',
      });
    }

    if (cliRepoUrl) {
      if (!validateCliSecret(req)) {
        return res.status(401).json({ error: 'Invalid CLI secret. Provide x-minishinobi-secret header.' });
      }

      const ref = req.body?.ref || 'refs/heads/main';
      const deploymentId = await deployer.queueWebhookDeploy({ repoUrl: cliRepoUrl, ref });
      return res.status(202).json({
        deploymentId,
        project: projectNameFromRepoUrl(cliRepoUrl),
        status: 'queued',
        mode: 'cli',
      });
    }

    return res.status(400).json({
      error: 'Missing repository URL. Provide repository.clone_url (webhook) or repo (CLI).',
    });
  } catch (err) {
    return res.status(500).json({ error: err.message });
  }
});

module.exports = router;
