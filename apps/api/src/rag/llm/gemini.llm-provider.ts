import { GoogleGenerativeAI } from '@google/generative-ai';
import type { ChatMessage } from '../../common/types';
import type { LlmProvider, ResolvedLlmConfig } from './llm.types';

export class GeminiLlmProvider implements LlmProvider {
  readonly name = 'gemini' as const;
  private readonly model: ReturnType<GoogleGenerativeAI['getGenerativeModel']>;

  constructor(config: ResolvedLlmConfig) {
    const genAI = new GoogleGenerativeAI(config.apiKey);
    this.model = genAI.getGenerativeModel({ model: config.model });
  }

  async complete(system: string, user: string, history: ChatMessage[]): Promise<string> {
    const historyText = history
      .map((m) => `${m.role === 'user' ? 'User' : 'Assistant'}: ${m.content}`)
      .join('\n');

    const prompt = [
      system,
      historyText ? `\nConversation so far:\n${historyText}` : '',
      `\nUser: ${user}`,
      '\nAssistant:',
    ]
      .filter(Boolean)
      .join('\n');

    const result = await this.model.generateContent({
      contents: [{ role: 'user', parts: [{ text: prompt }] }],
      generationConfig: {
        temperature: 0.2,
        maxOutputTokens: 1024,
      },
    });

    return result.response.text()?.trim() ?? 'No response generated.';
  }
}
