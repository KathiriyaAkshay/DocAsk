export interface TextChunk {
  id: string;
  text: string;
  documentName: string;
  section: string;
  chunkIndex: number;
}

export interface RetrievedChunk extends TextChunk {
  score: number;
}

export interface Citation {
  documentName: string;
  section: string;
  excerpt: string;
}

export interface ChatMessage {
  role: 'user' | 'assistant';
  content: string;
}

export interface ChatRequest {
  question: string;
  history?: ChatMessage[];
}

export interface ChatResponse {
  answer: string;
  citations: Citation[];
  sources: RetrievedChunk[];
  traceId?: string;
}

export interface IngestResult {
  documentsProcessed: number;
  chunksIndexed: number;
  collection: string;
}

export interface HealthResponse {
  status: 'ok' | 'degraded';
  chroma: 'connected' | 'disconnected';
  documentsIndexed: number;
  llm: string;
  embeddings: string;
  langfuse: 'enabled' | 'disabled';
  timestamp: string;
}
