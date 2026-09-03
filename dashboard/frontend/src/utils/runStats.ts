import type { RunRecord } from '../api/types';

const FAILURE_STATUSES = new Set(['failed', 'timedOut', 'interrupted']);

export function relativeTime(iso: string) {
  const diffMs = Date.now() - new Date(iso).getTime();
  const mins = Math.round(diffMs / 60000);
  if (mins < 1) return 'just now';
  if (mins < 60) return `${mins}m ago`;
  const hours = Math.round(mins / 60);
  if (hours < 24) return `${hours}h ago`;
  return `${Math.round(hours / 24)}d ago`;
}

/** Wall-clock span of a run: earliest job start to latest job end (or now, if still running). */
export function runDuration(run: RunRecord): number | null {
  const starts = run.jobs.map((j) => new Date(j.startedAt).getTime()).filter((n) => !Number.isNaN(n));
  if (starts.length === 0) return null;
  const ends = run.jobs.filter((j) => j.finishedAt).map((j) => new Date(j.finishedAt as string).getTime());
  const start = Math.min(...starts);
  const end = ends.length === run.jobs.length ? Math.max(...ends) : Date.now();
  return Math.max(0, end - start);
}

export function formatDuration(ms: number | null): string {
  if (ms == null) return '–';
  const totalSeconds = Math.round(ms / 1000);
  if (totalSeconds < 60) return `${totalSeconds}s`;
  const minutes = Math.floor(totalSeconds / 60);
  const seconds = totalSeconds % 60;
  if (minutes < 60) return `${minutes}m ${seconds}s`;
  const hours = Math.floor(minutes / 60);
  return `${hours}h ${minutes % 60}m`;
}

export interface TestHistoryEntry {
  key: string;
  title: string;
  file: string;
  project: string | null;
  passCount: number;
  failCount: number;
  totalSeen: number;
}

/** Groups every non-running test occurrence across a set of runs by file+title. */
export function aggregateTestHistory(runs: RunRecord[]): Map<string, TestHistoryEntry> {
  const map = new Map<string, TestHistoryEntry>();
  for (const run of runs) {
    for (const t of Object.values(run.tests)) {
      if (t.status === 'running') continue;
      const key = `${t.file}::${t.title}`;
      let entry = map.get(key);
      if (!entry) {
        entry = { key, title: t.title, file: t.file, project: t.project, passCount: 0, failCount: 0, totalSeen: 0 };
        map.set(key, entry);
      }
      entry.totalSeen += 1;
      if (t.status === 'passed') entry.passCount += 1;
      else if (FAILURE_STATUSES.has(t.status)) entry.failCount += 1;
    }
  }
  return map;
}

/** Tests that have both passed and failed at least once across recent runs. */
export function findFlakyTests(runs: RunRecord[], limit = 6): TestHistoryEntry[] {
  const map = aggregateTestHistory(runs);
  return [...map.values()]
    .filter((t) => t.passCount > 0 && t.failCount > 0)
    .sort((a, b) => b.failCount - a.failCount || b.totalSeen - a.totalSeen)
    .slice(0, limit);
}

/** Tests with the most failures across recent runs, flaky or not. */
export function findTopFailing(runs: RunRecord[], limit = 6): TestHistoryEntry[] {
  const map = aggregateTestHistory(runs);
  return [...map.values()]
    .filter((t) => t.failCount > 0)
    .sort((a, b) => b.failCount - a.failCount)
    .slice(0, limit);
}
