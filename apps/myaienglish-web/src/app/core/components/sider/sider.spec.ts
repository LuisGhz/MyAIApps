import { ChangeDetectionStrategy, Component } from '@angular/core';
import { TestBed } from '@angular/core/testing';
import { provideRouter } from '@angular/router';
import { AuthService } from '@auth0/auth0-angular';
import { render, screen, waitFor } from '@testing-library/angular';
import userEvent from '@testing-library/user-event';
import { provideStore, Store } from '@ngxs/store';
import { firstValueFrom } from 'rxjs';
import { afterEach, describe, expect, it, vi } from 'vitest';
import { LogoutOutline, MenuFoldOutline, MenuUnfoldOutline } from '@ant-design/icons-angular/icons';
import { provideNzIcons } from 'ng-zorro-antd/icon';
import { CompareIcon } from '@shared/components/icons/compare-icon/compare-icon';
import { EnhanceIcon } from '@shared/components/icons/enhance-icon/enhance-icon';
import { AppActions } from '@st/app/app.actions';
import { AppStore } from '@st/app/app.store';
import { Sider } from './sider';

@Component({
  selector: 'app-enhance-icon',
  template: '<span>Enhance Icon Stub</span>',
  changeDetection: ChangeDetectionStrategy.OnPush,
})
class EnhanceIconStub {}

@Component({
  selector: 'app-compare-icon',
  template: '<span>Compare Icon Stub</span>',
  changeDetection: ChangeDetectionStrategy.OnPush,
})
class CompareIconStub {}

@Component({
  template: '<p>Route Stub</p>',
  changeDetection: ChangeDetectionStrategy.OnPush,
})
class RouteStub {}

type AuthServiceStub = Pick<AuthService, 'logout'>;

async function setup() {
  const authService = {
    logout: vi.fn(),
  } satisfies AuthServiceStub;

  TestBed.overrideComponent(Sider, {
    remove: { imports: [EnhanceIcon, CompareIcon] },
    add: { imports: [EnhanceIconStub, CompareIconStub] },
  });

  await render(Sider, {
    providers: [
      provideStore([AppStore]),
      provideRouter([
        { path: 'enhance', component: RouteStub },
        { path: 'compare', component: RouteStub },
      ]),
      provideNzIcons([MenuFoldOutline, MenuUnfoldOutline, LogoutOutline]),
      { provide: AuthService, useValue: authService },
    ],
  });

  return {
    authService,
    store: TestBed.inject(Store),
  };
}

describe('Sider', () => {
  afterEach(() => {
    TestBed.resetTestingModule();
    vi.clearAllMocks();
    vi.useRealTimers();
  });

  it('should render the main navigation links', async () => {
    await setup();

    expect(screen.getByRole('navigation', { name: 'Main navigation' })).toBeInTheDocument();
    expect(screen.getByRole('link', { name: 'Enhance' })).toBeInTheDocument();
    expect(screen.getByRole('link', { name: 'Compare' })).toBeInTheDocument();
    expect(screen.getByRole('button', { name: /Logout/ })).toBeInTheDocument();
  });

  it('should toggle the menu state when the toggle button is clicked', async () => {
    const user = userEvent.setup();
    const { store } = await setup();

    await user.click(screen.getByRole('button', { name: /Toggle navigation menu/ }));

    await waitFor(() => {
      expect(store.selectSnapshot(AppStore.isMenuCollapsed)).toBe(true);
    });
  });

  it('should collapse the menu after navigating on mobile', async () => {
    vi.useFakeTimers();

    const user = userEvent.setup({ advanceTimers: vi.advanceTimersByTimeAsync });
    const { store } = await setup();

    await firstValueFrom(store.dispatch(new AppActions.UpdateIsMobile(true)));
    await firstValueFrom(store.dispatch(new AppActions.ExpandMenu()));
    await user.click(screen.getByRole('link', { name: 'Enhance' }));
    await vi.advanceTimersByTimeAsync(100);

    expect(store.selectSnapshot(AppStore.isMenuCollapsed)).toBe(true);
  });

  it('should log out to the current origin when the logout button is clicked', async () => {
    const user = userEvent.setup();
    const { authService } = await setup();

    await user.click(screen.getByRole('button', { name: /Logout/ }));

    expect(authService.logout).toHaveBeenCalledWith({
      logoutParams: { returnTo: window.location.origin },
    });
  });
});
