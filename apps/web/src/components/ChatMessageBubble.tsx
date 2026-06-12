import type { ChatMessage } from '@/lib/api';

interface Props {
  message: ChatMessage;
}

export function ChatMessageBubble({ message }: Props) {
  const isUser = message.role === 'user';

  return (
    <div className={`flex ${isUser ? 'justify-end' : 'justify-start'}`}>
      <div
        className={`max-w-[85%] rounded-2xl px-4 py-3 ${
          isUser
            ? 'bg-[var(--accent)] text-white'
            : 'border border-[var(--border)] bg-slate-50 text-slate-800'
        }`}
      >
        <p className="whitespace-pre-wrap text-sm leading-relaxed">{message.content}</p>

        {!isUser && message.citations && message.citations.length > 0 && (
          <div className="mt-3 border-t border-[var(--border)] pt-3">
            <p className="mb-2 text-xs font-semibold uppercase tracking-wide text-[var(--muted)]">
              Citations
            </p>
            <ul className="space-y-1">
              {message.citations.map((c, i) => (
                <li key={i} className="text-xs text-slate-600">
                  <span className="font-medium text-[var(--accent)]">{c.documentName}</span>
                  {' — '}
                  {c.section}
                </li>
              ))}
            </ul>
          </div>
        )}
      </div>
    </div>
  );
}
