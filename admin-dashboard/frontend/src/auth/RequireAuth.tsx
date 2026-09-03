import { Navigate, Outlet } from 'react-router-dom';
import { useAuth } from './AuthContext';

export function RequireAuth() {
  const { authenticated, loading } = useAuth();
  if (loading) return <div className="page-loading">Loading…</div>;
  return authenticated ? <Outlet /> : <Navigate to="/login" replace />;
}
