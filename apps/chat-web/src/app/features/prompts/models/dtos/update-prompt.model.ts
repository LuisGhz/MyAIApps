import { PromptMessageRole, PromptMessageResModel } from './create-prompt.model';

export interface UpdatePromptMessageModel {
  id?: string;
  role: PromptMessageRole;
  content: string;
}

export interface UpdatePromptReqModel {
  name?: string;
  content?: string;
  chatId?: string;
  messages?: UpdatePromptMessageModel[];
}

export interface UpdatePromptResModel {
  id: string;
  name: string;
  content: string;
  chatId?: string;
  messages: PromptMessageResModel[];
  createdAt: Date;
  updatedAt: Date;
}
