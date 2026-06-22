'use client';

import { useCallback, useEffect, useMemo, useState } from 'react';
import type { ChatMessage, HealthResponse } from '@/lib/api';
import { fetchHealth, sendQuestion, SAMPLE_QUESTIONS } from '@/lib/api';
import { ChatMessageBubble } from '@/components/ChatMessageBubble';
import { ChatInput } from '@/components/ChatInput';
import { DocumentSidebar } from '@/components/DocumentSidebar';
import { Header } from '@/components/Header';
import { SourceInspector } from '@/components/SourceInspector';

interface InspectorState {
  messageId: string;
  question: string;
  sources: NonNullable<ChatMessage['sources']>;
  citations: NonNullable<ChatMessage['citations']>;
  selectedCitationIndex: number;
}

export function ChatApp() {
  const [messages, setMessages] = useState<ChatMessage[]>([]);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [health, setHealth] = useState<HealthResponse | null>(null);
  const [inspector, setInspector] = useState<InspectorState | null>(null);

  useEffect(() => {
    fetchHealth()
      .then(setHealth)
      .catch(() => setHealth(null));
  }, []);

  const activeDocuments = useMemo(() => {
    const docs = new Set<string>();
    if (inspector?.sources) {
      for (const s of inspector.sources) docs.add(s.documentName);
    }
    return docs;
  }, [inspector]);

  const openInspector = useCallback(
    (
      messageId: string,
      question: string,
      sources: ChatMessage['sources'],
      citations: ChatMessage['citations'],
    ) => {
      if (!sources?.length) return;
      setInspector({
        messageId,
        question,
        sources,
        citations: citations ?? [],
        selectedCitationIndex: 0,
      });
    },
    [],
  );

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
      openInspector(assistantMsg.id, question.trim(), response.sources, response.citations);
    } catch (err) {
      setError(err instanceof Error ? err.message : 'Something went wrong');
    } finally {
      setLoading(false);
    }
  };

  const handleCitationClick = (messageId: string, citationIndex: number) => {
    const msg = messages.find((m) => m.id === messageId);
    if (!msg?.sources?.length) return;

    const userIdx = messages.findIndex((m) => m.id === messageId);
    const question =
      userIdx > 0 && messages[userIdx - 1]?.role === 'user'
        ? messages[userIdx - 1].content
        : inspector?.question ?? '';

    setInspector({
      messageId,
      question,
      sources: msg.sources,
      citations: msg.citations ?? [],
      selectedCitationIndex: citationIndex,
    });
  };

  return (
    <div className="flex h-screen flex-col overflow-hidden">
      <Header health={health} />

      <div className="flex min-h-0 flex-1">
        <DocumentSidebar activeDocuments={activeDocuments} />

        <main className="flex min-w-0 flex-1 flex-col bg-[var(--background)]">
          <div className="flex-1 overflow-y-auto px-6 py-5">
            {messages.length === 0 ? (
              <div className="flex h-full flex-col items-center justify-center text-center">
                <div className="mb-4 flex h-14 w-14 items-center justify-center rounded-2xl bg-[var(--accent-light)]">
                  <svg className="h-7 w-7 text-[var(--accent)]" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={1.5}>
                    <path
                      strokeLinecap="round"
                      strokeLinejoin="round"
                      d="M8.625 12a.375.375 0 11-.75 0 .375.375 0 01.75 0zm0 0H8.25m4.125 0a.375.375 0 11-.75 0 .375.375 0 01.75 0zm0 0H12m4.125 0a.375.375 0 11-.75 0 .375.375 0 01.75 0zm0 0h-.375M21 12c0 4.556-4.03 8.25-9 8.25a9.764 9.764 0 01-2.555-.337A5.972 5.972 0 015.41 20.97a5.969 5.969 0 01-.474-.065 4.48 4.48 0 00.978-2.025c.09-.457-.133-.901-.467-1.226C3.93 16.178 3 14.189 3 12c0-4.556 4.03-8.25 9-8.25s9 3.694 9 8.25z"
                    />
                  </svg>
                </div>
                <h2 className="text-lg font-semibold text-slate-800">
                  Ask about Acme Logistics policies
                </h2>
                <p className="mt-2 max-w-md text-sm text-[var(--muted)]">
                  Natural-language Q&A over HR, expenses, IT security, onboarding, and support
                  guidelines — with citations you can verify.
                </p>
                <div className="mt-8 grid w-full max-w-xl gap-2 sm:grid-cols-2">
                  {SAMPLE_QUESTIONS.map((q) => (
                    <button
                      key={q}
                      type="button"
                      onClick={() => handleAsk(q)}
                      className="rounded-xl border border-[var(--border)] bg-white px-4 py-3 text-left text-sm text-slate-700 shadow-sm transition hover:border-[var(--accent)] hover:shadow-md"
                    >
                      {q}
                    </button>
                  ))}
                </div>
              </div>
            ) : (
              <div className="mx-auto max-w-2xl space-y-5">
                {messages.map((msg) => (
                  <ChatMessageBubble
                    key={msg.id}
                    message={msg}
                    isActive={inspector?.messageId === msg.id}
                    selectedCitationIndex={
                      inspector?.messageId === msg.id ? inspector.selectedCitationIndex : null
                    }
                    onCitationClick={(idx) => handleCitationClick(msg.id, idx)}
                  />
                ))}

                {loading && (
                  <div className="flex items-center gap-3 rounded-xl border border-[var(--border)] bg-white px-4 py-3 text-sm text-[var(--muted)] shadow-sm">
                    <span className="flex gap-1">
                      <span className="inline-block h-2 w-2 animate-pulse-dot rounded-full bg-[var(--accent)]" />
                      <span className="inline-block h-2 w-2 animate-pulse-dot rounded-full bg-[var(--accent)] [animation-delay:0.2s]" />
                      <span className="inline-block h-2 w-2 animate-pulse-dot rounded-full bg-[var(--accent)] [animation-delay:0.4s]" />
                    </span>
                    Retrieving policy passages and generating answer…
                  </div>
                )}

                {error && (
                  <div className="rounded-xl border border-red-200 bg-red-50 px-4 py-3 text-sm text-red-700">
                    {error}
                  </div>
                )}
              </div>
            )}
          </div>

          <div className="shrink-0 border-t border-[var(--border)] bg-white px-6 py-4">
            <div className="mx-auto max-w-2xl">
              <ChatInput onSubmit={handleAsk} disabled={loading} />
              <p className="mt-2 text-center text-[10px] text-[var(--muted)]">
                Answers cite source documents · Click a citation to inspect the retrieved passage
              </p>
            </div>
          </div>
        </main>

        <SourceInspector
          sources={inspector?.sources ?? []}
          citations={inspector?.citations ?? []}
          selectedIndex={inspector?.selectedCitationIndex ?? null}
          onSelect={(index) =>
            inspector &&
            setInspector({ ...inspector, selectedCitationIndex: index })
          }
          question={inspector?.question}
        />
      </div>
    </div>
  );
}
