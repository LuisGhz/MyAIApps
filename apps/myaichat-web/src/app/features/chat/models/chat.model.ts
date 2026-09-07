export interface UserChatsModel {
  id: string;
  title?: string;
  createdAt: Date;
}

export interface MessageModel {
  id: string;
  role: 'user' | 'assistant' | 'system';
  content: string;
  timestamp: Date;
}

export interface ChatModel {
  id: string;
  title: string;
  messages: MessageModel[];
  createdAt: Date;
  updatedAt: Date;
}

export interface ChatGroupModel {
  label: string;
  chats: ChatModel[];
}

export enum StreamEventType {
  DELTA = 'delta',
  ERROR = 'error',
  DONE = 'done',
}

export interface StreamDeltaEvent {
  type: StreamEventType.DELTA;
  data: string;
}

export interface StreamErrorEvent {
  type: StreamEventType.ERROR;
  data: {
    message: string;
    code?: string;
  };
}

export interface StreamDoneEvent {
  type: StreamEventType.DONE;
  data: {
    chatId: string;
    message: string;
    inputTokens: number;
    outputTokens: number;
    title?: string;
    imageUrl?: string;
  };
}

export type ChatStreamEvent = StreamDeltaEvent | StreamErrorEvent | StreamDoneEvent;

export interface SendMessageReqModel {
  chatId?: string;
  message: string;
  modelId: string;
  modelDeveloper: string;
  maxTokens: number;
  temperature: number;
  isImageGeneration: boolean;
  isWebSearch: boolean;
  file?: File;
  promptId?: string;
}

export interface PromptItemSummaryResModel {
  id: string;
  name: string;
}

export interface UpdateAIFeaturesReqModel {
  isImageGeneration: boolean;
  isWebSearch: boolean;
}
