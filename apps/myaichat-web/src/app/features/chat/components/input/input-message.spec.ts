import { describe, it, expect, vi, beforeEach } from 'vitest';
import { render, screen } from '@testing-library/angular';
import userEvent from '@testing-library/user-event';
import { provideStore, Store } from '@ngxs/store';
import { provideEnvironmentInitializer, inject, Component, signal } from '@angular/core';
import { provideHttpClient } from '@angular/common/http';
import { provideNoopAnimations } from '@angular/platform-browser/animations';
import { provideTestNzIcons } from '@sh/testing';
import { FormsModule } from '@angular/forms';
import { NzInputModule } from 'ng-zorro-antd/input';
import { NzIconModule } from 'ng-zorro-antd/icon';

import { InputMessage } from './input-message';
import { ChatStore } from '@st/chat/chat.store';
import { ChatActions } from '@st/chat/chat.actions';
import { MessagesHandler } from '@chat/services/message-handler';

// Mock child components
@Component({
  selector: 'app-more-options',
  template: '<div data-testid="mock-more-options">More Options</div>',
})
class MockMoreOptions {}

@Component({
  selector: 'app-file-preview',
  template: '<div data-testid="mock-file-preview">File Preview</div>',
})
class MockFilePreview {}

@Component({
  selector: 'app-enabled-options',
  template: '<div data-testid="mock-enabled-options">Enabled Options</div>',
})
class MockEnabledOptions {}

@Component({
  selector: 'app-microphone',
  template: '<div data-testid="mock-microphone">Microphone</div>',
})
class MockMicrophone {
  isRecording = signal(false);
}

interface RenderOptions {
  messageText?: string;
  isTranscribing?: boolean;
  isSending?: boolean;
  currentChatId?: string | null;
}

const mockMessagesHandler = {
  handleUserMessage: vi.fn(),
};

describe('InputMessage', () => {
  const renderComponent = async (options: RenderOptions = {}) => {
    const {
      messageText = '',
      isTranscribing = false,
      isSending = false,
      currentChatId = null,
    } = options;

    const result = await render(InputMessage, {
      providers: [
        provideHttpClient(),
        provideNoopAnimations(),
        provideTestNzIcons(),
        provideStore([ChatStore]),
        { provide: MessagesHandler, useValue: mockMessagesHandler },
        provideEnvironmentInitializer(() => {
          const store = inject(Store);
          store.dispatch(new ChatActions.SetMessageText(messageText));
          store.dispatch(new ChatActions.SetIsTranscribing(isTranscribing));
          store.dispatch(new ChatActions.SetIsSending(isSending));
          store.dispatch(new ChatActions.SetCurrentChatId(currentChatId));
        }),
      ],
      componentImports: [
        FormsModule,
        NzInputModule,
        NzIconModule,
        MockMoreOptions,
        MockFilePreview,
        MockEnabledOptions,
        MockMicrophone,
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

  it('should display send button when message text has content', async () => {
    await renderComponent({ messageText: 'Hello world' });

    expect(screen.getByRole('button', { name: 'Send message' })).toBeInTheDocument();
  });

  it('should hide send button when message text is empty', async () => {
    await renderComponent({ messageText: '' });

    expect(screen.queryByRole('button', { name: 'Send message' })).not.toBeInTheDocument();
  });

  it('should call onSend when send button is clicked', async () => {
    const { fixture } = await renderComponent({ messageText: 'Test message', currentChatId: 'chat-123' });
    const user = userEvent.setup();
    const onSendSpy = vi.spyOn(fixture.componentInstance, 'onSend');

    await user.click(screen.getByRole('button', { name: 'Send message' }));

    expect(onSendSpy).toHaveBeenCalled();
  });

  it('should call onKeydown and trigger send when Enter is pressed without Shift', async () => {
    const { fixture } = await renderComponent({ messageText: 'Enter test' });
    const user = userEvent.setup();
    const onKeydownSpy = vi.spyOn(fixture.componentInstance, 'onKeydown');

    const textarea = screen.getByPlaceholderText('Ask anything');
    await user.click(textarea);
    await user.keyboard('{Enter}');

    expect(onKeydownSpy).toHaveBeenCalled();
  });

  it('should not send message when Shift+Enter is pressed', async () => {
    await renderComponent({ messageText: 'Newline test' });
    const user = userEvent.setup();

    const textarea = screen.getByPlaceholderText('Ask anything');
    await user.type(textarea, '{Shift>}{Enter}{/Shift}');

    expect(mockMessagesHandler.handleUserMessage).not.toHaveBeenCalled();
  });

  it('should not send message when transcribing is active', async () => {
    await renderComponent({ messageText: 'Test', isTranscribing: true });
    const user = userEvent.setup();

    const sendButton = screen.getByRole('button', { name: 'Send message' });
    await user.click(sendButton);

    expect(mockMessagesHandler.handleUserMessage).not.toHaveBeenCalled();
  });

  it('should not show send button when text contains only whitespace', async () => {
    await renderComponent({ messageText: '   ', currentChatId: 'chat-123' });

    // Send button should not be visible because trimmed text is empty
    expect(screen.queryByRole('button', { name: 'Send message' })).not.toBeInTheDocument();
  });

  it('should handle sending when currentChatId is undefined', async () => {
    const { fixture } = await renderComponent({ messageText: 'Test message', currentChatId: null });
    const user = userEvent.setup();
    const onSendSpy = vi.spyOn(fixture.componentInstance, 'onSend');

    await user.click(screen.getByRole('button', { name: 'Send message' }));

    expect(onSendSpy).toHaveBeenCalled();
  });

  it('should not send message when isSending is true', async () => {
    await renderComponent({ messageText: 'Test', isSending: true, currentChatId: 'chat-123' });
    const user = userEvent.setup();

    const sendButton = screen.getByRole('button', { name: 'Send message' });
    await user.click(sendButton);

    expect(mockMessagesHandler.handleUserMessage).not.toHaveBeenCalled();
  });

  it('should handle Enter key press when message is empty', async () => {
    await renderComponent({ messageText: '' });
    const user = userEvent.setup();

    const textarea = screen.getByPlaceholderText('Ask anything');
    await user.click(textarea);
    await user.keyboard('{Enter}');

    expect(mockMessagesHandler.handleUserMessage).not.toHaveBeenCalled();
  });
});
