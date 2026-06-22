import type { Citation, RetrievedChunk } from '@/lib/api';
import { citationLabel, formatDocumentName, formatSection } from '@/lib/format';

interface Props {
  sources: RetrievedChunk[];
  citations: Citation[];
  selectedIndex: number | null;
  onSelect: (index: number) => void;
  question?: string;
}

function findSourceForCitation(citation: Citation, sources: RetrievedChunk[]): RetrievedChunk | undefined {
  return sources.find(
    (s) =>
      s.documentName === citation.documentName &&
      (s.section === citation.section || s.section.includes(formatSection(citation.section))),
  );
}

export function SourceInspector({ sources, citations, selectedIndex, onSelect, question }: Props) {
  const hasContent = sources.length > 0;

  return (
    <aside className="flex w-80 shrink-0 flex-col border-l border-[var(--border)] bg-[var(--inspector)]">
      <div className="border-b border-[var(--border)] bg-white px-4 py-4">
        <h2 className="text-xs font-semibold uppercase tracking-wider text-[var(--muted)]">
          Source inspector
        </h2>
        <p className="mt-1 text-xs text-slate-500">
          Retrieved passages used to generate the answer
        </p>
      </div>

      {!hasContent ? (
        <div className="flex flex-1 flex-col items-center justify-center px-6 text-center">
          <div className="mb-3 flex h-12 w-12 items-center justify-center rounded-full bg-slate-200 text-slate-400">
            <svg className="h-6 w-6" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={1.5}>
              <path
                strokeLinecap="round"
                strokeLinejoin="round"
                d="M21 21l-5.197-5.197m0 0A7.5 7.5 0 105.196 5.196a7.5 7.5 0 0010.607 10.607z"
              />
            </svg>
          </div>
          <p className="text-sm font-medium text-slate-600">No sources yet</p>
          <p className="mt-1 text-xs text-[var(--muted)]">
            Ask a question to see retrieved document chunks and relevance scores here.
          </p>
        </div>
      ) : (
        <div className="flex flex-1 flex-col overflow-hidden">
          {question && (
            <div className="border-b border-[var(--border)] bg-white px-4 py-3">
              <p className="text-[10px] font-semibold uppercase tracking-wide text-[var(--muted)]">
                Query
              </p>
              <p className="mt-1 text-xs leading-relaxed text-slate-700">{question}</p>
            </div>
          )}

          {citations.length > 0 && (
            <div className="border-b border-[var(--border)] bg-white px-4 py-3">
              <p className="mb-2 text-[10px] font-semibold uppercase tracking-wide text-[var(--muted)]">
                Citations ({citations.length})
              </p>
              <div className="flex flex-wrap gap-1.5">
                {citations.map((c, i) => (
                  <button
                    key={`${c.documentName}-${c.section}-${i}`}
                    type="button"
                    onClick={() => onSelect(i)}
                    className={`rounded-md px-2 py-1 text-[11px] font-medium transition ${
                      selectedIndex === i
                        ? 'bg-[var(--accent)] text-white'
                        : 'bg-[var(--accent-light)] text-[var(--accent)] hover:bg-blue-200'
                    }`}
                  >
                    [{i + 1}] {formatDocumentName(c.documentName)}
                  </button>
                ))}
              </div>
            </div>
          )}

          <div className="flex-1 space-y-2 overflow-y-auto p-3">
            {sources.map((source, i) => {
              const citationIdx = citations.findIndex(
                (c) =>
                  c.documentName === source.documentName &&
                  (c.section === source.section || source.section.includes(formatSection(c.section))),
              );
              const isSelected =
                selectedIndex !== null
                  ? citationIdx === selectedIndex
                  : i === 0;

              return (
                <button
                  key={source.id}
                  type="button"
                  onClick={() => onSelect(citationIdx >= 0 ? citationIdx : i)}
                  className={`w-full rounded-lg border p-3 text-left transition ${
                    isSelected
                      ? 'border-[var(--accent)] bg-white shadow-md ring-2 ring-[var(--accent-light)]'
                      : 'border-[var(--border)] bg-white hover:border-slate-300'
                  }`}
                >
                  <div className="mb-2 flex items-start justify-between gap-2">
                    <div>
                      {citationIdx >= 0 && (
                        <span className="mr-1.5 inline-flex h-5 w-5 items-center justify-center rounded bg-[var(--accent-light)] text-[10px] font-bold text-[var(--accent)]">
                          {citationIdx + 1}
                        </span>
                      )}
                      <span className="text-xs font-semibold text-slate-800">
                        {formatDocumentName(source.documentName)}
                      </span>
                      <p className="text-[11px] text-[var(--muted)]">{formatSection(source.section)}</p>
                    </div>
                    <span
                      className={`shrink-0 rounded-full px-2 py-0.5 text-[10px] font-medium ${
                        source.score >= 0.7
                          ? 'bg-emerald-100 text-emerald-700'
                          : source.score >= 0.5
                            ? 'bg-amber-100 text-amber-700'
                            : 'bg-slate-100 text-slate-600'
                      }`}
                    >
                      {(source.score * 100).toFixed(0)}% match
                    </span>
                  </div>
                  <p className="line-clamp-4 text-xs leading-relaxed text-slate-600">{source.text}</p>
                </button>
              );
            })}
          </div>
        </div>
      )}
    </aside>
  );
}

export { findSourceForCitation, citationLabel };
