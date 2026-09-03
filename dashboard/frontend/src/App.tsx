import { useEffect, useState } from 'react';
import { NavLink, Navigate, Route, Routes } from 'react-router-dom';
import './App.css';
import { OverviewPage } from './pages/OverviewPage';
import { RunHistoryPage } from './pages/RunHistoryPage';
import { RunDetailPage } from './pages/RunDetailPage';
import { ChatPage } from './pages/ChatPage';
import { PlatformPage } from './pages/PlatformPage';
import { SettingsPage } from './pages/SettingsPage';
import { api } from './api/client';
import type { Platform } from './api/types';
import { ConnectionBadge } from './components/ConnectionBadge';
import { AutoUpdateBadge } from './components/AutoUpdateBadge';
import { UpdateBanner } from './components/UpdateBanner';
import { AppliedFixesBanner } from './components/AppliedFixesBanner';
import { useTheme } from './hooks/useTheme';
import igsLogo from './assets/igs-logo.webp';

export default function App() {
  const { theme, toggleTheme } = useTheme();
  // Nav entries and routes are generated from the registry rather than listed
  // here, so a new platform is a config edit and never a code change. Web is
  // listed alongside the others rather than being special-cased into the top
  // section: it is where you start a web run, exactly as Mobile will be once
  // it has a repo, and Run history stays a cross-platform view of the past.
  const [platforms, setPlatforms] = useState<Platform[]>([]);
  useEffect(() => {
    api
      .getPlatforms()
      .then((res) => setPlatforms(res.platforms))
      .catch(() => setPlatforms([]));
  }, []);

  // Set by admin-dashboard for a per-client instance (lib/dashboardProvisioner.js)
  // so a client's own dashboard reads as theirs, not a generic shared title —
  // null for the original, manually-started instance, which keeps its old title.
  const [clientName, setClientName] = useState<string | null>(null);
  useEffect(() => {
    api
      .getClientInfo()
      .then((res) => setClientName(res.name))
      .catch(() => setClientName(null));
  }, []);
  const sidebarTitle = clientName ? `${clientName} Overview` : 'Automation Dashboard';
  useEffect(() => {
    document.title = sidebarTitle;
  }, [sidebarTitle]);

  // Gates the Overview route behind Settings until Jira has been connected
  // at least once — "before opening automation dashboard" — without
  // blocking anything else (Run history, starting runs, etc. all still work
  // with Jira unset; the Settings page itself offers a "skip for now" out).
  const [jiraStatus, setJiraStatus] = useState<'loading' | 'configured' | 'unconfigured'>('loading');
  useEffect(() => {
    api
      .getJiraSettings()
      .then((s) => setJiraStatus(s.tokenConfigured && s.baseUrl && s.projectKey ? 'configured' : 'unconfigured'))
      .catch(() => setJiraStatus('unconfigured'));
  }, []);

  // Lets this dashboard's own repo checkout be pointed at a different
  // branch's latest commit — for trying a feature branch's tests without
  // onboarding a whole separate client just for that. See
  // lib/branchSwitcher.js for what actually happens server-side.
  const [branchInput, setBranchInput] = useState('');
  const [branchBusy, setBranchBusy] = useState(false);
  const [branchMessage, setBranchMessage] = useState<{ text: string; isError: boolean } | null>(null);

  async function handleSwitchBranch(e: React.FormEvent) {
    e.preventDefault();
    if (!branchInput.trim()) return;
    setBranchBusy(true);
    setBranchMessage(null);
    try {
      const result = await api.switchBranch(branchInput.trim());
      setBranchMessage({
        text: `Switched to "${result.branch}" @ ${result.commit} — ${result.projectCount} project${result.projectCount === 1 ? '' : 's'} found`,
        isError: false,
      });
    } catch (err) {
      setBranchMessage({ text: err instanceof Error ? err.message : 'Could not switch branch', isError: true });
    } finally {
      setBranchBusy(false);
    }
  }

  // General-purpose "Report a bug" in the sidebar — always available,
  // unlike the per-test one inside a failed row (RunDetailPage's
  // ReportBugPanel), which auto-fills the error/RCA/screenshot. This one is
  // for anything else: a dashboard problem, a one-off issue someone wants to
  // file without first finding a failed test.
  const [bugFormOpen, setBugFormOpen] = useState(false);
  const [bugSummary, setBugSummary] = useState('');
  const [bugBusy, setBugBusy] = useState(false);
  const [bugMessage, setBugMessage] = useState<{ text: string; isError: boolean } | null>(null);

  async function handleReportBug(e: React.FormEvent) {
    e.preventDefault();
    if (!bugSummary.trim()) return;
    setBugBusy(true);
    setBugMessage(null);
    try {
      const issue = await api.reportGeneralBug({ summary: bugSummary.trim() });
      setBugMessage({ text: `Created ${issue.key} ↗`, isError: false });
      setBugSummary('');
      setBugFormOpen(false);
    } catch (err) {
      setBugMessage({ text: err instanceof Error ? err.message : 'Could not create the Jira issue', isError: true });
    } finally {
      setBugBusy(false);
    }
  }

  return (
    <div className="app-shell">
      <aside className="sidebar">
        <NavLink to="/" end className="sidebar-brand" aria-label="IGS — go to homepage">
          <span className="sidebar-logo-badge">
            <img src={igsLogo} alt="IGS" className="sidebar-logo-img" />
          </span>
          <span className="sidebar-title">{sidebarTitle}</span>
        </NavLink>

        <nav className="sidebar-nav">
          <NavLink to="/" end className={({ isActive }) => `sidebar-link${isActive ? ' active' : ''}`}>
            <span className="sidebar-link-icon">◆</span> Overview
          </NavLink>
          <NavLink to="/runs" className={({ isActive }) => `sidebar-link${isActive ? ' active' : ''}`}>
            <span className="sidebar-link-icon">☰</span> Run history
          </NavLink>
          <NavLink to="/chat" className={({ isActive }) => `sidebar-link${isActive ? ' active' : ''}`}>
            <span className="sidebar-link-icon">💬</span> Ask about history
          </NavLink>
          <NavLink to="/settings" className={({ isActive }) => `sidebar-link${isActive ? ' active' : ''}`}>
            <span className="sidebar-link-icon">⚙</span> Settings
            {jiraStatus === 'unconfigured' && <span className="sidebar-link-tag">set up Jira</span>}
          </NavLink>

          {platforms.length > 0 && (
            <>
              <div className="sidebar-section-label">Platforms</div>
              {platforms.map((platform) => (
                <NavLink
                  key={platform.id}
                  to={`/platforms/${platform.id}`}
                  className={({ isActive }) => `sidebar-link${isActive ? ' active' : ''}`}
                  // Marked in the nav itself so an unconfigured platform is
                  // obvious before clicking into it.
                  title={platform.configured ? platform.label : `${platform.label} — no repo connected yet`}
                >
                  <span className="sidebar-link-icon">{platform.icon || '◇'}</span> {platform.label}
                  {!platform.configured && <span className="sidebar-link-tag">not set up</span>}
                </NavLink>
              ))}
            </>
          )}

          <div className="sidebar-section-label">Branch</div>
          <form className="sidebar-branch-form" onSubmit={handleSwitchBranch}>
            <input
              type="text"
              className="sidebar-branch-input"
              placeholder="https://github.com/org/repo/tree/branch"
              value={branchInput}
              onChange={(e) => setBranchInput(e.target.value)}
              disabled={branchBusy}
              title="A GitHub branch URL only, e.g. https://github.com/org/repo/tree/feature-branch — not a branch name or local path"
            />
            <button type="submit" className="sidebar-branch-button" disabled={branchBusy || !branchInput.trim()}>
              {branchBusy ? 'Switching…' : 'Switch & rebuild'}
            </button>
            {branchMessage && (
              <div className={`sidebar-branch-message${branchMessage.isError ? ' error' : ''}`}>{branchMessage.text}</div>
            )}
          </form>

          <div className="sidebar-section-label">Bugs</div>
          {!bugFormOpen ? (
            <button type="button" className="sidebar-branch-button sidebar-report-bug-toggle" onClick={() => setBugFormOpen(true)}>
              Report bug in Jira
            </button>
          ) : (
            <form className="sidebar-branch-form" onSubmit={handleReportBug}>
              <input
                type="text"
                className="sidebar-branch-input"
                placeholder="What's the bug?"
                value={bugSummary}
                onChange={(e) => setBugSummary(e.target.value)}
                disabled={bugBusy}
                autoFocus
              />
              <div className="sidebar-report-bug-actions">
                <button type="submit" className="sidebar-branch-button" disabled={bugBusy || !bugSummary.trim()}>
                  {bugBusy ? 'Creating…' : 'Create issue'}
                </button>
                <button type="button" className="link-button" onClick={() => setBugFormOpen(false)} disabled={bugBusy}>
                  Cancel
                </button>
              </div>
            </form>
          )}
          {bugMessage && (
            <div className={`sidebar-branch-message sidebar-report-bug-message${bugMessage.isError ? ' error' : ''}`}>
              {bugMessage.text}
            </div>
          )}
        </nav>

        <div className="sidebar-footer">
          <div className="sidebar-footer-badges">
            <ConnectionBadge />
            <AutoUpdateBadge />
          </div>
          <button
            type="button"
            className="theme-toggle"
            onClick={toggleTheme}
            title={`Switch to ${theme === 'dark' ? 'light' : 'dark'} mode`}
            aria-label="Toggle color theme"
          >
            {theme === 'dark' ? '☀' : '☾'}
          </button>
        </div>
      </aside>

      <main className="app-main">
        <UpdateBanner />
        <AppliedFixesBanner />
        <Routes>
          <Route
            path="/"
            element={
              jiraStatus === 'loading' ? (
                <div className="page-fade">
                  <div className="skeleton skeleton-block" style={{ height: 200 }} />
                </div>
              ) : jiraStatus === 'unconfigured' && sessionStorage.getItem('jiraSetupDismissed') !== '1' ? (
                <Navigate to="/settings" replace />
              ) : (
                <OverviewPage />
              )
            }
          />
          <Route path="/runs" element={<RunHistoryPage />} />
          <Route path="/runs/:runId" element={<RunDetailPage />} />
          <Route path="/chat" element={<ChatPage />} />
          <Route path="/settings" element={<SettingsPage onSaved={() => setJiraStatus('configured')} />} />
          <Route path="/platforms/:platformId" element={<PlatformPage />} />
        </Routes>
      </main>
    </div>
  );
}
