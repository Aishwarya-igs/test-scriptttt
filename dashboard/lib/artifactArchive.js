/**
 * Copies a finished test's attachments (screenshot, trace.zip,
 * error-context.md) out of Playwright's test-results/ into a location this
 * dashboard owns, at the moment they're reported.
 *
 * Why this exists: Playwright names test-results/ subfolders by test title,
 * not by dashboard run id, and — confirmed directly, not assumed — wipes the
 * ENTIRE outputDir at the start of every invocation, including a single
 * scoped rerun of one test. A run record that stores the raw path handed to
 * it therefore stops pointing at anything real the moment any later run
 * (of any test, anywhere in the suite) starts. That breaks trace/screenshot
 * links for old runs, and quietly feeds RCA the wrong (or no) page snapshot
 * for a test that failed differently than whatever is currently on disk.
 *
 * Archiving happens the moment 'test-end' is reported, mid-run, which is
 * always before any *later* invocation could have wiped the directory —
 * this dashboard runs one Playwright process at a time, so there is no
 * concurrent invocation to race against.
 */
const fs = require('fs');
const path = require('path');
const { ARTIFACTS_DIR } = require('./paths');

/**
 * Archives whatever attachments still exist on disk for one test, returning
 * a new attachments array with `path` rewritten to the archived copy.
 * Best-effort per attachment: a source file that's already gone, or fails to
 * copy, is left with its original (now-stale) path rather than dropped —
 * losing the reference silently would be worse than a dead link, and this
 * must never throw back into the reporter's fire-and-forget event post.
 */
function archiveAttachments(runId, testId, attachments) {
  if (!attachments?.length) return attachments || [];

  const destDir = path.join(ARTIFACTS_DIR, runId, testId);
  let dirReady = false;
  const ensureDir = () => {
    if (dirReady) return true;
    try {
      fs.mkdirSync(destDir, { recursive: true });
      dirReady = true;
      return true;
    } catch {
      return false;
    }
  };

  return attachments.map((attachment) => {
    if (!attachment?.path) return attachment;
    try {
      if (!fs.existsSync(attachment.path)) return attachment; // already gone — nothing to save
      if (!ensureDir()) return attachment;

      const ext = path.extname(attachment.path);
      const destPath = path.join(destDir, `${attachment.name}${ext}`);
      fs.copyFileSync(attachment.path, destPath);
      return { ...attachment, path: destPath };
    } catch {
      return attachment; // best-effort — a copy failure must not lose the event
    }
  });
}

module.exports = { archiveAttachments };
