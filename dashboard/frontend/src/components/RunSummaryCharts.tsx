import { Cell, Pie, PieChart, ResponsiveContainer, Tooltip, Bar, BarChart, XAxis, YAxis, CartesianGrid } from 'recharts';
import type { RunStats, TestRecord } from '../api/types';

const STATUS_COLORS: Record<string, string> = {
  Passed: 'var(--status-good)',
  Failed: 'var(--status-critical)',
  Skipped: 'var(--status-skipped)',
  Running: 'var(--status-running)',
};

export function RunSummaryCharts({ stats, tests }: { stats: RunStats; tests: TestRecord[] }) {
  const donutData = [
    { name: 'Passed', value: stats.passed },
    { name: 'Failed', value: stats.failed },
    { name: 'Skipped', value: stats.skipped },
    { name: 'Running', value: stats.running },
  ].filter((d) => d.value > 0);

  const slowest = [...tests]
    .filter((t) => typeof t.duration === 'number')
    .sort((a, b) => (b.duration ?? 0) - (a.duration ?? 0))
    .slice(0, 8)
    .map((t) => ({ name: t.title.length > 28 ? `${t.title.slice(0, 27)}…` : t.title, seconds: (t.duration ?? 0) / 1000 }));

  return (
    <div className="charts-row">
      <div className="card chart-card">
        <h3>Result breakdown</h3>
        {donutData.length === 0 ? (
          <p className="muted">No test results yet.</p>
        ) : (
          <>
            <ResponsiveContainer width="100%" height={200}>
              <PieChart>
                <Pie data={donutData} dataKey="value" nameKey="name" innerRadius={50} outerRadius={80} paddingAngle={2}>
                  {donutData.map((entry) => (
                    <Cell key={entry.name} fill={STATUS_COLORS[entry.name]} stroke="var(--surface-1)" strokeWidth={2} />
                  ))}
                </Pie>
                <Tooltip
                  contentStyle={{ background: 'var(--surface-1)', border: '1px solid var(--border)', borderRadius: 8, fontSize: 13 }}
                />
              </PieChart>
            </ResponsiveContainer>
            <ul className="chart-legend">
              {donutData.map((d) => (
                <li key={d.name}>
                  <span className="legend-swatch" style={{ background: STATUS_COLORS[d.name] }} />
                  {d.name} <span className="tabular-nums muted">{d.value}</span>
                </li>
              ))}
            </ul>
          </>
        )}
      </div>

      <div className="card chart-card">
        <h3>Slowest tests</h3>
        {slowest.length === 0 ? (
          <p className="muted">No completed tests yet.</p>
        ) : (
          <ResponsiveContainer width="100%" height={200}>
            <BarChart data={slowest} layout="vertical" margin={{ left: 8, right: 16 }}>
              <CartesianGrid strokeDasharray="3 3" stroke="var(--gridline)" horizontal={false} />
              <XAxis type="number" tick={{ fill: 'var(--text-muted)', fontSize: 11 }} unit="s" stroke="var(--axis)" />
              <YAxis type="category" dataKey="name" width={150} tick={{ fill: 'var(--text-secondary)', fontSize: 11 }} stroke="var(--axis)" />
              <Tooltip
                formatter={(value: number) => [`${value.toFixed(1)}s`, 'Duration']}
                contentStyle={{ background: 'var(--surface-1)', border: '1px solid var(--border)', borderRadius: 8, fontSize: 13 }}
              />
              <Bar dataKey="seconds" fill="var(--series-1)" radius={[0, 4, 4, 0]} />
            </BarChart>
          </ResponsiveContainer>
        )}
      </div>
    </div>
  );
}
