import type { LlmProviderName } from '../rag/llm/llm.types';

export interface AppConfig {
  port: number;
  corsOrigin: string;
  llmProvider: string;
  embeddingProvider: 'openai' | 'openai-compatible';
  openai: {
    apiKey: string;
    chatModel: string;
    embeddingModel: string;
  };
  anthropic: {
    apiKey: string;
    chatModel: string;
  };
  chroma: {
    host: string;
    port: number;
    collection: string;
  };
  rag: {
    chunkSize: number;
    chunkOverlap: number;
    topK: number;
  };
  sampleDataPath: string;
}

export default (): AppConfig => ({
  port: parseInt(process.env.API_PORT ?? '3001', 10),
  corsOrigin: process.env.API_CORS_ORIGIN ?? 'http://localhost:3000',
  llmProvider: (process.env.LLM_PROVIDER ?? 'openai').trim().toLowerCase() as LlmProviderName,
  embeddingProvider: (process.env.EMBEDDING_PROVIDER ?? 'openai').trim() as
    | 'openai'
    | 'openai-compatible',
  openai: {
    apiKey: process.env.OPENAI_API_KEY ?? '',
    chatModel: process.env.OPENAI_CHAT_MODEL ?? 'gpt-4o-mini',
    embeddingModel: process.env.OPENAI_EMBEDDING_MODEL ?? 'text-embedding-3-small',
  },
  anthropic: {
    apiKey: process.env.ANTHROPIC_API_KEY ?? '',
    chatModel: process.env.ANTHROPIC_CHAT_MODEL ?? 'claude-sonnet-4-20250514',
  },
  chroma: {
    host: process.env.CHROMA_HOST ?? 'localhost',
    port: parseInt(process.env.CHROMA_PORT ?? '8000', 10),
    collection: process.env.CHROMA_COLLECTION ?? 'acme_policies',
  },
  rag: {
    chunkSize: parseInt(process.env.CHUNK_SIZE ?? '600', 10),
    chunkOverlap: parseInt(process.env.CHUNK_OVERLAP ?? '100', 10),
    topK: parseInt(process.env.RETRIEVAL_TOP_K ?? '5', 10),
  },
  sampleDataPath: process.env.SAMPLE_DATA_PATH ?? '',
});
