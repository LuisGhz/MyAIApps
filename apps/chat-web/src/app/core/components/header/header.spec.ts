import { describe, it, expect, beforeEach } from 'vitest';
import { render, screen } from '@testing-library/angular';
import userEvent from '@testing-library/user-event';
import { Header } from './header';
import { Store, provideStore } from '@ngxs/store';
import { AppStore } from '@st/app/app.store';
import { provideNoopAnimations } from '@angular/platform-browser/animations';
import { provideTestNzIcons } from '@sh/testing';
import { AppActions } from '@st/app/app.actions';

interface RenderOptions {
  sidebarCollapsed?: boolean;
  isMobile?: boolean;
  pageTitle?: string;
}

describe('Header', () => {
  const renderComponent = async (options?: RenderOptions) => {
    const result = await render(Header, {
      providers: [provideStore([AppStore]), provideNoopAnimations(), provideTestNzIcons()],
    });

    const store = result.fixture.debugElement.injector.get(Store);

    // Set initial state based on options
    if (options?.sidebarCollapsed !== undefined || options?.isMobile !== undefined) {
      if (options.sidebarCollapsed) {
        store.dispatch(new AppActions.CollapseSidebar());
      } else if (options?.sidebarCollapsed === false) {
        store.dispatch(new AppActions.UnCollapseSidebar());
      }

      if (options.isMobile !== undefined) {
        store.dispatch(new AppActions.SetIsMobile(options.isMobile));
      }
    }

    if (options?.pageTitle) {
      store.dispatch(new AppActions.SetPageTitle(options.pageTitle));
    }

    result.fixture.detectChanges();

    return { ...result, store };
  };

  beforeEach(() => {
    document.title = '';
  });

  it('should display menu button and dispatch action when clicked on mobile with collapsed sidebar', async () => {
    const { store } = await renderComponent({ sidebarCollapsed: true, isMobile: true });
    const user = userEvent.setup();

    const menuButton = screen.getByRole('button', { name: /open sidenav/i });
    expect(menuButton).toBeInTheDocument();

    await user.click(menuButton);

    expect(store.selectSnapshot(AppStore.sidebarCollapsed)).toBe(false);
  });

  it('should not display menu button when sidebar is expanded', async () => {
    await renderComponent({ sidebarCollapsed: false, isMobile: true });

    const menuButton = screen.queryByRole('button', { name: /open sidenav/i });
    expect(menuButton).not.toBeInTheDocument();
  });

  it('should not display menu button when not on mobile', async () => {
    await renderComponent({ sidebarCollapsed: true, isMobile: false });

    const menuButton = screen.queryByRole('button', { name: /open sidenav/i });
    expect(menuButton).not.toBeInTheDocument();
  });

  it('should display page title from store', async () => {
    await renderComponent({ pageTitle: 'Test Page Title' });

    expect(screen.getByRole('heading', { name: 'Test Page Title' })).toBeInTheDocument();
  });

  it('should update document title when page title changes', async () => {
    const { store, fixture } = await renderComponent({ pageTitle: 'Initial Title' });

    expect(document.title).toBe('Initial Title');

    store.dispatch(new AppActions.SetPageTitle('Updated Title'));
    fixture.detectChanges();
    await fixture.whenStable();

    expect(document.title).toBe('Updated Title');
  });

  it('should display empty string when page title is empty', async () => {
    const { store, fixture } = await renderComponent({ pageTitle: 'New Chat' });

    store.dispatch(new AppActions.SetPageTitle(''));
    fixture.detectChanges();
    await fixture.whenStable();

    const heading = screen.getByRole('heading');
    expect(heading.textContent?.trim()).toBe('');
    expect(document.title).toBe('');
  });

  it('should handle rapid menu button clicks without errors', async () => {
    const { store } = await renderComponent({ sidebarCollapsed: true, isMobile: true });
    const user = userEvent.setup();

    const menuButton = screen.getByRole('button', { name: /open sidenav/i });

    await user.click(menuButton);
    await user.click(menuButton);
    await user.click(menuButton);

    expect(store.selectSnapshot(AppStore.sidebarCollapsed)).toBe(false);
  });

  it('should apply correct margin styling based on mobile state', async () => {
    await renderComponent({ isMobile: false });
    const headingDesktop = screen.getByRole('heading');

    expect(headingDesktop).toHaveClass('ms-3');
  });

  it('should not apply margin styling when on mobile', async () => {
    await renderComponent({ isMobile: true });
    const headingMobile = screen.getByRole('heading');

    expect(headingMobile).not.toHaveClass('ms-3');
  });

  it('should transition from desktop to mobile view correctly', async () => {
    const { store, fixture } = await renderComponent({
      sidebarCollapsed: true,
      isMobile: false,
    });
    const user = userEvent.setup();

    let menuButton = screen.queryByRole('button', { name: /open sidenav/i });
    expect(menuButton).not.toBeInTheDocument();

    store.dispatch(new AppActions.SetIsMobile(true));
    fixture.detectChanges();
    await fixture.whenStable();

    menuButton = screen.queryByRole('button', { name: /open sidenav/i });
    expect(menuButton).toBeInTheDocument();

    if (menuButton) {
      await user.click(menuButton);
      expect(store.selectSnapshot(AppStore.sidebarCollapsed)).toBe(false);
    }
  });

  it('should display menu icon only when sidebar is collapsed and on mobile', async () => {
    await renderComponent({ sidebarCollapsed: true, isMobile: true });

    const menuButton = screen.getByRole('button', { name: /open sidenav/i });
    const menuIcon = menuButton.querySelector('nz-icon');
    expect(menuIcon).toBeInTheDocument();
    expect(menuIcon).toHaveAttribute('nztype', 'menu-unfold');
  });

  it('should render heading with correct ARIA attributes', async () => {
    await renderComponent({ pageTitle: 'Test' });

    const heading = screen.getByRole('heading', { name: 'Test' });
    expect(heading).toHaveAttribute('class');
    expect(heading.textContent?.trim()).toBe('Test');
  });

  it('should handle page title with special characters', async () => {
    await renderComponent({ pageTitle: 'Test <>&"' });

    expect(document.title).toBe('Test <>&"');
    expect(screen.getByRole('heading')).toHaveTextContent('Test <>&"');
  });

  it('should maintain menu button state when sidebar transitions while on mobile', async () => {
    const { store, fixture } = await renderComponent({
      sidebarCollapsed: true,
      isMobile: true,
    });

    let menuButton: HTMLElement = screen.getByRole('button', { name: /open sidenav/i });
    expect(menuButton).toBeInTheDocument();

    store.dispatch(new AppActions.UnCollapseSidebar());
    fixture.detectChanges();
    await fixture.whenStable();

    let menuButtonAfterUncollapse = screen.queryByRole('button', { name: /open sidenav/i });
    expect(menuButtonAfterUncollapse).not.toBeInTheDocument();

    store.dispatch(new AppActions.CollapseSidebar());
    fixture.detectChanges();
    await fixture.whenStable();

    menuButton = screen.getByRole('button', { name: /open sidenav/i });
    expect(menuButton).toBeInTheDocument();
  });
});
