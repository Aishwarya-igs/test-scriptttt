import { useState } from 'react';
import { api } from '../api/client';
import type { FailureCategory, RcaResult, TestRecord } from '../api/types';
import { CopyButton } from './CopyButton';
import { SpotFixPanel } from './SpotFixPanel';
import { TestCaseHistoryPanel } from './TestCaseHistoryPanel';
import { stripAnsi } from '../utils/ansi';

function attachmentsByName(test: TestRecord, name: string) {
  return test.attachments.filter((a) => a.name === name && a.path);
}

const CATEGORY_LABELS: Record<FailureCategory, string> = {
  code: 'Code issue',
  environment: 'Environment',
  infrastructure: 'Infrastructure',
  unknown: 'Unclassified',
};

/**
 * Whether the failure is in the repo's own code, which is what decides
 * whether a spot fix is even on the table.
 */
function CategoryBadge({ category }: { category: FailureCategory }) {
  return <span className={`rca-category rca-category-${category}`}>{CATEGORY_LABELS[category] ?? category}</span>;
}

function RcaSourceBadge({ rca }: { rca: RcaResult }) {
  const label =
    rca.source === 'ollama'
      ? `AI (local · ${rca.model || 'ollama'})`
      : rca.source === 'api'
        ? `AI (${rca.model || 'cloud'})`
        : 'Heuristic (rule-based)';
  return <span className={`rca-badge rca-badge-${rca.source}`}>{label}</span>;
}

export function FailureDetailPanel({
  test,
  runId,
  onRerunTest,
}: {
  test: TestRecord;
  runId: string;
  onRerunTest: (testId: string) => void;
}) {
  const [rca, setRca] = useState<RcaResult | null | undefined>(test.rca);
  const [analyzing, setAnalyzing] = useState(false);
  const [analyzeError, setAnalyzeError] = useState<string | null>(null);

  const screenshots = attachmentsByName(test, 'screenshot');
  const videos = attachmentsByName(test, 'video');
  const traces = attachmentsByName(test, 'trace');

  async function handleAnalyze() {
    setAnalyzing(true);
    setAnalyzeError(null);
    try {
      const result = await api.analyzeTest(runId, test.testId);
      setRca(result);
    } catch (err) {
      setAnalyzeError(err instanceof Error ? err.message : 'Analysis failed');
    } finally {
      setAnalyzing(false);
    }
  }

  return (
    <div className="failure-panel">
      <TestCaseHistoryPanel runId={runId} testId={test.testId} />

      {test.error && (
        <div className="failure-error">
          <div className="failure-error-header">
            <div className="failure-error-message">{stripAnsi(test.error.message)}</div>
            <CopyButton value={stripAnsi(test.error.stack ?? test.error.message)} label="Copy error" />
          </div>
          {test.error.stack && <pre className="failure-error-stack">{stripAnsi(test.error.stack)}</pre>}
        </div>
      )}

      <div className="rca-section">
        {!rca && (
          <button className="secondary-button" onClick={handleAnalyze} disabled={analyzing}>
            {analyzing ? 'Analyzing…' : 'Analyze failure'}
          </button>
        )}

        {analyzeError && <div className="rca-error">{analyzeError}</div>}

        {rca && (
          <div className="rca-result">
            <div className="rca-result-header">
              <RcaSourceBadge rca={rca} />
              {rca.category && <CategoryBadge category={rca.category} />}
              <button className="link-button" onClick={handleAnalyze} disabled={analyzing}>
                {analyzing ? 'Re-analyzing…' : 'Re-analyze'}
              </button>
            </div>
            {rca.note && <div className="rca-note">{rca.note}</div>}
            <div className="rca-block">
              <h4>Root cause</h4>
              <p>{rca.summary}</p>
              {rca.rootCause && rca.rootCause !== rca.summary && <p className="muted">{rca.rootCause}</p>}
            </div>
            {rca.suggestedFix && (
              <div className="rca-block">
                <h4>Suggested fix</h4>
                <pre className="rca-fix">{rca.suggestedFix}</pre>
              </div>
            )}
            <div className="rca-actions">
              <button className="primary-button" onClick={() => onRerunTest(test.testId)}>
                Rerun this test
              </button>
            </div>

            <SpotFixPanel test={test} runId={runId} rca={rca} />
          </div>
        )}
      </div>

      <div className="failure-artifacts">
        {screenshots.map((s) => (
          <a key={s.path} href={api.screenshotUrl(s.path!)} target="_blank" rel="noreferrer" className="artifact-thumb">
            <img src={api.screenshotUrl(s.path!)} alt={`Screenshot for ${test.title}`} />
          </a>
        ))}
        {videos.map((v) => (
          <video key={v.path} src={api.videoUrl(v.path!)} controls className="artifact-video" />
        ))}
        {traces.map((t) => (
          <a
            key={t.path}
            href={api.traceViewerUrl(t.path!)}
            target="_blank"
            rel="noreferrer"
            className="trace-link"
          >
            Open trace ↗
          </a>
        ))}
        {screenshots.length === 0 && videos.length === 0 && traces.length === 0 && (
          <span className="muted">No attachments captured for this test.</span>
        )}
      </div>
    </div>
  );
}
