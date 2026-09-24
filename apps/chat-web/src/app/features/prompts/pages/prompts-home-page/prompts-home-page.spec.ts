import { provideNoopAnimations } from '@angular/platform-browser/animations';
import { Router } from '@angular/router';
import { Store, provideStore } from '@ngxs/store';
import { render, screen, waitFor } from '@testing-library/angular';
import userEvent from '@testing-library/user-event';
import { beforeEach, describe, expect, it, vi } from 'vitest';

import { createMockRouter, provideTestNzIcons } from '@sh/testing';
import { AppStore } from '@st/app/app.store';
import { PromptListItemResModel } from '../../models';
import { PromptsApi } from '../../services';
import { PromptsHomePage } from './prompts-home-page';

const defaultPrompts: PromptListItemResModel[] = [
  {
    id: 'prompt-1',
    name: 'Summarize text',
    content: 'Please summarize the following text.',
    chatId: 'chat-1',
    messageCount: 1,
    createdAt: new Date('2024-01-01T00:00:00.000Z'),
    updatedAt: new Date('2024-01-02T00:00:00.000Z'),
  },
];

const createPromptsApiMock = (overrides?: Partial<PromptsApi>) => ({
  fetchAll: vi.fn().mockResolvedValue(defaultPrompts),
  deletePrompt: vi.fn().mockResolvedValue(undefined),
  ...overrides,
});

interface RenderOptions {
  prompts?: PromptListItemResModel[];
  promptsApiOverrides?: Partial<PromptsApi>;
  routerOverrides?: Partial<Router>;
}

describe('PromptsHomePage', () => {
  beforeEach(() => {
    vi.clearAllMocks();
  });

  const renderComponent = async (options: RenderOptions = {}) => {
    const promptsApi = createPromptsApiMock({
      fetchAll: vi.fn().mockResolvedValue(options.prompts ?? defaultPrompts),
      ...options.promptsApiOverrides,
    });
    const router = createMockRouter(options.routerOverrides);

    const result = await render(PromptsHomePage, {
      providers: [
        provideStore([AppStore]),
        provideNoopAnimations(),
        provideTestNzIcons(),
        { provide: PromptsApi, useValue: promptsApi },
        { provide: Router, useValue: router },
      ],
    });

    const store = result.fixture.debugElement.injector.get(Store);

    return { ...result, promptsApi, router, store };
  };

  it('should render the loaded prompts and set the page title', async () => {
    const { store } = await renderComponent();

    await waitFor(() => {
      expect(screen.getByText('Summarize text')).toBeInTheDocument();
    });

    expect(store.selectSnapshot(AppStore.pageTitle)).toBe('Prompts');
  });

  it('should show the empty state when there are no prompts', async () => {
    await renderComponent({ prompts: [] });

    await waitFor(() => {
      expect(screen.getByText('No prompts yet')).toBeInTheDocument();
    });
  });

  it('should navigate to the create prompt page when clicking New Prompt', async () => {
    const { router } = await renderComponent();
    const user = userEvent.setup();

    await user.click(screen.getByRole('button', { name: /new prompt/i }));

    expect(router.navigate).toHaveBeenCalledWith(['/prompts', 'new']);
  });

  it('should navigate to the selected prompt when clicking a prompt row', async () => {
    const { router } = await renderComponent();
    const user = userEvent.setup();

    await waitFor(() => {
      expect(screen.getByText('Summarize text')).toBeInTheDocument();
    });

    await user.click(screen.getByText('Summarize text'));

    expect(router.navigate).toHaveBeenCalledWith(['/prompts', 'prompt-1']);
  });

  it('should stop propagation and navigate when editing a prompt', async () => {
    const { fixture, router } = await renderComponent();
    const event = new Event('click');
    const stopPropagationSpy = vi.spyOn(event, 'stopPropagation');

    fixture.componentInstance.onEdit('prompt-1', event);

    expect(stopPropagationSpy).toHaveBeenCalledOnce();
    expect(router.navigate).toHaveBeenCalledWith(['/prompts', 'prompt-1']);
  });

  it('should stop propagation and delete a prompt', async () => {
    const { fixture, promptsApi } = await renderComponent();
    const event = new Event('click');
    const stopPropagationSpy = vi.spyOn(event, 'stopPropagation');

    await fixture.componentInstance.onDelete('prompt-1', event);

    expect(stopPropagationSpy).toHaveBeenCalledOnce();
    expect(promptsApi.deletePrompt).toHaveBeenCalledWith('prompt-1');
  });
});
