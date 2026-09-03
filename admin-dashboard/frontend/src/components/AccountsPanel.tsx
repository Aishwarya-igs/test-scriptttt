import { useEffect, useState } from 'react';
import { api, ApiError, type Account } from '../api/client';
import { useAuth } from '../auth/AuthContext';

/** Lists every admin account and lets you remove one that isn't the account you're currently signed in as. */
export function AccountsPanel() {
  const { username: currentUsername } = useAuth();
  const [accounts, setAccounts] = useState<Account[] | null>(null);
  const [error, setError] = useState<string | null>(null);
  const [busyUser, setBusyUser] = useState<string | null>(null);

  function refetch() {
    api.listAccounts().then((res) => setAccounts(res.accounts));
  }

  useEffect(refetch, []);

  async function handleRemove(username: string) {
    if (!window.confirm(`Remove admin account "${username}"? They will no longer be able to sign in.`)) return;
    setBusyUser(username);
    setError(null);
    try {
      await api.deleteAccount(username);
      refetch();
    } catch (err) {
      setError(err instanceof ApiError ? err.message : 'Could not remove this account');
    } finally {
      setBusyUser(null);
    }
  }

  return (
    <div className="card accounts-panel">
      <h3>Admin accounts</h3>
      {error && <div className="form-error">{error}</div>}
      {accounts === null ? (
        <div className="muted">Loading…</div>
      ) : (
        <ul className="accounts-list">
          {accounts.map((account) => {
            const isSelf = account.username === currentUsername;
            return (
              <li key={account.username} className="accounts-list-row">
                <span>
                  {account.username}
                  {isSelf && <span className="muted"> (you)</span>}
                </span>
                <button
                  className="secondary-button secondary-button-danger"
                  onClick={() => handleRemove(account.username)}
                  disabled={isSelf || busyUser === account.username || accounts.length <= 1}
                  title={isSelf ? "You can't remove the account you're signed in as" : accounts.length <= 1 ? 'Cannot remove the last remaining account' : undefined}
                >
                  {busyUser === account.username ? 'Removing…' : 'Remove'}
                </button>
              </li>
            );
          })}
        </ul>
      )}
    </div>
  );
}
