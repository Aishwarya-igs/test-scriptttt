/**
 * Recovers what a timed-out test was actually waiting for, from the
 * Playwright trace we already save on every failure.
 *
 * A bare `Test timeout of 180000ms exceeded` carries no stack, no assertion,
 * and no locator — which is why applyTimeoutCategoryGuard (see
 * ./heuristics.js) refuses to categorise it and reports "unknown" rather
 * than letting a model guess. That honesty was correct given the evidence
 * available, but the evidence WAS available; it was just sitting unread
 * inside trace.zip.
 *
 * Playwright's trace is newline-delimited JSON. Every API call emits a
 * `before` with a callId, and a matching `after` when it completes. A test
 * killed by the timeout leaves exactly one call with no `after` — the one
 * still waiting when the clock ran out. That call names the locator, which
 * turns "something hung, cause unknowable" into "hung waiting for
 * locator('video').first() to be attached" — a diagnosis a human or a model
 * can act on, and one that can be checked against the DOM snapshot.
 *
 * Best-effort in the same way as every other enrichment here: any failure
 * (no trace, unreadable zip, unexpected format) returns null and the
 * pipeline behaves exactly as it did before.
 */
const fs = require('fs');
const zlib = require('zlib');

// Reading the trace is only worth it for a hang; a trace.zip here routinely
// runs to tens of megabytes, so this is deliberately never on the common path.
const MAX_ZIP_BYTES = 256 * 1024 * 1024;

const EOCD_SIG = 0x06054b50;
const CENTRAL_SIG = 0x02014b50;
const LOCAL_SIG = 0x04034b50;

/**
 * Extracts the entries whose names satisfy `matchName` from a zip, without
 * reading the whole archive into memory — it seeks to the central directory
 * and then to just the wanted entries' data.
 *
 * A deliberately minimal reader (store + deflate only, no zip64, no
 * encryption) rather than a new dependency: this needs to pull one ~1MB
 * member out of an archive the dashboard already has on disk, and anything
 * it cannot parse simply yields no entries, which the caller treats the same
 * as "no trace available".
 */
function readZipEntries(zipPath, matchName) {
  const stat = fs.statSync(zipPath);
  if (!stat.isFile() || stat.size > MAX_ZIP_BYTES) return [];

  const fd = fs.openSync(zipPath, 'r');
  try {
    const size = stat.size;
    // The end-of-central-directory record sits at the very end, after an
    // optional comment of up to 64KB.
    const tailLen = Math.min(size, 66 * 1024);
    const tail = Buffer.alloc(tailLen);
    fs.readSync(fd, tail, 0, tailLen, size - tailLen);

    let eocd = -1;
    for (let i = tail.length - 22; i >= 0; i -= 1) {
      if (tail.readUInt32LE(i) === EOCD_SIG) {
        eocd = i;
        break;
      }
    }
    if (eocd === -1) return [];

    const entryCount = tail.readUInt16LE(eocd + 10);
    const cdSize = tail.readUInt32LE(eocd + 12);
    const cdOffset = tail.readUInt32LE(eocd + 16);
    if (!cdSize || cdOffset + cdSize > size) return [];

    const cd = Buffer.alloc(cdSize);
    fs.readSync(fd, cd, 0, cdSize, cdOffset);

    const out = [];
    let p = 0;
    for (let i = 0; i < entryCount && p + 46 <= cd.length; i += 1) {
      if (cd.readUInt32LE(p) !== CENTRAL_SIG) break;
      const method = cd.readUInt16LE(p + 10);
      const compressedSize = cd.readUInt32LE(p + 20);
      const nameLen = cd.readUInt16LE(p + 28);
      const extraLen = cd.readUInt16LE(p + 30);
      const commentLen = cd.readUInt16LE(p + 32);
      const localOffset = cd.readUInt32LE(p + 42);
      const name = cd.slice(p + 46, p + 46 + nameLen).toString('utf-8');
      p += 46 + nameLen + extraLen + commentLen;

      if (!matchName(name) || !compressedSize) continue;

      // The central directory's name/extra lengths can differ from the local
      // header's, so the data offset must come from the local header itself.
      const lh = Buffer.alloc(30);
      fs.readSync(fd, lh, 0, 30, localOffset);
      if (lh.readUInt32LE(0) !== LOCAL_SIG) continue;
      const dataOffset = localOffset + 30 + lh.readUInt16LE(26) + lh.readUInt16LE(28);

      const compressed = Buffer.alloc(compressedSize);
      fs.readSync(fd, compressed, 0, compressedSize, dataOffset);

      let content;
      if (method === 0) content = compressed;
      else if (method === 8) content = zlib.inflateRawSync(compressed);
      else continue; // Unsupported compression — skip rather than guess.

      out.push({ name, content });
    }
    return out;
  } finally {
    fs.closeSync(fd);
  }
}

/** Human-readable form of the locator a hanging call was waiting on. */
function describeParams(params = {}) {
  const bits = [];
  if (params.selector) bits.push(`selector: ${params.selector}`);
  if (params.state) bits.push(`waiting for state: ${params.state}`);
  if (params.url) bits.push(`url: ${params.url}`);
  return bits.join(', ');
}

/**
 * The call that was still in flight when the test was killed, or null.
 *
 * Prefers the test-level trace (`test.trace`), whose entries carry a
 * human-readable `title` like "Evaluate locator('video').first()", and falls
 * back to the raw context trace, which names the same call in protocol terms
 * (`Frame.waitForSelector`).
 */
function findHangingAction(tracePath) {
  let entries;
  try {
    entries = readZipEntries(tracePath, (name) => name.endsWith('.trace'));
  } catch {
    return null;
  }
  if (!entries.length) return null;

  // test.trace last so its richer titles win when both describe the same hang.
  entries.sort((a, b) => Number(a.name.includes('test.trace')) - Number(b.name.includes('test.trace')));

  let best = null;
  for (const entry of entries) {
    const open = new Map();
    for (const line of entry.content.toString('utf-8').split('\n')) {
      if (!line.trim()) continue;
      let event;
      try {
        event = JSON.parse(line);
      } catch {
        continue;
      }
      if (!event.callId) continue;
      if (event.type === 'before') open.set(event.callId, event);
      else if (event.type === 'after') open.delete(event.callId);
    }
    if (!open.size) continue;

    // Latest-started open call: with nested calls (a step wrapping the API
    // call that actually blocked), the innermost one started last and is the
    // one genuinely stuck.
    const candidate = [...open.values()].sort((a, b) => (a.startTime || 0) - (b.startTime || 0)).pop();
    if (!candidate) continue;

    best = {
      title: candidate.title || null,
      method: [candidate.class, candidate.method].filter(Boolean).join('.') || null,
      params: candidate.params || {},
      describedParams: describeParams(candidate.params),
      selector: candidate.params?.selector || null,
      // 0 means "no per-action timeout" — it inherited the whole test budget,
      // which is why nothing else got a chance to run.
      inheritedTestTimeout: candidate.params?.timeout === 0 || candidate.params?.timeout === '0',
    };
  }
  return best;
}

/**
 * findHangingAction for a stored test record — resolves the trace attachment
 * the same way loadDomSnapshot resolves its own. Returns null (never throws)
 * when there is no trace, which is the normal case for a non-timeout failure.
 */
function loadHangingAction(test) {
  const attachment = (test?.attachments || []).find((a) => a.name === 'trace' && a.path);
  if (!attachment) return null;
  try {
    return findHangingAction(attachment.path);
  } catch {
    return null;
  }
}

module.exports = { loadHangingAction, findHangingAction, readZipEntries };
