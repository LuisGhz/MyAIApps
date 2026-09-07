import { provideHttpClient } from '@angular/common/http';
import { HttpTestingController, provideHttpClientTesting } from '@angular/common/http/testing';
import { TestBed } from '@angular/core/testing';
import { Store, provideStore } from '@ngxs/store';
import { afterEach, beforeEach, describe, expect, it, vi } from 'vitest';
import { firstValueFrom } from 'rxjs';

import { environment } from '@env/environment';
import { createTestJwt } from '@sh/testing';
import { AuthActions } from '@st/auth/auth.actions';
import { AuthStore } from '@st/auth/auth.store';
import { AiModelModel } from '@chat/models';
import { AiModelsApi } from './ai-models-api';

describe('AiModelsApi', () => {
  let service: AiModelsApi;
  let httpTestingController: HttpTestingController;
  let store: Store;

  beforeEach(() => {
    vi.clearAllMocks();
    TestBed.configureTestingModule({
      providers: [
        AiModelsApi,
        provideStore([AuthStore]),
        provideHttpClient(),
        provideHttpClientTesting(),
      ],
    });

    service = TestBed.inject(AiModelsApi);
    httpTestingController = TestBed.inject(HttpTestingController);
    store = TestBed.inject(Store);
  });

  afterEach(() => {
    httpTestingController.verify();
  });

  it('should return an empty list when the user is not authenticated', async () => {
    await expect(service.getAiModels()).resolves.toEqual([]);

    expect(httpTestingController.match(() => true)).toHaveLength(0);
  });

  it('should fetch ai models when the user is authenticated', async () => {
    const models: AiModelModel[] = [
      {
        id: 'model-1',
        name: 'GPT-4 Turbo',
        shortName: 'GPT-4T',
        value: 'gpt-4-turbo',
        developer: {
          name: 'OpenAI',
          imageUrl: 'https://example.com/openai.png',
        },
      },
    ];

    await firstValueFrom(
      store.dispatch(new AuthActions.Login({ token: createTestJwt({ role: 'user' }) })),
    );

    const modelsPromise = service.getAiModels();
    const request = httpTestingController.expectOne(`${environment.apiUrl}/models`);

    expect(request.request.method).toBe('GET');

    request.flush(models);

    await expect(modelsPromise).resolves.toEqual(models);
  });
});
