import { Injectable } from '@angular/core';
import { AiModelModel } from '@chat/models';
import { HttpBaseService } from '@core/services/http-base.service';
import { select } from '@ngxs/store';
import { AuthStore } from '@st/auth/auth.store';

@Injectable({
  providedIn: 'root',
})
export class AiModelsApi extends HttpBaseService {
  #isAuthenticated = select(AuthStore.isAuthenticated);
  getAiModels() {
    // This endpoint is called on logout so validate authentication to avoid request
    if (!this.#isAuthenticated()) return Promise.resolve([]);
    return this.getP<AiModelModel[]>('/models');
  }
}
