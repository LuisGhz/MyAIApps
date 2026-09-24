import { PromptMessageResModel } from './create-prompt.model';

export interface PromptResModel {
  id: string;
  name: string;
  content: string;
  chatId?: string;
  messages: PromptMessageResModel[];
  createdAt: Date;
  updatedAt: Date;
}

export interface PromptListItemResModel {
  id: string;
  name: string;
  content: string;
  chatId?: string;
  messageCount: number;
  createdAt: Date;
  updatedAt: Date;
}
