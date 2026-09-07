import { Injectable } from '@angular/core';
import { HttpService } from '@core/services/http.service';
import { CompareReqModel, CompareResModel } from '../models';

@Injectable({
  providedIn: 'root',
})
export class CompareApi extends HttpService {
  compare(inputs: string[], context?: string) {
    const payload: CompareReqModel = {
      context,
      inputs,
    };
    return this.postP<CompareResModel, CompareReqModel>('/compare', payload);
  }
}
