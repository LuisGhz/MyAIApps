import { describe, it, expect, vi, beforeEach } from 'vitest';
import { render, screen } from '@testing-library/angular';
import userEvent from '@testing-library/user-event';
import { provideStore, Store } from '@ngxs/store';
import { provideEnvironmentInitializer, inject } from '@angular/core';
import { provideHttpClient } from '@angular/common/http';
import { provideNoopAnimations } from '@angular/platform-browser/animations';
import { provideTestNzIcons } from '@sh/testing';
import { provideMarkdown } from 'ngx-markdown';

import { Messages } from './messages';
import { ChatStore } from '@st/chat/chat.store';
import { ChatActions } from '@st/chat/chat.actions';
import { Message } from '@st/chat/models';

interface RenderOptions {
  messages?: Message[];
}

const createMockMessage = (overrides: Partial<Message> = {}): Message => ({
  role: 'user',
  content: 'Test message',
  ...overrides,
});

describe('Messages', () => {
  const renderComponent = async (options: RenderOptions = {}) => {
    const { messages = [] } = options;

    const result = await render(Messages, {
      providers: [
        provideHttpClient(),
        provideNoopAnimations(),
        provideTestNzIcons(),
        provideMarkdown(),
        provideStore([ChatStore]),
        provideEnvironmentInitializer(() => {
          const store = inject(Store);
          if (messages.length > 0) {
            store.dispatch(
              new ChatActions.LoadMessages({
                messages,
                maxTokens: 2000,
                temperature: 0.5,
                hasMore: false,
              }),
            );
          }
        }),
      ],
    });

    const store = result.fixture.debugElement.injector.get(Store);

    return { ...result, store, createMockMessage };
  };

  const clipboardWriteTextMock = vi.fn().mockResolvedValue(undefined);

  beforeEach(() => {
    vi.clearAllMocks();
    // Mock clipboard API using vi.stubGlobal
    vi.stubGlobal('navigator', {
      ...navigator,
      clipboard: {
        writeText: clipboardWriteTextMock,
      },
    });
  });

  it('should create', async () => {
    const { fixture } = await renderComponent();
    expect(fixture.componentInstance).toBeTruthy();
  });

  it('should display user message content', async () => {
    const messages = [createMockMessage({ role: 'user', content: 'Hello AI!' })];
    await renderComponent({ messages });

    expect(screen.getByText('Hello AI!')).toBeInTheDocument();
  });

  it('should display assistant message content', async () => {
    const messages = [createMockMessage({ role: 'assistant', content: 'Hello human!' })];
    await renderComponent({ messages });

    expect(screen.getByText('Hello human!')).toBeInTheDocument();
  });

  it('should call onCopyClick when copy button is clicked', async () => {
    const messages = [createMockMessage({ role: 'user', content: 'Copy me' })];
    const { fixture } = await renderComponent({ messages });
    const user = userEvent.setup();
    const onCopyClickSpy = vi.spyOn(fixture.componentInstance, 'onCopyClick');

    await user.click(screen.getByRole('button', { name: 'Copy message' }));

    expect(onCopyClickSpy).toHaveBeenCalledWith('Copy me', 0);
  });

  it('should display multiple messages in order', async () => {
    const messages = [
      createMockMessage({ role: 'user', content: 'First message' }),
      createMockMessage({ role: 'assistant', content: 'Second message' }),
      createMockMessage({ role: 'user', content: 'Third message' }),
    ];
    await renderComponent({ messages });

    expect(screen.getByText('First message')).toBeInTheDocument();
    expect(screen.getByText('Second message')).toBeInTheDocument();
    expect(screen.getByText('Third message')).toBeInTheDocument();
  });

  it('should display token count when available', async () => {
    const messages = [createMockMessage({ role: 'assistant', content: 'Response', outputTokens: 150 })];
    await renderComponent({ messages });

    expect(screen.getByText('Tokens: 150')).toBeInTheDocument();
  });

  it('should not display token count when undefined', async () => {
    const messages = [createMockMessage({ role: 'assistant', content: 'Response', outputTokens: undefined })];
    await renderComponent({ messages });

    expect(screen.queryByText(/Tokens:/)).not.toBeInTheDocument();
  });

  it('should not display token count when outputTokens is 0', async () => {
    const messages = [createMockMessage({ role: 'assistant', content: 'Response', outputTokens: 0 })];
    await renderComponent({ messages });

    // Template checks for truthiness, so 0 won't display
    expect(screen.queryByText(/Tokens:/)).not.toBeInTheDocument();
  });

  it('should render message container when content is empty', async () => {
    const messages = [createMockMessage({ role: 'user', content: '' })];
    await renderComponent({ messages });

    // Check that copy button is rendered, indicating the message container exists
    expect(screen.getByRole('button', { name: 'Copy message' })).toBeInTheDocument();
  });

  it('should display markdown for message with only whitespace', async () => {
    const messages = [createMockMessage({ role: 'user', content: '   ' })];
    await renderComponent({ messages });

    // Verify the message container exists by checking for the copy button
    expect(screen.getByRole('button', { name: 'Copy message' })).toBeInTheDocument();
  });
});
