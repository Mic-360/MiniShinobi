const express = require('express');
const axios = require('axios');
const db = require('../dbHelpers');
const router = express.Router();

const requireAuth = (req, res, next) =>
  req.user ? next() : res.status(401).json({ error: 'Unauthorized' });

function githubClient(token) {
  return axios.create({
    baseURL: 'https://api.github.com',
    headers: {
      Authorization: `token ${token}`,
      Accept: 'application/vnd.github+json',
      'X-GitHub-Api-Version': '2022-11-28',
      'User-Agent': 'MiniShinobi',
    },
    timeout: 20000,
  });
}

function parseGitHubRepo(repoUrl) {
  if (!repoUrl) return null;

  const httpsMatch = String(repoUrl).match(/^https?:\/\/github\.com\/([^/]+)\/([^/]+?)(?:\.git)?$/i);
  if (httpsMatch) {
    return { owner: httpsMatch[1], repo: httpsMatch[2] };
  }

  const sshMatch = String(repoUrl).match(/^git@github\.com:([^/]+)\/([^/]+?)(?:\.git)?$/i);
  if (sshMatch) {
    return { owner: sshMatch[1], repo: sshMatch[2] };
  }

  return null;
}

async function fetchUserRepos(token) {
  const client = githubClient(token);
  const repos = [];
  let page = 1;

  while (true) {
    const { data } = await client.get('/user/repos', {
      params: {
        visibility: 'all',
        affiliation: 'owner,collaborator,organization_member',
        sort: 'updated',
        per_page: 100,
        page,
      },
    });

    repos.push(...data);
    if (!Array.isArray(data) || data.length < 100) break;
    page += 1;
  }

  return repos;
}

async function ensureRepoWebhook({ token, repoUrl }) {
  const parsed = parseGitHubRepo(repoUrl);
  if (!parsed) {
    return { ok: false, message: 'Repository URL is not a GitHub repository URL. Skipping webhook setup.' };
  }

  const webhookUrl = process.env.WEBHOOK_TARGET_URL || `${String(process.env.DASHBOARD_URL || '').replace(/\/$/, '')}/deploy`;
  if (!webhookUrl || !webhookUrl.startsWith('http')) {
    return { ok: false, message: 'WEBHOOK_TARGET_URL (or DASHBOARD_URL) is not configured. Skipping webhook setup.' };
  }

  const client = githubClient(token);
  const { owner, repo } = parsed;

  const hooksResp = await client.get(`/repos/${owner}/${repo}/hooks`);
  const existing = hooksResp.data.find(h => h?.config?.url === webhookUrl);

  const payload = {
    active: true,
    events: ['push'],
    config: {
      url: webhookUrl,
      content_type: 'json',
      insecure_ssl: '0',
    },
  };

  if (process.env.WEBHOOK_SECRET) {
    payload.config.secret = process.env.WEBHOOK_SECRET;
  }

  if (existing) {
    await client.patch(`/repos/${owner}/${repo}/hooks/${existing.id}`, payload);
    return { ok: true, message: 'Webhook already existed and was updated.', webhookUrl };
  }

  await client.post(`/repos/${owner}/${repo}/hooks`, payload);
  return { ok: true, message: 'Webhook created.', webhookUrl };
}

router.get('/', requireAuth, (req, res) => {
  res.json(
    db.prepare('SELECT * FROM projects WHERE user_id = ? ORDER BY created_at DESC')
      .all(req.user.id)
  );
});

router.get('/repos', requireAuth, async (req, res) => {
  try {
    const token = req.user?.access_token;
    if (!token) {
      return res.status(400).json({ error: 'GitHub access token missing. Please re-login.' });
    }

    const repos = await fetchUserRepos(token);
    const normalized = repos.map(r => ({
      id: r.id,
      name: r.name,
      full_name: r.full_name,
      clone_url: r.clone_url,
      ssh_url: r.ssh_url,
      private: Boolean(r.private),
      default_branch: r.default_branch || 'main',
      html_url: r.html_url,
      can_admin_hook: Boolean(r.permissions?.admin),
    }));

    res.json({ repositories: normalized });
  } catch (err) {
    const status = err.response?.status || 500;
    const message = err.response?.data?.message || err.message;
    res.status(status).json({ error: `Failed to fetch repositories: ${message}` });
  }
});

router.post('/', requireAuth, async (req, res) => {
  const {
    name, repo_url, branch = 'main',
    install_command, build_command, output_dir, start_command, framework,
  } = req.body;

  if (!name || !repo_url) {
    return res.status(400).json({ error: 'name and repo_url are required' });
  }

  const slug = name.toLowerCase().replace(/[^a-z0-9]/g, '-').replace(/-+/g, '-').replace(/^-|-$/g, '');

  try {
    const result = db.prepare(
      `INSERT INTO projects
        (user_id, name, slug, repo_url, branch, install_command, build_command, output_dir, start_command, framework)
       VALUES (?, ?, ?, ?, ?, ?, ?, ?, ?, ?)`
    ).run(
      req.user.id, name, slug, repo_url, branch,
      install_command || 'npm install',
      build_command || 'npm run build',
      output_dir || null,
      start_command || null,
      framework || null
    );

    const createdProject = db.prepare('SELECT * FROM projects WHERE id = ?').get(result.lastInsertRowid);

    let webhook = { ok: false, message: 'Webhook setup not attempted.' };
    try {
      webhook = await ensureRepoWebhook({
        token: req.user?.access_token,
        repoUrl: repo_url,
      });
    } catch (err) {
      webhook = {
        ok: false,
        message: err.response?.data?.message || err.message,
      };
    }

    res.status(201).json({
      ...createdProject,
      webhook,
    });
  } catch (e) {
    if (e.message.includes('UNIQUE')) {
      return res.status(409).json({ error: 'Project name already exists' });
    }
    res.status(500).json({ error: e.message });
  }
});

router.delete('/:id', requireAuth, (req, res) => {
  const p = db.prepare('SELECT * FROM projects WHERE id = ? AND user_id = ?')
    .get(req.params.id, req.user.id);
  if (!p) return res.status(404).json({ error: 'Not found' });
  db.prepare('DELETE FROM projects WHERE id = ?').run(p.id);
  res.json({ ok: true });
});

module.exports = router;
