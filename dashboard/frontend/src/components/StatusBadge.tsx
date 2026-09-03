import './StatusBadge.css';

const STATUS_META: Record<string, { label: string; icon: string; color: string }> = {
  passed: { label: 'Passed', icon: '✓', color: 'var(--status-good)' },
  failed: { label: 'Failed', icon: '✕', color: 'var(--status-critical)' },
  timedOut: { label: 'Timed out', icon: '✕', color: 'var(--status-critical)' },
  interrupted: { label: 'Interrupted', icon: '!', color: 'var(--status-serious)' },
  skipped: { label: 'Skipped', icon: '–', color: 'var(--status-skipped)' },
  running: { label: 'Running', icon: '●', color: 'var(--status-running)' },
  queued: { label: 'Queued', icon: '…', color: 'var(--text-muted)' },
  stopped: { label: 'Stopped', icon: '■', color: 'var(--status-warning)' },
  stalled: { label: 'Skipped (stuck)', icon: '⚠', color: 'var(--status-warning)' },
};

const LIVE_STATUSES = new Set(['running', 'queued']);

export function StatusBadge({ status }: { status: string }) {
  const meta = STATUS_META[status] ?? { label: status, icon: '?', color: 'var(--text-muted)' };
  const isLive = LIVE_STATUSES.has(status);
  return (
    <span className={`status-badge${isLive ? ' is-live' : ''}`} style={{ color: meta.color, borderColor: meta.color }}>
      {isLive ? <span className="status-badge-pulse" style={{ background: meta.color }} aria-hidden="true" /> : <span aria-hidden="true">{meta.icon}</span>}
      {meta.label}
    </span>
  );
}
