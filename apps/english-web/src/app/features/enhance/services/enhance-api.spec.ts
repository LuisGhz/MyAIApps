import { provideHttpClient } from '@angular/common/http';
import { HttpTestingController, provideHttpClientTesting } from '@angular/common/http/testing';
import { TestBed } from '@angular/core/testing';
import { firstValueFrom } from 'rxjs';
import { afterEach, beforeEach, describe, expect, it } from 'vitest';
import { environment } from '@env/environment';
import { EnhanceTextRes } from '@enhance/models/enhance-text-res.model';
import { EnhanceApi } from './enhance-api';

describe('EnhanceApi', () => {
  let enhanceApi: EnhanceApi;
  let httpController: HttpTestingController;

  beforeEach(() => {
    TestBed.configureTestingModule({
      providers: [EnhanceApi, provideHttpClient(), provideHttpClientTesting()],
    });

    enhanceApi = TestBed.inject(EnhanceApi);
    httpController = TestBed.inject(HttpTestingController);
  });

  afterEach(() => {
    httpController.verify();
    TestBed.resetTestingModule();
  });

  it('should post the enhance request payload and return the response', async () => {
    const response: EnhanceTextRes = {
      grammarFix: 'I want to see you.',
      informalB2: 'I want to catch up with you.',
      informalC1: 'I would love to catch up with you.',
      formalB2: 'I would like to see you.',
      formalC1: 'I would appreciate the opportunity to meet with you.',
    };
    const requestPromise = firstValueFrom(
      enhanceApi.enhanceText({
        context: 'Waiting a call from my boss',
        textToEnhance: 'I want see you.',
      }),
    );

    const request = httpController.expectOne(`${environment.apiUrl}/enhance`);

    expect(request.request.method).toBe('POST');
    expect(request.request.body).toEqual({
      context: 'Waiting a call from my boss',
      textToEnhance: 'I want see you.',
    });

    request.flush(response);

    await expect(requestPromise).resolves.toEqual(response);
  });
});
