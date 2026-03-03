const express  = require('express');
const passport = require('passport');
const router   = express.Router();
require('dotenv').config({ path: require('path').join(__dirname, '../../.env') });

router.get('/github',
  passport.authenticate('github', { scope: ['read:user'] })
);

router.get('/github/callback',
  passport.authenticate('github', { failureRedirect: '/?error=auth_failed' }),
  (req, res) => res.redirect(process.env.DASHBOARD_URL + '/dashboard')
);

router.get('/me', (req, res) => {
  if (!req.user) return res.status(401).json({ error: 'Not authenticated' });
  res.json({ id: req.user.id, username: req.user.username, avatar_url: req.user.avatar_url });
});

router.post('/logout', (req, res, next) => {
  req.logout(err => {
    if (err) return next(err);
    res.json({ ok: true });
  });
});

module.exports = router;
