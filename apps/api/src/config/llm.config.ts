import type { LlmProviderName, ResolvedLlmConfig } from '../rag/llm/llm.types';

interface ProviderPreset {
  baseUrl?: string;
  defaultModel: string;
  apiKeyOptional?: boolean;
}

const PROVIDER_PRESETS: Record<LlmProviderName, ProviderPreset> = {
  openai: {
    baseUrl: 'https://api.openai.com/v1',
    defaultModel: 'gpt-4o-mini',
  },
  anthropic: {
    defaultModel: 'claude-sonnet-4-20250514',
  },
  gemini: {
    defaultModel: 'gemini-2.0-flash',
  },
  ollama: {
    baseUrl: 'http://localhost:11434/v1',
    defaultModel: 'llama3.1',
    apiKeyOptional: true,
  },
  openrouter: {
    baseUrl: 'https://openrouter.ai/api/v1',
    defaultModel: 'openai/gpt-4o-mini',
  },
  'openai-compatible': {
    defaultModel: 'default',
  },
};

const VALID_PROVIDERS = new Set<string>(Object.keys(PROVIDER_PRESETS));

function firstDefined(...values: Array<string | undefined>): string {
  for (const value of values) {
    if (value?.trim()) return value.trim();
  }
  return '';
}

function resolveApiKey(provider: LlmProviderName): string {
  const unified = process.env.LLM_API_KEY?.trim();
  if (unified) return unified;

  switch (provider) {
    case 'openai':
      return firstDefined(process.env.OPENAI_API_KEY);
    case 'anthropic':
      return firstDefined(process.env.ANTHROPIC_API_KEY);
    case 'gemini':
      return firstDefined(process.env.GOOGLE_API_KEY, process.env.GEMINI_API_KEY);
    case 'openrouter':
      return firstDefined(process.env.OPENROUTER_API_KEY, process.env.OPENAI_API_KEY);
    case 'ollama':
      return 'ollama';
    case 'openai-compatible':
      return firstDefined(process.env.LLM_API_KEY, process.env.OPENAI_API_KEY, 'local');
    default:
      return '';
  }
}

function resolveModel(provider: LlmProviderName, preset: ProviderPreset): string {
  return firstDefined(
    process.env.LLM_MODEL,
    provider === 'openai' ? process.env.OPENAI_CHAT_MODEL : undefined,
    provider === 'anthropic' ? process.env.ANTHROPIC_CHAT_MODEL : undefined,
    provider === 'gemini' ? process.env.GEMINI_MODEL : undefined,
    preset.defaultModel,
  );
}

export function resolveLlmConfig(): ResolvedLlmConfig {
  const rawProvider = (process.env.LLM_PROVIDER ?? 'openai').trim().toLowerCase();

  if (!VALID_PROVIDERS.has(rawProvider)) {
    throw new Error(
      `Invalid LLM_PROVIDER "${rawProvider}". Use: ${[...VALID_PROVIDERS].join(', ')}`,
    );
  }

  const provider = rawProvider as LlmProviderName;
  const preset = PROVIDER_PRESETS[provider];
  const apiKey = resolveApiKey(provider);
  const model = resolveModel(provider, preset);
  const baseUrl = firstDefined(process.env.LLM_BASE_URL, preset.baseUrl) || undefined;

  if (provider === 'openai-compatible' && !baseUrl) {
    throw new Error('LLM_BASE_URL is required when LLM_PROVIDER=openai-compatible');
  }

  if (!preset.apiKeyOptional && !apiKey) {
    throw new Error(`API key missing for LLM_PROVIDER=${provider}. Set LLM_API_KEY or the provider-specific key.`);
  }

  if (!model) {
    throw new Error(`Model missing for LLM_PROVIDER=${provider}. Set LLM_MODEL or the provider-specific model env.`);
  }

  return { provider, apiKey, model, baseUrl };
}
