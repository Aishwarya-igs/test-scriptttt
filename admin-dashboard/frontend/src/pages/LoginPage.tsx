import { useState, type FormEvent } from 'react';
import { Navigate, useNavigate } from 'react-router-dom';
import { useAuth } from '../auth/AuthContext';
import { ApiError } from '../api/client';

type Mode = 'signin' | 'signup';

export function LoginPage() {
  const { authenticated, login, setup } = useAuth();
  const navigate = useNavigate();
  const [mode, setMode] = useState<Mode>('signin');
  const [username, setUsername] = useState('');
  const [password, setPassword] = useState('');
  const [confirmPassword, setConfirmPassword] = useState('');
  const [remember, setRemember] = useState(false);
  const [showForgot, setShowForgot] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [busy, setBusy] = useState(false);

  if (authenticated) return <Navigate to="/" replace />;

  const isSignup = mode === 'signup';

  function switchMode(next: Mode) {
    setMode(next);
    setError(null);
    setPassword('');
    setConfirmPassword('');
  }

  async function handleSubmit(e: FormEvent) {
    e.preventDefault();
    setError(null);

    if (isSignup) {
      if (password !== confirmPassword) {
        setError('Passwords do not match');
        return;
      }
      if (password.length < 8) {
        setError('Password must be at least 8 characters');
        return;
      }
    }

    setBusy(true);
    try {
      if (isSignup) {
        await setup(username, password, remember);
      } else {
        await login(username, password, remember);
      }
      navigate('/', { replace: true });
    } catch (err) {
      setError(err instanceof ApiError ? err.message : isSignup ? 'Could not create the account' : 'Login failed');
    } finally {
      setBusy(false);
    }
  }

  return (
    <div className="login-page">
      <form className="login-card" onSubmit={handleSubmit}>
        <p className="login-eyebrow">{isSignup ? 'Get started' : 'Please enter your details'}</p>
        <h1>{isSignup ? 'Create your account' : 'Welcome back'}</h1>

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
          autoComplete={isSignup ? 'new-password' : 'current-password'}
          aria-label="Password"
        />
        {isSignup && (
          <input
            className="login-input"
            type="password"
            value={confirmPassword}
            onChange={(e) => setConfirmPassword(e.target.value)}
            placeholder="Confirm password"
            autoComplete="new-password"
            aria-label="Confirm password"
          />
        )}

        <div className="login-options-row">
          <label className="login-remember">
            <input type="checkbox" checked={remember} onChange={(e) => setRemember(e.target.checked)} />
            Remember for 30 days
          </label>
          {!isSignup && (
            <button type="button" className="link-button" onClick={() => setShowForgot((v) => !v)}>
              Forgot password?
            </button>
          )}
        </div>

        {showForgot && !isSignup && (
          <p className="login-forgot-note muted">
            There's no email-based reset — from a terminal on this machine, run{' '}
            <code>node admin-dashboard/scripts/set-admin-password.js &lt;username&gt; &lt;password&gt;</code> to set a new one.
          </p>
        )}

        {error && <div className="login-error">{error}</div>}

        <button type="submit" className="primary-button login-submit" disabled={busy}>
          {busy ? (isSignup ? 'Creating account…' : 'Signing in…') : isSignup ? 'Create account' : 'Sign in'}
        </button>

        <p className="login-switch">
          {isSignup ? (
            <>
              Already have an account?{' '}
              <button type="button" className="link-button" onClick={() => switchMode('signin')}>
                Sign in
              </button>
            </>
          ) : (
            <>
              Don't have an account?{' '}
              <button type="button" className="link-button" onClick={() => switchMode('signup')}>
                Sign up
              </button>
            </>
          )}
        </p>
      </form>
    </div>
  );
}
