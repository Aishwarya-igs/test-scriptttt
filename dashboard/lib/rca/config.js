const { DEFAULT_URL: OLLAMA_DEFAULT_URL, DEFAULT_MODEL: OLLAMA_DEFAULT_MODEL } = require('./providers/ollama');

/**
 * Builds the ordered list of API providers to try for RCA_PROVIDER=api.
 *
 * The primary (unsuffixed RCA_API_*) vars come first, for backward
 * compatibility with every single-provider .env this dashboard has run with
 * so far. Additional providers are optional and picked up via numbered
 * suffixes — RCA_API_KEY_2/RCA_API_FORMAT_2/RCA_API_BASE_URL_2/
 * RCA_API_MODEL_2, then _3, and so on, stopping at the first missing
 * RCA_API_KEY_N. This is what lets a team keep every key they've already
 * collected (Groq, OpenRouter, Mistral, Gemini, ...) live simultaneously as
 * a fallback chain instead of only one at a time — see completeWithApiChain.
 */
function parseApiChain() {
  const chain = [];
  if (process.env.RCA_API_KEY) {
    chain.push({
      label: process.env.RCA_API_LABEL || 'primary',
      format: process.env.RCA_API_FORMAT || 'openai',
      apiKey: process.env.RCA_API_KEY,
      baseUrl: process.env.RCA_API_BASE_URL || null,
      model: process.env.RCA_API_MODEL || null,
    });
  }
  for (let i = 2; process.env[`RCA_API_KEY_${i}`]; i++) {
    chain.push({
      label: process.env[`RCA_API_LABEL_${i}`] || `fallback ${i - 1}`,
      format: process.env[`RCA_API_FORMAT_${i}`] || 'openai',
      apiKey: process.env[`RCA_API_KEY_${i}`],
      baseUrl: process.env[`RCA_API_BASE_URL_${i}`] || null,
      model: process.env[`RCA_API_MODEL_${i}`] || null,
    });
  }
  return chain;
}

/**
 * RCA_PROVIDER controls what generates the analysis:
 *   - 'heuristic' (default): free, instant, zero network, pattern-matching only.
 *   - 'ollama': local model via Ollama, on the machine running the dashboard
 *     server. Zero data leaves that machine/network, but only that one
 *     machine gets AI-backed analysis — not a fit for a shared team deploy.
 *   - 'api': one or more API keys/endpoints configured here on the server,
 *     used by the whole team. RCA_API_FORMAT picks the wire format:
 *       - 'openai' (default): OpenAI, Groq, OpenRouter, Together, Mistral,
 *         Azure-OpenAI-style proxies, self-hosted OpenAI-compatible servers.
 *       - 'anthropic': direct Claude API key.
 *     Requires RCA_API_KEY; RCA_API_BASE_URL/RCA_API_MODEL are optional
 *     overrides (each format has a sensible default). Optionally chain more
 *     providers as automatic fallbacks with RCA_API_KEY_2, _3, ... — see
 *     parseApiChain above and completeWithApiChain in
 *     providers/apiChain.js.
 *
 * Read fresh on each call rather than cached at import time, so editing .env
 * and restarting the server is enough — no code change needed.
 *
 * Lives in its own module (rather than in index.js) so both the RCA
 * orchestrator and complete.js can read it without a circular import.
 */
function getConfig() {
  const apiChain = parseApiChain();
  return {
    provider: process.env.RCA_PROVIDER || 'heuristic',
    ollamaUrl: process.env.RCA_OLLAMA_URL || OLLAMA_DEFAULT_URL,
    ollamaModel: process.env.RCA_OLLAMA_MODEL || OLLAMA_DEFAULT_MODEL,
    // Kept for any existing caller that reads the single-provider shape
    // directly — always equal to apiChain[0] when one is configured.
    apiFormat: process.env.RCA_API_FORMAT || 'openai',
    apiKey: process.env.RCA_API_KEY || null,
    apiBaseUrl: process.env.RCA_API_BASE_URL || null,
    apiModel: process.env.RCA_API_MODEL || null,
    apiChain,
  };
}

module.exports = { getConfig };
