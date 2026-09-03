const crypto = require('crypto');
const express = require('express');
const fs = require('fs');
const path = require('path');

const { FRONTEND_DIST_DIR, APP_ROOT } = require('./lib/paths');
const { hasAnyAccount } = require('./lib/adminAccount');
const authRouter = require('./routes/auth');
const clientsRouter = require('./routes/clients');
const accountsRouter = require('./routes/accounts');
const clientAuthRouter = require('./routes/clientAuth');
const clientViewRouter = require('./routes/clientView');

const ENV_PATH = path.join(APP_ROOT, '.env');

/**
 * Minimal .env loader, same approach dashboard/server.js already uses for
 * the same reason: a handful of optional settings don't justify adding the
 * `dotenv` package.
 */
function loadEnv() {
  if (!fs.existsSync(ENV_PATH)) return;
  for (const line of fs.readFileSync(ENV_PATH, 'utf-8').split('\n')) {
    const match = line.match(/^\s*([\w.-]+)\s*=\s*(.*)\s*$/);
    if (!match) continue;
    const [, key, value] = match;
    if (!(key in process.env)) process.env[key] = value.replace(/^["']|["']$/g, '');
  }
}
loadEnv();

/**
 * One less manual setup step: a session-signing secret is required, but
 * there's no reason to make a first-time admin go generate one by hand
 * before they can even reach the "create account" form. Generated once and
 * persisted so sessions survive a restart.
 */
function ensureSessionSecret() {
  if (process.env.SESSION_SECRET) return;
  const secret = crypto.randomBytes(32).toString('hex');
  process.env.SESSION_SECRET = secret;
  fs.appendFileSync(ENV_PATH, `${fs.existsSync(ENV_PATH) ? '\n' : ''}SESSION_SECRET=${secret}\n`, 'utf-8');
  console.log('Generated a new SESSION_SECRET and saved it to admin-dashboard/.env');
}
ensureSessionSecret();

const PORT = Number(process.env.ADMIN_DASHBOARD_PORT) || 4400;
// Localhost-only: this app reads other repos' local filesystem paths on
// request (registered by an already-authenticated admin), so — same rule as
// dashboard/server.js — it must never be exposed on the network by default.
const HOST = '127.0.0.1';

const app = express();
app.use(express.json());

// All four routers share the literal /api prefix, so none of them carry an
// external guard here — `app.use('/api', someGuard, router)` would run
// someGuard for *every* /api/* request that reaches this mount point,
// before Express ever checks whether one of that router's own routes
// actually matches, incorrectly rejecting requests meant for a different
// router entirely. Each router applies its own guard per-route instead —
// see routes/clients.js's header comment for the full explanation.
app.use('/api', authRouter);
app.use('/api', clientAuthRouter);
app.use('/api', clientsRouter);
app.use('/api', accountsRouter);
app.use('/api', clientViewRouter);

if (fs.existsSync(FRONTEND_DIST_DIR)) {
  app.use(express.static(FRONTEND_DIST_DIR));
  app.get('*', (req, res) => {
    res.sendFile(path.join(FRONTEND_DIST_DIR, 'index.html'));
  });
} else {
  app.get('*', (req, res) => {
    res.status(503).send('Admin dashboard frontend is not built yet. Run "npm run build" inside admin-dashboard/frontend first.');
  });
}

const server = app.listen(PORT, HOST, () => {
  console.log(`Admin dashboard running at http://${HOST}:${PORT}`);
  if (!hasAnyAccount()) {
    console.log('No admin account yet — open the app and use "Sign up" on the login page to create one.');
  }
});
// Onboarding a client clones its repo and npm-installs/builds a full
// dashboard instance for it before responding (see lib/dashboardProvisioner
// and POST /clients) — that can take several minutes, well past Node's
// default 5-minute requestTimeout. Disabled here so a slow-but-successful
// onboarding is never cut off mid-request.
server.requestTimeout = 0;
server.headersTimeout = 0;
