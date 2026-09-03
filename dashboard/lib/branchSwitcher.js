/**
 * Lets an admin point THIS dashboard's own repo checkout at a different
 * branch's latest commit — for testing a feature branch's tests without
 * onboarding a whole separate client through admin-dashboard just to try
 * one branch.
 *
 * Operates on REPO_ROOT directly (git fetch + checkout), then re-installs
 * that repo's own dependencies if it has a package.json (branch may have
 * added/changed test dependencies) and regenerates the projects manifest
 * (branch may have added/removed/renamed Playwright projects) — so the
 * dashboard's own view of "what can I run" is accurate immediately,
 * without needing to restart this server process at all.
 */
const path = require('path');
const fs = require('fs');
const { execFile } = require('child_process');
const { promisify } = require('util');
const { REPO_ROOT } = require('./paths');
const { regenerateProjectsManifest } = require('./generateProjectsManifest');

const execFileAsync = promisify(execFile);

/**
 * Requires a full GitHub branch URL — https://github.com/org/repo/tree/feature/foo
 * — not a bare branch name or a local folder path. Everything after
 * `/tree/` is taken as the branch, including any further slashes, since
 * branch names legitimately contain them (e.g. feature/foo).
 */
function parseBranch(input) {
  const trimmed = (input || '').trim();
  if (!trimmed) throw new Error('A GitHub branch URL is required');
  if (!/^https?:\/\/(www\.)?github\.com\//i.test(trimmed)) {
    throw new Error('Enter a GitHub branch URL, e.g. https://github.com/org/repo/tree/branch-name — not a branch name or local path');
  }
  const treeMatch = trimmed.match(/\/tree\/(.+)$/);
  if (!treeMatch) {
    throw new Error('That GitHub URL is missing /tree/<branch> — copy it from the branch dropdown on GitHub');
  }
  return decodeURIComponent(treeMatch[1]).replace(/\/+$/, '');
}

/** "org/repo", lowercased, from either a GitHub HTTPS URL or an SSH remote (git@github.com:org/repo.git). Null if it doesn't look like a GitHub URL/remote at all. */
function extractRepoPath(url) {
  const match = (url || '').match(/github\.com[/:]([^/]+\/[^/.]+)/i);
  return match ? match[1].toLowerCase() : null;
}

async function getOriginRepoPath() {
  const url = await runGit(['remote', 'get-url', 'origin']);
  return extractRepoPath(url);
}

async function runGit(args, timeout = 60_000) {
  try {
    const { stdout } = await execFileAsync('git', args, { cwd: REPO_ROOT, timeout, windowsHide: true });
    return stdout.trim();
  } catch (err) {
    const detail = (err.stderr || err.message || '').toString().trim().split('\n').slice(-4).join(' ');
    throw new Error(`git ${args.join(' ')} failed: ${detail || 'unknown git error'}`);
  }
}

async function reinstallDependenciesIfPresent() {
  if (!fs.existsSync(path.join(REPO_ROOT, 'package.json'))) return;
  try {
    await execFileAsync('npm', ['install'], { cwd: REPO_ROOT, timeout: 5 * 60_000, shell: true, windowsHide: true });
  } catch (err) {
    // Best-effort: the branch switch itself already succeeded, and a repo's
    // own install issues shouldn't block seeing/using the new checkout.
    console.error('[dashboard] could not reinstall dependencies after branch switch (non-fatal):', err.message);
  }
}

/**
 * Switches REPO_ROOT to the latest commit of `branchInput` (URL or plain
 * name). Never touches dashboard/'s own code or admin-dashboard — this
 * only operates on the client repo the dashboard happens to be running
 * inside of.
 */
async function switchBranch(branchInput) {
  const branch = parseBranch(branchInput);
  if (/[^\w\-./]/.test(branch)) {
    throw new Error('That branch name contains characters that are not safe to pass to git');
  }

  // Only branches of the SAME repo this dashboard was onboarded with are
  // switchable — the repo part of a pasted URL was previously silently
  // ignored (only /tree/<branch> was ever read), so pasting a URL for a
  // different repo just tried that branch name against this repo's own
  // remote, producing a confusing "couldn't find remote ref" error instead
  // of the real reason. Catching the mismatch here explicitly is not a new
  // restriction, just an honest error for a limit that already existed.
  const inputRepoPath = extractRepoPath(branchInput);
  const originRepoPath = await getOriginRepoPath();
  if (inputRepoPath && originRepoPath && inputRepoPath !== originRepoPath) {
    throw new Error(
      `This dashboard is tied to ${originRepoPath} — switching to a different repo (${inputRepoPath}) isn't supported here. Onboard it as a separate client from the admin dashboard instead.`
    );
  }

  await runGit(['fetch', '--depth', '1', 'origin', branch]);
  await runGit(['checkout', '-B', branch, 'FETCH_HEAD']);
  const commit = await runGit(['rev-parse', '--short', 'HEAD']);

  await reinstallDependenciesIfPresent();

  // Best-effort, same posture as server.js's own boot-time call: this
  // branch may have no playwright.config at all (or dependencies that
  // didn't install cleanly above), which is a real, valid outcome — not a
  // reason to report the branch switch itself as having failed.
  let projectCount = 0;
  try {
    const manifest = regenerateProjectsManifest();
    projectCount = manifest.projects.length;
  } catch (err) {
    console.error('[dashboard] could not sync projects.json after branch switch (non-fatal):', err.message);
  }

  return { branch, commit, projectCount };
}

module.exports = { switchBranch, parseBranch };
