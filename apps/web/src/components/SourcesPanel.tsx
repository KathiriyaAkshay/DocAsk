import type { RetrievedChunk } from '@/lib/api';

interface Props {
  sources: RetrievedChunk[];
  expanded: boolean;
  onToggle: () => void;
}

export function SourcesPanel({ sources, expanded, onToggle }: Props) {
  return (
    <div className="ml-2 mt-2 max-w-[85%]">
      <button
        type="button"
        onClick={onToggle}
        className="text-xs font-medium text-[var(--accent)] hover:underline"
      >
        {expanded ? 'Hide' : 'View'} retrieved sources ({sources.length})
      </button>

      {expanded && (
        <div className="mt-2 space-y-2">
          {sources.map((source) => (
            <div
              key={source.id}
              className="rounded-lg border border-[var(--border)] bg-white p-3 text-xs"
            >
              <div className="mb-1 flex items-center justify-between gap-2">
                <span className="font-semibold text-slate-700">
                  {source.documentName} — {source.section}
                </span>
                <span className="shrink-0 text-[var(--muted)]">
                  score {(source.score * 100).toFixed(0)}%
                </span>
              </div>
              <p className="leading-relaxed text-slate-600">{source.text}</p>
            </div>
          ))}
        </div>
      )}
    </div>
  );
}
