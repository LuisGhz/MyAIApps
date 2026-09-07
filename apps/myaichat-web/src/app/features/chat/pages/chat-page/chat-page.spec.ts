import { describe, it, expect, vi, beforeEach } from 'vitest';
import { render, screen, waitFor } from '@testing-library/angular';
import userEvent from '@testing-library/user-event';
import { Component, inject, Input, provideEnvironmentInitializer } from '@angular/core';
import { provideRouter, ActivatedRoute } from '@angular/router';
import { provideHttpClient } from '@angular/common/http';
import { provideNoopAnimations } from '@angular/platform-browser/animations';
import { FormsModule } from '@angular/forms';
import { NzSelectModule } from 'ng-zorro-antd/select';
import { Store, provideStore } from '@ngxs/store';
import { Subject } from 'rxjs';

import { ChatPage } from './chat-page';
import { ChatStore } from '@st/chat/chat.store';
import { ChatActions } from '@st/chat/chat.actions';
import { AppStore } from '@st/app/app.store';
import { AuthStore } from '@st/auth/auth.store';
import { AuthActions } from '@st/auth/auth.actions';
import { AiModelsApi } from '@chat/services/ai-models-api';
import { ChatApi } from '@chat/services/chat-api';
import { createTestJwt, provideTestNzIcons } from '@sh/testing';
import type { AiModelModel, PromptItemSummaryResModel } from '@chat/models';

// Mock InputMessage component
@Component({
  selector: 'app-input-message',
  template: '<div data-testid="input-message">Mock Input Message</div>',
})
class MockInputMessage {}

// Mock Messages component
@Component({
  selector: 'app-messages',
  template: '<div data-testid="messages">Mock Messages</div>',
})
class MockMessages {
  @Input('animate.enter') animateEnter?: string;
}

// Mock data
const mockModels: AiModelModel[] = [
  {
    id: '1',
    name: 'GPT-4',
    shortName: 'GPT-4',
    value: 'gpt-4',
    developer: { name: 'OpenAI', imageUrl: 'https://example.com/openai.png' },
  },
  {
    id: '2',
    name: 'Claude',
    shortName: 'Claude',
    value: 'claude-3',
    developer: { name: 'Anthropic', imageUrl: 'https://example.com/anthropic.png' },
  },
];

const mockPrompts: PromptItemSummaryResModel[] = [
  { id: 'prompt-1', name: 'Code Review' },
  { id: 'prompt-2', name: 'Writing Assistant' },
];

// Service mocks
const mockAiModelsApi = {
  getAiModels: vi.fn().mockResolvedValue(mockModels),
};

const mockChatApi = {
  getPrompts: vi.fn().mockResolvedValue(mockPrompts),
  loadMessages: vi.fn().mockResolvedValue(undefined),
  loadOlderMessages: vi.fn().mockResolvedValue({ messages: [], hasMore: false }),
};

// Activated route params subject for testing navigation
const routeParamsSubject = new Subject<{ id?: string }>();

const mockActivatedRoute = {
  params: routeParamsSubject.asObservable(),
  snapshot: { params: {} },
};

interface RenderOptions {
  routeParams?: { id?: string };
  withMessages?: boolean;
  models?: AiModelModel[];
  prompts?: PromptItemSummaryResModel[];
}

describe('ChatPage', () => {
  beforeEach(() => {
    vi.clearAllMocks();
    mockAiModelsApi.getAiModels.mockResolvedValue(mockModels);
    mockChatApi.getPrompts.mockResolvedValue(mockPrompts);
    mockChatApi.loadMessages.mockResolvedValue(undefined);
    mockActivatedRoute.snapshot = { params: {} };

    // Mock scrollTo to prevent errors
    Element.prototype.scrollTo = vi.fn();
  });

  const renderComponent = async (options?: RenderOptions) => {
    const { routeParams = {}, models = mockModels, prompts = mockPrompts } = options ?? {};

    // Update mock implementations based on options
    mockAiModelsApi.getAiModels.mockResolvedValue(models);
    mockChatApi.getPrompts.mockResolvedValue(prompts);
    mockActivatedRoute.snapshot = { params: routeParams };

    const result = await render(ChatPage, {
      providers: [
        provideHttpClient(),
        provideNoopAnimations(),
        provideTestNzIcons(),
        provideRouter([]),
        provideStore([ChatStore, AppStore, AuthStore]),
        provideEnvironmentInitializer(() => {
          const store = inject(Store);
          store.dispatch(new AuthActions.Login({ token: createTestJwt() }));
        }),
        { provide: AiModelsApi, useValue: mockAiModelsApi },
        { provide: ChatApi, useValue: mockChatApi },
        { provide: ActivatedRoute, useValue: mockActivatedRoute },
      ],
      componentImports: [
        FormsModule,
        NzSelectModule,
        MockInputMessage,
        MockMessages,
      ],
    });

    // Get store instance
    const store = result.fixture.debugElement.injector.get(Store);

    // Emit initial route params
    routeParamsSubject.next(routeParams);

    return { ...result, store, user: userEvent.setup() };
  };

  it('should create the component', async () => {
    const { fixture } = await renderComponent();
    expect(fixture.componentInstance).toBeTruthy();
  });

  it('should display welcome message and selectors when starting new chat', async () => {
    await renderComponent();

    await waitFor(() => {
      expect(screen.getByRole('heading', { name: /what can i help with\?/i })).toBeInTheDocument();
    });

    expect(screen.getByTestId('input-message')).toBeInTheDocument();
  });

  it('should load models and prompts on initialization', async () => {
    await renderComponent();

    await waitFor(() => {
      expect(mockAiModelsApi.getAiModels).toHaveBeenCalled();
      expect(mockChatApi.getPrompts).toHaveBeenCalled();
    });
  });

  it('should display messages component when chat has messages', async () => {
    const { store } = await renderComponent({ routeParams: { id: 'chat-123' } });

    store.dispatch(new ChatActions.LoadMessages({
      messages: [
        { id: '1', role: 'user', content: 'Hello' },
        { id: '2', role: 'assistant', content: 'Hi there!' },
      ],
      maxTokens: 2000,
      temperature: 0.5,
      hasMore: false,
    }));

    await waitFor(() => {
      expect(screen.getByTestId('messages')).toBeInTheDocument();
      expect(screen.queryByRole('heading', { name: /what can i help with\?/i })).not.toBeInTheDocument();
    });
  });

  it('should set default model ops in store on initialization', async () => {
    const { store } = await renderComponent();

    await waitFor(() => {
      const chatOps = store.selectSnapshot(ChatStore.getOps);
      expect(chatOps.modelDeveloper).toBe('OpenAI');
      expect(chatOps.modelId).toBe('1');
    });
  });

  it('should load messages when navigating to existing chat', async () => {
    const chatId = 'existing-chat-456';
    await renderComponent({ routeParams: { id: chatId } });

    await waitFor(() => {
      expect(mockChatApi.loadMessages).toHaveBeenCalledWith(chatId);
    });
  });

  it('should reset chat when navigating from chat to new chat page', async () => {
    const { store } = await renderComponent({ routeParams: { id: 'chat-123' } });

    store.dispatch(new ChatActions.LoadMessages({
      messages: [
        { id: '1', role: 'user', content: 'Hello' },
      ],
      maxTokens: 2000,
      temperature: 0.5,
      hasMore: false,
    }));

    await waitFor(() => {
      expect(store.selectSnapshot(ChatStore.getMessages).length).toBe(1);
    });

    routeParamsSubject.next({});

    await waitFor(() => {
      expect(store.selectSnapshot(ChatStore.getMessages).length).toBe(0);
      expect(store.selectSnapshot(ChatStore.getCurrentChatId)).toBeNull();
    });
  });

  it('should not display model selector when no models are available', async () => {
    await renderComponent({ models: [] });

    await waitFor(() => {
      const selects = screen.queryAllByRole('combobox');
      expect(selects.length).toBe(0);
    });
  });

  it('should not display prompt selector when no prompts are available', async () => {
    const { container } = await renderComponent({ prompts: [] });

    await waitFor(() => {
      const selects = container.querySelectorAll('nz-select');
      // Only model selector should be present (prompts selector is conditionally hidden)
      expect(selects.length).toBe(1);
    });
  });

  it('should handle message loading for existing chat when API returns no messages', async () => {
    const chatId = 'empty-chat-789';
    mockChatApi.loadMessages.mockResolvedValue(undefined);

    const { store } = await renderComponent({ routeParams: { id: chatId } });

    await waitFor(() => {
      expect(mockChatApi.loadMessages).toHaveBeenCalledWith(chatId);
      expect(store.selectSnapshot(ChatStore.getCurrentChatId)).toBe(chatId);
    });
  });

  it('should handle navigation to non-existent chat', async () => {
    const nonExistentChatId = 'non-existent-chat';
    mockChatApi.loadMessages.mockResolvedValue(undefined);

    const { store } = await renderComponent({ routeParams: { id: nonExistentChatId } });

    await waitFor(() => {
      expect(mockChatApi.loadMessages).toHaveBeenCalledWith(nonExistentChatId);
      expect(store.selectSnapshot(ChatStore.getCurrentChatId)).toBe(nonExistentChatId);
    });
  });
});
