const crypto = require('crypto');
const express = require('express');
const deployer = require('../deployer');

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

router.post('/', async (req, res) => {
  try {
    if (!validateSignature(req)) {
      return res.status(401).json({ error: 'Invalid webhook signature' });
    }

    const repoUrl = req.body?.repository?.clone_url;
    const ref = req.body?.ref || 'refs/heads/main';

    if (!repoUrl) {
      return res.status(400).json({ error: 'repository.clone_url is required' });
    }

    const deploymentId = await deployer.queueWebhookDeploy({ repoUrl, ref });
    res.status(202).json({ deploymentId, status: 'queued' });
  } catch (err) {
    res.status(500).json({ error: err.message });
  }
});

module.exports = router;
