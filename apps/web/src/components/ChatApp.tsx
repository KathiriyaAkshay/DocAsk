'use client';

import { useState } from 'react';
import type { ChatMessage } from '@/lib/api';
import { sendQuestion, SAMPLE_QUESTIONS, POLICY_DOCUMENTS } from '@/lib/api';
import { ChatMessageBubble } from '@/components/ChatMessageBubble';
import { ChatInput } from '@/components/ChatInput';
import { SourcesPanel } from '@/components/SourcesPanel';

export function ChatApp() {
  const [messages, setMessages] = useState<ChatMessage[]>([]);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [expandedSources, setExpandedSources] = useState<string | null>(null);

  const handleAsk = async (question: string) => {
    if (!question.trim() || loading) return;

    setError(null);
    const userMsg: ChatMessage = {
      id: crypto.randomUUID(),
      role: 'user',
      content: question.trim(),
    };
    setMessages((prev) => [...prev, userMsg]);
    setLoading(true);

    try {
      const history = messages.map((m) => ({ role: m.role, content: m.content }));
      const response = await sendQuestion(question.trim(), history);

      const assistantMsg: ChatMessage = {
        id: crypto.randomUUID(),
        role: 'assistant',
        content: response.answer,
        citations: response.citations,
        sources: response.sources,
      };
      setMessages((prev) => [...prev, assistantMsg]);
    } catch (err) {
      setError(err instanceof Error ? err.message : 'Something went wrong');
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="mx-auto flex min-h-[calc(100vh-180px)] max-w-4xl flex-col px-4 py-6">
      <aside className="mb-6 rounded-xl border border-[var(--border)] bg-white p-4 shadow-sm">
        <h2 className="mb-2 text-sm font-semibold uppercase tracking-wide text-[var(--muted)]">
          Pre-loaded policies
        </h2>
        <ul className="flex flex-wrap gap-2">
          {POLICY_DOCUMENTS.map((doc) => (
            <li
              key={doc}
              className="rounded-full bg-[var(--accent-light)] px-3 py-1 text-xs font-medium text-[var(--accent)]"
            >
              {doc}
            </li>
          ))}
        </ul>
      </aside>

      <div className="flex flex-1 flex-col rounded-xl border border-[var(--border)] bg-white shadow-sm">
        <div className="flex-1 space-y-4 overflow-y-auto p-6">
          {messages.length === 0 && (
            <div className="flex h-full flex-col items-center justify-center text-center">
              <p className="mb-2 text-lg font-medium text-slate-700">
                Ask a question about Acme Logistics policies
              </p>
              <p className="mb-6 max-w-md text-sm text-[var(--muted)]">
                Answers are grounded in retrieved document chunks with citations.
              </p>
              <div className="flex flex-wrap justify-center gap-2">
                {SAMPLE_QUESTIONS.map((q) => (
                  <button
                    key={q}
                    type="button"
                    onClick={() => handleAsk(q)}
                    className="rounded-lg border border-[var(--border)] px-3 py-2 text-left text-sm text-slate-600 transition hover:border-[var(--accent)] hover:bg-[var(--accent-light)]"
                  >
                    {q}
                  </button>
                ))}
              </div>
            </div>
          )}

          {messages.map((msg) => (
            <div key={msg.id}>
              <ChatMessageBubble message={msg} />
              {msg.role === 'assistant' && msg.sources && msg.sources.length > 0 && (
                <SourcesPanel
                  sources={msg.sources}
                  expanded={expandedSources === msg.id}
                  onToggle={() =>
                    setExpandedSources((id) => (id === msg.id ? null : msg.id))
                  }
                />
              )}
            </div>
          ))}

          {loading && (
            <div className="flex items-center gap-2 text-sm text-[var(--muted)]">
              <span className="inline-block h-2 w-2 animate-pulse rounded-full bg-[var(--accent)]" />
              Searching policies and generating answer…
            </div>
          )}

          {error && (
            <div className="rounded-lg border border-red-200 bg-red-50 px-4 py-3 text-sm text-red-700">
              {error}
            </div>
          )}
        </div>

        <div className="border-t border-[var(--border)] p-4">
          <ChatInput onSubmit={handleAsk} disabled={loading} />
        </div>
      </div>
    </div>
  );
}
