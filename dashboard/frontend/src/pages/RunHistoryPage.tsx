import { useCallback, useEffect, useMemo, useRef, useState } from 'react';
import { api } from '../api/client';
import { useDashboardSocket } from '../api/useDashboardSocket';
import type { RunRecord, RunStatus } from '../api/types';
import { RunCard } from '../components/RunCard';
import { ExportButtons } from '../components/ExportButtons';
import { exportRunsCSV } from '../utils/export';

const STATUS_FILTERS = ['all', 'running', 'passed', 'failed', 'stopped'] as const;
type StatusFilter = (typeof STATUS_FILTERS)[number];

function matchesStatus(status: RunStatus, filter: StatusFilter) {
  if (filter === 'all') return true;
  if (filter === 'running') return status === 'running' || status === 'queued';
  return status === filter;
}

/**
 * The record of everything that has already run, across every platform.
 * Starting a run is deliberately NOT here — that belongs to a single platform
 * and lives on its page, so this page never has to imply which suite a new run
 * would go to.
 */
export function RunHistoryPage() {
  const [runs, setRuns] = useState<RunRecord[]>([]);
  const [search, setSearch] = useState('');
  const [statusFilter, setStatusFilter] = useState<StatusFilter>('all');
  const [confirmingClear, setConfirmingClear] = useState(false);
  const [clearing, setClearing] = useState(false);
  const [clearResult, setClearResult] = useState<string | null>(null);
  const searchRef = useRef<HTMLInputElement>(null);

  const refetchRuns = useCallback(() => {
    api.listRuns(50).then(setRuns).catch(() => {});
  }, []);

  useEffect(() => {
    refetchRuns();
  }, [refetchRuns]);

  useDashboardSocket((msg) => {
    if (msg.type === 'snapshot') setRuns(msg.runs);
    else if (msg.type === 'run-status' || msg.type === 'job-status') refetchRuns();
  });

  useEffect(() => {
    function handleKey(e: KeyboardEvent) {
      const tag = (document.activeElement?.tagName ?? '').toLowerCase();
      if (e.key === '/' && tag !== 'input' && tag !== 'textarea') {
        e.preventDefault();
        searchRef.current?.focus();
      } else if (e.key === 'Escape' && document.activeElement === searchRef.current) {
        searchRef.current?.blur();
      }
    }
    window.addEventListener('keydown', handleKey);
    return () => window.removeEventListener('keydown', handleKey);
  }, []);

  const filtered = useMemo(() => {
    return runs.filter((r) => {
      if (!matchesStatus(r.status, statusFilter)) return false;
      if (search) {
        const haystack = `${r.trigger.project ?? 'all projects'} ${r.trigger.env} ${r.trigger.grep ?? ''} ${r.trigger.type}`.toLowerCase();
        if (!haystack.includes(search.toLowerCase())) return false;
      }
      return true;
    });
  }, [runs, search, statusFilter]);

  async function handleClear(keepLast: number) {
    setClearing(true);
    setClearResult(null);
    try {
      const { deleted, skipped } = await api.clearRuns(keepLast);
      // Anything protected is reported rather than silently left behind.
      const kept = skipped.length ? ` ${skipped.length} kept (${[...new Set(skipped.map((s) => s.reason))].join('; ')}).` : '';
      setClearResult(`Deleted ${deleted} run${deleted === 1 ? '' : 's'}.${kept}`);
      setConfirmingClear(false);
      refetchRuns();
    } catch (err) {
      setClearResult(err instanceof Error ? err.message : 'Could not clear run history');
    } finally {
      setClearing(false);
    }
  }

  async function handleDeleteRun(runId: string) {
    setClearResult(null);
    try {
      await api.deleteRun(runId);
      setRuns((prev) => prev.filter((r) => r.runId !== runId));
    } catch (err) {
      setClearResult(err instanceof Error ? err.message : 'Could not delete that run');
    }
  }

  return (
    <div className="run-history page-fade">
      <div className="page-heading">
        <h2>Run history</h2>
        <p className="muted">Every run so far, across all platforms. Start a new one from its platform page.</p>
      </div>

      <div className="card run-list">
        <div className="table-toolbar">
          <h3>All runs</h3>
          <input
            ref={searchRef}
            type="search"
            placeholder="Search runs… ( / )"
            value={search}
            onChange={(e) => setSearch(e.target.value)}
            className="table-search"
          />
          <div className="filter-pills" role="tablist" aria-label="Filter by status">
            {STATUS_FILTERS.map((f) => (
              <button
                key={f}
                className={`filter-pill${statusFilter === f ? ' active' : ''}`}
                onClick={() => setStatusFilter(f)}
              >
                {f === 'all' ? 'All' : f[0].toUpperCase() + f.slice(1)}
              </button>
            ))}
          </div>
          <ExportButtons onExportCSV={() => exportRunsCSV(filtered)} disabled={filtered.length === 0} />
          <button
            type="button"
            className="secondary-button"
            onClick={() => setConfirmingClear((v) => !v)}
            disabled={runs.length === 0}
          >
            Clear history…
          </button>
        </div>

        {confirmingClear && (
          <div className="clear-history-confirm">
            <div>
              <strong>Delete past runs?</strong> This removes their results and reports from the dashboard permanently.
              Active runs, and any run holding a spot fix that's still applied to your working tree, are kept. Your
              test files and <code>test-results/</code> are not touched.
            </div>
            <div className="clear-history-actions">
              <button className="danger-button" onClick={() => handleClear(0)} disabled={clearing}>
                {clearing ? 'Clearing…' : 'Delete all finished runs'}
              </button>
              <button className="secondary-button" onClick={() => handleClear(10)} disabled={clearing}>
                Keep 10 most recent
              </button>
              <button className="link-button" onClick={() => setConfirmingClear(false)} disabled={clearing}>
                Cancel
              </button>
            </div>
          </div>
        )}

        {clearResult && <div className="clear-history-result muted">{clearResult}</div>}

        {runs.length === 0 ? (
          <p className="muted">No runs yet — start one from a platform page.</p>
        ) : filtered.length === 0 ? (
          <p className="muted">No runs match this filter.</p>
        ) : (
          <div className="run-card-grid">
            {filtered.map((run) => (
              <RunCard run={run} key={run.runId} onDelete={handleDeleteRun} />
            ))}
          </div>
        )}
      </div>
    </div>
  );
}
