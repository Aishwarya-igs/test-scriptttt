import { useEffect, useState } from 'react';
import { api, type OverviewStats } from '../api/client';

// Keeps the rollup live while the page sits open, same interval ClientCard
// polls its own stats at.
const OVERVIEW_POLL_MS = 30_000;

function formatDate(iso: string | null) {
  if (!iso) return '—';
  return new Date(iso).toLocaleString();
}

/**
 * The consolidated, weighted rollup across every onboarded client — this is
 * what makes the page an actual *overview*, not just a list of cards the
 * admin has to read one by one to gauge overall health.
 */
export function OverviewSummary() {
  const [stats, setStats] = useState<OverviewStats | null>(null);

  useEffect(() => {
    function fetchOverview() {
      api.getOverview().then(setStats).catch(() => setStats(null));
    }
    fetchOverview();
    const interval = setInterval(fetchOverview, OVERVIEW_POLL_MS);
    return () => clearInterval(interval);
  }, []);

  if (!stats) return null;

  return (
    <div className="summary-row">
      <div className="summary-tile">
        <div className="summary-tile-label">Clients onboarded</div>
        <div className="summary-tile-value">{stats.totalClients}</div>
        <div className="summary-tile-sub">{stats.clientsWithData} reporting data</div>
      </div>
      <div className="summary-tile summary-tile-accent">
        <div className="summary-tile-label">Total runs</div>
        <div className="summary-tile-value">{stats.totalRuns}</div>
        <div className="summary-tile-sub">across all clients</div>
      </div>
      <div className="summary-tile">
        <div className="summary-tile-label">Overall pass rate</div>
        <div className="summary-tile-value">{stats.overallPassRate != null ? `${stats.overallPassRate}%` : '—'}</div>
        <div className="summary-tile-sub">weighted by test count</div>
      </div>
      <div className="summary-tile">
        <div className="summary-tile-label">Last activity</div>
        <div className="summary-tile-value summary-tile-value-small">{formatDate(stats.lastActivityAt)}</div>
        <div className="summary-tile-sub">most recent run, any client</div>
      </div>
    </div>
  );
}
