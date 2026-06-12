import OpenAI from 'openai';
import { observeOpenAI } from '@langfuse/openai';
import type { ChatMessage } from '../../common/types';
import { isLangfuseEnabled } from '../../observability/langfuse.config';
import type { LlmProvider, LlmProviderName, ResolvedLlmConfig } from './llm.types';

export class OpenAiCompatibleLlmProvider implements LlmProvider {
  readonly name: LlmProviderName;
  private readonly client: OpenAI;
  private readonly model: string;

  constructor(config: ResolvedLlmConfig, name: LlmProviderName = 'openai-compatible') {
    this.name = name;
    this.model = config.model;

    const rawClient = new OpenAI({
      apiKey: config.apiKey,
      baseURL: config.baseUrl,
      ...(name === 'openrouter' && {
        defaultHeaders: {
          'HTTP-Referer': process.env.OPENROUTER_REFERER ?? 'http://localhost:3000',
          'X-Title': process.env.OPENROUTER_APP_NAME ?? 'DocAsk Demo',
        },
      }),
    });

    this.client = isLangfuseEnabled()
      ? observeOpenAI(rawClient, {
          generationName: `docask-${name}`,
          tags: ['docask', 'rag', name],
        })
      : rawClient;
  }

  async complete(system: string, user: string, history: ChatMessage[]): Promise<string> {
    const messages: OpenAI.Chat.ChatCompletionMessageParam[] = [
      { role: 'system', content: system },
      ...history.map((m) => ({ role: m.role, content: m.content })),
      { role: 'user', content: user },
    ];

    const response = await this.client.chat.completions.create({
      model: this.model,
      messages,
      temperature: 0.2,
      max_tokens: 1024,
    });

    return response.choices[0]?.message?.content?.trim() ?? 'No response generated.';
  }
}
