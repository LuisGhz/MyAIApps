export interface Message {
  id?: string;
  role: 'user' | 'assistant';
  content: string;
  createdAt?: string;
  inputTokens?: number;
  outputTokens?: number;
  file?: File | string;
}

export interface MessagesHistoryModel {
  messages: Message[];
  maxTokens: number;
  temperature: number;
  hasMore: boolean;
  isWebSearch: boolean;
  isImageGeneration: boolean;
}
