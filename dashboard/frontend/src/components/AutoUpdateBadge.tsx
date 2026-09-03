import { useEffect, useState } from 'react';
import { api } from '../api/client';
import { useDashboardSocket } from '../api/useDashboardSocket';
import type { AutoUpdateStatus } from '../api/types';

const ACTIVE_PHASES = new Set(['checking', 'pulling', 'installing', 'building', 'syncing-manifest']);

const PHASE_LABEL: Record<string, string> = {
  checking: 'Checking…',
  pulling: 'Pulling…',
  installing: 'Installing…',
  building: 'Building…',
  'syncing-manifest': 'Syncing…',
  error: 'Update failed',
};

/**
 * Always-visible "what version am I on / is it doing anything right now"
 * indicator, next to ConnectionBadge — separate from UpdateBanner, which
 * only surfaces the actionable "new version, refresh" / error messages.
 */
export function AutoUpdateBadge() {
  const [status, setStatus] = useState<AutoUpdateStatus | null>(null);

  useEffect(() => {
    api.getAutoUpdateStatus().then(setStatus).catch(() => {});
  }, []);

  useDashboardSocket((msg) => {
    if (msg.type === 'auto-update-status') setStatus(msg);
  });

  if (!status) return null;

  const isActive = ACTIVE_PHASES.has(status.phase);
  const isError = status.phase === 'error';
  const label = isActive || isError ? PHASE_LABEL[status.phase] : status.shortSha ? `v${status.shortSha}` : '—';

  return (
    <span
      className={`auto-update-badge${isActive ? ' is-active' : ''}${isError ? ' is-error' : ''}`}
      title={status.detail ?? (status.sha ? `Commit ${status.sha} on ${status.branch}` : undefined)}
    >
      <span className="auto-update-dot" />
      {label}
    </span>
  );
}
