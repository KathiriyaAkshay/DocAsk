import { Injectable, Logger } from '@nestjs/common';
import * as fs from 'fs';
import * as path from 'path';
import pdf from 'pdf-parse';
import { resolveChromaConfig } from '../config/chroma.config';
import type { IngestResult, TextChunk } from '../common/types';
import { ChunkingService } from '../rag/chunking.service';
import { EmbeddingService } from '../rag/embedding.service';
import { VectorStoreService } from '../rag/vector-store.service';

@Injectable()
export class IngestService {
  private readonly logger = new Logger(IngestService.name);

  constructor(
    private readonly chunking: ChunkingService,
    private readonly embedding: EmbeddingService,
    private readonly vectorStore: VectorStoreService,
  ) {}

  resolveSampleDataDir(): string {
    const configured = process.env.SAMPLE_DATA_PATH?.trim();
    if (configured) {
      return path.resolve(configured);
    }
    return path.resolve(process.cwd(), '../../sample-data/pdfs');
  }

  async ingestAll(reset = true): Promise<IngestResult> {
    const dataDir = this.resolveSampleDataDir();

    if (!fs.existsSync(dataDir)) {
      throw new Error(
        `Sample data directory not found: ${dataDir}. Run "pnpm generate-pdfs" first.`,
      );
    }

    const pdfFiles = fs
      .readdirSync(dataDir)
      .filter((f) => f.endsWith('.pdf'))
      .sort();

    if (pdfFiles.length === 0) {
      throw new Error(`No PDF files found in ${dataDir}. Run "pnpm generate-pdfs" first.`);
    }

    if (reset) {
      await this.vectorStore.resetCollection();
    }

    const allChunks: TextChunk[] = [];

    for (const file of pdfFiles) {
      const filePath = path.join(dataDir, file);
      const buffer = fs.readFileSync(filePath);
      const parsed = await pdf(buffer);
      const documentName = file.replace(/\.pdf$/i, '');

      const sections = this.extractSections(parsed.text);
      const chunks = this.chunking.chunkDocument(parsed.text, documentName, sections);
      allChunks.push(...chunks);
      this.logger.log(`Parsed ${file}: ${chunks.length} chunks`);
    }

    const embeddings = await this.embedding.embedTexts(allChunks.map((c) => c.text));
    await this.vectorStore.upsertChunks(allChunks, embeddings);

    return {
      documentsProcessed: pdfFiles.length,
      chunksIndexed: allChunks.length,
      collection: resolveChromaConfig().collection,
    };
  }

  private extractSections(text: string): Array<{ title: string; body: string }> {
    const lines = text.split('\n').map((l) => l.trim()).filter(Boolean);
    const sections: Array<{ title: string; body: string }> = [];
    let currentTitle = 'General';
    let bodyLines: string[] = [];

    const flush = () => {
      if (bodyLines.length > 0 || currentTitle !== 'General') {
        sections.push({ title: currentTitle, body: bodyLines.join('\n') });
      }
      bodyLines = [];
    };

    for (const line of lines) {
      if (/^\d+\.\s/.test(line) && line.length < 120) {
        flush();
        currentTitle = line;
      } else if (
        !line.includes('Fictional Demo Document') &&
        !line.includes('Acme Logistics Ltd') &&
        !line.toLowerCase().includes('effective date')
      ) {
        bodyLines.push(line);
      }
    }
    flush();

    return sections.filter((s) => s.body.trim().length > 0);
  }
}
