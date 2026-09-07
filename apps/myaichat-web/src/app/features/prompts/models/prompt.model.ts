export interface PromptMessageModel {
  id: string;
  role: 'assistant' | 'user';
  content: string;
  createdAt?: Date;
  updatedAt?: Date;
}

export interface PromptModel {
  id: string;
  name: string;
  content: string;
  chatId?: string;
  messages: PromptMessageModel[];
  createdAt?: Date;
  updatedAt?: Date;
}
