import { useState, type FormEvent } from 'react';
import { api } from '../api/client';
import type { RcaResult, TestRecord } from '../api/types';

const PRIORITIES = ['Highest', 'High', 'Medium', 'Low'] as const;

/** Report a failed test straight into Jira — pre-filled from the test record
 * and whatever RCA has already found, editable before it's actually sent. */
export function ReportBugPanel({
  test,
  runId,
  clientName,
  rca,
}: {
  test: TestRecord;
  runId: string;
  clientName?: string | null;
  rca?: RcaResult | null;
}) {
  const [open, setOpen] = useState(false);
  const [summary, setSummary] = useState(`${clientName ? `[${clientName}] ` : ''}${test.title}`);
  const [notes, setNotes] = useState('');
  const [priority, setPriority] = useState<(typeof PRIORITIES)[number]>('Medium');
  const [busy, setBusy] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [issue, setIssue] = useState(test.jiraIssue ?? null);

  async function handleSubmit(e: FormEvent) {
    e.preventDefault();
    setBusy(true);
    setError(null);
    try {
      const created = await api.reportBug(runId, test.testId, { summary, notes, priority });
      setIssue(created);
      setOpen(false);
    } catch (err) {
      setError(err instanceof Error ? err.message : 'Could not create the Jira issue');
    } finally {
      setBusy(false);
    }
  }

  if (issue) {
    return (
      <div className="report-bug-section">
        <a href={issue.url} target="_blank" rel="noreferrer" className="jira-issue-link">
          Reported in Jira — {issue.key} ↗
        </a>
      </div>
    );
  }

  return (
    <div className="report-bug-section">
      {!open && (
        <button className="secondary-button" onClick={() => setOpen(true)}>
          Report bug in Jira
        </button>
      )}
      {open && (
        <form className="report-bug-form" onSubmit={handleSubmit}>
          <label>
            Summary
            <input type="text" required value={summary} onChange={(e) => setSummary(e.target.value)} disabled={busy} />
          </label>
          <label>
            Notes <span className="muted">(optional — added above the auto-filled details)</span>
            <textarea
              rows={3}
              value={notes}
              onChange={(e) => setNotes(e.target.value)}
              disabled={busy}
              placeholder="Anything the auto-filled error/RCA below doesn't already cover…"
            />
          </label>
          <label className="report-bug-priority">
            Priority
            <select value={priority} onChange={(e) => setPriority(e.target.value as typeof priority)} disabled={busy}>
              {PRIORITIES.map((p) => (
                <option key={p} value={p}>
                  {p}
                </option>
              ))}
            </select>
          </label>
          <p className="muted report-bug-preview">
            Also included automatically: client, run, environment, test file, the failure error/stack
            {rca?.summary ? ', and the RCA finding' : ''}.
          </p>
          <div className="report-bug-actions">
            <button type="submit" className="primary-button" disabled={busy}>
              {busy ? 'Creating…' : 'Create Jira issue'}
            </button>
            <button type="button" className="link-button" onClick={() => setOpen(false)} disabled={busy}>
              Cancel
            </button>
          </div>
        </form>
      )}
      {error && <p className="muted report-bug-error">{error}</p>}
    </div>
  );
}
