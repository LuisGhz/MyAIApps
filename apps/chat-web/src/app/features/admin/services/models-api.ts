import { Injectable } from '@angular/core';
import { HttpBaseService } from '@core/services/http-base.service';
import { CreateModelReqModel, UpdateModelReqModel, ModelResModel, ModelListItemResModel } from '../models';

@Injectable({ providedIn: 'root' })
export class ModelsApi extends HttpBaseService {
  async create(model: CreateModelReqModel): Promise<ModelResModel> {
    const response = await this.postP<ModelResModel, CreateModelReqModel>('/models', model);
    await this.fetchAll();
    return response;
  }

  async update(id: string, model: UpdateModelReqModel): Promise<ModelResModel> {
    const response = await this.patchP<ModelResModel, UpdateModelReqModel>(
      `/models/${id}`,
      model,
    );
    await this.fetchAll();
    return response;
  }

  async deleteModel(id: string): Promise<void> {
    await this.deleteP<void>(`/models/${id}`);
    await this.fetchAll();
  }

  async getById(id: string): Promise<ModelResModel> {
    return await this.getP<ModelResModel>(`/models/${id}`);
  }

  async fetchAll(): Promise<ModelListItemResModel[]> {
    return await this.getP<ModelListItemResModel[]>('/models');
  }
}
