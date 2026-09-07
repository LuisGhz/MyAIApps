import { Injectable } from '@angular/core';
import { EnhanceTextReq } from '../models/enhance-text-req.model';
import { HttpService } from '@core/services/http.service';
import { EnhanceTextRes } from '@enhance/models/enhance-text-res.model';

@Injectable({
  providedIn: 'root',
})
export class EnhanceApi extends HttpService {
  enhanceText({ textToEnhance, context }: EnhanceTextReq) {
    return this.post<EnhanceTextRes, EnhanceTextReq>('/enhance', {
      textToEnhance,
      context,
    });
  }
}
