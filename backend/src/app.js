require('dotenv').config({ path: require('path').join(__dirname, '../.env') });

const express = require('express');
const session = require('express-session');
const FileStore = require('session-file-store')(session);
const passport = require('passport');
const GitHubStrategy = require('passport-github2').Strategy;
const cors = require('cors');
const helmet = require('helmet');
const morgan = require('morgan');
const path = require('path');
const fs = require('fs');

const { initDb } = require('./db');
const { init: initHelpers, prepare: dbPrepare } = require('./dbHelpers');
const { ensureRuntimeArtifacts } = require('./services/runtimeRegistry');
const { ensureSitesDirectory } = require('./services/nginxManager');
const { APPS_DIR } = require('./controllers/deploymentController');

const app = express();

app.use(morgan('dev'));
app.use(helmet({ contentSecurityPolicy: false }));
app.use(cors({ origin: process.env.DASHBOARD_URL, credentials: true }));
app.use(express.json({
  verify: (req, _res, buf) => {
    req.rawBody = Buffer.from(buf);
  },
}));
app.use(express.urlencoded({ extended: true }));

// Session — session-file-store, pure JavaScript, no native deps
const SESSION_DIR = path.join(path.dirname(process.env.DB_PATH), 'sessions');
fs.mkdirSync(SESSION_DIR, { recursive: true });

app.set('trust proxy', true);

app.use(session({
  store: new FileStore({
    path: SESSION_DIR,
    ttl: 7 * 24 * 60 * 60,
    retries: 1,
    logFn: () => {},
  }),
  secret: process.env.SESSION_SECRET,
  resave: false,
  saveUninitialized: false,
  cookie: {
    secure: process.env.NODE_ENV === 'production',
    httpOnly: true,
    sameSite: 'lax',
    maxAge: 7 * 24 * 60 * 60 * 1000,
  },
}));

// Passport / GitHub OAuth
passport.use(new GitHubStrategy(
  {
    clientID: process.env.GITHUB_CLIENT_ID,
    clientSecret: process.env.GITHUB_CLIENT_SECRET,
    callbackURL: process.env.GITHUB_CALLBACK_URL,
  },
  (accessToken, _rt, profile, done) => {
    try {
      const existing = dbPrepare('SELECT * FROM users WHERE github_id = ?')
        .get(String(profile.id));
      if (existing) {
        dbPrepare('UPDATE users SET username=?, avatar_url=?, access_token=? WHERE github_id=?')
          .run(profile.username, profile.photos?.[0]?.value, accessToken, String(profile.id));
        return done(null, existing);
      }
      const { lastInsertRowid } = dbPrepare(
        'INSERT INTO users (github_id, username, avatar_url, access_token) VALUES (?, ?, ?, ?)'
      ).run(String(profile.id), profile.username, profile.photos?.[0]?.value, accessToken);
      done(null, dbPrepare('SELECT * FROM users WHERE id = ?').get(lastInsertRowid));
    } catch (e) {
      done(e);
    }
  }
));

passport.serializeUser((user, done) => done(null, user.id));
passport.deserializeUser((id, done) => {
  try {
    done(null, dbPrepare('SELECT * FROM users WHERE id = ?').get(id) || false);
  } catch (e) {
    done(e);
  }
});

app.use(passport.initialize());
app.use(passport.session());

// Routes
app.use('/deploy', require('./routes/deploy'));
app.use('/auth', require('./routes/auth'));
app.use('/api/projects', require('./routes/projects'));
app.use('/api/deployments', require('./routes/deployments'));
app.use('/apps', require('./routes/apps'));
app.use('/logs', require('./routes/logs'));
app.get('/health', (_req, res) => res.json({ ok: true, ts: Date.now() }));

// Serve built React frontend
const DIST = path.join(__dirname, '../../frontend/dist');
if (fs.existsSync(DIST)) {
  app.use(express.static(DIST));

  // SPA fallback (Express 4 & 5 safe)
  app.use((_req, res) => {
    res.sendFile(path.join(DIST, 'index.html'));
  });
}

app.use((err, _req, res, _next) => {
  console.error(err);
  res.status(500).json({ error: err.message });
});

// Boot sequence: DB and runtime dirs must be ready before we listen
initDb()
  .then(() => initHelpers())
  .then(() => {
    fs.mkdirSync(APPS_DIR, { recursive: true });
    ensureRuntimeArtifacts();
    ensureSitesDirectory();

    const PORT = parseInt(process.env.PORT, 10) || 3000;
    app.listen(PORT, '127.0.0.1', () =>
      console.log(`MiniShinobi backend running on http://127.0.0.1:${PORT}`)
    );
  })
  .catch(err => {
    console.error('Startup failed:', err);
    process.exit(1);
  });

