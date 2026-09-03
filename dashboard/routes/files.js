const express = require('express');
const path = require('path');
const fs = require('fs');
const { ALLOWED_FILE_ROOTS } = require('../lib/paths');

const router = express.Router();

// Windows paths are case-insensitive, so a path that differs from our root
// only by case (a lower-case drive letter, most commonly) still points inside
// it. Comparing case-sensitively there rejects legitimate paths, so fold case
// for the comparison only — never for the path we actually read from disk.
const CASE_INSENSITIVE_FS = process.platform === 'win32' || process.platform === 'darwin';
const forCompare = (p) => (CASE_INSENSITIVE_FS ? p.toLowerCase() : p);

/** Resolves ?path= and asserts it falls under an allow-listed root, blocking path traversal. */
function resolveAllowedPath(rawPath) {
  if (!rawPath) return null;
  const resolved = path.resolve(rawPath);
  const candidate = forCompare(resolved);
  const isAllowed = ALLOWED_FILE_ROOTS.some((rawRoot) => {
    const root = forCompare(rawRoot);
    return candidate === root || candidate.startsWith(root + path.sep);
  });
  if (!isAllowed) return null;
  if (!fs.existsSync(resolved)) return null;
  return resolved;
}

function serveFile(req, res, { contentType } = {}) {
  const filePath = resolveAllowedPath(req.query.path);
  if (!filePath) {
    res.status(404).json({ error: 'File not found or not in an allowed directory' });
    return;
  }
  if (contentType) res.type(contentType);
  res.sendFile(filePath);
}

// <img> tag target for failure screenshots captured by Playwright's own attachments.
router.get('/screenshot', (req, res) => serveFile(req, res, { contentType: 'image/png' }));

// <video> tag target; res.sendFile supports Range requests for scrubbing.
router.get('/video', (req, res) => serveFile(req, res));

// Fetched by the service worker of the trace viewer we host ourselves at
// /trace-viewer (see server.js) — same origin, so no CORS headers needed.
// res.sendFile supports the Range requests the viewer uses to read the zip.
router.get('/trace', (req, res) => serveFile(req, res, { contentType: 'application/zip' }));

module.exports = router;
