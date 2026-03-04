const express = require('express');
const db = require('../dbHelpers');
const router = express.Router();

const requireAuth = (req, res, next) =>
  req.user ? next() : res.status(401).json({ error: 'Unauthorized' });

router.get('/', requireAuth, (req, res) => {
  res.json(
    db.prepare('SELECT * FROM projects WHERE user_id = ? ORDER BY created_at DESC')
      .all(req.user.id)
  );
});

router.post('/', requireAuth, (req, res) => {
  const {
    name, repo_url, branch = 'main',
    install_command, build_command, output_dir, start_command, framework,
  } = req.body;
  if (!name || !repo_url)
    return res.status(400).json({ error: 'name and repo_url are required' });
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
    res.status(201).json(
      db.prepare('SELECT * FROM projects WHERE id = ?').get(result.lastInsertRowid)
    );
  } catch (e) {
    if (e.message.includes('UNIQUE'))
      return res.status(409).json({ error: 'Project name already exists' });
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
