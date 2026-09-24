import { Component, inject, provideEnvironmentInitializer } from '@angular/core';
import { Router } from '@angular/router';
import { Store, provideStore } from '@ngxs/store';
import { render, waitFor } from '@testing-library/angular';
import { of, throwError } from 'rxjs';
import { beforeEach, describe, expect, it, vi } from 'vitest';

import { AppStore } from '@st/app/app.store';
import { ChatActions } from '@st/chat/chat.actions';
import { ChatStore } from '@st/chat/chat.store';
import { FileStoreService } from '@st/chat/services';
import { createMockRouter } from '@sh/testing';
import { MessagesHandler } from './message-handler';
import { ChatStreamApi } from './chat-stream-api';

@Component({
  template: '',
})
class TestHost {
  readonly handler = inject(MessagesHandler);
}

describe('MessagesHandler', () => {
  const file = new File(['hello'], 'notes.txt', { type: 'text/plain' });

  const createChatStreamApiMock = (overrides?: Partial<ChatStreamApi>) => ({
    sendMessage: vi.fn(),
    ...overrides,
  });

  const createFileStoreServiceMock = (overrides?: Partial<FileStoreService>) => ({
    getFile: vi.fn().mockReturnValue(file),
    clear: vi.fn(),
    storeFile: vi.fn(),
    removeFile: vi.fn(),
    ...overrides,
  });

  beforeEach(() => {
    vi.clearAllMocks();
  });

  const renderService = async (streamApiOverrides?: Partial<ChatStreamApi>) => {
    const chatStreamApi = createChatStreamApiMock(streamApiOverrides);
    const router = createMockRouter();
    const fileStoreService = createFileStoreServiceMock();

    const result = await render(TestHost, {
      providers: [
        MessagesHandler,
        provideStore([ChatStore, AppStore]),
        { provide: ChatStreamApi, useValue: chatStreamApi },
        { provide: Router, useValue: router },
        { provide: FileStoreService, useValue: fileStoreService },
        provideEnvironmentInitializer(() => {
          const store = inject(Store);
          store.dispatch(
            new ChatActions.SetOps({
              modelId: 'model-1',
              modelDeveloper: 'OpenAI',
              maxTokens: 4096,
              temperature: 0.7,
              promptId: 'prompt-1',
              file: {
                id: 'file-1',
                name: file.name,
                size: file.size,
                type: file.type,
                lastModified: file.lastModified,
              },
            }),
          );
        }),
      ],
    });

    const store = result.fixture.debugElement.injector.get(Store);

    return {
      handler: result.fixture.componentInstance.handler,
      store,
      router,
      chatStreamApi,
      fileStoreService,
    };
  };

  it('should send the user message, stream assistant chunks, and create a new chat entry', async () => {
    const streamEvents = of(
      { type: 'delta' as const, data: 'Hello' },
      { type: 'delta' as const, data: ' there' },
      {
        type: 'done' as const,
        data: {
          chatId: 'chat-1',
          message: 'Hello there',
          inputTokens: 10,
          outputTokens: 20,
          title: 'New chat',
          imageUrl: 'https://example.com/image.png',
        },
      },
    );
    const { handler, store, router, chatStreamApi, fileStoreService } = await renderService({
      sendMessage: vi.fn().mockReturnValue(streamEvents),
    });

    handler.handleUserMessage('How are you?');

    await waitFor(() => {
      expect(chatStreamApi.sendMessage).toHaveBeenCalledWith({
        message: 'How are you?',
        chatId: undefined,
        modelId: 'model-1',
        modelDeveloper: 'openai',
        maxTokens: 4096,
        temperature: 0.7,
        isImageGeneration: false,
        isWebSearch: false,
        promptId: 'prompt-1',
        file,
      });
    });

    expect(store.selectSnapshot(ChatStore.getMessages)).toEqual([
      { role: 'user', content: 'How are you?', file, inputTokens: 10 },
      {
        role: 'assistant',
        content: 'Hello there',
        file: 'https://example.com/image.png',
        outputTokens: 20,
      },
    ]);
    expect(store.selectSnapshot(ChatStore.getOps).file).toBeUndefined();
    expect(store.selectSnapshot(ChatStore.getCurrentChatId)).toBe('chat-1');
    expect(store.selectSnapshot(ChatStore.isSending)).toBe(false);
    expect(store.selectSnapshot(AppStore.userChats)).toEqual([
      expect.objectContaining({ id: 'chat-1', title: 'New chat' }),
    ]);
    expect(router.navigate).toHaveBeenCalledWith(['/chat', 'chat-1'], { replaceUrl: true });
    expect(fileStoreService.clear).toHaveBeenCalled();
  });

  it('should log stream errors and reset the sending state', async () => {
    const consoleErrorSpy = vi.spyOn(console, 'error').mockImplementation(() => undefined);
    const { handler, store, router, chatStreamApi } = await renderService({
      sendMessage: vi.fn().mockReturnValue(throwError(() => new Error('Stream failed'))),
    });

    handler.handleUserMessage('How are you?');

    await waitFor(() => {
      expect(chatStreamApi.sendMessage).toHaveBeenCalled();
    });

    expect(consoleErrorSpy).toHaveBeenCalledWith('Message stream failed', expect.any(Error));
    expect(store.selectSnapshot(ChatStore.isSending)).toBe(false);
    expect(store.selectSnapshot(ChatStore.getMessages)).toEqual([
      { role: 'user', content: 'How are you?', file },
    ]);
    expect(router.navigate).not.toHaveBeenCalled();
  });
});
