import { Module } from '@nestjs/common';
import { ChunkingService } from './chunking.service';
import { EmbeddingService } from './embedding.service';
import { LlmService } from './llm.service';
import { VectorStoreService } from './vector-store.service';

@Module({
  providers: [ChunkingService, EmbeddingService, VectorStoreService, LlmService],
  exports: [ChunkingService, EmbeddingService, VectorStoreService, LlmService],
})
export class RagModule {}
