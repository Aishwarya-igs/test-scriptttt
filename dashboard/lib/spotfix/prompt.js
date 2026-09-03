const { stripAnsi } = require('../rca/ansi');
const { buildExcerpt, describeFailingLines, describeAssertionContext, listTestBodyCalls } = require('./sourceFiles');
const { buildLocatorIndex, renderLocatorIndex } = require('./locatorIndex');
const { buildDomExcerpt, buildHintCenteredExcerpt, extractDomHints } = require('./domExcerpt');
const { describeSwallowedFailures } = require('./swallowedFailures');
const { loadFixConventions } = require('./skills');
const { detectDialect, enclosingMethodName, relatedLocators, parseLocatorDeclarations } = require('./locatorSyntax');

// Kept modest on purpose: hosted models are commonly rate-limited per minute
// (Groq's free tier allows 12k tokens/min), and RCA has usually just spent
// part of that budget on the same failure moments earlier.
const MAX_SNAPSHOT_CHARS = 1500;

/**
 * Asks for exact-match find/replace pairs rather than a unified diff.
 *
 * Models are unreliable at emitting valid patch hunks (line numbers and
 * @@ headers drift), and a malformed hunk either fails to apply or, worse,
 * applies to the wrong place. An exact oldCode string that must appear
 * exactly once in the file is trivially verifiable before we touch disk —
 * see validateEdit in ./index.js.
 */
/**
 * Names the exact line that threw, so the model fixes the statement that
 * actually failed rather than one the test's title merely implies.
 */
function failingLinesBlock(test) {
  const frames = describeFailingLines(test);
  if (!frames.length) return '';
  const body = frames.map((f) => `${f.file}:${f.line}\n    ${f.text}`).join('\n');
  return `
THE STATEMENT THAT FAILED (innermost frame first)
${body}

This is the line that threw. Any later assertion in the same test never ran, so changing one cannot fix this failure — work backwards from why THIS line failed.`;
}

/**
 * Spells out the test's full assertion sequence — not just which line threw,
 * but which checks ran, which one failed, and, critically, which ones never
 * got to run at all.
 *
 * failingLinesBlock alone was not enough to stop this: a model told "this
 * line threw" still proposed "fixing" that line's own precondition check
 * without registering that the test's real subject — named in its title —
 * was a *different* assertion that never executed. Naming that assertion
 * explicitly, and stating outright that no evidence exists for or against
 * it, removes the inference step the model kept getting wrong.
 */
function assertionContextBlock(test) {
  const ctx = describeAssertionContext(test);
  if (!ctx || !ctx.after.length) return '';

  const render = (list) => list.map((a) => `  ${a.line}: ${a.text}`).join('\n') || '  (none)';

  return `
ASSERTIONS THAT NEVER RAN
This test makes ${ctx.before.length + 1 + ctx.after.length} assertions in sequence. It died on the failing one above, before ever reaching:
${render(ctx.after)}

If one of those is the check the test's title is actually about, this failure happened upstream of it — you have zero evidence whether that check would have passed or failed, because the app never got the chance to be observed on that point. Fix ONLY why the line that threw actually failed, using concrete evidence (the error, the page snapshot). Do not "fix" this by changing, weakening, or hardcoding the result of a DIFFERENT value or assertion so the test happens to get further — that is not a fix, it is deleting the check. If you cannot point to concrete evidence for what's actually wrong with the line that threw, return no edits.`;
}

/**
 * Narrates the test's own call sequence up to the failure, in order — a step
 * list, not source code. Its job is to stop the model from trusting a
 * method's NAME as a description of what it does: a step called specifically
 * to remove something can, once its actual body is read (shown below in
 * SOURCE FILES), turn out to re-add it before returning. That mismatch is
 * only visible by reading the implementation, never by reading the call site
 * or the method name alone — this block exists to prompt that reading, not
 * to replace it.
 */
function testFlowBlock(test) {
  const calls = listTestBodyCalls(test);
  if (!calls.length) return '';
  const body = calls.map((c) => `  ${c.line}: ${c.receiver ? `${c.receiver}.` : ''}${c.method}(...)`).join('\n');
  return `
STEPS THIS TEST TAKES BEFORE THE FAILURE (in order; each one's real implementation is included below where it could be resolved)
${body}

A step's name describes intent, not necessarily behavior. Before proposing a fix, check whether an earlier step's actual implementation already undoes what a later step (including the one that failed) assumes is still true — e.g. a helper called specifically to remove/undo something whose body, read in full, unconditionally performs the opposite action before returning. Base this on what the code shown below actually does, never on what a method's name suggests it does.`;
}

/**
 * Lists prior spot fixes for this exact test that were applied, rerun, and
 * proven NOT to fix it — the strongest evidence there is: a real rerun, not
 * a guess. Repeating one is hard-rejected afterward regardless of what the
 * model does with this (see matchesPriorFailedAttempt in ./priorAttempts and
 * its call site in ./index.js) — this block is what gives the model a
 * chance to avoid wasting the proposal on a rejection in the first place.
 */
function priorFailedAttemptsBlock(priorAttempts) {
  if (!priorAttempts?.length) return '';
  const body = priorAttempts
    .map((a, i) => {
      const edits = a.edits.map((e) => `    File: ${e.file}\n    Change tried:\n${e.newCode}`).join('\n');
      return `  Attempt ${i + 1} (explanation given at the time: "${a.explanation}"):\n${edits}`;
    })
    .join('\n\n');
  return `
ALREADY TRIED AND PROVEN NOT TO WORK
The following change(s) were previously applied to this exact test and rerun for real — the test still failed. Do not propose the same change again in different words; that would be proposing something already disproven, not a fix. If you cannot think of anything genuinely different backed by concrete evidence, return no edits and say in "explanation" that the previously-tried approaches don't cover it.
${body}`;
}

/**
 * The accessibility tree in error-context.md cannot show a CSS class, an id,
 * or a data-testid — none of those are accessibility concepts — but this
 * repo's locators are overwhelmingly CSS.
 * When a snapshot of the real DOM was captured (see ../rca/domSnapshot.js),
 * this is the model's only actual source of truth for what a stale selector
 * should become, rather than guessing blind from role/name text alone.
 */
function domSnapshotBlock(domSnapshot, hints) {
  if (!domSnapshot) return '';
  const excerpt = buildDomExcerpt(domSnapshot, hints);
  if (!excerpt) return '';
  return `
LIVE DOM AT FAILURE (real markup, not the accessibility tree above — this is the actual HTML, the only place a CSS class/id/data-testid selector can be confirmed)
${domSnapshot.url ? `Page URL: ${domSnapshot.url}\n` : ''}${excerpt.matchedHint ? `(excerpt centered on a match for "${excerpt.matchedHint}")\n` : excerpt.truncated ? '(excerpt from the start of the page — no distinctive hint matched)\n' : ''}${excerpt.text}
If you are changing a CSS selector, the replacement must be something that plausibly matches an element actually present in this markup — never invent a class or data-testid that doesn't appear here.`;
}

/**
 * Was a plain `.slice(0, MAX_SNAPSHOT_CHARS)` regardless of whether the
 * implicated element fell inside that window — same fix as promptFormat.js
 * applies for RCA, applied here too since spot-fix's own ARIA slice had the
 * identical blind spot.
 */
function ariaSnapshotBlock(pageSnapshot, hints) {
  if (!pageSnapshot) return '';
  const excerpt = buildHintCenteredExcerpt(pageSnapshot, hints, { maxChars: MAX_SNAPSHOT_CHARS });
  if (!excerpt) return '';
  return `PAGE SNAPSHOT AT FAILURE (accessibility tree — the ground truth for what actually rendered)${excerpt.matchedHint ? ` (excerpt centered on a match for "${excerpt.matchedHint}")` : ''}\n${excerpt.text}\n`;
}

/**
 * The counter-evidence block for a failure whose evidence was deleted before
 * it ever reached us — see ./swallowedFailures.js for the full mechanism and
 * the real 3-attempt loop that motivated it.
 *
 * Deliberately does not name a fix or a suspect line. It states the second
 * hypothesis the error text structurally cannot express, says how to tell
 * the two apart from the snapshot, and — the part that actually breaks the
 * loop — rules out the entire class of change the model kept re-proposing:
 * improving how the result is read cannot repair an action that never ran.
 */
function swallowedFailureBlock(files, test) {
  const found = describeSwallowedFailures(files, test);
  if (!found) return '';

  const rel = found.file.split(/[\\/]/).slice(-3).join('/');
  const detail = found.swallows
    .map((s) =>
      s.shape === 'silent-continue'
        ? `  line ${s.line}: catches the error and CONTINUES — whatever that try block was doing (a click, a wait, a navigation) may never have happened, and the method carries on as if it had.`
        : `  line ${s.line}: catches the error and returns ${s.returned} — the caller cannot tell this apart from "looked, found nothing".`
    )
    .join('\n');

  return `
THE EMPTY VALUE MAY NOT MEAN WHAT THE ERROR SUGGESTS
The assertion received an empty/falsy value. The method that produced it — ${found.method}() in ${rel}, declared at line ${found.declLine} — discards errors without rethrowing:
${detail}

So that empty value is equally consistent with EITHER:
  (a) the final read genuinely found nothing (what the error text appears to say), OR
  (b) an EARLIER STEP INSIDE THAT SAME METHOD failed silently and never took effect — so there was never anything for the read to find.
${found.hasSilentContinue ? `\nHypothesis (b) is invisible in the error message by construction: the exception proving it was caught and dropped, leaving only the method's NAME as evidence of what it did. A name states intent, not behavior. Do not treat the name as evidence.\n` : ''}
How to tell them apart: look at the page snapshot and live DOM above and ask what state the app is ACTUALLY in. If it shows the app already in the state that earlier step was supposed to produce — or in a state where that step's target element would not exist at all (e.g. the control is already showing its opposite action) — then the step never ran, and (b) is what happened.

If (b), the fix belongs at that earlier step: make it handle the state it actually encounters. Making the final read more robust — a better locator for it, more fallbacks, a longer wait, a different method to perform the same read — CANNOT fix an action that never occurred, and is the single most common wrong answer for this failure shape. Do not propose one unless you can point to positive evidence that the earlier step did take effect.`;
}

/**
 * The hung call recovered from the trace — see ../rca/traceActions.js. For a
 * timeout this is the difference between "the test hung somewhere" and "it
 * hung waiting for this exact locator", which is the only thing that makes a
 * timeout fixable rather than a shrug.
 */
function hangingActionBlock(hangingAction) {
  if (!hangingAction?.selector) return '';
  return `
WHERE THE TEST ACTUALLY HUNG (from the Playwright trace — the call that never completed)
${hangingAction.title || hangingAction.method}
${hangingAction.describedParams}${hangingAction.inheritedTestTimeout ? '\nThis call had no timeout of its own, so it consumed the whole test budget.' : ''}

Fix why THIS wait never resolved. Trace the selector above back to its declaration in the source below and check it against the page snapshot / DOM: if the element is genuinely absent, the locator may be stale, or an earlier step may have failed to put the app in the state that renders it. Do not simply raise a timeout — that just makes the same hang take longer.
`;
}

/**
 * How THIS project declares locators, described from the source actually in
 * front of the model rather than asserted from a hardcoded example.
 *
 * The rule this replaces named one shape literally —
 * `this.emailErrorMessage = { selector: 'form', text: '...' }` — which is
 * accurate for most of this repo and wrong for the 69 locators already
 * written as `page.getByRole(...)`, the style the project's own standards
 * mandate. Telling a model that locators look like X when the file in front
 * of it uses Y is worse than saying nothing.
 */
function locatorShapeRule(files) {
  const dialect = detectDialect(files.map((f) => f.content));
  const shapes = {
    pageElement: "declared in Page Object constructors as objects, e.g. `this.emailErrorMessage = { selector: 'form', text: '...' }`",
    builder: "declared in Page Object constructors as Playwright locators, e.g. `this.loginButton = page.getByRole('button', { name: 'Login' })`",
    mixed:
      "declared in Page Object constructors in two styles — as objects (`this.x = { selector: '...', text: '...' }`) and as Playwright locators (`this.x = page.getByRole('button', { name: '...' })`). Match whichever style the class you are editing already uses",
    unknown: 'declared in Page Object constructors, away from the methods that use them',
  };
  return `- For a timeout waiting on a locator, change the code that DEFINES that locator. In this repo locators are ${shapes[dialect]} — far from the method that awaits them. Trace the exact text in the "waiting for" line back to its declaration and edit it there.`;
}

const offsetOfLine = (content, line) => {
  const lines = content.split('\n');
  if (line < 1 || line > lines.length) return null;
  return lines.slice(0, line).join('\n').length;
};

/**
 * Names the method each failure anchor sits in, and the locators that class
 * already declares whose names share its subject.
 *
 * The catalog elsewhere in this prompt lists every locator a class has — 147
 * of them for the biggest page object here — which is grounding but not
 * guidance: it says what EXISTS, not what is RELEVANT. Twice now a model has
 * repaired `isLiveIconVisible()` by reaching for something with no connection
 * to liveness (a `<title>` string, then the generic `videoPlayer`) while
 * `liveTag`, `goLiveButton` and `liveTextLabel` sat in that same catalog. Both
 * fixes resolved; neither verified what the method claims to.
 *
 * This is the same ranking the post-hoc warning in ./layering.js uses, moved
 * to where it can prevent the mistake instead of describing it.
 */
/**
 * Makes sure every locator relatedLocatorsBlock is about to name is also
 * shown as real, copyable source in the excerpt — not only in the catalog's
 * collapsed rendering.
 *
 * describeLocator() collapses whitespace and drops the `this.x = `/`;` shape
 * to stay compact; a model that copies that rendering back as `oldCode`
 * produces a snippet that can never byte-match the file, and the fix is
 * rejected as "paraphrased" even when its intent was completely legible. A
 * real, traced case: `isLiveIconVisible()` and its relevant locators were 188
 * lines apart in a 1442-line file — outside any excerpt window — so the only
 * view of `this.emailErrorMessage` the model had, elsewhere in that same
 * file, was the catalog line. This reuses the exact relevance judgement
 * relatedLocatorsBlock already makes (same method, same subject) to decide
 * which locators are worth the extra excerpt space, via the generic
 * extraLines mechanism addErrorLiteralMatches also uses. See
 * ./locatorRecovery.js for the backstop on whatever this doesn't cover.
 */
function widenExcerptsForRelatedLocators(files) {
  for (const file of files) {
    const anchors = [...(file.lines || [])].filter(Boolean);
    if (!anchors.length) continue;
    const declByName = new Map(parseLocatorDeclarations(file.content).map((d) => [d.name, d.line]));
    if (!declByName.size) continue;

    const extra = file.extraLines instanceof Set ? file.extraLines : new Set(file.extraLines || []);
    const seenMethods = new Set();
    for (const anchorLine of anchors) {
      const offset = offsetOfLine(file.content, anchorLine);
      if (offset == null) continue;
      const method = enclosingMethodName(file.content, offset);
      if (!method || seenMethods.has(method)) continue;
      seenMethods.add(method);
      for (const related of relatedLocators(file.content, method)) {
        const line = declByName.get(related.name);
        if (line) extra.add(line);
      }
    }
    if (extra.size) file.extraLines = extra;
  }
}

/**
 * Renders a related locator's checked status from `verifiedRelated` (see
 * ./index.js verifyRelatedLocators). Unchecked (no browser, no domSnapshot)
 * stays silent rather than implying a check that didn't happen — only a
 * result that was actually resolved gets a verdict printed.
 */
function relatedLocatorAnnotation(name, verifiedRelated) {
  const result = verifiedRelated?.[name];
  if (!result) return '';
  if (result.count === 0) return '  [CONFIRMED 0 MATCHES on the failing page — dead, do not use]';
  if (result.count === 1) return '  [matches exactly 1 element on the failing page]';
  if (typeof result.count === 'number' && result.count > 1) {
    // Ambiguous is not a lesser version of dead — it is its own trap. .first()
    // resolves it positionally, and which element sits first in markup order
    // is not something a locator's NAME guarantees. The real incident this
    // guards against: this.liveTag (text=/\bLIVE\b/i) matches 5 elements on
    // the real page, and .first() lands on an unrelated "Go Live" control
    // that happens to sit earlier in the markup than the actual live badge —
    // silently, with no error, and no way to tell from the name alone.
    return `  [AMBIGUOUS — matches ${result.count} elements on the failing page; .first() would pick whichever sits first in the markup, not necessarily the intended one. Do not reuse as-is]`;
  }
  return '';
}

function relatedLocatorsBlock(files, verifiedRelated) {
  const sections = [];
  for (const file of files) {
    const anchors = [...(file.lines || [])].filter(Boolean);
    if (!anchors.length) continue;

    const seen = new Set();
    for (const line of anchors) {
      const offset = offsetOfLine(file.content, line);
      if (offset == null) continue;
      const method = enclosingMethodName(file.content, offset);
      if (!method || seen.has(method)) continue;
      seen.add(method);

      const related = relatedLocators(file.content, method);
      if (!related.length) continue;
      sections.push(
        `In ${file.relative}, the failure is inside ${method}(). Locators this class already declares on that same subject:\n` +
          related
            .map((r) => `  this.${r.name} → ${r.selector}${relatedLocatorAnnotation(r.name, verifiedRelated)}`)
            .join('\n')
      );
    }
  }
  if (!sections.length) return '';

  return `
LOCATORS ALREADY DECLARED FOR WHAT THIS CODE IS ABOUT
${sections.join('\n\n')}

A method's name states what it is supposed to establish. If you change the locator inside it, the replacement must still establish THAT — not merely something that happens to be on the page at the same time. A generic element that is present for both the passing and the failing case (a video player, a page container, a site-wide banner) makes the check succeed without testing anything, which is the same as deleting it.

Sharing a name's subject is NOT evidence a locator still works — some of the above may be broken independently of this failure. Only reuse one marked "matches exactly 1 element on the failing page" as-is. NEVER reuse one marked "CONFIRMED 0 MATCHES" — that is proof it is dead, not a hint to try it anyway. One marked "AMBIGUOUS" is not safe to reuse either, even though it resolves to something: it matches several elements and .first() would pick one by markup position, not by identity — if you want to use it, you must narrow it (e.g. scope by a class/attribute unique to the right one, visible in the DOM excerpt) so it resolves to exactly one element, and say in "reason" what you narrowed and why. One with no bracketed note could not be checked (no live DOM available); treat it the same as unverified and confirm it another way (the DOM excerpt, VERIFIED REPLACEMENT CANDIDATES above) before using it. If you use something not listed here, say in "reason" why those were wrong.`;
}

/**
 * The same region of the page from the last run where this test PASSED.
 *
 * Every other piece of evidence in this prompt describes a broken page, which
 * makes repairing a stale locator guesswork — anything present on the failing
 * page looks like a candidate, which is how a `<title>` string and a generic
 * video player were both proposed as "the live indicator". Showing the
 * working page next to the broken one turns that into a diff: the element is
 * usually still there, wearing different classes.
 *
 * Captured on success by src/fixtures/test-hooks.ts and kept per test case by
 * ./baselineStore.js.
 */
function baselineDomBlock(baseline, hints) {
  if (!baseline?.html) return '';
  const excerpt = buildDomExcerpt({ html: baseline.html, url: baseline.url }, hints, { maxChars: 3000, radius: 1200 });
  if (!excerpt?.text) return '';
  return `
THE SAME PAGE WHEN THIS TEST LAST PASSED${baseline.capturedAt ? ` (captured ${baseline.capturedAt})` : ''}
${excerpt.matchedHint ? `(excerpt centered on a match for "${excerpt.matchedHint}")\n` : ''}${excerpt.text}

Compare this against the failing page above. A locator that broke usually points at an element that still EXISTS but has been restyled or moved — the durable identity (its role, its accessible name, its visible text, its position relative to neighbours) is normally unchanged even when every CSS class differs. Find the element here that the broken locator was matching, find that same element in the failing page, and write the replacement against what is stable about it. Do not pick a different element that merely happens to be present on the failing page.`;
}

/**
 * Ranked, pre-verified replacement elements for the locators involved in this
 * failure — see ./candidates.js for how they are found and checked.
 *
 * The DOM excerpt elsewhere in this prompt contains the right answer, but it
 * also contains a few thousand wrong ones, and picking between them is a
 * search problem. That search has produced every bad locator this pipeline
 * has shipped. Doing it deterministically and handing over a short list
 * changes the task from "invent a selector" to "choose one of these, or say
 * none fit" — and every option here is already confirmed to resolve to
 * exactly one element on the failing page.
 *
 * Two DIFFERENT kinds of evidence can produce this list (see
 * computeCandidateSets in ./index.js), and the wording must not blur them:
 *   'baseline'  — compared against the element this locator matched back
 *                 when the test passed. Strong: same identity, not just same
 *                 subject.
 *   'relevance' — no baseline exists (or nothing in it resolved), so this is
 *                 the failing page's own elements ranked by how well they
 *                 match the failing method's NAME. Real and verified-unique,
 *                 but this only proves an element is plausibly the right
 *                 SUBJECT, never that it is the exact element the check
 *                 depended on — a materially weaker claim, so it must be
 *                 labeled as one rather than presented the same as a
 *                 baseline match.
 */
function candidatesBlock(candidateSets) {
  if (!candidateSets?.length) return '';
  const isRelevance = candidateSets.some((set) => set.kind === 'relevance');
  const sections = candidateSets.map((set) => {
    const rows = set.candidates
      .map((c) => `  [similarity ${c.score}] page.${c.selector}\n      resolves to: ${c.description}`)
      .join('\n');
    const heading =
      set.kind === 'relevance'
        ? `For ${set.description || `what ${set.name}() is checking for`}`
        : `For \`this.${set.name}\`${set.description ? ` (${set.description})` : ''}`;
    return `${heading}:\n${rows}`;
  });

  const header = isRelevance
    ? `VERIFIED REPLACEMENT CANDIDATES ON THE FAILING PAGE (NO PASSING BASELINE — ranked by relevance, not identity)
No passing run has been recorded for this test yet (or nothing in its baseline resolved), so these were NOT compared against a known-good element. Each was found on the failing page and confirmed to match EXACTLY ONE element, then ranked by how well its role/text/accessible-name/testId matches meaningful words from the failing method's own name — e.g. "isLiveIconVisible" -> "live". "similarity" here means relevance to that subject, NOT identity with a previously-working element. A high score is real evidence the element is about the right thing; it is not proof it is the specific element this check depended on. Prefer the top-ranked one only if reading its "resolves to" description confirms it is plausibly what the method is meant to establish — do not pick on the score alone.`
    : `VERIFIED REPLACEMENT CANDIDATES ON THE FAILING PAGE
Each option below was found on the failing page itself and confirmed to match EXACTLY ONE element. "similarity" is how closely it resembles the element this locator matched when the test last passed — 1.0 is an exact identity match, below ~0.4 means they share little beyond position.
`;

  return `
${header}

${sections.join('\n\n')}

Prefer the highest-similarity candidate when it is plausible: it is real, unique, and written in this project's preferred locator style. If none of them is right, do NOT invent a different selector — say so in "explanation" and return no edits. An invented selector cannot be better than a verified one, and a low-similarity candidate usually means the element this check depends on is genuinely absent, which is a finding about the app rather than something to fix here.`;
}

function conventionsBlock() {
  const conventions = loadFixConventions();
  return conventions.text ? `\n${conventions.text}\n` : '';
}

function buildSpotFixPrompt(
  test,
  rca,
  errorContext,
  files,
  priorAttempts = [],
  domSnapshot = null,
  hangingAction = null,
  baseline = null,
  candidateSets = null,
  verifiedRelated = null
) {
  // Must run before buildExcerpt (inside the map below) sees file.extraLines.
  widenExcerptsForRelatedLocators(files);

  const hints = extractDomHints(files, stripAnsi(test.error?.message));
  const fileBlocks = files
    .map((f) => {
      const { text, truncated } = buildExcerpt(f);
      const header = truncated
        ? `--- FILE (excerpt around the failing lines): ${f.relative} ---`
        : `--- FILE: ${f.relative} ---`;
      // Only worth the tokens when the excerpt is partial — a whole-file
      // block already shows every locator/method there is.
      const catalog = truncated ? renderLocatorIndex(f.relative, buildLocatorIndex(f.content)) : '';
      return [`${header}\n${text}`, catalog].filter(Boolean).join('\n\n');
    })
    .join('\n\n');

  return `You are fixing a failing Playwright test in a TypeScript repo. Propose the smallest source change that makes it pass.

FAILING TEST
Title: ${test.title}
Location: ${test.file}:${test.line}

ERROR
${stripAnsi(test.error?.message) || '(no error message captured)'}
${failingLinesBlock(test)}
${assertionContextBlock(test)}
${testFlowBlock(test)}

A SEPARATE, EARLIER PASS'S PRELIMINARY GUESS (unverified — do not defer to this)
${rca.summary}
${rca.rootCause || ''}
This was written before the step-by-step trace and file evidence below existed, from the error text alone, and it can be wrong in ways that look plausible — including diagnosing the wrong step entirely. Treat it only as one hypothesis to check against the STEPS/SOURCE FILES evidence below, never as a settled conclusion. If that evidence points somewhere else, go with the evidence and say in "explanation" that you're overriding this earlier guess and why.
${priorFailedAttemptsBlock(priorAttempts)}

${ariaSnapshotBlock(errorContext?.pageSnapshot, hints)}
${domSnapshotBlock(domSnapshot, hints)}
${baselineDomBlock(baseline, hints)}
${candidatesBlock(candidateSets)}
${hangingActionBlock(hangingAction)}
${swallowedFailureBlock(files, test)}
SOURCE FILES YOU MAY EDIT
${fileBlocks}
${relatedLocatorsBlock(files, verifiedRelated)}
${conventionsBlock()}
RULES
- Only edit the files shown above. Never invent a path.
- "oldCode" must be copied byte-for-byte from the source shown, including indentation.
- "oldCode" must be UNIQUE in the file. These spec files are repetitive — lines like \`const data = testData['...'];\` open nearly every test — so a single line is almost never unique. Include several consecutive lines, and prefer ones containing a distinctive string such as the test title or a specific key, so the snippet can only match the test being fixed.
- Where a file is shown as an excerpt, "// ---- ... lines N-M ----" markers are annotations, not source. Never include them in "oldCode".
- Make the minimal change that addresses the diagnosed root cause. Do not reformat, rename, or "improve" unrelated code.
- Call only methods and locators that actually appear in the source shown (including any "full locator/method catalog" listing) — never invent a plausible-sounding method name. A call to a method a class does not declare is rejected automatically before a human ever sees it, so it wastes the whole proposal. If the method you need doesn't exist, that itself is worth saying in "explanation" rather than inventing one.
- Do not infer what a helper method does from its name or from how the test calls it. Read its actual body wherever it is shown below. A structural mismatch between an earlier step's real behavior and what a later step assumes is a common root cause that no amount of improving the later step's own matching/waiting logic can fix.

The test exists to catch bugs. A change that makes it pass without fixing the cause is worse than leaving it red. Therefore:
- NEVER change what an assertion expects just to match what was observed. If the app returned false where the test expects true, that is either a real app bug or a deliberate expectation a human must re-decide — not something to edit away.
- NEVER delete or comment out an assertion, and never add .skip or .fixme.
- Do NOT simply increase a timeout. Only adjust one if the evidence positively shows the app is merely slow, and say so in "reason".
- Do NOT add page.waitForTimeout() or any fixed sleep. Wait for the specific element or state instead (expect(...).toBeVisible(), locator.waitFor({ state }), waitForResponse) — a fixed sleep hides the race and slows every future run.
- Legitimate fixes look like: correcting a selector that no longer matches the rendered page, waiting for the right element before reading it, or fixing genuinely wrong navigation/setup steps.
${locatorShapeRule(files)}
- An argument that is only read to build an assertion or a log message does NOT change what the test waits for. Editing one leaves the failure completely unchanged, so verify how a value is actually used before proposing to change it.
- Match the surrounding code's formatting: one statement per line, same indentation and quote style. Never put two statements on one line.
- If the page snapshot shows the app never loaded (an error/challenge page), there is no code fix — return an empty "edits" array and explain why.
- If the honest answer is that the app looks broken rather than the test, return an empty "edits" array and say that in "explanation".
- If you cannot identify a confident fix, return an empty "edits" array rather than guessing.

Respond with ONLY a JSON object, no prose and no markdown fence:
{
  "explanation": "<what you changed and why, 1-3 sentences>",
  "confidence": "high" | "medium" | "low",
  "edits": [
    { "file": "<path exactly as shown above>", "oldCode": "<exact existing snippet>", "newCode": "<replacement>", "reason": "<one line>" }
  ]
}`;
}

module.exports = { buildSpotFixPrompt };
