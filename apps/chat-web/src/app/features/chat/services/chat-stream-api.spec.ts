import { TestBed } from '@angular/core/testing';
import { Store, provideStore } from '@ngxs/store';
import { EMPTY } from 'rxjs';
import { beforeEach, describe, expect, it, vi } from 'vitest';

import { AuthStore } from '@st/auth/auth.store';
import { ChatStreamApi } from './chat-stream-api';

describe('ChatStreamApi', () => {
  let service: ChatStreamApi;

  beforeEach(() => {
    vi.clearAllMocks();
    TestBed.configureTestingModule({
      providers: [ChatStreamApi, provideStore([AuthStore])],
    });

    service = TestBed.inject(ChatStreamApi);
    TestBed.inject(Store);
  });

  it('should build form data and delegate to ssePost', () => {
    const file = new File(['hello'], 'notes.txt', { type: 'text/plain' });
    const ssePostSpy = vi
      .spyOn(service as unknown as { ssePost: (path: string, body: FormData) => unknown }, 'ssePost')
      .mockReturnValue(EMPTY);

    service.sendMessage({
      chatId: 'chat-1',
      message: 'Hello there',
      modelId: 'model-1',
      modelDeveloper: 'OpenAI',
      maxTokens: 4096,
      temperature: 0.7,
      isImageGeneration: true,
      isWebSearch: false,
      promptId: 'prompt-1',
      file,
    });

    expect(ssePostSpy).toHaveBeenCalledOnce();

    const [path, formData] = ssePostSpy.mock.calls[0];
    const appendedFile = formData.get('file');

    expect(path).toBe('/chat/send-message');
    expect(formData.get('chatId')).toBe('chat-1');
    expect(formData.get('message')).toBe('Hello there');
    expect(formData.get('modelId')).toBe('model-1');
    expect(formData.get('modelDeveloper')).toBe('OpenAI');
    expect(formData.get('maxTokens')).toBe('4096');
    expect(formData.get('temperature')).toBe('0.7');
    expect(formData.get('isImageGeneration')).toBe('true');
    expect(formData.get('isWebSearch')).toBe('false');
    expect(formData.get('promptId')).toBe('prompt-1');
    expect(appendedFile).toBeInstanceOf(File);
    expect((appendedFile as File).name).toBe(file.name);
    expect((appendedFile as File).size).toBe(file.size);
  });

  it('should omit optional fields when they are not provided', () => {
    const ssePostSpy = vi
      .spyOn(service as unknown as { ssePost: (path: string, body: FormData) => unknown }, 'ssePost')
      .mockReturnValue(EMPTY);

    service.sendMessage({
      message: 'Hello there',
      modelId: 'model-1',
      modelDeveloper: 'OpenAI',
      maxTokens: 4096,
      temperature: 0.7,
      isImageGeneration: false,
      isWebSearch: true,
    });

    const [, formData] = ssePostSpy.mock.calls[0];

    expect(formData.has('chatId')).toBe(false);
    expect(formData.has('promptId')).toBe(false);
    expect(formData.has('file')).toBe(false);
  });
});
