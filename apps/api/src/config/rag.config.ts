export interface RagConfig {
  chunkSize: number;
  chunkOverlap: number;
  topK: number;
}

export function resolveRagConfig(): RagConfig {
  return {
    chunkSize: parseInt(process.env.CHUNK_SIZE ?? '600', 10),
    chunkOverlap: parseInt(process.env.CHUNK_OVERLAP ?? '100', 10),
    topK: parseInt(process.env.RETRIEVAL_TOP_K ?? '5', 10),
  };
}
