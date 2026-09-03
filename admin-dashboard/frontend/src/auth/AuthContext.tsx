import { createContext, useContext, useEffect, useState, type ReactNode } from 'react';
import { api } from '../api/client';

interface AuthState {
  authenticated: boolean;
  loading: boolean;
  username: string | null;
  login: (username: string, password: string, remember: boolean) => Promise<void>;
  setup: (username: string, password: string, remember: boolean) => Promise<void>;
  logout: () => Promise<void>;
}

const AuthContext = createContext<AuthState | null>(null);

export function AuthProvider({ children }: { children: ReactNode }) {
  const [authenticated, setAuthenticated] = useState(false);
  const [username, setUsername] = useState<string | null>(null);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    api
      .me()
      .then((res) => {
        setAuthenticated(true);
        setUsername(res.username);
      })
      .catch(() => setAuthenticated(false))
      .finally(() => setLoading(false));
  }, []);

  async function login(user: string, password: string, remember: boolean) {
    const res = await api.login(user, password, remember);
    setAuthenticated(true);
    setUsername(res.username);
  }

  async function setup(user: string, password: string, remember: boolean) {
    const res = await api.setup(user, password, remember);
    setAuthenticated(true);
    setUsername(res.username);
  }

  async function logout() {
    await api.logout().catch(() => {});
    setAuthenticated(false);
    setUsername(null);
  }

  return <AuthContext.Provider value={{ authenticated, loading, username, login, setup, logout }}>{children}</AuthContext.Provider>;
}

export function useAuth() {
  const ctx = useContext(AuthContext);
  if (!ctx) throw new Error('useAuth must be used within AuthProvider');
  return ctx;
}
