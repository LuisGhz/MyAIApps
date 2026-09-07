import type { Chat } from '../entities';

export interface SaveMessagesParams {
  chat: Chat;
  userMessage: string;
  assistantContent: string;
  inputTokens: number;
  outputTokens: number;
  fileKey?: string;
  imageKey?: string;
}
