const fs = require('fs');
const path = require('path');
const { execSync, execFileSync } = require('child_process');
const { REPO_ROOT } = require('./paths');
const { regenerateProjectsManifest } = require('./generateProjectsManifest');

const DEFAULT_INTERVAL_MS = 3 * 60 * 1000;
const FRONTEND_SRC_DIR = path.join(REPO_ROOT, 'dashboard', 'frontend', 'src');
const LOCAL_REBUILD_DEBOUNCE_MS = 500;

function git(args) {
  return execFileSync('git', args, { cwd: REPO_ROOT, encoding: 'utf-8' }).trim();
}

/**
 * Polls the configured remote/branch for new commits and, if the working
 * tree is clean and a fast-forward is possible, pulls them in and does
 * whatever follow-up the changed files call for. This is deliberately
 * polling rather than a GitHub webhook: dashboard/server.js binds to
 * 127.0.0.1 only because it can spawn arbitrary Playwright/Chrome processes
 * on request, and a real webhook would need an inbound endpoint reachable
 * from GitHub, which breaks that boundary.
 *
 * Any change under dashboard/server.js, dashboard/lib, dashboard/routes, or
 * dashboard/reporter needs no explicit restart step here: the pull just
 * rewrites those files on disk, and nodemon (wrapping `node server.js`,
 * see dashboard/nodemon.json) notices and restarts on its own.
 *
 * `this.status` is broadcast over the WebSocket on every phase transition
 * (`auto-update-status` messages) and also served over REST
 * (GET /api/auto-update/status, see routes/api.js) so a freshly opened
 * dashboard tab shows the current version/state immediately instead of
 * waiting for the next tick.
 *
 * Separately from the git-polling above, `startLocalFrontendWatch()` covers
 * a gap nodemon doesn't: dashboard/nodemon.json deliberately ignores
 * dashboard/frontend/**, since restarting the server wouldn't rebuild the
 * pre-built dist/ bundle Express actually serves. Without this, editing a
 * frontend file locally (no commit, no pull) would never show up until
 * someone remembers to run `npm run dashboard:build` by hand.
 */
class AutoUpdater {
  constructor({ broadcast, isRunActive, intervalMs, remote, log }) {
    this.broadcast = broadcast;
    this.isRunActive = isRunActive;
    this.intervalMs = intervalMs || Number(process.env.DASHBOARD_AUTO_UPDATE_INTERVAL_MS) || DEFAULT_INTERVAL_MS;
    this.remote = remote || process.env.DASHBOARD_GIT_REMOTE || 'origin';
    this.log = log || ((msg) => console.log(`[auto-updater] ${msg}`));
    this.timer = null;
    this.status = this._initialStatus();
    this.frontendWatcher = null;
    this.rebuildDebounceTimer = null;
    this.rebuildInProgress = false;
    this.rebuildQueued = false;
  }

  _initialStatus() {
    const base = {
      phase: 'idle',
      sha: null,
      shortSha: null,
      branch: null,
      detail: null,
      changedFiles: [],
      lastCheckedAt: null,
      lastUpdatedAt: null,
    };
    try {
      const sha = git(['rev-parse', 'HEAD']);
      return {
        ...base,
        sha,
        shortSha: sha.slice(0, 7),
        branch: git(['rev-parse', '--abbrev-ref', 'HEAD']),
      };
    } catch {
      return base;
    }
  }

  getStatus() {
    return this.status;
  }

  _setStatus(partial) {
    this.status = { ...this.status, ...partial };
    this.broadcast({ type: 'auto-update-status', ...this.status });
  }

  start() {
    if (this.timer) return;
    this.timer = setInterval(() => this.tick(), this.intervalMs);
    this.log(`polling ${this.remote} every ${Math.round(this.intervalMs / 1000)}s`);
  }

  stop() {
    if (this.timer) clearInterval(this.timer);
    this.timer = null;
    this.stopLocalFrontendWatch();
  }

  startLocalFrontendWatch() {
    if (this.frontendWatcher || !fs.existsSync(FRONTEND_SRC_DIR)) return;
    // `recursive: true` is supported on Windows/macOS natively; on Linux
    // Node silently only watches the top-level dir, so this is deliberately
    // best-effort rather than a hard dependency of the feature.
    this.frontendWatcher = fs.watch(FRONTEND_SRC_DIR, { recursive: true }, () => this._scheduleLocalRebuild());
    this.log(`watching ${FRONTEND_SRC_DIR} for local edits`);
  }

  stopLocalFrontendWatch() {
    if (this.frontendWatcher) this.frontendWatcher.close();
    this.frontendWatcher = null;
    if (this.rebuildDebounceTimer) clearTimeout(this.rebuildDebounceTimer);
    this.rebuildDebounceTimer = null;
  }

  _scheduleLocalRebuild() {
    if (this.rebuildDebounceTimer) clearTimeout(this.rebuildDebounceTimer);
    this.rebuildDebounceTimer = setTimeout(() => this._runLocalRebuild(), LOCAL_REBUILD_DEBOUNCE_MS);
  }

  _runLocalRebuild() {
    if (this.rebuildInProgress) {
      // A save landed mid-build; run once more right after this one finishes
      // instead of dropping it (execSync below is synchronous/blocking).
      this.rebuildQueued = true;
      return;
    }
    this.rebuildInProgress = true;
    this._setStatus({ phase: 'building', detail: 'rebuilding dashboard frontend (local edit)' });
    this.log('local frontend change detected — rebuilding');
    try {
      execSync('npm run build', { cwd: `${REPO_ROOT}/dashboard/frontend`, stdio: 'inherit' });
      this._setStatus({
        phase: 'updated',
        detail: 'Dashboard frontend rebuilt from a local change — refresh to see it.',
        lastUpdatedAt: new Date().toISOString(),
      });
      this.log('local rebuild complete');
    } catch (err) {
      this._setStatus({ phase: 'error', detail: `local rebuild failed: ${err.message}` });
      this.log(`local rebuild failed: ${err.message}`);
    } finally {
      this.rebuildInProgress = false;
      if (this.rebuildQueued) {
        this.rebuildQueued = false;
        this._scheduleLocalRebuild();
      }
    }
  }

  tick() {
    try {
      this._tick();
    } catch (err) {
      this._setStatus({ phase: 'error', detail: err.message });
      this.log(`tick failed, will retry next interval: ${err.message}`);
    }
  }

  _tick() {
    if (this.isRunActive()) {
      this.log('skipped — a test run is in progress');
      return;
    }

    // Read HEAD fresh on every tick — it may have moved since the last tick
    // for reasons that have nothing to do with this updater's own pulls (a
    // local commit, a manual `git pull`/checkout by whoever's developing).
    // Stamping it onto every status below is what makes the badge
    // self-correct on the very next poll instead of only when *this*
    // updater is the one that moved HEAD.
    const branch = git(['rev-parse', '--abbrev-ref', 'HEAD']);
    const sha = git(['rev-parse', 'HEAD']);
    const shortSha = sha.slice(0, 7);

    this._setStatus({ phase: 'checking', sha, shortSha, branch, detail: null, lastCheckedAt: new Date().toISOString() });

    git(['fetch', this.remote, branch]);

    const behind = Number(git(['rev-list', `HEAD..${this.remote}/${branch}`, '--count']));
    if (behind === 0) {
      this._setStatus({ phase: 'up-to-date', sha, shortSha, branch, detail: null });
      return;
    }

    if (git(['status', '--porcelain'])) {
      this._setStatus({ phase: 'skipped', sha, shortSha, branch, detail: 'local working tree has uncommitted changes' });
      this.log('skipped — local working tree has uncommitted changes');
      return;
    }

    const beforeSha = sha;
    this._setStatus({ phase: 'pulling', sha, shortSha, branch, detail: `${behind} commit(s) available` });

    try {
      git(['pull', '--ff-only', this.remote, branch]);
    } catch (err) {
      this._setStatus({ phase: 'error', sha, shortSha, branch, detail: `fast-forward pull failed: ${err.message}` });
      this.log(`skipped — fast-forward pull failed (history may have diverged): ${err.message}`);
      return;
    }

    const afterSha = git(['rev-parse', 'HEAD']);
    const changedFiles = git(['diff', '--name-only', beforeSha, afterSha])
      .split('\n')
      .filter(Boolean);

    this.log(`pulled ${behind} commit(s): ${beforeSha.slice(0, 7)} -> ${afterSha.slice(0, 7)}`);

    try {
      this._runFollowUp(changedFiles, { sha: afterSha, shortSha: afterSha.slice(0, 7), branch });
    } catch (err) {
      this._setStatus({
        phase: 'error',
        sha: afterSha,
        shortSha: afterSha.slice(0, 7),
        branch,
        detail: `pulled but a follow-up step failed: ${err.message}`,
      });
      this.log(`follow-up failed: ${err.message}`);
      return;
    }

    this._setStatus({
      phase: 'updated',
      sha: afterSha,
      shortSha: afterSha.slice(0, 7),
      branch,
      changedFiles,
      detail: null,
      lastUpdatedAt: new Date().toISOString(),
    });
  }

  _runFollowUp(changedFiles, headInfo) {
    const changed = (prefix) => changedFiles.some((f) => f.startsWith(prefix));

    if (changed('package.json') || changed('package-lock.json')) {
      this._setStatus({ phase: 'installing', ...headInfo, detail: 'installing root dependencies' });
      this.log('root package.json changed — running npm install');
      execSync('npm install', { cwd: REPO_ROOT, stdio: 'inherit' });
    }
    if (changed('dashboard/package.json') || changed('dashboard/package-lock.json')) {
      this._setStatus({ phase: 'installing', ...headInfo, detail: 'installing dashboard dependencies' });
      this.log('dashboard/package.json changed — running npm install');
      execSync('npm install', { cwd: `${REPO_ROOT}/dashboard`, stdio: 'inherit' });
    }

    if (changed('dashboard/frontend/')) {
      if (changed('dashboard/frontend/package.json') || changed('dashboard/frontend/package-lock.json')) {
        this._setStatus({ phase: 'installing', ...headInfo, detail: 'installing dashboard frontend dependencies' });
        this.log('dashboard/frontend/package.json changed — running npm install');
        execSync('npm install', { cwd: `${REPO_ROOT}/dashboard/frontend`, stdio: 'inherit' });
      }
      this._setStatus({ phase: 'building', ...headInfo, detail: 'rebuilding dashboard frontend' });
      this.log('dashboard/frontend changed — rebuilding');
      execSync('npm run build', { cwd: `${REPO_ROOT}/dashboard/frontend`, stdio: 'inherit' });
    }

    if (changed('playwright.config.ts') || changed('tests/')) {
      this._setStatus({ phase: 'syncing-manifest', ...headInfo, detail: 'syncing project list' });
      this.log('playwright.config.ts or a spec changed — syncing project manifest');
      regenerateProjectsManifest();
    }
  }
}

module.exports = { AutoUpdater };
