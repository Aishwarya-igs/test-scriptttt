import { useCallback, useEffect, useRef, useState } from 'react';
import { Link, useNavigate, useParams } from 'react-router-dom';
import { api } from '../api/client';
import { useDashboardSocket } from '../api/useDashboardSocket';
import type { RunRecord } from '../api/types';
import { StatusBadge } from '../components/StatusBadge';
import { RunSummaryCharts } from '../components/RunSummaryCharts';
import { RunSummaryCard } from '../components/RunSummaryCard';
import { TestTable } from '../components/TestTable';
import { CopyButton } from '../components/CopyButton';
import { Confetti } from '../components/Confetti';
import { ExportButtons } from '../components/ExportButtons';
import { formatDuration, runDuration } from '../utils/runStats';
import { exportRunCSV, exportRunPDF } from '../utils/export';

const ACTIVE_STATUSES = new Set(['queued', 'running']);
const FAILURE_STATUSES = new Set(['failed', 'timedOut', 'interrupted']);
const DEFAULT_TITLE = 'TFC Playwright Dashboard';

interface ActivityItem {
  id: string;
  time: string;
  title: string;
  kind: 'begin' | 'pass' | 'fail' | 'skip';
}

function eventKind(status: string): ActivityItem['kind'] {
  if (status === 'passed') return 'pass';
  if (status === 'skipped') return 'skip';
  return 'fail';
}

export function RunDetailPage() {
  const { runId } = useParams<{ runId: string }>();
  const [run, setRun] = useState<RunRecord | null>(null);
  const [busy, setBusy] = useState(false);
  const [celebrate, setCelebrate] = useState(false);
  const [activity, setActivity] = useState<ActivityItem[]>([]);
  // Tests currently being rerun in place (via "Rerun test"/"Rerun file"),
  // tracked client-side so the row can say "Rerunning…" immediately rather
  // than waiting for the background rerun's first event. Cleared once the
  // server writes the result back onto this run (test-rerun-result) or the
  // kickoff itself fails.
  const [pendingRerunIds, setPendingRerunIds] = useState<Set<string>>(new Set());
  const prevStatusRef = useRef<string | null>(null);
  const navigate = useNavigate();

  const refetch = useCallback(() => {
    if (!runId) return;
    api.getRun(runId).then(setRun).catch(() => {});
  }, [runId]);

  useEffect(() => {
    refetch();
  }, [refetch]);

  useEffect(() => {
    setActivity([]);
    prevStatusRef.current = null;
  }, [runId]);

  useEffect(() => () => {
    document.title = DEFAULT_TITLE;
  }, []);

  useDashboardSocket((msg) => {
    if (!runId || !('runId' in msg) || msg.runId !== runId) return;
    if (msg.type === 'run-event' && (msg.event === 'test-begin' || msg.event === 'test-end')) {
      const payload = msg.payload as { testId: string; title: string; status?: string };
      const kind: ActivityItem['kind'] = msg.event === 'test-begin' ? 'begin' : eventKind(payload.status ?? 'failed');
      setActivity((prev) =>
        [{ id: `${payload.testId}-${msg.event}-${Date.now()}`, time: new Date().toLocaleTimeString(), title: payload.title, kind }, ...prev].slice(0, 40),
      );
    }
    if (msg.type === 'run-event' && msg.event === 'test-rerun-result') {
      const payload = msg.payload as { testIds: string[] };
      setPendingRerunIds((prev) => {
        const next = new Set(prev);
        for (const id of payload.testIds) next.delete(id);
        return next;
      });
    }
    refetch();
  });

  useEffect(() => {
    if (!run) return;
    const totalKnown = run.stats.total || Object.keys(run.tests).length;
    const icon = run.status === 'passed' ? '✅' : run.status === 'failed' ? '❌' : ACTIVE_STATUSES.has(run.status) ? '●' : run.status === 'stopped' ? '■' : '';
    document.title = `${icon ? `${icon} ` : ''}${run.stats.passed}/${totalKnown} · TFC Dashboard`;
  }, [run]);

  useEffect(() => {
    if (!run) return;
    const prev = prevStatusRef.current;
    if (prev && prev !== run.status && run.status === 'passed' && run.stats.failed === 0 && run.stats.total > 0) {
      setCelebrate(true);
      const timer = setTimeout(() => setCelebrate(false), 2600);
      return () => clearTimeout(timer);
    }
    prevStatusRef.current = run.status;
  }, [run]);

  if (!run) {
    return (
      <div className="run-detail page-fade">
        <div className="skeleton skeleton-block" style={{ height: 90 }} />
        <div className="skeleton skeleton-block" style={{ height: 200 }} />
      </div>
    );
  }

  const isActive = ACTIVE_STATUSES.has(run.status);
  const tests = Object.values(run.tests);
  const runningJob = run.jobs.find((j) => j.status === 'running');
  // Projects whose job was killed mid-way (stall skip, or Stop). "Rerun
  // project" only ever targets tests already recorded as failed in THIS
  // run — everything after the point it got killed never started, so it
  // has no record at all and that button can never reach it. Only a fresh
  // full run of the project covers that gap; see handleRerunModule.
  const stalledProjects = new Set(run.jobs.filter((j) => j.status === 'stalled' && j.project).map((j) => j.project as string));
  // Which specific file(s) stalled per project, purely for a more useful
  // tooltip — a module can now have several independent file-level jobs
  // (see runManager._specFileJobSpecs), so "this module is incomplete"
  // alone no longer says which file(s) actually caused it.
  const stalledFilesByProject = new Map<string, string[]>();
  for (const job of run.jobs) {
    if (job.status !== 'stalled' || !job.project || !job.file) continue;
    if (!stalledFilesByProject.has(job.project)) stalledFilesByProject.set(job.project, []);
    stalledFilesByProject.get(job.project)!.push(job.file);
  }
  const total = run.stats.total || tests.length || 1;
  const progressPct = Math.round(((run.stats.passed + run.stats.failed + run.stats.skipped) / total) * 100);
  const duration = runDuration(run);

  async function handleStop() {
    setBusy(true);
    try {
      await api.stopRun(run!.runId);
      refetch();
    } finally {
      setBusy(false);
    }
  }

  async function handleSkipStalled() {
    setBusy(true);
    try {
      await api.skipStalledModule(run!.runId);
    } catch (err) {
      // The most common cause here isn't a real failure: the module this
      // button was offered for finished (or the queue moved on to the next
      // one) in the gap between it rendering and the click landing on the
      // server — a live run changes faster than a button can go stale-check
      // itself. Refetching either way means the button/badge correct
      // themselves immediately instead of staying wrong until the next
      // unrelated event happens to refresh the page.
      alert(
        err instanceof Error
          ? `${err.message} (it likely moved on right as you clicked — refreshing the page now)`
          : 'Could not skip the stuck module'
      );
    } finally {
      refetch();
      setBusy(false);
    }
  }

  // Kills the wedged file and immediately retries just that file in the
  // background, merging the result back onto THIS run once it finishes —
  // the recovery path for "I'm running hundreds of cases end to end and want
  // one complete report" instead of "skip and separately start a whole new
  // run". See runManager.retryStalledJob. Same error handling as
  // handleSkipStalled, for the same reason (the target can move on between
  // render and click on a live run).
  async function handleRetryStalled() {
    setBusy(true);
    try {
      await api.retryStalledModule(run!.runId);
    } catch (err) {
      alert(
        err instanceof Error
          ? `${err.message} (it likely moved on right as you clicked — refreshing the page now)`
          : 'Could not retry the stuck file'
      );
    } finally {
      refetch();
      setBusy(false);
    }
  }

  // Distinct from the auto-detected stalled banner above: that one only
  // appears after ~10+ minutes of silence (the stall threshold, plus up to a
  // minute for the next check), which leaves a real gap where a test IS
  // visibly stuck to someone watching but the dashboard hasn't caught up yet
  // — and there was no way to act during that gap. This lets a human call it
  // early, with a confirmation since (unlike the auto-detected case) nothing
  // has actually confirmed this module is stuck rather than just slow.
  async function handleManualSkip() {
    if (!window.confirm('Skip the current module and continue with the rest of the run? Only do this if it genuinely looks stuck — a module that is just slow will be abandoned too.')) return;
    await handleSkipStalled();
  }

  async function handleManualRetry() {
    if (
      !window.confirm(
        'Kill the stuck file and immediately retry it, merging the result back into this run? Only do this if it genuinely looks stuck — a file that is just slow will be interrupted too.'
      )
    )
      return;
    await handleRetryStalled();
  }

  async function handleRerun(scope: 'test' | 'file' | 'project' | 'all-failed', target?: string) {
    // 'test'/'file' are meant for working through failures one at a time —
    // navigating away to the new run's page would hide every other failure
    // you were looking at. These stay on this page instead: the affected
    // row(s) show "Rerunning…" immediately, and update to the real result
    // once the background rerun finishes and reports back (see
    // runManager._resolvePendingManualRerun + the test-rerun-result handler
    // above). 'project'/'all-failed' still navigate — those cover enough
    // tests that viewing them as their own run is the more useful result.
    if (scope === 'test' || scope === 'file') {
      const affectedIds =
        scope === 'test'
          ? [target!]
          : tests.filter((t) => t.file === target && FAILURE_STATUSES.has(t.status)).map((t) => t.testId);
      setPendingRerunIds((prev) => new Set([...prev, ...affectedIds]));
      try {
        await api.rerun(run!.runId, scope, target);
        refetch();
      } catch (err) {
        setPendingRerunIds((prev) => {
          const next = new Set(prev);
          for (const id of affectedIds) next.delete(id);
          return next;
        });
        alert(err instanceof Error ? err.message : 'Rerun failed');
      }
      return;
    }

    setBusy(true);
    try {
      const { runId: newRunId } = await api.rerun(run!.runId, scope, target);
      navigate(`/runs/${newRunId}`);
    } catch (err) {
      alert(err instanceof Error ? err.message : 'Rerun failed');
    } finally {
      setBusy(false);
    }
  }

  // A completely fresh run of one project, not filtered to prior failures —
  // the only way to actually cover a module that got killed mid-file, since
  // "Rerun project" can't reach tests that never started in the first place
  // (see stalledProjects above). Navigates away like the New Run flow does,
  // since this is a genuinely new run rather than a targeted retry of this one.
  async function handleRerunModule(project: string) {
    setBusy(true);
    try {
      const { runId: newRunId } = await api.startRun({ env: run!.trigger.env, project });
      navigate(`/runs/${newRunId}`);
    } catch (err) {
      alert(err instanceof Error ? err.message : 'Could not start the module rerun');
    } finally {
      setBusy(false);
    }
  }

  return (
    <div className="run-detail page-fade">
      {celebrate && <Confetti />}

      {isActive && run.stalledSince && (
        <div className="stalled-banner" role="alert">
          <div>
            <strong>This run looks stuck.</strong> No test has reported since{' '}
            {new Date(run.stalledSince).toLocaleTimeString()}. The usual cause is the browser under test dying, which
            leaves Playwright waiting on it forever — it will not recover on its own. Skip just the stuck module to
            keep going with the rest, or stop the whole run.
          </div>
          <div className="stalled-banner-actions">
            <button className="primary-button" onClick={handleRetryStalled} disabled={busy}>
              {busy ? 'Working…' : 'Retry stuck file & continue'}
            </button>
            <button className="secondary-button" onClick={handleSkipStalled} disabled={busy}>
              {busy ? 'Working…' : 'Skip without retrying'}
            </button>
            <button className="danger-button" onClick={handleStop} disabled={busy}>
              {busy ? 'Stopping…' : 'Stop run'}
            </button>
          </div>
        </div>
      )}

      {isActive && run.retryingFile && (
        <div className="stalled-banner stalled-banner-info" role="status">
          <div>
            <strong>Retrying the file that stalled:</strong> {run.retryingFile.split(/[\\/]/).pop()}. The rest of the
            run kept going in the meantime — this file's results will merge back in once the retry finishes.
          </div>
        </div>
      )}

      <div className={`run-detail-header card${run.status === 'failed' ? ' header-alert' : ''}`}>
        <div>
          <Link to="/runs" className="muted">
            ← All runs
          </Link>
          <h2>
            {run.trigger.project ?? 'All projects'} · {run.trigger.env}
          </h2>
          <div className="run-detail-meta">
            <StatusBadge status={run.status} />
            <span className="muted tabular-nums">{formatDuration(duration)}</span>
            <CopyButton value={run.runId} label={`ID ${run.runId.slice(0, 8)}…`} />
          </div>
        </div>
        <div className="run-detail-actions">
          <ExportButtons onExportPDF={() => exportRunPDF(run)} onExportCSV={() => exportRunCSV(run)} />
          {isActive && (
            <button className="danger-button" onClick={handleStop} disabled={busy}>
              Stop run
            </button>
          )}
          {!isActive && run.stats.failed > 0 && (
            <button className="primary-button" onClick={() => handleRerun('all-failed')} disabled={busy}>
              Rerun all failed
            </button>
          )}
        </div>
      </div>

      {!isActive && <RunSummaryCard run={run} onUpdated={refetch} />}

      {isActive && (
        <div className="card progress-card">
          <div className="progress-bar">
            <div className="progress-fill" style={{ width: `${progressPct}%` }} />
          </div>
          <span className="muted tabular-nums">
            {run.stats.passed + run.stats.failed + run.stats.skipped} / {total} tests · {run.stats.running} running
          </span>
        </div>
      )}

      {isActive && activity.length > 0 && (
        <div className="card activity-feed">
          <h3>Live activity</h3>
          <ul>
            {activity.map((a) => (
              <li key={a.id} className={`activity-item kind-${a.kind}`}>
                <span className="activity-time muted tabular-nums">{a.time}</span>
                <span className="activity-icon">{a.kind === 'begin' ? '▸' : a.kind === 'pass' ? '✓' : a.kind === 'skip' ? '–' : '✕'}</span>
                <span className="activity-title">{a.title}</span>
              </li>
            ))}
          </ul>
        </div>
      )}

      <RunSummaryCharts stats={run.stats} tests={tests} />

      <TestTable
        tests={tests}
        runId={run.runId}
        onRerunTest={(testId) => handleRerun('test', testId)}
        onRerunFile={(file) => handleRerun('file', file)}
        onRerunProject={(project) => handleRerun('project', project)}
        runningProject={runningJob?.project ?? null}
        runningFile={runningJob?.file ?? null}
        canSkipStalled={isActive && !run.stalledSince}
        skipBusy={busy}
        onSkipStalled={handleManualSkip}
        onRetryStalled={handleManualRetry}
        retryingFile={run.retryingFile ?? null}
        pendingRerunIds={pendingRerunIds}
        stalledProjects={stalledProjects}
        stalledFilesByProject={stalledFilesByProject}
        onRerunModule={handleRerunModule}
      />
    </div>
  );
}
