import { ChatApp } from '@/components/ChatApp';

export default function HomePage() {
  return (
    <>
      <header className="border-b border-[var(--border)] bg-white shadow-sm">
        <div className="mx-auto flex max-w-4xl items-center justify-between px-4 py-4">
          <div>
            <h1 className="text-lg font-bold text-slate-900">
              Acme Logistics — Policy Assistant
            </h1>
            <p className="text-xs text-[var(--muted)]">DocAsk portfolio demo</p>
          </div>
          <span className="rounded-full bg-[var(--accent-light)] px-3 py-1 text-xs font-medium text-[var(--accent)]">
            RAG + Citations
          </span>
        </div>
      </header>

      <div className="border-b border-amber-200 bg-[var(--banner)] px-4 py-2 text-center text-sm text-[var(--banner-text)]">
        Demo with fictional documents — portfolio sample. All company data is synthetic.
      </div>

      <main>
        <ChatApp />
      </main>

      <footer className="border-t border-[var(--border)] py-4 text-center text-xs text-[var(--muted)]">
        Built with NestJS · Next.js · Chroma · OpenAI Embeddings
      </footer>
    </>
  );
}
