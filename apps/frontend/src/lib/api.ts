import type { CampaignConfig, GeneratedEmail, AnalysisResult } from '@phishguard/shared';

const API_BASE = import.meta.env.VITE_API_URL || '/api';

async function request<T>(path: string, options?: RequestInit): Promise<T> {
  const res = await fetch(`${API_BASE}${path}`, {
    headers: {
      'Content-Type': 'application/json',
      ...options?.headers,
    },
    ...options,
  });

  if (!res.ok) {
    const error = await res.json().catch(() => ({ message: 'Request failed' }));
    throw new Error(error.message || `HTTP ${res.status}`);
  }

  return res.json() as Promise<T>;
}

export interface GenerateCampaignResponse {
  sessionId: string;
  emails: GeneratedEmail[];
}

export const api = {
  get: <T>(path: string): Promise<T> => request<T>(path),
  post: <T>(path: string, body: unknown): Promise<T> =>
    request<T>(path, { method: 'POST', body: JSON.stringify(body) }),

  generateCampaign: (config: CampaignConfig): Promise<GenerateCampaignResponse> =>
    request<GenerateCampaignResponse>('/inbox/generate', {
      method: 'POST',
      body: JSON.stringify(config),
    }),

  getInbox: (sessionId: string): Promise<{ emails: GeneratedEmail[] }> =>
    request<{ emails: GeneratedEmail[] }>(`/inbox/${sessionId}`),

  submitAnalysis: (sessionId: string, decisions: { emailId: string; markedAsPhishing: boolean }[]): Promise<AnalysisResult> =>
    request<AnalysisResult>('/analysis/submit', {
      method: 'POST',
      body: JSON.stringify({ sessionId, decisions }),
    }),

  getPhishingSiteStatus: (sessionId: string): Promise<Record<string, string | null>> =>
    request<Record<string, string | null>>(`/exercise/sites/${sessionId}`),

  streamChat: async function* (sessionId: string, message: string): AsyncGenerator<string> {
    const res = await fetch(`${API_BASE}/chat/${sessionId}`, {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({ message }),
    });

    if (!res.ok) throw new Error(`Chat request failed: ${res.status}`);
    if (!res.body) throw new Error('No response body');

    const reader = res.body.getReader();
    const decoder = new TextDecoder();
    let buffer = '';

    while (true) {
      const { done, value } = await reader.read();
      if (done) break;

      buffer += decoder.decode(value, { stream: true });
      const lines = buffer.split('\n');
      buffer = lines.pop() ?? '';

      for (const line of lines) {
        if (!line.startsWith('data: ')) continue;
        const event = JSON.parse(line.slice(6));
        if (event.type === 'chunk') yield event.data;
        if (event.type === 'done') return;
        if (event.type === 'error') throw new Error(event.data);
      }
    }
  },
};
