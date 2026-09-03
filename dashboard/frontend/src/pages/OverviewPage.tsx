import { useCallback, useEffect, useMemo, useState } from 'react';
import { Link } from 'react-router-dom';
import { Area, AreaChart, CartesianGrid, ResponsiveContainer, Tooltip, XAxis, YAxis } from 'recharts';
import { api } from '../api/client';
import { useDashboardSocket } from '../api/useDashboardSocket';
import type { RunRecord } from '../api/types';
import { StatTile } from '../components/StatTile';
import { RunCard } from '../components/RunCard';
import { ExportButtons } from '../components/ExportButtons';
import { findFlakyTests, findTopFailing } from '../utils/runStats';
import { exportOverviewPDF } from '../utils/export';

const ACTIVE_STATUSES = new Set(['queued', 'running']);
const HISTORY_WINDOW = 20;

export function OverviewPage() {
  const [runs, setRuns] = useState<RunRecord[] | null>(null);

  const refetch = useCallback(() => {
    api.listRuns(50).then(setRuns).catch(() => {});
  }, []);

  useEffect(() => {
    refetch();
  }, [refetch]);

  useDashboardSocket((msg) => {
    if (msg.type === 'snapshot') setRuns(msg.runs);
    else refetch();
  });

  const stats = useMemo(() => {
    if (!runs) return null;
    const recent = runs.slice(0, HISTORY_WINDOW);
    const active = runs.filter((r) => ACTIVE_STATUSES.has(r.status));

    const totals = recent.reduce(
      (acc, r) => {
        acc.passed += r.stats.passed;
        acc.failed += r.stats.failed;
        return acc;
      },
      { passed: 0, failed: 0 },
    );
    const decided = totals.passed + totals.failed;
    const passRate = decided ? Math.round((totals.passed / decided) * 100) : null;

    const flaky = findFlakyTests(recent, 6);
    const topFailing = findTopFailing(recent, 6);

    const trend = [...recent].reverse().map((r, i) => {
      const decidedR = r.stats.passed + r.stats.failed;
      return {
        idx: i + 1,
        label: new Date(r.createdAt).toLocaleDateString(undefined, { month: 'short', day: 'numeric' }),
        passRate: decidedR ? Math.round((r.stats.passed / decidedR) * 100) : null,
      };
    });

    return { active, passRate, flaky, topFailing, trend, totalRuns: runs.length };
  }, [runs]);

  if (!runs || !stats) {
    return (
      <div className="overview-page">
        <div className="skeleton-grid">
          {Array.from({ length: 4 }).map((_, i) => (
            <div key={i} className="skeleton skeleton-tile" />
          ))}
        </div>
        <div className="skeleton skeleton-block" />
      </div>
    );
  }

  const passRateAccent = stats.passRate == null ? undefined : stats.passRate >= 90 ? 'good' : stats.passRate >= 70 ? 'warning' : 'critical';

  return (
    <div className="overview-page page-fade">
      <div className="page-heading page-heading-row">
        <div>
          <h2>Overview</h2>
          <p className="muted">A pulse check on your last {Math.min(HISTORY_WINDOW, runs.length)} runs.</p>
        </div>
        <ExportButtons
          onExportPDF={() =>
            exportOverviewPDF({
              totalRuns: stats.totalRuns,
              passRate: stats.passRate,
              activeCount: stats.active.length,
              flaky: stats.flaky,
              topFailing: stats.topFailing,
              recentRuns: runs.slice(0, 10),
            })
          }
        />
      </div>

      <div className="stat-grid">
        <StatTile label="Total runs" value={stats.totalRuns} hint="all recorded" />
        <StatTile
          label="Pass rate"
          value={stats.passRate == null ? '–' : `${stats.passRate}%`}
          hint={`last ${Math.min(HISTORY_WINDOW, runs.length)} runs`}
          accent={passRateAccent}
        />
        <StatTile
          label="Active now"
          value={stats.active.length}
          hint={stats.active.length ? 'in progress' : 'idle'}
          accent={stats.active.length ? 'running' : undefined}
        />
        <StatTile
          label="Flaky tests"
          value={stats.flaky.length}
          hint="pass & fail recently"
          accent={stats.flaky.length ? 'warning' : 'good'}
        />
      </div>

      <div className="card chart-card">
        <h3>Pass rate trend</h3>
        {stats.trend.length < 2 ? (
          <p className="muted">Run a few more times to see a trend.</p>
        ) : (
          <ResponsiveContainer width="100%" height={200}>
            <AreaChart data={stats.trend} margin={{ left: -16, right: 16, top: 8 }}>
              <defs>
                <linearGradient id="passRateFill" x1="0" y1="0" x2="0" y2="1">
                  <stop offset="0%" stopColor="var(--status-good)" stopOpacity={0.35} />
                  <stop offset="100%" stopColor="var(--status-good)" stopOpacity={0} />
                </linearGradient>
              </defs>
              <CartesianGrid strokeDasharray="3 3" stroke="var(--gridline)" vertical={false} />
              <XAxis dataKey="label" tick={{ fill: 'var(--text-muted)', fontSize: 11 }} stroke="var(--axis)" />
              <YAxis
                domain={[0, 100]}
                tick={{ fill: 'var(--text-muted)', fontSize: 11 }}
                stroke="var(--axis)"
                width={36}
                unit="%"
              />
              <Tooltip
                formatter={(value: number) => [`${value}%`, 'Pass rate']}
                contentStyle={{ background: 'var(--surface-1)', border: '1px solid var(--border)', borderRadius: 8, fontSize: 13 }}
              />
              <Area type="monotone" dataKey="passRate" stroke="var(--status-good)" strokeWidth={2} fill="url(#passRateFill)" />
            </AreaChart>
          </ResponsiveContainer>
        )}
      </div>

      <div className="overview-columns">
        <div className="card">
          <h3>Flaky tests</h3>
          {stats.flaky.length === 0 ? (
            <p className="muted">No flaky tests detected — nice.</p>
          ) : (
            <ul className="insight-list">
              {stats.flaky.map((t) => (
                <li key={t.key}>
                  <div className="insight-title">{t.title}</div>
                  <div className="muted insight-sub">{t.file.split(/[\\/]/).pop()}</div>
                  <div className="insight-counts tabular-nums">
                    <span className="stat-pass">{t.passCount}✓</span>
                    <span className="stat-fail">{t.failCount}✕</span>
                  </div>
                </li>
              ))}
            </ul>
          )}
        </div>

        <div className="card">
          <h3>Most-failing tests</h3>
          {stats.topFailing.length === 0 ? (
            <p className="muted">Nothing failing lately.</p>
          ) : (
            <ul className="insight-list">
              {stats.topFailing.map((t) => (
                <li key={t.key}>
                  <div className="insight-title">{t.title}</div>
                  <div className="muted insight-sub">{t.file.split(/[\\/]/).pop()}</div>
                  <div className="insight-counts tabular-nums">
                    <span className="stat-fail">{t.failCount}✕ failures</span>
                  </div>
                </li>
              ))}
            </ul>
          )}
        </div>
      </div>

      <div className="card">
        <div className="table-toolbar">
          <h3>Recent runs</h3>
          <Link to="/runs" className="link-button">
            View all runs →
          </Link>
        </div>
        {runs.length === 0 ? (
          <p className="muted">No runs yet — start one from a platform page.</p>
        ) : (
          <div className="run-card-grid">
            {runs.slice(0, 6).map((r) => (
              <RunCard run={r} key={r.runId} />
            ))}
          </div>
        )}
      </div>
    </div>
  );
}
