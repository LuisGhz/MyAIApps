import { ActivatedRoute, Router } from '@angular/router';
import { Store, provideStore } from '@ngxs/store';
import { render, screen, waitFor } from '@testing-library/angular';
import userEvent from '@testing-library/user-event';
import { beforeEach, describe, expect, it, vi } from 'vitest';

import {
  createMockActivatedRoute,
  createMockRouter,
  provideTestNzIcons,
} from '@sh/testing';
import { AppStore } from '@st/app/app.store';
import { PromptResModel } from '../../models';
import { PromptsApi } from '../../services';
import { PromptFormPage } from './prompt-form-page';

const defaultPrompt: PromptResModel = {
  id: 'prompt-1',
  name: 'Summarize text',
  content: 'Please summarize the following text.',
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

const createPromptsApiMock = (overrides?: Partial<PromptsApi>) => ({
  create: vi.fn().mockResolvedValue(defaultPrompt),
  update: vi.fn().mockResolvedValue(defaultPrompt),
  getById: vi.fn().mockResolvedValue(defaultPrompt),
  deleteMessage: vi.fn().mockResolvedValue(undefined),
  ...overrides,
});

interface RenderOptions {
  promptId?: string | null;
  promptsApiOverrides?: Partial<PromptsApi>;
  routerOverrides?: Partial<Router>;
}

describe('PromptFormPage', () => {
  beforeEach(() => {
    vi.clearAllMocks();
  });

  const renderComponent = async (options: RenderOptions = {}) => {
    const promptsApi = createPromptsApiMock(options.promptsApiOverrides);
    const router = createMockRouter(options.routerOverrides);
    const route = createMockActivatedRoute({
      params: options.promptId ? { id: options.promptId } : {},
    });

    const result = await render(PromptFormPage, {
      providers: [
        provideStore([AppStore]),
        provideTestNzIcons(),
        { provide: PromptsApi, useValue: promptsApi },
        { provide: Router, useValue: router },
        { provide: ActivatedRoute, useValue: route },
      ],
    });

    const store = result.fixture.debugElement.injector.get(Store);

    return { ...result, promptsApi, router, store };
  };

  it('should create a new prompt when the form is valid', async () => {
    const user = userEvent.setup();
    const { fixture, promptsApi, router, store } = await renderComponent();

    await user.type(screen.getByPlaceholderText('Enter prompt name'), 'Weekly recap');
    await user.type(screen.getByPlaceholderText('Enter prompt content'), 'Summarize this week');
    fixture.componentInstance.onAddMessage();
    fixture.componentInstance.messages.at(0).patchValue({
      role: 'assistant',
      content: 'Here is your recap',
    });
    fixture.detectChanges();

    await user.click(screen.getByRole('button', { name: 'Create' }));

    await waitFor(() => {
      expect(promptsApi.create).toHaveBeenCalledWith({
        name: 'Weekly recap',
        content: 'Summarize this week',
        messages: [{ role: 'assistant', content: 'Here is your recap' }],
      });
    });

    expect(router.navigate).toHaveBeenCalledWith(['/prompts']);
    expect(store.selectSnapshot(AppStore.pageTitle)).toBe('New Prompt');
  });

  it('should load an existing prompt and update it in edit mode', async () => {
    const user = userEvent.setup();
    const { fixture, promptsApi, router, store } = await renderComponent({
      promptId: defaultPrompt.id,
    });

    await waitFor(() => {
      expect(promptsApi.getById).toHaveBeenCalledWith(defaultPrompt.id);
    });

    expect(screen.getByDisplayValue(defaultPrompt.name)).toBeInTheDocument();
    expect(screen.getByDisplayValue(defaultPrompt.content)).toBeInTheDocument();
    expect(screen.getByRole('button', { name: 'Update' })).toBeInTheDocument();
    expect(store.selectSnapshot(AppStore.pageTitle)).toBe('Edit Prompt');

    fixture.componentInstance.form.patchValue({
      name: 'Updated prompt',
      content: 'Updated content',
    });
    fixture.componentInstance.messages.at(0).patchValue({
      role: 'assistant',
      content: 'Updated message',
    });
    fixture.detectChanges();

    await user.click(screen.getByRole('button', { name: 'Update' }));

    await waitFor(() => {
      expect(promptsApi.update).toHaveBeenCalledWith(defaultPrompt.id, {
        name: 'Updated prompt',
        content: 'Updated content',
        messages: [{ role: 'assistant', content: 'Updated message' }],
      });
    });

    expect(router.navigate).toHaveBeenCalledWith(['/prompts']);
  });

  it('should add and remove local messages that are not persisted yet', async () => {
    const { fixture } = await renderComponent();

    fixture.componentInstance.onAddMessage();
    fixture.componentInstance.onAddMessage();

    expect(fixture.componentInstance.messages.length).toBe(2);

    await fixture.componentInstance.onRemoveMessage(0);

    expect(fixture.componentInstance.messages.length).toBe(1);
  });

  it('should delete persisted messages through the api before removing them', async () => {
    const { fixture, promptsApi } = await renderComponent({ promptId: defaultPrompt.id });

    await waitFor(() => {
      expect(fixture.componentInstance.messages.length).toBe(1);
    });

    await fixture.componentInstance.onRemoveMessage(0);

    expect(promptsApi.deleteMessage).toHaveBeenCalledWith(defaultPrompt.id, 'message-1');
    expect(fixture.componentInstance.messages.length).toBe(0);
  });

  it('should not submit when the form is invalid', async () => {
    const user = userEvent.setup();
    const { fixture, promptsApi } = await renderComponent();

    await user.click(screen.getByRole('button', { name: 'Create' }));

    expect(promptsApi.create).not.toHaveBeenCalled();
    expect(fixture.componentInstance.form.controls.name.touched).toBe(true);
    expect(fixture.componentInstance.form.controls.content.touched).toBe(true);
    expect(fixture.componentInstance.form.controls.name.hasError('required')).toBe(true);
    expect(fixture.componentInstance.form.controls.content.hasError('required')).toBe(true);
  });

  it('should reset the form and navigate back on cancel', async () => {
    const user = userEvent.setup();
    const { fixture, router } = await renderComponent();

    await user.type(screen.getByPlaceholderText('Enter prompt name'), 'Discard me');
    fixture.componentInstance.onAddMessage();
    fixture.componentInstance.messages.at(0).patchValue({
      role: 'user',
      content: 'Discard this message',
    });
    fixture.detectChanges();

    await user.click(screen.getAllByRole('button', { name: 'Cancel' })[0]);

    expect(fixture.componentInstance.form.getRawValue()).toEqual({
      name: '',
      content: '',
      messages: [],
    });
    expect(router.navigate).toHaveBeenCalledWith(['/prompts']);
  });
});
