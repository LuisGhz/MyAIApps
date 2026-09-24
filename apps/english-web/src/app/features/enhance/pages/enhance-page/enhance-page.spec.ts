import { TestBed } from '@angular/core/testing';
import { render, screen, waitFor } from '@testing-library/angular';
import userEvent from '@testing-library/user-event';
import { of } from 'rxjs';
import { afterEach, describe, expect, it, vi } from 'vitest';
import { EnhanceTextRes } from '@enhance/models/enhance-text-res.model';
import { EnhanceApi } from '@enhance/services/enhance-api';
import { EnhancePage } from './enhance-page';

type EnhanceApiStub = Pick<EnhanceApi, 'enhanceText'>;

const enhancedResult: EnhanceTextRes = {
  grammarFix: 'I want to see you.',
  informalB2: 'I want to catch up with you.',
  informalC1: 'I would love to catch up with you.',
  formalB2: 'I would like to see you.',
  formalC1: 'I would appreciate the opportunity to meet with you.',
};

async function setup() {
  const enhanceApi = {
    enhanceText: vi.fn().mockReturnValue(of(enhancedResult)),
  } satisfies EnhanceApiStub;

  const renderResult = await render(EnhancePage, {
    providers: [{ provide: EnhanceApi, useValue: enhanceApi }],
  });

  return {
    enhanceApi,
    fixture: renderResult.fixture,
  };
}

describe('EnhancePage', () => {
  afterEach(() => {
    TestBed.resetTestingModule();
    vi.clearAllMocks();
    vi.useRealTimers();
  });

  it('should show the required error after the text field is touched without content', async () => {
    const user = userEvent.setup();

    await setup();
    await user.click(screen.getByLabelText('Text to enhance'));
    await user.tab();

    expect(screen.getByRole('alert')).toHaveTextContent('Enter the text you want to improve.');
  });

  it('should send the trimmed request and render enhanced results', async () => {
    const user = userEvent.setup();
    const { enhanceApi } = await setup();

    await user.type(screen.getByLabelText('Text to enhance'), 'I want see you.');
    await user.type(screen.getByLabelText('Additional Context'), '  Waiting a call from my boss  ');
    await user.click(screen.getByRole('button', { name: 'Enhance Text' }));

    await waitFor(() => {
      expect(enhanceApi.enhanceText).toHaveBeenCalledWith({
        context: 'Waiting a call from my boss',
        textToEnhance: 'I want see you.',
      });
    });

    expect(await screen.findByText('Grammar Fix')).toBeInTheDocument();
    expect(screen.getByText('I want to see you.')).toBeInTheDocument();
    expect(screen.getByText('I would appreciate the opportunity to meet with you.')).toBeInTheDocument();
  });

  it('should copy a result and reset the copied state after the delay', async () => {
    vi.useFakeTimers();

    const user = userEvent.setup({ advanceTimers: vi.advanceTimersByTimeAsync });
    const writeText = vi.fn().mockResolvedValue(undefined);
    Object.defineProperty(window.navigator, 'clipboard', {
      configurable: true,
      value: { writeText },
    });

    const { fixture } = await setup();
    await user.type(screen.getByLabelText('Text to enhance'), 'I want see you.');
    await user.click(screen.getByRole('button', { name: 'Enhance Text' }));

    const copyButton = await screen.findByRole('button', { name: 'Copy Grammar Fix' });
    await user.click(copyButton);

    await waitFor(() => {
      expect(writeText).toHaveBeenCalledWith('I want to see you.');
      expect(copyButton).toHaveTextContent('Copied');
    });

    await vi.advanceTimersByTimeAsync(2000);
    fixture.detectChanges();

    expect(copyButton).toHaveTextContent('Copy');
  });
});
