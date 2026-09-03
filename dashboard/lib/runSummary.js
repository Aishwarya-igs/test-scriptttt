/**
 * Proactive, plain-English summary of one finished run — generated
 * automatically so a run's headline story is readable without clicking into
 * every failing test individually.
 *
 * Deliberately grounded the same way as everything else AI-driven in this
 * codebase (RCA, spot fix): the prompt states only real numbers and real
 * test titles pulled from historyQueries.runDetail, and explicitly forbids
 * inventing a cause for a failure beyond what's given. This is a lower-risk
 * task than a spot fix (it writes nothing, changes nothing), so the bar here
 * is "don't state something false," not the full grounding/rejection
 * machinery spot fix needs before it's allowed to touch a file.
 */
const { runDetail } = require('./historyQueries');
const { complete, hasAiProvider, aiProviderUnavailableReason } = require('./rca/complete');

function buildRunSummaryPrompt(detail) {
  const failingLines = detail.failingTests.length
    ? detail.failingTests
        .map((t) => {
          const diagnosis = t.rcaCategory ? `diagnosed as: ${t.rcaCategory}` : 'not yet analyzed';
          const fix = t.spotFixApplied ? ' — a spot fix has been applied' : t.spotFixAvailable ? ' — a spot fix has been proposed' : '';
          return `- ${t.title} (${diagnosis})${fix}`;
        })
        .join('\n')
    : '(none)';

  return `You are writing a short executive summary of one Playwright test run for a QA dashboard.

Use ONLY the facts listed below. Do not invent a cause for any failure beyond what is stated, do not speculate, and do not claim something not listed here. If there is nothing more informative to say than the raw counts, just say the raw counts plainly rather than padding with invented color.

RUN FACTS
Status: ${detail.status}
Total: ${detail.total}, Passed: ${detail.passed}, Failed: ${detail.failed}, Skipped: ${detail.skipped}
Failing tests:
${failingLines}

Write 2-4 plain sentences a QA lead could read in five seconds: what happened, how many failed, and whether any failures already have a diagnosis or fix in progress per the facts above. No markdown, no bullet points, no headings — plain prose only. Output ONLY those sentences — no self-review, no restating these instructions, no showing your reasoning before the answer.`;
}

/**
 * Returns { text, model, generatedAt }, or null if no AI provider is
 * configured (summaries are a "nice to have" — a missing provider should
 * silently skip this, never surface as a run-finish error).
 */
async function generateRunSummary(runId) {
  const detail = runDetail(runId);
  if (!detail) throw new Error(`Run ${runId} not found in the history index`);
  if (!hasAiProvider()) return null;

  const prompt = buildRunSummaryPrompt(detail);
  // maxTokens generous enough to absorb a model that front-loads internal
  // reasoning/self-review before its real answer (observed with Gemini) —
  // too small a budget truncates mid-preamble and never reaches the answer.
  const { raw, model } = await complete(prompt, { timeoutMs: 30000, maxTokens: 1000 });
  return { text: raw.trim(), model, generatedAt: new Date().toISOString() };
}

module.exports = { generateRunSummary, buildRunSummaryPrompt, aiProviderUnavailableReason };
