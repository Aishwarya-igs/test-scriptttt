import { useEffect, useState, type FormEvent } from 'react';
import { api, ApiError, type Client } from '../api/client';
import { ClientCard } from '../components/ClientCard';
import { OverviewSummary } from '../components/OverviewSummary';
import { AccountsPanel } from '../components/AccountsPanel';
import { useAuth } from '../auth/AuthContext';

export function ClientsOverviewPage() {
  const { logout } = useAuth();
  const [clients, setClients] = useState<Client[] | null>(null);
  // Bumped on every onboard/remove so <OverviewSummary> (keyed on it) remounts
  // and refetches the consolidated numbers — otherwise the rollup at the top
  // would silently drift stale the moment a client is added or removed.
  const [summaryVersion, setSummaryVersion] = useState(0);
  const [showForm, setShowForm] = useState(false);
  const [name, setName] = useState('');
  const [repoUrl, setRepoUrl] = useState('');
  const [description, setDescription] = useState('');
  const [email, setEmail] = useState('');
  const [formError, setFormError] = useState<string | null>(null);
  const [busy, setBusy] = useState(false);
  const [showAccounts, setShowAccounts] = useState(false);

  function refetch() {
    api.listClients().then((res) => setClients(res.clients));
    setSummaryVersion((v) => v + 1);
  }

  useEffect(refetch, []);

  async function handleOnboard(e: FormEvent) {
    e.preventDefault();
    setBusy(true);
    setFormError(null);
    try {
      await api.createClient({ name, repoUrl, description, email });
      setName('');
      setRepoUrl('');
      setDescription('');
      setEmail('');
      setShowForm(false);
      refetch();
    } catch (err) {
      setFormError(err instanceof ApiError ? err.message : 'Could not onboard this client');
    } finally {
      setBusy(false);
    }
  }

  function handleArchived(id: string) {
    setClients((prev) => (prev ? prev.filter((c) => c.id !== id) : prev));
    setSummaryVersion((v) => v + 1);
  }

  function handleUpdated(updated: Client) {
    setClients((prev) => (prev ? prev.map((c) => (c.id === updated.id ? updated : c)) : prev));
  }

  return (
    <div className="overview-page">
      <header className="overview-header">
        <div>
          <h1>Admin Dashboard</h1>
          <p className="overview-subtitle">A consolidated, read-only view of every onboarded client's Automation Dashboard.</p>
        </div>
        <div className="overview-header-actions">
          <button className="primary-button" onClick={() => setShowForm((v) => !v)}>
            {showForm ? 'Cancel' : '+ Onboard client'}
          </button>
          <button className="secondary-button" onClick={() => setShowAccounts((v) => !v)}>
            {showAccounts ? 'Close accounts' : 'Manage accounts'}
          </button>
          <button className="secondary-button" onClick={() => logout()}>
            ← Sign out
          </button>
        </div>
      </header>

      {showAccounts && <AccountsPanel />}

      <OverviewSummary key={summaryVersion} />

      {showForm && (
        <form className="card onboard-form" onSubmit={handleOnboard}>
          <label>
            Client name
            <input value={name} onChange={(e) => setName(e.target.value)} required autoFocus />
          </label>
          <label>
            GitHub repo URL
            <input value={repoUrl} onChange={(e) => setRepoUrl(e.target.value)} placeholder="https://github.com/org/repo.git" required />
          </label>
          <label>
            Description (optional)
            <input value={description} onChange={(e) => setDescription(e.target.value)} />
          </label>
          <label>
            Notification email (optional)
            <input type="email" value={email} onChange={(e) => setEmail(e.target.value)} placeholder="team@client.com" />
          </label>
          <p className="muted onboard-form-note">
            The repo is cloned onto this machine and given its own live Automation Dashboard, the same as the iWantTFC demo — this installs and builds a full dashboard instance, so onboarding can take a few minutes. Public repos only — a private repo needs this machine's git already set up to access it. If a notification email is given, that client's own dashboard will also email it whenever a run fails, alongside every admin account.
          </p>

          {formError && <div className="form-error">{formError}</div>}

          <button type="submit" className="primary-button" disabled={busy}>
            {busy ? 'Setting up the dashboard… this can take a few minutes' : 'Onboard client'}
          </button>
        </form>
      )}

      {clients === null ? (
        <div className="page-loading">Loading clients…</div>
      ) : clients.length === 0 ? (
        <div className="card empty-state">No clients onboarded yet. Click "+ Onboard client" to add the first one.</div>
      ) : (
        <div className="client-grid">
          {clients.map((client) => (
            <ClientCard key={client.id} client={client} onArchived={handleArchived} onUpdated={handleUpdated} />
          ))}
        </div>
      )}
    </div>
  );
}
