import type { ReactNode } from 'react';

export function StatTile({
  label,
  value,
  hint,
  accent,
}: {
  label: string;
  value: ReactNode;
  hint?: string;
  accent?: 'good' | 'critical' | 'running' | 'warning';
}) {
  return (
    <div className={`stat-tile${accent ? ` accent-${accent}` : ''}`}>
      <div className="stat-tile-label">{label}</div>
      <div className="stat-tile-value tabular-nums">{value}</div>
      {hint && <div className="stat-tile-hint muted">{hint}</div>}
    </div>
  );
}
