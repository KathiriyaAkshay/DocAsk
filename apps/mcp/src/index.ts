#!/usr/bin/env node
import { McpServer } from '@modelcontextprotocol/sdk/server/mcp.js';
import { StdioServerTransport } from '@modelcontextprotocol/sdk/server/stdio.js';
import { z } from 'zod';
import { DocAskClient, resolveApiUrl } from './client.js';

const client = new DocAskClient(resolveApiUrl());

function formatAskResult(result: Awaited<ReturnType<DocAskClient['ask']>>): string {
  const lines = [result.answer, ''];

  if (result.citations.length > 0) {
    lines.push('## Citations');
    for (const c of result.citations) {
      lines.push(`- **${c.documentName}** — ${c.section}`);
      lines.push(`  > ${c.excerpt}`);
    }
  }

  if (result.traceId) {
    lines.push('', `_Langfuse trace: ${result.traceId}_`);
  }

  return lines.join('\n');
}

const server = new McpServer({
  name: 'docask',
  version: '1.0.0',
});

server.registerTool(
  'ask_policy',
  {
    title: 'Ask company policy',
    description:
      'Ask a natural-language question about Acme Logistics internal policies (HR, expenses, IT security, etc.). ' +
      'Uses RAG over indexed PDFs and returns an answer with document citations.',
    inputSchema: {
      question: z
        .string()
        .min(1)
        .describe('The policy question to answer, e.g. "How many vacation days do full-time employees get?"'),
    },
  },
  async ({ question }) => {
    const result = await client.ask(question);
    return {
      content: [{ type: 'text', text: formatAskResult(result) }],
    };
  },
);

server.registerTool(
  'docask_health',
  {
    title: 'DocAsk health check',
    description:
      'Check whether the DocAsk API, Chroma vector store, and indexed document count are healthy.',
    inputSchema: {},
  },
  async () => {
    const health = await client.health();
    return {
      content: [
        {
          type: 'text',
          text: [
            `Status: ${health.status}`,
            `Chroma: ${health.chroma}`,
            `Documents indexed: ${health.documentsIndexed}`,
            `LLM: ${health.llm}`,
            `Embeddings: ${health.embeddings}`,
            `Langfuse: ${health.langfuse}`,
            `Checked at: ${health.timestamp}`,
            `API URL: ${resolveApiUrl()}`,
          ].join('\n'),
        },
      ],
    };
  },
);

server.registerTool(
  'docask_reingest',
  {
    title: 'Re-ingest policy documents',
    description:
      'Re-parse and re-embed all sample PDFs into Chroma. Use after changing documents or embedding settings.',
    inputSchema: {},
  },
  async () => {
    const result = await client.ingest();
    return {
      content: [
        {
          type: 'text',
          text: [
            'Ingest complete.',
            `Documents processed: ${result.documentsProcessed}`,
            `Chunks indexed: ${result.chunksIndexed}`,
            `Collection: ${result.collection}`,
          ].join('\n'),
        },
      ],
    };
  },
);

async function main(): Promise<void> {
  const transport = new StdioServerTransport();
  await server.connect(transport);
  console.error(`DocAsk MCP server ready (API: ${resolveApiUrl()})`);
}

main().catch((err) => {
  console.error('DocAsk MCP server failed:', err);
  process.exit(1);
});
