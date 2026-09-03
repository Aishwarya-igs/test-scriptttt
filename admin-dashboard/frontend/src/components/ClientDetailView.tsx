import type { ClientDetail } from '../api/client';

function formatDate(iso: string | null) {
  if (!iso) return '—';
  return new Date(iso).toLocaleString();
}

function statusBadgeClass(status: string | null) {
  const s = (status || '').toLowerCase();
  if (s === 'passed' || s === 'success') return 'status-badge-passed';
  if (s === 'failed' || s === 'failure') return 'status-badge-failed';
  return 'status-badge-neutral';
}

function passRateAccentClass(rate: number | null) {
  if (rate == null) return '';
  if (rate >= 80) return 'summary-tile-accent-success';
  if (rate >= 50) return 'summary-tile-accent-warning';
  return 'summary-tile-accent-danger';
}

/**
 * The stats/recent-runs/flaky-tests body shared by the admin's own
 * per-client drill-down (ClientDetailPage) and the client-team's own
 * restricted view (ClientViewPage) — identical content, different pages
 * wrap it with different headers/permissions around it.
 */
export function ClientDetailView({ detail }: { detail: ClientDetail }) {
  const { stats, recentRuns, flakyTests } = detail;

  if (!stats.available) {
    return <div className="card empty-state">No Automation Dashboard data yet for this client.</div>;
  }

  return (
    <>
      <div className="summary-row">
        <div className="summary-tile">
          <div className="summary-tile-label">Total runs</div>
          <div className="summary-tile-value">{stats.totalRuns}</div>
        </div>
        <div className={`summary-tile summary-tile-accent ${passRateAccentClass(stats.passRate)}`}>
          <div className="summary-tile-label">Pass rate</div>
          <div className="summary-tile-value">{stats.passRate != null ? `${stats.passRate}%` : '—'}</div>
        </div>
        <div className="summary-tile">
          <div className="summary-tile-label">Last run</div>
          <div className="summary-tile-value summary-tile-value-small">{formatDate(stats.lastRunAt)}</div>
        </div>
        <div className="summary-tile">
          <div className="summary-tile-label">Last status</div>
          <div className="summary-tile-value summary-tile-value-small">
            {stats.lastRunStatus ? <span className={`status-badge ${statusBadgeClass(stats.lastRunStatus)}`}>{stats.lastRunStatus}</span> : '—'}
          </div>
        </div>
      </div>

      <div className="card">
        <h3>Recent runs</h3>
        {recentRuns.length === 0 ? (
          <p className="muted">No runs recorded yet.</p>
        ) : (
          <table className="detail-table">
            <thead>
              <tr>
                <th>When</th>
                <th>Status</th>
                <th>Passed</th>
                <th>Failed</th>
                <th>Skipped</th>
              </tr>
            </thead>
            <tbody>
              {recentRuns.map((run) => (
                <tr key={run.runId}>
                  <td>{formatDate(run.createdAt)}</td>
                  <td>
                    {run.status ? <span className={`status-badge ${statusBadgeClass(run.status)}`}>{run.status}</span> : '—'}
                  </td>
                  <td className="stat-count-passed">{run.passed}</td>
                  <td className="stat-count-failed">{run.failed}</td>
                  <td className="stat-count-skipped">{run.skipped}</td>
                </tr>
              ))}
            </tbody>
          </table>
        )}
      </div>

      <div className="card">
        <h3>Flaky tests</h3>
        {flakyTests.length === 0 ? (
          <p className="muted">No flaky tests detected across recorded runs. A test appears here only once it has both passed and failed at different times.</p>
        ) : (
          <ul className="flaky-list">
            {flakyTests.map((t) => (
              <li key={`${t.file}::${t.title}`}>
                <div>{t.title}</div>
                <div className="muted flaky-list-file">{t.file}</div>
                <div className="muted">
                  {t.passRuns} passed · {t.failRuns} failed across recorded runs
                </div>
              </li>
            ))}
          </ul>
        )}
      </div>
    </>
  );
}
