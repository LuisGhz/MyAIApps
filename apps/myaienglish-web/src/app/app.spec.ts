import { BreakpointObserver, BreakpointState } from '@angular/cdk/layout';
import { ChangeDetectionStrategy, Component } from '@angular/core';
import { TestBed } from '@angular/core/testing';
import { provideRouter } from '@angular/router';
import { AuthService } from '@auth0/auth0-angular';
import { render, screen, waitFor } from '@testing-library/angular';
import userEvent from '@testing-library/user-event';
import { provideStore, Store } from '@ngxs/store';
import { firstValueFrom, of, throwError } from 'rxjs';
import { afterEach, describe, expect, it, vi } from 'vitest';
import { Header } from '@core/components/header/header';
import { Sider } from '@core/components/sider/sider';
import { AppActions } from '@st/app/app.actions';
import { AppStore } from '@st/app/app.store';
import { App } from './app';

@Component({
  selector: 'app-sider',
  template: '<aside>Sider Stub</aside>',
  changeDetection: ChangeDetectionStrategy.OnPush,
})
class SiderStub {}

@Component({
  selector: 'app-header',
  template: '<header>Header Stub</header>',
  changeDetection: ChangeDetectionStrategy.OnPush,
})
class HeaderStub {}

@Component({
  template: '<p>Route Stub</p>',
  changeDetection: ChangeDetectionStrategy.OnPush,
})
class RouteStub {}

type AuthServiceStub = Pick<AuthService, 'isAuthenticated$' | 'getAccessTokenSilently' | 'logout'>;

interface SetupOptions {
  breakpointMatches?: boolean;
  getAccessTokenSilently?: AuthServiceStub['getAccessTokenSilently'];
  isAuthenticated?: boolean;
}

function createBreakpointObserverStub(matches: boolean) {
  return {
    observe: vi.fn().mockReturnValue(
      of<BreakpointState>({
        matches,
        breakpoints: {},
      }),
    ),
  } satisfies Pick<BreakpointObserver, 'observe'>;
}

async function setup({
  isAuthenticated = false,
  breakpointMatches = false,
  getAccessTokenSilently = vi.fn().mockReturnValue(of('access-token')),
}: SetupOptions = {}) {
  const breakpointObserver = createBreakpointObserverStub(breakpointMatches);
  const authService = {
    isAuthenticated$: of(isAuthenticated),
    getAccessTokenSilently,
    logout: vi.fn(),
  } satisfies AuthServiceStub;

  TestBed.overrideComponent(App, {
    remove: { imports: [Sider, Header] },
    add: { imports: [SiderStub, HeaderStub] },
  });

  await render(App, {
    providers: [
      provideStore([AppStore]),
      provideRouter([{ path: '', component: RouteStub }]),
      { provide: BreakpointObserver, useValue: breakpointObserver },
      { provide: AuthService, useValue: authService },
    ],
  });

  return {
    authService,
    breakpointObserver,
    store: TestBed.inject(Store),
  };
}

describe('App', () => {
  afterEach(() => {
    TestBed.resetTestingModule();
    vi.clearAllMocks();
  });

  it('should render only routed content when the user is not authenticated', async () => {
    const { authService } = await setup();

    expect(screen.queryByText('Sider Stub')).not.toBeInTheDocument();
    expect(screen.queryByText('Header Stub')).not.toBeInTheDocument();
    expect(authService.getAccessTokenSilently).not.toHaveBeenCalled();
  });

  it('should render the application shell on desktop when the user is authenticated', async () => {
    const { store } = await setup({ isAuthenticated: true });

    expect(await screen.findByText('Sider Stub')).toBeInTheDocument();
    expect(screen.queryByText('Header Stub')).not.toBeInTheDocument();
    expect(store.selectSnapshot(AppStore.isMobile)).toBe(false);
    expect(store.selectSnapshot(AppStore.isMenuCollapsed)).toBe(false);
  });

  it('should collapse the menu from the backdrop when the mobile menu is open', async () => {
    const user = userEvent.setup();
    const { store } = await setup({ breakpointMatches: true, isAuthenticated: true });

    await firstValueFrom(store.dispatch(new AppActions.ExpandMenu()));

    const backdrop = await screen.findByLabelText('Backdrop menu');
    await user.click(backdrop);

    await waitFor(() => {
      expect(store.selectSnapshot(AppStore.isMenuCollapsed)).toBe(true);
    });
  });

  it('should log out when the initial silent token refresh fails', async () => {
    const { authService } = await setup({
      isAuthenticated: true,
      getAccessTokenSilently: vi.fn().mockReturnValue(throwError(() => new Error('refresh failed'))),
    });

    await waitFor(() => {
      expect(authService.logout).toHaveBeenCalledWith({
        logoutParams: { returnTo: window.location.origin },
      });
    });
  });
});
