import { Injectable } from '@nestjs/common';
import { resolveRagConfig } from '../config/rag.config';
import type { TextChunk } from '../common/types';

@Injectable()
export class ChunkingService {
  chunkDocument(
    text: string,
    documentName: string,
    sections: Array<{ title: string; body: string }>,
  ): TextChunk[] {
    const chunks: TextChunk[] = [];
    const { chunkSize, chunkOverlap } = resolveRagConfig();
    let globalIndex = 0;

    for (const section of sections) {
      const sectionText = `${section.title}\n\n${section.body}`.trim();
      const sectionChunks = this.splitWithOverlap(sectionText, chunkSize, chunkOverlap);

      for (const chunkText of sectionChunks) {
        chunks.push({
          id: `${documentName}::${globalIndex}`,
          text: chunkText,
          documentName,
          section: section.title,
          chunkIndex: globalIndex,
        });
        globalIndex += 1;
      }
    }

    if (chunks.length === 0 && text.trim()) {
      const fallback = this.splitWithOverlap(text, chunkSize, chunkOverlap);
      fallback.forEach((chunkText, i) => {
        chunks.push({
          id: `${documentName}::${i}`,
          text: chunkText,
          documentName,
          section: 'General',
          chunkIndex: i,
        });
      });
    }

    return chunks;
  }

  private splitWithOverlap(text: string, chunkSize: number, overlap: number): string[] {
    const words = text.split(/\s+/).filter(Boolean);
    if (words.length === 0) return [];

    const chunks: string[] = [];
    let start = 0;

    while (start < words.length) {
      const end = Math.min(start + chunkSize, words.length);
      chunks.push(words.slice(start, end).join(' '));
      if (end >= words.length) break;
      start += chunkSize - overlap;
    }

    return chunks;
  }
}
