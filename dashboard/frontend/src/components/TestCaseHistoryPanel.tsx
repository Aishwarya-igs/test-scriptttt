import { useEffect, useState } from 'react';
import { Link } from 'react-router-dom';
import { api } from '../api/client';
import type { TestCaseHistoryEntry } from '../api/types';
import { StatusBadge } from './StatusBadge';

const CATEGORY_LABELS: Record<string, string> = {
  code: 'code',
  environment: 'environment',
  infrastructure: 'infrastructure',
  unknown: 'unclassified',
};

function spotFixSummary(entry: TestCaseHistoryEntry) {
  if (!entry.spotFix) return null;
  const { confidence, applied, verification, reverted } = entry.spotFix;
  if (reverted) return `spot fix applied (${confidence} confidence), later reverted${verification ? ` — verification: ${verification}` : ''}`;
  if (applied) return `spot fix applied (${confidence} confidence)${verification ? ` — verification: ${verification}` : ''}`;
  return `spot fix proposed (${confidence} confidence), not applied`;
}

// findTestOccurrences returns every past occurrence of this test case, not
// just the failing ones (see testCaseHistory.js) — a clean track record is
// exactly as worth showing as a troubled one (e.g. "this always passed
// before" is useful context for a failure that just showed up). So the
// header text has to reflect what's actually in the history rather than
// assume every entry is a failure.
const FAILURE_STATUSES = new Set(['failed', 'timedOut', 'interrupted']);
function summarizeOutcomes(history: TestCaseHistoryEntry[]) {
  const failedCount = history.filter((e) => FAILURE_STATUSES.has(e.status)).length;
  const n = history.length;
  const runWord = n === 1 ? 'run' : 'runs';
  if (failedCount === 0) return { text: `Seen in ${n} prior ${runWord}, all passed`, hadFailure: false };
  if (failedCount === n) return { text: `This test case has failed before (${n} prior ${runWord})`, hadFailure: true };
  return { text: `Failed in ${failedCount} of ${n} prior ${runWord}`, hadFailure: true };
}

/**
 * Cross-run track record for this exact test case, matched by its stable
 * ticket-id identity (e.g. "IW3-T2047") rather than file+line — see
 * dashboard/lib/testCaseIdentity.js. The same context RCA now gets fed
 * automatically (see promptFormat.js's PRIOR HISTORY block), surfaced here
 * for a human browsing the test's own history instead of just an AI prompt.
 *
 * Silent when there's no history — a test's first-ever failure has nothing
 * to show, and that's the common case, not worth a "no history yet" notice.
 */
export function TestCaseHistoryPanel({ runId, testId }: { runId: string; testId: string }) {
  const [history, setHistory] = useState<TestCaseHistoryEntry[] | null>(null);
  const [expanded, setExpanded] = useState(false);

  useEffect(() => {
    let cancelled = false;
    api
      .getTestCaseHistory(runId, testId)
      .then((result) => {
        if (!cancelled) setHistory(result.history);
      })
      .catch(() => {
        // Best-effort only — this is supporting context, not a page a
        // failed request should visibly break.
        if (!cancelled) setHistory([]);
      });
    return () => {
      cancelled = true;
    };
  }, [runId, testId]);

  if (!history || history.length === 0) return null;

  const { text, hadFailure } = summarizeOutcomes(history);

  return (
    <div className="test-history">
      <button
        className={`link-button test-history-toggle${hadFailure ? '' : ' test-history-toggle-clean'}`}
        onClick={() => setExpanded((v) => !v)}
      >
        {expanded ? '▾' : '▸'} {text}
      </button>
      {expanded && (
        <ul className="test-history-list">
          {history.map((entry) => (
            <li key={entry.runId} className="test-history-entry">
              <Link to={`/runs/${entry.runId}`} className="test-history-date">
                {new Date(entry.createdAt).toLocaleString()}
              </Link>
              <StatusBadge status={entry.status} />
              {entry.rca && (
                <span className="test-history-detail">
                  RCA: <strong>{CATEGORY_LABELS[entry.rca.category] ?? entry.rca.category}</strong> — {entry.rca.summary}
                </span>
              )}
              {spotFixSummary(entry) && <span className="test-history-detail muted">{spotFixSummary(entry)}</span>}
            </li>
          ))}
        </ul>
      )}
    </div>
  );
}
