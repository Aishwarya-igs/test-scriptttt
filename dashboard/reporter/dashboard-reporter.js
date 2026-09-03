/**
 * Custom Playwright reporter that streams live test-lifecycle events to the
 * dashboard's backend while a run was triggered from the dashboard UI.
 *
 * Entirely guarded by DASHBOARD_SERVER_URL — when a developer runs
 * `npm run test:qa` etc. straight from the CLI without the dashboard server
 * running, every method below is a no-op and never throws, so plain CLI
 * usage is completely unaffected.
 */
class DashboardReporter {
  constructor() {
    this.serverUrl = process.env.DASHBOARD_SERVER_URL || null;
    this.runId = process.env.DASHBOARD_RUN_ID || null;
    this.jobId = process.env.DASHBOARD_JOB_ID || null;
    this.enabled = Boolean(this.serverUrl && this.runId && this.jobId);
  }

  _post(event, payload) {
    if (!this.enabled) return;
    const body = JSON.stringify({ runId: this.runId, jobId: this.jobId, event, ...payload });
    fetch(`${this.serverUrl}/api/internal/run-events`, {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body,
      signal: AbortSignal.timeout(2000),
    }).catch(() => {
      // Best-effort only: a dashboard hiccup must never fail a test run.
    });
  }

  _identity(test) {
    const project = test.parent ? test.parent.project() : null;
    return {
      testId: test.id,
      title: test.title,
      titlePath: test.titlePath(),
      project: project ? project.name : null,
      file: test.location.file,
      line: test.location.line,
    };
  }

  onBegin(config, suite) {
    this._post('begin', {
      totalTests: suite.allTests().length,
      projects: config.projects.map((p) => p.name),
    });
  }

  onTestBegin(test, result) {
    this._post('test-begin', { ...this._identity(test), retry: result.retry });
  }

  onTestEnd(test, result) {
    this._post('test-end', {
      ...this._identity(test),
      retry: result.retry,
      status: result.status,
      duration: result.duration,
      error: result.errors && result.errors[0]
        ? { message: result.errors[0].message, stack: result.errors[0].stack }
        : null,
      attachments: (result.attachments || []).map((a) => ({
        name: a.name,
        contentType: a.contentType,
        path: a.path || null,
      })),
    });
  }

  onEnd(result) {
    this._post('end', { status: result.status });
  }

  // This reporter only POSTs events over HTTP — it never writes to the
  // terminal. Without this, Playwright assumes any custom reporter owns
  // stdio and suppresses its own built-in terminal output (e.g. `--list`
  // prints nothing, and normal runs get no console progress at all).
  printsToStdio() {
    return false;
  }
}

module.exports = DashboardReporter;
