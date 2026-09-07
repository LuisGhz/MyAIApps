import { inject, provideEnvironmentInitializer } from '@angular/core';
import { provideNoopAnimations } from '@angular/platform-browser/animations';
import { Store, provideStore } from '@ngxs/store';
import { render, waitFor } from '@testing-library/angular';
import { afterEach, beforeEach, describe, expect, it, vi } from 'vitest';

import { ChatActions } from '@st/chat/chat.actions';
import { ChatStore } from '@st/chat/chat.store';
import { ChatApi } from '../../services/chat-api';
import { AdvancedSettings } from './advanced-settings';

const createChatApiMock = (overrides?: Partial<ChatApi>) => ({
  updateMaxTokens: vi.fn().mockResolvedValue({ success: true }),
  updateTemperature: vi.fn().mockResolvedValue({ success: true }),
  ...overrides,
});

interface RenderOptions {
  currentChatId?: string | null;
  maxTokens?: number;
  temperature?: number;
}

describe('AdvancedSettings', () => {
  afterEach(() => {
    vi.useRealTimers();
  });

  beforeEach(() => {
    vi.clearAllMocks();
  });

  const renderComponent = async (options: RenderOptions = {}) => {
    const chatApi = createChatApiMock();
    const {
      currentChatId = 'chat-1',
      maxTokens = 3000,
      temperature = 0.6,
    } = options;

    const result = await render(AdvancedSettings, {
      providers: [
        provideStore([ChatStore]),
        provideNoopAnimations(),
        { provide: ChatApi, useValue: chatApi },
        provideEnvironmentInitializer(() => {
          const store = inject(Store);
          store.dispatch(new ChatActions.SetCurrentChatId(currentChatId));
          store.dispatch(
            new ChatActions.SetOps({
              maxTokens,
              temperature,
            }),
          );
        }),
      ],
      inputs: {
        isVisible: true,
      },
    });

    const store = result.fixture.debugElement.injector.get(Store);

    return { ...result, chatApi, store };
  };

  it('should populate the form from the current chat options when visible', async () => {
    const { fixture } = await renderComponent({ maxTokens: 4500, temperature: 0.8 });

    await waitFor(() => {
      expect(fixture.componentInstance.form.getRawValue()).toEqual({
        maxTokens: 4500,
        temperature: 0.8,
      });
    });
  });

  it('should update max tokens in the store immediately and persist them after the debounce', async () => {
    vi.useFakeTimers();
    const { fixture, chatApi, store } = await renderComponent({ maxTokens: 3000 });

    fixture.componentInstance.form.controls.maxTokens.setValue(3500);

    expect(store.selectSnapshot(ChatStore.getOps).maxTokens).toBe(3500);

    await vi.advanceTimersByTimeAsync(fixture.componentInstance.debounceDelay);

    expect(chatApi.updateMaxTokens).toHaveBeenCalledWith('chat-1', 3500);
  });

  it('should update temperature in the store immediately and persist it after the debounce', async () => {
    vi.useFakeTimers();
    const { fixture, chatApi, store } = await renderComponent({ temperature: 0.6 });

    fixture.componentInstance.form.controls.temperature.setValue(0.9);

    expect(store.selectSnapshot(ChatStore.getOps).temperature).toBe(0.9);

    await vi.advanceTimersByTimeAsync(fixture.componentInstance.debounceDelay);

    expect(chatApi.updateTemperature).toHaveBeenCalledWith('chat-1', 0.9);
  });

  it('should not persist invalid temperature values', async () => {
    vi.useFakeTimers();
    const { fixture, chatApi } = await renderComponent();

    fixture.componentInstance.form.controls.temperature.setValue(1.5);

    expect(fixture.componentInstance.form.controls.temperature.hasError('max')).toBe(true);

    await vi.advanceTimersByTimeAsync(fixture.componentInstance.debounceDelay);

    expect(chatApi.updateTemperature).not.toHaveBeenCalled();
  });
});
