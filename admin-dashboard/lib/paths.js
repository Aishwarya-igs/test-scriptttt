const path = require('path');

// This app's own root and storage — entirely separate from dashboard/data.
// Nothing here ever points at, or is derived from, a client's repo; each
// client's repoPath is looked up per-request from lib/clients.js instead.
const APP_ROOT = path.resolve(__dirname, '..');
const DATA_DIR = path.join(APP_ROOT, 'data');
const CLIENTS_FILE = path.join(DATA_DIR, 'clients.json');
const FRONTEND_DIST_DIR = path.join(APP_ROOT, 'frontend', 'dist');
// Where an onboarded client's git repo gets cloned to — see lib/clients.js's
// cloneRepo(). Under data/, so it's gitignored the same as everything else
// this app stores locally (clients.json, accounts.json).
const CLIENT_REPOS_DIR = path.join(DATA_DIR, 'client-repos');

module.exports = { APP_ROOT, DATA_DIR, CLIENTS_FILE, FRONTEND_DIST_DIR, CLIENT_REPOS_DIR };
