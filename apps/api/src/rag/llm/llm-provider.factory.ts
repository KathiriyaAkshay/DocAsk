import { resolveLlmConfig } from '../../config/llm.config';
import { AnthropicLlmProvider } from './anthropic.llm-provider';
import { GeminiLlmProvider } from './gemini.llm-provider';
import { OpenAiCompatibleLlmProvider } from './openai-compatible.llm-provider';
import type { LlmProvider } from './llm.types';

const OPENAI_COMPAT_PROVIDERS = new Set(['openai', 'ollama', 'openrouter', 'openai-compatible']);

export function createLlmProvider(): LlmProvider {
  const config = resolveLlmConfig();

  if (config.provider === 'anthropic') {
    return new AnthropicLlmProvider(config);
  }

  if (config.provider === 'gemini') {
    return new GeminiLlmProvider(config);
  }

  if (OPENAI_COMPAT_PROVIDERS.has(config.provider)) {
    return new OpenAiCompatibleLlmProvider(config, config.provider);
  }

  throw new Error(`Unsupported LLM provider: ${config.provider}`);
}

export function getLlmProviderLabel(): string {
  const config = resolveLlmConfig();
  return `${config.provider} (${config.model})`;
}
