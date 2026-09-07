import { describe, it, expect, vi, beforeEach } from 'vitest';
import { render, screen, waitFor } from '@testing-library/angular';
import { Component, provideZonelessChangeDetection } from '@angular/core';
import { BreakpointObserver } from '@angular/cdk/layout';
import { provideHttpClient } from '@angular/common/http';
import { provideNoopAnimations } from '@angular/platform-browser/animations';
import { provideTestNzIcons } from '@sh/testing';
import { of } from 'rxjs';

import userEvent from '@testing-library/user-event';
import { provideStore, Store } from '@ngxs/store';
import { NzLayoutModule } from 'ng-zorro-antd/layout';
import { RouterOutlet } from '@angular/router';
import { App } from './app';
import { AuthStore } from '@st/auth/auth.store';
import { AppStore } from '@st/app/app.store';
import { AuthActions } from '@st/auth/auth.actions';
import { AppActions } from '@st/app/app.actions';

@Component({
  selector: 'app-sider',
  template: '<div>Mock Sider</div>',
})
class MockSider {}

@Component({
  selector: 'app-header',
  template: '<div>Mock Header</div>',
})
class MockHeader {}

const mockBreakpointObserver = {
  observe: vi.fn().mockReturnValue(of({ matches: false })),
};

describe('App', () => {
  beforeEach(() => {
    mockBreakpointObserver.observe.mockReset();
    mockBreakpointObserver.observe.mockReturnValue(of({ matches: false }));
  });

  const renderComponent = async (hasToken = true) => {
    const result = await render(App, {
      providers: [
        provideZonelessChangeDetection(),
        provideHttpClient(),
        provideNoopAnimations(),
        provideTestNzIcons(),
        provideStore([AuthStore, AppStore]),
        { provide: BreakpointObserver, useValue: mockBreakpointObserver },
      ],
      componentImports: [
        RouterOutlet,
        MockSider,
        MockHeader,
        NzLayoutModule,
      ],
    });

    const store = result.fixture.debugElement.injector.get(Store);
    if (hasToken) store.dispatch(new AuthActions.Login({ token: 'test-token' }));
    result.fixture.detectChanges();

    return { ...result, store };
  };

  it('should display layout with sidebar and header when user is authenticated', async () => {
    await renderComponent();

    expect(screen.getByText('Mock Sider')).toBeInTheDocument();
    expect(screen.getByText('Mock Header')).toBeInTheDocument();
  });

  it('should display only router outlet when user is not authenticated', async () => {
    await renderComponent(false);

    expect(screen.queryByText('Mock Sider')).not.toBeInTheDocument();
    expect(screen.queryByText('Mock Header')).not.toBeInTheDocument();
  });

  it('should collapse sidebar and set mobile mode when screen is small', async () => {
    mockBreakpointObserver.observe.mockReturnValue(of({ matches: true }));

    const { store } = await renderComponent();

    expect(store.selectSnapshot(AppStore.sidebarCollapsed)).toBe(true);
    expect(store.selectSnapshot(AppStore.isMobile)).toBe(true);
  });

  it('should show backdrop and collapse sidebar when clicking backdrop in mobile mode', async () => {
    mockBreakpointObserver.observe.mockReturnValue(of({ matches: true }));

    const { store, fixture } = await renderComponent();

    store.dispatch(new AppActions.UnCollapseSidebar());
    fixture.detectChanges();
    await fixture.whenStable();
    const backdrop = screen.getByTestId('app-backdrop');
    expect(backdrop).toBeInTheDocument();
    expect(store.selectSnapshot(AppStore.sidebarCollapsed)).toBe(false);

    const user = userEvent.setup();
    await user.click(backdrop!);

    await waitFor(() => {
      expect(store.selectSnapshot(AppStore.sidebarCollapsed)).toBe(true);
    });
  });
});
