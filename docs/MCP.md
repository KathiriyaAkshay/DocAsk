# DocAsk MCP Server

Expose DocAsk as an [MCP](https://modelcontextprotocol.io) server so Claude Desktop, Cursor, and other MCP clients can query your indexed policy documents with citations.

## Prerequisites

1. DocAsk API running and healthy (`curl http://localhost:3001/health`)
2. Documents seeded (`pnpm seed` or `make docker-seed`)

## Build

```bash
pnpm mcp:build
```

## Tools

| Tool | Description |
|------|-------------|
| `ask_policy` | Ask a natural-language question; returns RAG answer + citations |
| `docask_health` | Check API / Chroma status and document count |
| `docask_reingest` | Re-parse and re-embed all sample PDFs |

## Cursor

This repo includes a project config at [`.cursor/mcp.json`](../.cursor/mcp.json).

1. Build the server: `pnpm mcp:build`
2. Ensure the API is up on port 3001
3. Open **Cursor Settings → MCP** — the `docask` server should appear
4. In Agent/Chat, the model can call `ask_policy` when you ask about company policies

To use globally, add to `~/.cursor/mcp.json`:

```json
{
  "mcpServers": {
    "docask": {
      "command": "node",
      "args": ["/absolute/path/to/RAG demo/apps/mcp/dist/index.js"],
      "env": {
        "DOCASK_API_URL": "http://127.0.0.1:3001"
      }
    }
  }
}
```

## Claude Desktop

Add to your Claude Desktop config:

- **macOS:** `~/Library/Application Support/Claude/claude_desktop_config.json`
- **Linux:** `~/.config/Claude/claude_desktop_config.json`
- **Windows:** `%APPDATA%\Claude\claude_desktop_config.json`

```json
{
  "mcpServers": {
    "docask": {
      "command": "node",
      "args": ["/absolute/path/to/RAG demo/apps/mcp/dist/index.js"],
      "env": {
        "DOCASK_API_URL": "http://127.0.0.1:3001"
      }
    }
  }
}
```

Restart Claude Desktop after saving.

## Environment

| Variable | Default | Description |
|----------|---------|-------------|
| `DOCASK_API_URL` | `http://127.0.0.1:3001` | Base URL of the DocAsk NestJS API |

## Local development

```bash
pnpm mcp:dev   # run via tsx (stdio — logs go to stderr)
```

## Example prompt (in any MCP client)

> Use the `ask_policy` tool: What is Acme's expense reimbursement deadline?

The client will call DocAsk, retrieve relevant chunks from Chroma, and return a cited answer.
