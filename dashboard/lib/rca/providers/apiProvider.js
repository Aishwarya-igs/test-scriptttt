/**
 * Team-wide cloud AI provider: a single API key/endpoint configured once on
 * the dashboard server (via env vars), used by everyone who opens the
 * dashboard. Unlike Ollama, this needs no per-machine setup — but it does
 * send the test's error/page-snapshot text to whichever third-party the key
 * belongs to, so the team should be comfortable with that vendor's data
 * handling before turning this on.
 *
 * Supports two request shapes, selected via RCA_API_FORMAT:
 *   - 'openai' (default): POST {baseUrl}/chat/completions, Bearer auth.
 *     Covers OpenAI, Groq, OpenRouter, Together, Mistral, Azure-OpenAI-style
 *     proxies, and self-hosted OpenAI-compatible servers (LM Studio, vLLM).
 *   - 'anthropic': POST {baseUrl}/messages, x-api-key auth. For a direct
 *     Claude API key against api.anthropic.com.
 */
const TIMEOUT_MS = 30000;

const FORMAT_DEFAULTS = {
  openai: { baseUrl: 'https://api.openai.com/v1', model: 'gpt-4o-mini' },
  anthropic: { baseUrl: 'https://api.anthropic.com/v1', model: 'claude-3-5-haiku-20241022' },
};

async function callOpenAiCompatible(prompt, { baseUrl, apiKey, model, timeoutMs = TIMEOUT_MS, maxTokens }) {
  const res = await fetch(`${baseUrl}/chat/completions`, {
    method: 'POST',
    headers: {
      'Content-Type': 'application/json',
      Authorization: `Bearer ${apiKey}`,
    },
    body: JSON.stringify({
      model,
      messages: [{ role: 'user', content: prompt }],
      // As deterministic as the API allows — this is a code-generation task
      // being checked against ground truth afterward (see locatorIndex.js),
      // not creative writing, and cross-run/cross-model consistency matters
      // more here than variety.
      temperature: 0,
      ...(maxTokens ? { max_tokens: maxTokens } : {}),
    }),
    signal: AbortSignal.timeout(timeoutMs),
  });
  if (!res.ok) {
    const body = await res.text().catch(() => '');
    throw new Error(`API responded with ${res.status}${body ? `: ${body.slice(0, 200)}` : ''}`);
  }
  const data = await res.json();
  const text = data.choices?.[0]?.message?.content;
  if (!text) throw new Error('API response had no message content');
  return text;
}

async function callAnthropic(prompt, { baseUrl, apiKey, model, timeoutMs = TIMEOUT_MS, maxTokens = 1024 }) {
  const res = await fetch(`${baseUrl}/messages`, {
    method: 'POST',
    headers: {
      'Content-Type': 'application/json',
      'x-api-key': apiKey,
      'anthropic-version': '2023-06-01',
    },
    body: JSON.stringify({
      model,
      max_tokens: maxTokens,
      messages: [{ role: 'user', content: prompt }],
      temperature: 0,
    }),
    signal: AbortSignal.timeout(timeoutMs),
  });
  if (!res.ok) {
    const body = await res.text().catch(() => '');
    throw new Error(`API responded with ${res.status}${body ? `: ${body.slice(0, 200)}` : ''}`);
  }
  const data = await res.json();
  const text = data.content?.[0]?.text;
  if (!text) throw new Error('API response had no content');
  return text;
}

/**
 * Sends an arbitrary prompt and returns the raw completion text. Shared by
 * RCA and the spot-fix generator so both go through the one API key the
 * server is already configured with. Throws on any failure (missing key,
 * unreachable, bad response) — caller decides the fallback.
 *
 * timeoutMs/maxTokens are parameters because spot fixes send whole source
 * files and ask for code back, needing more of both than an RCA summary.
 */
async function completeWithApi(prompt, { format = 'openai', apiKey, baseUrl, model, timeoutMs, maxTokens } = {}) {
  if (!apiKey) {
    throw new Error('RCA_API_KEY is not configured');
  }
  const defaults = FORMAT_DEFAULTS[format] || FORMAT_DEFAULTS.openai;
  const resolvedModel = model || defaults.model;
  const opts = {
    baseUrl: baseUrl || defaults.baseUrl,
    apiKey,
    model: resolvedModel,
    timeoutMs,
    maxTokens,
  };
  const raw = format === 'anthropic' ? await callAnthropic(prompt, opts) : await callOpenAiCompatible(prompt, opts);
  return { raw, model: resolvedModel };
}

module.exports = { completeWithApi, FORMAT_DEFAULTS };
