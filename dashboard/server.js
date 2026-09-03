const express = require('express');
const http = require('http');
const { WebSocketServer } = require('ws');
const path = require('path');
const fs = require('fs');

const { FRONTEND_DIST_DIR, REPO_ROOT, TRACE_VIEWER_DIR } = require('./lib/paths');
const RunManager = require('./lib/runManager');
const createApiRouter = require('./routes/api');
const filesRouter = require('./routes/files');
const { regenerateProjectsManifest } = require('./lib/generateProjectsManifest');
const { AutoUpdater } = require('./lib/autoUpdater');

/**
 * Minimal KEY=VALUE .env loader for RCA_* config (RCA_PROVIDER etc.), so
 * those live in the same root .env as everything else. Doesn't overwrite
 * vars already set in the shell, and skips adding a `dotenv` dependency to
 * this package just for a handful of optional settings.
 */
function loadRootEnv() {
  const envPath = path.join(REPO_ROOT, '.env');
  if (!fs.existsSync(envPath)) return;
  for (const line of fs.readFileSync(envPath, 'utf-8').split('\n')) {
    const match = line.match(/^\s*([\w.-]+)\s*=\s*(.*)\s*$/);
    if (!match) continue;
    const [, key, value] = match;
    if (!(key in process.env)) process.env[key] = value.replace(/^["']|["']$/g, '');
  }
}
loadRootEnv();

const PORT = Number(process.env.DASHBOARD_PORT) || 4300;
const HOST = '127.0.0.1'; // Localhost-only: this server can spawn arbitrary Playwright
// test runs on request, so it must never be exposed on the network by default.

const app = express();
app.use(express.json());

const server = http.createServer(app);
const wss = new WebSocketServer({ server, path: '/ws' });

function broadcast(message) {
  const data = JSON.stringify(message);
  for (const client of wss.clients) {
    if (client.readyState === client.OPEN) client.send(data);
  }
}

const runManager = new RunManager({ port: PORT, broadcast });

// Adopt any spot fix that was applied before the applied-fix registry existed,
// so an already-modified working tree shows up in the UI instead of sitting
// there unnoticed until someone commits it.
try {
  const adopted = runManager.backfillAppliedSpotFixes();
  if (adopted > 0) {
    console.log(`[dashboard] tracking ${adopted} previously-applied spot fix(es); see the banner to review or undo`);
  }
} catch (err) {
  console.error('[dashboard] could not backfill applied spot fixes:', err.message);
}

// Rebuild the SQLite history index (lib/db.js) from whatever run files are
// on disk. Idempotent and cheap, and the only way the index recovers on a
// fresh checkout, after dashboard.db is deleted, or after a version of the
// dashboard that predates this index wrote run files it never knew about.
try {
  const { backfillFromDisk } = require('./lib/db');
  const indexed = backfillFromDisk();
  console.log(`[dashboard] history index ready (${indexed} run${indexed === 1 ? '' : 's'})`);
} catch (err) {
  console.error('[dashboard] could not build the history index:', err.message);
}

// Keep dashboard/config/projects.json in sync with playwright.config.ts on
// every boot. Never let a sync failure block the server from starting.
try {
  regenerateProjectsManifest();
} catch (err) {
  console.error('[dashboard] failed to sync projects.json on startup:', err.message);
}

const autoUpdater = new AutoUpdater({
  broadcast,
  isRunActive: () => runManager.activeJobs.size > 0,
});
if (process.env.DASHBOARD_AUTO_UPDATE !== 'false') {
  autoUpdater.start();
}
if (process.env.DASHBOARD_WATCH_FRONTEND !== 'false') {
  autoUpdater.startLocalFrontendWatch();
}

// A wedged run keeps every process alive and its status 'running' while
// emitting nothing, so nothing else notices it. Poll for that silence.
const STALL_CHECK_INTERVAL_MS = 60 * 1000;
const stallTimer = setInterval(() => {
  try {
    runManager.checkStalledRuns();
  } catch (err) {
    console.error('[dashboard] stall check failed:', err.message);
  }
}, STALL_CHECK_INTERVAL_MS);
stallTimer.unref();

wss.on('connection', (socket) => {
  // Push a snapshot of recent runs so a freshly opened tab isn't blank mid-run.
  socket.send(JSON.stringify({ type: 'snapshot', runs: runManager.listRuns(20) }));
  // Applied spot fixes are edits sitting in the working tree, so a newly
  // opened tab must learn about them without waiting for the next change.
  socket.send(JSON.stringify({ type: 'spot-fixes-applied', fixes: runManager.listAppliedSpotFixes() }));
});

app.use('/api/files', filesRouter);
app.use('/api', createApiRouter(runManager, autoUpdater));

/**
 * Self-hosted Playwright trace viewer.
 *
 * The obvious way to view a trace is to link to
 * https://trace.playwright.dev/?trace=<url to our /api/files/trace>, but that
 * makes a page on a *public* origin fetch a *private* one (127.0.0.1). Chrome
 * gates that behind Private Network Access, which needs an interactive
 * permission grant from the user — no combination of CORS or
 * `Access-Control-Allow-Private-Network` response headers can satisfy it from
 * our side, so the viewer just reports "grant permission for Local Network
 * Access" and gives up.
 *
 * Serving Playwright's own viewer bundle from this origin removes the
 * cross-origin hop altogether: the viewer page, its service worker, and the
 * trace zip are all http://127.0.0.1:<port>, so PNA never applies.
 *
 * The viewer registers `sw.bundle.js` and derives every internal route from
 * `self.registration.scope`, so mounting it under a sub-path works as-is.
 * Service-Worker-Allowed is set so the worker may claim this whole mount.
 */
if (TRACE_VIEWER_DIR && fs.existsSync(TRACE_VIEWER_DIR)) {
  app.use(
    '/trace-viewer',
    (req, res, next) => {
      res.setHeader('Service-Worker-Allowed', '/trace-viewer/');
      next();
    },
    express.static(TRACE_VIEWER_DIR)
  );
} else {
  console.error('[dashboard] playwright-core trace viewer assets not found; trace links will not work');
}

if (fs.existsSync(FRONTEND_DIST_DIR)) {
  app.use(express.static(FRONTEND_DIST_DIR));
  app.get('*', (req, res) => {
    res.sendFile(path.join(FRONTEND_DIST_DIR, 'index.html'));
  });
} else {
  app.get('*', (req, res) => {
    res
      .status(503)
      .send('Dashboard frontend is not built yet. Run "npm run dashboard:build" first.');
  });
}

server.listen(PORT, HOST, () => {
  console.log(`Playwright dashboard running at http://${HOST}:${PORT}`);
});

// nodemon restarts this process on every edit under lib/ and routes/, so
// without this a few edits during an active run would leave a trail of
// orphaned sleep-inhibitor helpers pinning the machine awake indefinitely.
for (const signal of ['SIGINT', 'SIGTERM', 'SIGBREAK']) {
  process.on(signal, () => {
    runManager.keepAwake.releaseAll();
    process.exit(0);
  });
}
process.on('exit', () => runManager.keepAwake.releaseAll());
