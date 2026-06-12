export interface Citation {
  documentName: string;
  section: string;
  excerpt: string;
}

export interface ChatResponse {
  answer: string;
  citations: Citation[];
  traceId?: string;
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

export interface IngestResult {
  documentsProcessed: number;
  chunksIndexed: number;
  collection: string;
}

export class DocAskClient {
  constructor(private readonly baseUrl: string) {}

  async health(): Promise<HealthResponse> {
    return this.request<HealthResponse>('/health');
  }

  async ask(question: string): Promise<ChatResponse> {
    return this.request<ChatResponse>('/chat', {
      method: 'POST',
      body: JSON.stringify({ question }),
    });
  }

  async ingest(): Promise<IngestResult> {
    return this.request<IngestResult>('/ingest', { method: 'POST' });
  }

  private async request<T>(path: string, init?: RequestInit): Promise<T> {
    const url = `${this.baseUrl.replace(/\/$/, '')}${path}`;
    const res = await fetch(url, {
      ...init,
      headers: {
        'Content-Type': 'application/json',
        ...init?.headers,
      },
    });

    if (!res.ok) {
      let detail = res.statusText;
      try {
        const body = (await res.json()) as { message?: string | string[] };
        if (body.message) {
          detail = Array.isArray(body.message) ? body.message.join(', ') : body.message;
        }
      } catch {
        // ignore parse errors
      }
      throw new Error(`DocAsk API ${res.status}: ${detail}`);
    }

    return res.json() as Promise<T>;
  }
}

export function resolveApiUrl(): string {
  return process.env.DOCASK_API_URL?.trim() || 'http://127.0.0.1:3001';
}
