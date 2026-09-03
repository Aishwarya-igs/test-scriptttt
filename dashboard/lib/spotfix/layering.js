/**
 * Enforces the project's test architecture against a proposed edit, in code.
 *
 * ./skills.js puts the rules in the prompt. This checks whether the edit
 * actually followed them, because in this pipeline that has never been the
 * same question: a model was observed reading the swallowed-failure warning
 * and proposing the flagged change anyway (see ./swallowedFailures.js), and
 * the result-field guard in ./risk.js had to be hardened twice after a model
 * evaded it. A rule that only exists in the prompt is a suggestion.
 *
 * The violations that matter here are the ones the skill documents mark
 * FORBIDDEN outright — a selector, a wait, or a DOM query appearing in a spec
 * file, or Playwright reaching into a business function. Those get 'high',
 * which means applySpotFix will not write them without an explicit
 * acknowledgement, for the same reason an assertion rewrite doesn't: the
 * rerun would go green and prove nothing about whether the change was
 * acceptable. Page-object-internal style (a locator inlined in a method body
 * rather than declared with its siblings) is real but not structural, so it
 * gets 'low' — visible on the diff, never blocking.
 *
 * Everything here is scoped to what the edit INTRODUCES. Code that already
 * violated a rule before the fix touched it is pre-existing debt, and
 * flagging it would punish a correct fix for the state of the file it landed
 * in.
 */
const fs = require('fs');
const { isSpecFile, isPageObjectFile, isBusinessFunctionFile } = require('../projectConventions');
const {
  extractLocatorExpressions,
  parseLocatorDeclarations,
  describeLocator,
  nameTokens,
  enclosingMethodName,
  relatedLocators,
} = require('./locatorSyntax');

// Raw DOM access that bypasses page objects entirely.
const DOM_QUERY_RE = /\b(?:document\s*\.\s*(?:querySelector(?:All)?|getElementById|getElementsBy\w+)|page\s*\.\s*\$\$?\(|\.\s*evaluate(?:All|Handle)?\s*\()/;
// Any wait, explicit or implicit, that the standards require to live in a page object.
const WAIT_RE = /\b(?:waitForTimeout|waitForSelector|waitForFunction|waitForLoadState|waitForURL|waitForResponse|waitForRequest|waitForEvent)\s*\(|\.\s*waitFor\s*\(/;
// A Playwright import that is not the `{ test, expect }` a spec is allowed.
const PLAYWRIGHT_IMPORT_RE = /import\s+([^;]*?)\s+from\s+['"]@playwright\/test['"]/g;

const normalizeExpr = (raw) => (raw || '').replace(/\s+/g, ' ').trim();

/** Locator expressions present in `newCode` but not already in `oldCode`. */
function introducedLocators(oldCode, newCode) {
  const before = new Set(extractLocatorExpressions(oldCode).map((d) => normalizeExpr(d.raw)));
  return extractLocatorExpressions(newCode).filter((d) => !before.has(normalizeExpr(d.raw)));
}

/** True when `pattern` matches newCode somewhere it did not match oldCode. */
function newlyMatches(pattern, oldCode, newCode) {
  const re = new RegExp(pattern.source, pattern.flags.replace('g', ''));
  if (!re.test(newCode)) return false;
  // Line-level rather than whole-snippet: a model that re-emits an existing
  // offending line alongside its real change should not be blamed for it.
  const oldLines = new Set(oldCode.split('\n').map((l) => l.trim()));
  return newCode
    .split('\n')
    .some((line) => re.test(line) && !oldLines.has(line.trim()));
}

function disallowedPlaywrightImport(oldCode, newCode) {
  const before = new Set([...oldCode.matchAll(PLAYWRIGHT_IMPORT_RE)].map((m) => m[0]));
  for (const match of newCode.matchAll(PLAYWRIGHT_IMPORT_RE)) {
    if (before.has(match[0])) continue;
    const clause = match[1].trim();
    const named = clause.replace(/^\{|\}$/g, '').split(',').map((s) => s.trim().split(/\s+as\s+/)[0]).filter(Boolean);
    const onlyTestExpect = clause.startsWith('{') && named.every((n) => n === 'test' || n === 'expect');
    if (!onlyTestExpect) return clause;
  }
  return null;
}

/**
 * Risk entries (same shape as ./risk.js) for anything this edit does that
 * the project's documented architecture forbids.
 */
function assessLayering(edit) {
  const { file, oldCode, newCode } = edit;
  if (!file) return [];

  const risks = [];
  const locators = introducedLocators(oldCode, newCode);
  const inSpec = isSpecFile(file);
  const inPageObject = isPageObjectFile(file);
  const inBusinessFunction = isBusinessFunctionFile(file);

  if (inSpec) {
    if (locators.length) {
      risks.push({
        id: 'locator-in-spec',
        label: 'Puts a selector in a test file',
        severity: 'high',
        detail: `This adds ${describeLocator(locators[0])} to ${file}. This project's standards require every selector to live in a Page Object and tests to contain none — a spec that owns a selector cannot be reused and breaks in a different place than the page it describes. Move this locator into the Page Object for that page and call a semantic method from the test instead.`,
      });
    }
    if (newlyMatches(WAIT_RE, oldCode, newCode)) {
      risks.push({
        id: 'wait-in-spec',
        label: 'Puts a wait in a test file',
        severity: 'high',
        detail: `This adds a wait to ${file}. Waits and timeouts belong in the Page Object that knows what it is waiting for; a wait in a spec is invisible to every other test that needs the same synchronisation and will be duplicated the next time this breaks.`,
      });
    }
    if (newlyMatches(DOM_QUERY_RE, oldCode, newCode)) {
      risks.push({
        id: 'dom-query-in-spec',
        label: 'Puts a raw DOM query in a test file',
        severity: 'high',
        detail: `This adds a direct DOM query/evaluate to ${file}, bypassing the Page Object layer. DOM access must be behind a semantic Page Object method.`,
      });
    }
    const badImport = disallowedPlaywrightImport(oldCode, newCode);
    if (badImport) {
      risks.push({
        id: 'playwright-import-in-spec',
        label: 'Adds a forbidden Playwright import to a test file',
        severity: 'high',
        detail: `This imports \`${badImport}\` from @playwright/test in ${file}. Spec files may import only { test, expect }.`,
      });
    }
  }

  if (inBusinessFunction) {
    const badImport = disallowedPlaywrightImport(oldCode, newCode);
    if (locators.length || badImport) {
      risks.push({
        id: 'playwright-in-business-function',
        label: 'Uses Playwright directly in a business function',
        severity: 'high',
        detail: `${file} is a business function, which must compose Page Objects rather than drive Playwright itself. ${
          locators.length ? `This adds the locator ${describeLocator(locators[0])}.` : `This adds the import \`${badImport}\`.`
        } The locator and any interaction with it belong in the Page Object.`,
      });
    }
  }

  if (inPageObject) {
    // A locator expression that is not being *declared* is one written inline
    // at its point of use — the "DO not hardcode the locators within the
    // function" rule. Declarations carry a name; inline chains do not.
    // Only a locator carrying a literal value is "hardcoded". This repo's
    // standard idiom inside methods is
    // `this.page.locator(this.someLocator.selector).first()`, which REFERENCES
    // a locator declared at the class top — exactly what the standards ask
    // for. Flagging those was a false positive on the codebase's own correct
    // pattern, which is the fastest way to train someone to ignore the
    // warning that matters.
    const hasLiteral = (d) =>
      (d.steps || []).some(
        (s) => s.value?.type === 'string' || s.value?.type === 'regex' ||
          Object.values(s.options || {}).some((v) => v.type === 'string' || v.type === 'regex')
      );
    const inlined = locators.filter((d) => !d.name && hasLiteral(d));
    if (inlined.length) {
      const alternatives = suggestExistingLocators(edit);
      risks.push({
        id: 'inline-locator-in-method',
        label: 'Hardcodes a locator inside a method',
        severity: 'low',
        detail:
          `This writes ${describeLocator(inlined[0])} directly into a method in ${file}. This project's standards keep every locator ` +
          `declared once with the others at the top of the class and referenced from methods, so the next markup change is a one-line ` +
          `edit in one known place.` +
          (alternatives.length
            ? ` This class already declares locators that look relevant to this method: ${alternatives
                .map((a) => `\`this.${a.name}\` (${a.selector})`)
                .join(', ')}. Check whether one of those is the right target before adding a new one.`
            : ` Consider declaring it alongside the class's other locators instead.`),
      });
    }

    const offSubject = assessSubjectDrift(edit, locators);
    if (offSubject) risks.push(offSubject);

    const duplicate = findDuplicateDeclaration(edit, locators);
    if (duplicate) {
      risks.push({
        id: 'duplicate-locator',
        label: 'Declares a locator this class already has',
        severity: 'low',
        detail: `The locator this adds resolves the same way as \`${duplicate.existing.name}\` (declared at line ${duplicate.existing.line} of ${file}). The standards require each locator to be defined once and reused — a second copy means the next markup change has to be found twice.`,
      });
    }
  }

  return risks;
}

/**
 * Locators the class already declares that look relevant to the method being
 * edited, ranked by how much their names overlap.
 *
 * The motivating case: the model rewrote `isLiveIconVisible()` with a brand
 * new inline locator built from the page title, while the same class already
 * declared `liveTag` and `goLiveButton` — both matching text that was visibly
 * on the captured page. It had the right vocabulary in front of it and
 * invented a new word anyway. Naming the near matches turns a style warning
 * into the specific question a reviewer should ask.
 */
function methodContext(edit) {
  if (!edit.absolutePath || typeof edit.startOffset !== 'number') return null;
  let content;
  try {
    // MUST be normalized the same way validateEdit normalized it: startOffset
    // is an index into \n-space, and these files are CRLF on disk. Slicing the
    // raw bytes by that offset lands one character per preceding line too
    // early — roughly a thousand characters off partway down a page object,
    // which silently attributed the edit to an entirely different method.
    content = fs.readFileSync(edit.absolutePath, 'utf-8').replace(/\r\n/g, '\n');
  } catch {
    return null;
  }
  const methodName = enclosingMethodName(content, edit.startOffset);
  if (!methodName) return null;
  return { content, methodName, related: relatedLocators(content, methodName, { limit: 3 }) };
}

const suggestExistingLocators = (edit) => methodContext(edit)?.related || [];

/**
 * Flags a replacement locator that has drifted off the subject the method
 * exists to establish.
 *
 * The shape, twice observed on the same method: `isLiveIconVisible()` is
 * supposed to confirm the content is LIVE. One proposal pointed it at the
 * page `<title>`; the next pointed it at `videoPlayer`, whose selector
 * (`video, [data-testid="video-player"], …`) matches on every playback page
 * there is. Both resolve. Neither distinguishes live content from a film, so
 * the precondition silently stops meaning anything while the test turns
 * green — the exact outcome a rerun cannot detect.
 *
 * Fires only on a specific, cheap signal: the method name carries a subject,
 * the class declares locators on that subject, and the replacement shares
 * none of it. That combination is what separates "reached for the wrong
 * thing" from "the right locator simply isn't named after the method".
 */
function assessSubjectDrift(edit, introduced) {
  const ctx = methodContext(edit);
  if (!ctx || !ctx.related.length) return null;

  const subject = new Set(nameTokens(ctx.methodName));
  if (!subject.size) return null;

  // What the edit now points at: a referenced locator name (`this.videoPlayer
  // .selector`) or an inline locator's own literal text. Restricted to names
  // the class actually declares as locators, so plumbing like `this.page` and
  // `this.pageUtils` doesn't get reported as the thing being targeted.
  const declared = new Set(parseLocatorDeclarations(ctx.content).map((d) => d.name));
  const removed = new Set([...edit.oldCode.matchAll(/\bthis\.(\w+)\b/g)].map((m) => m[1]));
  const added = [...new Set([...edit.newCode.matchAll(/\bthis\.(\w+)\b/g)].map((m) => m[1]))].filter(
    (name) => declared.has(name) && !removed.has(name)
  );
  if (!added.length && !introduced.length) return null;

  const mentions = [...added, ...introduced.map((d) => describeLocator(d))];
  const onSubject = mentions.some((m) => nameTokens(m).some((t) => subject.has(t)));
  if (onSubject) return null;

  return {
    id: 'locator-off-subject',
    label: `New locator is unrelated to what ${ctx.methodName}() checks`,
    severity: 'low',
    detail:
      `${ctx.methodName}() exists to establish "${[...subject].join(' ')}", but the replacement (${mentions
        .slice(0, 2)
        .join(', ')}) shares nothing with that subject, while this class declares ${ctx.related
        .map((r) => `\`this.${r.name}\``)
        .join(', ')} which do. A locator that is present whether or not the condition holds makes this check pass without testing it — and a rerun cannot tell the difference. Confirm the replacement actually distinguishes the case under test.`,
  };
}

/**
 * A newly declared locator whose resolved target matches one the file already
 * declares. Compares the parsed steps rather than the source text, so
 * `{ selector: '.x' }` and `page.locator('.x')` are recognised as the same
 * element written two ways.
 */
function findDuplicateDeclaration(edit, introduced) {
  const declarations = introduced.filter((d) => d.name);
  if (!declarations.length || !edit.absolutePath) return null;

  let content;
  try {
    content = fs.readFileSync(edit.absolutePath, 'utf-8');
  } catch {
    return null;
  }

  const fingerprint = (d) => JSON.stringify(d.steps);
  const existing = parseLocatorDeclarations(content);

  for (const added of declarations) {
    const key = fingerprint(added);
    const match = existing.find((e) => e.name !== added.name && fingerprint(e) === key);
    if (match) return { added, existing: match };
  }
  return null;
}

module.exports = { assessLayering };
