import { api } from './http';

export interface AiChatMessage {
  role: 'user' | 'assistant';
  content: string;
}

export interface AiPendingActionInfo {
  id: string;
  action: string;
  message: string;
  expires_at: string;
}

export interface AiPendingAction {
  id: string;
  tool: string;
  summary: string;
  created_at: string;
  expires_at?: string;
  restaurant_id: string;
}

export interface AiAction {
  tool: string;
  summary: string;
  detail: Record<string, any>;
  pending_action?: AiPendingActionInfo;
}

export interface AiChatResponse {
  reply: string;
  actions: AiAction[];
  restaurant_id: string;
}

export const aiAPI = {
  chat: (payload: { message: string; history: AiChatMessage[]; restaurant_id?: string }) =>
    api.post<AiChatResponse>('/owner/ai/chat/', payload),
  confirm: (pending_action_id: string, confirm: boolean) =>
    api.post<{ executed?: boolean; cancelled?: boolean; message?: string; result?: Record<string, any>; error?: string }>(
      '/owner/ai/confirm/',
      { pending_action_id, confirm },
    ),
  pending: () => api.get<{ pending_actions: AiPendingAction[] }>('/owner/ai/pending/'),
};