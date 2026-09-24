import { TestBed } from '@angular/core/testing';
import { render, screen, waitFor } from '@testing-library/angular';
import userEvent from '@testing-library/user-event';
import { afterEach, describe, expect, it, vi } from 'vitest';
import { PlusOutline } from '@ant-design/icons-angular/icons';
import { provideNzIcons } from 'ng-zorro-antd/icon';
import { CompareResModel } from '../../models';
import { CompareApi } from '../../services/compare-api';
import { ComparePage } from './compare-page';

type CompareApiStub = Pick<CompareApi, 'compare'>;

const compareResult: CompareResModel = {
  inputs: [
    {
      explanation: 'This feels more direct and conversational.',
      input: 'See you soon.',
    },
    {
      explanation: 'This sounds warmer and slightly more personal.',
      input: 'I hope to see you soon.',
    },
  ],
  summary: 'Use the second option when you want a warmer and more considerate tone.',
};

async function setup() {
  const compareApi = {
    compare: vi.fn().mockResolvedValue(compareResult),
  } satisfies CompareApiStub;

  await render(ComparePage, {
    providers: [provideNzIcons([PlusOutline]), { provide: CompareApi, useValue: compareApi }],
  });

  return {
    compareApi,
  };
}

describe('ComparePage', () => {
  afterEach(() => {
    TestBed.resetTestingModule();
    vi.clearAllMocks();
  });

  it('should add another input field when the add button is clicked', async () => {
    const user = userEvent.setup();

    await setup();

    expect(screen.getAllByRole('textbox')).toHaveLength(3);

    await user.click(screen.getByRole('button', { name: 'Add input' }));

    expect(screen.getAllByRole('textbox')).toHaveLength(4);
    expect(screen.getByLabelText('Input 3')).toBeInTheDocument();
  });

  it('should submit the trimmed context and render the comparison results', async () => {
    const user = userEvent.setup();
    const { compareApi } = await setup();

    await user.type(screen.getByLabelText('Input 1'), 'See you soon.');
    await user.type(screen.getByLabelText('Input 2'), 'I hope to see you soon.');
    await user.type(screen.getByLabelText('Additional Context'), '  I am writing to a coworker  ');
    await user.click(screen.getByRole('button', { name: 'Compare Options' }));

    await waitFor(() => {
      expect(compareApi.compare).toHaveBeenCalledWith(
        ['See you soon.', 'I hope to see you soon.'],
        'I am writing to a coworker',
      );
    });

    expect(await screen.findByText('This feels more direct and conversational.')).toBeInTheDocument();
    expect(screen.getByText('Use the second option when you want a warmer and more considerate tone.')).toBeInTheDocument();
  });
});
