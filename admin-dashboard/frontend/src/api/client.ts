export interface Client {
  id: string;
  name: string;
  repoUrl?: string;
  repoPath: string;
  description: string;
  // Optional: absent on any client onboarded before this field existed.
  email?: string;
  dashboardUrl: string;
  createdAt: string;
  updatedAt: string;
  archivedAt: string | null;
  hasCredential: boolean;
}

export interface ClientCredential {
  username: string;
  password: string;
  createdAt: string;
}

export interface ClientStats {
  available: boolean;
  totalRuns: number;
  passRate: number | null;
  lastRunAt: string | null;
  lastRunStatus: string | null;
}

export interface OverviewStats {
  totalClients: number;
  clientsWithData: number;
  totalRuns: number;
  overallPassRate: number | null;
  lastActivityAt: string | null;
}

export interface RunSummary {
  runId: string;
  createdAt: string | null;
  status: string | null;
  total: number;
  passed: number;
  failed: number;
  skipped: number;
}

export interface FlakyTest {
  file: string;
  title: string;
  passRuns: number;
  failRuns: number;
}

export interface ClientDetail {
  client: Client;
  stats: ClientStats;
  recentRuns: RunSummary[];
  flakyTests: FlakyTest[];
}

export interface Account {
  username: string;
  createdAt: string;
}

class ApiError extends Error {
  status: number;
  constructor(status: number, message: string) {
    super(message);
    this.status = status;
  }
}

async function request<T>(path: string, options: RequestInit = {}): Promise<T> {
  const res = await fetch(`/api${path}`, {
    ...options,
    headers: { 'Content-Type': 'application/json', ...options.headers },
  });
  const body = await res.json().catch(() => ({}));
  if (!res.ok) throw new ApiError(res.status, body.error || `Request failed (${res.status})`);
  return body as T;
}

export const api = {
  setup: (username: string, password: string, remember: boolean) =>
    request<{ authenticated: true; username: string }>('/setup', { method: 'POST', body: JSON.stringify({ username, password, remember }) }),
  login: (username: string, password: string, remember: boolean) =>
    request<{ authenticated: true; username: string }>('/login', { method: 'POST', body: JSON.stringify({ username, password, remember }) }),
  logout: () => request<{ authenticated: false }>('/logout', { method: 'POST' }),
  me: () => request<{ authenticated: true; username: string }>('/me'),

  listClients: () => request<{ clients: Client[] }>('/clients'),
  createClient: (input: { name: string; repoUrl: string; description?: string; email?: string }) =>
    request<{ client: Client }>('/clients', { method: 'POST', body: JSON.stringify(input) }),
  getClientStats: (id: string) => request<{ stats: ClientStats }>(`/clients/${id}/stats`),
  getClientDetail: (id: string) => request<ClientDetail>(`/clients/${id}/detail`),
  updateClient: (id: string, patch: { name?: string; repoUrl?: string; description?: string; email?: string; dashboardUrl?: string }) =>
    request<{ client: Client }>(`/clients/${id}`, { method: 'PATCH', body: JSON.stringify(patch) }),
  archiveClient: (id: string) => request<{ client: Client }>(`/clients/${id}`, { method: 'DELETE' }),
  getOverview: () => request<OverviewStats>('/overview'),

  listAccounts: () => request<{ accounts: Account[] }>('/accounts'),
  deleteAccount: (username: string) => request<{ removed: string }>(`/accounts/${encodeURIComponent(username)}`, { method: 'DELETE' }),

  getClientCredential: (id: string) => request<{ credential: ClientCredential }>(`/clients/${id}/credential`),
  regenerateClientCredential: (id: string) => request<{ credential: ClientCredential }>(`/clients/${id}/credential/regenerate`, { method: 'POST' }),

  // A client-team login — entirely separate session from the admin's own (see lib/clientSession.js).
  clientLogin: (username: string, password: string) =>
    request<{ authenticated: true; clientName: string }>('/client-login', { method: 'POST', body: JSON.stringify({ username, password }) }),
  clientLogout: () => request<{ authenticated: false }>('/client-logout', { method: 'POST' }),
  clientSessionMe: () => request<{ authenticated: true; clientId: string }>('/client-session/me'),
  getClientViewDetail: () => request<ClientDetail>('/client-view/detail'),
};

export { ApiError };
