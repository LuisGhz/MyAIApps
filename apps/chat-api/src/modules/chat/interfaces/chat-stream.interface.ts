import type { ChatStreamEvent } from '../dto';

export interface HandleStreamMessageParams {
  chatId?: string;
  promptId?: string;
  message: string;
  modelId: string;
  maxTokens: number;
  temperature: number;
  userId: string;
  provider: string;
  fileKey?: string;
  isImageGeneration: boolean;
  isWebSearch: boolean;
  onEvent: (event: ChatStreamEvent) => void;
}

export interface GetOrCreateChatParams {
  chatId?: string;
  promptId?: string;
  userId: string;
  model: string;
  maxTokens: number;
  temperature: number;
  isImageGeneration: boolean;
  isWebSearch: boolean;
}
