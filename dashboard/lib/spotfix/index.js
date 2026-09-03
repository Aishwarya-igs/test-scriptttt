/**
 * Spot fix: AI proposes a concrete source edit for a failed test, a human
 * reviews the diff, and only then is it written to disk.
 *
 * Two invariants hold this together:
 *   1. Nothing is generated unless RCA classified the failure as 'code'.
 *      A CDN block or DNS failure has no code fix, and a model asked for one
 *      anyway will confidently invent a selector change (see ../rca/categories.js).
 *   2. Nothing is written without an explicit apply call, and apply
 *      re-validates against the file on disk rather than trusting the
 *      proposal — the file may have changed since it was generated.
 */
const crypto = require('crypto');
const fs = require('fs');
const path = require('path');

const { DATA_DIR } = require('../paths');
const { loadErrorContext } = require('../rca/errorContext');
const { loadDomSnapshot } = require('../rca/domSnapshot');
const { loadHangingAction } = require('../rca/traceActions');
const { probeSelectors } = require('./liveProbe');
const { stripAnsi } = require('../rca/ansi');
const { complete, completeWithProvider, hasAiProvider, aiProviderUnavailableReason } = require('../rca/complete');
const { getConfig } = require('../rca/config');
const { FIXABLE_CATEGORY } = require('../rca/categories');
const {
  resolveEditableFile,
  collectCandidateFiles,
  addErrorLiteralMatches,
  addCalledMethodSources,
  addTestFlowSources,
  normalizeEol,
  applyEol,
} = require('./sourceFiles');
const { buildSpotFixPrompt } = require('./prompt');
const { diffLines } = require('./diff');
const { assessRisks, languageRisk } = require('./risk');
const { assessLayering } = require('./layering');
const { buildReceiverIndex, findUngroundedCall } = require('./locatorIndex');
const { extractLocatorExpressions, toProbeSpec, describeLocator } = require('./locatorSyntax');
const { classifyTextEvidence } = require('./domEvidence');
const { recoverParaphrasedLocatorLines } = require('./locatorRecovery');
const { assessBaselineMatch, describeFingerprint } = require('./fingerprint');
const { loadBaseline } = require('./baselineStore');
const { fingerprintAgainstHtml } = require('./fingerprint');
const { rankCandidates, rankCandidatesByRelevance } = require('./candidates');
const { enclosingMethodName, relatedLocators, parseLocatorDeclarations, nameTokens, candidateToSelectorString } = require('./locatorSyntax');
const { buildEvidence } = require('./evidence');
const { loadFixConventions } = require('./skills');
const { findPriorFailedAttempts, matchesPriorFailedAttempt, normalizeForCompare } = require('./priorAttempts');
const { describeSwallowedFailures, assessSwallowedActionRisk } = require('./swallowedFailures');
const registry = require('./registry');

// Generating code needs a longer leash than summarising an error.
const TIMEOUT_MS = 90000;
const MAX_TOKENS = 3000;
// A spot fix is meant to be a small, reviewable change. More than this and a
// human should be reading the whole file, not approving a diff.
const MAX_EDITS = 5;

// Pre-edit copies of every file a spot fix overwrites, so a revert restores
// exact bytes without depending on git state (the file may well have had
// other uncommitted changes that a `git checkout --` would destroy).
const BACKUP_DIR = path.join(DATA_DIR, 'spotfix-backups');

const sha256 = (text) => crypto.createHash('sha256').update(text, 'utf8').digest('hex');

/** Models often wrap JSON in a markdown fence despite being told not to. */
function extractJson(raw) {
  const fenced = raw.match(/```(?:json)?\s*([\s\S]*?)```/);
  const text = (fenced ? fenced[1] : raw).trim();
  try {
    return JSON.parse(text);
  } catch {
    // Fall back to the outermost brace pair, in case of leading/trailing prose.
    const start = text.indexOf('{');
    const end = text.lastIndexOf('}');
    if (start === -1 || end <= start) {
      throw new Error('Model did not return valid JSON');
    }
    return JSON.parse(text.slice(start, end + 1));
  }
}

/** Every start offset at which `needle` occurs in `haystack`. */
function allOccurrences(haystack, needle) {
  const hits = [];
  let from = 0;
  for (;;) {
    const i = haystack.indexOf(needle, from);
    if (i === -1) return hits;
    hits.push(i);
    from = i + 1; // Overlapping matches still each get their own anchor.
  }
}

const lineOf = (content, offset) => content.slice(0, offset).split('\n').length; // 1-based

const { enclosingTestBlock } = require('./testBlocks');

/**
 * Picks which occurrence of a repeated snippet the edit refers to.
 *
 * Spec files here are highly repetitive — the same assertion line appears in
 * five different tests — so a model naturally returns a snippet that occurs
 * many times, and demanding global uniqueness rejects otherwise-correct fixes.
 * Rather than trusting the model to disambiguate (it would have to count
 * lines), this uses something already known for certain: the line the failure
 * came from, via the test location and its stack frames.
 *
 * Deliberately conservative — if the enclosing test cannot be identified, or
 * holds more than one copy of the snippet, nothing is chosen. Editing the
 * wrong copy of a repeated block is exactly the silent corruption this
 * feature must never produce.
 */
function chooseOccurrence(content, offsets, anchorLines, relativePath) {
  if (offsets.length === 1) return offsets[0];
  if (!anchorLines?.length) {
    throw new Error(
      `The snippet to replace appears ${offsets.length} times in ${relativePath}, and there is no failure location to disambiguate it`
    );
  }

  const lines = content.split('\n');
  const occurrenceLines = offsets.map((offset) => ({ offset, line: lineOf(content, offset) }));

  for (const anchor of anchorLines) {
    const block = enclosingTestBlock(lines, anchor);
    if (!block) continue;
    const inBlock = occurrenceLines.filter((o) => o.line >= block.start && o.line < block.end);
    if (inBlock.length === 1) return inBlock[0].offset;
    if (inBlock.length > 1) {
      throw new Error(
        `The snippet to replace appears ${inBlock.length} times inside the failing test in ${relativePath} — too ambiguous to apply safely`
      );
    }
  }

  throw new Error(
    `The snippet to replace appears ${offsets.length} times in ${relativePath}, none of them inside the failing test`
  );
}

/**
 * Turns one raw model edit into a verified, applicable edit. Throws with a
 * user-facing reason if it cannot be trusted. This is the only place that
 * decides an edit is safe, so it is deliberately strict.
 *
 * The chosen location is pinned as a line span rather than left to a later
 * string replace, which would silently rewrite the first occurrence and not
 * necessarily the one verified here.
 */
function validateEdit(rawEdit, anchorsByFile = new Map()) {
  const { file, reason } = rawEdit || {};

  if (typeof rawEdit?.oldCode !== 'string' || !rawEdit.oldCode.trim()) {
    throw new Error('Edit has an empty "oldCode"');
  }
  if (typeof rawEdit?.newCode !== 'string') {
    throw new Error('Edit has no "newCode"');
  }

  // Compare in \n-space; the file on disk may be CRLF while the model always
  // emits \n. See normalizeEol in ./sourceFiles.js.
  let oldCode = normalizeEol(rawEdit.oldCode);
  let newCode = normalizeEol(rawEdit.newCode);
  if (oldCode === newCode) {
    throw new Error('Edit is a no-op (oldCode and newCode are identical)');
  }

  // Throws if the path is outside tests/ or src/, or not a source file.
  const target = resolveEditableFile(file);

  let offsets = allOccurrences(target.content, oldCode);
  let recovered = null;
  if (offsets.length === 0) {
    // Common, specific failure: a locator declared far from the excerpt shown
    // (outside any anchor window) was only visible to the model as the
    // compact catalog line, and it was copied back as source rather than
    // described from it — see ./locatorRecovery.js for why that produces an
    // otherwise-unrecoverable byte mismatch. Retried once, deterministically,
    // before giving up on the proposal.
    const fix = recoverParaphrasedLocatorLines(target.content, oldCode, newCode);
    if (fix) {
      const retryOffsets = allOccurrences(target.content, fix.oldCode);
      if (retryOffsets.length > 0) {
        offsets = retryOffsets;
        oldCode = fix.oldCode;
        newCode = fix.newCode;
        recovered = fix.corrections;
      }
    }
  }
  if (offsets.length === 0) {
    throw new Error(`The snippet to replace was not found in ${target.relative} (the model may have paraphrased it)`);
  }
  const offset = chooseOccurrence(target.content, offsets, anchorsByFile.get(target.relative), target.relative);

  return {
    file: target.relative,
    absolutePath: target.path,
    oldCode,
    newCode,
    // Present only when recoverParaphrasedLocatorLines actually changed
    // something — surfaced on the diff so a corrected line is never silent.
    ...(recovered ? { recovered } : {}),
    reason: typeof reason === 'string' ? reason : '',
    // The exact character offset this edit was verified at, so apply() rewrites
    // the occurrence that was reviewed rather than the file's first one.
    // A character offset rather than a line span because a model's snippet
    // routinely begins mid-line (it drops the leading indentation), and
    // baseSha256 below pins the content this offset is valid against.
    startOffset: offset,
    startLine: lineOf(target.content, offset), // for display only
    occurrenceCount: offsets.length,
    // Pinned so apply() can detect the file changing between propose and apply.
    baseSha256: sha256(target.content),
    diff: diffLines(oldCode, newCode),
    // Shapes that would make the test pass without fixing anything; shown as
    // warnings on the diff so the reviewer's attention goes to the right place.
    risks: assessRisks({ oldCode, newCode }),
  };
}

function unavailable(reason) {
  return { available: false, reason, edits: [] };
}

/**
 * Turns one model's raw response into a validated candidate: parses the
 * JSON, then verifies + risk-assesses every edit against the real source —
 * the SAME grounding/prior-attempt guards regardless of which model
 * produced it, which is what makes cross-model comparison meaningful (two
 * models "agreeing" only counts if both were held to the same bar).
 *
 * Deliberately does not catch a JSON-parse failure itself — for the primary
 * candidate that should surface as a hard error same as before; for an
 * escalation candidate, the caller wraps this in its own try/catch and
 * treats it as "that model had nothing usable," not a crash.
 */
/**
 * Locators the edit introduces whose text can be checked against the page
 * captured at failure. Returns a rejection reason for the provable mistake
 * (text that exists only in `<head>`) and a warning for the merely suspicious
 * (text nowhere in the captured page).
 *
 * See ./domEvidence.js for the fix that motivated this — a `<title>` string
 * turned into a content locator, which passed its verification rerun.
 */
function checkDomEvidence(edit, domSnapshot) {
  if (!domSnapshot) return { reject: null, risks: [] };
  const before = new Set(extractLocatorExpressions(edit.oldCode).map((d) => (d.raw || '').replace(/\s+/g, ' ')));
  const risks = [];

  for (const descriptor of extractLocatorExpressions(edit.newCode)) {
    if (before.has((descriptor.raw || '').replace(/\s+/g, ' '))) continue;
    const evidence = classifyTextEvidence(descriptor, domSnapshot);

    if (evidence.verdict === 'head-only') {
      return {
        reject:
          `Edit to ${edit.file} builds a locator from ${evidence.describe}, which appears in the captured page only inside <head> ` +
          `(the <title>/<meta> block). That text is never rendered, so no locator can match it — and page metadata says nothing about ` +
          `the state the test is checking. Use text or an attribute that appears in the page body.`,
        risks: [],
      };
    }

    if (evidence.verdict === 'absent') {
      risks.push({
        id: 'locator-text-not-in-captured-dom',
        label: 'Locator text does not appear on the page captured at failure',
        severity: 'low',
        detail:
          `${describeLocator(descriptor)} looks for ${evidence.describe}, which is nowhere in the DOM captured when this test failed. ` +
          `That page is the closest evidence there is of what the app actually rendered in the failing session. The element may appear ` +
          `only after a later step, but if it does not, this locator will never match.`,
      });
    }
  }
  return { reject: null, risks };
}

/**
 * High-severity counterpart to evidence.js's ambiguityCheck. That check is
 * read-only — it can only tell a human, after the fact, that a reused
 * locator is ambiguous. Proven insufficient by a real incident: told twice,
 * in two separate generations, that `this.liveTag` matches 2 elements and
 * must not be reused bare, the model reused it bare both times anyway.
 *
 * A 'high' severity risk here does two things a warning cannot:
 *   1. Blocks Apply until explicitly acknowledged (see the highRisk gate in
 *      applySpotFix), the same enforcement assertion-flipped/-removed get.
 *   2. Triggers the SAME escalation this file already runs for any other
 *      high-severity risk — a second, independent model gets asked the same
 *      question. A model that ignores an instruction in isolation sometimes
 *      does not reproduce the exact same mistake when a different model is
 *      asked instead, which a passive warning could never obtain.
 */
function assessAmbiguousLocatorReuse(edit, verifiedRelated) {
  if (!verifiedRelated) return null;
  const referencedBefore = new Set([...edit.oldCode.matchAll(/\bthis\.(\w+)\b/g)].map((m) => m[1]));
  const referencedNow = [...new Set([...edit.newCode.matchAll(/\bthis\.(\w+)\b/g)].map((m) => m[1]))].filter(
    (name) => !referencedBefore.has(name)
  );
  for (const name of referencedNow) {
    const result = verifiedRelated[name];
    if (result && typeof result.count === 'number' && result.count > 1) {
      return {
        id: 'ambiguous-locator-reuse',
        label: `Reuses this.${name}, which resolves to ${result.count} elements on the page captured at failure`,
        severity: 'high',
        detail:
          `this.${name} matches ${result.count} elements on the page this test actually failed on. Reusing it with no added ` +
          `narrowing means whichever element a position-based .first()/[0] happens to land on is the one the test now depends ` +
          `on — not necessarily the one the check is meant to establish. A rerun passing does not settle this: it would pass ` +
          `exactly when the arbitrary pick happens to be right, and would keep silently checking the wrong element whenever it isn't.`,
      };
    }
  }
  return null;
}

function buildCandidate(raw, model, { anchorsByFile, receiverIndex, priorAttempts, swallowed, domSnapshot, verifiedRelated }) {
  const parsed = extractJson(raw);

  const rawEdits = Array.isArray(parsed.edits) ? parsed.edits : [];
  if (!rawEdits.length) {
    return {
      model,
      explanation: '',
      confidence: 'low',
      edits: [],
      rejected: [],
      unavailableReason: parsed.explanation || 'The model did not find a code change that would fix this failure.',
    };
  }
  if (rawEdits.length > MAX_EDITS) {
    return {
      model,
      explanation: '',
      confidence: 'low',
      edits: [],
      rejected: [],
      unavailableReason: `The model proposed ${rawEdits.length} edits, which is too broad for a spot fix — this needs manual review.`,
    };
  }

  const explanation = typeof parsed.explanation === 'string' ? parsed.explanation : '';
  // Independent of the code-shape checks in assessRisks: catches the model
  // hedging on the very thing it changed, in either the proposal-level
  // explanation or this specific edit's own reason. See risk.js.
  const proposalHedge = languageRisk(explanation);

  const edits = [];
  const rejected = [];
  for (const rawEdit of rawEdits) {
    try {
      const edit = validateEdit(rawEdit, anchorsByFile);
      // Hard rejection, not a risk warning: a call on a known page-object
      // instance to a method that class doesn't declare cannot be real,
      // regardless of how plausible the name sounds or which model wrote
      // it. This is what keeps behavior consistent across different
      // models — every one of them is checked against the same source.
      const ungrounded = findUngroundedCall(edit.oldCode, edit.newCode, receiverIndex);
      if (ungrounded) {
        rejected.push(
          `Edit to ${edit.file} calls ${ungrounded.receiver}.${ungrounded.method}(), which ${ungrounded.className} does not declare — likely a fabricated method name.`
        );
        continue;
      }
      // A visible warning, not a hard rejection: this exact change was
      // already applied to this exact test, actually rerun, and actually
      // still failed — real evidence, but not necessarily proof the EDIT
      // itself was wrong. A rerun's failure can come from something
      // upstream/unrelated to the edit entirely (observed for real: a spot
      // fix to OTTDetailsPage.ts for IW3-T2057 was correct but its
      // verification rerun failed on an unrelated ambiguous locator in
      // clickMyWatchlistTab — a completely different step — and the fix was
      // auto-reverted despite being right). Once whatever actually blocked
      // verification is fixed, the identical edit can be correct on a
      // second try, so this can no longer permanently lock a test out of
      // ever proposing the same fix again — it surfaces the history and
      // lets a human weigh it instead.
      const repeat = matchesPriorFailedAttempt(edit, priorAttempts);
      if (repeat) {
        edit.risks = [
          ...edit.risks,
          {
            id: 'repeats-disproven-attempt',
            label: 'This exact change was already tried and failed verification',
            severity: 'low',
            detail: `Applied and rerun against this exact test in run ${repeat.runId}, which still failed. That may mean this edit is wrong — or that something else was blocking verification at the time, unrelated to this change. Worth checking what the rerun actually failed on before applying again.`,
          },
        ];
      }
      // The counterpart to the prompt's own warning about this shape,
      // enforced in code because a model was observed acknowledging that
      // warning and proposing the flagged change anyway — see
      // assessSwallowedActionRisk in ./swallowedFailures.js.
      // Hard rejection, like the ungrounded-call check above: a locator built
      // from <head> metadata cannot match anything, and that is decidable from
      // the captured page rather than a matter of opinion.
      const domEvidence = checkDomEvidence(edit, domSnapshot);
      if (domEvidence.reject) {
        rejected.push(domEvidence.reject);
        continue;
      }
      edit.risks = [...edit.risks, ...domEvidence.risks];
      const ambiguousReuse = assessAmbiguousLocatorReuse(edit, verifiedRelated);
      if (ambiguousReuse) edit.risks = [...edit.risks, ambiguousReuse];
      const unaddressedAction = assessSwallowedActionRisk(edit, swallowed);
      if (unaddressedAction) edit.risks = [...edit.risks, unaddressedAction];
      // The project's documented architecture, checked against the edit rather
      // than only stated in the prompt. Same reasoning as the guard above: a
      // model that was shown the rules still has to be verified against them.
      // See ./layering.js and ./skills.js.
      edit.risks = [...edit.risks, ...assessLayering(edit)];
      const hedge = proposalHedge || languageRisk(edit.reason);
      if (hedge) edit.risks = [...edit.risks, hedge];
      edits.push(edit);
    } catch (err) {
      rejected.push(err.message);
    }
  }

  return {
    model,
    explanation,
    // Trust the model's self-reported confidence unless its own words
    // contradict it — "medium confidence" alongside "might not be accurate"
    // is not actually medium confidence.
    confidence: proposalHedge ? 'low' : ['high', 'medium', 'low'].includes(parsed.confidence) ? parsed.confidence : 'low',
    edits,
    rejected,
    unavailableReason: edits.length ? null : `No proposed edit could be verified against the source. ${rejected.join('; ')}`,
  };
}

/** Order-independent identity for a candidate's edit set — same file + same content, whitespace aside. */
function editSetSignature(edits) {
  return edits
    .map((e) => `${e.file}::${normalizeForCompare(e.newCode)}`)
    .sort()
    .join('||');
}

function finalizeProposal(candidate, consensus = null) {
  return {
    available: true,
    proposalId: crypto.randomUUID(),
    explanation: candidate.explanation,
    confidence: candidate.confidence,
    model: candidate.model,
    provider: getConfig().provider,
    edits: candidate.edits,
    // Surfaced so a partially-verified proposal is never silently narrowed.
    rejected: candidate.rejected,
    generatedAt: new Date().toISOString(),
    ...(consensus ? { consensus } : {}),
  };
}

/**
 * Every locator an edit touches, as probe specs.
 *
 * Used to be a regex for `selector:` string values, which had two failures
 * that pointed in opposite directions. It could not see a
 * `page.getByRole(...)` locator at all — the shape this project's own
 * standards mandate — so those went unverified. And for a `{ selector, text }`
 * element it probed the `selector`, even though the resolver these are passed
 * to prefers `testId`, then `role`+`text`, then `text`, and only falls back to
 * `selector` (see getLocator in src/utils/page-utils.ts). A locator that
 * worked perfectly at runtime could therefore be reported as matching nothing
 * live. ./locatorSyntax.js resolves both correctly.
 *
 * Locators built from a variable or an interpolated template are skipped
 * rather than guessed at: their value isn't knowable statically, and a probe
 * of the wrong string would produce a confident, wrong "matches nothing".
 */
function extractProbeTargets(code) {
  const targets = [];
  for (const descriptor of extractLocatorExpressions(code)) {
    const spec = toProbeSpec(descriptor);
    if (spec) targets.push(spec);
  }
  return targets;
}

/**
 * Runtime verification pass — the actual "dynamically access it at runtime"
 * step: for every edit that changes a `selector:` value, checks the
 * proposed replacement (and, for comparison, the value it's replacing)
 * against the live app right now via liveProbe.js, instead of trusting the
 * model's text-only guess.
 *
 * Additive and best-effort only: never removes or downgrades anything the
 * model already said. A confirmed 0-match only appends a low-severity risk
 * (this check runs unauthenticated, so a mismatch isn't proof of a bad fix
 * on its own) — same "warn, don't block" posture as every rule in risk.js.
 * The raw check results are attached to the edit either way so a human
 * reviewing the diff can see exactly what was verified.
 */
async function attachLiveProbe(proposal, domSnapshot) {
  if (!proposal.available || !domSnapshot?.url || !proposal.edits.length) return proposal;

  const perEdit = proposal.edits
    .map((edit) => ({
      edit,
      oldSelectors: extractProbeTargets(edit.oldCode),
      newSelectors: extractProbeTargets(edit.newCode),
    }))
    .filter((e) => e.newSelectors.length);
  if (!perEdit.length) return proposal;

  // Deduplicated by label: two edits proposing the same locator are one check.
  const byLabel = new Map();
  for (const { oldSelectors, newSelectors } of perEdit) {
    for (const spec of [...oldSelectors, ...newSelectors]) {
      if (!byLabel.has(spec.label)) byLabel.set(spec.label, spec);
    }
  }
  const probe = await probeSelectors(domSnapshot.url, [...byLabel.values()]);
  if (!probe) return proposal; // Not checked (no browser, nav failed, ...) — never treated as a negative result.

  const byOutcome = new Map(probe.results.map((r) => [r.selector, r]));

  for (const { edit, oldSelectors, newSelectors } of perEdit) {
    const oldChecks = oldSelectors.map((s) => byOutcome.get(s.label)).filter(Boolean);
    const newChecks = newSelectors.map((s) => byOutcome.get(s.label)).filter(Boolean);
    if (!oldChecks.length && !newChecks.length) continue;

    edit.liveProbe = { landedUrl: probe.landedUrl, checkedAt: probe.checkedAt, old: oldChecks, new: newChecks };

    const zeroMatch = newChecks.find((c) => c.count === 0);
    if (zeroMatch) {
      edit.risks = [
        ...edit.risks,
        {
          id: 'live-selector-no-match',
          label: 'Proposed selector matches nothing live right now',
          severity: 'low',
          detail: `Checked against the page live at ${probe.landedUrl}: "${zeroMatch.selector}" currently matches 0 elements. This check runs unauthenticated, so app state may genuinely differ from the failing test's session — not conclusive on its own, but worth a second look before applying.`,
        },
      ];
    }

  }
  return proposal;
}

/**
 * Runs the live probe, then records the full audit trail of what was and was
 * not checked (see ./evidence.js). Must come after the probe: whether a
 * locator resolves against the real page is one of the strongest pieces of
 * evidence there is, and the ledger would understate the proposal without it.
 */
/**
 * Compares each edit's replacement locator against the element the locator it
 * replaces matched on the last page this test passed with.
 *
 * This is the check that distinguishes "the selector changed but it still
 * finds the right thing" from "it now finds something else entirely" —
 * a distinction that is invisible when the only page available is the broken
 * one. See ./fingerprint.js and ./baselineStore.js.
 */
async function attachBaselineMatch(proposal, domSnapshot, baseline) {
  if (!proposal.available || !baseline?.html || !domSnapshot?.html) return proposal;

  const pairs = [];
  for (const [i, edit] of proposal.edits.entries()) {
    const oldSpec = extractProbeTargets(edit.oldCode)[0];
    const newSpec = extractProbeTargets(edit.newCode)[0];
    if (oldSpec && newSpec) pairs.push({ key: String(i), editIndex: i, oldSpec, newSpec });
  }
  if (!pairs.length) return proposal;

  const results = await assessBaselineMatch(pairs, { baselineHtml: baseline.html, failingHtml: domSnapshot.html });
  if (!results) return proposal;

  for (const result of results) {
    const edit = proposal.edits[result.editIndex];
    edit.baselineMatch = {
      score: Number(result.score.toFixed(2)),
      matched: result.matched,
      differed: result.differed,
      was: describeFingerprint(result.was),
      now: describeFingerprint(result.now),
      capturedAt: baseline.capturedAt || null,
    };

    // 0.5 is the point below which the two descriptions stop overlapping on
    // anything durable — role, accessible name, text — and agree only on
    // incidentals like tag or position. Deliberately a warning rather than a
    // rejection: a genuine redesign can legitimately change what an element
    // is, and only a human can say whether that is the case here.
    if (result.score < 0.5) {
      edit.risks = [
        ...edit.risks,
        {
          id: 'baseline-element-mismatch',
          label: 'Replacement finds a different element than the one this test used to pass against',
          severity: 'low',
          detail:
            `When this test last passed, that locator matched ${describeFingerprint(result.was)}. On the failing page the ` +
            `proposed replacement matches ${describeFingerprint(result.now)} — these agree only on ${
              result.matched.join(', ') || 'nothing'
            } and differ on ${result.differed.join(', ')}. If the element genuinely changed this may be right, but a ` +
            `replacement that points somewhere else will make the check pass while testing something different.`,
        },
      ];
    }
  }
  return proposal;
}

/**
 * Ranked, verified replacement elements for the locators this failure
 * involves — computed BEFORE the model is asked, so it can choose from real
 * options instead of searching a page dump. See ./candidates.js.
 *
 * The locators worth ranking are the ones the failing method is about, using
 * the same relevance judgement the prompt and the layering guard already
 * share. Each is fingerprinted on the last passing page, then matched against
 * the failing one. Entirely best-effort: no baseline, no browser, or an
 * unresolvable locator all just mean no candidate list, never a failure.
 *
 * Falls back to relevance ranking (no baseline required — see
 * rankCandidatesByRelevance in ./candidates.js) whenever the baseline path
 * yields nothing: no baseline recorded yet, or nothing in it resolved. A real
 * incident is why this fallback exists — with no baseline, this returned
 * null every time, the model was left choosing only from the class's
 * already-declared (and already wrong/ambiguous) locators, and kept reusing
 * the same broken one because nothing better was ever offered.
 */
async function computeCandidateSets(files, domSnapshot, baseline) {
  if (!domSnapshot?.html) return null;

  let baselineSets = null;
  const targets = [];
  for (const file of files) {
    const anchors = [...(file.lines || [])].filter(Boolean);
    if (!anchors.length) continue;
    const declByName = new Map(parseLocatorDeclarations(file.content).map((d) => [d.name, d]));
    const seen = new Set();
    for (const line of anchors) {
      const offset = file.content.split('\n').slice(0, line).join('\n').length;
      const method = enclosingMethodName(file.content, offset);
      if (!method || seen.has(method)) continue;
      seen.add(method);
      for (const related of relatedLocators(file.content, method, { limit: 2 })) {
        const declaration = declByName.get(related.name);
        const spec = declaration && toProbeSpec(declaration);
        if (spec && !targets.some((t) => t.name === related.name)) {
          targets.push({ name: related.name, description: `used by ${method}()`, steps: spec.steps, method });
        }
      }
    }
  }

  if (targets.length && baseline?.html) {
    // What each target matched back when the test passed — the thing
    // candidates are ranked against.
    const resolved = await fingerprintAgainstHtml(
      baseline.html,
      targets.map((t) => ({ key: t.name, steps: t.steps }))
    );
    if (resolved) {
      const withFingerprints = targets
        // A baseline fingerprint is only ground truth if the locator resolved
        // UNIQUELY on the passing page. When it matched several, the recorded
        // element is whichever `.first()` happened to land on — a positional
        // accident, not the element the check is about. Treating that as "what
        // this locator is supposed to find" is actively worse than having no
        // baseline: it ranks the accident at similarity 1.0 and every other
        // option below it. Observed exactly that — an ambiguous `liveTag`
        // recorded the neighbouring "Go Live" button as its identity, and the
        // repair then confidently proposed that button as the live-status
        // indicator. Ambiguous targets are dropped so ranking falls through to
        // relevance, which reasons from what the METHOD is for instead.
        .filter((t) => resolved[t.name]?.element && resolved[t.name].count === 1)
        // `method` must survive this projection — locateFixTarget matches a
        // candidate set to the method being edited by it, so dropping it here
        // silently disables both the deterministic and the choose-from-list
        // paths, with the proposal quietly falling back to free-form.
        .map((t) => ({ name: t.name, description: t.description, method: t.method, fingerprint: resolved[t.name].element }));
      if (withFingerprints.length) {
        const ranked = await rankCandidates(domSnapshot.html, withFingerprints);
        if (ranked) baselineSets = ranked;
      }
    }
  }

  // Relevance sets are computed ALONGSIDE the baseline ones, not only when
  // the baseline path fails. A baseline set is keyed to one declared locator
  // and is unusable for repairing a different one — so when the locator a
  // failing line actually references has no trustworthy baseline (it never
  // resolved uniquely on the passing page), there would otherwise be nothing
  // applicable left, and the whole proposal would fall back to free-form
  // despite a perfectly good relevance ranking being available. Keyed by
  // method rather than by locator name, so it answers "what is this method
  // trying to establish?" — which is exactly the question left when a
  // locator's own history is untrustworthy.
  const methodTargets = [];
  const seenMethods = new Set();
  for (const file of files) {
    for (const line of [...(file.lines || [])].filter(Boolean)) {
      const offset = file.content.split('\n').slice(0, line).join('\n').length;
      const method = enclosingMethodName(file.content, offset);
      if (!method || seenMethods.has(method)) continue;
      const tokens = nameTokens(method);
      if (!tokens.length) continue;
      seenMethods.add(method);
      methodTargets.push({ name: method, description: `what ${method}() is checking for`, tokens, method });
    }
  }
  const relevanceSets = methodTargets.length ? await rankCandidatesByRelevance(domSnapshot.html, methodTargets) : null;

  const merged = [...(baselineSets || []), ...(relevanceSets || [])];
  return merged.length ? merged : null;
}

/**
 * Whether each "already declared, on-subject" locator relatedLocatorsBlock is
 * about to recommend actually resolves on the page the test just failed on.
 *
 * relatedLocatorsBlock's judgement of "on subject" comes purely from NAME
 * overlap with the failing method (`isLiveIconVisible` <-> `liveTag`) — it has
 * never checked whether the locator still matches anything. That gap is
 * exactly how `this.liveTag` (a locator the audit had already proven matches
 * zero elements on any page, via a `\b` the Playwright text engine ignores)
 * reached a model as an implicit recommendation and came back as the "fix".
 * computeCandidateSets above only verifies fresh, generated candidates
 * against a passing baseline; it says nothing about names pulled from this
 * class's own declarations, and a missing or corrupt baseline silently
 * disabled it entirely without disabling the unverified suggestions.
 *
 * This resolves each related declaration against the real DOM captured at
 * failure — no baseline required, since domSnapshot always exists whenever a
 * spot fix can run at all — so relatedLocatorsBlock can label a dead name as
 * dead instead of implicitly vouching for it. Best-effort: no browser or an
 * unresolvable locator just means "not checked", not a negative result.
 */
async function verifyRelatedLocators(files, domSnapshot) {
  if (!domSnapshot?.html) return null;

  const specs = [];
  const seen = new Set();
  for (const file of files) {
    const anchors = [...(file.lines || [])].filter(Boolean);
    if (!anchors.length) continue;
    const declByName = new Map(parseLocatorDeclarations(file.content).map((d) => [d.name, d]));
    const seenMethods = new Set();
    for (const line of anchors) {
      const offset = file.content.split('\n').slice(0, line).join('\n').length;
      const method = enclosingMethodName(file.content, offset);
      if (!method || seenMethods.has(method)) continue;
      seenMethods.add(method);
      for (const related of relatedLocators(file.content, method)) {
        if (seen.has(related.name)) continue;
        const declaration = declByName.get(related.name);
        const spec = declaration && toProbeSpec(declaration);
        if (spec) {
          seen.add(related.name);
          specs.push({ key: related.name, steps: spec.steps });
        }
      }
    }
  }
  if (!specs.length) return null;
  return fingerprintAgainstHtml(domSnapshot.html, specs);
}

/**
 * Attempts to build a fix WITHOUT asking any model — the one case where that
 * is actually safe, not merely convenient.
 *
 * Every failure this pipeline has produced, traced end to end, was in HOW a
 * model chose among options it was correctly and verifiably given — never in
 * whether the right option existed or could be found. `this.liveTag` was
 * offered a real, verified, unambiguous alternative (`getByText('Live',
 * { exact: true })`, similarity 1.0, confirmed to match exactly one element)
 * three separate times and reached for the wrong one anyway. Asking a model
 * to transcribe an answer that has already been deterministically found and
 * verified adds a real, repeatedly observed source of error for zero
 * benefit — so when the evidence narrows to one unambiguous winner, this
 * writes the edit directly instead.
 *
 * This does NOT lower the bar. It builds a "raw model response" JSON string
 * of the exact shape buildCandidate() already expects, so the result still
 * runs through every existing check unchanged — byte-exact anchor matching,
 * grounding, evidence, risk. Skipping the model removes a source of error;
 * it does not remove a source of verification.
 *
 * Deliberately narrow, on purpose:
 *   1. Exactly one candidate set, whose top candidate is a genuine exact
 *      match (score === 1) with no other candidate tied at that score.
 *   2. The anchor line is a recognisable, single-statement locator
 *      construction built from an INLINE literal (`const x =
 *      this.getRoleLocator({ text: 'Live', ... })`, optionally chained with
 *      .first()/.last()).
 *   3. That line does not reference a named locator this class declares.
 *
 * Condition 3 is what keeps this from fighting the project's own standards.
 * The repo's rule (see ./skills.js) is that locators are declared once at
 * the top of the class and referenced from methods. Rewriting
 * `this.page.locator(this.liveTag.selector)` into an inline
 * `this.page.getByText(...)` would resolve correctly and still be a
 * regression: it converts properly-declared code into inline code and leaves
 * the real declaration stale, so the next markup change has to be found in
 * two places instead of one. Where a named declaration is involved, the
 * correct repair is to that declaration — a judgement about intent (and, for
 * a PageElement-dialect class, a dialect translation) that this must not
 * guess at, so it falls through to the model instead. Replacing an inline
 * literal with a better inline literal introduces no such regression, which
 * is the only case allowed through here.
 *
 * Anything less clear-cut — multiple plausible targets, a tie, an anchor
 * line that doesn't match this shape — returns null and falls through to the
 * model, where a human reviews the result regardless. That is the right
 * place for a genuine judgement call; this only replaces the mechanical part.
 */
// A single-statement locator construction, in either shape this repo writes:
// `this.getRoleLocator({...})` and `this.page.locator(...)`/`this.page.getByX(...)`,
// with any trailing chain. Kept deliberately broad here because the decision
// about WHICH of the two repairs applies (declaration vs inline) is made in
// locateFixTarget, not by this pattern.
const DETERMINISTIC_LINE_RE = /^(\s*)(const\s+\w+\s*=\s*)(this\.(?:getRoleLocator|page)\b.*);\s*$/;
// Positional narrowing at the end of a chain — preserved verbatim across a
// rewrite. Dropping a `.first()` silently turns a single-element expectation
// into a strict-mode violation the moment the new selector matches two.
const CHAIN_SUFFIX_RE = /((?:\.(?:first|last)\(\)|\.nth\(\s*\d+\s*\))+)$/;

// Hard cap so a file whose braces don't balance (a parse this does not
// attempt to be perfect about) can never walk to the end of a 2000-line
// page object.
const MAX_METHOD_BODY_LINES = 60;

/**
 * 1-based line numbers from `startLine` to the end of the block it opens,
 * by brace depth. When `startLine` opens no block (it is already a statement
 * inside one), just that line — the caller is looking at a specific line, not
 * a body.
 */
function methodBodyLineNumbers(lines, startLine) {
  const out = [];
  let depth = 0;
  let opened = false;
  for (let i = startLine - 1; i < lines.length && out.length < MAX_METHOD_BODY_LINES; i += 1) {
    const line = lines[i];
    out.push(i + 1);
    for (const ch of line) {
      if (ch === '{') {
        depth += 1;
        opened = true;
      } else if (ch === '}') depth -= 1;
    }
    if (opened && depth <= 0) break;
    // The start line opened nothing, so there is no body to walk.
    if (!opened && i === startLine - 1) break;
  }
  return out;
}

/**
 * Where a locator repair for this failure would go, and which verified
 * candidate list applies there — without deciding WHICH candidate to use.
 *
 * Separated from choosing so the deterministic path and the model-choice path
 * (see chooseCandidateWithModel) edit exactly the same place in exactly the
 * same way, and only differ in who picks. Two target shapes:
 *
 *   'declaration' — the failing line uses a locator the class declares
 *     (`this.page.locator(this.liveTag.selector)`). The repair belongs in that
 *     DECLARATION, which is where this project's standards keep locators and
 *     where 213 of its 254 locator lines point. Rewriting the method line
 *     instead would inline a locator (against the standard) and leave the
 *     declaration stale, so the next markup change has to be fixed twice.
 *
 *   'inline' — the failing line builds a locator from a literal
 *     (`this.getRoleLocator({ text: 'Live', role: 'button' })`). There is no
 *     declaration to repair, so the line itself is the right target.
 */
function locateFixTarget(files, candidateSets) {
  if (!candidateSets?.length) return null;

  for (const file of files) {
    const declarations = parseLocatorDeclarations(file.content);
    const declByName = new Map(declarations.map((d) => [d.name, d]));
    const lines = file.content.split('\n');
    for (const anchor of [...(file.lines || [])].filter(Boolean)) {
      // Match the candidate set to the method actually being edited, rather
      // than requiring exactly one set to exist anywhere. Requiring one was
      // brittle in a way that silently disabled this: correctly resolving
      // business-function anchors added a second, unrelated set and the whole
      // deterministic path switched off, with no signal that it had.
      const offset = lines.slice(0, anchor).join('\n').length;
      const anchorMethod = enclosingMethodName(file.content, offset);
      if (!anchorMethod) continue;
      const setsHere = candidateSets.filter((s) => s.method === anchorMethod && s.candidates?.length);
      if (!setsHere.length) continue;
      // A baseline set describes ONE declared locator's recorded identity, so
      // it may only be applied to that same locator. Matching on method alone
      // paired `goLiveButton`'s candidates with `liveTag`'s declaration and
      // proposed the neighbouring button as the live indicator — right
      // machinery, wrong subject.
      const relevanceSet = setsHere.find((s) => s.kind === 'relevance');

      // An anchor is usually the METHOD SIGNATURE, not the locator line — for
      // a failure that surfaced as an assertion in the spec, the page-object
      // frame recorded here is where the method is declared. Scan the
      // method's body, bounded by its own braces so a match can never be
      // picked up from the next method along.
      for (const line of methodBodyLineNumbers(lines, anchor)) {
        const raw = lines[line - 1];
        if (raw === undefined) continue;
        if (!/\bthis\./.test(raw)) continue;

        // Prefer repairing a referenced declaration over the method line.
        const referenced = [...raw.matchAll(/\bthis\.(\w+)\b/g)]
          .map((r) => declByName.get(r[1]))
          .find(Boolean);
        if (referenced && referenced.line) {
          const set = setsHere.find((s) => s.kind === 'baseline' && s.name === referenced.name) || relevanceSet;
          const declRaw = lines[referenced.line - 1];
          if (set && declRaw !== undefined && referenced.raw && declRaw.includes(referenced.raw)) {
            return { file, set, kind: 'declaration', line: referenced.line, raw: declRaw, declaration: referenced, usedAtLine: line };
          }
          // The line depends on a declared locator: repairing it means
          // repairing that declaration. Rewriting the line inline instead
          // would inline a locator against this project's standards AND leave
          // the declaration stale, so this line is simply not a target.
          continue;
        }

        const m = raw.match(DETERMINISTIC_LINE_RE);
        if (m && relevanceSet) return { file, set: relevanceSet, kind: 'inline', line, raw, match: m };
      }
    }
  }
  return null;
}

/**
 * The concrete edit that puts `candidate` at `target`, or null when it cannot
 * be expressed faithfully.
 *
 * For a declaration this rewrites the whole PageElement literal to a single
 * `{ selector: '...' }`. Replacing rather than merging is deliberate: the
 * resolver precedence in these classes is testId > role+text > text >
 * selector, so leaving a stale `role`/`text`/`testId` alongside a corrected
 * `selector` would leave the OLD fields winning and the repair silently
 * inert.
 */
function renderCandidateEdit(target, candidate) {
  if (!target || !candidate) return null;

  // `noop` is reported distinctly from "cannot express". They look the same
  // (no edit produced) and mean opposite things: one says the code ALREADY
  // uses the best verified element — strong evidence the locator is not what
  // is broken — while the other says this candidate could not be written
  // here. Collapsing them sent an already-correct locator down the free-form
  // path, where a model duly invented a replacement and swapped a correct
  // locator for the wrong element.
  if (target.kind === 'inline') {
    const [, indent, decl, expression] = target.match;
    const suffix = expression.match(CHAIN_SUFFIX_RE)?.[1] || '';
    const newCode = `${indent}${decl}this.page.${candidate.selector}${suffix};`;
    if (newCode.trim() === target.raw.trim()) return { noop: true };
    return { file: target.file.relative, oldCode: target.raw, newCode, selectorString: null };
  }

  const selectorString = candidateToSelectorString(candidate.selector);
  if (!selectorString) return null;
  // Single quotes are the surrounding literal's delimiter, so any in the
  // selector must be escaped or the emitted line will not parse.
  const literal = `{ selector: '${selectorString.replace(/\\/g, '\\\\').replace(/'/g, "\\'")}' }`;
  const newCode = target.raw.replace(target.declaration.raw, literal);
  if (newCode === target.raw) return { noop: true };
  return { file: target.file.relative, oldCode: target.raw, newCode, selectorString };
}

/**
 * Re-resolves a rendered edit's locator against the page captured at failure
 * and requires exactly one match.
 *
 * The candidate itself was verified as a Playwright BUILDER; a declaration
 * edit ships it as an engine STRING instead (see candidateToSelectorString),
 * and a translation is a claim about behaviour, not a proof. This is the
 * proof. Returns true only on a confirmed single match — null/undefined
 * results (no browser, unparseable) are treated as unverified and rejected,
 * because the entire point of this path is that nothing unverified reaches
 * the file.
 */
async function verifyRenderedEdit(rendered, domSnapshot) {
  if (!rendered?.selectorString) return true; // inline: builder already verified as-is
  if (!domSnapshot?.html) return false;
  const resolved = await fingerprintAgainstHtml(domSnapshot.html, [
    { key: 'translated', steps: [{ kind: 'css', value: rendered.selectorString }] },
  ]);
  return resolved?.translated?.count === 1;
}

async function tryDeterministicFix(files, candidateSets, domSnapshot) {
  const target = locateFixTarget(files, candidateSets);
  if (!target) return null;
  const [best, second] = target.set.candidates;
  // Only when the evidence leaves nothing to judge. Anything less clear-cut
  // is a judgement call, which is what the model is actually good at.
  if (!best || best.score !== 1 || (second && second.score === best.score)) return null;

  const rendered = renderCandidateEdit(target, best);
  // The code already uses the best element the failing page has to offer, so
  // there is no locator repair to make — and saying so is a real finding, not
  // an absence of one. Reported rather than swallowed so the caller can stop
  // instead of asking a model to invent a change to something already right.
  if (rendered?.noop) return { alreadyOptimal: { description: best.description, where: target.kind, line: target.line } };
  if (!rendered || !(await verifyRenderedEdit(rendered, domSnapshot))) return null;

  const where =
    target.kind === 'declaration'
      ? `the declaration of \`this.${target.declaration.name}\` (used on line ${target.usedAtLine})`
      : `the locator built on line ${target.line}`;
  return JSON.stringify({
    explanation:
      `No model was asked to write this edit. "${best.description}" was found on the failing page itself, ` +
      `confirmed to match exactly one element (similarity ${best.score}), and applied to ${where} in ${target.file.relative}.`,
    confidence: 'high',
    edits: [
      {
        file: rendered.file,
        oldCode: rendered.oldCode,
        newCode: rendered.newCode,
        reason: `Verified candidate: ${best.description}, similarity ${best.score}.`,
      },
    ],
  });
}

/**
 * Asks the model to CHOOSE from the verified candidates instead of writing a
 * diff — and builds the edit itself from whatever it picks.
 *
 * The free-form task ("emit oldCode/newCode byte-exact") gives a model an
 * enormous output space, and it is the step that failed here every time: told
 * three separate ways not to reuse an ambiguous locator, and handed a
 * verified alternative scoring 1.0, it wrote the ambiguous one anyway on
 * three consecutive generations. Not because the right answer was missing —
 * it was in the prompt — but because nothing stopped it writing something
 * else.
 *
 * Reducing the answer to an index removes that freedom without removing the
 * model's actual value. Judging WHICH element a check is about is exactly
 * what a model is good at and what deterministic ranking can only approximate
 * (name-token overlap says "Go Live" and "Live" are both about liveness).
 * Enumerating, verifying uniqueness and writing the edit are what code is
 * good at. This splits the work along that line.
 *
 * "none" is a first-class answer: a wrong forced choice is worse than falling
 * through to the free-form path, which is what happens when the model says
 * nothing fits.
 */
const SELECTION_TIMEOUT_MS = 30000;
const SELECTION_MAX_TOKENS = 400;

function buildSelectionPrompt(test, target, { rejectionReason } = {}) {
  const rows = target.set.candidates
    .map((c, i) => `  ${i + 1}. page.${c.selector}\n     resolves to: ${c.description}`)
    .join('\n');
  const where =
    target.kind === 'declaration'
      ? `the locator \`this.${target.declaration.name}\`, declared as \`${target.declaration.raw}\` and used inside ${target.set.method}()`
      : `the locator built inline inside ${target.set.method}(): \`${target.raw.trim()}\``;

  return `A Playwright test is failing. One locator needs to be repaired, and the replacement has already been narrowed to a short list of verified options. Your only job is to choose the right one.

FAILING TEST
${test.title}

ERROR
${stripAnsi(test.error?.message)?.slice(0, 600) || '(none captured)'}

WHAT IS BROKEN
${where}

VERIFIED OPTIONS (each was found on the page captured at failure and confirmed to match EXACTLY ONE element)
${rows}
${rejectionReason ? `\nYOUR PREVIOUS ANSWER WAS REJECTED: ${rejectionReason}\nAnswer again, correcting that.\n` : ''}
HOW TO CHOOSE
${target.set.method}() exists to establish a specific condition. Pick the option that identifies the element that condition is ABOUT. An element that merely appears on the same screen — a related control, a container, a nearby label — makes the check pass without testing anything, which is the same as deleting it. If a control performs an ACTION related to the concept (e.g. a button that navigates or triggers something), that is usually NOT the same as the element that INDICATES a state.

If none of the options is the right element, answer "none" — do not force a choice.

Respond with ONLY this JSON, no prose and no markdown fence:
{ "choice": <option number> | "none", "why": "<one sentence>" }`;
}

function parseSelection(raw, optionCount) {
  const parsed = extractJson(raw);
  const choice = parsed?.choice;
  if (choice === 'none' || choice === null) return { none: true, why: parsed?.why || '' };
  const index = Number(choice);
  if (!Number.isInteger(index) || index < 1 || index > optionCount) {
    throw new Error(`"choice" must be a whole number from 1 to ${optionCount}, or "none" — got ${JSON.stringify(choice)}`);
  }
  return { index: index - 1, why: typeof parsed?.why === 'string' ? parsed.why : '' };
}

async function chooseCandidateWithModel(test, files, candidateSets, domSnapshot) {
  const target = locateFixTarget(files, candidateSets);
  if (!target) return null;
  const options = target.set.candidates;

  let rejectionReason = null;
  // One retry, and only with a concrete reason. A model corrects far more
  // reliably when told exactly what was wrong with its last answer than when
  // warned in advance — and capping it at one keeps a bad day from becoming
  // an expensive loop.
  for (let attempt = 0; attempt < 2; attempt += 1) {
    let selection;
    try {
      const { raw } = await complete(buildSelectionPrompt(test, target, { rejectionReason }), {
        timeoutMs: SELECTION_TIMEOUT_MS,
        maxTokens: SELECTION_MAX_TOKENS,
      });
      selection = parseSelection(raw, options.length);
    } catch (err) {
      rejectionReason = err.message;
      continue;
    }
    if (selection.none) return { none: true, why: selection.why };

    const candidate = options[selection.index];
    const rendered = renderCandidateEdit(target, candidate);
    // The model picked the option the code already uses — i.e. it judged the
    // current locator correct. Retrying would only push it toward a worse
    // option, so this is taken at face value and reported as a finding.
    if (rendered?.noop) {
      return { alreadyOptimal: { description: candidate.description, where: target.kind, line: target.line, why: selection.why } };
    }
    if (!rendered) {
      rejectionReason = `option ${selection.index + 1} could not be expressed as an edit to this file`;
      continue;
    }
    if (!(await verifyRenderedEdit(rendered, domSnapshot))) {
      rejectionReason = `option ${selection.index + 1} did not resolve to exactly one element when re-checked against the captured page`;
      continue;
    }

    const where =
      target.kind === 'declaration'
        ? `the declaration of \`this.${target.declaration.name}\` (used on line ${target.usedAtLine})`
        : `the locator built on line ${target.line}`;
    return {
      raw: JSON.stringify({
        explanation:
          `Chosen from ${options.length} pre-verified options: "${candidate.description}". ` +
          `${selection.why || ''} Applied to ${where} in ${target.file.relative}.`.replace(/\s+/g, ' ').trim(),
        confidence: 'high',
        edits: [
          {
            file: rendered.file,
            oldCode: rendered.oldCode,
            newCode: rendered.newCode,
            reason: `Verified candidate: ${candidate.description}.`,
          },
        ],
      }),
    };
  }
  return null;
}

async function finishProposal(proposal, { domSnapshot, priorAttempts, receiverIndex, baseline, verifiedRelated }) {
  const probed = await attachBaselineMatch(await attachLiveProbe(proposal, domSnapshot), domSnapshot, baseline);
  if (probed.available) {
    probed.evidence = buildEvidence(probed, {
      domSnapshot,
      priorAttempts,
      receiverIndexSize: receiverIndex?.size || 0,
      conventionsLoaded: loadFixConventions().rules.length > 0,
      verifiedRelated,
    });
  }
  return probed;
}

/**
 * Generates a spot-fix proposal for a failed test. Never writes to disk.
 * Returns { available, reason?, edits, explanation?, confidence?, model?, generatedAt, consensus? }.
 *
 * Every request generates one candidate from the primary provider — same
 * cost as before for the common case. It only escalates to ask other
 * configured providers for an independent second (and if they disagree, a
 * tiebreaking third) opinion when there's an actual signal this one needs
 * extra scrutiny: a high-severity risk flag, or this exact test already has
 * a proven-failed prior attempt. That keeps quota spend proportional to how
 * hard the case actually is, instead of a flat 3x tax on every click — see
 * buildConsensus below for how the models' answers get reconciled.
 */
async function proposeSpotFix(test, rca, { runId } = {}) {
  if (!rca) {
    return unavailable('Run "Analyze failure" first — a spot fix needs a diagnosis to work from.');
  }
  if (rca.category !== FIXABLE_CATEGORY) {
    return unavailable(
      `This failure is categorised as "${rca.category || 'unknown'}", not a code issue, so there is nothing in the repo to fix. ${rca.suggestedFix || ''}`.trim()
    );
  }
  if (!hasAiProvider()) {
    return unavailable(aiProviderUnavailableReason());
  }

  const files = collectCandidateFiles(test);
  if (!files.length) {
    return unavailable('Could not locate any editable source file for this test under tests/ or src/.');
  }
  // Widen the excerpts to include wherever the error's strings are declared —
  // under the Page Object pattern that is usually far from the stack frame.
  addErrorLiteralMatches(files, stripAnsi(test.error?.message));
  // A value assertion (expect(x).toContain(...)) can fail because the helper
  // method that produced x returned the wrong thing without throwing — that
  // method never appears in the stack trace and shares no literal with the
  // error text, so it would otherwise never be shown to the model at all.
  addCalledMethodSources(files, test);
  // Widens the excerpts further to include every helper the test itself
  // calls on the way to the failing line — not just the one adjacent to the
  // assertion — so a bug in an earlier step's actual behavior (as opposed to
  // what its name suggests) is visible rather than invented around.
  addTestFlowSources(files, test);

  // Every page-object instance this test/file touches, mapped to its real
  // method/locator catalog — the ground truth an edit is checked against
  // below, independent of which model proposed it.
  const receiverIndex = buildReceiverIndex(files.map((f) => f.content));

  // Real evidence, not a guess: fixes already applied to this exact test and
  // rerun for real that the app still failed. Both shown to the model (so it
  // has a chance to avoid repeating one) and checked deterministically below
  // (so it doesn't matter whether the model actually heeds that).
  const priorAttempts = findPriorFailedAttempts(test, { excludeRunId: runId });

  const errorContext = loadErrorContext(test);
  // Real markup, not just the accessibility tree — see domSnapshot.js and
  // domExcerpt.js for why this is the only ground truth this pipeline has
  // for a CSS-class/data-testid selector that stopped matching.
  const domSnapshot = loadDomSnapshot(test);
  // For a timeout, the trace names the exact call that never returned — the
  // one thing that says WHERE it hung. Without it a fix for a timeout is
  // guesswork over the whole test; with it there is a specific locator to
  // aim at. See ../rca/traceActions.js.
  const baseline = loadBaseline(test);
  const hangingAction = test.status === 'timedOut' ? loadHangingAction(test) : null;
  // Ranked replacement elements, found deterministically rather than left for
  // the model to search out of the DOM excerpt — see computeCandidateSets.
  const candidateSets = await computeCandidateSets(files, domSnapshot, baseline);
  // Whether the "already declared, on-subject" locators the prompt is about
  // to name are still real, checked against the page the test actually
  // failed on — see verifyRelatedLocators. Independent of candidateSets/
  // baseline so a missing or bad baseline can never leave this unverified.
  const verifiedRelated = await verifyRelatedLocators(files, domSnapshot);
  const prompt = buildSpotFixPrompt(
    test,
    rca,
    errorContext,
    files,
    priorAttempts,
    domSnapshot,
    hangingAction,
    baseline,
    candidateSets,
    verifiedRelated
  );

  // Where the failure actually happened, per file — used to pick the right
  // occurrence when a snippet repeats. collectCandidateFiles already gathered
  // these from the test location and its in-repo stack frames.
  const anchorsByFile = new Map(files.map((f) => [f.relative, [...f.lines].filter(Boolean).sort((a, b) => a - b)]));
  // Whether the value the assertion read could have come from an action that
  // silently never ran, rather than from a genuinely absent result — the
  // failure shape whose evidence the source code itself destroys. Computed
  // once here and applied to every candidate, so the check is identical
  // across models the same way the grounding check is.
  const swallowed = describeSwallowedFailures(files, test);
  const candidateCtx = { anchorsByFile, receiverIndex, priorAttempts, swallowed, domSnapshot, verifiedRelated };

  // --- Candidate 1: try a deterministic, model-free fix first (see
  // tryDeterministicFix) — only fires when the evidence already narrows to
  // one unambiguous, verified answer, in which case there is nothing left
  // for a model to decide. Otherwise fall through to the primary provider
  // (its own existing failover chain still applies here — see
  // complete()/completeWithApiChain — so a dead primary key transparently
  // falls through before this ever surfaces as a model to compare against). ---
  const deterministic = await tryDeterministicFix(files, candidateSets, domSnapshot);
  // When the evidence does not settle it outright, ask the model to CHOOSE
  // among the verified options rather than to write a diff — see
  // chooseCandidateWithModel. Only the free-form path below can propose
  // something that isn't a locator swap, so a "none" answer (or no usable
  // choice) still falls through to it.
  const selected = deterministic ? null : await chooseCandidateWithModel(test, files, candidateSets, domSnapshot);

  // Either path may report that the locator is ALREADY the best verified
  // option on the failing page. That is a conclusion, not a dead end: the
  // failure is then not a stale locator, and the free-form path must not run,
  // because its only remaining move is to invent a change to code that is
  // already right. Observed doing exactly that — it replaced a correct
  // `getByText('Live', { exact: true })` (1 match, the live badge) with
  // `getByRole('button', { name: 'Live' })`, which substring-matches the
  // accessible name "Go Live" and so silently pointed at a different control.
  const alreadyOptimal = deterministic?.alreadyOptimal || selected?.alreadyOptimal;
  if (alreadyOptimal) {
    return unavailable(
      `No locator fix is needed: the locator this test depends on already resolves to ${alreadyOptimal.description} — ` +
        `the best-matching element on the page captured at failure, and the only one that matches uniquely. ` +
        `The failure is therefore not a stale selector. Look instead at whether the element is present but not yet ` +
        `visible when the check runs (a timing or precondition problem), or at whether an earlier step left the app ` +
        `in the wrong state.${alreadyOptimal.why ? ` Model's note: ${alreadyOptimal.why}` : ''}`
    );
  }

  const deterministicRaw = typeof deterministic === 'string' ? deterministic : null;
  const primaryResult = deterministicRaw
    ? { raw: deterministicRaw, model: 'deterministic (no model)' }
    : selected?.raw
      ? { raw: selected.raw, model: 'AI choice from verified options' }
      : await complete(prompt, { timeoutMs: TIMEOUT_MS, maxTokens: MAX_TOKENS });
  const candidate1 = buildCandidate(primaryResult.raw, primaryResult.model, candidateCtx);
  if (!candidate1.edits.length) {
    return unavailable(candidate1.unavailableReason);
  }

  const config = getConfig();
  const highRisk = candidate1.edits.some((edit) => edit.risks.some((r) => r.severity === 'high'));
  // A deterministic fix has no model opinion to seek a second one on — it
  // was built from the same verified-unique evidence a second model would
  // be asked to weigh, so escalating would only spend another API call (the
  // scarce resource that caused this to fall to a weaker model in the first
  // place — see complete()) to re-derive a conclusion already reached
  // without guessing.
  const shouldEscalate =
    !deterministicRaw &&
    !selected?.raw &&
    config.provider === 'api' &&
    config.apiChain.length > 1 &&
    (priorAttempts.length > 0 || highRisk);

  if (!shouldEscalate) {
    return finishProposal(finalizeProposal(candidate1), { domSnapshot, priorAttempts, receiverIndex, baseline, verifiedRelated });
  }

  // --- Escalation: ask up to two more DISTINCT configured providers for an
  // independent opinion on the exact same prompt. Stops as soon as one
  // agrees with the primary (2/2 is already a settled consensus — no need
  // to spend a third call proving what's already agreed), so the common
  // escalation case costs 2 calls, not a flat 3. ---
  const others = config.apiChain.filter((entry) => entry.label !== primaryResult.label).slice(0, 2);
  const opinions = [{ label: primaryResult.label, candidate: candidate1 }];
  for (const entry of others) {
    try {
      const { raw, model } = await completeWithProvider(entry, prompt, { timeoutMs: TIMEOUT_MS, maxTokens: MAX_TOKENS });
      const candidate = buildCandidate(raw, model, candidateCtx);
      if (candidate.edits.length) opinions.push({ label: entry.label, candidate });
    } catch (err) {
      // Graceful degradation, same principle as the fallback chain: one
      // provider being unavailable for the second opinion should never take
      // the whole proposal down — it just means less corroboration.
      console.warn(`[dashboard] spot-fix second opinion from "${entry.label}" failed: ${err.message}`);
    }
    const latest = opinions[opinions.length - 1];
    if (latest.label !== primaryResult.label && editSetSignature(latest.candidate.edits) === editSetSignature(candidate1.edits)) {
      break;
    }
  }

  if (opinions.length === 1) {
    // Every escalation attempt failed or came back empty — no corroboration
    // either way, so this is exactly the single-model result from before.
    return finishProposal(finalizeProposal(candidate1), { domSnapshot, priorAttempts, receiverIndex, baseline, verifiedRelated });
  }

  const { winner, consensus } = reconcileOpinions(opinions);
  return finishProposal(finalizeProposal(winner, consensus), { domSnapshot, priorAttempts, receiverIndex, baseline, verifiedRelated });
}

/**
 * Reconciles however many independent opinions were actually obtained (2 or
 * 3 — see the escalation loop above): majority vote by edit-set identity,
 * ties broken toward the primary. This is what turns "confidence" from one
 * model's own self-report into something actually measured — N of M
 * independently-generated, independently grounding-checked candidates
 * converging on the same edit is real evidence; a single model saying "high
 * confidence" about itself is not.
 *
 * The returned winner is the actual majority-supported candidate — not
 * always the primary's. If two escalation opinions agree with each other
 * but not with the primary, that 2-vs-1 majority wins; the primary only
 * acts as the tiebreaker when votes are equal.
 */
function reconcileOpinions(opinions) {
  const groups = new Map(); // signature -> [{label, candidate}, ...]
  for (const opinion of opinions) {
    const sig = editSetSignature(opinion.candidate.edits);
    if (!groups.has(sig)) groups.set(sig, []);
    groups.get(sig).push(opinion);
  }

  const primaryLabel = opinions[0].label;
  let winningGroup = null;
  for (const group of groups.values()) {
    if (
      !winningGroup ||
      group.length > winningGroup.length ||
      (group.length === winningGroup.length && group.some((m) => m.label === primaryLabel))
    ) {
      winningGroup = group;
    }
  }

  // Prefer the primary's own candidate object when it's part of the winning
  // group (stable/deterministic when it's available), otherwise whichever
  // group member was obtained first.
  const winner = (winningGroup.find((m) => m.label === primaryLabel) || winningGroup[0]).candidate;

  return {
    winner,
    consensus: {
      agreeing: winningGroup.length,
      total: opinions.length,
      disagreed: winningGroup.length < opinions.length,
      models: winningGroup.map((m) => m.label),
      allModelsAsked: opinions.map((o) => o.label),
    },
  };
}

/**
 * Writes a previously-generated proposal to disk after re-verifying it.
 *
 * Re-reads and re-checks every file: the proposal may be minutes old, the
 * auto-updater may have pulled new commits, or another spot fix may have
 * touched the same file. Validates all edits before writing any, so a bad
 * edit cannot leave the tree half-modified.
 */
function applySpotFix(proposal) {
  if (!proposal?.available || !Array.isArray(proposal.edits) || !proposal.edits.length) {
    throw new Error('There is no applicable spot-fix proposal to apply');
  }

  const planned = proposal.edits.map((edit) => {
    const target = resolveEditableFile(edit.absolutePath || edit.file);

    if (sha256(target.content) !== edit.baseSha256) {
      throw new Error(`${target.relative} has changed since this fix was proposed — re-analyze and generate a new one.`);
    }

    // Rewrite at the exact offset validateEdit verified. A string replace here
    // would hit the file's FIRST occurrence, which for a repeated snippet is
    // not necessarily the one shown in the reviewed diff.
    const start = edit.startOffset;
    if (target.content.slice(start, start + edit.oldCode.length) !== edit.oldCode) {
      throw new Error(
        `Cannot apply safely: ${target.relative} no longer matches the reviewed snippet at line ${edit.startLine}.`
      );
    }

    const updatedContent =
      target.content.slice(0, start) + edit.newCode + target.content.slice(start + edit.oldCode.length);
    return {
      path: target.path,
      relative: target.relative,
      eol: target.eol,
      originalContent: target.content,
      updatedContent,
    };
  });

  const backupDir = path.join(BACKUP_DIR, `${Date.now()}-${crypto.randomUUID().slice(0, 8)}`);
  fs.mkdirSync(backupDir, { recursive: true });

  const applied = [];
  for (const change of planned) {
    // Back up to disk rather than onto the run record: the run record is sent
    // to every connected browser on each snapshot, and a page object here runs
    // past 1600 lines.
    const backupPath = path.join(backupDir, change.relative.replace(/[\\/]/g, '__'));
    fs.writeFileSync(backupPath, applyEol(change.originalContent, change.eol), 'utf-8');

    // Restore the file's own line endings so applying a one-line fix doesn't
    // show up as every line changed in git.
    fs.writeFileSync(change.path, applyEol(change.updatedContent, change.eol), 'utf-8');

    applied.push({
      file: change.relative,
      absolutePath: change.path,
      eol: change.eol,
      backupPath,
      // Lets revert refuse if someone edited the file after we wrote it.
      appliedSha256: sha256(change.updatedContent),
    });
  }

  return { appliedAt: new Date().toISOString(), files: applied };
}

/**
 * Restores the files an applied spot fix overwrote.
 *
 * Refuses per-file if the content no longer matches what we wrote, so a
 * revert never clobbers someone's later manual edit.
 */
function revertSpotFix(applyRecord) {
  if (!applyRecord?.files?.length) {
    throw new Error('There is no applied spot fix to revert');
  }

  const reverted = [];
  const skipped = [];
  for (const file of applyRecord.files) {
    let current;
    let backup;
    try {
      current = normalizeEol(fs.readFileSync(file.absolutePath, 'utf-8'));
    } catch {
      skipped.push(`${file.file} (no longer readable)`);
      continue;
    }
    try {
      backup = fs.readFileSync(file.backupPath, 'utf-8');
    } catch {
      skipped.push(`${file.file} (its pre-fix backup is missing)`);
      continue;
    }
    if (sha256(current) !== file.appliedSha256) {
      skipped.push(`${file.file} (modified after the fix was applied)`);
      continue;
    }
    fs.writeFileSync(file.absolutePath, backup, 'utf-8');
    reverted.push(file.file);
  }

  if (!reverted.length) {
    throw new Error(`Nothing was reverted: ${skipped.join('; ')}`);
  }
  return { revertedAt: new Date().toISOString(), reverted, skipped };
}

// validateEdit, reconcileOpinions, and attachLiveProbe are exported for
// tests: they're where every safety/consensus/verification decision is
// made, so each needs to be exercisable without a live model call.
module.exports = {
  proposeSpotFix,
  applySpotFix,
  revertSpotFix,
  registry,
  validateEdit,
  checkDomEvidence,
  reconcileOpinions,
  editSetSignature,
  attachLiveProbe,
};
