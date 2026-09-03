const path = require('path');

const DASHBOARD_ROOT = path.resolve(__dirname, '..');
const REPO_ROOT = path.resolve(DASHBOARD_ROOT, '..');
const DATA_DIR = path.join(DASHBOARD_ROOT, 'data');
const RUNS_DIR = path.join(DATA_DIR, 'runs');
const REPORTS_DIR = path.join(DATA_DIR, 'reports');
// Per-run copies of test attachments (screenshot/trace/error-context), so a
// run's evidence survives Playwright wiping test-results/ at the start of
// its next invocation. See lib/artifactArchive.js.
const ARTIFACTS_DIR = path.join(DATA_DIR, 'artifacts');
const FRONTEND_DIST_DIR = path.join(DASHBOARD_ROOT, 'frontend', 'dist');
const PROJECTS_MANIFEST = path.join(DASHBOARD_ROOT, 'config', 'projects.json');

/**
 * Playwright ships its trace viewer as a self-contained static PWA inside
 * playwright-core. Serving that directory ourselves lets traces open from
 * this server's own origin instead of https://trace.playwright.dev — see
 * the comment on the /trace-viewer mount in server.js for why that matters.
 * Resolved from playwright-core rather than hardcoded so it tracks whatever
 * Playwright version the repo has installed.
 */
function resolveTraceViewerDir() {
  try {
    const coreRoot = path.dirname(require.resolve('playwright-core/package.json'));
    return path.join(coreRoot, 'lib', 'vite', 'traceViewer');
  } catch {
    return null;
  }
}
const TRACE_VIEWER_DIR = resolveTraceViewerDir();

// Directories under which file-serving routes are allowed to read from.
// Anything outside these roots is rejected, even though the server only
// binds to localhost, to guard against path-traversal in the ?path= query.
const ALLOWED_FILE_ROOTS = [
  path.join(REPO_ROOT, 'test-results'),
  ARTIFACTS_DIR,
];

module.exports = {
  DASHBOARD_ROOT,
  REPO_ROOT,
  DATA_DIR,
  RUNS_DIR,
  REPORTS_DIR,
  ARTIFACTS_DIR,
  FRONTEND_DIST_DIR,
  PROJECTS_MANIFEST,
  TRACE_VIEWER_DIR,
  ALLOWED_FILE_ROOTS,
};
