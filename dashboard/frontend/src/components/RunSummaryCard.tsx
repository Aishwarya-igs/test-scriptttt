import { useState } from 'react';
import { api } from '../api/client';
import type { RunRecord } from '../api/types';

/**
 * The proactive plain-English summary generated automatically when a run
 * finishes (see runManager._generateRunSummaryAsync on the server). Runs
 * from before this feature existed — or ones where no AI provider was
 * configured at the time — have no `aiSummary` yet, so this offers a button
 * to generate one on demand instead of just staying empty.
 */
export function RunSummaryCard({ run, onUpdated }: { run: RunRecord; onUpdated: () => void }) {
  const [busy, setBusy] = useState(false);
  const [error, setError] = useState<string | null>(null);

  async function handleGenerate() {
    setBusy(true);
    setError(null);
    try {
      await api.generateRunSummary(run.runId);
      onUpdated();
    } catch (err) {
      setError(err instanceof Error ? err.message : 'Could not generate a summary');
    } finally {
      setBusy(false);
    }
  }

  return (
    <div className="card run-summary-card">
      <div className="run-summary-card-header">
        <h3>Summary</h3>
        {run.aiSummary && (
          <button className="secondary-button run-summary-regen" onClick={handleGenerate} disabled={busy}>
            {busy ? 'Regenerating…' : 'Regenerate'}
          </button>
        )}
      </div>

      {run.aiSummary ? (
        <p className="run-summary-text">{run.aiSummary.text}</p>
      ) : (
        <div className="run-summary-empty">
          <p className="muted">No summary yet for this run.</p>
          <button className="secondary-button" onClick={handleGenerate} disabled={busy}>
            {busy ? 'Generating…' : 'Generate summary'}
          </button>
        </div>
      )}
      {error && <p className="run-summary-error">{error}</p>}
    </div>
  );
}
