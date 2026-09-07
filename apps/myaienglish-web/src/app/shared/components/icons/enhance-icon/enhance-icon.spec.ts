import { render } from '@testing-library/angular';
import { describe, expect, it } from 'vitest';
import { EnhanceIcon } from './enhance-icon';

describe('EnhanceIcon', () => {
  it('should render the inline svg with the host contents class', async () => {
    const { fixture } = await render(EnhanceIcon);

    const host = fixture.nativeElement as HTMLElement;

    expect(host).toHaveClass('contents');
    expect(host?.querySelector('svg')).not.toBeNull();
  });
});
