# DocAsk — Internal Policy Assistant

> **Client pitch:** I build internal Q&A systems that let employees ask natural-language questions over company PDFs and get accurate, cited answers using RAG and LLMs.

A portfolio-ready demo for **Acme Logistics Ltd** (fictional). Five synthetic policy documents, a full ingest → retrieve → generate pipeline, and a clean chat UI with source citations. No NDA data, no real employers.

![MIT License](https://img.shields.io/badge/license-MIT-blue.svg)

---

## Architecture

```mermaid
flowchart TB
    subgraph Frontend["Next.js (port 3000)"]
        UI[Chat UI + Citations]
    end

    subgraph Backend["NestJS API (port 3001)"]
        Health[/health]
        Chat[/chat]
        Ingest[/ingest + seed]
        RAG[RAG Pipeline]
    end

    subgraph External
        Chroma[(Chroma :8000)]
        OpenAI[OpenAI Embeddings]
        LLM[OpenAI / Anthropic LLM]
    end

    UI -->|POST /chat| Chat
    Chat --> RAG
    RAG --> Chroma
    RAG --> OpenAI
    RAG --> LLM
    Ingest --> RAG
    Ingest --> Chroma
```

See [docs/ARCHITECTURE.md](docs/ARCHITECTURE.md) for the full pipeline breakdown.

---

## Tech stack

| Layer | Technology |
|-------|------------|
| Backend | NestJS, TypeScript (strict) |
| Frontend | Next.js 15, Tailwind CSS 4 |
| Vector DB | Chroma (Docker) |
| Embeddings | OpenAI `text-embedding-3-small` |
| LLM | OpenAI or Anthropic (env switch) |
| PDF parsing | `pdf-parse` |
| Monorepo | pnpm workspaces |

---

## Quick start (< 10 commands)

```bash
# 1. Clone and enter repo
cd docask-demo

# 2. Copy environment template
cp .env.example .env
# Edit .env — add OPENAI_API_KEY (required for embeddings)

# 3. Install dependencies
pnpm install

# 4. Generate synthetic PDFs
pnpm generate-pdfs

# 5. Start Chroma
docker compose up -d chroma

# 6. Ingest & embed documents
pnpm seed

# 7. Start API + frontend
pnpm dev

# 8. Open the app
open http://localhost:3000

# 9. Verify API health
curl http://localhost:3001/health
```

**One-liner setup** (after `.env` is configured):

```bash
make setup && pnpm dev
```

### Docker (all services)

```bash
cp .env.example .env   # add API keys
pnpm generate-pdfs
docker compose up --build
```

---

## What this demonstrates

- **Document ingestion** — PDF parsing, section-aware chunking, embedding, vector indexing
- **Semantic retrieval** — similarity search over policy chunks with configurable top-K
- **Grounded generation** — LLM answers constrained to retrieved context
- **Citations** — every answer links back to document name + section
- **Source transparency** — expandable panel showing retrieved chunks (v1.5)
- **Provider flexibility** — swap OpenAI ↔ Anthropic via `LLM_PROVIDER`
- **Portfolio-safe data** — 100% synthetic Acme Logistics content

---

## Sample questions to try

- "How many remote days are allowed per week?"
- "What is the meal reimbursement limit?"
- "What are the password requirements?"
- "What happens on day one of onboarding?"
- "What is the live chat SLA response time?"

### MCP (Claude Desktop, Cursor, etc.)

DocAsk ships as an MCP server so other AI clients can call the same RAG pipeline:

```bash
pnpm mcp:build
```

Cursor picks up [`.cursor/mcp.json`](.cursor/mcp.json) automatically. See [docs/MCP.md](docs/MCP.md) for Claude Desktop and global setup.

---

## Project structure

```
docask-demo/
├── apps/
│   ├── api/          # NestJS — ingest, RAG, chat, health
│   └── web/          # Next.js — chat UI
├── sample-data/pdfs/ # Generated synthetic PDFs
├── scripts/          # PDF generation script
├── docs/             # Architecture documentation
├── docker-compose.yml
├── Makefile
└── .env.example
```

---

## Environment variables

See [.env.example](.env.example) for the full list.

### Embeddings (retrieval)

Switch with `EMBEDDING_PROVIDER` — independent of chat LLM.

| `EMBEDDING_PROVIDER` | Vars | Default model |
|----------------------|------|---------------|
| `openai-compatible` | `EMBEDDING_BASE_URL`, `EMBEDDING_MODEL`, `EMBEDDING_API_KEY` | `nomic-embed-text` via Ollama |
| `openai` | `OPENAI_API_KEY`, `OPENAI_EMBEDDING_MODEL` | `text-embedding-3-small` |

**Ollama (local, no OpenAI key):**

```bash
ollama pull nomic-embed-text
```

```env
EMBEDDING_PROVIDER=openai-compatible
EMBEDDING_BASE_URL=http://localhost:11434/v1
EMBEDDING_MODEL=nomic-embed-text
```

**Switch back to OpenAI later:**

```env
EMBEDDING_PROVIDER=openai
OPENAI_API_KEY=sk-...
OPENAI_EMBEDDING_MODEL=text-embedding-3-small
```

Re-run `pnpm seed` after changing embedding provider (vectors must match).

### Chat LLM — switch with `LLM_PROVIDER`

| `LLM_PROVIDER` | Adapter | Key env vars | Default model |
|----------------|---------|--------------|---------------|
| `openai` | OpenAI-compatible | `OPENAI_API_KEY`, `OPENAI_CHAT_MODEL` | `gpt-4o-mini` |
| `anthropic` | Native Anthropic SDK | `ANTHROPIC_API_KEY`, `ANTHROPIC_CHAT_MODEL` | `claude-sonnet-4-20250514` |
| `gemini` | Native Google SDK | `GOOGLE_API_KEY`, `GEMINI_MODEL` | `gemini-2.0-flash` |
| `ollama` | OpenAI-compatible | `LLM_MODEL` (optional key) | `llama3.1` |
| `openrouter` | OpenAI-compatible | `OPENROUTER_API_KEY`, `LLM_MODEL` | `openai/gpt-4o-mini` |
| `openai-compatible` | OpenAI-compatible | `LLM_BASE_URL`, `LLM_MODEL` | — |

**Common pattern:** OpenAI, Ollama, OpenRouter, LM Studio, vLLM, and DeepSeek all speak the same `/v1/chat/completions` API — one adapter handles them via `baseURL` + `model`. Anthropic and Gemini use native SDKs.

**Quick switch examples:**

```env
# Local Ollama
LLM_PROVIDER=ollama
LLM_MODEL=llama3.1

# Gemini direct
LLM_PROVIDER=gemini
GOOGLE_API_KEY=...
GEMINI_MODEL=gemini-2.0-flash

# Gemini via OpenRouter (no native SDK needed)
LLM_PROVIDER=openrouter
OPENROUTER_API_KEY=...
LLM_MODEL=google/gemini-2.0-flash-001
```

Optional unified overrides: `LLM_API_KEY`, `LLM_MODEL`, `LLM_BASE_URL` work across providers.

`GET /health` includes the active LLM and embedding providers.

---

## Scripts

| Command | Description |
|---------|-------------|
| `pnpm dev` | Start API + web concurrently |
| `pnpm seed` | Rebuild vector index from PDFs |
| `pnpm generate-pdfs` | Create synthetic Acme Logistics PDFs |
| `pnpm build` | Production build |
| `make setup` | Install, generate PDFs, start Chroma, seed |

---

## Langfuse (self-hosted tracing & eval)

Open-source observability — **no cloud billing**. Run locally with Docker:

```bash
docker compose -f docker-compose.langfuse.yml up -d
# UI → http://localhost:3002
```

Pre-seeded API keys in `.env.example` — enable with `LANGFUSE_ENABLED=true`.

Full stack:

```bash
docker compose -f docker-compose.yml -f docker-compose.langfuse.yml up -d
```

See [docs/LANGFUSE.md](docs/LANGFUSE.md) for login, eval datasets, and troubleshooting.

---

## License

MIT — see [LICENSE](LICENSE).

---

*Built as a public portfolio sample. All company names and documents are fictional.*
