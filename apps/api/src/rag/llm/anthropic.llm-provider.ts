import Anthropic from '@anthropic-ai/sdk';
import type { ChatMessage } from '../../common/types';
import type { LlmProvider, ResolvedLlmConfig } from './llm.types';

export class AnthropicLlmProvider implements LlmProvider {
  readonly name = 'anthropic' as const;
  private readonly client: Anthropic;
  private readonly model: string;

  constructor(config: ResolvedLlmConfig) {
    this.client = new Anthropic({ apiKey: config.apiKey });
    this.model = config.model;
  }

  async complete(system: string, user: string, history: ChatMessage[]): Promise<string> {
    const messages: Anthropic.MessageParam[] = [
      ...history.map((m) => ({
        role: m.role as 'user' | 'assistant',
        content: m.content,
      })),
      { role: 'user', content: user },
    ];

    const response = await this.client.messages.create({
      model: this.model,
      max_tokens: 1024,
      system,
      messages,
    });

    const textBlock = response.content.find((b) => b.type === 'text');
    return textBlock && 'text' in textBlock ? textBlock.text.trim() : 'No response generated.';
  }
}
