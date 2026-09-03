import { useEffect, useState } from 'react';
import { Link, useParams } from 'react-router-dom';
import { api, type ClientDetail } from '../api/client';
import { ClientDetailView } from '../components/ClientDetailView';

/** One client's own drill-down — same read-only posture as the overview cards, just one level deeper: recent runs and cross-run flaky tests. */
export function ClientDetailPage() {
  const { clientId } = useParams<{ clientId: string }>();
  const [detail, setDetail] = useState<ClientDetail | null>(null);
  const [notFound, setNotFound] = useState(false);

  useEffect(() => {
    if (!clientId) return;
    api
      .getClientDetail(clientId)
      .then(setDetail)
      .catch(() => setNotFound(true));
  }, [clientId]);

  if (notFound) {
    return (
      <div className="overview-page">
        <Link to="/" className="link-button">
          ← Back to all clients
        </Link>
        <div className="card empty-state">This client doesn't exist (it may have been removed).</div>
      </div>
    );
  }

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
      <Link to="/" className="link-button">
        ← Back to all clients
      </Link>

      <header className="overview-header">
        <div>
          <h1>{client.name}</h1>
          <p className="client-card-path" title={client.repoPath}>
            {client.repoPath}
          </p>
        </div>
        <a className="primary-button" href={client.dashboardUrl}>
          Open Automation Dashboard →
        </a>
      </header>

      <ClientDetailView detail={detail} />
    </div>
  );
}
