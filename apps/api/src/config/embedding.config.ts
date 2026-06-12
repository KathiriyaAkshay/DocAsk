export type EmbeddingProviderName = 'openai' | 'openai-compatible';

export interface ResolvedEmbeddingConfig {
  provider: EmbeddingProviderName;
  apiKey: string;
  model: string;
  baseUrl: string;
}

function firstDefined(...values: Array<string | undefined>): string {
  for (const value of values) {
    if (value?.trim()) return value.trim();
  }
  return '';
}

export function resolveEmbeddingConfig(): ResolvedEmbeddingConfig {
  const raw = (process.env.EMBEDDING_PROVIDER ?? 'openai').trim().toLowerCase();

  if (raw !== 'openai' && raw !== 'openai-compatible') {
    throw new Error(
      `Invalid EMBEDDING_PROVIDER "${raw}". Use: openai, openai-compatible`,
    );
  }

  const provider = raw as EmbeddingProviderName;

  if (provider === 'openai') {
    const apiKey = firstDefined(process.env.OPENAI_API_KEY);
    const model = firstDefined(
      process.env.EMBEDDING_MODEL,
      process.env.OPENAI_EMBEDDING_MODEL,
      'text-embedding-3-small',
    );
    const baseUrl = firstDefined(
      process.env.EMBEDDING_BASE_URL,
      'https://api.openai.com/v1',
    );

    if (!apiKey) {
      throw new Error(
        'OPENAI_API_KEY is required when EMBEDDING_PROVIDER=openai',
      );
    }

    return { provider, apiKey, model, baseUrl };
  }

  // openai-compatible — Ollama, LM Studio, vLLM, etc.
  const baseUrl = firstDefined(
    process.env.EMBEDDING_BASE_URL,
    'http://localhost:11434/v1',
  );
  const model = firstDefined(process.env.EMBEDDING_MODEL, 'nomic-embed-text');
  const apiKey = firstDefined(process.env.EMBEDDING_API_KEY, 'ollama');

  return { provider, apiKey, model, baseUrl };
}

export function getEmbeddingProviderLabel(): string {
  const config = resolveEmbeddingConfig();
  return `${config.provider} (${config.model})`;
}
