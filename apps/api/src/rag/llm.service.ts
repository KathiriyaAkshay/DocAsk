import { Injectable, Logger, OnModuleInit } from '@nestjs/common';
import { startObservation } from '@langfuse/tracing';
import type { ChatMessage, Citation, RetrievedChunk } from '../common/types';
import { isLangfuseEnabled } from '../observability/langfuse.config';
import { createLlmProvider, getLlmProviderLabel } from './llm/llm-provider.factory';
import type { LlmProvider } from './llm/llm.types';

@Injectable()
export class LlmService implements OnModuleInit {
  private readonly logger = new Logger(LlmService.name);
  private provider!: LlmProvider;
  private providerName!: LlmProvider['name'];

  onModuleInit(): void {
    this.provider = createLlmProvider();
    this.providerName = this.provider.name;
    this.logger.log(`LLM provider: ${getLlmProviderLabel()}`);
  }

  async generateAnswer(
    question: string,
    contextChunks: RetrievedChunk[],
    history: ChatMessage[] = [],
  ): Promise<{ answer: string; citations: Citation[] }> {
    const context = contextChunks
      .map(
        (c, i) =>
          `[Source ${i + 1}] Document: ${c.documentName} | Section: ${c.section}\n${c.text}`,
      )
      .join('\n\n---\n\n');

    const systemPrompt = `You are the internal policy assistant for Acme Logistics Ltd (fictional demo company).
Answer employee questions using ONLY the provided policy excerpts.
If the answer is not in the context, say you could not find it in the available policies.
Be concise and professional. When citing, reference the document name and section.
At the end of your answer, include a "Sources:" line listing document name and section for each source you used.`;

    const userPrompt = `Context excerpts:\n\n${context}\n\n---\n\nQuestion: ${question}`;

    const openAiCompat = new Set(['openai', 'ollama', 'openrouter', 'openai-compatible']);
    const answer =
      isLangfuseEnabled() && !openAiCompat.has(this.providerName)
        ? await this.tracedComplete(systemPrompt, userPrompt, history)
        : await this.provider.complete(systemPrompt, userPrompt, history);

    const citations = this.buildCitations(contextChunks);

    return { answer, citations };
  }

  private async tracedComplete(
    system: string,
    user: string,
    history: ChatMessage[],
  ): Promise<string> {
    const generation = startObservation(
      'llm-generation',
      {
        model: getLlmProviderLabel(),
        input: {
          system,
          user,
          historyLength: history.length,
        },
      },
      { asType: 'generation' },
    );

    try {
      const answer = await this.provider.complete(system, user, history);
      generation.update({ output: answer }).end();
      return answer;
    } catch (error) {
      generation
        .update({
          level: 'ERROR',
          statusMessage: error instanceof Error ? error.message : 'Unknown error',
        })
        .end();
      throw error;
    }
  }

  private buildCitations(chunks: RetrievedChunk[]): Citation[] {
    const seen = new Set<string>();
    const citations: Citation[] = [];

    for (const chunk of chunks) {
      const key = `${chunk.documentName}::${chunk.section}`;
      if (seen.has(key)) continue;
      seen.add(key);
      citations.push({
        documentName: chunk.documentName,
        section: chunk.section,
        excerpt: chunk.text.slice(0, 200) + (chunk.text.length > 200 ? '…' : ''),
      });
    }

    return citations;
  }
}
