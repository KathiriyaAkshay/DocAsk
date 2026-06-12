import { Controller, Get, Post } from '@nestjs/common';
import { getEmbeddingProviderLabel } from '../config/embedding.config';
import { getLlmProviderLabel } from '../rag/llm/llm-provider.factory';
import { LangfuseService } from '../observability/langfuse.service';
import { IngestService } from '../ingest/ingest.service';
import { VectorStoreService } from '../rag/vector-store.service';
import type { HealthResponse, IngestResult } from '../common/types';

@Controller()
export class HealthController {
  constructor(
    private readonly vectorStore: VectorStoreService,
    private readonly ingestService: IngestService,
    private readonly langfuse: LangfuseService,
  ) {}

  @Get('health')
  async health(): Promise<HealthResponse> {
    const chromaOk = await this.vectorStore.ping();
    let documentsIndexed = 0;

    try {
      documentsIndexed = await this.vectorStore.count();
    } catch {
      documentsIndexed = 0;
    }

    return {
      status: chromaOk ? 'ok' : 'degraded',
      chroma: chromaOk ? 'connected' : 'disconnected',
      documentsIndexed,
      llm: getLlmProviderLabel(),
      embeddings: getEmbeddingProviderLabel(),
      langfuse: this.langfuse.isEnabled() ? 'enabled' : 'disabled',
      timestamp: new Date().toISOString(),
    };
  }

  @Post('ingest')
  async ingest(): Promise<IngestResult> {
    return this.ingestService.ingestAll(true);
  }
}
