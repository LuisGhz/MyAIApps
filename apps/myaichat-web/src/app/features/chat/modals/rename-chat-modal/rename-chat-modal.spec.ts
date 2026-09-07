import { provideNoopAnimations } from '@angular/platform-browser/animations';
import { render, screen } from '@testing-library/angular';
import userEvent from '@testing-library/user-event';
import { beforeEach, describe, expect, it, vi } from 'vitest';

import { RenameChatModal } from './rename-chat-modal';

describe('RenameChatModal', () => {
  beforeEach(() => {
    vi.clearAllMocks();
  });

  const renderComponent = async () => {
    const saveRename = vi.fn();
    const cancelRename = vi.fn();

    const result = await render(RenameChatModal, {
      providers: [provideNoopAnimations()],
      inputs: {
        isVisible: true,
        chatTitle: 'Original title',
      },
      on: {
        saveRename,
        cancelRename,
      },
    });

    return { ...result, saveRename, cancelRename };
  };

  it('should initialize the input with the current chat title', async () => {
    await renderComponent();

    expect(screen.getByPlaceholderText('Enter new chat name')).toHaveValue('Original title');
  });

  it('should emit a trimmed title when saving a non-empty value', async () => {
    const { saveRename } = await renderComponent();
    const user = userEvent.setup();
    const input = screen.getByPlaceholderText('Enter new chat name');

    await user.clear(input);
    await user.type(input, '  Updated title  ');
    await user.click(screen.getByRole('button', { name: 'Save' }));

    expect(saveRename).toHaveBeenCalledWith('Updated title');
  });

  it('should not emit a title when saving only whitespace', async () => {
    const { saveRename } = await renderComponent();
    const user = userEvent.setup();
    const input = screen.getByPlaceholderText('Enter new chat name');

    await user.clear(input);
    await user.type(input, '   ');
    await user.click(screen.getByRole('button', { name: 'Save' }));

    expect(saveRename).not.toHaveBeenCalled();
  });

  it('should emit cancel when the cancel button is clicked', async () => {
    const { cancelRename } = await renderComponent();
    const user = userEvent.setup();

    await user.click(screen.getByRole('button', { name: 'Cancel' }));

    expect(cancelRename).toHaveBeenCalledOnce();
  });
});
