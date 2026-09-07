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
import { ChatStore } from '@st/chat/chat.store';
import {
  AiModelModel,
  PromptItemSummaryResModel,
  TranscribeAudioResModel,
  UpdateAIFeaturesReqModel,
  UserChatsModel,
} from '@chat/models';
import { MessagesHistoryModel } from '@st/chat/models/message.model';
import { ChatApi } from './chat-api';

describe('ChatApi', () => {
  let service: ChatApi;
  let httpTestingController: HttpTestingController;
  let store: Store;

  beforeEach(() => {
    vi.clearAllMocks();
    TestBed.configureTestingModule({
      providers: [
        ChatApi,
        provideStore([ChatStore, AuthStore]),
        provideHttpClient(),
        provideHttpClientTesting(),
      ],
    });

    service = TestBed.inject(ChatApi);
    httpTestingController = TestBed.inject(HttpTestingController);
    store = TestBed.inject(Store);
  });

  afterEach(() => {
    httpTestingController.verify();
  });

  const history: MessagesHistoryModel = {
    messages: [
      { role: 'user', content: 'Hello' },
      { role: 'assistant', content: 'Hi there' },
    ],
    maxTokens: 4096,
    temperature: 0.7,
    hasMore: true,
    isWebSearch: true,
    isImageGeneration: false,
  };

  it('should load chat messages and update the chat store ops', async () => {
    const loadPromise = service.loadMessages('chat-1');
    const request = httpTestingController.expectOne(`${environment.apiUrl}/chat/chat-1/messages`);

    expect(request.request.method).toBe('GET');

    request.flush(history);

    await loadPromise;

    expect(store.selectSnapshot(ChatStore.getMessages)).toEqual(history.messages);
    expect(store.selectSnapshot(ChatStore.getOps)).toEqual({
      modelId: '',
      modelDeveloper: '',
      maxTokens: history.maxTokens,
      temperature: history.temperature,
      file: undefined,
      isImageGeneration: history.isImageGeneration,
      isWebSearch: history.isWebSearch,
      promptId: undefined,
    });
  });

  it('should request older messages and chats with the correct endpoints', async () => {
    const chats: UserChatsModel[] = [
      {
        id: 'chat-1',
        title: 'First chat',
        createdAt: new Date('2024-01-01T00:00:00.000Z'),
      },
    ];

    const olderMessagesPromise = service.loadOlderMessages('chat-1', 'message-1');
    const chatsPromise = service.getChats();

    const olderMessagesRequest = httpTestingController.expectOne(
      `${environment.apiUrl}/chat/chat-1/messages?beforeMessageId=message-1`,
    );
    const chatsRequest = httpTestingController.expectOne(`${environment.apiUrl}/chat`);

    expect(olderMessagesRequest.request.method).toBe('GET');
    expect(chatsRequest.request.method).toBe('GET');

    olderMessagesRequest.flush(history);
    chatsRequest.flush(chats);

    await expect(olderMessagesPromise).resolves.toEqual(history);
    await expect(chatsPromise).resolves.toEqual(chats);
  });

  it('should short-circuit prompt loading when unauthenticated and fetch prompts when authenticated', async () => {
    const prompts: PromptItemSummaryResModel[] = [
      { id: 'prompt-1', name: 'Summarize text' },
    ];

    await expect(service.getPrompts()).resolves.toEqual([]);
    expect(httpTestingController.match(() => true)).toHaveLength(0);

    await firstValueFrom(
      store.dispatch(new AuthActions.Login({ token: createTestJwt({ role: 'user' }) })),
    );

    const promptsPromise = service.getPrompts();
    const request = httpTestingController.expectOne(`${environment.apiUrl}/prompts/summary`);

    expect(request.request.method).toBe('GET');

    request.flush(prompts);

    await expect(promptsPromise).resolves.toEqual(prompts);
  });

  it('should send the correct mutation requests for chat settings', async () => {
    const featurePayload: UpdateAIFeaturesReqModel = {
      isImageGeneration: true,
      isWebSearch: false,
    };

    const renamePromise = service.renameChat('chat-1', 'Updated title');
    const updateMaxTokensPromise = service.updateMaxTokens('chat-1', 8000);
    const updateTemperaturePromise = service.updateTemperature('chat-1', 0.4);
    const updateFeaturesPromise = service.updateAIFeatures('chat-1', featurePayload);
    const deletePromise = service.deleteChat('chat-1');

    const renameRequest = httpTestingController.expectOne(
      `${environment.apiUrl}/chat/chat-1/rename`,
    );
    const maxTokensRequest = httpTestingController.expectOne(
      `${environment.apiUrl}/chat/chat-1/update-max-tokens`,
    );
    const temperatureRequest = httpTestingController.expectOne(
      `${environment.apiUrl}/chat/chat-1/update-temperature`,
    );
    const featuresRequest = httpTestingController.expectOne(
      `${environment.apiUrl}/chat/chat-1/update-ai-features`,
    );
    const deleteRequest = httpTestingController.expectOne(`${environment.apiUrl}/chat/chat-1`);

    expect(renameRequest.request.method).toBe('PATCH');
    expect(renameRequest.request.body).toEqual({ title: 'Updated title' });
    expect(maxTokensRequest.request.method).toBe('PATCH');
    expect(maxTokensRequest.request.body).toEqual({ maxTokens: 8000 });
    expect(temperatureRequest.request.method).toBe('PATCH');
    expect(temperatureRequest.request.body).toEqual({ temperature: 0.4 });
    expect(featuresRequest.request.method).toBe('PATCH');
    expect(featuresRequest.request.body).toEqual(featurePayload);
    expect(deleteRequest.request.method).toBe('DELETE');

    renameRequest.flush({ success: true });
    maxTokensRequest.flush({ success: true });
    temperatureRequest.flush({ success: true });
    featuresRequest.flush({ success: true });
    deleteRequest.flush(null);

    await expect(renamePromise).resolves.toEqual({ success: true });
    await expect(updateMaxTokensPromise).resolves.toEqual({ success: true });
    await expect(updateTemperaturePromise).resolves.toEqual({ success: true });
    await expect(updateFeaturesPromise).resolves.toEqual({ success: true });
    await expect(deletePromise).resolves.toBeNull();
  });

  it('should upload audio for transcription as form data', async () => {
    const response: TranscribeAudioResModel = {
      text: 'Transcribed text',
    };
    const file = new Blob(['audio']);

    const transcribePromise = service.transcribe(file);
    const request = httpTestingController.expectOne(`${environment.apiUrl}/chat/transcribe`);
    const audio = request.request.body.get('audio');

    expect(request.request.method).toBe('POST');
    expect(request.request.body).toBeInstanceOf(FormData);
    expect(audio).toBeInstanceOf(File);
    expect((audio as File).size).toBe(file.size);

    request.flush(response);

    await expect(transcribePromise).resolves.toEqual(response);
  });
});
