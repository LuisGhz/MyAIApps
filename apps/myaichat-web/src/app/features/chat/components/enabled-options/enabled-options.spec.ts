import { describe, it, expect, vi, beforeEach } from 'vitest';
import { render, screen } from '@testing-library/angular';
import userEvent from '@testing-library/user-event';
import { provideStore, Store } from '@ngxs/store';
import { provideEnvironmentInitializer, inject } from '@angular/core';
import { provideHttpClient } from '@angular/common/http';
import { provideNoopAnimations } from '@angular/platform-browser/animations';
import { provideTestNzIcons } from '@sh/testing';

import { EnabledOptions } from './enabled-options';
import { ChatStore } from '@st/chat/chat.store';
import { ChatActions } from '@st/chat/chat.actions';
import { ChatApi } from '@chat/services/chat-api';

interface RenderOptions {
  isImageGeneration?: boolean;
  isWebSearch?: boolean;
  currentChatId?: string | null;
}

const mockChatApi = {
  updateAIFeatures: vi.fn().mockResolvedValue({}),
};

describe('EnabledOptions', () => {
  const renderComponent = async (options: RenderOptions = {}) => {
    const {
      isImageGeneration = false,
      isWebSearch = false,
      currentChatId = null,
    } = options;

    const result = await render(EnabledOptions, {
      providers: [
        provideHttpClient(),
        provideNoopAnimations(),
        provideTestNzIcons(),
        provideStore([ChatStore]),
        { provide: ChatApi, useValue: mockChatApi },
        provideEnvironmentInitializer(() => {
          const store = inject(Store);
          store.dispatch(new ChatActions.SetOps({ isImageGeneration, isWebSearch }));
          store.dispatch(new ChatActions.SetCurrentChatId(currentChatId));
        }),
      ],
    });

    const store = result.fixture.debugElement.injector.get(Store);

    return { ...result, store };
  };

  beforeEach(() => {
    vi.clearAllMocks();
  });

  it('should create', async () => {
    const { fixture } = await renderComponent();
    expect(fixture.componentInstance).toBeTruthy();
  });

  it('should display image generation option when enabled', async () => {
    await renderComponent({ isImageGeneration: true });

    expect(screen.getByText('Generate Image')).toBeInTheDocument();
  });

  it('should display web search option when enabled', async () => {
    await renderComponent({ isWebSearch: true });

    expect(screen.getByText('Search on the web')).toBeInTheDocument();
  });

  it('should close image generation and update API when clicked with existing chat', async () => {
    const { store } = await renderComponent({
      isImageGeneration: true,
      currentChatId: 'test-chat-123',
    });
    const user = userEvent.setup();

    await user.click(screen.getByText('Generate Image'));

    expect(store.selectSnapshot(ChatStore.isImageGeneration)).toBe(false);
    expect(mockChatApi.updateAIFeatures).toHaveBeenCalledWith('test-chat-123', {
      isImageGeneration: false,
      isWebSearch: false,
    });
  });

  it('should close web search and update API when clicked with existing chat', async () => {
    const { store } = await renderComponent({
      isWebSearch: true,
      currentChatId: 'test-chat-456',
    });
    const user = userEvent.setup();

    await user.click(screen.getByText('Search on the web'));

    expect(store.selectSnapshot(ChatStore.isWebSearch)).toBe(false);
    expect(mockChatApi.updateAIFeatures).toHaveBeenCalledWith('test-chat-456', {
      isImageGeneration: false,
      isWebSearch: false,
    });
  });

  it('should close image generation without API call when no chat exists', async () => {
    const { store } = await renderComponent({
      isImageGeneration: true,
      currentChatId: null,
    });
    const user = userEvent.setup();

    await user.click(screen.getByText('Generate Image'));

    expect(store.selectSnapshot(ChatStore.isImageGeneration)).toBe(false);
    expect(mockChatApi.updateAIFeatures).not.toHaveBeenCalled();
  });

  it('should show close icon when hovering over image generation option', async () => {
    await renderComponent({ isImageGeneration: true });
    const user = userEvent.setup();

    const option = screen.getByText('Generate Image').parentElement;
    await user.hover(option!);

    const buttons = screen.getAllByRole('button');
    expect(buttons.some(b => b.querySelector('[nzType="close-circle"]'))).toBeTruthy();
  });

  it('should show close icon when hovering over web search option', async () => {
    await renderComponent({ isWebSearch: true });
    const user = userEvent.setup();

    const option = screen.getByText('Search on the web').parentElement;
    await user.hover(option!);

    const buttons = screen.getAllByRole('button');
    expect(buttons.some(b => b.querySelector('[nzType="close-circle"]'))).toBeTruthy();
  });

  it('should display both options when both are enabled', async () => {
    await renderComponent({
      isImageGeneration: true,
      isWebSearch: true,
    });

    expect(screen.getByText('Generate Image')).toBeInTheDocument();
    expect(screen.getByText('Search on the web')).toBeInTheDocument();
  });

  it('should handle API error gracefully when updating features', async () => {
    mockChatApi.updateAIFeatures.mockRejectedValue(new Error('Network error'));
    const { store } = await renderComponent({
      isImageGeneration: true,
      currentChatId: 'test-chat-789',
    });
    const user = userEvent.setup();

    await user.click(screen.getByText('Generate Image'));

    expect(store.selectSnapshot(ChatStore.isImageGeneration)).toBe(false);
    expect(mockChatApi.updateAIFeatures).toHaveBeenCalled();
  });

  it('should close web search without API call when no chat exists', async () => {
    const { store } = await renderComponent({
      isWebSearch: true,
      currentChatId: null,
    });
    const user = userEvent.setup();

    await user.click(screen.getByText('Search on the web'));

    expect(store.selectSnapshot(ChatStore.isWebSearch)).toBe(false);
    expect(mockChatApi.updateAIFeatures).not.toHaveBeenCalled();
  });

  it('should reset hover state when closing image generation', async () => {
    const { fixture } = await renderComponent({
      isImageGeneration: true,
      currentChatId: 'test-chat-123',
    });
    const user = userEvent.setup();

    const option = screen.getByText('Generate Image').parentElement;
    await user.hover(option!);
    await user.click(screen.getByText('Generate Image'));

    expect(fixture.componentInstance.isImageGenerationHovered()).toBe(false);
  });

  it('should reset hover state when closing web search', async () => {
    const { fixture } = await renderComponent({
      isWebSearch: true,
      currentChatId: 'test-chat-123',
    });
    const user = userEvent.setup();

    const option = screen.getByText('Search on the web').parentElement;
    await user.hover(option!);
    await user.click(screen.getByText('Search on the web'));

    expect(fixture.componentInstance.isWebSearchHovered()).toBe(false);
  });
});
