/**
 * Zero-cost, zero-network RCA: pattern-matches known failure signatures
 * against the test's error message/stack and (when available) the page
 * snapshot captured in error-context.md. Always available as a fallback
 * when no AI provider is configured or reachable.
 *
 * Every rule's rootCause/suggestedFix is an array of short, dense lines
 * (joined with \n, rendered with white-space: pre-line) rather than a single
 * paragraph — one concrete fact or action per line. Where real evidence is
 * available (the actual matcher, the actual Expected/Received values, the
 * exact failing source line, the actual blocked-page text, the actual
 * network error code) it is extracted and quoted directly rather than
 * described generically, so the analysis is genuinely about *this* failure,
 * not a template that merely resembles it. When that evidence can't be
 * parsed, the text falls back to honest, generic phrasing — it never
 * fabricates a specific value it didn't actually capture.
 */
const { stripAnsi } = require('./ansi');

/**
 * Pulls "Expected: X" / "Received: Y" out of Playwright's own error-details
 * block, when present. Returns null for whichever line isn't found — never
 * guesses at a value that wasn't actually captured.
 */
function extractExpectedReceived(errorContext) {
  const details = errorContext?.errorDetails || '';
  const expected = details.match(/^Expected(?:\s+\w+)?:\s*(.+)$/m)?.[1]?.trim() || null;
  const received = details.match(/^Received(?:\s+\w+)?:\s*(.+)$/m)?.[1]?.trim() || null;
  return { expected, received };
}

/**
 * Pulls the exact failing statement out of Playwright's test-source frame —
 * the line it prefixes with `>` to mark where the error occurred. This is
 * the single most concrete piece of evidence available for a value/state
 * assertion: the literal code that was asserted, not a description of it.
 *
 * Deliberately NOT trusted for a timedOut test — see TIMED_OUT_UNSAFE_RULE_IDS
 * below for why: observed directly on this suite that for a whole-test
 * timeout, this frame can point at a completely different test's body than
 * the one that actually timed out.
 */
function extractFailingStatement(errorContext) {
  const source = errorContext?.testSource || '';
  const line = source.match(/^>\s*\d+\s*\|(.*)$/m)?.[1]?.trim();
  return line || null;
}

/** Pulls the `Locator: ...` line Playwright prints for locator-based matchers, when present. */
function extractLocatorLine(errorContext) {
  const details = errorContext?.errorDetails || '';
  return details.match(/^Locator:\s*(.+)$/m)?.[1]?.trim() || null;
}

/**
 * Actually checks whether a selector's base element exists in the real DOM
 * captured right after the failure (src/fixtures/test-hooks.ts's own
 * afterEach hook — see index.js for why that capture, unlike Playwright's
 * built-in error-context.md, is trustworthy even for a timedOut test).
 *
 * Deliberately conservative: only attempts the check for the plain selector
 * shapes this suite actually uses (a bare tag, #id, .class, or
 * [data-testid=...]) — Playwright's full selector language (chained
 * locators, text=, :has(), nested nth=) is not reimplemented here, and
 * guessing wrong would be worse than admitting the check couldn't be done.
 * Returns { checked: false } whenever it isn't confident, and the caller
 * falls back to the existing honest "couldn't be checked" wording.
 */
function checkSelectorAgainstDom(selector, domSnapshot) {
  if (!selector || !domSnapshot?.html) return { checked: false };
  const base = selector.split('>>')[0].trim();
  const html = domSnapshot.html;

  const tagMatch = base.match(/^[a-zA-Z][a-zA-Z0-9-]*$/);
  const idMatch = base.match(/^#([\w-]+)$/);
  const classMatch = base.match(/^\.([\w-]+)$/);
  const testIdMatch = base.match(/\[data-testid=["']?([\w-]+)["']?\]/i);

  if (tagMatch) {
    return { checked: true, present: new RegExp(`<${base}[\\s/>]`, 'i').test(html), describedCheck: `a <${base}> element` };
  }
  if (idMatch) {
    return { checked: true, present: new RegExp(`id=["']${idMatch[1]}["']`, 'i').test(html), describedCheck: `an element with id "${idMatch[1]}"` };
  }
  if (classMatch) {
    return { checked: true, present: new RegExp(`class=["'][^"']*\\b${classMatch[1]}\\b`, 'i').test(html), describedCheck: `an element with class "${classMatch[1]}"` };
  }
  if (testIdMatch) {
    return { checked: true, present: new RegExp(`data-testid=["']${testIdMatch[1]}["']`, 'i').test(html), describedCheck: `an element with data-testid "${testIdMatch[1]}"` };
  }
  return { checked: false };
}

const VALUE_MATCHERS = ['toBe', 'toEqual', 'toContain', 'toHaveText'];
const STATE_MATCHERS = [
  'toBeVisible',
  'toBeHidden',
  'toBeEnabled',
  'toBeDisabled',
  'toBeEditable',
  'toBeChecked',
  'toBeFocused',
  'toBeEmpty',
  'toBeInViewport',
  'toBeAttached',
];
// The trailing `\(` is load-bearing: without it, an alternation like `toBe`
// also matches as a prefix of `toBeVisible(`, which is exactly the bug that
// caused a stuck-on-`toBeVisible()` state timeout to be misfiled as "a value
// assertion failed" (see assertion-mismatch below). Requiring the literal
// open-paren right after the matcher name makes the two families mutually
// exclusive.
const VALUE_MATCHER_RE = new RegExp(`expect\\([^)]*\\)\\.(${VALUE_MATCHERS.join('|')})\\(`, 'i');
const STATE_MATCHER_RE = new RegExp(`expect\\([^)]*\\)\\.(${STATE_MATCHERS.join('|')})\\(`, 'i');

const RULES = [
  {
    id: 'cdn-access-denied',
    category: 'infrastructure',
    test: (text) => /access denied/i.test(text) && /edgesuite\.net|akamai|don't have permission to access/i.test(text),
    build: (text) => {
      const snippet = text.match(/[^\n]*access denied[^\n]*/i)?.[0]?.trim().slice(0, 160) || null;
      return {
        summary: 'Blocked by the CDN edge (Akamai) before the app ever loaded.',
        rootCause: [
          snippet
            ? `The captured page snapshot shows: "${snippet}" instead of the real application.`
            : 'The captured page snapshot shows an Akamai "Access Denied" page instead of the real application.',
          "This block happens at the CDN/edge layer, entirely outside the app's own code.",
          'Because the real page never loaded, every element the test later waits for is missing by definition.',
          'Every downstream selector timeout in this run is a symptom of this block, not an independent failure.',
          'The two usual triggers are bot/automation detection flagging the Playwright session, or a geo/network restriction on this runner.',
          'Nothing in this repository can fix an edge-level block — it has to be cleared or worked around outside the test code.',
        ].join('\n'),
        suggestedFix: [
          'Re-run the same test in headed mode first — this suite does not set headless explicitly, so a bare run is headless and more likely to be flagged.',
          'If headed mode gets past Akamai, prefer headed (or a stealth-friendly config) for this project going forward.',
          "If headed mode still returns Access Denied, the block isn't about headless detection — it's IP/geo-level.",
          "Confirm this runner's network path (VPN, proxy, corporate network) matches whatever Akamai already allow-lists for manual browsing.",
          "Check whether this is a shared CI runner IP that's been rate-limited or blocklisted by Akamai from unrelated traffic.",
          'If the block persists after both checks, escalate to whoever owns the Akamai/WAF configuration — this is an infrastructure ticket, not a test fix.',
        ].join('\n'),
      };
    },
  },
  {
    /**
     * The app's shell rendered but its content area came back empty — nav and
     * footer present, `main` with no children at all. Every downstream check
     * then fails for one reason: there was nothing on the page to check.
     *
     * Worth its own rule because it is otherwise indistinguishable from a
     * stale-selector bug, and gets mislabelled as a code issue: the observed
     * case was a live-channel page that navigated correctly (the document
     * title matched) but rendered an empty `main`, which the AI classified as
     * "code" and then tried to fix by rewriting an assertion. No edit to this
     * repo can populate a page the app left blank.
     *
     * Matched against the page snapshot only, where `- main` on its own line
     * means a main element with no accessible children.
     */
    id: 'empty-content-area',
    category: 'environment',
    test: (text, errorContext) => /^\s*-\s*main\s*$/m.test(errorContext?.pageSnapshot || ''),
    build: () => ({
      summary: 'The app rendered its shell but the content area came back empty.',
      rootCause: [
        'The captured accessibility snapshot shows navigation and footer present, but the `main` region has no children at all.',
        "That means the app's shell (chrome, layout) loaded correctly, but its actual content never rendered inside it.",
        'Every assertion the test makes about on-page content is checking a page that was always going to be empty.',
        'That failing assertion is a symptom of the empty render, not an independent bug worth chasing on its own.',
        'No edit to this test or its Page Objects can populate a page the application itself left blank.',
        'This is classified as environment, never as code, precisely because there is nothing here for a test change to fix.',
      ].join('\n'),
      suggestedFix: [
        'Open the exact same URL manually in a normal browser, signed in the same way the test session would be.',
        'If the content renders fine manually, the gap is specific to the automated session — check entitlement/region restrictions on the test account.',
        'Also check for bot detection silently serving a blank shell to automated traffic (this app has a known history of Akamai-level blocks).',
        'If the content is empty manually too, this is a genuine application bug — reproduce it once more and hand it to the app developers.',
        'Compare against a run that passed for the same page to see what data/state made the difference.',
        'Do not spend time adjusting selectors or waits here — there is nothing on the page for a better selector to find.',
      ].join('\n'),
    }),
  },
  {
    id: 'locator-timeout',
    category: 'code',
    test: (text) => /timeouterror/i.test(text) && /waitfor/i.test(text) && /locator/i.test(text),
    build: (text) => {
      const loc = text.match(/locator\('([^']+)'\)/)?.[1]?.trim() || null;
      const locPhrase = loc ? `locator('${loc}')` : 'the target locator';
      return {
        summary: `Element never became visible in time: ${locPhrase}.`,
        rootCause: [
          `Playwright's own wait for ${locPhrase} ran out before the element reached the expected state.`,
          'This is a targeted, single-locator timeout, not a whole-test timeout — the rest of the test had a chance to run before and after it.',
          "One likely cause: an earlier step (navigation, a click, a form submit) didn't actually put the page into the state this locator expects.",
          "Another likely cause: the selector itself is stale — the app's markup changed and nothing on the page matches it anymore.",
          'A third, less likely cause: the element does appear, just slower than this wait allows, especially under load or on a slow network.',
          'Which of the three it is decides whether this is a real regression, a stale locator, or just a timing issue.',
        ].join('\n'),
        suggestedFix: [
          'Open the page snapshot/screenshot captured at failure time below and check what was actually on screen.',
          'If the page shows a different screen than expected, walk back through the steps before this line to find where the flow diverged.',
          `If the page shows the right screen but ${locPhrase} is genuinely absent, the selector is stale — update it in the relevant Page Object.`,
          'If the element is visible in the snapshot despite the timeout, this was likely a pure timing issue, not a stale selector.',
          'For a timing issue, add a targeted explicit wait for the specific condition this step needs, rather than raising the global test timeout.',
          're-run once after any selector change to confirm it was the actual cause and not coincidental timing.',
        ].join('\n'),
      };
    },
  },
  {
    // Distinct from assertion-mismatch below: a state matcher like
    // toBeVisible()/toBeEnabled() has Playwright's own built-in retry/polling
    // behind it, so a failure here means the state genuinely never arrived
    // within that window — not a one-shot value comparison. Conflating the
    // two used to happen by accident (see VALUE_MATCHER_RE's comment above),
    // which produced a "value mismatch" root cause for what was actually a
    // rendering/timing problem.
    id: 'element-state-mismatch',
    category: 'code',
    test: (text) => STATE_MATCHER_RE.test(text),
    build: (text, errorContext) => {
      const matcher = text.match(STATE_MATCHER_RE)?.[1] || 'a state matcher';
      const { expected, received } = extractExpectedReceived(errorContext);
      const locatorLine = extractLocatorLine(errorContext);
      const statement = extractFailingStatement(errorContext);
      const hasConcrete = Boolean(expected && received);

      return {
        summary: locatorLine ? `${locatorLine} never reached the expected state (${matcher}).` : `An element never reached the expected state (${matcher}).`,
        rootCause: [
          statement
            ? `The failing line was: ${statement}`
            : `A Playwright expect(...).${matcher}(...) assertion failed — the element was not in the state the test required.`,
          locatorLine
            ? `The locator under test was: ${locatorLine}.`
            : 'Playwright retries this kind of check internally for a few seconds before giving up, so this is not a one-frame fluke.',
          hasConcrete
            ? `It expected ${expected} but observed ${received} when the retry window ran out.`
            : 'That built-in retrying is what distinguishes this from a plain value assertion: it means the state genuinely never arrived, not that it was checked too early.',
          'One likely cause: an earlier step did not actually put the page into the state this element needs to reach.',
          "Another likely cause: the element's selector, class, or attribute changed, so this locator now resolves to the wrong node (or none).",
          "A third, less common cause: the app is simply slower than this assertion's retry window under current load or network conditions.",
        ].join('\n'),
        suggestedFix: [
          'Open the page snapshot/screenshot captured at failure time and check the actual state of this element.',
          locatorLine
            ? `Confirm ${locatorLine} still resolves to the intended element in today's markup — check it against the DOM snapshot below.`
            : "Confirm the locator still resolves to the intended element in today's markup.",
          'If the page shows a different screen than expected, walk back through the steps before this line to find where the flow diverged.',
          'If the element is visible in the snapshot despite the assertion failing, this was likely a timing issue — widen the retry window for this one check rather than the whole test.',
          'If the element is absent or restructured, update the locator in the relevant Page Object rather than the assertion itself.',
          're-run once after any change to confirm it was the actual cause and not coincidental timing.',
        ].join('\n'),
      };
    },
  },
  {
    id: 'toast-text-mismatch',
    category: 'code',
    test: (text) => /expect\(received\)\.toContain\(expected\)/i.test(text) && /received string:\s*""/i.test(text),
    build: (text) => {
      const expectedSubstring = text.match(/toContain\(\s*['"]([^'"]+)['"]\s*\)/i)?.[1] || null;
      const expectedPhrase = expectedSubstring ? `"${expectedSubstring}"` : 'a substring like "added" or "removed"';
      return {
        summary: expectedSubstring ? `Expected confirmation text to contain "${expectedSubstring}", but got nothing.` : 'Expected confirmation text (e.g. a toast) was empty when checked.',
        rootCause: [
          `The test expected ${expectedPhrase} inside some captured text, but the text it actually read was empty.`,
          'An empty string almost always means the read happened before the toast/confirmation element existed on the page yet.',
          'That points to a race: the assertion ran immediately after the triggering click, without waiting for the UI to catch up.',
          "A second, less common cause: the toast's selector or wording changed, so the test is reading the wrong element (or nothing).",
          'Both causes produce the exact same symptom — an empty string — so the DOM snapshot is needed to tell them apart.',
          'This is a test-code issue either way: the app most likely did show the confirmation, the test just checked too early or in the wrong place.',
        ].join('\n'),
        suggestedFix: [
          'Add an explicit wait for the toast/confirmation element to become visible before reading its text.',
          'Do not read the text immediately after the triggering click — insert that wait between the click and the assertion.',
          "Check the DOM/page snapshot for the toast's current selector and confirm the test still targets the right element.",
          expectedSubstring
            ? `If the selector is fine, confirm the toast's current copy still contains "${expectedSubstring}" — wording may have changed.`
            : "If the selector is fine, check the toast's current copy against the substring the test expects — wording may have changed.",
          'Update the expected substring if the copy changed; update the locator if the element moved or was restructured.',
          "Re-run the fixed test a couple of times — a race condition can pass by luck, so one green run isn't full confirmation.",
        ].join('\n'),
      };
    },
  },
  {
    id: 'network-error',
    category: 'environment',
    test: (text) => /net::err_\w+|econnrefused|enotfound|err_connection\w*/i.test(text),
    build: (text) => {
      const code = text.match(/net::err_\w+|econnrefused|enotfound|err_connection\w*/i)?.[0] || null;
      const codePhrase = code ? `"${code.toUpperCase()}"` : 'a connection-level error';
      return {
        summary: code ? `A network-level request failed (${code.toUpperCase()}).` : 'A network-level request failed (connection refused/DNS/reset).',
        rootCause: [
          `The browser reported ${codePhrase} — no response ever came back, successful or otherwise.`,
          'That places this below the application layer entirely: DNS, connectivity, or the target host refusing the connection.',
          "Nothing in the page, the test, or the app's own code ran far enough to matter — the request never landed.",
          'Typical causes are the target host being down, a DNS/name-resolution problem, or a VPN/proxy/firewall blocking the connection.',
          'This kind of failure is usually all-or-nothing: if one request failed this way, most others to the same host likely did too.',
          'There is no test-logic fix for a request that never reached the server — this is a connectivity issue to resolve first.',
        ].join('\n'),
        suggestedFix: [
          'Confirm the target environment URL is reachable right now from this same machine (a plain browser tab or curl is enough).',
          'Check whether a VPN, proxy, or corporate firewall is active and could be blocking or rerouting this specific request.',
          'If this is a CI runner, confirm it has the same network path/allow-list a developer machine would have for this environment.',
          "Check whether other tests hitting the same host in this run failed the same way — that confirms it's environment-wide, not one-off.",
          'If the host is genuinely down, this belongs with whoever owns that environment, not with a test-code change.',
          'Once connectivity is confirmed restored, re-run before assuming anything else in the test was wrong.',
        ].join('\n'),
      };
    },
  },
  {
    id: 'assertion-mismatch',
    category: 'code',
    test: (text) => VALUE_MATCHER_RE.test(text),
    build: (text, errorContext) => {
      const matcher = text.match(VALUE_MATCHER_RE)?.[1] || 'a value matcher';
      const { expected, received } = extractExpectedReceived(errorContext);
      const statement = extractFailingStatement(errorContext);
      const hasConcrete = Boolean(expected && received);

      return {
        summary: hasConcrete ? `Assertion failed: expected ${expected}, received ${received}.` : 'A value assertion failed (actual did not match expected).',
        rootCause: [
          statement
            ? `The failing line was: ${statement}`
            : `A Playwright expect(...).${matcher}(...) call failed — the value on the page did not match what the test asserted.`,
          hasConcrete
            ? `It expected ${expected} but the app actually produced ${received} at the moment the assertion ran.`
            : 'This is a real assertion failure, not a timeout or a hang: the test reached this line and produced a concrete, comparable result.',
          "One possibility: the application's actual behavior or copy changed, and the test's expectation is now out of date.",
          'Another possibility: the test data (a title, a price, a count, a flag) is stale relative to what the environment currently has.',
          'A third possibility: the assertion is reading the right kind of value but from the wrong element, response, or variable.',
          hasConcrete
            ? `Everything needed to tell those apart is right here: expected ${expected}, got ${received} — trace back through the steps above the failing line to see what actually produced ${received}.`
            : 'The "Expected" vs "Received" values in the error details above narrow this down immediately.',
        ].join('\n'),
        suggestedFix: [
          hasConcrete
            ? `Start from the concrete mismatch — expected ${expected}, received ${received} — and confirm which one is actually correct before changing anything.`
            : 'Read the "Expected" vs "Received" values in the error details above before changing anything.',
          statement
            ? `Trace back from \`${statement}\` to whatever produced that value, and inspect it at that point (a log, the trace, or the DOM snapshot).`
            : 'Cross-check "Received" against the page snapshot to confirm which element or value the test actually read.',
          "If the app's behavior genuinely changed on purpose, update the test's expected value to match the new behavior.",
          'If the test data is stale (an old title, price, count, or flag), refresh the fixture/test data rather than hand-editing the assertion.',
          'If the snapshot shows the assertion is reading the wrong element or variable, fix that instead of the expected value.',
          'Avoid loosening the assertion as a shortcut (widening a match, or flipping the expected boolean) — that only hides the next real regression.',
        ].join('\n'),
      };
    },
  },
];

// Rules whose match depends on errorContext.errorDetails/testSource content
// rather than the current attempt's own recorded error message. Observed
// directly on this suite: for a whole-test timeout, error-context.md's
// "Test source" frame pointed at a *different* test's body entirely (the
// previous test in the same spec file) — Playwright's error-context capture
// does not reliably regenerate on a bare timeout, so it can carry over
// whatever it last captured earlier in the same worker. Quoting a specific
// "Expected"/"Received"/failing-line value drawn from that content for a
// timedOut test would describe the wrong failure while sounding exact and
// confident about it, which is worse than a generic-but-honest fallback.
const TIMED_OUT_UNSAFE_RULE_IDS = new Set(['assertion-mismatch', 'element-state-mismatch', 'toast-text-mismatch', 'locator-timeout']);

function combinedText(test, errorContext) {
  const parts = [stripAnsi(test.error?.message) || '', stripAnsi(test.error?.stack) || ''];
  if (errorContext) parts.push(errorContext.errorDetails, errorContext.pageSnapshot);
  return parts.filter(Boolean).join('\n');
}

/**
 * Builds a root cause from the one concrete fact a bare timeout actually
 * offers: the trace-recovered call that never finished (see traceActions.js).
 *
 * A bare "Test timeout of Nms exceeded" has no assertion text of its own, so
 * the pattern rules above can still fire on unrelated content dragged in from
 * the page snapshot or a stale error-context.md left over from an earlier
 * retry — observed directly: an "assertion-mismatch" rule matching a run
 * whose real error was nothing but the bare timeout, producing a generic
 * "value assertion failed" root cause for a test that never got far enough to
 * evaluate one. Naming the exact hung call is strictly more specific evidence
 * than that kind of text match, so it takes priority whenever it's available.
 */
function buildHangingActionResult(hangingAction, domSnapshot) {
  const what = hangingAction.title || hangingAction.method || 'a call inside the test';
  const where = hangingAction.describedParams || 'no further detail was captured for it';
  const selectorPhrase = hangingAction.selector ? `"${hangingAction.selector}"` : 'the awaited element';
  const awaitedState = hangingAction.params?.state || 'the awaited state';
  const budgetLineRootCause = hangingAction.inheritedTestTimeout
    ? 'That call had no timeout of its own, so it silently absorbed the entire test budget — nothing scheduled after it ever got a turn to run.'
    : "This call had its own timeout separate from the test's overall budget, so its expiry alone triggered the failure.";
  const budgetLineFix = hangingAction.inheritedTestTimeout
    ? 'Since this call had no timeout of its own, consider giving it an explicit bounded wait — that turns a silent full-budget hang into a fast, specific failure next time.'
    : 'Since this call already had its own timeout, a longer wait here would only delay the same failure rather than prevent it.';
  const rootCauseCore = [
    'Recovered from the Playwright trace: this call had a "before" event with no matching "after" — it was the one thing still in flight when the test was killed.',
    `It was inside ${what} (${where}).`,
    budgetLineRootCause,
    'Every other line in the error output is downstream of this one stuck call, not a separate problem to diagnose on its own.',
    'There is no distinct assertion failure here — the bare "Test timeout exceeded" message only marks when the clock ran out, not what actually went wrong.',
  ];

  // The trace alone can't say whether the awaited element is genuinely
  // missing (code: a stale locator) or present but stuck (environment: the
  // app never finished getting there) — but the real DOM captured right
  // after the failure can. Checking it turns that from a guess into a fact.
  const domCheck = checkSelectorAgainstDom(hangingAction.selector, domSnapshot);

  if (domCheck.checked && domCheck.present === false) {
    return {
      ruleId: 'hanging-action-timeout',
      source: 'heuristic',
      category: 'code',
      summary: `Timed out waiting on ${what} — ${domCheck.describedCheck} does not exist on the page.`,
      rootCause: [
        ...rootCauseCore,
        `Checked the real DOM captured right after the failure: ${domCheck.describedCheck} does not exist anywhere on the page — the selector matches nothing, not just the wrong state.`,
      ].join('\n'),
      suggestedFix: [
        `The DOM captured at failure time confirms ${domCheck.describedCheck} is not present anywhere on the page — this is not a timing issue.`,
        `Update the locator in the relevant Page Object to whatever the app actually renders in place of ${selectorPhrase}.`,
        domSnapshot?.url
          ? `The page at failure time was ${domSnapshot.url} — open it manually to see what markup actually stands in for this element now.`
          : 'Open the page manually to see what markup actually stands in for this element now.',
        'Search the DOM excerpt below to confirm there truly is no equivalent element under a different tag, class, or attribute.',
        budgetLineFix,
        'Re-run once after the locator is updated to confirm this was the actual cause and not something else entirely.',
      ].join('\n'),
    };
  }

  if (domCheck.checked && domCheck.present === true) {
    return {
      ruleId: 'hanging-action-timeout',
      source: 'heuristic',
      category: 'environment',
      summary: `Timed out waiting on ${what} — ${domCheck.describedCheck} exists but never reached "${awaitedState}".`,
      rootCause: [
        ...rootCauseCore,
        `Checked the real DOM captured right after the failure: ${domCheck.describedCheck} IS present on the page, so the locator itself is fine — the app simply never brought it to "${awaitedState}" in time.`,
      ].join('\n'),
      suggestedFix: [
        `The DOM confirms ${domCheck.describedCheck} exists, so this is not a stale locator or a wrong selector.`,
        `Investigate why the app took too long (or never finished) bringing it to "${awaitedState}" — a slow network response, a stuck loading state, or a player/data error are the usual causes.`,
        domSnapshot?.url
          ? `Reproduce manually at ${domSnapshot.url} and watch whether the same element reaches "${awaitedState}" on its own, and how long it takes.`
          : 'Reproduce the same flow manually and watch whether the element reaches this state on its own, and how long it takes.',
        'If it reaches the state eventually but slowly, this is a timing/performance issue worth its own explicit wait, not a locator fix.',
        'If it never reaches the state manually either, this is an application bug to raise with the developers, not a test change.',
        budgetLineFix,
      ].join('\n'),
    };
  }

  return {
    ruleId: 'hanging-action-timeout',
    source: 'heuristic',
    category: 'unknown',
    summary: `Timed out waiting on ${what} — it never completed.`,
    rootCause: [
      ...rootCauseCore,
      `Whether this is code or environment comes down to one question that couldn't be checked automatically here: does ${selectorPhrase} exist on the page at all right now?`,
    ].join('\n'),
    suggestedFix: [
      `Open the page snapshot/DOM excerpt below and search for ${selectorPhrase} to see its actual state at failure time.`,
      "If it's present but stuck in a different state than awaited, the app most likely never reached the expected point in the flow — treat this as environment/data, not a test bug.",
      "If the selector matches nothing on the page at all, the locator itself is stale relative to what the app currently renders — that's a code fix.",
      "If it's present under a slightly different selector or attribute, update the locator in the relevant Page Object rather than widening this one.",
      budgetLineFix,
      'Trace back through the steps immediately before this call for the real starting point of the problem, rather than only looking at where the clock ran out.',
    ].join('\n'),
  };
}

/**
 * The last resort for a timedOut test when there is no hanging-action
 * evidence (no trace, or the trace couldn't be parsed) AND the timed-out-
 * unsafe rules above were skipped for the same reason they're unsafe: there
 * is nothing left that's both specific and trustworthy. Deliberately vague
 * about the cause rather than quoting a value from context that might belong
 * to a different moment (or a different test) than the one that hung.
 */
function buildBareTimeoutNoEvidenceResult() {
  return {
    ruleId: 'bare-timeout-no-evidence',
    source: 'heuristic',
    category: 'unknown',
    summary: 'The whole test timed out, and no trace evidence could be recovered for what it was doing at that moment.',
    rootCause: [
      'The test was killed by its overall timeout, and the trace either has no readable record of what was still in flight, or none was captured at all.',
      "Playwright's own error-context.md is attached to this failure, but for a whole-test timeout it can reflect an earlier moment in the run rather than the instant of the hang.",
      "That section should not be read as a description of this exact failure without cross-checking it against the trace timeline first.",
      'Without a trustworthy trace or a fresh error-context snapshot, there is no reliable signal for which specific call or condition never resolved.',
      'That rules out confidently quoting a specific selector, assertion, or expected/received value here — doing so would risk describing the wrong moment.',
      'The failure is real, but automatic analysis has nothing solid enough underneath it to build a specific diagnosis on.',
    ].join('\n'),
    suggestedFix: [
      'Open the trace below (if one was captured) and step through the last few actions manually to see what the test was doing right before the timeout.',
      "Do not treat this run's error-context.md snapshot (page state / test source) as necessarily describing this exact moment — cross-check it against the trace timeline first.",
      'If no trace is available, re-run the test with tracing enabled so the next occurrence can be diagnosed with real evidence.',
      "Compare against this test's prior history (above) — if it has timed out the same way before, that context may narrow things down.",
      'Once the actual hanging point is found manually, note it so a future occurrence of this test gets a trace-based diagnosis automatically.',
      'Avoid guessing a category (code vs environment) from this alone — leave it as unknown until the trace confirms one or the other.',
    ].join('\n'),
  };
}

/** Never throws; falls back to a generic "needs manual review" result if nothing matches. */
function runHeuristics(test, errorContext, hangingAction = null, domSnapshot = null) {
  const text = combinedText(test, errorContext);
  const message = stripAnsi(test.error?.message) || '';
  // Only a *bare* timeout (no assertion of its own) is at risk of the
  // false-positive above; a message that already contains real assertion
  // text is trustworthy on its own and should not be overridden.
  const isBareTimeoutWithEvidence = Boolean(hangingAction?.selector) && BARE_TIMEOUT_RE.test(message);
  const isTimedOut = test.status === 'timedOut';

  for (const rule of RULES) {
    // errorContext is passed too: some signals (an empty content area) live in
    // the structure of the page snapshot, not in the flattened error text.
    if (!rule.test(text, errorContext)) continue;
    // Rules backed by concrete, specific evidence of their own (an Akamai
    // block page, a genuinely empty content area, a network-level failure)
    // still win even for a bare timeout — only the generic/weak matches get
    // superseded by the hanging-call evidence.
    if (isBareTimeoutWithEvidence && !STRONG_EVIDENCE_RULE_IDS.has(rule.id)) continue;
    // A timedOut test's errorContext can carry over stale content from
    // earlier in the run (see TIMED_OUT_UNSAFE_RULE_IDS above) — never quote
    // it as if it specifically describes this hang.
    if (isTimedOut && TIMED_OUT_UNSAFE_RULE_IDS.has(rule.id)) continue;
    return { ruleId: rule.id, source: 'heuristic', category: rule.category, ...rule.build(text, errorContext, domSnapshot) };
  }

  if (isBareTimeoutWithEvidence) return buildHangingActionResult(hangingAction, domSnapshot);
  if (isTimedOut) return buildBareTimeoutNoEvidenceResult();

  return {
    ruleId: 'no-match',
    source: 'heuristic',
    category: 'unknown',
    summary: 'No known failure pattern matched — needs manual review.',
    rootCause: [
      'None of the known failure signatures this dashboard recognizes automatically matched this error.',
      "That means this isn't a known CDN block, empty-page render, locator timeout, toast race, network failure, or assertion mismatch.",
      'It could still be a variant of one of those — slightly different wording can miss a pattern match entirely.',
      "Or it could be a genuinely new failure mode this suite hasn't hit before, which is worth its own signature once understood.",
      'Automatic classification (code / environment / infrastructure) is not reliable here, so it is left as "unknown" rather than guessed.',
      "The raw evidence below is the same evidence a matched rule would have used — it's just not been pattern-matched for you yet.",
    ].join('\n'),
    suggestedFix: [
      'Start with the error message and stack below — the exact wording usually points at what kind of failure this is.',
      'Open the page snapshot to see what was actually on screen (or not) when the test failed.',
      'Check the screenshot and, if present, the trace for a step-by-step view of what happened right before the failure.',
      "Compare against this test's prior history (above) — if it has failed the same way before, that context may already exist.",
      'Once the real cause is clear, consider whether it matches an existing category closely enough to note for next time.',
      'If this is a recurring new shape of failure, it may be worth a dedicated heuristic rule so future occurrences aren\'t left "unknown".',
    ].join('\n'),
  };
}

const BARE_TIMEOUT_RE = /test timeout of \d+ms exceeded/i;
// Rules whose category is already backed by concrete, specific evidence
// (an Akamai block page, a genuinely empty content area, a network-level
// failure) — never worth overriding just because the failure also happens to
// carry the generic "Test timeout of Nms exceeded" wrapper text.
// 'hanging-action-timeout' and 'bare-timeout-no-evidence' join this set too:
// both already fold in (or deliberately withhold, in the latter case) every
// bit of evidence this guard would otherwise append as a note, so letting
// the guard touch either again would only duplicate or contradict them.
const STRONG_EVIDENCE_RULE_IDS = new Set([
  'cdn-access-denied',
  'empty-content-area',
  'network-error',
  'hanging-action-timeout',
  'bare-timeout-no-evidence',
]);

/**
 * Bare "Test timeout of Nms exceeded" is the single most common failure
 * shape in this suite, and on its own it says nothing about *why* — an AI
 * asked to classify it has to guess from a long, generic page snapshot, and
 * two failures with near-identical evidence can land in different
 * categories purely depending on how the model reads that snapshot each
 * time. (Observed directly: two timeouts in the same run, same spec file —
 * one called "environment", one called "code" — with no rule enforcing
 * either was actually right.)
 *
 * This runs *after* whichever provider produced a result (AI or heuristic)
 * and corrects the category using the one concrete signal available: did a
 * real assertion actually run and fail before the timeout, or did the test
 * just hang with no evidence either way? It leaves the provider's own
 * summary/rootCause/suggestedFix text alone — only the category (and an
 * explanatory note) are touched, and only for the bare-timeout shape.
 */
function applyTimeoutCategoryGuard(test, result, hangingAction = null) {
  if (!result) return result;
  const message = stripAnsi(test.error?.message) || '';
  if (!BARE_TIMEOUT_RE.test(message)) return result;
  if (STRONG_EVIDENCE_RULE_IDS.has(result.ruleId)) return result;

  // A timeout is only evidence-free when we genuinely cannot see where it
  // got stuck. When the trace names the exact call still in flight (see
  // ../rca/traceActions.js), that is real, specific evidence — a named
  // locator that can be checked against the DOM snapshot — so the
  // downgrade below no longer applies. The whole point of forcing "unknown"
  // was to refuse to guess with nothing to go on; with the hanging locator
  // in hand there is something to go on, and the provider was shown it.
  if (hangingAction?.selector) {
    return {
      ...result,
      note: [
        result.note,
        `Trace shows the test was still waiting on ${hangingAction.title || hangingAction.method} (${hangingAction.describedParams}) when the timeout fired — this categorisation is based on that, not on a bare timeout alone.`,
      ]
        .filter(Boolean)
        .join(' '),
    };
  }

  // Without a hanging-action trace, errorContext.errorDetails is exactly the
  // content TIMED_OUT_UNSAFE_RULE_IDS above refuses to quote specifics from —
  // it can carry over a stale assertion from earlier in the same worker
  // (observed directly on this suite: its "Test source" frame pointed at a
  // different test's body entirely). Using it here to flip category to
  // "code" would repeat that same mistake one layer up, so a bare timeout
  // with no trace evidence always stays "unknown", regardless of what
  // errorDetails happens to contain.
  //
  // Bare hang, zero trustworthy evidence — don't let a model's read of the
  // page snapshot pass as a confident "code" or "environment" verdict when
  // nothing in the evidence actually distinguishes the two. Honest
  // "unknown" beats a coin flip dressed up as analysis.
  if (result.category === 'unknown') return result;
  return {
    ...result,
    category: 'unknown',
    note: [
      result.note,
      'Category corrected to "unknown": this is a bare timeout with no assertion ever captured — nothing in the evidence distinguishes a stale selector/locator (code) from the app never reaching the expected state (environment). Check the page snapshot manually.',
    ]
      .filter(Boolean)
      .join(' '),
  };
}

module.exports = { runHeuristics, applyTimeoutCategoryGuard };
