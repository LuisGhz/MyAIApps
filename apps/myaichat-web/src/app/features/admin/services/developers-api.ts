import { Injectable } from '@angular/core';
import { HttpBaseService } from '@core/services/http-base.service';
import { DeveloperModel } from '../models';

@Injectable({ providedIn: 'root' })
export class DevelopersApi extends HttpBaseService {
  async fetchAll(): Promise<DeveloperModel[]> {
    return await this.getP<DeveloperModel[]>('/models/developers');
  }
}
