/**
 * Creates a real Jira Cloud issue from a failed test — the "Report Bug"
 * button on the run detail page. One REST call, awaited: Jira Cloud answers
 * the create synchronously, so the issue exists (and its key/url come back)
 * before the request even resolves — that's the whole "real time" part,
 * no queue or webhook needed for this direction.
 *
 * Auth (email + API token) and the project/issue-type it files into are
 * configured per client from this dashboard's own Settings page — see
 * integrationSettings.js — falling back to the matching JIRA_* environment
 * variable for whichever field isn't set there yet.
 *
 * The description is built to stand on its own: what broke, how to
 * reproduce it, the actual error, what's already known about the root
 * cause and a fix (when Analyze has been run), and what's attached — so
 * reading the ticket is enough to start triaging, without needing to open
 * the dashboard first.
 */
const fs = require('fs');
const { getJiraConfig } = require('./integrationSettings');

function authHeader(cfg) {
  return `Basic ${Buffer.from(`${cfg.email}:${cfg.apiToken}`).toString('base64')}`;
}

const REQUIRED_FIELDS = { baseUrl: 'Jira Base URL', email: 'Jira Email', apiToken: 'Jira API Token', projectKey: 'Jira Project Key' };
function assertConfigured(cfg) {
  const missing = Object.entries(REQUIRED_FIELDS)
    .filter(([field]) => !cfg[field])
    .map(([, label]) => label);
  if (missing.length) {
    throw new Error(`Jira isn't configured for this dashboard yet — set ${missing.join(', ')} on the Settings page.`);
  }
}

// Jira Cloud documents have a real size ceiling — a runaway stack trace or
// console dump would otherwise risk the whole create request being
// rejected. Truncating keeps this reliable regardless of how noisy a given
// failure's output is; the full text is never lost, since the trace/video
// attachments (below) carry the complete record.
const MAX_BLOCK_CHARS = 4000;
function clip(text) {
  if (!text) return text;
  return text.length > MAX_BLOCK_CHARS ? `${text.slice(0, MAX_BLOCK_CHARS)}\n… (truncated — see the attached trace for the full log)` : text;
}

/** A minimal, purpose-built plain-text → ADF converter — just the fixed
 * shapes this description ever needs, not a general markdown renderer.
 * Jira Cloud's v3 issue API requires `description` as this structured
 * document format; plain strings or markdown are rejected outright. */
function paragraph(text) {
  return { type: 'paragraph', content: text ? [{ type: 'text', text }] : [] };
}
function codeBlock(text) {
  return { type: 'codeBlock', attrs: { language: 'text' }, content: [{ type: 'text', text: clip(text) }] };
}
function heading(text) {
  return { type: 'heading', attrs: { level: 3 }, content: [{ type: 'text', text }] };
}
function bulletList(items) {
  return { type: 'bulletList', content: items.map((text) => ({ type: 'listItem', content: [paragraph(text)] })) };
}
function orderedList(items) {
  return { type: 'orderedList', content: items.map((text) => ({ type: 'listItem', content: [paragraph(text)] })) };
}

/** Everything after the initial `test.titlePath()` breadcrumb (the file
 * itself) — describe/test nesting read as plain-English navigation, since
 * that's usually the closest thing to real reproduction steps a
 * structural Playwright test record actually carries. */
function reproSteps({ test, run }) {
  const steps = [];
  if (run?.trigger?.env) steps.push(`Set the environment to "${run.trigger.env}".`);
  const target = test.project ? `--project="${test.project}" ` : '';
  steps.push(`Run: npx playwright test "${test.file}" ${target}`.trim());
  const breadcrumb = (test.titlePath || []).filter(Boolean);
  if (breadcrumb.length > 1) steps.push(`Follow: ${breadcrumb.join(' › ')}`);
  steps.push(`Observe the failure at ${test.file}:${test.line} (see Error below).`);
  return steps;
}

/** Jira labels can't contain spaces or most punctuation — this is a
 * best-effort slug, not a validator; a label that ends up empty after
 * stripping is simply left out rather than sent as "". */
function labelSlug(text) {
  return String(text || '')
    .toLowerCase()
    .replace(/[^a-z0-9]+/g, '-')
    .replace(/^-+|-+$/g, '');
}

/** Auto-tags so issues are filterable in Jira later without any manual
 * tagging — by client and, once Analyze has run, by RCA category. */
function buildLabels({ clientName, test }) {
  const labels = [];
  const client = labelSlug(clientName);
  if (client) labels.push(`client-${client}`);
  if (test?.rca?.category) labels.push(`rca-${labelSlug(test.rca.category)}`);
  return labels;
}

function attachmentBlurb(name) {
  if (name === 'screenshot') return 'screenshot.png — page state at the moment of failure';
  if (name === 'video') return 'video — full screen recording of the run';
  if (name === 'trace') return 'trace.zip — open in the Playwright Trace Viewer for the complete step-by-step action/network/console log';
  return name;
}

/** `test`/`run` are only present for a per-test report (the button inside a
 * failed row); the sidebar's general "Report a bug" form has neither — just
 * whatever the person typed — so every test/run-specific section below is
 * conditional on actually having one. */
function buildDescription({ test, run, clientName, dashboardUrl, notes, attached }) {
  const content = [];
  if (notes) content.push(paragraph(notes));

  const details = [`Client: ${clientName || 'Unknown'}`];
  if (run) details.push(`Environment: ${run.trigger?.env || '–'}`, `Run: ${run.runId}`);
  if (test) details.push(`Test file: ${test.file}:${test.line}`);
  if (dashboardUrl) details.push(`Dashboard: ${dashboardUrl}`);
  content.push(bulletList(details));

  if (test) {
    content.push(heading('Issue'));
    content.push(paragraph(test.error?.message ? clip(test.error.message) : `"${test.title}" failed.`));

    content.push(heading('Steps to reproduce'));
    content.push(orderedList(reproSteps({ test, run })));

    if (test.error?.stack || test.error?.message) {
      content.push(heading('Error / stack trace'));
      content.push(codeBlock(test.error.stack || test.error.message));
    }

    content.push(heading('Root cause'));
    if (test.rca?.summary) {
      const rootCauseText = test.rca.rootCause && test.rca.rootCause !== test.rca.summary ? test.rca.rootCause : test.rca.summary;
      content.push(paragraph(`${test.rca.category ? `[${test.rca.category}] ` : ''}${test.rca.summary}`));
      if (rootCauseText !== test.rca.summary) content.push(paragraph(rootCauseText));
    } else {
      content.push(paragraph('Not analyzed yet — run "Analyze failure" on the dashboard for an automated root-cause read before triaging.'));
    }

    content.push(heading('Suggested fix'));
    if (test.rca?.suggestedFix) {
      content.push(codeBlock(test.rca.suggestedFix));
    } else {
      content.push(paragraph('No suggested fix generated yet.'));
    }
  }

  content.push(heading('Attachments'));
  content.push(attached.length ? bulletList(attached.map((a) => attachmentBlurb(a.name))) : paragraph('Nothing attached.'));

  return { type: 'doc', version: 1, content };
}

const MAX_ATTACHMENT_BYTES = 20 * 1024 * 1024;

/** Best-effort — a failed or oversized attachment upload never undoes the
 * issue itself, since the issue is the part that actually matters. Returns
 * the attachment names that actually made it, so the description (built
 * beforehand) and reality can be cross-checked if needed. */
async function uploadAttachments(cfg, key, attachments) {
  const uploaded = [];
  for (const a of attachments) {
    if (!a.path) continue;
    try {
      const stat = fs.statSync(a.path);
      if (stat.size > MAX_ATTACHMENT_BYTES) {
        console.error(`[dashboard] skipping ${a.name} attachment for ${key} — ${(stat.size / 1e6).toFixed(1)}MB exceeds the ${MAX_ATTACHMENT_BYTES / 1e6}MB upload limit`);
        continue;
      }
      const bytes = fs.readFileSync(a.path);
      const form = new FormData();
      const ext = a.path.split('.').pop();
      form.append('file', new Blob([bytes]), `${a.name}.${ext}`);
      const res = await fetch(`${cfg.baseUrl}/rest/api/3/issue/${key}/attachments`, {
        method: 'POST',
        headers: { Authorization: authHeader(cfg), 'X-Atlassian-Token': 'no-check', Accept: 'application/json' },
        body: form,
      });
      if (res.ok) uploaded.push(a.name);
      else console.error(`[dashboard] Jira rejected the ${a.name} attachment for ${key} (${res.status})`);
    } catch (err) {
      console.error(`[dashboard] could not attach ${a.name} to ${key} (non-fatal — the issue itself was created):`, err.message);
    }
  }
  return uploaded;
}

async function createJiraIssue({ test, run, clientName, dashboardUrl, summary, notes, priority }) {
  const cfg = getJiraConfig();
  assertConfigured(cfg);
  if (!summary && !test) throw new Error('A summary is required.');
  const baseUrl = cfg.baseUrl.replace(/\/+$/, '');
  const projectKey = cfg.projectKey;
  const issueType = cfg.issueType || 'Bug';

  // Screenshot, video, and trace — whichever of the three Playwright
  // actually captured for this test — uploaded as real Jira attachments
  // (not inlined into the description body: Jira's inline-media embed API
  // needs a fragile issue-specific `collection` value that isn't
  // consistently documented, so attaching them as files is the reliable
  // choice over one that might silently fail to render).
  const candidateAttachments = ['screenshot', 'video', 'trace']
    .map((name) => (test?.attachments || []).find((a) => a.name === name && a.path))
    .filter(Boolean);

  const fields = {
    project: { key: projectKey },
    issuetype: { name: issueType },
    summary: summary || `[${clientName || 'Unknown client'}] ${test.title}`,
    description: buildDescription({ test, run, clientName, dashboardUrl, notes, attached: candidateAttachments }),
  };
  if (priority) fields.priority = { name: priority };
  const labels = buildLabels({ clientName, test });
  if (labels.length) fields.labels = labels;

  const res = await fetch(`${baseUrl}/rest/api/3/issue`, {
    method: 'POST',
    headers: { Authorization: authHeader(cfg), 'Content-Type': 'application/json', Accept: 'application/json' },
    body: JSON.stringify({ fields }),
  });
  if (!res.ok) {
    const body = await res.text().catch(() => '');
    throw new Error(`Jira rejected the issue (${res.status}): ${body.slice(0, 400)}`);
  }
  const created = await res.json();
  const key = created.key;
  const url = `${baseUrl}/browse/${key}`;

  if (candidateAttachments.length) await uploadAttachments(cfg, key, candidateAttachments);

  return { key, url, createdAt: new Date().toISOString() };
}

/**
 * Keeps an already-filed issue current instead of letting it go stale: a
 * fresh Analyze, a spot fix being applied/verified/reverted — anything that
 * changes what's known about a test that already has a Jira issue posts
 * here rather than requiring the reporter to go find and re-read the
 * dashboard themselves. Always best-effort: called fire-and-forget from
 * runManager, since a Jira hiccup must never affect RCA/spot-fix flows.
 */
async function addJiraComment(issueKey, text) {
  const cfg = getJiraConfig();
  assertConfigured(cfg);
  const baseUrl = cfg.baseUrl.replace(/\/+$/, '');
  const res = await fetch(`${baseUrl}/rest/api/3/issue/${issueKey}/comment`, {
    method: 'POST',
    headers: { Authorization: authHeader(cfg), 'Content-Type': 'application/json', Accept: 'application/json' },
    body: JSON.stringify({ body: { type: 'doc', version: 1, content: [paragraph(clip(text))] } }),
  });
  if (!res.ok) {
    const body = await res.text().catch(() => '');
    throw new Error(`Jira rejected the comment on ${issueKey} (${res.status}): ${body.slice(0, 300)}`);
  }
}

/**
 * The real issue types a given Jira project actually has — for the
 * Settings page's "Fetch issue types" button. This exists because a
 * generic guess like "Bug" isn't always right: a Jira Service Management
 * project, for instance, might only offer "Incident" or "Service request".
 * Takes credentials directly rather than reading getJiraConfig(), since
 * this is meant to work on whatever's currently typed into the form,
 * before it's been saved.
 */
async function fetchIssueTypes({ baseUrl, email, apiToken, projectKey }) {
  const missing = ['baseUrl', 'email', 'apiToken', 'projectKey'].filter((f) => !{ baseUrl, email, apiToken, projectKey }[f]);
  if (missing.length) throw new Error(`Fill in Jira Base URL, Email, API Token, and Project Key first.`);
  const cleanBaseUrl = baseUrl.replace(/\/+$/, '');
  const res = await fetch(`${cleanBaseUrl}/rest/api/3/issue/createmeta/${encodeURIComponent(projectKey)}/issuetypes`, {
    headers: { Authorization: authHeader({ email, apiToken }), Accept: 'application/json' },
  });
  if (!res.ok) {
    const body = await res.text().catch(() => '');
    throw new Error(`Jira rejected the request (${res.status}): ${body.slice(0, 300)}`);
  }
  const data = await res.json();
  return (data.issueTypes || []).map((t) => ({ name: t.name, description: t.description || '' }));
}

module.exports = { createJiraIssue, addJiraComment, fetchIssueTypes };
