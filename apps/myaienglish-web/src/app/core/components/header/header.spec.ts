import { TestBed } from '@angular/core/testing';
import { render, screen, waitFor } from '@testing-library/angular';
import userEvent from '@testing-library/user-event';
import { provideStore, Store } from '@ngxs/store';
import { firstValueFrom } from 'rxjs';
import { describe, expect, it } from 'vitest';
import { MenuUnfoldOutline } from '@ant-design/icons-angular/icons';
import { provideNzIcons } from 'ng-zorro-antd/icon';
import { AppActions } from '@st/app/app.actions';
import { AppStore } from '@st/app/app.store';
import { Header } from './header';

async function setup() {
  await render(Header, {
    providers: [provideStore([AppStore]), provideNzIcons([MenuUnfoldOutline])],
  });

  return {
    store: TestBed.inject(Store),
  };
}

describe('Header', () => {
  it('should render the workspace title', async () => {
    await setup();

    expect(screen.getByRole('banner', { name: 'Workspace header' })).toHaveTextContent('My AI English');
    expect(screen.queryByRole('button', { name: 'Open navigation menu' })).not.toBeInTheDocument();
  });

  it('should expand the menu when the menu button is clicked', async () => {
    const user = userEvent.setup();
    const { store } = await setup();

    await firstValueFrom(store.dispatch(new AppActions.CollapseMenu()));

    const expandButton = await screen.findByRole('button', { name: 'Open navigation menu' });
    await user.click(expandButton);

    await waitFor(() => {
      expect(store.selectSnapshot(AppStore.isMenuCollapsed)).toBe(false);
    });
  });
});
