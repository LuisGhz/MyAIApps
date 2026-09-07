import { Component } from '@angular/core';
import { Store, provideStore } from '@ngxs/store';
import { render } from '@testing-library/angular';
import { beforeEach, describe, expect, it, vi } from 'vitest';
import { firstValueFrom } from 'rxjs';

import { FileStoreService } from './services';
import { ChatActions } from './chat.actions';
import { ChatStore } from './chat.store';

@Component({
  template: '',
})
class TestHost {}

describe('ChatStore', () => {
  const fileStoreService = {
    clear: vi.fn(),
  };

  beforeEach(() => {
    vi.clearAllMocks();
  });

  const renderStore = async () => {
    const result = await render(TestHost, {
      providers: [
        provideStore([ChatStore]),
        { provide: FileStoreService, useValue: fileStoreService },
      ],
    });

    const store = result.fixture.debugElement.injector.get(Store);

    return { ...result, store };
  };

  it('should expose default selectors and update basic chat options and flags', async () => {
    const { store } = await renderStore();

    expect(store.selectSnapshot(ChatStore.getMessages)).toEqual([]);
    expect(store.selectSnapshot(ChatStore.getCurrentChatId)).toBeNull();
    expect(store.selectSnapshot(ChatStore.getMessageText)).toBe('');
    expect(store.selectSnapshot(ChatStore.isTranscribing)).toBe(false);
    expect(store.selectSnapshot(ChatStore.isSending)).toBe(false);
    expect(store.selectSnapshot(ChatStore.hasMoreMessages)).toBe(true);
    expect(store.selectSnapshot(ChatStore.isLoadingOlderMessages)).toBe(false);

    await firstValueFrom(store.dispatch(new ChatActions.SetCurrentChatId('chat-1')));
    await firstValueFrom(
      store.dispatch(
        new ChatActions.SetOps({
          modelId: 'model-1',
          modelDeveloper: 'OpenAI',
          maxTokens: 4096,
          temperature: 0.7,
          file: {
            id: 'file-1',
            name: 'notes.txt',
            size: 5,
            type: 'text/plain',
            lastModified: 1,
          },
          promptId: 'prompt-1',
        }),
      ),
    );
    await firstValueFrom(store.dispatch(new ChatActions.SetMessageText('Hello')));
    await firstValueFrom(store.dispatch(new ChatActions.SetIsTranscribing(true)));
    await firstValueFrom(store.dispatch(new ChatActions.SetIsSending(true)));
    await firstValueFrom(store.dispatch(new ChatActions.SetIsLoadingOlderMessages(true)));

    expect(store.selectSnapshot(ChatStore.getCurrentChatId)).toBe('chat-1');
    expect(store.selectSnapshot(ChatStore.getMessageText)).toBe('Hello');
    expect(store.selectSnapshot(ChatStore.isTranscribing)).toBe(true);
    expect(store.selectSnapshot(ChatStore.isSending)).toBe(true);
    expect(store.selectSnapshot(ChatStore.isLoadingOlderMessages)).toBe(true);
    expect(store.selectSnapshot(ChatStore.getOps)).toEqual({
      modelId: 'model-1',
      modelDeveloper: 'OpenAI',
      maxTokens: 4096,
      temperature: 0.7,
      file: {
        id: 'file-1',
        name: 'notes.txt',
        size: 5,
        type: 'text/plain',
        lastModified: 1,
      },
      isImageGeneration: false,
      isWebSearch: false,
      promptId: 'prompt-1',
    });
  });

  it('should manage user and assistant messages including metadata updates', async () => {
    const { store } = await renderStore();
    const file = new File(['hello'], 'notes.txt', { type: 'text/plain' });

    await firstValueFrom(store.dispatch(new ChatActions.AddUserMessage('Hello', file)));
    await firstValueFrom(store.dispatch(new ChatActions.AddAssistantMessage('Hi')));
    await firstValueFrom(
      store.dispatch(new ChatActions.AddAssistantChunk({ content: ' there', imageUrl: 'image.png' })),
    );
    await firstValueFrom(
      store.dispatch(new ChatActions.SetMessagesMetadata({ inputTokens: 10, outputTokens: 20 })),
    );

    expect(store.selectSnapshot(ChatStore.getMessages)).toEqual([
      { role: 'user', content: 'Hello', file, inputTokens: 10 },
      {
        role: 'assistant',
        content: 'Hi there',
        file: 'image.png',
        outputTokens: 20,
      },
    ]);
  });

  it('should load and prepend historical messages while tracking pagination state', async () => {
    const { store } = await renderStore();
    const latestMessages = [
      { role: 'assistant' as const, content: 'Latest response' },
    ];
    const previousMessages = [
      { role: 'user' as const, content: 'Older question' },
    ];

    await firstValueFrom(
      store.dispatch(
        new ChatActions.LoadMessages({
          messages: latestMessages,
          maxTokens: 2048,
          temperature: 0.4,
          hasMore: true,
        }),
      ),
    );
    await firstValueFrom(
      store.dispatch(
        new ChatActions.PrependMessages({
          messages: previousMessages,
          hasMore: false,
        }),
      ),
    );

    expect(store.selectSnapshot(ChatStore.getMessages)).toEqual([
      ...previousMessages,
      ...latestMessages,
    ]);
    expect(store.selectSnapshot(ChatStore.getOps).maxTokens).toBe(2048);
    expect(store.selectSnapshot(ChatStore.getOps).temperature).toBe(0.4);
    expect(store.selectSnapshot(ChatStore.hasMoreMessages)).toBe(false);
  });

  it('should toggle chat features, remove files, and reset the state while clearing the file store', async () => {
    const { store } = await renderStore();

    await firstValueFrom(
      store.dispatch(
        new ChatActions.SetOps({
          file: {
            id: 'file-1',
            name: 'notes.txt',
            size: 5,
            type: 'text/plain',
            lastModified: 1,
          },
        }),
      ),
    );
    await firstValueFrom(store.dispatch(new ChatActions.EnableImageGeneration()));
    expect(store.selectSnapshot(ChatStore.isImageGeneration)).toBe(true);
    expect(store.selectSnapshot(ChatStore.isWebSearch)).toBe(false);

    await firstValueFrom(store.dispatch(new ChatActions.DisableImageGeneration()));
    expect(store.selectSnapshot(ChatStore.isImageGeneration)).toBe(false);

    await firstValueFrom(store.dispatch(new ChatActions.EnableWebSearch()));
    expect(store.selectSnapshot(ChatStore.isWebSearch)).toBe(true);
    expect(store.selectSnapshot(ChatStore.isImageGeneration)).toBe(false);

    await firstValueFrom(store.dispatch(new ChatActions.DisableWebSearch()));
    expect(store.selectSnapshot(ChatStore.isWebSearch)).toBe(false);

    await firstValueFrom(store.dispatch(new ChatActions.RemoveFile()));
    expect(store.selectSnapshot(ChatStore.getOps).file).toBeUndefined();

    await firstValueFrom(store.dispatch(new ChatActions.ResetChat()));

    expect(store.selectSnapshot(ChatStore.getMessages)).toEqual([]);
    expect(store.selectSnapshot(ChatStore.getCurrentChatId)).toBeNull();
    expect(store.selectSnapshot(ChatStore.getMessageText)).toBe('');
    expect(store.selectSnapshot(ChatStore.isTranscribing)).toBe(false);
    expect(store.selectSnapshot(ChatStore.isSending)).toBe(false);
    expect(fileStoreService.clear).toHaveBeenCalledOnce();
  });
});
