#!/usr/bin/env node
/**
 * Prints the locator health report — every declared locator resolved against
 * every page the dashboard has captured. See lib/spotfix/locatorAudit.js.
 *
 *   node dashboard/scripts/audit-locators.js            # findings only
 *   node dashboard/scripts/audit-locators.js --all      # include healthy
 *
 * Read-only: this never edits a file. It reports locators that are already
 * broken — most usefully the ones no test has ever failed on, because a
 * method that swallows its own errors turns a dead locator into a quiet
 * "false" instead of a red test.
 */
const { auditLocators } = require('../lib/spotfix/locatorAudit');

const LABEL = {
  invalid: 'BROKEN  ',
  dead: 'DEAD    ',
  ambiguous: 'AMBIGUOUS',
  uncovered: 'UNCHECKED',
  healthy: 'ok      ',
};

(async () => {
  const showAll = process.argv.includes('--all');
  process.stdout.write('Resolving declared locators against captured pages');
  const report = await auditLocators({ onProgress: () => process.stdout.write('.') });
  process.stdout.write('\n\n');

  const { summary, snapshotsUsed, findings } = report;
  console.log(`Pages checked against: ${snapshotsUsed.length}`);
  for (const s of snapshotsUsed.slice(0, 8)) console.log(`  - ${s.label}${s.url ? ` (${s.url.slice(0, 60)})` : ''}`);
  console.log('');
  console.log(
    `Locators: ${summary.total} total | ${summary.invalid || 0} broken | ${summary.dead || 0} dead | ` +
      `${summary.ambiguous || 0} ambiguous | ${summary.uncovered || 0} unchecked | ${summary.healthy || 0} ok`
  );
  console.log('');

  const shown = findings.filter((f) => (showAll ? true : f.verdict !== 'healthy' && f.verdict !== 'uncovered'));
  if (!shown.length) {
    console.log('No broken, dead or ambiguous locators found in what could be checked.');
  }
  let lastFile = '';
  for (const f of shown) {
    if (f.file !== lastFile) {
      console.log(`\n${f.file}`);
      lastFile = f.file;
    }
    console.log(`  ${LABEL[f.verdict]} line ${String(f.line).padEnd(5)} this.${f.name}`);
    console.log(`            ${f.rendered}`);
    console.log(`            → ${f.detail}`);
  }

  if (summary.uncovered && !showAll) {
    console.log(
      `\n(${summary.uncovered} locator(s) could not be checked — dynamic values, or no captured page covers them. ` +
        `Run more tests to capture more pages; baselines are recorded whenever a test passes.)`
    );
  }
})();
