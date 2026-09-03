import { useRef, useState } from 'react';
import { api } from '../api/client';
import type { ChatTurn } from '../api/types';

const SUGGESTIONS = ["What's flaky right now?", 'How is the pass rate trending?', 'What changed in the last two runs?', 'What are the slowest tests?'];

/**
 * Conversational Q&A over run history. Stateless on the server (see
 * lib/chat.js) — this component holds the whole conversation and resends it
 * as `history` with every message, same pattern the rest of this dashboard
 * already uses (no server-side session state anywhere else either).
 *
 * Every answer is grounded in real numbers computed from the SQLite history
 * index (historyQueries.js), not the model inventing figures — same
 * philosophy as the rest of this dashboard's AI features, just applied to
 * "answer a question" instead of "propose a fix".
 */
export function ChatPage() {
  const [messages, setMessages] = useState<ChatTurn[]>([]);
  const [input, setInput] = useState('');
  const [busy, setBusy] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const listRef = useRef<HTMLDivElement>(null);

  async function send(text: string) {
    const trimmed = text.trim();
    if (!trimmed || busy) return;
    setError(null);
    const nextMessages: ChatTurn[] = [...messages, { role: 'user', content: trimmed }];
    setMessages(nextMessages);
    setInput('');
    setBusy(true);
    try {
      const { reply } = await api.askAboutHistory(trimmed, messages);
      setMessages([...nextMessages, { role: 'assistant', content: reply }]);
    } catch (err) {
      setError(err instanceof Error ? err.message : 'Could not get a response');
      setMessages(messages); // roll the optimistic user message back out on failure
    } finally {
      setBusy(false);
      requestAnimationFrame(() => listRef.current?.scrollTo({ top: listRef.current.scrollHeight, behavior: 'smooth' }));
    }
  }

  function handleSubmit(e: React.FormEvent) {
    e.preventDefault();
    send(input);
  }

  return (
    <div className="chat-page page-fade">
      <div className="card chat-header">
        <h2>Ask about your test history</h2>
        <p className="muted">
          Answers are grounded in real numbers from your run history — flaky tests, pass-rate trends, and what changed
          between runs. If something isn't in that data, it'll say so instead of guessing.
        </p>
      </div>

      <div className="card chat-window">
        <div className="chat-messages" ref={listRef}>
          {messages.length === 0 && (
            <div className="chat-empty">
              <p className="muted">Try asking:</p>
              <div className="chat-suggestions">
                {SUGGESTIONS.map((s) => (
                  <button key={s} type="button" className="chat-suggestion" onClick={() => send(s)} disabled={busy}>
                    {s}
                  </button>
                ))}
              </div>
            </div>
          )}
          {messages.map((m, i) => (
            <div key={i} className={`chat-bubble chat-bubble-${m.role}`}>
              {m.content}
            </div>
          ))}
          {busy && <div className="chat-bubble chat-bubble-assistant chat-bubble-loading">Thinking…</div>}
        </div>

        {error && <p className="chat-error">{error}</p>}

        <form className="chat-input-row" onSubmit={handleSubmit}>
          <input
            type="text"
            value={input}
            onChange={(e) => setInput(e.target.value)}
            placeholder="Ask a question about your test runs…"
            disabled={busy}
            maxLength={2000}
          />
          <button type="submit" className="primary-button" disabled={busy || !input.trim()}>
            Send
          </button>
        </form>
      </div>
    </div>
  );
}
