/**
 * Detects the one failure shape this pipeline was structurally blind to.
 *
 * A page-object method here routinely wraps an ACTION (click, wait, navigate)
 * in a try/catch that logs at debug level and then simply carries on, before
 * separately reading a RESULT and returning '' when that read finds nothing:
 *
 *     try {
 *       await addButton.waitFor({ state: 'visible', timeout: 15000 });
 *       await addButton.click();
 *     } catch (error) {
 *       logger.debug('Add to Watchlist button click failed', error);   // discarded
 *     }
 *     try {
 *       ...wait for the "Added to watchlist" toast...
 *       return await toast.textContent();
 *     } catch { return ''; }                                           // all the caller sees
 *
 * When the button isn't there at all (the item was already in the watchlist),
 * the click never happens, that fact is thrown away, and the caller gets ''
 * — indistinguishable from "the action worked but the toast didn't render".
 * The assertion then fails with `Expected substring: "added" / Received: ""`,
 * and EVERY signal a model can see points at the toast, because the one fact
 * that would point elsewhere was deleted by the catch.
 *
 * Observed for real: a spot fix for this shape was proposed, applied, rerun,
 * and auto-reverted three separate times in one day, each time proposing a
 * better way to READ the toast. No improvement to the read can fix an action
 * that never occurred, so the loop could not terminate on its own. The model
 * even had the DOM snapshot showing the button in its opposite state and
 * still concluded "the action completed but the toast wasn't captured" —
 * with the exception swallowed, a method's NAME is the only remaining
 * evidence of what it does, and the name says it adds.
 *
 * This module restores that deleted signal: when an assertion receives an
 * empty/falsy value AND the method that produced it contains a catch that
 * discards an error without rethrowing, it says so explicitly and names the
 * alternative hypothesis, rather than leaving the model to infer a
 * possibility the evidence has been stripped of.
 *
 * Detection only — never edits, never blocks a proposal. Its whole output is
 * one prompt block (see swallowedFailureBlock in ./prompt.js).
 */
const fs = require('fs');
const path = require('path');
const { stripAnsi } = require('../rca/ansi');
const { resolveAssertedCallee, listHelperFiles, findDeclarationLine, functionSpan } = require('./sourceFiles');

// A `catch (e) {`, `catch {`, or `} catch (e) {` opening.
const CATCH_OPEN = /\bcatch\s*(?:\([^)]*\))?\s*\{/;

// The value shapes an assertion reports when a helper returned its
// swallow-path default rather than a real result. Kept literal (not a
// generic falsy test) so a legitimately-expected 0 or false doesn't trip it.
const EMPTY_RECEIVED = [
  /Received string:\s*""/,
  /Received:\s*""/,
  /Received:\s*''/,
  /Received:\s*false\b/,
  /Received:\s*null\b/,
  /Received:\s*undefined\b/,
  /Received has length:\s*0\b/,
];

/** True when the failure is "the helper handed back nothing", the only case this analysis applies to. */
function receivedEmptyValue(errorMessage) {
  const text = stripAnsi(String(errorMessage || ''));
  return EMPTY_RECEIVED.some((p) => p.test(text));
}

/**
 * Span of the `{...}` block belonging to the catch on line `startIdx`
 * (0-based), by brace counting. Same deliberate naiveté as functionSpan in
 * ./sourceFiles.js — a brace inside a string can skew it, which at worst
 * makes this analysis quote a slightly wrong line range in a prompt. It
 * never drives an edit.
 */
function catchBlockSpan(lines, startIdx) {
  let depth = 0;
  let started = false;
  for (let i = startIdx; i < lines.length; i += 1) {
    // On the opening line, start counting at the `catch` keyword so the
    // preceding `try {`'s own closing brace isn't counted.
    const catchAt = i === startIdx ? lines[i].indexOf('catch') : -1;
    const text = catchAt >= 0 ? lines[i].slice(catchAt) : lines[i];
    for (const ch of text) {
      if (ch === '{') {
        depth += 1;
        started = true;
      } else if (ch === '}') {
        depth -= 1;
        if (started && depth === 0) return { start: startIdx, end: i };
      }
    }
  }
  return { start: startIdx, end: Math.min(lines.length - 1, startIdx + 20) };
}

/**
 * Every catch inside the function declared at `declLine` that discards its
 * error instead of rethrowing, classified by what the caller can still see:
 *
 *   'silent-continue' — no return at all: execution falls through and the
 *      method keeps going as though the failed step had succeeded. The
 *      dangerous one, and invisible even in the return value.
 *   'falsy-return' — returns ''/false/null: the caller cannot distinguish
 *      "genuinely absent" from "something threw".
 *
 * A catch that rethrows is correct error handling and is not reported.
 */
function findSwallowedFailures(content, declLine) {
  const lines = content.split('\n');
  const span = functionSpan(content, declLine);
  const out = [];

  for (let i = span.start - 1; i < span.end && i < lines.length; i += 1) {
    if (!CATCH_OPEN.test(lines[i])) continue;
    const block = catchBlockSpan(lines, i);
    const body = lines.slice(block.start, block.end + 1).join('\n');
    if (/\bthrow\b/.test(body)) continue; // Rethrows — the error survives.

    // `return '';` / `return false;` — but NOT `return (await x()) || '';`,
    // which is a real result path that merely defaults.
    const falsy = body.match(/\breturn\s+(''|""|``|false|null|undefined)\s*;/);
    out.push({
      line: i + 1,
      shape: falsy ? 'falsy-return' : 'silent-continue',
      returned: falsy ? falsy[1] : null,
    });
  }
  return out;
}

/**
 * Ties the two halves together: an empty asserted value, and a producing
 * method that could have discarded a failure to produce it. Returns
 * `{ method, file, declLine, swallows }` or null — null being by far the
 * common case, since this only fires on the specific combination.
 */
function describeSwallowedFailures(files, test) {
  if (!receivedEmptyValue(test?.error?.message)) return null;

  const traced = resolveAssertedCallee(files, test);
  if (!traced?.callee?.name) return null;
  const methodName = traced.callee.name;

  for (const candidatePath of listHelperFiles()) {
    let content;
    try {
      content = fs.readFileSync(candidatePath, 'utf-8');
    } catch {
      continue;
    }
    const declLine = findDeclarationLine(content, methodName);
    if (declLine == null) continue;

    const swallows = findSwallowedFailures(content, declLine);
    if (!swallows.length) return null; // Traced fine — it just doesn't swallow.
    return {
      method: methodName,
      file: candidatePath,
      declLine,
      swallows,
      // Only a silent-continue can hide a never-executed ACTION; a
      // falsy-return alone still means the method ran to its end.
      hasSilentContinue: swallows.some((s) => s.shape === 'silent-continue'),
    };
  }
  return null;
}

/**
 * Absolute file line numbers an edit actually changes, by trimming the
 * common head/tail its oldCode and newCode share. A model routinely quotes a
 * whole method as `oldCode` to make the snippet unique while changing one
 * line inside it — without this trim, every such edit would look like it
 * touches everything.
 */
function changedLineNumbers(edit) {
  const oldLines = edit.oldCode.split('\n');
  const newLines = edit.newCode.split('\n');

  let head = 0;
  while (head < oldLines.length && head < newLines.length && oldLines[head] === newLines[head]) head += 1;

  let tail = 0;
  while (
    tail < oldLines.length - head &&
    tail < newLines.length - head &&
    oldLines[oldLines.length - 1 - tail] === newLines[newLines.length - 1 - tail]
  ) {
    tail += 1;
  }

  const out = [];
  for (let i = head; i < oldLines.length - tail; i += 1) out.push(edit.startLine + i);
  // A pure insertion changes no existing line; attribute it to the point it
  // was inserted at, so it still counts as "touching" that region.
  if (!out.length) out.push(edit.startLine + head);
  return out;
}

/**
 * The deterministic half of this analysis, and the part that actually breaks
 * the loop.
 *
 * The prompt block above is advisory, and a real model was observed reading
 * it and proceeding anyway — it acknowledged the snapshot showed the app
 * already in the post-action state, then concluded "so the problem is with
 * the selector" and proposed a better toast locator regardless. Every other
 * guard in this pipeline is enforced in code for exactly that reason (see
 * findUngroundedCall and assessRisks), so this one is too.
 *
 * Fires only on the narrow, high-confidence shape: an action inside the
 * producing method can be silently skipped, and the proposed edit does not
 * go anywhere near that action. Two ways that happens:
 *
 *   - Same file, read-only edit: the changed lines all sit AFTER the catch
 *     that can swallow the action — i.e. a better locator/wait/fallback for
 *     reading a result the action may never have produced.
 *   - The action call swapped out entirely: an edit elsewhere (usually the
 *     spec) that drops the call to the action-performing method and calls a
 *     read-only one in its place, removing the action instead of fixing it.
 *
 * Anything that does touch the action region returns null — that is the
 * edit doing the right thing, and it must not be penalised. An edit that
 * ADDS a call without removing the traced one (a plausible setup/cleanup
 * fix) is likewise left alone.
 */
function assessSwallowedActionRisk(edit, swallowed) {
  if (!swallowed?.hasSilentContinue || !edit) return null;

  const silent = swallowed.swallows.find((s) => s.shape === 'silent-continue');
  if (!silent) return null;

  const sameFile =
    edit.absolutePath && path.resolve(edit.absolutePath) === path.resolve(swallowed.file);

  if (sameFile) {
    // The action lives between the method's declaration and the catch that
    // can swallow it; anything at or before that line counts as addressing it.
    if (changedLineNumbers(edit).some((ln) => ln <= silent.line)) return null;
    return {
      id: 'swallowed-action-not-addressed',
      label: 'Changes only how the result is read, not the step that may never have run',
      severity: 'high',
      detail: `${swallowed.method}() can fail its action silently — the catch at line ${silent.line} discards the error and continues — and the assertion received an empty value, which is exactly what that produces. This edit only changes lines after that point, so it improves how the result is READ. If the action never ran, there is nothing to read and this cannot fix the failure, no matter how good the new locator is. Check the page snapshot: if the app is already in the state the action was meant to produce, fix the action instead.`,
    };
  }

  // Elsewhere: only a concern if it removes the action-performing call.
  const callRe = new RegExp(`\\b${swallowed.method}\\s*\\(`);
  if (callRe.test(edit.oldCode) && !callRe.test(edit.newCode)) {
    return {
      id: 'action-call-swapped-for-read',
      label: 'Replaces the step that performs the action with one that only reads',
      severity: 'high',
      detail: `This drops the call to ${swallowed.method}(), which is what actually performs the action, and calls something else in its place. If the original failure was the action silently not happening (its error is discarded by the catch at line ${silent.line}), then removing the action entirely cannot fix it — the replacement will read the same missing result. Verify what the replacement actually does before applying.`,
    };
  }

  return null;
}

module.exports = {
  describeSwallowedFailures,
  findSwallowedFailures,
  receivedEmptyValue,
  assessSwallowedActionRisk,
  changedLineNumbers,
};
