import { Injectable } from '@angular/core';
import {
  CreatePromptReqModel,
  CreatePromptResModel,
  UpdatePromptReqModel,
  UpdatePromptResModel,
  PromptResModel,
  PromptListItemResModel,
} from '../models';
import { HttpBaseService } from '@core/services';

@Injectable({
  providedIn: 'root',
})
export class PromptsApi extends HttpBaseService {
  async create(prompt: CreatePromptReqModel): Promise<CreatePromptResModel> {
    const response = await this.postP<CreatePromptResModel, CreatePromptReqModel>(
      '/prompts',
      prompt,
    );
    await this.fetchAll();
    return response;
  }

  async update(id: string, prompt: UpdatePromptReqModel): Promise<UpdatePromptResModel> {
    const response = await this.patchP<UpdatePromptResModel, UpdatePromptReqModel>(
      `/prompts/${id}`,
      prompt,
    );
    await this.fetchAll();
    return response;
  }

  async deletePrompt(id: string): Promise<void> {
    await this.deleteP<void>(`/prompts/${id}`);
  }

  async getById(id: string): Promise<PromptResModel> {
    return await this.getP<PromptResModel>(`/prompts/${id}`);
  }

  async fetchAll() {
    return await this.getP<PromptListItemResModel[]>('/prompts');
  }

  async deleteMessage(promptId: string, messageId: string): Promise<void> {
    await this.deleteP<void>(`/prompts/${promptId}/messages/${messageId}`);
  }
}
