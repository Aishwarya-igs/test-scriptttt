import type {
  AppliedSpotFix,
  AutoUpdateStatus,
  ChatReply,
  ChatTurn,
  Platform,
  ProjectsManifest,
  RcaResult,
  RerunScope,
  RunRecord,
  RunSummary,
  SpotFixApplied,
  SpotFixProposal,
  SpotFixReverted,
  TestCaseHistory,
} from './types';

async function request<T>(path: string, init?: RequestInit): Promise<T> {
  const res = await fetch(path, {
    headers: init?.body ? { 'Content-Type': 'application/json' } : undefined,
    ...init,
  });
  if (!res.ok) {
    const body = await res.json().catch(() => ({ error: res.statusText }));
    throw new Error(body.error || `Request failed: ${res.status}`);
  }
  if (res.status === 204) return undefined as T;
  return res.json();
}

export const api = {
  getProjects: () => request<ProjectsManifest>('/api/projects'),

  getAutoUpdateStatus: () => request<AutoUpdateStatus>('/api/auto-update/status'),

  getPlatforms: () => request<{ platforms: Platform[] }>('/api/platforms'),

  listRuns: (limit = 20, platform?: string) =>
    request<RunRecord[]>(`/api/runs?limit=${limit}${platform ? `&platform=${encodeURIComponent(platform)}` : ''}`),

  getRun: (runId: string) => request<RunRecord>(`/api/runs/${runId}`),

  startRun: (body: { env: string; project?: string; grep?: string }) =>
    request<{ runId: string }>('/api/runs', { method: 'POST', body: JSON.stringify(body) }),

  stopRun: (runId: string) => request<{ ok: true }>(`/api/runs/${runId}/stop`, { method: 'POST' }),

  // Kills only the currently-wedged module and continues with the rest of
  // the queue, instead of stopping the whole run.
  skipStalledModule: (runId: string) => request<{ ok: true }>(`/api/runs/${runId}/skip-stalled`, { method: 'POST' }),
  retryStalledModule: (runId: string) => request<{ ok: true }>(`/api/runs/${runId}/retry-stalled`, { method: 'POST' }),

  deleteRun: (runId: string) => request<{ ok: true }>(`/api/runs/${runId}`, { method: 'DELETE' }),

  /** Deletes finished runs, keeping the `keepLast` most recent. */
  clearRuns: (keepLast = 0) =>
    request<{ deleted: number; skipped: { runId: string; reason: string }[] }>('/api/runs/clear', {
      method: 'POST',
      body: JSON.stringify({ keepLast }),
    }),

  rerun: (runId: string, scope: RerunScope, target?: string) =>
    request<{ runId: string }>(`/api/runs/${runId}/rerun`, {
      method: 'POST',
      body: JSON.stringify({ scope, target }),
    }),

  analyzeTest: (runId: string, testId: string) =>
    request<RcaResult>(`/api/runs/${runId}/tests/${encodeURIComponent(testId)}/analyze`, { method: 'POST' }),

  // Read-only: every past run where this exact test case (matched by ticket
  // id, not file+line) showed up, with what RCA/spot-fix concluded each time.
  getTestCaseHistory: (runId: string, testId: string) =>
    request<TestCaseHistory>(`/api/runs/${runId}/tests/${encodeURIComponent(testId)}/history`),

  // Generates a proposal only; nothing is written until applySpotFix.
  proposeSpotFix: (runId: string, testId: string) =>
    request<SpotFixProposal>(`/api/runs/${runId}/tests/${encodeURIComponent(testId)}/spot-fix`, { method: 'POST' }),

  /**
   * With verify, the fix is rolled back automatically unless the rerun
   * passes. acknowledgeRisks is required when the proposal has a
   * high-severity risk (rewrites/removes an assertion, skips the test) — the
   * server refuses otherwise, since a rerun passing proves nothing for those.
   */
  applySpotFix: (runId: string, testId: string, rerun: boolean, verify = false, acknowledgeRisks = false) =>
    request<{ applied: SpotFixApplied; rerunRunId: string | null; verifying: boolean }>(
      `/api/runs/${runId}/tests/${encodeURIComponent(testId)}/spot-fix/apply`,
      { method: 'POST', body: JSON.stringify({ rerun, verify, acknowledgeRisks }) }
    ),

  revertSpotFix: (runId: string, testId: string) =>
    request<SpotFixReverted>(`/api/runs/${runId}/tests/${encodeURIComponent(testId)}/spot-fix/revert`, {
      method: 'POST',
    }),

  listAppliedSpotFixes: () => request<AppliedSpotFix[]>('/api/spot-fixes'),

  // Reverts by registry id rather than run/test, so undo works from the banner.
  revertAppliedSpotFix: (id: string) =>
    request<SpotFixReverted>(`/api/spot-fixes/${id}/revert`, { method: 'POST' }),

  rerunLastFailed: (env: string, project?: string) =>
    request<{ runId: string }>('/api/runs/last-failed/rerun', {
      method: 'POST',
      body: JSON.stringify({ env, project }),
    }),

  // (Re)generates the proactive summary — runs also get one automatically on
  // completion; this is for older runs or an explicit refresh.
  generateRunSummary: (runId: string) => request<RunSummary>(`/api/runs/${runId}/summary`, { method: 'POST' }),

  // Stateless on the server: prior turns are resent as `history` each call.
  askAboutHistory: (message: string, history: ChatTurn[] = []) =>
    request<ChatReply>('/api/chat', { method: 'POST', body: JSON.stringify({ message, history }) }),

  screenshotUrl: (path: string) => `/api/files/screenshot?path=${encodeURIComponent(path)}`,
  videoUrl: (path: string) => `/api/files/video?path=${encodeURIComponent(path)}`,

  // Points at the trace viewer the dashboard server hosts itself rather than
  // https://trace.playwright.dev. Keeping viewer and trace on one origin is
  // what makes this work at all — the hosted viewer is a public origin and
  // Chrome's Private Network Access blocks it from reading 127.0.0.1.
  traceViewerUrl: (path: string) => {
    const traceFileUrl = `${window.location.origin}/api/files/trace?path=${encodeURIComponent(path)}`;
    return `/trace-viewer/index.html?trace=${encodeURIComponent(traceFileUrl)}`;
  },
};
