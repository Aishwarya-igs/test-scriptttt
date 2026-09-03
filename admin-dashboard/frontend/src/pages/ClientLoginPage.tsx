import { useState, type FormEvent } from 'react';
import { Link, useNavigate } from 'react-router-dom';
import { api, ApiError } from '../api/client';

/**
 * Separate from the admin LoginPage entirely — this is where the shared
 * credential an admin generated for one client (see SharePanel.tsx) signs
 * in, landing on that one client's own read-only view and nothing else.
 */
export function ClientLoginPage() {
  const navigate = useNavigate();
  const [username, setUsername] = useState('');
  const [password, setPassword] = useState('');
  const [error, setError] = useState<string | null>(null);
  const [busy, setBusy] = useState(false);

  async function handleSubmit(e: FormEvent) {
    e.preventDefault();
    setBusy(true);
    setError(null);
    try {
      await api.clientLogin(username, password);
      navigate('/client-view', { replace: true });
    } catch (err) {
      setError(err instanceof ApiError ? err.message : 'Login failed');
    } finally {
      setBusy(false);
    }
  }

  return (
    <div className="login-page">
      <Link to="/" className="login-back-link">
        ← Admin Dashboard
      </Link>
      <form className="login-card" onSubmit={handleSubmit}>
        <p className="login-eyebrow">Client access</p>
        <h1>View your dashboard</h1>
        <p className="muted" style={{ marginTop: -8 }}>
          Sign in with the credential your admin shared with you.
        </p>

        <input
          className="login-input"
          value={username}
          onChange={(e) => setUsername(e.target.value)}
          placeholder="Username"
          autoFocus
          autoComplete="username"
          aria-label="Username"
        />
        <input
          className="login-input"
          type="password"
          value={password}
          onChange={(e) => setPassword(e.target.value)}
          placeholder="Password"
          autoComplete="current-password"
          aria-label="Password"
        />

        {error && <div className="login-error">{error}</div>}

        <button type="submit" className="primary-button login-submit" disabled={busy}>
          {busy ? 'Signing in…' : 'Sign in'}
        </button>
      </form>
    </div>
  );
}
