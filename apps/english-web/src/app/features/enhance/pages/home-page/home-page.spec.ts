import { render, screen } from '@testing-library/angular';
import { describe, expect, it } from 'vitest';
import { HomePage } from './home-page';

describe('HomePage', () => {
  it('should render the welcome heading and introduction copy', async () => {
    await render(HomePage);

    expect(screen.getByRole('heading', { name: 'Welcome to My AI English' })).toBeInTheDocument();
    expect(
      screen.getByText(/Your personal AI-powered assistant for learning and practicing English/i),
    ).toBeInTheDocument();
  });
});
