import { useState } from 'react';
import { useDashboardSocket } from '../api/useDashboardSocket';
import type { AutoUpdateStatus } from '../api/types';

const PROCESSING_LABEL: Record<string, string> = {
  pulling: 'Pulling new code from GitHub…',
  installing: 'Installing dependencies…',
  building: 'Rebuilding the dashboard frontend…',
  'syncing-manifest': 'Syncing the project list…',
};

/**
 * Reacts to the auto-updater's phase broadcasts (dashboard/lib/autoUpdater.js):
 * shows a live "what's going on" strip while it's actually pulling/installing/
 * building, a dismissible success banner once a new version has landed, and
 * an error banner if a step failed. Quiet phases (idle/checking/up-to-date/
 * skipped) render nothing — those are reflected in AutoUpdateBadge instead.
 */
export function UpdateBanner() {
  const [status, setStatus] = useState<AutoUpdateStatus | null>(null);
  const [dismissedKey, setDismissedKey] = useState<string | null>(null);

  useDashboardSocket((msg) => {
    if (msg.type === 'auto-update-status') setStatus(msg);
  });

  if (!status) return null;

  const key = `${status.phase}:${status.sha ?? ''}:${status.lastUpdatedAt ?? ''}`;
  if (key === dismissedKey) return null;

  if (status.phase === 'updated') {
    return (
      <div className="update-banner" role="status">
        <span>
          {status.detail ?? (
            <>
              New code was pulled from GitHub (<code>{status.shortSha}</code>) — refresh to see it.
            </>
          )}
        </span>
        <div className="update-banner-actions">
          <button type="button" className="update-banner-refresh" onClick={() => window.location.reload()}>
            Refresh
          </button>
          <button
            type="button"
            className="update-banner-dismiss"
            onClick={() => setDismissedKey(key)}
            aria-label="Dismiss"
          >
            ✕
          </button>
        </div>
      </div>
    );
  }

  if (status.phase === 'error') {
    return (
      <div className="update-banner is-error" role="status">
        <span>Auto-update failed: {status.detail ?? 'unknown error'}</span>
        <div className="update-banner-actions">
          <button
            type="button"
            className="update-banner-dismiss"
            onClick={() => setDismissedKey(key)}
            aria-label="Dismiss"
          >
            ✕
          </button>
        </div>
      </div>
    );
  }

  const processingLabel = PROCESSING_LABEL[status.phase];
  if (processingLabel) {
    return (
      <div className="update-banner is-processing" role="status">
        <span className="update-banner-spinner" />
        <span>{processingLabel}</span>
      </div>
    );
  }

  return null;
}
