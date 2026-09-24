import { provideHttpClient } from '@angular/common/http';
import { HttpTestingController, provideHttpClientTesting } from '@angular/common/http/testing';
import { TestBed } from '@angular/core/testing';
import { afterEach, beforeEach, describe, expect, it, vi } from 'vitest';

import { environment } from '@env/environment';
import {
  CreatePromptReqModel,
  CreatePromptResModel,
  PromptListItemResModel,
  PromptResModel,
  UpdatePromptReqModel,
  UpdatePromptResModel,
} from '../models';
import { PromptsApi } from './prompts-api';

describe('PromptsApi', () => {
  let service: PromptsApi;
  let httpTestingController: HttpTestingController;

  beforeEach(() => {
    vi.clearAllMocks();
    TestBed.configureTestingModule({
      providers: [PromptsApi, provideHttpClient(), provideHttpClientTesting()],
    });

    service = TestBed.inject(PromptsApi);
    httpTestingController = TestBed.inject(HttpTestingController);
  });

  afterEach(() => {
    httpTestingController.verify();
  });

  const promptResponse: PromptResModel = {
    id: 'prompt-1',
    name: 'Summarize text',
    content: 'Please summarize the following text',
    chatId: 'chat-1',
    messages: [
      {
        id: 'message-1',
        role: 'user',
        content: 'Summarize this article',
        createdAt: new Date('2024-01-01T00:00:00.000Z'),
        updatedAt: new Date('2024-01-01T00:00:00.000Z'),
      },
    ],
    createdAt: new Date('2024-01-01T00:00:00.000Z'),
    updatedAt: new Date('2024-01-02T00:00:00.000Z'),
  };

  const promptListResponse: PromptListItemResModel[] = [
    {
      id: 'prompt-1',
      name: 'Summarize text',
      content: 'Please summarize the following text',
      chatId: 'chat-1',
      messageCount: 1,
      createdAt: new Date('2024-01-01T00:00:00.000Z'),
      updatedAt: new Date('2024-01-02T00:00:00.000Z'),
    },
  ];

  it('should fetch all prompts', async () => {
    const promptsPromise = service.fetchAll();
    const request = httpTestingController.expectOne(`${environment.apiUrl}/prompts`);

    expect(request.request.method).toBe('GET');

    request.flush(promptListResponse);

    await expect(promptsPromise).resolves.toEqual(promptListResponse);
  });

  it('should fetch a prompt by id', async () => {
    const promptPromise = service.getById('prompt-1');
    const request = httpTestingController.expectOne(`${environment.apiUrl}/prompts/prompt-1`);

    expect(request.request.method).toBe('GET');

    request.flush(promptResponse);

    await expect(promptPromise).resolves.toEqual(promptResponse);
  });

  it('should create a prompt and refetch the list', async () => {
    const req: CreatePromptReqModel = {
      name: promptResponse.name,
      content: promptResponse.content,
      chatId: promptResponse.chatId,
      messages: promptResponse.messages.map(({ role, content }) => ({ role, content })),
    };
    const createResponse: CreatePromptResModel = promptResponse;

    const createPromise = service.create(req);
    const postRequest = httpTestingController.expectOne(`${environment.apiUrl}/prompts`);

    expect(postRequest.request.method).toBe('POST');
    expect(postRequest.request.body).toEqual(req);

    postRequest.flush(createResponse);
    await Promise.resolve();

    const fetchRequest = httpTestingController.expectOne(`${environment.apiUrl}/prompts`);
    expect(fetchRequest.request.method).toBe('GET');
    fetchRequest.flush(promptListResponse);

    await expect(createPromise).resolves.toEqual(createResponse);
  });

  it('should update a prompt and refetch the list', async () => {
    const req: UpdatePromptReqModel = {
      name: 'Updated prompt',
      content: promptResponse.content,
      messages: promptResponse.messages.map(({ id, role, content }) => ({ id, role, content })),
    };
    const updateResponse: UpdatePromptResModel = { ...promptResponse, name: 'Updated prompt' };

    const updatePromise = service.update('prompt-1', req);
    const patchRequest = httpTestingController.expectOne(`${environment.apiUrl}/prompts/prompt-1`);

    expect(patchRequest.request.method).toBe('PATCH');
    expect(patchRequest.request.body).toEqual(req);

    patchRequest.flush(updateResponse);
    await Promise.resolve();

    const fetchRequest = httpTestingController.expectOne(`${environment.apiUrl}/prompts`);
    expect(fetchRequest.request.method).toBe('GET');
    fetchRequest.flush(promptListResponse);

    await expect(updatePromise).resolves.toEqual(updateResponse);
  });

  it('should delete a prompt', async () => {
    const deletePromise = service.deletePrompt('prompt-1');
    const request = httpTestingController.expectOne(`${environment.apiUrl}/prompts/prompt-1`);

    expect(request.request.method).toBe('DELETE');

    request.flush(null);

    await expect(deletePromise).resolves.toBeUndefined();
  });

  it('should delete a prompt message', async () => {
    const deletePromise = service.deleteMessage('prompt-1', 'message-1');
    const request = httpTestingController.expectOne(
      `${environment.apiUrl}/prompts/prompt-1/messages/message-1`,
    );

    expect(request.request.method).toBe('DELETE');

    request.flush(null);

    await expect(deletePromise).resolves.toBeUndefined();
  });
});
