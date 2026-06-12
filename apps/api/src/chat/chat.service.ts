import { Injectable, BadRequestException } from '@nestjs/common';
import { startActiveObservation, startObservation } from '@langfuse/tracing';
import { resolveRagConfig } from '../config/rag.config';
import type { ChatRequest, ChatResponse } from '../common/types';
import { LangfuseService } from '../observability/langfuse.service';
import { EmbeddingService } from '../rag/embedding.service';
import { LlmService } from '../rag/llm.service';
import { VectorStoreService } from '../rag/vector-store.service';

@Injectable()
export class ChatService {
  constructor(
    private readonly embedding: EmbeddingService,
    private readonly vectorStore: VectorStoreService,
    private readonly llm: LlmService,
    private readonly langfuse: LangfuseService,
  ) {}

  async ask(request: ChatRequest): Promise<ChatResponse> {
    if (!this.langfuse.isEnabled()) {
      return this.executeRagPipeline(request);
    }

    const startedAt = Date.now();

    return startActiveObservation(
      'rag-policy-query',
      async (trace) => {
        trace.update({
          input: {
            question: request.question,
            historyLength: request.history?.length ?? 0,
          },
          metadata: this.langfuse.getTraceMetadata(),
        });

        try {
          const response = await this.executeRagPipeline(request);
          const latencyMs = Date.now() - startedAt;

          trace.update({
            output: {
              answer: response.answer,
              citationCount: response.citations.length,
              sourceCount: response.sources.length,
              latencyMs,
            },
          });

          await this.langfuse.scoreRagResponse(request.question, response, latencyMs);
          await this.langfuse.flush();

          return {
            ...response,
            traceId: this.langfuse.getActiveTraceId(),
          };
        } catch (error) {
          trace.update({
            level: 'ERROR',
            statusMessage: error instanceof Error ? error.message : 'Unknown error',
          });
          throw error;
        }
      },
      { asType: 'span' },
    );
  }

  private async executeRagPipeline(request: ChatRequest): Promise<ChatResponse> {
    const question = request.question?.trim();
    if (!question) {
      throw new BadRequestException('Question is required');
    }

    const count = await this.vectorStore.count();
    if (count === 0) {
      throw new BadRequestException(
        'Vector index is empty. Run "pnpm seed" to ingest policy documents.',
      );
    }

    const queryEmbedding = await this.traceStep(
      'embed-query',
      { question },
      () => this.embedding.embedQuery(question),
      (embedding) => ({ dimensions: embedding.length }),
    );

    const sources = await this.traceStep(
      'vector-retrieval',
      { question, topK: resolveRagConfig().topK },
      () => this.vectorStore.query(queryEmbedding, resolveRagConfig().topK),
      (chunks) => ({
        sourceCount: chunks.length,
        documents: [...new Set(chunks.map((c) => c.documentName))],
      }),
    );

    const { answer, citations } = await this.llm.generateAnswer(
      question,
      sources,
      request.history ?? [],
    );

    return { answer, citations, sources };
  }

  private async traceStep<TInput, TOutput>(
    name: string,
    input: TInput,
    fn: () => Promise<TOutput>,
    formatOutput?: (result: TOutput) => unknown,
  ): Promise<TOutput> {
    if (!this.langfuse.isEnabled()) {
      return fn();
    }

    const span = startObservation(name, { input }, { asType: 'span' });
    try {
      const result = await fn();
      span.update({ output: formatOutput ? formatOutput(result) : result }).end();
      return result;
    } catch (error) {
      span
        .update({
          level: 'ERROR',
          statusMessage: error instanceof Error ? error.message : 'Unknown error',
        })
        .end();
      throw error;
    }
  }
}
