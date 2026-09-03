import { useEffect, useState } from 'react';
import { Link } from 'react-router-dom';
import { api } from '../api/client';
import { useDashboardSocket } from '../api/useDashboardSocket';
import type { AppliedSpotFix } from '../api/types';

/**
 * Always-visible reminder of spot fixes sitting in the working tree, with undo.
 *
 * Two reasons this is app-level rather than part of the failure panel:
 * "Apply & rerun" navigates to a new run whose test record has no proposal
 * attached, so the per-test revert button is no longer on screen at the exact
 * moment it's wanted (the rerun failed, take the change back out). And these
 * are real uncommitted edits to a repo the whole team pulls — the risk worth
 * designing against is forgetting one and committing it.
 */
export function AppliedFixesBanner() {
  const [fixes, setFixes] = useState<AppliedSpotFix[]>([]);
  const [reverting, setReverting] = useState<string | null>(null);
  const [error, setError] = useState<string | null>(null);
  const [expanded, setExpanded] = useState(false);

  // The socket pushes the list on connect and after every apply/revert; this
  // fetch covers a mount that happens while the socket is between retries.
  useEffect(() => {
    api.listAppliedSpotFixes().then(setFixes).catch(() => setFixes([]));
  }, []);

  useDashboardSocket((msg) => {
    if (msg.type === 'spot-fixes-applied') setFixes(msg.fixes);
  });

  async function handleRevert(id: string) {
    setReverting(id);
    setError(null);
    try {
      await api.revertAppliedSpotFix(id);
      // The socket broadcast refreshes the list; drop it locally too so the
      // row disappears immediately even if the socket is reconnecting.
      setFixes((prev) => prev.filter((f) => f.id !== id));
    } catch (err) {
      setError(err instanceof Error ? err.message : 'Could not revert that spot fix');
    } finally {
      setReverting(null);
    }
  }

  if (!fixes.length) return null;

  return (
    <div className="applied-fixes-banner" role="status">
      <div className="applied-fixes-summary">
        <span>
          <strong>
            {fixes.length} spot {fixes.length === 1 ? 'fix is' : 'fixes are'} applied
          </strong>{' '}
          to your working tree — review before committing.
        </span>
        <button type="button" className="link-button" onClick={() => setExpanded((v) => !v)}>
          {expanded ? 'Hide' : 'Show'}
        </button>
      </div>

      {expanded && (
        <ul className="applied-fixes-list">
          {fixes.map((fix) => (
            <li key={fix.id}>
              <div className="applied-fixes-item-text">
                <code>{fix.files.join(', ')}</code>
                <span className="muted">
                  {fix.testTitle ? `${fix.testTitle} · ` : ''}
                  <Link to={`/runs/${fix.runId}`}>view run</Link>
                </span>
              </div>
              <button
                type="button"
                className="secondary-button"
                onClick={() => handleRevert(fix.id)}
                disabled={reverting !== null}
              >
                {reverting === fix.id ? 'Reverting…' : 'Undo'}
              </button>
            </li>
          ))}
        </ul>
      )}

      {error && <div className="applied-fixes-error">{error}</div>}
    </div>
  );
}
