import type { HealthResponse } from '@/lib/api';

interface Props {
  health: HealthResponse | null;
}

export function Header({ health }: Props) {
  const docCount = 5;
  const chunkCount = health?.documentsIndexed ?? '—';

  return (
    <header className="flex h-14 shrink-0 items-center justify-between border-b border-[var(--border)] bg-white px-5">
      <div className="flex items-center gap-3">
        <div className="flex h-9 w-9 items-center justify-center rounded-lg bg-[var(--accent)] text-sm font-bold text-white">
          AL
        </div>
        <div>
          <h1 className="text-sm font-semibold text-slate-900">
            Acme Logistics — Policy Assistant
          </h1>
          <p className="text-xs text-[var(--muted)]">
            Answers grounded in company policy documents
          </p>
        </div>
      </div>

      <div className="flex items-center gap-3">
        <div className="hidden items-center gap-2 rounded-full border border-[var(--border)] bg-slate-50 px-3 py-1.5 text-xs text-slate-600 sm:flex">
          <span className="h-1.5 w-1.5 rounded-full bg-emerald-500" />
          {docCount} policies · {chunkCount} chunks indexed
        </div>
        <span className="rounded-full bg-[var(--accent-light)] px-3 py-1 text-xs font-medium text-[var(--accent)]">
          RAG · Citations
        </span>
      </div>
    </header>
  );
}
