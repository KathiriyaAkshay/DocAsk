import { POLICY_DOCUMENTS } from '@/lib/api';
import { formatDocumentName } from '@/lib/format';

interface Props {
  activeDocuments: Set<string>;
}

function DocIcon() {
  return (
    <svg className="h-4 w-4 shrink-0" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={1.5}>
      <path
        strokeLinecap="round"
        strokeLinejoin="round"
        d="M19.5 14.25v-2.625a3.375 3.375 0 00-3.375-3.375h-1.5A1.125 1.125 0 0113.5 7.125v-1.5a3.375 3.375 0 00-3.375-3.375H8.25m0 12.75h7.5m-7.5 3H12M10.5 2.25H5.625c-.621 0-1.125.504-1.125 1.125v17.25c0 .621.504 1.125 1.125 1.125h12.75c.621 0 1.125-.504 1.125-1.125V11.25a9 9 0 00-9-9z"
      />
    </svg>
  );
}

export function DocumentSidebar({ activeDocuments }: Props) {
  return (
    <aside className="flex w-60 shrink-0 flex-col border-r border-[var(--sidebar-border)] bg-[var(--sidebar)] text-white">
      <div className="border-b border-[var(--sidebar-border)] px-4 py-4">
        <h2 className="text-xs font-semibold uppercase tracking-wider text-[var(--sidebar-muted)]">
          Policy library
        </h2>
        <p className="mt-1 text-xs text-slate-400">Pre-loaded for this demo</p>
      </div>

      <ul className="flex-1 space-y-0.5 overflow-y-auto p-2">
        {POLICY_DOCUMENTS.map((doc) => {
          const slug = doc.replace(/\.pdf$/i, '');
          const isActive = activeDocuments.has(slug) || activeDocuments.has(doc);

          return (
            <li
              key={doc}
              className={`flex items-start gap-2.5 rounded-lg px-3 py-2.5 text-sm transition ${
                isActive
                  ? 'bg-blue-600/20 text-blue-200 ring-1 ring-blue-500/40'
                  : 'text-slate-300 hover:bg-white/5'
              }`}
            >
              <DocIcon />
              <span className="leading-snug">{formatDocumentName(slug)}</span>
            </li>
          );
        })}
      </ul>

      <div className="border-t border-[var(--sidebar-border)] px-4 py-3">
        <p className="text-[10px] leading-relaxed text-slate-500">
          Demo environment · Acme Logistics sample data. All documents are synthetic.
        </p>
      </div>
    </aside>
  );
}
