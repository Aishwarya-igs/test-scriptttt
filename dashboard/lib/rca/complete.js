/**
 * Routes an arbitrary prompt to whichever AI provider RCA_PROVIDER selects,
 * so features beyond RCA (notably the spot-fix generator) reuse the one
 * provider/key the server is already configured with instead of growing
 * their own parallel config.
 *
 * Unlike analyzeTest(), this deliberately does NOT fall back to heuristics:
 * a caller asking for a raw completion needs a model, and silently returning
 * nothing would be worse than a clear "no AI provider configured" error.
 */
const { completeWithOllama, DEFAULT_URL: OLLAMA_URL, DEFAULT_MODEL: OLLAMA_MODEL } = require('./providers/ollama');
const { completeWithApiChain } = require('./providers/apiChain');
const { completeWithApi } = require('./providers/apiProvider');
const { getConfig } = require('./config');

/** True when RCA_PROVIDER points at something that can actually generate text. */
function hasAiProvider(config = getConfig()) {
  if (config.provider === 'ollama') return true;
  if (config.provider === 'api') return config.apiChain.length > 0;
  return false;
}

/** Human-readable reason why hasAiProvider() is false, for surfacing in the UI. */
function aiProviderUnavailableReason(config = getConfig()) {
  if (config.provider === 'api' && config.apiChain.length === 0) {
    return 'RCA_PROVIDER is "api" but RCA_API_KEY is not set on the dashboard server.';
  }
  return `RCA_PROVIDER is "${config.provider}", which cannot generate code. Set it to "api" (with RCA_API_KEY) or "ollama".`;
}

/**
 * Returns { raw, model, source, label, usedFallback }. Throws if no AI
 * provider is configured or the call fails.
 *
 * `label` identifies which chain entry actually answered (see
 * config.parseApiChain) — exposed so a caller doing multi-model escalation
 * (spotfix/index.js) can tell which provider this result came from and pick
 * a genuinely different one for a second opinion, rather than risking
 * re-asking the exact same model twice under different names.
 */
async function complete(prompt, { timeoutMs, maxTokens } = {}) {
  const config = getConfig();

  if (config.provider === 'ollama') {
    const raw = await completeWithOllama(prompt, {
      url: config.ollamaUrl,
      model: config.ollamaModel,
      timeoutMs,
    });
    return { raw, model: config.ollamaModel, source: 'ollama', label: 'ollama', usedFallback: false };
  }

  if (config.provider === 'api') {
    // Same fallback-chain behavior as RCA analysis (see rca/index.js) — a
    // spot fix is exactly the kind of request that shouldn't just die
    // because the primary provider's free-tier quota ran out mid-day.
    const { raw, model, label, usedFallback } = await completeWithApiChain(prompt, config.apiChain, {
      timeoutMs,
      maxTokens,
    });
    if (usedFallback) console.warn(`[dashboard] RCA API primary unavailable — used fallback provider "${label}"`);
    return { raw, model, source: 'api', label, usedFallback };
  }

  throw new Error(aiProviderUnavailableReason(config));
}

/**
 * Calls exactly ONE named provider from RCA_API_*'s chain — no failover to
 * the rest of the chain on failure, it either answers or throws. This is
 * for multi-model escalation (spotfix/index.js): once the primary result is
 * in hand, getting a genuine second opinion means deliberately asking a
 * SPECIFIC different model, not "whichever one happens to answer first."
 * Only supports RCA_PROVIDER=api — Ollama has exactly one model configured,
 * so there is nothing else in its "chain" to escalate to.
 */
async function completeWithProvider(providerEntry, prompt, { timeoutMs, maxTokens } = {}) {
  const { raw, model } = await completeWithApi(prompt, {
    format: providerEntry.format,
    apiKey: providerEntry.apiKey,
    baseUrl: providerEntry.baseUrl,
    model: providerEntry.model,
    timeoutMs,
    maxTokens,
  });
  return { raw, model, source: 'api', label: providerEntry.label };
}

module.exports = { complete, completeWithProvider, hasAiProvider, aiProviderUnavailableReason };
