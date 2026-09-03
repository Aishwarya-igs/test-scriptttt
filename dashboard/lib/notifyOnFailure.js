/**
 * Emails a run report — either automatically when a run finishes 'failed'
 * (notifyOnFailure, fire-and-forget from runManager.js) or on demand from
 * the "Email" button next to PDF/Excel on the run detail page
 * (sendRunReportEmail, awaited so the UI can show a real error).
 *
 * Recipients: every current admin account (NOTIFY_ADMIN_EMAILS, set by
 * admin-dashboard's provisioner from its own account list) and this
 * client's own contact address (CLIENT_EMAIL, set from the client record if
 * one was given at onboarding). One email per run, not one per failing
 * test, so a run with many failures doesn't flood anyone's inbox.
 *
 * Uses Twilio SendGrid's plain REST API (v3 Mail Send) via the built-in
 * fetch — no new npm dependency, consistent with the rest of this codebase.
 */
const SENDGRID_ENDPOINT = 'https://api.sendgrid.com/v3/mail/send';

function getRecipients() {
  const admins = (process.env.NOTIFY_ADMIN_EMAILS || '')
    .split(',')
    .map((e) => e.trim())
    .filter(Boolean);
  const clientEmail = (process.env.CLIENT_EMAIL || '').trim();
  const all = clientEmail ? [...admins, clientEmail] : admins;
  return [...new Set(all)];
}

function escapeHtml(text) {
  return String(text).replace(/[&<>"']/g, (c) => ({ '&': '&amp;', '<': '&lt;', '>': '&gt;', '"': '&quot;', "'": '&#39;' }[c]));
}

function buildEmail(run, clientName) {
  const failing = Object.values(run.tests || {}).filter((t) => t.status === 'failed');
  const name = clientName || 'Unknown client';
  const outcome = run.status === 'failed' ? 'failed' : run.status === 'passed' ? 'passed' : run.status;
  const subject =
    run.status === 'failed'
      ? `[${name}] Test run failed — ${run.stats?.failed || failing.length} of ${run.stats?.total || 0} tests failed`
      : `[${name}] Test run report — ${outcome}`;

  const failingSectionHtml = failing.length
    ? `<h3>Failing tests</h3><ul>${failing.map((t) => `<li><strong>${escapeHtml(t.title)}</strong>${t.rca?.category ? ` — ${escapeHtml(t.rca.category)}` : ''}</li>`).join('')}</ul>`
    : '';

  const html = `
    <h2>Test run ${escapeHtml(outcome)} — ${escapeHtml(name)}</h2>
    <p><strong>Client:</strong> ${escapeHtml(name)}</p>
    <p><strong>Run:</strong> ${escapeHtml(run.runId)}<br>
       <strong>When:</strong> ${escapeHtml(run.createdAt || '')}<br>
       <strong>Results:</strong> ${run.stats?.passed ?? 0} passed, ${run.stats?.failed ?? 0} failed, ${run.stats?.skipped ?? 0} skipped (of ${run.stats?.total ?? 0} total)</p>
    ${failingSectionHtml}
  `.trim();

  return { subject, html };
}

const EMAIL_RE = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;

/**
 * Shared send — throws with a clear reason on failure, for callers that need
 * to know (the manual "Email" button); notifyOnFailure below swallows it
 * instead, since that path must never affect the run it's reporting on.
 *
 * `opts.to`, when given (the manual button lets someone type any recipient
 * they want), replaces the admin/client recipient list entirely rather than
 * adding to it — the person clicking "Email" and typing an address is
 * explicitly choosing who this one report goes to.
 *
 * `opts.attachment` — `{ base64, filename }` — is only ever supplied by the
 * manual button too: the on-failure auto-notification runs on the server
 * with no browser DOM available, so it has no way to render the same
 * html2canvas chart capture the PDF export uses.
 */
async function sendRunEmailOrThrow(run, opts = {}) {
  const apiKey = process.env.SENDGRID_API_KEY;
  if (!apiKey) throw new Error('No email provider is configured on the dashboard server (SENDGRID_API_KEY is not set).');

  let recipients;
  if (opts.to) {
    const to = String(opts.to).trim();
    if (!EMAIL_RE.test(to)) throw new Error(`"${to}" doesn't look like a valid email address.`);
    recipients = [to];
  } else {
    recipients = getRecipients();
  }
  if (recipients.length === 0) throw new Error('No notification recipients configured — add admin accounts and/or a client notification email.');

  const clientName = process.env.CLIENT_NAME || null;
  const { subject, html } = buildEmail(run, clientName);
  const from = process.env.SENDGRID_FROM_EMAIL;
  if (!from) throw new Error('No sender is configured on the dashboard server (SENDGRID_FROM_EMAIL is not set).');

  const body = {
    personalizations: [{ to: recipients.map((email) => ({ email })) }],
    from: { email: from },
    subject,
    content: [{ type: 'text/html', value: html }],
  };
  if (opts.attachment) {
    body.attachments = [
      {
        content: opts.attachment.base64,
        filename: opts.attachment.filename || 'run-report.pdf',
        type: 'application/pdf',
        disposition: 'attachment',
      },
    ];
  }

  const res = await fetch(SENDGRID_ENDPOINT, {
    method: 'POST',
    headers: { Authorization: `Bearer ${apiKey}`, 'Content-Type': 'application/json' },
    body: JSON.stringify(body),
  });
  // SendGrid returns 202 with an empty body on success — nothing to parse.
  if (!res.ok) {
    const errBody = await res.text().catch(() => '');
    throw new Error(`Email provider rejected the send (${res.status}): ${errBody.slice(0, 300)}`);
  }
  return { recipients };
}

/** Fire-and-forget, called from runManager.js when a run finishes failed — never allowed to affect the run itself. */
async function notifyOnFailure(run) {
  try {
    await sendRunEmailOrThrow(run);
  } catch (err) {
    console.error('[dashboard] failure-notification email failed (non-fatal):', err.message);
  }
}

/** Manual send for the "Email" button — awaited by the route so the UI can surface a real error instead of silently doing nothing. */
async function sendRunReportEmail(run, opts) {
  return sendRunEmailOrThrow(run, opts);
}

module.exports = { notifyOnFailure, sendRunReportEmail };
