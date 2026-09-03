/**
 * Flags edits that make a test pass without fixing anything.
 *
 * This is the main failure mode of AI-generated test fixes, and it is not
 * hypothetical — the first proposal this feature ever produced changed
 * `expect(isAddToWatchlistButtonVisible).toBe(false)` to `.toBe(true)`,
 * i.e. it rewrote the assertion to agree with the bug the test had just
 * caught. The prompt forbids this, but a model will still do it, so the
 * dangerous shapes are detected here and surfaced in the diff for the human
 * approving it. These are warnings, not blocks: occasionally the expectation
 * really is the stale thing, and only a person can tell.
 */

const ASSERTION_CALL = /\.(toBe|toEqual|toStrictEqual|toContain|toHaveText|toHaveValue|toHaveCount|toBeVisible|toBeHidden|toBeTruthy|toBeFalsy)\b/;

// 'high' risks defeat the test's purpose outright (it will pass no matter
// what the app does), which also means a rerun proves nothing — see
// runManager.applySpotFix, which refuses to apply one of these without
// explicit acknowledgement, and never treats its own rerun as validation.
// 'low' risks are quality concerns (slower/flakier suite) worth a human's
// attention but not something a passing rerun is misleading about.
const RISKS = [
  {
    id: 'assertion-flipped',
    label: 'Rewrites what the test asserts',
    severity: 'high',
    detail:
      'This changes the expected value of an assertion rather than fixing the behaviour under test. If the app is genuinely wrong, applying this hides a real bug instead of reporting it.',
    test: ({ oldCode, newCode }) => {
      if (!ASSERTION_CALL.test(oldCode) || !ASSERTION_CALL.test(newCode)) return false;
      // Boolean inversion is the clearest signal.
      const flipped =
        (/\btoBe\(\s*(true|false)\s*\)/.test(oldCode) && /\btoBe\(\s*(true|false)\s*\)/.test(newCode) &&
          oldCode.match(/\btoBe\(\s*(true|false)\s*\)/)[1] !== newCode.match(/\btoBe\(\s*(true|false)\s*\)/)[1]) ||
        // Negation added or removed around an assertion.
        /\.not\./.test(oldCode) !== /\.not\./.test(newCode);
      if (flipped) return true;
      // Same assertion method, different expected literal, nothing else changed.
      const strip = (s) => s.replace(/\s+/g, '');
      const oldMethod = oldCode.match(ASSERTION_CALL)?.[1];
      const newMethod = newCode.match(ASSERTION_CALL)?.[1];
      return Boolean(oldMethod && oldMethod === newMethod && strip(oldCode) !== strip(newCode) &&
        strip(oldCode).replace(/['"`][^'"`]*['"`]/g, 'S') === strip(newCode).replace(/['"`][^'"`]*['"`]/g, 'S'));
    },
  },
  {
    id: 'assertion-removed',
    label: 'Removes an assertion',
    severity: 'high',
    detail: 'The replacement drops one or more expect() calls, so the test will pass without checking what it used to check.',
    test: ({ oldCode, newCode }) => {
      const count = (s) => (s.match(/\bexpect\s*\(/g) || []).length;
      return count(newCode) < count(oldCode);
    },
  },
  {
    id: 'test-skipped',
    label: 'Skips the test',
    severity: 'high',
    detail: 'This disables the test rather than fixing it.',
    test: ({ oldCode, newCode }) =>
      (/\.(skip|fixme)\b/.test(newCode) && !/\.(skip|fixme)\b/.test(oldCode)) ||
      (/^\s*\/\//m.test(newCode) && /\bexpect\s*\(/.test(oldCode) && !/\bexpect\s*\(/.test(newCode.replace(/^\s*\/\/.*$/gm, ''))),
  },
  {
    /**
     * The same "make it pass unconditionally" harm as assertion-flipped, just
     * relocated one layer upstream — instead of rewriting the expect() call,
     * hardcode the value it reads to whatever the assertion wants, so no
     * expect()/toBe() syntax ever appears in the diff for ASSERTION_CALL to
     * catch. Observed for real: `isLiveContentVisible: isLiveIconVisible`
     * (a computed flag) became `isLiveContentVisible: true` in a business
     * function, which made a failing precondition pass by deleting the check
     * rather than fixing why it failed — and was applied and "verified"
     * before this rule existed to catch it.
     */
    id: 'hardcoded-boolean-result',
    label: 'Hardcodes a computed flag instead of fixing how it is computed',
    severity: 'high',
    detail:
      'The old code derived this value from something (a variable, a call, a condition); the new code just returns true/false unconditionally instead. Any assertion or caller reading this now always gets the same answer regardless of what actually happens in the app.',
    test: ({ oldCode, newCode }) => {
      const oldLines = oldCode.split('\n');
      const newLines = newCode.split('\n');
      if (oldLines.length !== newLines.length) return false; // only simple, line-aligned value swaps
      const VALUE_POSITION = /(?::|=(?!=)|return)\s*([^;,}\n]+?)\s*[;,}]?\s*$/;
      const BOOL_LITERAL = /^(true|false)$/;
      for (let i = 0; i < oldLines.length; i += 1) {
        if (oldLines[i].trim() === newLines[i].trim()) continue;
        const oldValue = oldLines[i].match(VALUE_POSITION)?.[1]?.trim();
        const newValue = newLines[i].match(VALUE_POSITION)?.[1]?.trim();
        if (!oldValue || !newValue) continue;
        if (!BOOL_LITERAL.test(oldValue) && BOOL_LITERAL.test(newValue)) return true;
      }
      return false;
    },
  },
  {
    /**
     * A subtler variant of hardcoded-boolean-result: instead of hardcoding a
     * literal, the new code redirects a named result field to a DIFFERENT
     * pre-existing variable — one already computed (and already known true)
     * from an earlier, unrelated step — rather than fixing why the correct
     * variable was wrong.
     *
     * Observed for real: `isLiveContentVisible: isLiveIconVisible` (the
     * real post-navigation "Live" badge check, which was returning false
     * because its locator was stale — role: 'button' on what's actually a
     * <span>) became `isLiveContentVisible: isLiveChannelsTrayVisible` (an
     * earlier, already-true precondition from before the tray was even
     * opened). The assertion started passing, but it no longer checked what
     * its own name says it checks — and because the swap targets a real
     * variable rather than a boolean literal, it evaded
     * hardcoded-boolean-result's BOOL_LITERAL check entirely. Applied and
     * verified (by a rerun that could only ever pass, since the field was
     * now aliased to something already true) before this rule existed to
     * catch it.
     */
    id: 'result-field-rerouted',
    label: 'Redirects a named result field to a different pre-computed value',
    severity: 'high',
    detail:
      'The old code populated this field from one variable; the new code swaps in an entirely different one instead of fixing why the original was wrong. If that other variable was already true for unrelated reasons, this makes the check pass without validating what it is actually named for — the same harm as hardcoding the literal, just one layer removed.',
    test: ({ oldCode, newCode }) => {
      const BARE_IDENTIFIER = /^[A-Za-z_$][\w$]*$/;
      const BOOL_OR_NULLISH = /^(true|false|null|undefined)$/;
      // Both sides must be bare identifiers (not literals, not calls, not
      // property access) — a real variable name swapped for another real
      // variable name. Boolean/nullish literals are hardcoded-boolean-
      // result's job, not this rule's, to avoid double-reporting the same
      // edit under two different risk ids.
      const isRerouted = (oldValue, newValue) =>
        Boolean(oldValue) &&
        Boolean(newValue) &&
        oldValue !== newValue &&
        BARE_IDENTIFIER.test(oldValue) &&
        BARE_IDENTIFIER.test(newValue) &&
        !BOOL_OR_NULLISH.test(oldValue) &&
        !BOOL_OR_NULLISH.test(newValue);

      // Pass 1 — key each `field: value` by the FIELD'S OWN NAME, so the
      // check survives lines being inserted or removed around it.
      //
      // This rule was originally index-aligned only (pass 2 below), and
      // bailed outright when the line counts differed. A real proposal
      // walked straight through that hole: it rerouted
      // `isLiveContentVisible: isLiveIconVisible` to `: isLiveTagVisible`
      // while ALSO adding a new const and an extra logger.assertion line,
      // so the snippet grew by two lines, the rule skipped it entirely, and
      // the edit reached the user carrying zero risks. Same reroute the rule
      // was written for — only the surrounding line churn differed.
      //
      // Deliberately ignores `const x = ...` declarations (the name is
      // followed by a space then `=`, not matched here): a new local being
      // introduced is not a reroute. Only object/property assignment of the
      // form `name: value` or `name = value` counts.
      const FIELD_ASSIGN = /^\s*([A-Za-z_$][\w$]*)\s*(?::|=(?!=))\s*([^;,}\n]+?)\s*[;,]?\s*$/;
      const fieldsOf = (code) => {
        const out = new Map();
        for (const line of code.split('\n')) {
          const m = line.match(FIELD_ASSIGN);
          // First occurrence wins, so a later same-named line can't mask it.
          if (m && !out.has(m[1])) out.set(m[1], m[2].trim());
        }
        return out;
      };
      const newFields = fieldsOf(newCode);
      const oldFields = fieldsOf(oldCode);
      for (const [name, oldValue] of oldFields) {
        if (isRerouted(oldValue, newFields.get(name))) return true;
      }

      // Pass 1b — the same reroute written as object shorthand.
      //
      // Observed live, immediately after pass 1 started catching the plain
      // form: rather than `isLiveContentVisible: isLiveTagVisible`, the model
      // emitted `isLiveContentVisible,` (shorthand) plus a NEW
      // `const isLiveContentVisible = await detailsPage.isLiveTagVisible();`
      // above it. Identical effect — the field's value now comes from a
      // different source — but no `field: value` pair to compare, so pass 1
      // saw nothing. The field is what the assertion reads, so a change in
      // what computes it is worth a human's eyes regardless of the syntax
      // used to express it.
      const SHORTHAND = (code, name) =>
        new RegExp(`^\\s*${name}\\s*,?\\s*$`, 'm').test(code);
      const DECLARED_AS = (code, name) =>
        code.match(new RegExp(`\\b(?:const|let|var)\\s+${name}\\s*=\\s*([^;\\n]+)`))?.[1]?.trim() || null;

      for (const [name, oldValue] of oldFields) {
        // Was an explicit `name: value`, is now shorthand...
        if (newFields.has(name) || !SHORTHAND(newCode, name)) continue;
        const newDecl = DECLARED_AS(newCode, name);
        if (!newDecl) continue; // Shorthand for a variable that already existed — not a reroute.
        const oldDecl = DECLARED_AS(oldCode, name);
        // ...and the value backing it is not what the field used to read.
        if (newDecl !== oldValue && newDecl !== oldDecl) return true;
      }

      // Pass 2 — the original index-aligned scan, kept because it also
      // covers `return <identifier>;`, which has no field name to key on.
      const oldLines = oldCode.split('\n');
      const newLines = newCode.split('\n');
      if (oldLines.length === newLines.length) {
        const VALUE_POSITION = /(?::|=(?!=)|return)\s*([^;,}\n]+?)\s*[;,}]?\s*$/;
        for (let i = 0; i < oldLines.length; i += 1) {
          if (oldLines[i].trim() === newLines[i].trim()) continue;
          const oldValue = oldLines[i].match(VALUE_POSITION)?.[1]?.trim();
          const newValue = newLines[i].match(VALUE_POSITION)?.[1]?.trim();
          if (isRerouted(oldValue, newValue)) return true;
        }
      }
      return false;
    },
  },
  {
    id: 'hard-coded-sleep',
    label: 'Adds a fixed sleep',
    severity: 'low',
    detail:
      'page.waitForTimeout() pauses for a fixed duration regardless of what the app is doing. Playwright discourages it: it makes the suite slower on every run and only hides the race rather than removing it. Waiting for the specific element or state is the durable fix.',
    test: ({ oldCode, newCode }) => {
      const count = (s) => (s.match(/waitForTimeout\s*\(/g) || []).length;
      return count(newCode) > count(oldCode);
    },
  },
  {
    id: 'timeout-inflated',
    label: 'Only increases a timeout',
    severity: 'low',
    detail:
      'Waiting longer masks slowness rather than addressing it, and makes the suite slower on every future run. Worth confirming the app is genuinely just slow.',
    test: ({ oldCode, newCode }) => {
      const oldNums = (oldCode.match(/\b\d{3,}\b/g) || []).map(Number);
      const newNums = (newCode.match(/\b\d{3,}\b/g) || []).map(Number);
      if (!oldNums.length || oldNums.length !== newNums.length) return false;
      const onlyNumbersDiffer =
        oldCode.replace(/\b\d{3,}\b/g, 'N') === newCode.replace(/\b\d{3,}\b/g, 'N');
      return onlyNumbersDiffer && newNums.some((n, i) => n > oldNums[i]);
    },
  },
];

/**
 * Catches the model contradicting its own proposal in plain English.
 *
 * Observed for real: a proposal explained itself as changing a value "which
 * might not be accurate" — i.e. the model's own stated reasoning for the
 * edit doubted the very thing it was hardcoding. self-reported "confidence"
 * doesn't catch this (it said "medium"); the prose does. Every code-shape
 * detector above can be evaded by relocating the harmful pattern somewhere
 * unmatched, but the model still has to explain itself in words, and a
 * fabricated fix tends to leak uncertainty there even when the code looks
 * confident. This is a second, independent signal — not a replacement for
 * the code-shape detectors above.
 */
const HEDGE_LANGUAGE = /\b(might not be|might be wrong|might be inaccurate|may not be accurate|may not be correct|possibly (?:wrong|inaccurate|incorrect)|not (?:sure|certain)|unclear (?:if|whether)|could be (?:wrong|stale|inaccurate)|seems? to be|appears? to be|likely (?:a|the) (?:bug|issue)|assuming|guessing)\b/i;

function hasHedgeLanguage(text) {
  return HEDGE_LANGUAGE.test(text || '');
}

/** A risk object (matching assessRisks' shape) if `text` hedges, else null. */
function languageRisk(text) {
  if (!hasHedgeLanguage(text)) return null;
  const quoted = (text || '').length > 160 ? `${text.slice(0, 160)}…` : text;
  return {
    id: 'uncertain-reasoning',
    label: "The model's own explanation hedges on this",
    severity: 'high',
    detail: `Its stated reasoning doubts the very thing it changed: "${quoted}" — treat that as the model telling you it isn't sure, not as something a passing rerun resolves.`,
  };
}

/** Returns [{ id, label, detail, severity }] for every risky shape this edit matches. */
function assessRisks(edit) {
  const found = [];
  for (const risk of RISKS) {
    let matched = false;
    try {
      matched = risk.test(edit);
    } catch {
      matched = false; // A detector must never break proposal generation.
    }
    if (matched) found.push({ id: risk.id, label: risk.label, detail: risk.detail, severity: risk.severity });
  }
  return found;
}

/**
 * True if any edit in a proposal defeats the test's purpose outright
 * (assertion-flipped/-removed, test-skipped). Applying one of these is
 * gated on explicit human acknowledgement in runManager.applySpotFix —
 * a warning alone was not enough (see the risk.js file header).
 */
function hasHighRisk(edits) {
  return (edits || []).some((edit) => (edit.risks || []).some((r) => r.severity === 'high'));
}

/**
 * Risks that a passing rerun cannot clear, and the reason why for each.
 *
 * A green rerun is the strongest signal this dashboard has, and it is
 * routinely treated as proof. It is not, in two distinct situations:
 *
 *   - The edit changed what the test checks. It now passes by construction.
 *   - The edit changed a locator to one the evidence says matches nothing.
 *     If the test still went green, it went green for some OTHER reason —
 *     very often a page object that catches its own errors and returns
 *     false/'' (see ./swallowedFailures.js), leaving an assertion satisfied
 *     by a value that no longer means what it says.
 *
 * The second case is not hypothetical: a locator built from the page's
 * <title> was applied, rerun, passed, and was kept — while being unable to
 * match anything and having nothing to do with the property under test.
 * That is exactly the outcome "verify" exists to prevent, so a pass in this
 * state must be reported as inconclusive rather than as verification.
 */
const RERUN_CANNOT_VALIDATE = new Map([
  ['assertion-flipped', 'it rewrites what the test expects, so the test passes by construction'],
  ['assertion-removed', 'it removes an assertion, so there is less being checked than before'],
  ['test-skipped', 'the test no longer runs'],
  ['hardcoded-boolean-result', 'the checked value is hardcoded, so the assertion cannot fail'],
  ['result-field-rerouted', 'the asserted value now comes from a different source than the one under test'],
  ['live-selector-no-match', 'the new locator matched nothing when checked against the live page'],
  ['baseline-element-mismatch', 'the replacement points at a different element than the one this test passed against, so it can go green while checking something else'],
  ['locator-off-subject', 'the new locator does not distinguish the condition the method is meant to establish, so it can pass either way'],
  ['locator-text-not-in-captured-dom', 'the new locator looks for text that was not on the page captured at failure'],
  ['swallowed-action-not-addressed', 'the underlying action may still never run — the error proving it is discarded'],
  ['action-call-swapped-for-read', 'an action was replaced by a read, which cannot make the action happen'],
  ['ambiguous-locator-reuse', 'the reused locator matches more than one element, so a position-based .first()/[0] pick can land on the right one by chance — a pass proves the pick happened to be right this time, not that it will be next time'],
]);

/**
 * [{ id, label, why }] for every risk across `edits` that a rerun cannot
 * settle. Empty means a passing rerun is meaningful.
 */
function unvalidatableRisks(edits) {
  const found = new Map();
  for (const edit of edits || []) {
    for (const risk of edit.risks || []) {
      const why = RERUN_CANNOT_VALIDATE.get(risk.id);
      if (why && !found.has(risk.id)) found.set(risk.id, { id: risk.id, label: risk.label, why });
    }
  }
  return [...found.values()];
}

module.exports = { assessRisks, hasHighRisk, hasHedgeLanguage, languageRisk, unvalidatableRisks };
