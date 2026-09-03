/**
 * Local-only AI provider: talks to a locally-running Ollama instance
 * (https://ollama.com) over plain HTTP on localhost/LAN. No data leaves the
 * machine/network running the model — there is no third-party vendor in
 * this path, unlike a hosted API. Best fit for a single developer's machine;
 * see providers/apiProvider.js for a team-wide, centrally-configured option.
 */
const { buildPrompt, parseModelResponse } = require('../promptFormat');

const DEFAULT_URL = 'http://127.0.0.1:11434';
const DEFAULT_MODEL = 'llama3.2';
const TIMEOUT_MS = 20000;

/**
 * Sends an arbitrary prompt and returns the raw completion text. Shared by
 * RCA and the spot-fix generator so both run through whichever provider the
 * server is already configured with. Throws on any failure (unreachable,
 * timeout, bad response) — caller decides the fallback.
 *
 * timeoutMs is a parameter because spot fixes send whole source files and
 * ask for code back, which takes materially longer than an RCA summary.
 */
async function completeWithOllama(prompt, { url = DEFAULT_URL, model = DEFAULT_MODEL, timeoutMs = TIMEOUT_MS } = {}) {
  const res = await fetch(`${url}/api/generate`, {
    method: 'POST',
    headers: { 'Content-Type': 'application/json' },
    // temperature: 0 for the same reason as apiProvider.js — this output is
    // checked against ground truth afterward (locatorIndex.js), so
    // consistency matters more than variety here.
    body: JSON.stringify({ model, prompt, stream: false, options: { temperature: 0 } }),
    signal: AbortSignal.timeout(timeoutMs),
  });
  if (!res.ok) {
    throw new Error(`Ollama responded with ${res.status}`);
  }
  const data = await res.json();
  return data.response || '';
}

async function runOllama(test, errorContext, { url = DEFAULT_URL, model = DEFAULT_MODEL } = {}, context = {}) {
  const raw = await completeWithOllama(buildPrompt(test, errorContext, context), { url, model });
  return { source: 'ollama', model, ...parseModelResponse(raw) };
}

module.exports = { runOllama, completeWithOllama, DEFAULT_URL, DEFAULT_MODEL };
