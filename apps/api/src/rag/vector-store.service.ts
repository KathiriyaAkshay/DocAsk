import { Injectable, Logger } from '@nestjs/common';
import { ChromaClient, Collection, IncludeEnum } from 'chromadb';
import { resolveChromaConfig } from '../config/chroma.config';
import type { RetrievedChunk, TextChunk } from '../common/types';

@Injectable()
export class VectorStoreService {
  private readonly logger = new Logger(VectorStoreService.name);
  private client: ChromaClient | null = null;

  private getClient(): ChromaClient {
    if (!this.client) {
      const { host, port } = resolveChromaConfig();
      this.client = new ChromaClient({ path: `http://${host}:${port}` });
      this.logger.log(`Chroma client → http://${host}:${port}`);
    }
    return this.client;
  }

  /** Resolve by name each call — avoids stale UUID after collection delete/re-seed. */
  private async getCollection(): Promise<Collection> {
    const { collection } = resolveChromaConfig();
    return this.getClient().getOrCreateCollection({
      name: collection,
      metadata: { description: 'Acme Logistics policy documents (demo)' },
    });
  }

  async resetCollection(): Promise<void> {
    const { collection } = resolveChromaConfig();
    try {
      await this.getClient().deleteCollection({ name: collection });
    } catch {
      // Collection may not exist yet
    }
    await this.getCollection();
    this.logger.log(`Reset Chroma collection "${collection}"`);
  }

  async upsertChunks(chunks: TextChunk[], embeddings: number[][]): Promise<void> {
    if (chunks.length === 0) return;

    const collection = await this.getCollection();
    await collection.upsert({
      ids: chunks.map((c) => c.id),
      documents: chunks.map((c) => c.text),
      embeddings,
      metadatas: chunks.map((c) => ({
        documentName: c.documentName,
        section: c.section,
        chunkIndex: c.chunkIndex,
      })),
    });

    this.logger.log(`Upserted ${chunks.length} chunks into vector store`);
  }

  async query(embedding: number[], topK: number): Promise<RetrievedChunk[]> {
    const collection = await this.getCollection();

    const result = await collection.query({
      queryEmbeddings: [embedding],
      nResults: topK,
      include: [IncludeEnum.Documents, IncludeEnum.Metadatas, IncludeEnum.Distances],
    });

    const ids = result.ids[0] ?? [];
    const documents = result.documents[0] ?? [];
    const metadatas = result.metadatas[0] ?? [];
    const distances = result.distances?.[0] ?? [];

    return ids.map((id, i) => {
      const meta = metadatas[i] as Record<string, string | number> | null;
      const distance = distances[i] ?? 1;
      return {
        id,
        text: documents[i] ?? '',
        documentName: String(meta?.documentName ?? 'unknown'),
        section: String(meta?.section ?? 'General'),
        chunkIndex: Number(meta?.chunkIndex ?? 0),
        score: 1 - distance,
      };
    });
  }

  async count(): Promise<number> {
    const collection = await this.getCollection();
    return collection.count();
  }

  async ping(): Promise<boolean> {
    try {
      await this.getClient().heartbeat();
      return true;
    } catch {
      return false;
    }
  }
}
