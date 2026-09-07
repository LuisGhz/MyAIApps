import { render } from '@testing-library/angular';
import { describe, expect, it } from 'vitest';
import { CompareIcon } from './compare-icon';

describe('CompareIcon', () => {
  it('should render the inline svg with the host contents class', async () => {
    const { fixture } = await render(CompareIcon);

    const host = fixture.nativeElement as HTMLElement;

    expect(host).toHaveClass('contents');
    expect(host.querySelector('svg')).not.toBeNull();
  });
});
