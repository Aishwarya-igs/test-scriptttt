/**
 * Conversational Q&A over run history ("what's flaky this week", "compare
 * the last two runs").
 *
 * Deliberately NOT a free-form text-to-SQL or tool-calling agent — letting a
 * model generate its own queries against history is both a real injection
 * surface and, per this whole session's findings, another place a model can
 * quietly invent a plausible-sounding but wrong number. Instead every answer
 * is grounded the same way spot fix and the run summary are: a fixed,
 * deterministic bundle of real facts (historyQueries.js) is computed first
 * and handed to the model, which is instructed to answer from those facts
 * only and say so plainly when a question needs something not included.
 *
 * complete() (rca/complete.js) takes a single prompt string, not a
 * multi-turn messages array — reused as-is here (rather than extending the
 * provider layer that RCA and spot-fix also depend on) by folding prior
 * turns into one rendered transcript. Smaller blast radius, same interface
 * every other AI feature in this codebase already relies on.
 */
const hq = require('./historyQueries');
const { complete, hasAiProvider, aiProviderUnavailableReason } = require('./rca/complete');

const MAX_HISTORY_TURNS = 8; // enough for real back-and-forth without the prompt growing unbounded

/** The fixed bundle of real, queryable facts every chat answer is grounded in. */
function gatherContextFacts() {
  const runs = hq.recentRuns(15);
  const passRate = hq.passRateSummary(30);
  const trend = hq.passRateTrend(30);
  const flaky = hq.flakyTests({ window: 30, limit: 15 });
  const topFailing = hq.topFailingTests({ window: 30, limit: 15 });
  const slowest = hq.slowestTests({ window: 30, limit: 10 });
  const lastTwoComparison = runs.length >= 2 ? hq.compareRuns(runs[0].run_id, runs[1].run_id) : null;

  return { runs, passRate, trend, flaky, topFailing, slowest, lastTwoComparison };
}

function renderContextFacts(facts) {
  const runsBlock = facts.runs
    .map((r) => `  ${r.run_id} | ${r.created_at} | ${r.status} | ${r.trigger_type || 'unknown trigger'} | passed ${r.passed} / failed ${r.failed} / skipped ${r.skipped}`)
    .join('\n');

  const flakyBlock = facts.flaky.length
    ? facts.flaky.map((t) => `  ${t.title} (${t.file}) — passed ${t.passCount}x, failed ${t.failCount}x in the last 30 runs`).join('\n')
    : '  (none detected)';

  const topFailingBlock = facts.topFailing.length
    ? facts.topFailing.map((t) => `  ${t.title} (${t.file}) — failed ${t.failCount}x of ${t.totalSeen} occurrences`).join('\n')
    : '  (none)';

  const slowestBlock = facts.slowest.length
    ? facts.slowest.map((t) => `  ${t.title} — max ${(t.maxDurationMs / 1000).toFixed(1)}s, avg ${(t.avgDurationMs / 1000).toFixed(1)}s`).join('\n')
    : '  (no duration data)';

  const comparisonBlock = facts.lastTwoComparison
    ? facts.lastTwoComparison.changed.length
      ? facts.lastTwoComparison.changed.map((c) => `  ${c.title}: ${c.a} -> ${c.b}`).join('\n')
      : '  (no test changed status between the two most recent runs)'
    : '  (fewer than two runs recorded)';

  return `RECENT RUNS (up to 15, newest first)
${runsBlock}

OVERALL PASS RATE (last 30 runs): ${facts.passRate.passRate == null ? 'no data' : `${facts.passRate.passRate}%`} (${facts.passRate.totalPassed} passed / ${facts.passRate.totalFailed} failed)

PASS RATE TREND (oldest to newest, last 30 runs): ${facts.trend.map((t) => (t.passRate == null ? '–' : `${t.passRate}%`)).join(', ')}

FLAKY TESTS (passed AND failed at least once in the last 30 runs)
${flakyBlock}

MOST-FAILING TESTS (last 30 runs)
${topFailingBlock}

SLOWEST TESTS (last 30 runs)
${slowestBlock}

WHAT CHANGED BETWEEN THE TWO MOST RECENT RUNS (${facts.runs[0]?.run_id || '?'} vs ${facts.runs[1]?.run_id || '?'})
${comparisonBlock}`;
}

function renderTranscript(history) {
  return history
    .slice(-MAX_HISTORY_TURNS)
    .map((turn) => `${turn.role === 'assistant' ? 'Assistant' : 'User'}: ${turn.content}`)
    .join('\n');
}

function buildChatPrompt(message, history, facts) {
  const transcript = history?.length ? `\nCONVERSATION SO FAR\n${renderTranscript(history)}\n` : '';
  return `You are answering questions about a Playwright test dashboard's run history for a QA engineer. Answer using ONLY the facts given below — every number you state must come from this data. If the question asks for something not covered here (e.g. why a specific test failed in detail, which needs the test's own diagnosis page), say so plainly and suggest where to look, rather than guessing.

${renderContextFacts(facts)}
${transcript}
New question: ${message}

Answer in 2-5 plain sentences. No markdown, no bullet points — plain prose, like a colleague answering in chat. Output ONLY the answer itself — no self-review, no restating these instructions, no showing your reasoning before the answer.`;
}

/** Returns { reply, model, generatedAt }. Throws if no AI provider is configured. */
async function askAboutHistory(message, history = []) {
  if (!hasAiProvider()) throw new Error(aiProviderUnavailableReason());
  if (!message || typeof message !== 'string' || !message.trim()) {
    throw new Error('Message is required');
  }

  const facts = gatherContextFacts();
  const prompt = buildChatPrompt(message.trim(), history, facts);
  // Generous budget for the same reason as runSummary.js — a model that
  // front-loads internal reasoning before its real answer needs the room or
  // the response is truncated before it ever reaches the answer.
  const { raw, model } = await complete(prompt, { timeoutMs: 30000, maxTokens: 1000 });
  return { reply: raw.trim(), model, generatedAt: new Date().toISOString() };
}

module.exports = { askAboutHistory, gatherContextFacts, buildChatPrompt };
