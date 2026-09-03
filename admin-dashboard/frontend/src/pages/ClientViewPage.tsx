import { useEffect, useState } from 'react';
import { Navigate, useNavigate } from 'react-router-dom';
import { api, ApiError, type ClientDetail } from '../api/client';
import { ClientDetailView } from '../components/ClientDetailView';

/**
 * The landing page for a client-team login (see ClientLoginPage.tsx) — the
 * same read-only content an admin sees on ClientDetailPage, but for exactly
 * one client (whichever the signed-in credential belongs to, per the
 * client-session cookie) and with none of the admin's other controls
 * (no client list, no onboarding, no account management).
 */
export function ClientViewPage() {
  const navigate = useNavigate();
  const [detail, setDetail] = useState<ClientDetail | null>(null);
  const [unauthenticated, setUnauthenticated] = useState(false);

  useEffect(() => {
    api
      .getClientViewDetail()
      .then(setDetail)
      .catch((err) => {
        if (err instanceof ApiError && err.status === 401) setUnauthenticated(true);
      });
  }, []);

  async function handleLogout() {
    await api.clientLogout().catch(() => {});
    navigate('/client-login', { replace: true });
  }

  if (unauthenticated) return <Navigate to="/client-login" replace />;

  if (!detail) {
    return (
      <div className="overview-page">
        <div className="page-loading">Loading…</div>
      </div>
    );
  }

  const { client } = detail;

  return (
    <div className="overview-page">
      <header className="overview-header">
        <div>
          <h1>{client.name}</h1>
          {client.description && <p className="overview-subtitle">{client.description}</p>}
        </div>
        <div className="overview-header-actions">
          <a className="primary-button" href={client.dashboardUrl}>
            Open Automation Dashboard →
          </a>
          <button className="secondary-button" onClick={handleLogout}>
            Sign out
          </button>
        </div>
      </header>

      <ClientDetailView detail={detail} />
    </div>
  );
}
