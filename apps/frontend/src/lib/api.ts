import type { CampaignConfig, GeneratedEmail, AnalysisResult } from '@phishguard/shared';

const API_BASE = '/api';

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
};
