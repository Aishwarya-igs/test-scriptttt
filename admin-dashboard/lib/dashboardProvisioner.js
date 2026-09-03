/**
 * Gives a newly-onboarded client the same live, "Start Run"-capable
 * Automation Dashboard the iWantTFC demo has — not just admin-dashboard's
 * read-only stats.
 *
 * dashboard/'s own REPO_ROOT (dashboard/lib/paths.js) is derived purely from
 * where the dashboard/ folder physically sits (one directory up), with no
 * env var or config to point it elsewhere. So the only way to give a client
 * a real, independently runnable dashboard is to actually copy the app's
 * source into that client's own cloned repo and run it there, on its own
 * already-allocated port (client.dashboardUrl) — same posture dashboardUrl's
 * per-client port allocation was already built for.
 *
 * Source-only copy: node_modules/, data/, and built frontend/dist/ are never
 * copied — each client gets a fresh install and a fresh (empty, until they
 * add real tests) dashboard/data history of its own.
 */
const fs = require('fs');
const path = require('path');
const http = require('http');
const { execFile } = require('child_process');
const { promisify } = require('util');

const { APP_ROOT } = require('./paths');
const { listAccountSummaries } = require('./adminAccount');

const execFileAsync = promisify(execFile);

// The master copy this app itself lives next to — a sibling folder in the
// same repo, never modified, only read from.
const DASHBOARD_SOURCE_DIR = path.resolve(APP_ROOT, '..', 'dashboard');

// The main iWantTFC repo's own .env, one level up from admin-dashboard —
// where RCA_PROVIDER/RCA_API_KEY and SENDGRID_API_KEY are actually
// configured. A client's cloned repo never has this file (it's not meant to
// be copied into arbitrary third-party repos), so without reading it here,
// every client dashboard boots with RCA_PROVIDER defaulting to 'heuristic'
// (free rule-based RCA still works, but AI-only features like Generate
// Summary fail) and with no way to send failure-notification emails at all.
// Sharing the one configured key/account across every client dashboard is
// the pragmatic choice at this app's scale (a demo/testing tool, not a
// multi-tenant SaaS needing per-tenant key isolation).
const ROOT_ENV_PATH = path.resolve(APP_ROOT, '..', '.env');
const SHARED_ENV_KEYS = [
  'RCA_PROVIDER',
  'RCA_API_KEY',
  'RCA_API_FORMAT',
  'RCA_API_BASE_URL',
  'RCA_API_MODEL',
  'RCA_OLLAMA_URL',
  'RCA_OLLAMA_MODEL',
  'SENDGRID_API_KEY',
  'SENDGRID_FROM_EMAIL',
  'JIRA_BASE_URL',
  'JIRA_EMAIL',
  'JIRA_API_TOKEN',
  'JIRA_PROJECT_KEY',
  'JIRA_ISSUE_TYPE',
];

function readSharedEnvFromRoot() {
  const found = {};
  if (!fs.existsSync(ROOT_ENV_PATH)) return found;
  for (const line of fs.readFileSync(ROOT_ENV_PATH, 'utf-8').split('\n')) {
    const match = line.match(/^\s*([\w.-]+)\s*=\s*(.*)\s*$/);
    if (!match) continue;
    const [, key, value] = match;
    if (SHARED_ENV_KEYS.includes(key)) found[key] = value.replace(/^["']|["']$/g, '');
  }
  return found;
}

const BACKEND_ENTRIES = ['lib', 'routes', 'reporter', 'scripts', 'server.js', 'package.json', 'package-lock.json'];
const FRONTEND_ENTRIES = ['src', 'public', 'index.html', 'package.json', 'package-lock.json', 'tsconfig.json', 'tsconfig.app.json', 'tsconfig.node.json', 'vite.config.ts'];
// npm installs are on the order of minutes — generous but bounded, so a
// broken network or a hung install fails loudly instead of blocking an
// onboarding request forever.
const INSTALL_TIMEOUT_MS = 5 * 60 * 1000;
const BUILD_TIMEOUT_MS = 3 * 60 * 1000;
const SERVER_START_TIMEOUT_MS = 30_000;

function copyEntry(srcRoot, destRoot, entry) {
  const src = path.join(srcRoot, entry);
  if (!fs.existsSync(src)) return;
  fs.cpSync(src, path.join(destRoot, entry), { recursive: true });
}

function copyDashboardSource(clientDashboardDir) {
  fs.mkdirSync(clientDashboardDir, { recursive: true });
  for (const entry of BACKEND_ENTRIES) copyEntry(DASHBOARD_SOURCE_DIR, clientDashboardDir, entry);

  const configDir = path.join(clientDashboardDir, 'config');
  fs.mkdirSync(configDir, { recursive: true });
  const platformsSrc = path.join(DASHBOARD_SOURCE_DIR, 'config', 'platforms.json');
  if (fs.existsSync(platformsSrc)) fs.copyFileSync(platformsSrc, path.join(configDir, 'platforms.json'));
  // A complete manifest up front — this client's own repo has no
  // playwright.config yet in the common case, so the server's own startup
  // regeneration will fail (caught, logged, non-fatal) and never write one;
  // the frontend still needs *something* parseable to load against. All
  // three top-level keys, not just projects: the frontend (e.g.
  // NewRunForm.tsx's `manifest.environments[0]?.value`) indexes into
  // `environments`/`tags` unconditionally — omitting either crashes any
  // page that renders the new-run form with "undefined[0]", not just the
  // page that would obviously need it.
  //
  // environments and tags are seeded with the same generic dev/qa/prod and
  // priority labels every dashboard instance ships with — unlike projects,
  // these aren't tied to any test file that may or may not exist yet, so
  // there's nothing dishonest about a fresh client starting with them
  // already selectable. projects stays genuinely empty: it's a real claim
  // about test files this client's repo doesn't have yet.
  const DEFAULT_ENVIRONMENTS = [
    { value: 'dev', label: 'Dev' },
    { value: 'qa', label: 'QA' },
    { value: 'prod', label: 'Prod' },
  ];
  const DEFAULT_TAGS = [
    { value: '@High', label: 'High priority' },
    { value: '@Medium', label: 'Medium priority' },
    { value: '@Low', label: 'Low priority' },
  ];
  const manifestPath = path.join(configDir, 'projects.json');
  if (!fs.existsSync(manifestPath)) {
    fs.writeFileSync(
      manifestPath,
      `${JSON.stringify({ environments: DEFAULT_ENVIRONMENTS, projects: [], tags: DEFAULT_TAGS }, null, 2)}\n`
    );
  }

  const frontendSrcDir = path.join(DASHBOARD_SOURCE_DIR, 'frontend');
  const frontendDestDir = path.join(clientDashboardDir, 'frontend');
  fs.mkdirSync(frontendDestDir, { recursive: true });
  for (const entry of FRONTEND_ENTRIES) copyEntry(frontendSrcDir, frontendDestDir, entry);
}

/** npm is a .cmd shim on Windows — execFile needs shell:true to resolve it at all. */
async function runNpm(args, cwd, timeout) {
  try {
    await execFileAsync('npm', args, { cwd, timeout, shell: true, windowsHide: true });
  } catch (err) {
    const detail = (err.stderr || err.stdout || err.message || '').toString().trim().split('\n').slice(-6).join(' ');
    if (err.killed || err.signal === 'SIGTERM') {
      throw new Error(`"npm ${args.join(' ')}" in ${cwd} timed out`);
    }
    throw new Error(`"npm ${args.join(' ')}" failed in ${cwd}: ${detail || 'unknown npm error'}`);
  }
}

async function installAndBuild(clientDashboardDir) {
  // --omit=dev: this instance is started directly with `node server.js`,
  // never through nodemon, so its one devDependency isn't needed here.
  await runNpm(['install', '--omit=dev'], clientDashboardDir, INSTALL_TIMEOUT_MS);
  const frontendDir = path.join(clientDashboardDir, 'frontend');
  await runNpm(['install'], frontendDir, INSTALL_TIMEOUT_MS);
  await runNpm(['run', 'build'], frontendDir, BUILD_TIMEOUT_MS);
}

const PLAYWRIGHT_CONFIG_NAMES = ['playwright.config.ts', 'playwright.config.js', 'playwright.config.mjs', 'playwright.config.cjs'];

/** The real signal a repo is already set up as a Playwright project, as opposed to merely listing playwright as one of many dependencies. */
function hasPlaywrightSetup(repoPath) {
  return PLAYWRIGHT_CONFIG_NAMES.some((name) => fs.existsSync(path.join(repoPath, name)));
}

/**
 * Installs the CLIENT'S OWN dependencies at its repo root — separate from,
 * and in addition to, installAndBuild's install of the dashboard app's own
 * (fixed, known-small) dependencies. Without this, a client repo that
 * already ships real Playwright tests still couldn't run them: the
 * dashboard's own startup project-discovery
 * (dashboard/lib/generateProjectsManifest.js) runs `npx playwright test
 * --list` with the CLIENT'S repo as cwd, which needs @playwright/test
 * resolvable from *there*, not from dashboard/'s own node_modules.
 *
 * Only runs at all when a playwright.config already exists (see
 * hasPlaywrightSetup) — a repo with no test setup yet has nothing to
 * install for, and skipping it keeps onboarding fast for the common case.
 *
 * Best-effort: never throws. An arbitrary client repo's dependency tree is
 * far less predictable than the dashboard app's own — if it fails (network,
 * a broken package.json, whatever), the client still gets a fully working
 * dashboard; its projects list just stays empty until that's fixed, exactly
 * like a repo with no Playwright setup at all. That's a real, visible state
 * ("no projects yet"), not a hidden failure, so it's safe to swallow here.
 */
async function installClientRepoDependencies(repoPath) {
  if (!hasPlaywrightSetup(repoPath)) return;
  try {
    await runNpm(['install'], repoPath, INSTALL_TIMEOUT_MS);
  } catch (err) {
    console.error(`[admin-dashboard] could not install dependencies for client repo at ${repoPath} (non-fatal — dashboard still works, projects list stays empty):`, err.message);
  }
}

function psQuote(value) {
  return `'${String(value).replace(/'/g, "''")}'`;
}

/**
 * Starts this client's dashboard as a genuinely independent Windows process
 * — NOT plain child_process.spawn(..., {detached: true}). Verified the hard
 * way: nodemon runs admin-dashboard's own `node server.js` inside a Windows
 * Job Object (specifically so ITS OWN orphaned children get cleaned up on
 * restart), and Job Objects kill their entire process tree by default —
 * `detached: true` alone does not escape that on Windows, so every onboarded
 * client's dashboard was dying the moment admin-dashboard itself next
 * restarted (which happens on every code deploy, not just during dev).
 * Routing the launch through PowerShell's Start-Process sidesteps this: it
 * launches outside admin-dashboard's job object entirely, so this server
 * keeps running across any number of admin-dashboard restarts.
 */
/**
 * stderr goes to a real file, not NUL: a detached Start-Process'd server
 * that crashes otherwise leaves no trace anywhere — confirmed the hard way,
 * debugging a dead client dashboard blind more than once. Overwritten on
 * every start (mode 'Create'), so it always holds the current process's own
 * output, not a growing log mixing several lifetimes together.
 */
async function startServer(clientDashboardDir, port, clientName, clientEmail = '') {
  const dataDir = path.join(clientDashboardDir, 'data');
  fs.mkdirSync(dataDir, { recursive: true });
  const errorLogPath = path.join(dataDir, 'server-error.log');
  const sharedEnv = readSharedEnvFromRoot();
  // Every current admin login notified on a failed run, plus this client's
  // own contact address if one was given at onboarding — see
  // dashboard/lib/notifyOnFailure.js for what actually sends the email.
  const adminEmails = listAccountSummaries()
    .map((a) => a.username)
    .join(',');
  const psScript = [
    `$env:DASHBOARD_PORT=${psQuote(String(port))}`,
    `$env:DASHBOARD_AUTO_UPDATE='false'`,
    `$env:CLIENT_NAME=${psQuote(clientName)}`,
    `$env:NOTIFY_ADMIN_EMAILS=${psQuote(adminEmails)}`,
    `$env:CLIENT_EMAIL=${psQuote(clientEmail || '')}`,
    ...Object.entries(sharedEnv).map(([key, value]) => `$env:${key}=${psQuote(value)}`),
    `Start-Process -FilePath 'node' -ArgumentList 'server.js' -WorkingDirectory ${psQuote(clientDashboardDir)} -WindowStyle Hidden -RedirectStandardOutput 'NUL' -RedirectStandardError ${psQuote(errorLogPath)}`,
  ].join('; ');
  await execFileAsync('powershell', ['-NoProfile', '-Command', psScript], { windowsHide: true, timeout: 15_000 });
}

function waitUntilUp(port, timeoutMs = SERVER_START_TIMEOUT_MS) {
  const deadline = Date.now() + timeoutMs;
  return new Promise((resolve, reject) => {
    function attempt() {
      const req = http.get({ host: '127.0.0.1', port, path: '/', timeout: 2000 }, (res) => {
        res.resume();
        resolve();
      });
      req.on('error', () => {
        if (Date.now() > deadline) reject(new Error(`This client's dashboard did not come up on port ${port} in time`));
        else setTimeout(attempt, 1000);
      });
      req.on('timeout', () => {
        req.destroy();
        if (Date.now() > deadline) reject(new Error(`This client's dashboard did not come up on port ${port} in time`));
        else setTimeout(attempt, 1000);
      });
    }
    attempt();
  });
}

/** client needs repoPath and dashboardUrl already set. Throws (never partially-silent) on any step's failure. */
async function provisionDashboard(client) {
  const clientDashboardDir = path.join(client.repoPath, 'dashboard');
  const port = Number(new URL(client.dashboardUrl).port);
  if (!Number.isFinite(port)) throw new Error(`Could not determine a port from dashboardUrl: ${client.dashboardUrl}`);

  copyDashboardSource(clientDashboardDir);
  await installAndBuild(clientDashboardDir);
  // Before starting the server: its own startup project-discovery only
  // runs once, at boot, and needs the client repo's own node_modules to
  // already be there to find anything real.
  await installClientRepoDependencies(client.repoPath);
  await startServer(clientDashboardDir, port, client.name, client.email);
  await waitUntilUp(port);
}

/**
 * Stops whatever's listening on a client's dashboard port — called when a
 * client is archived, so "Remove" doesn't leave its spawned dashboard server
 * (started detached, so it otherwise outlives everything else about that
 * client) running forever in the background.
 *
 * Best-effort and silent on failure: the process may already be down, or
 * this may run on a client that was never actually provisioned — neither
 * should ever block archiving the client itself.
 */
async function stopDashboardOnPort(dashboardUrl) {
  const port = Number(new URL(dashboardUrl).port);
  if (!Number.isFinite(port)) return;
  try {
    const { stdout } = await execFileAsync(
      'powershell',
      ['-NoProfile', '-Command', `(Get-NetTCPConnection -LocalPort ${port} -State Listen -ErrorAction SilentlyContinue).OwningProcess`],
      { windowsHide: true }
    );
    const pid = parseInt(stdout.trim(), 10);
    if (Number.isFinite(pid)) {
      await execFileAsync('powershell', ['-NoProfile', '-Command', `Stop-Process -Id ${pid} -Force -ErrorAction SilentlyContinue`], { windowsHide: true });
    }
  } catch {
    // Best-effort — see doc comment above.
  }
}

module.exports = { provisionDashboard, stopDashboardOnPort, startServer, DASHBOARD_SOURCE_DIR };
