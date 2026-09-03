import { useEffect, useState } from 'react';
import { createPortal } from 'react-dom';
import { api, type Client, type ClientCredential } from '../api/client';

/**
 * The admin's "give this client's team access" panel: the shared login
 * (see lib/clientCredentials.js) plus the link to sign in with it, and a
 * mailto: link pre-filled with both — no server-side email sending, so
 * nothing here needs real mail credentials, it just hands off to whatever
 * mail app is already configured on this machine.
 *
 * Rendered via a portal straight into document.body — NOT as a child of the
 * client card that opens it. That card has a hover transform
 * (.client-card:hover { transform: ... }), and CSS makes any transformed
 * ancestor the containing block for a position:fixed descendant. Left
 * nested inside the card, this backdrop was being sized/positioned relative
 * to that small card instead of the viewport, and every hover in/out toggle
 * near the button re-triggered that layout — which is exactly what looked
 * like "fluctuating". A portal sidesteps the ancestor chain entirely.
 */
export function SharePanel({ client, onClose }: { client: Client; onClose: () => void }) {
  const [credential, setCredential] = useState<ClientCredential | null>(null);
  const [busy, setBusy] = useState(false);
  const [copied, setCopied] = useState<'username' | 'password' | 'link' | null>(null);
  // An inline confirm step instead of window.confirm() — a native dialog
  // stacking its own dimmed backdrop on top of this panel's own overlay
  // read as a flicker/blur when opening and closing right on top of each other.
  const [confirmingRegenerate, setConfirmingRegenerate] = useState(false);

  const loginLink = `${window.location.origin}/client-login`;

  useEffect(() => {
    api.getClientCredential(client.id).then((res) => setCredential(res.credential));
  }, [client.id]);

  async function handleRegenerate() {
    setConfirmingRegenerate(false);
    setBusy(true);
    try {
      const res = await api.regenerateClientCredential(client.id);
      setCredential(res.credential);
    } finally {
      setBusy(false);
    }
  }

  function copy(value: string, which: typeof copied) {
    navigator.clipboard?.writeText(value).then(() => {
      setCopied(which);
      setTimeout(() => setCopied(null), 1500);
    });
  }

  const mailBody = credential
    ? [
        `You've been given access to the "${client.name}" Automation Dashboard.`,
        '',
        `Link: ${loginLink}`,
        `Username: ${credential.username}`,
        `Password: ${credential.password}`,
      ].join('\n')
    : '';
  const mailtoHref = `mailto:?subject=${encodeURIComponent(`Access to ${client.name}'s dashboard`)}&body=${encodeURIComponent(mailBody)}`;

  return createPortal(
    <div className="share-panel-backdrop" onClick={onClose}>
      <div className="card share-panel" onClick={(e) => e.stopPropagation()}>
        <div className="share-panel-header">
          <h3>Share access — {client.name}</h3>
          <button className="link-button" onClick={onClose}>
            Close
          </button>
        </div>
        <p className="muted">One shared login for this client's team. Anyone with it signs in at the link below and sees only this client's data.</p>

        {!credential ? (
          <div className="muted">Loading…</div>
        ) : (
          <div className="share-panel-fields">
            <label>
              Login link
              <div className="share-panel-row">
                <input readOnly value={loginLink} />
                <button type="button" className="secondary-button" onClick={() => copy(loginLink, 'link')}>
                  {copied === 'link' ? 'Copied!' : 'Copy'}
                </button>
              </div>
            </label>
            <label>
              Username
              <div className="share-panel-row">
                <input readOnly value={credential.username} />
                <button type="button" className="secondary-button" onClick={() => copy(credential.username, 'username')}>
                  {copied === 'username' ? 'Copied!' : 'Copy'}
                </button>
              </div>
            </label>
            <label>
              Password
              <div className="share-panel-row">
                <input readOnly value={credential.password} />
                <button type="button" className="secondary-button" onClick={() => copy(credential.password, 'password')}>
                  {copied === 'password' ? 'Copied!' : 'Copy'}
                </button>
              </div>
            </label>

            <div className="share-panel-actions">
              <a className="primary-button" href={mailtoHref}>
                Email this to the team
              </a>
              {!confirmingRegenerate ? (
                <button type="button" className="secondary-button" onClick={() => setConfirmingRegenerate(true)} disabled={busy}>
                  Regenerate password
                </button>
              ) : null}
            </div>

            {confirmingRegenerate && (
              <div className="share-panel-confirm">
                <span>The old password will stop working immediately. Continue?</span>
                <div className="share-panel-confirm-actions">
                  <button type="button" className="secondary-button secondary-button-danger" onClick={handleRegenerate} disabled={busy}>
                    {busy ? 'Generating…' : 'Yes, regenerate'}
                  </button>
                  <button type="button" className="secondary-button" onClick={() => setConfirmingRegenerate(false)} disabled={busy}>
                    Cancel
                  </button>
                </div>
              </div>
            )}
          </div>
        )}
      </div>
    </div>,
    document.body
  );
}
