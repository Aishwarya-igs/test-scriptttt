import { useEffect, useState, type FormEvent } from 'react';
import { useNavigate } from 'react-router-dom';
import { api } from '../api/client';
import type { JiraIssueTypeOption } from '../api/types';

/**
 * Where a client connects their own Jira project — no server .env access
 * needed. Shown first (see App.tsx) until Jira has been configured at
 * least once, then reachable any time from the sidebar to update it.
 */
export function SettingsPage({ onSaved }: { onSaved?: () => void }) {
  const navigate = useNavigate();
  const [loading, setLoading] = useState(true);
  const [baseUrl, setBaseUrl] = useState('');
  const [email, setEmail] = useState('');
  const [apiToken, setApiToken] = useState('');
  const [tokenPreview, setTokenPreview] = useState<string | null>(null);
  const [projectKey, setProjectKey] = useState('');
  const [issueType, setIssueType] = useState('');
  const [issueTypeOptions, setIssueTypeOptions] = useState<JiraIssueTypeOption[]>([]);
  const [wasConfigured, setWasConfigured] = useState(false);

  const [fetchingTypes, setFetchingTypes] = useState(false);
  const [fetchError, setFetchError] = useState<string | null>(null);
  const [saving, setSaving] = useState(false);
  const [saveMessage, setSaveMessage] = useState<{ text: string; isError: boolean } | null>(null);

  useEffect(() => {
    api
      .getJiraSettings()
      .then((s) => {
        setBaseUrl(s.baseUrl);
        setEmail(s.email);
        setProjectKey(s.projectKey);
        setIssueType(s.issueType);
        setTokenPreview(s.tokenPreview);
        setWasConfigured(s.tokenConfigured && Boolean(s.baseUrl) && Boolean(s.projectKey));
      })
      .catch(() => {})
      .finally(() => setLoading(false));
  }, []);

  async function handleFetchIssueTypes() {
    setFetchingTypes(true);
    setFetchError(null);
    try {
      const { issueTypes } = await api.fetchJiraIssueTypes({ baseUrl, email, apiToken, projectKey });
      setIssueTypeOptions(issueTypes);
      if (issueTypes.length && !issueTypes.some((t) => t.name === issueType)) {
        setIssueType(issueTypes[0].name);
      }
    } catch (err) {
      setFetchError(err instanceof Error ? err.message : 'Could not fetch issue types');
    } finally {
      setFetchingTypes(false);
    }
  }

  async function handleSave(e: FormEvent) {
    e.preventDefault();
    setSaving(true);
    setSaveMessage(null);
    try {
      const saved = await api.saveJiraSettings({ baseUrl, email, apiToken, projectKey, issueType });
      setTokenPreview(saved.tokenPreview);
      setApiToken('');
      setWasConfigured(true);
      setSaveMessage({ text: 'Saved — Jira is connected.', isError: false });
      onSaved?.();
    } catch (err) {
      setSaveMessage({ text: err instanceof Error ? err.message : 'Could not save', isError: true });
    } finally {
      setSaving(false);
    }
  }

  if (loading) {
    return (
      <div className="settings-page page-fade">
        <div className="skeleton skeleton-block" style={{ height: 300 }} />
      </div>
    );
  }

  return (
    <div className="settings-page page-fade">
      <div className="card">
        <h2>Connect Jira</h2>
        <p className="muted">
          Fill these in to enable "Report bug in Jira" on failed tests. This is stored only for this dashboard — it's
          never shared with, or visible to, any other client.
        </p>

        <form className="settings-form" onSubmit={handleSave}>
          <label>
            Jira Base URL
            <input
              type="text"
              required
              placeholder="https://yoursite.atlassian.net"
              value={baseUrl}
              onChange={(e) => setBaseUrl(e.target.value)}
            />
          </label>

          <label>
            Jira Email
            <input
              type="email"
              required
              placeholder="you@yourcompany.com"
              value={email}
              onChange={(e) => setEmail(e.target.value)}
            />
          </label>

          <label>
            Jira API Token
            <input
              type="password"
              placeholder={tokenPreview ? `Saved (${tokenPreview}) — leave blank to keep it` : 'Paste your API token'}
              value={apiToken}
              onChange={(e) => setApiToken(e.target.value)}
              required={!tokenPreview}
              autoComplete="off"
            />
            <span className="settings-hint">
              From id.atlassian.com → Security → API tokens. {tokenPreview ? "Leave blank to keep the saved one." : ''}
            </span>
          </label>

          <label>
            Jira Project Key
            <input
              type="text"
              required
              placeholder="e.g. TFC"
              value={projectKey}
              onChange={(e) => setProjectKey(e.target.value)}
            />
          </label>

          <label>
            Jira Issue Type
            <div className="settings-issue-type-row">
              {issueTypeOptions.length > 0 ? (
                <select value={issueType} onChange={(e) => setIssueType(e.target.value)}>
                  {issueTypeOptions.map((t) => (
                    <option key={t.name} value={t.name} title={t.description}>
                      {t.name}
                    </option>
                  ))}
                </select>
              ) : (
                <input type="text" required placeholder="e.g. Bug" value={issueType} onChange={(e) => setIssueType(e.target.value)} />
              )}
              <button type="button" className="secondary-button" onClick={handleFetchIssueTypes} disabled={fetchingTypes}>
                {fetchingTypes ? 'Checking…' : 'Fetch issue types'}
              </button>
            </div>
            <span className="settings-hint">
              Not every project has a "Bug" type — fetch the real ones for this project instead of guessing.
            </span>
            {fetchError && <span className="settings-hint settings-hint-error">{fetchError}</span>}
          </label>

          <div className="settings-actions">
            <button type="submit" className="primary-button" disabled={saving}>
              {saving ? 'Saving…' : 'Save'}
            </button>
            <button
              type="button"
              className="link-button"
              onClick={() => {
                // Only relevant when skipping unconfigured — once actually
                // saved, jiraStatus itself is 'configured' and this flag is
                // moot, but harmless to leave set.
                sessionStorage.setItem('jiraSetupDismissed', '1');
                navigate('/');
              }}
            >
              {wasConfigured ? 'Back to dashboard' : 'Skip for now — continue to dashboard'}
            </button>
          </div>

          {saveMessage && (
            <p className={`muted settings-save-message${saveMessage.isError ? ' error' : ''}`}>{saveMessage.text}</p>
          )}
        </form>
      </div>
    </div>
  );
}
