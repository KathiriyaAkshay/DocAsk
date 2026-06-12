export interface ChromaConfig {
  host: string;
  port: number;
  collection: string;
}

export function resolveChromaConfig(): ChromaConfig {
  return {
    host: process.env.CHROMA_HOST ?? 'localhost',
    port: parseInt(process.env.CHROMA_PORT ?? '8000', 10),
    collection: process.env.CHROMA_COLLECTION ?? 'acme_policies',
  };
}

export function getChromaLabel(): string {
  const { host, port, collection } = resolveChromaConfig();
  return `${host}:${port}/${collection}`;
}
