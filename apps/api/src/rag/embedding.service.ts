import { Injectable, Logger, OnModuleInit } from '@nestjs/common';
import OpenAI from 'openai';
import {
  getEmbeddingProviderLabel,
  resolveEmbeddingConfig,
  type ResolvedEmbeddingConfig,
} from '../config/embedding.config';

@Injectable()
export class EmbeddingService implements OnModuleInit {
  private readonly logger = new Logger(EmbeddingService.name);
  private readonly config: ResolvedEmbeddingConfig;
  private readonly client: OpenAI;

  constructor() {
    this.config = resolveEmbeddingConfig();
    this.client = new OpenAI({
      apiKey: this.config.apiKey,
      baseURL: this.config.baseUrl,
    });
  }

  onModuleInit(): void {
    this.logger.log(
      `Embedding provider: ${getEmbeddingProviderLabel()} @ ${this.config.baseUrl}`,
    );
  }

  async embedTexts(texts: string[]): Promise<number[][]> {
    if (texts.length === 0) return [];

    const batchSize = 50;
    const allEmbeddings: number[][] = [];

    for (let i = 0; i < texts.length; i += batchSize) {
      const batch = texts.slice(i, i + batchSize);
      const response = await this.client.embeddings.create({
        model: this.config.model,
        input: batch,
      });

      const sorted = [...response.data].sort((a, b) => a.index - b.index);
      allEmbeddings.push(...sorted.map((item) => item.embedding));
    }

    this.logger.log(`Embedded ${texts.length} chunks`);
    return allEmbeddings;
  }

  async embedQuery(text: string): Promise<number[]> {
    const [embedding] = await this.embedTexts([text]);
    if (!embedding) {
      throw new Error('Failed to embed query');
    }
    return embedding;
  }
}
