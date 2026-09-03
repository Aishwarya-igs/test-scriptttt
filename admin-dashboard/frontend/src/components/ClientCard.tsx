import { useEffect, useState, type FormEvent } from 'react';
import { Link } from 'react-router-dom';
import type { Client, ClientStats } from '../api/client';
import { api, ApiError } from '../api/client';
import { SharePanel } from './SharePanel';

// Auto-refresh: keeps a card's numbers live while the page sits open on a
// screen, without the admin needing to manually reload.
const STATS_POLL_MS = 30_000;
// A client whose last run is older than this gets flagged — the point of a
// consolidated view is that a quiet client doesn't just disappear into a
// wall of otherwise-healthy-looking cards.
const STALE_AFTER_DAYS = 7;

function formatDate(iso: string | null) {
  if (!iso) return '—';
  return new Date(iso).toLocaleString();
}

function daysSince(iso: string | null) {
  if (!iso) return null;
  return (Date.now() - new Date(iso).getTime()) / (1000 * 60 * 60 * 24);
}

function statusBadgeClass(status: string | null) {
  const s = (status || '').toLowerCase();
  if (s === 'passed' || s === 'success') return 'status-badge-passed';
  if (s === 'failed' || s === 'failure') return 'status-badge-failed';
  return 'status-badge-neutral';
}

function passRateTextClass(rate: number | null) {
  if (rate == null) return '';
  if (rate >= 80) return 'text-success';
  if (rate >= 50) return 'text-warning';
  return 'text-danger';
}

export function ClientCard({ client, onArchived, onUpdated }: { client: Client; onArchived: (id: string) => void; onUpdated: (client: Client) => void }) {
  const [stats, setStats] = useState<ClientStats | null>(null);
  const [busy, setBusy] = useState(false);
  const [editing, setEditing] = useState(false);
  const [sharing, setSharing] = useState(false);
  const [name, setName] = useState(client.name);
  const [repoUrl, setRepoUrl] = useState(client.repoUrl || '');
  const [description, setDescription] = useState(client.description);
  const [email, setEmail] = useState(client.email || '');
  const [editError, setEditError] = useState<string | null>(null);

  useEffect(() => {
    let cancelled = false;
    function fetchStats() {
      api
        .getClientStats(client.id)
        .then((res) => {
          if (!cancelled) setStats(res.stats);
        })
        .catch(() => {
          if (!cancelled) setStats({ available: false, totalRuns: 0, passRate: null, lastRunAt: null, lastRunStatus: null });
        });
    }
    fetchStats();
    const interval = setInterval(fetchStats, STATS_POLL_MS);
    return () => {
      cancelled = true;
      clearInterval(interval);
    };
  }, [client.id]);

  async function handleArchive() {
    if (!window.confirm(`Remove "${client.name}" from the client list? This only removes the registration — it does not touch their repo or their Automation Dashboard data.`)) return;
    setBusy(true);
    try {
      await api.archiveClient(client.id);
      onArchived(client.id);
    } finally {
      setBusy(false);
    }
  }

  function startEdit() {
    setName(client.name);
    setRepoUrl(client.repoUrl || '');
    setDescription(client.description);
    setEmail(client.email || '');
    setEditError(null);
    setEditing(true);
  }

  async function handleSaveEdit(e: FormEvent) {
    e.preventDefault();
    setBusy(true);
    setEditError(null);
    try {
      const res = await api.updateClient(client.id, { name, repoUrl, description, email });
      onUpdated(res.client);
      setEditing(false);
    } catch (err) {
      setEditError(err instanceof ApiError ? err.message : 'Could not save changes');
    } finally {
      setBusy(false);
    }
  }

  const staleDays = stats?.available ? daysSince(stats.lastRunAt) : null;
  const isStale = staleDays != null && staleDays > STALE_AFTER_DAYS;

  if (editing) {
    return (
      <div className="client-card">
        <form className="onboard-form" onSubmit={handleSaveEdit}>
          <label>
            Client name
            <input value={name} onChange={(e) => setName(e.target.value)} required autoFocus />
          </label>
          <label>
            GitHub repo URL
            <input value={repoUrl} onChange={(e) => setRepoUrl(e.target.value)} placeholder="https://github.com/org/repo.git" required />
          </label>
          <label>
            Description
            <input value={description} onChange={(e) => setDescription(e.target.value)} />
          </label>
          <label>
            Notification email (optional)
            <input type="email" value={email} onChange={(e) => setEmail(e.target.value)} placeholder="team@client.com" />
          </label>
          <p className="muted onboard-form-note">Changing the repo URL re-clones it — only change it if this client's repo actually moved. The notification email is where this client's own dashboard sends a failed-run alert.</p>
          <div className="client-card-assigned-url muted">
            Automation Dashboard URL: <strong>{client.dashboardUrl}</strong> (assigned automatically, unique to this client)
          </div>
          {editError && <div className="form-error">{editError}</div>}
          <div className="client-card-edit-actions">
            <button type="submit" className="primary-button" disabled={busy}>
              {busy ? 'Saving…' : 'Save'}
            </button>
            <button type="button" className="secondary-button" onClick={() => setEditing(false)} disabled={busy}>
              Cancel
            </button>
          </div>
        </form>
      </div>
    );
  }

  return (
    <div className="client-card">
      <div className="client-card-header">
        <div>
          <h3>
            {client.name}
            {isStale && (
              <span className="stale-badge" title={`No run recorded in over ${STALE_AFTER_DAYS} days`}>
                stale
              </span>
            )}
          </h3>
          {client.description && <p className="muted">{client.description}</p>}
        </div>
        <div className="client-card-header-actions">
          <button className="secondary-button secondary-button-accent" onClick={() => setSharing(true)} disabled={busy}>
            Share access
          </button>
          <button className="secondary-button secondary-button-warning" onClick={startEdit} disabled={busy}>
            Edit
          </button>
          <button className="secondary-button secondary-button-danger" onClick={handleArchive} disabled={busy}>
            {busy ? 'Removing…' : 'Remove'}
          </button>
        </div>
      </div>

      {sharing && <SharePanel client={client} onClose={() => setSharing(false)} />}

      <div className="client-card-stats">
        <div className="stat-tile">
          <div className="stat-tile-label">Total runs</div>
          <div className="stat-tile-value">{stats?.available ? stats.totalRuns : stats === null ? '…' : '—'}</div>
        </div>
        <div className="stat-tile">
          <div className="stat-tile-label">Pass rate</div>
          <div className={`stat-tile-value ${stats?.available ? passRateTextClass(stats.passRate) : ''}`}>
            {stats?.available && stats.passRate != null ? `${stats.passRate}%` : stats === null ? '…' : '—'}
          </div>
        </div>
        <div className="stat-tile">
          <div className="stat-tile-label">Last run</div>
          <div className="stat-tile-value stat-tile-value-small">{stats?.available ? formatDate(stats.lastRunAt) : stats === null ? '…' : 'No data yet'}</div>
        </div>
        <div className="stat-tile">
          <div className="stat-tile-label">Last status</div>
          <div className="stat-tile-value stat-tile-value-small">
            {stats?.available && stats.lastRunStatus ? (
              <span className={`status-badge ${statusBadgeClass(stats.lastRunStatus)}`}>{stats.lastRunStatus}</span>
            ) : stats === null ? (
              '…'
            ) : (
              '—'
            )}
          </div>
        </div>
      </div>

      <div className="client-card-footer">
        <Link to={`/clients/${client.id}`} className="link-button client-card-details-link">
          View details →
        </Link>

        <a className="primary-button client-card-launch" href={client.dashboardUrl}>
          Open Automation Dashboard →
        </a>
      </div>
    </div>
  );
}
