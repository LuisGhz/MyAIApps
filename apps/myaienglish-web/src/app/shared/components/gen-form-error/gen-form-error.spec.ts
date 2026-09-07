import { FormControl } from '@angular/forms';
import { render, screen, waitFor } from '@testing-library/angular';
import { describe, expect, it } from 'vitest';
import { GenFormError } from './gen-form-error';

describe('GenFormError', () => {
  it('should render the message when the dirty control gains the tracked error', async () => {
    const control = new FormControl('');

    await render(GenFormError, {
      inputs: {
        control,
        id: 'name-error',
        key: 'required',
        message: 'Name is required.',
      },
    });

    expect(screen.queryByText('Name is required.')).not.toBeInTheDocument();

    control.markAsDirty();
    control.setErrors({ required: true });

    await waitFor(() => {
      expect(screen.getByText('Name is required.')).toHaveAttribute('id', 'name-error');
    });
  });

  it('should render all messages when any configured error key is present', async () => {
    const control = new FormControl('');
    control.markAsDirty();
    control.setErrors({ minlength: true, required: true });

    await render(GenFormError, {
      inputs: {
        control,
        id: 'password-error',
        keys: ['required', 'minlength'],
        messages: ['Password is required.', 'Password is too short.'],
      },
    });

    expect(screen.getByText('Password is required.')).toBeInTheDocument();
    expect(screen.getByText('Password is too short.')).toBeInTheDocument();
    expect(screen.getByText('Password is required.').closest('div')).toHaveAttribute('id', 'password-error');
  });
});
