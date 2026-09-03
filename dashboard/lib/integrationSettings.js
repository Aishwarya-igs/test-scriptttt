/**
 * Per-client Jira credentials, configured from this dashboard's own Settings
 * page instead of the server's .env file. Each client's own dashboard
 * process has its own copy of this file (dashboard/data/jira-settings.json,
 * already covered by dashboard/.gitignore's data/ exclusion) — nothing
 * entered here is ever shared with, or visible to, another client.
 *
 * A field left unset here falls back to the matching JIRA_* environment
 * variable (still readable via admin-dashboard's provisioner, for whichever
 * clients already had it configured that way) — so existing setups keep
 * working untouched, and moving to the Settings page is optional per field.
 */
const fs = require('fs');
const path = require('path');
const { DATA_DIR } = require('./paths');

const SETTINGS_PATH = path.join(DATA_DIR, 'jira-settings.json');

function readStored() {
  try {
    return JSON.parse(fs.readFileSync(SETTINGS_PATH, 'utf-8'));
  } catch {
    return {};
  }
}

function writeStored(data) {
  fs.mkdirSync(path.dirname(SETTINGS_PATH), { recursive: true });
  fs.writeFileSync(SETTINGS_PATH, JSON.stringify(data, null, 2));
}

/** The config jiraClient.js actually uses — stored value per field, else the environment. */
function getJiraConfig() {
  const stored = readStored();
  return {
    baseUrl: stored.baseUrl || process.env.JIRA_BASE_URL || '',
    email: stored.email || process.env.JIRA_EMAIL || '',
    apiToken: stored.apiToken || process.env.JIRA_API_TOKEN || '',
    projectKey: stored.projectKey || process.env.JIRA_PROJECT_KEY || '',
    issueType: stored.issueType || process.env.JIRA_ISSUE_TYPE || 'Bug',
  };
}

/** What the Settings page gets back — the real token is never sent to the browser again once saved. */
function getPublicJiraSettings() {
  const cfg = getJiraConfig();
  return {
    baseUrl: cfg.baseUrl,
    email: cfg.email,
    projectKey: cfg.projectKey,
    issueType: cfg.issueType,
    tokenConfigured: Boolean(cfg.apiToken),
    tokenPreview: cfg.apiToken ? `••••••${cfg.apiToken.slice(-4)}` : null,
  };
}

/**
 * `apiToken` is only overwritten when a new, non-empty value is submitted —
 * an empty token field on save means "leave the stored one alone", so
 * updating just the project key doesn't force re-entering the token too.
 */
function saveJiraSettings({ baseUrl, email, apiToken, projectKey, issueType }) {
  const stored = readStored();
  const next = {
    baseUrl: baseUrl ?? stored.baseUrl ?? '',
    email: email ?? stored.email ?? '',
    apiToken: apiToken ? apiToken : stored.apiToken || '',
    projectKey: projectKey ?? stored.projectKey ?? '',
    issueType: issueType ?? stored.issueType ?? '',
  };
  writeStored(next);
  return getPublicJiraSettings();
}

module.exports = { getJiraConfig, getPublicJiraSettings, saveJiraSettings };
