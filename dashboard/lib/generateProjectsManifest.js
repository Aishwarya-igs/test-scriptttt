const { execSync } = require('child_process');
const fs = require('fs');
const { REPO_ROOT, PROJECTS_MANIFEST } = require('./paths');

// Lowercase unless first word, so "end-to-end" -> "End to End" instead of
// "End To End" (matches the labels this file already used by hand).
const MINOR_WORDS = new Set(['to', 'of', 'and', 'in', 'on', 'the', 'a']);

function labelFor(name) {
  return name
    .split('-')
    .map((word, i) => (i > 0 && MINOR_WORDS.has(word) ? word : word.charAt(0).toUpperCase() + word.slice(1)))
    .join(' ');
}

function basenameOf(globPattern) {
  return globPattern.split('/').pop();
}

/**
 * Regenerates the `projects` array in dashboard/config/projects.json from
 * Playwright's own resolved config (`playwright test --list` reads
 * playwright.config.ts and reports each project's `testMatch` patterns
 * verbatim), so a new spec file or a renamed/added project shows up in the
 * dashboard without hand-editing this JSON.
 *
 * Deliberately reads `config.projects[].testMatch` rather than the actual
 * listed tests: `--list` silently omits any file matched by the top-level
 * `testIgnore` in playwright.config.ts (e.g. parential-pin.spec.ts,
 * vpn-page-launch.spec.ts, ph_region.spec.ts today), which would otherwise
 * make those specs — and the `region` project entirely — vanish from the
 * manifest even though they're still real project members.
 *
 * `environments` and `tags` aren't derivable from Playwright's config at all
 * (no enumerable source for them), so they're left untouched.
 */
function regenerateProjectsManifest() {
  const raw = execSync('npx playwright test --list --reporter=json', {
    cwd: REPO_ROOT,
    encoding: 'utf-8',
    maxBuffer: 1024 * 1024 * 20,
  });
  // A logger call during config load can print an ANSI-colored line to
  // stdout ahead of the JSON reporter's own output; skip to the first `{`.
  const data = JSON.parse(raw.slice(raw.indexOf('{')));

  const projects = data.config.projects.map((p) => ({
    name: p.name,
    label: labelFor(p.name),
    specs: (Array.isArray(p.testMatch) ? p.testMatch : [p.testMatch]).map(basenameOf),
  }));

  const existing = fs.existsSync(PROJECTS_MANIFEST)
    ? JSON.parse(fs.readFileSync(PROJECTS_MANIFEST, 'utf-8'))
    : {};

  const manifest = { ...existing, projects };
  fs.writeFileSync(PROJECTS_MANIFEST, `${JSON.stringify(manifest, null, 2)}\n`);
  return manifest;
}

module.exports = { regenerateProjectsManifest };

if (require.main === module) {
  regenerateProjectsManifest();
  console.log(`Synced ${PROJECTS_MANIFEST} from playwright.config.ts`);
}
