/**
 * Tries each configured API provider in order, moving to the next on ANY
 * failure — bad/revoked key, quota exhausted, provider outage, timeout —
 * instead of failing the whole request because one provider is having a bad
 * day. Only throws once every entry in the chain has been tried and failed,
 * so a caller's own last-resort fallback (heuristics) stays the true last
 * resort, not the first thing a single exhausted free-tier quota hits.
 *
 * Order matters and is caller-controlled (see config.parseApiChain) — put
 * the provider you trust most / is cheapest first.
 */
const { completeWithApi } = require('./apiProvider');
const { buildPrompt, parseModelResponse } = require('../promptFormat');

/** Returns { raw, model, label, usedFallback }. Throws only if every entry in `chain` failed. */
async function completeWithApiChain(prompt, chain, { timeoutMs, maxTokens } = {}) {
  if (!chain || chain.length === 0) {
    throw new Error('No API provider configured (RCA_API_KEY is not set)');
  }

  const errors = [];
  for (let i = 0; i < chain.length; i++) {
    const entry = chain[i];
    try {
      const { raw, model } = await completeWithApi(prompt, {
        format: entry.format,
        apiKey: entry.apiKey,
        baseUrl: entry.baseUrl,
        model: entry.model,
        timeoutMs,
        maxTokens,
      });
      return { raw, model, label: entry.label, usedFallback: i > 0 };
    } catch (err) {
      errors.push(`${entry.label} (${err.message})`);
      // Fall through to the next entry in the chain.
    }
  }

  throw new Error(`All ${chain.length} configured API provider(s) failed: ${errors.join('; ')}`);
}

/**
 * RCA-specific wrapper: builds the analysis prompt, runs it through the
 * fallback chain, and parses the structured response — the chain-aware
 * counterpart to what runApiProvider used to do against a single provider.
 */
async function runApiProviderChain(test, errorContext, chain, context = {}) {
  const { raw, model, label, usedFallback } = await completeWithApiChain(buildPrompt(test, errorContext, context), chain);
  return {
    source: 'api',
    model,
    ...parseModelResponse(raw),
    ...(usedFallback ? { note: `Generated using fallback provider "${label}" — the primary one was unavailable.` } : {}),
  };
}

module.exports = { completeWithApiChain, runApiProviderChain };
