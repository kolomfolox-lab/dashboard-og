import { api } from './http';

export interface AiChatMessage {
  role: 'user' | 'assistant';
  content: string;
}

export interface AiAction {
  tool: string;
  summary: string;
  detail: Record<string, any>;
}

export interface AiChatResponse {
  reply: string;
  actions: AiAction[];
  restaurant_id: string;
}

export const aiAPI = {
  chat: (payload: { message: string; history: AiChatMessage[]; restaurant_id?: string }) =>
    api.post<AiChatResponse>('/owner/ai/chat/', payload),
};
