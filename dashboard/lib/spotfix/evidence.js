/**
 * The audit trail behind a proposed fix: every check this pipeline ran, what
 * each concluded, and — the part that matters most — which ones could not be
 * run at all.
 *
 * Until now the checks were invisible when they passed. A proposal with no
 * warnings looked identical to a proposal nothing had been able to examine,
 * and the difference between those two is the whole question. That gap is how
 * a locator built from the page `<title>` reached a reviewer looking clean,
 * and how a green rerun then read as confirmation.
 *
 * So 'unknown' is a first-class outcome here, never folded into 'pass'. A
 * ledger reading "4 passed, 3 could not be checked" is a fundamentally
 * different claim from "4 passed", and a reviewer deserves to see which one
 * they have.
 *
 * This deliberately does not compute a score or a percentage. Every check is
 * evidence about a different property — that the snippet exists, that the
 * methods are real, that the locator matches something — and none of them,
 * alone or summed, establishes that the fix is CORRECT. The strength label
 * below describes how much was verified, not how likely the fix is to be
 * right.
 */
const fs = require('fs');
const { classifyTextEvidence } = require('./domEvidence');
const { extractLocatorExpressions, parseLocatorDeclarations, describeLocator } = require('./locatorSyntax');

const PASS = 'pass';
const FAIL = 'fail';
const UNKNOWN = 'unknown';
const NA = 'not-applicable';

const check = (id, label, status, detail) => ({ id, label, status, detail });

/**
 * Locator expressions the edit introduces, including ones reached through a
 * reference.
 *
 * The dominant idiom in this repo is
 * `this.page.locator(this.liveTag.selector)` — the locator's actual value
 * lives in a declaration elsewhere in the class, so reading only the edited
 * lines finds no text to check and every such fix reports "not applicable".
 * That is the most common fix shape here, so leaving it unevaluated would
 * make the ledger silent exactly where it is most needed. Newly referenced
 * declarations are resolved and folded in.
 */
function introducedLocators(edit) {
  const before = new Set(extractLocatorExpressions(edit.oldCode).map((d) => (d.raw || '').replace(/\s+/g, ' ')));
  const found = extractLocatorExpressions(edit.newCode).filter(
    (d) => !before.has((d.raw || '').replace(/\s+/g, ' '))
  );

  const referencedBefore = new Set([...edit.oldCode.matchAll(/\bthis\.(\w+)\b/g)].map((m) => m[1]));
  const referencedNow = [...new Set([...edit.newCode.matchAll(/\bthis\.(\w+)\b/g)].map((m) => m[1]))].filter(
    (name) => !referencedBefore.has(name)
  );
  if (!referencedNow.length || !edit.absolutePath) return found;

  let content;
  try {
    content = fs.readFileSync(edit.absolutePath, 'utf-8');
  } catch {
    return found;
  }
  const declarations = new Map(parseLocatorDeclarations(content).map((d) => [d.name, d]));
  for (const name of referencedNow) {
    const declaration = declarations.get(name);
    if (declaration) found.push(declaration);
  }
  return found;
}

const hasRisk = (edits, id) => edits.some((e) => (e.risks || []).some((r) => r.id === id));
const risksOfSeverity = (edits, severity) =>
  edits.flatMap((e) => (e.risks || []).filter((r) => r.severity === severity));

/**
 * Did the source snippet this edit replaces actually exist, uniquely enough to
 * be located? Guaranteed by validateEdit — an edit that failed this never
 * became an edit — but worth stating, because "the model paraphrased the code
 * it claimed to be editing" is a common and otherwise invisible failure.
 */
function anchorCheck(edits) {
  const ambiguous = edits.filter((e) => e.occurrenceCount > 1);
  return check(
    'snippet-anchored',
    'The code being replaced exists in the file',
    PASS,
    ambiguous.length
      ? `Matched byte-for-byte against the file on disk. ${ambiguous.length} snippet(s) appear more than once and were pinned to the occurrence inside the failing test.`
      : `Matched byte-for-byte against the file on disk, at a unique location in ${edits.length === 1 ? 'the file' : `each of ${edits.length} files`}.`
  );
}

/**
 * Every page-object method the edit calls is one that class really declares.
 * Enforced as a hard rejection during validation (see findUngroundedCall), so
 * surviving edits have passed it.
 */
function groundingCheck(edits, receiverIndexSize) {
  if (!receiverIndexSize) {
    return check(
      'calls-grounded',
      'Methods called actually exist',
      UNKNOWN,
      'No page-object instance in this test could be resolved to a class, so calls in the edit could not be checked against a real method list.'
    );
  }
  return check(
    'calls-grounded',
    'Methods called actually exist',
    PASS,
    'Every method and locator the edit references was found in the declaring class. A call to a method that does not exist is rejected before it reaches this panel.'
  );
}

/** Is the locator's text on the page that was actually captured when the test failed? */
function domEvidenceCheck(edits, domSnapshot) {
  if (!domSnapshot) {
    return check(
      'locator-in-captured-dom',
      'Locator matches the page captured at failure',
      UNKNOWN,
      'No DOM snapshot was captured for this failure, so the locator could not be compared against what the app actually rendered.'
    );
  }

  const verdicts = [];
  for (const edit of edits) {
    for (const descriptor of introducedLocators(edit)) {
      const evidence = classifyTextEvidence(descriptor, domSnapshot);
      if (evidence.verdict !== 'unknown') verdicts.push({ evidence, descriptor });
    }
  }

  if (!verdicts.length) {
    return check(
      'locator-in-captured-dom',
      'Locator matches the page captured at failure',
      NA,
      'This edit does not introduce a locator with text that can be checked against the captured page (it changes logic, or reuses a locator declared elsewhere).'
    );
  }

  const absent = verdicts.find((v) => v.evidence.verdict === 'absent');
  if (absent) {
    return check(
      'locator-in-captured-dom',
      'Locator matches the page captured at failure',
      FAIL,
      `${describeLocator(absent.descriptor)} looks for ${absent.evidence.describe}, which does not appear anywhere in the page captured when this test failed.`
    );
  }
  return check(
    'locator-in-captured-dom',
    'Locator matches the page captured at failure',
    PASS,
    `Found in the rendered body of the page captured at failure${
      verdicts[0].evidence.describe ? ` (${verdicts[0].evidence.describe})` : ''
    } — not in <head> metadata, and not invented.`
  );
}

/** Did a real browser, just now, find the proposed locator on the live page? */
function liveProbeCheck(edits) {
  const probed = edits.filter((e) => e.liveProbe);
  if (!probed.length) {
    return check(
      'live-probe',
      'Locator found on the live page right now',
      UNKNOWN,
      'The live check did not run — no browser available, the page could not be reached, or the edit changes no locator. This is not a negative result.'
    );
  }

  const dead = [];
  const alive = [];
  for (const edit of probed) {
    for (const result of edit.liveProbe.new || []) {
      (result.count === 0 ? dead : alive).push(result);
    }
  }

  if (dead.length) {
    return check(
      'live-probe',
      'Locator found on the live page right now',
      FAIL,
      `"${dead[0].selector}" matched 0 elements at ${probed[0].liveProbe.landedUrl}. Note this probe runs unauthenticated, so app state may differ from the failing test's session.`
    );
  }
  if (!alive.length) {
    return check('live-probe', 'Locator found on the live page right now', UNKNOWN, 'The probe ran but returned no comparable result.');
  }
  return check(
    'live-probe',
    'Locator found on the live page right now',
    PASS,
    `Checked against the live page at ${probed[0].liveProbe.landedUrl}: ${alive
      .map((r) => `"${r.selector}" matched ${r.count} element${r.count === 1 ? '' : 's'}`)
      .join('; ')}.`
  );
}

/**
 * Does a locator this edit reuses BY NAME (`this.liveTag`, not a freshly
 * written selector) resolve to exactly one element on the page captured at
 * failure — or does it only look safe because a prior check never counted
 * past one?
 *
 * `verifiedRelated` (see verifyRelatedLocators in ./index.js) is a prompt-time
 * warning: it tells the model a name is ambiguous and instructs it not to
 * reuse it bare. A real incident proved that instruction alone is not
 * enough — a model reused `this.liveTag` (confirmed to match 2 elements on
 * the exact page this failure was captured on) completely unchanged, twice,
 * across two independent generations, despite the warning being present in
 * both prompts. This is the hard backstop for when a model does not comply:
 * the same verified data, but as a rejection a human reviewer sees on the
 * evidence ledger rather than an instruction that can be silently ignored.
 *
 * Deliberately narrow: only fires on a name-for-name reuse with no narrowing
 * added (`this.getRoleLocator(this.liveTag)`, `this.page.locator(this.liveTag.selector)`).
 * An edit that adds its own `.filter(...)`/text scoping on top is a genuinely
 * different, possibly-fixed locator and is not what this is checking.
 */
function ambiguityCheck(edits, verifiedRelated) {
  if (!verifiedRelated) {
    return check(
      'locator-reuse-unambiguous',
      'A reused locator resolves to exactly one element',
      UNKNOWN,
      'No verified data on this class\'s declared locators was available, so a reused locator\'s ambiguity could not be checked.'
    );
  }

  const ambiguous = [];
  for (const edit of edits) {
    const referencedBefore = new Set([...edit.oldCode.matchAll(/\bthis\.(\w+)\b/g)].map((m) => m[1]));
    const referencedNow = [...new Set([...edit.newCode.matchAll(/\bthis\.(\w+)\b/g)].map((m) => m[1]))].filter(
      (name) => !referencedBefore.has(name)
    );
    for (const name of referencedNow) {
      const result = verifiedRelated[name];
      if (result && typeof result.count === 'number' && result.count > 1) {
        ambiguous.push({ name, count: result.count });
      }
    }
  }

  if (ambiguous.length) {
    return check(
      'locator-reuse-unambiguous',
      'A reused locator resolves to exactly one element',
      FAIL,
      ambiguous
        .map((a) => `this.${a.name} matches ${a.count} elements on the page captured at failure`)
        .join('; ') +
        `. Reusing it bare (no added narrowing) resolves to whichever one a position-based .first()/[0] happens to pick — not necessarily the intended element. A rerun passing does not settle this: it would pass whenever the arbitrary pick happens to be right, and stay silently wrong whenever it isn't.`
    );
  }
  return check(
    'locator-reuse-unambiguous',
    'A reused locator resolves to exactly one element',
    PASS,
    'Every already-declared locator this edit reuses by name resolves to exactly one element on the page captured at failure.'
  );
}

/**
 * Does the replacement locator find the same element the test used to pass
 * against? The strongest available evidence for a locator repair, because it
 * is the only check that compares against a page where the test worked rather
 * than reasoning about the broken one.
 */
function baselineCheck(edits) {
  const compared = edits.filter((e) => e.baselineMatch);
  if (!compared.length) {
    return check(
      'baseline-element-match',
      'Finds the same element the test used to pass against',
      UNKNOWN,
      'No passing baseline is stored for this test yet (or the locator could not be resolved in it), so the replacement could not be compared with what previously worked. Baselines are recorded whenever a test passes.'
    );
  }
  const worst = compared.reduce((a, b) => (a.baselineMatch.score <= b.baselineMatch.score ? a : b));
  const { score, was, now, matched } = worst.baselineMatch;
  if (score < 0.5) {
    return check(
      'baseline-element-match',
      'Finds the same element the test used to pass against',
      FAIL,
      `When this test last passed the locator matched ${was}; the replacement matches ${now} on the failing page (similarity ${score}).`
    );
  }
  return check(
    'baseline-element-match',
    'Finds the same element the test used to pass against',
    PASS,
    `Matches the element this test passed against previously (similarity ${score}; agrees on ${matched.join(', ') || 'structure'}) — the selector changed, the target did not.`
  );
}

/** Does the fix still test what it claims to, or has it been weakened? */
function integrityCheck(edits) {
  const high = risksOfSeverity(edits, 'high');
  if (high.length) {
    return check(
      'test-integrity',
      'The test still checks what it did before',
      FAIL,
      high.map((r) => r.label).join('; ') + '. A rerun cannot clear this — it would pass by construction.'
    );
  }
  if (hasRisk(edits, 'locator-off-subject')) {
    return check(
      'test-integrity',
      'The test still checks what it did before',
      FAIL,
      'The replacement locator does not distinguish the condition the method exists to establish, so the check can pass whether or not that condition holds.'
    );
  }
  return check(
    'test-integrity',
    'The test still checks what it did before',
    PASS,
    'No assertion was rewritten, removed, skipped, hardcoded, or rerouted, and no wait was replaced by a fixed sleep.'
  );
}

/** Does the change respect the project's documented test architecture? */
function architectureCheck(edits, conventionsLoaded) {
  if (!conventionsLoaded) {
    return check(
      'architecture',
      "Follows the project's test architecture",
      UNKNOWN,
      'No architecture rules were found for this project, so the change could not be checked against them.'
    );
  }
  const ids = ['locator-in-spec', 'wait-in-spec', 'dom-query-in-spec', 'playwright-import-in-spec', 'playwright-in-business-function', 'inline-locator-in-method', 'duplicate-locator'];
  const violated = edits.flatMap((e) => (e.risks || []).filter((r) => ids.includes(r.id)));
  if (violated.length) {
    return check('architecture', "Follows the project's test architecture", FAIL, violated.map((r) => r.label).join('; ') + '.');
  }
  return check(
    'architecture',
    "Follows the project's test architecture",
    PASS,
    'Selectors, waits and DOM access stay in the page-object layer; no forbidden imports were added to specs or business functions.'
  );
}

/** Has this exact change already been tried on this test and failed? */
function priorAttemptCheck(edits, priorAttempts) {
  if (!priorAttempts?.length) {
    return check('not-retried', 'Not a change already disproven', PASS, 'No previous fix for this test was applied, rerun, and found still failing.');
  }
  if (hasRisk(edits, 'repeats-disproven-attempt')) {
    return check(
      'not-retried',
      'Not a change already disproven',
      FAIL,
      'This same change was applied to this test before, rerun for real, and the test still failed.'
    );
  }
  return check(
    'not-retried',
    'Not a change already disproven',
    PASS,
    `${priorAttempts.length} earlier fix attempt(s) for this test were applied and disproven; this proposal differs from all of them.`
  );
}

/** Did more than one model independently land on this? */
function consensusCheck(consensus) {
  if (!consensus) {
    return check(
      'model-agreement',
      'Independently proposed by more than one model',
      UNKNOWN,
      'Only one model was asked. A second opinion is requested only when the first shows a high-severity risk or this test has a disproven prior attempt.'
    );
  }
  return consensus.agreed
    ? check('model-agreement', 'Independently proposed by more than one model', PASS, `${consensus.models?.join(' and ') || 'Multiple models'} produced the same edit independently, each held to the same grounding checks.`)
    : check('model-agreement', 'Independently proposed by more than one model', FAIL, `Models disagreed on the fix (${consensus.models?.join(', ') || 'several models'}). The one shown was selected, but the disagreement itself is a signal.`);
}

/**
 * The full ledger plus an honest one-line characterisation.
 *
 * `strength` describes HOW MUCH WAS VERIFIED, not how likely the fix is to be
 * correct — no combination of these checks can establish correctness, and the
 * wording deliberately avoids implying otherwise.
 */
function buildEvidence(proposal, { domSnapshot, priorAttempts, receiverIndexSize, conventionsLoaded, verifiedRelated } = {}) {
  const edits = proposal.edits || [];
  if (!edits.length) return null;

  const checks = [
    anchorCheck(edits),
    groundingCheck(edits, receiverIndexSize),
    domEvidenceCheck(edits, domSnapshot),
    ambiguityCheck(edits, verifiedRelated),
    baselineCheck(edits),
    liveProbeCheck(edits),
    integrityCheck(edits),
    architectureCheck(edits, conventionsLoaded),
    priorAttemptCheck(edits, priorAttempts),
    consensusCheck(proposal.consensus),
  ];

  const counts = checks.reduce((acc, c) => ({ ...acc, [c.status]: (acc[c.status] || 0) + 1 }), {});
  const failed = counts[FAIL] || 0;
  const passed = counts[PASS] || 0;
  const unknown = counts[UNKNOWN] || 0;

  let strength;
  let summary;
  if (failed) {
    strength = 'contradicted';
    summary = `${failed} check${failed === 1 ? '' : 's'} actively failed. Read those before applying — a passing rerun would not settle them.`;
  } else if (unknown === 0) {
    strength = 'well-evidenced';
    summary = `All ${passed} checks passed. That means nothing contradicts this fix — it is not a guarantee the fix is correct.`;
  } else {
    strength = 'partially-checked';
    summary = `${passed} check${passed === 1 ? '' : 's'} passed and ${unknown} could not be run. Nothing contradicts this fix, but less was verified than the clean result might suggest.`;
  }

  return { strength, summary, counts: { pass: passed, fail: failed, unknown, notApplicable: counts[NA] || 0 }, checks };
}

module.exports = { buildEvidence };
