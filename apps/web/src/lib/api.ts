export interface Citation {
  documentName: string;
  section: string;
  excerpt: string;
}

export interface RetrievedChunk {
  id: string;
  text: string;
  documentName: string;
  section: string;
  chunkIndex: number;
  score: number;
}

export interface ChatMessage {
  id: string;
  role: 'user' | 'assistant';
  content: string;
  citations?: Citation[];
  sources?: RetrievedChunk[];
}

export interface ChatApiResponse {
  answer: string;
  citations: Citation[];
  sources: RetrievedChunk[];
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

const API_URL = process.env.NEXT_PUBLIC_API_URL ?? 'http://localhost:3001';

export async function fetchHealth(): Promise<HealthResponse> {
  const res = await fetch(`${API_URL}/health`, { cache: 'no-store' });
  if (!res.ok) throw new Error('Health check failed');
  return res.json();
}

export async function sendQuestion(
  question: string,
  history: Array<{ role: 'user' | 'assistant'; content: string }>,
): Promise<ChatApiResponse> {
  const res = await fetch(`${API_URL}/chat`, {
    method: 'POST',
    headers: { 'Content-Type': 'application/json' },
    body: JSON.stringify({ question, history }),
  });

  if (!res.ok) {
    const err = await res.json().catch(() => ({ message: res.statusText }));
    throw new Error(err.message ?? `Request failed (${res.status})`);
  }

  return res.json();
}

export const SAMPLE_QUESTIONS = [
  'How many remote days are allowed per week?',
  'What is the meal reimbursement limit?',
  'What are the password requirements?',
  'What happens on day one of onboarding?',
  'What is the live chat SLA response time?',
];

export const POLICY_DOCUMENTS = [
  'employee-handbook.pdf',
  'expense-policy.pdf',
  'it-security-policy.pdf',
  'onboarding-checklist.pdf',
  'customer-support-guidelines.pdf',
];
