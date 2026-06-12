# Langfuse — Self-hosted tracing & evaluation (recommended)

DocAsk integrates with **self-hosted Langfuse** (open source, MIT) — no cloud subscription required. Langfuse Cloud is optional; this project defaults to the local Docker stack.

## Quick start (self-hosted)

```bash
# 1. Start Langfuse (Postgres, ClickHouse, Redis, MinIO — ~2 GB RAM)
docker compose -f docker-compose.langfuse.yml up -d

# 2. Wait ~60s for migrations, then open UI
open http://localhost:3002

# 3. Login (pre-seeded on first boot)
#    Email:    admin@acme-logistics-demo.example
#    Password: docask-admin-change-me   (see .env.example)

# 4. Enable tracing in DocAsk .env
LANGFUSE_ENABLED=true
LANGFUSE_PUBLIC_KEY=pk-lf-docask-demo
LANGFUSE_SECRET_KEY=sk-lf-docask-demo
LANGFUSE_BASE_URL=http://localhost:3002

# 5. Restart API and chat
pnpm dev
```

API keys are **pre-created** on first boot via `LANGFUSE_INIT_*` in `docker-compose.langfuse.yml` — the same keys go in your `.env`.

## Full stack (DocAsk + Langfuse + Chroma)

```bash
docker compose -f docker-compose.yml -f docker-compose.langfuse.yml up -d
```

| Service | URL |
|---------|-----|
| DocAsk UI | http://localhost:3000 |
| DocAsk API | http://localhost:3001 |
| **Langfuse UI** | http://localhost:3002 |
| Chroma | http://localhost:8000 |

When the API runs **inside Docker**, set in `.env`:

```env
LANGFUSE_BASE_URL=http://langfuse-web:3000
```

When the API runs **locally** (`pnpm dev`):

```env
LANGFUSE_BASE_URL=http://localhost:3002
```

## Why self-host?

| | Self-hosted | Langfuse Cloud |
|--|-------------|----------------|
| Cost | Free (your hardware) | Free tier, then paid |
| Data | Stays on your machine | Langfuse infrastructure |
| Setup | Docker Compose (~5 services) | Sign up + API keys |
| Best for | Portfolio, demos, NDA work | Managed prod without ops |

Langfuse is [open source](https://github.com/langfuse/langfuse) — same codebase as Cloud, running on your infrastructure.

## What gets traced

Each `POST /chat` creates a trace:

```
rag-policy-query (trace)
├── embed-query (span)
├── vector-retrieval (span)
└── llm-generation (generation)
```

Automatic eval scores: `latency_ms`, `citation_count`, `source_count`, `has_answer`, `grounded_citation`, `mentions_source_doc`.

Chat responses include `traceId` when Langfuse is enabled.

## Verify

```bash
curl http://localhost:3001/health
# "langfuse": "enabled"

curl -X POST http://localhost:3001/chat \
  -H 'Content-Type: application/json' \
  -d '{"question":"How many remote days are allowed per week?"}'
```

Open http://localhost:3002 → **Tracing** → find the trace by time or `traceId`.

## Evaluations

### Online (automatic)

Scores attach after every chat. In Langfuse UI: **Scores** tab on a trace, or aggregate in **Dashboards**.

### Offline (dataset)

1. **Datasets** → create `acme-policy-eval`
2. Add items with sample questions from the chat UI
3. **Dataset Runs** → compare LLM providers (OpenAI vs Ollama vs Gemini)

### LLM-as-judge

**Evaluators** → create evaluator → apply to traces or dataset runs.

Sample eval questions:

- How many remote days are allowed per week?
- What is the meal reimbursement limit?
- What are the password requirements?
- What happens on day one of onboarding?
- What is the live chat SLA response time?

## Configuration & secrets

Docker secrets are in `.env` (see `.env.example` Langfuse section). **Change defaults before sharing a VM:**

| Variable | Purpose |
|----------|---------|
| `LANGFUSE_INIT_USER_PASSWORD` | Langfuse UI login |
| `LANGFUSE_NEXTAUTH_SECRET` | Session encryption |
| `LANGFUSE_ENCRYPTION_KEY` | `openssl rand -hex 32` |
| `LANGFUSE_POSTGRES_PASSWORD` | Postgres |
| `LANGFUSE_PUBLIC_KEY` / `LANGFUSE_SECRET_KEY` | SDK keys (pre-seeded) |

Generate encryption key:

```bash
openssl rand -hex 32
```

## Resource usage

Self-hosted Langfuse runs 6 containers (web, worker, postgres, clickhouse, redis, minio). Expect **~2–4 GB RAM** idle. Fine for local portfolio demos; use Langfuse Cloud or Kubernetes for production HA.

## Disable tracing

```env
LANGFUSE_ENABLED=false
```

No external calls, no overhead.

## Architecture files

| File | Role |
|------|------|
| `docker-compose.langfuse.yml` | Self-hosted Langfuse stack |
| `src/instrumentation.ts` | OpenTelemetry bootstrap |
| `src/observability/langfuse.service.ts` | Scores + flush |
| `src/chat/chat.service.ts` | RAG trace spans |

## Troubleshooting

**UI not loading** — first boot takes 1–2 min for ClickHouse migrations. Check logs:

```bash
docker compose -f docker-compose.langfuse.yml logs -f langfuse-web
```

**Traces not appearing** — confirm `LANGFUSE_BASE_URL` matches how the API runs (localhost vs docker network). Test keys in Langfuse → Settings → API Keys.

**Port conflict on 3002** — change `LANGFUSE_HOST_PORT=3003` and update `NEXTAUTH_URL` / `LANGFUSE_BASE_URL` accordingly.
