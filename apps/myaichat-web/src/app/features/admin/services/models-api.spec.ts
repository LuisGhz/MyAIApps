import { provideHttpClient } from '@angular/common/http';
import { HttpTestingController, provideHttpClientTesting } from '@angular/common/http/testing';
import { TestBed } from '@angular/core/testing';
import { afterEach, beforeEach, describe, expect, it, vi } from 'vitest';

import { environment } from '@env/environment';
import {
  CreateModelReqModel,
  ModelListItemResModel,
  ModelResModel,
  UpdateModelReqModel,
} from '../models';
import { ModelsApi } from './models-api';

describe('ModelsApi', () => {
  let service: ModelsApi;
  let httpTestingController: HttpTestingController;

  beforeEach(() => {
    vi.clearAllMocks();
    TestBed.configureTestingModule({
      providers: [ModelsApi, provideHttpClient(), provideHttpClientTesting()],
    });

    service = TestBed.inject(ModelsApi);
    httpTestingController = TestBed.inject(HttpTestingController);
  });

  afterEach(() => {
    httpTestingController.verify();
  });

  const modelResponse: ModelResModel = {
    id: 'model-1',
    name: 'GPT-4 Turbo',
    shortName: 'GPT-4T',
    value: 'gpt-4-turbo',
    link: 'https://platform.openai.com/docs',
    guestAccess: true,
    price: { input: 0.0001, output: 0.0003 },
    supportsTemperature: true,
    isReasoning: true,
    reasoningLevel: 'medium',
    metadata: {
      contextWindow: 128000,
      maxOutputTokens: 4096,
      knowledgeCutoff: 'April 2023',
    },
    developer: {
      id: 'dev-1',
      name: 'OpenAI',
      link: 'https://platform.openai.com',
      imageUrl: 'https://example.com/openai.png',
    },
    createdAt: new Date('2024-01-01T00:00:00.000Z'),
    updatedAt: new Date('2024-01-02T00:00:00.000Z'),
  };

  const modelListResponse: ModelListItemResModel[] = [
    {
      id: 'model-1',
      name: 'GPT-4 Turbo',
      shortName: 'GPT-4T',
      guestAccess: true,
      value: 'gpt-4-turbo',
      developer: {
        name: 'OpenAI',
        imageUrl: 'https://example.com/openai.png',
      },
    },
  ];

  it('should fetch all models', async () => {
    const modelsPromise = service.fetchAll();
    const request = httpTestingController.expectOne(`${environment.apiUrl}/models`);

    expect(request.request.method).toBe('GET');

    request.flush(modelListResponse);

    await expect(modelsPromise).resolves.toEqual(modelListResponse);
  });

  it('should fetch a single model by id', async () => {
    const modelPromise = service.getById('model-1');
    const request = httpTestingController.expectOne(`${environment.apiUrl}/models/model-1`);

    expect(request.request.method).toBe('GET');

    request.flush(modelResponse);

    await expect(modelPromise).resolves.toEqual(modelResponse);
  });

  it('should create a model and refetch the list', async () => {
    const req: CreateModelReqModel = {
      name: modelResponse.name,
      shortName: modelResponse.shortName,
      value: modelResponse.value,
      guestAccess: modelResponse.guestAccess,
      link: modelResponse.link,
      price: modelResponse.price,
      metadata: modelResponse.metadata,
      developerId: modelResponse.developer.id,
    };

    const createPromise = service.create(req);
    const postRequest = httpTestingController.expectOne(`${environment.apiUrl}/models`);

    expect(postRequest.request.method).toBe('POST');
    expect(postRequest.request.body).toEqual(req);

    postRequest.flush(modelResponse);
    await Promise.resolve();

    const fetchRequest = httpTestingController.expectOne(`${environment.apiUrl}/models`);
    expect(fetchRequest.request.method).toBe('GET');
    fetchRequest.flush(modelListResponse);

    await expect(createPromise).resolves.toEqual(modelResponse);
  });

  it('should update a model and refetch the list', async () => {
    const req: UpdateModelReqModel = {
      name: 'Updated Model',
      price: modelResponse.price,
      metadata: modelResponse.metadata,
      developerId: modelResponse.developer.id,
    };

    const updatePromise = service.update('model-1', req);
    const patchRequest = httpTestingController.expectOne(`${environment.apiUrl}/models/model-1`);

    expect(patchRequest.request.method).toBe('PATCH');
    expect(patchRequest.request.body).toEqual(req);

    patchRequest.flush({ ...modelResponse, name: 'Updated Model' });
    await Promise.resolve();

    const fetchRequest = httpTestingController.expectOne(`${environment.apiUrl}/models`);
    expect(fetchRequest.request.method).toBe('GET');
    fetchRequest.flush(modelListResponse);

    await expect(updatePromise).resolves.toEqual({ ...modelResponse, name: 'Updated Model' });
  });

  it('should delete a model and refetch the list', async () => {
    const deletePromise = service.deleteModel('model-1');
    const deleteRequest = httpTestingController.expectOne(`${environment.apiUrl}/models/model-1`);

    expect(deleteRequest.request.method).toBe('DELETE');

    deleteRequest.flush(null);
    await Promise.resolve();

    const fetchRequest = httpTestingController.expectOne(`${environment.apiUrl}/models`);
    expect(fetchRequest.request.method).toBe('GET');
    fetchRequest.flush([]);

    await expect(deletePromise).resolves.toBeUndefined();
  });
});
