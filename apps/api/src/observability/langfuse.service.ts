import {
  Injectable,
  Logger,
  OnModuleDestroy,
  OnModuleInit,
} from '@nestjs/common';
import { LangfuseClient } from '@langfuse/client';
import { getActiveTraceId } from '@langfuse/tracing';
import type { ChatResponse } from '../common/types';
import { getLlmProviderLabel } from '../rag/llm/llm-provider.factory';
import { getLangfuseConfig, isLangfuseEnabled } from './langfuse.config';
import { spanProcessor } from '../instrumentation';

@Injectable()
export class LangfuseService implements OnModuleInit, OnModuleDestroy {
  private readonly logger = new Logger(LangfuseService.name);
  private client: LangfuseClient | null = null;

  onModuleInit(): void {
    if (!this.isEnabled()) return;

    this.client = new LangfuseClient(getLangfuseConfig());
    this.logger.log('Langfuse client ready for scores and datasets');
  }

  async onModuleDestroy(): Promise<void> {
    await this.flush();
  }

  isEnabled(): boolean {
    return isLangfuseEnabled();
  }

  getActiveTraceId(): string | undefined {
    if (!this.isEnabled()) return undefined;
    return getActiveTraceId();
  }

  /** Attach lightweight eval scores to the current trace (visible in Langfuse Evals). */
  async scoreRagResponse(
    question: string,
    response: ChatResponse,
    latencyMs: number,
  ): Promise<void> {
    if (!this.client) return;

    const citationCount = response.citations.length;
    const sourceCount = response.sources.length;
    const hasAnswer = response.answer.trim().length > 0;
    const citesRetrievedDoc = response.citations.some((c) =>
      response.answer.toLowerCase().includes(c.documentName.replace(/-/g, ' ').split('.')[0] ?? ''),
    );

    const scores = [
      { name: 'latency_ms', value: latencyMs, dataType: 'NUMERIC' as const },
      { name: 'citation_count', value: citationCount, dataType: 'NUMERIC' as const },
      { name: 'source_count', value: sourceCount, dataType: 'NUMERIC' as const },
      { name: 'has_answer', value: hasAnswer ? 1 : 0, dataType: 'BOOLEAN' as const },
      {
        name: 'grounded_citation',
        value: citationCount > 0 && hasAnswer ? 1 : 0,
        dataType: 'BOOLEAN' as const,
      },
      {
        name: 'mentions_source_doc',
        value: citesRetrievedDoc ? 1 : 0,
        dataType: 'BOOLEAN' as const,
      },
    ];

    for (const score of scores) {
      this.client.score.activeTrace({
        name: score.name,
        value: score.value,
        dataType: score.dataType,
        comment: `Q: ${question.slice(0, 120)}`,
      });
    }
  }

  async flush(): Promise<void> {
    if (spanProcessor) {
      await spanProcessor.forceFlush();
    }
    if (this.client) {
      await this.client.flush();
    }
  }

  getTraceMetadata(): Record<string, string | number> {
    return {
      llm: getLlmProviderLabel(),
      app: 'docask-demo',
    };
  }
}
