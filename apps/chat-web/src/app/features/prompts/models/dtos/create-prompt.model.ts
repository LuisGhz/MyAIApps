export type PromptMessageRole = 'assistant' | 'user';

export interface CreatePromptMessageModel {
  role: PromptMessageRole;
  content: string;
}

export interface CreatePromptReqModel {
  name: string;
  content: string;
  chatId?: string;
  messages?: CreatePromptMessageModel[];
}

export interface PromptMessageResModel {
  id: string;
  role: PromptMessageRole;
  content: string;
  createdAt: Date;
  updatedAt: Date;
}

export interface CreatePromptResModel {
  id: string;
  name: string;
  content: string;
  chatId?: string;
  messages: PromptMessageResModel[];
  createdAt: Date;
  updatedAt: Date;
}
