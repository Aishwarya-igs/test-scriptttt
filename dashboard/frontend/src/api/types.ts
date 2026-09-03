export type TestStatus = 'running' | 'passed' | 'failed' | 'skipped' | 'timedOut' | 'interrupted';
export type RunStatus = 'queued' | 'running' | 'passed' | 'failed' | 'stopped';
// 'stalled' means the job was killed for going silent past the stall
// threshold rather than finishing on its own (see runManager.skipStalledJob)
// — the queue still moved on to the next module, but this one's own results
// are incomplete/unknown, distinct from a normal 'failed' exit.
export type JobStatus = 'queued' | 'running' | 'passed' | 'failed' | 'stopped' | 'stalled';

export interface TestAttachment {
  name: string;
  contentType: string;
  path: string | null;
}

export interface TestError {
  message: string;
  stack?: string;
}

/** What kind of problem the failure is. Only 'code' can have a spot fix. */
export type FailureCategory = 'code' | 'environment' | 'infrastructure' | 'unknown';

export interface RcaResult {
  ruleId?: string;
  source: 'heuristic' | 'ollama' | 'api';
  category: FailureCategory;
  model?: string;
  summary: string;
  rootCause: string;
  suggestedFix: string;
  note?: string;
  generatedAt: string;
  errorContextFile: string | null;
}

export interface DiffRow {
  type: 'context' | 'add' | 'remove';
  text: string;
}

/**
 * A change that would make the test pass without fixing the cause.
 * 'high' means it defeats the test's purpose outright (assertion rewritten,
 * removed, or the test skipped) — applying it requires explicit
 * acknowledgement, and a passing verification rerun does not vouch for it
 * (an edit like this is reverse-engineered to pass by construction).
 */
export interface SpotFixRisk {
  id: string;
  label: string;
  detail: string;
  severity?: 'high' | 'low';
}

/** One selector's outcome from a live-runtime check (see dashboard/lib/spotfix/liveProbe.js). */
export interface SpotFixSelectorCheck {
  selector: string;
  count: number | null;
  error: string | null;
}

/**
 * Present only on an edit that changes a `selector:` value AND a DOM
 * snapshot with a URL was captured for this failure — the model's proposed
 * replacement (and, for comparison, the value it's replacing) actually
 * checked against the live app via a headless browser, not just guessed
 * from text. Unauthenticated, so not conclusive on its own — see the
 * 'live-selector-no-match' risk this can produce.
 */
export interface SpotFixLiveProbe {
  landedUrl: string;
  checkedAt: string;
  old: SpotFixSelectorCheck[];
  new: SpotFixSelectorCheck[];
}

export interface SpotFixEdit {
  file: string;
  absolutePath: string;
  oldCode: string;
  newCode: string;
  reason: string;
  diff: DiffRow[];
  risks: SpotFixRisk[];
  liveProbe?: SpotFixLiveProbe | null;
  /**
   * Present when a locator line in this edit didn't byte-match the file as
   * the model wrote it (typically copied from the compact catalog rendering
   * rather than the real source) and was deterministically corrected to the
   * file's actual text — see lib/spotfix/locatorRecovery.js. Never changes
   * what the fix does, only its formatting; shown so that correction is
   * never silent.
   */
  recovered?: { name: string; from: string; to: string }[];
}

export interface SpotFixApplied {
  appliedAt: string;
  files: { file: string; absolutePath: string }[];
  /** Id in the server-side applied-fix registry; used to revert from anywhere. */
  registryId?: string;
}

/**
 * A spot fix currently sitting in the working tree. Tracked independently of
 * runs so it stays revertable after "Apply & rerun" moves you to a new run.
 */
export interface AppliedSpotFix {
  id: string;
  runId: string;
  testId: string;
  testTitle: string;
  appliedAt: string;
  files: string[];
}

/**
 * Outcome of a provisional apply. 'pending' while the verification rerun is in
 * flight; 'failed' means the fix did not turn the test green and was rolled
 * back automatically.
 *
 * 'inconclusive' is the case a green rerun cannot settle: the test passed, but
 * the edit's own evidence says the change could not be the reason (a locator
 * that matches nothing, an assertion rewritten to fit). The fix stays applied
 * and the reason is listed in `unvalidatable` — see unvalidatableRisks in
 * dashboard/lib/spotfix/risk.js.
 */
export interface SpotFixVerification {
  status: 'pending' | 'passed' | 'failed' | 'inconclusive';
  rerunRunId?: string;
  detail?: string;
  checkedAt?: string;
  unvalidatable?: { id: string; label: string; why: string }[];
}

/**
 * One check the pipeline ran on a proposal. 'unknown' is deliberately distinct
 * from 'pass': a check that could not run is not evidence in the fix's favour,
 * and collapsing the two is what once made an unexamined proposal look clean.
 */
export interface SpotFixEvidenceCheck {
  id: string;
  label: string;
  status: 'pass' | 'fail' | 'unknown' | 'not-applicable';
  detail: string;
}

export interface SpotFixEvidence {
  strength: 'well-evidenced' | 'partially-checked' | 'contradicted';
  summary: string;
  counts: { pass: number; fail: number; unknown: number; notApplicable: number };
  checks: SpotFixEvidenceCheck[];
}

export interface SpotFixReverted {
  revertedAt: string;
  reverted: string[];
  skipped: string[];
}

/**
 * Present only when the proposal was escalated to multiple independent
 * providers — a real, measured signal (N of M independently-generated,
 * independently grounding-checked candidates agreeing) rather than one
 * model's self-reported confidence. `models` names whichever ones back the
 * returned edit; `allModelsAsked` is everyone consulted, so a disagreement
 * shows who was overruled too.
 */
export interface SpotFixConsensus {
  agreeing: number;
  total: number;
  disagreed: boolean;
  models: string[];
  allModelsAsked: string[];
}

/**
 * One past occurrence of this exact test CASE (matched across runs by its
 * stable ticket-id identity, e.g. "IW3-T2047" — not file+line, which breaks
 * across refactors) — see dashboard/lib/testCaseIdentity.js.
 */
export interface TestCaseHistoryEntry {
  runId: string;
  createdAt: string;
  testId: string;
  status: TestStatus;
  rca: { category: FailureCategory; summary: string; generatedAt: string } | null;
  spotFix: {
    confidence: 'high' | 'medium' | 'low';
    explanation: string;
    /** Currently applied right now — not "was ever applied"; see `reverted`. */
    applied: boolean;
    verification: 'pending' | 'passed' | 'failed' | 'inconclusive' | null;
    reverted: boolean;
    generatedAt: string;
  } | null;
}

export interface TestCaseHistory {
  key: string;
  history: TestCaseHistoryEntry[];
}

/**
 * A proposed source edit awaiting human approval. `available: false` means no
 * fix is being offered — `reason` says why (not a code issue, no AI provider,
 * nothing verifiable), and is the normal case rather than an error.
 */
export interface SpotFixProposal {
  available: boolean;
  reason?: string;
  proposalId?: string;
  explanation?: string;
  confidence?: 'high' | 'medium' | 'low';
  model?: string;
  provider?: string;
  edits: SpotFixEdit[];
  rejected?: string[];
  generatedAt?: string;
  applied?: SpotFixApplied | null;
  reverted?: SpotFixReverted | null;
  verification?: SpotFixVerification | null;
  consensus?: SpotFixConsensus | null;
  /** Audit trail of every check run on this proposal — see lib/spotfix/evidence.js. */
  evidence?: SpotFixEvidence | null;
}

/**
 * Outcome of a plain "Rerun test"/"Rerun file" triggered from this test's own
 * row. Lets the row show what happened without navigating to the rerun's own
 * page — see runManager._resolvePendingManualRerun.
 */
export interface LastRerun {
  status: TestStatus | 'unknown';
  runId: string;
  checkedAt: string;
}

export interface TestRecord {
  testId: string;
  title: string;
  titlePath: string[];
  project: string | null;
  file: string;
  line: number;
  retry: number;
  status: TestStatus;
  duration: number | null;
  error: TestError | null;
  attachments: TestAttachment[];
  rca?: RcaResult | null;
  spotFix?: SpotFixProposal | null;
  lastRerun?: LastRerun | null;
}

export interface JobRecord {
  jobId: string;
  project: string | null;
  /** The one spec file this job covers, when the run was split down to file
   * granularity (see runManager._specFileJobSpecs) — null for the
   * whole-project fallback shape. */
  file: string | null;
  pid: number | null;
  status: JobStatus;
  startedAt: string;
  finishedAt: string | null;
}

export interface RunTrigger {
  type: 'manual' | 'rerun' | 'last-failed';
  env: string;
  project: string | null;
  grep: string | null;
  sourceRunId: string | null;
  scope?: string;
  target?: string | null;
}

export interface RunStats {
  total: number;
  passed: number;
  failed: number;
  skipped: number;
  running: number;
}

/** Proactive plain-English summary of one run's results, generated automatically on completion. */
export interface RunSummary {
  text: string;
  model: string;
  generatedAt: string;
}

/**
 * A platform whose suite this dashboard can show runs for — see
 * dashboard/lib/platforms.js and dashboard/config/platforms.json.
 *
 * `configured` is deliberately separate from merely existing in the list: a
 * platform can be declared (so it gets a nav entry and a page) while having
 * no repo pointed at it yet. The page needs that distinction to say "nothing
 * is wired up here" instead of the indistinguishable-looking "no runs yet".
 */
export interface Platform {
  id: string;
  label: string;
  icon: string;
  description: string;
  /** Absolute path to the suite's checkout, or null when not yet pointed anywhere. */
  repoRoot: string | null;
  /** True only when `repoRoot` is set AND that directory actually exists. */
  configured: boolean;
  /**
   * True when the server can actually start a run for this platform. Narrower
   * than `configured` — the runner is not platform-aware yet, so today only
   * the default platform can offer a Start-run form.
   */
  canRun: boolean;
}

export interface RunRecord {
  runId: string;
  createdAt: string;
  /**
   * Which platform's suite produced this run. Absent on runs recorded before
   * the platform registry existed — those are all web (see platformOfRun).
   */
  platform?: string;
  trigger: RunTrigger;
  jobs: JobRecord[];
  status: RunStatus;
  stats: RunStats;
  tests: Record<string, TestRecord>;
  /**
   * Set when a still-'running' run has stopped emitting reporter events for
   * longer than the stall threshold — i.e. it is wedged and will not recover.
   * Cleared if events resume.
   */
  stalledSince?: string | null;
  /**
   * Set while a background retry of one stalled file (see
   * runManager.retryStalledJob) is in flight, so the UI can show
   * "Retrying <file>…" instead of the "incomplete" badge. Cleared once that
   * retry's results are merged back onto this run.
   */
  retryingFile?: string | null;
  aiSummary?: RunSummary | null;
}

export interface ChatTurn {
  role: 'user' | 'assistant';
  content: string;
}

export interface ChatReply {
  reply: string;
  model: string;
  generatedAt: string;
}

export interface ProjectsManifest {
  environments: { value: string; label: string }[];
  projects: { name: string; label: string; specs: string[] }[];
  tags: { value: string; label: string }[];
}

export type RerunScope = 'test' | 'file' | 'project' | 'all-failed';

export type AutoUpdatePhase =
  | 'idle'
  | 'checking'
  | 'pulling'
  | 'installing'
  | 'building'
  | 'syncing-manifest'
  | 'updated'
  | 'up-to-date'
  | 'skipped'
  | 'error';

export interface AutoUpdateStatus {
  phase: AutoUpdatePhase;
  sha: string | null;
  shortSha: string | null;
  branch: string | null;
  detail: string | null;
  changedFiles: string[];
  lastCheckedAt: string | null;
  lastUpdatedAt: string | null;
}
