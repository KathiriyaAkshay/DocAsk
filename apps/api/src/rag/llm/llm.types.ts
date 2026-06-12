import type { ChatMessage } from '../../common/types';

export type LlmProviderName =
  | 'openai'
  | 'anthropic'
  | 'gemini'
  | 'ollama'
  | 'openrouter'
  | 'openai-compatible';

export interface ResolvedLlmConfig {
  provider: LlmProviderName;
  apiKey: string;
  model: string;
  baseUrl?: string;
}

export interface LlmProvider {
  readonly name: LlmProviderName;
  complete(system: string, user: string, history: ChatMessage[]): Promise<string>;
}
