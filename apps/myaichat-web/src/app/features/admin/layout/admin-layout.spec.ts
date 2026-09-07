import { provideHttpClient } from '@angular/common/http';
import { provideHttpClientTesting } from '@angular/common/http/testing';
import { ChangeDetectionStrategy, Component, ContentChildren, QueryList, input, output } from '@angular/core';
import { TestBed } from '@angular/core/testing';
import { provideRouter, Router, RouterOutlet, Routes } from '@angular/router';
import { provideStore, Store } from '@ngxs/store';
import { render, screen, waitFor } from '@testing-library/angular';
import userEvent from '@testing-library/user-event';
import { beforeEach, describe, expect, it, vi } from 'vitest';
import { firstValueFrom } from 'rxjs';

import { AppActions } from '@st/app/app.actions';
import { AppStore } from '@st/app/app.store';
import { AdminLayout } from './admin-layout';

@Component({
  selector: 'nz-tab',
  template: '',
  changeDetection: ChangeDetectionStrategy.OnPush,
})
class MockNzTab {
  readonly nzTitle = input<string>('');
}

@Component({
  selector: 'nz-tabs',
  template: `
    <div role="tablist" [attr.data-size]="nzSize()">
      @for (tab of tabs; track $index) {
        <button
          type="button"
          role="tab"
          [attr.aria-selected]="$index === nzSelectedIndex()"
          (click)="nzSelectedIndexChange.emit($index)"
        >
          {{ tab.nzTitle() }}
        </button>
      }
    </div>
    <ng-content />
  `,
  changeDetection: ChangeDetectionStrategy.OnPush,
})
class MockNzTabs {
  readonly nzSelectedIndex = input<number>(0);
  readonly nzSize = input<string>('default');
  readonly nzSelectedIndexChange = output<number>();

  @ContentChildren(MockNzTab)
  tabsContent?: QueryList<MockNzTab>;

  get tabs(): MockNzTab[] {
    return this.tabsContent?.toArray() ?? [];
  }
}

@Component({
  template: '',
  changeDetection: ChangeDetectionStrategy.OnPush,
})
class DummyRouteComponent {}

interface RenderOptions {
  // Add custom options here
}

describe('AdminLayout', () => {
  const routes: Routes = [
    { path: 'admin/models', component: DummyRouteComponent },
    { path: 'admin/users', component: DummyRouteComponent },
    { path: 'admin/unknown', component: DummyRouteComponent },
  ];

  beforeEach(() => {
    vi.clearAllMocks();
    TestBed.overrideComponent(AdminLayout, {
      set: {
        imports: [RouterOutlet, MockNzTabs, MockNzTab],
      },
    });
  });

  const renderComponent = async (options: RenderOptions = {}) => {
    const result = await render(AdminLayout, {
      providers: [
        provideStore([AppStore]),
        provideRouter(routes),
        provideHttpClient(),
        provideHttpClientTesting(),
      ],
      autoDetectChanges: false,
    });

    const store = result.fixture.debugElement.injector.get(Store);
    const router = result.fixture.debugElement.injector.get(Router);

    return { ...result, store, router };
  };

  it('should select Users tab and update page title when url is /admin/users', async () => {
    const { fixture, router, store } = await renderComponent();
    await router.navigateByUrl('/admin/users');

    fixture.detectChanges();

    await waitFor(() => {
      expect(store.selectSnapshot(AppStore.pageTitle)).toBe('Users');
    });

    expect(screen.getByRole('tab', { name: 'Users' })).toHaveAttribute('aria-selected', 'true');
    expect(screen.getByRole('tab', { name: 'Models' })).toHaveAttribute('aria-selected', 'false');
  });

  it('should select Models tab and update page title when url is /admin/models', async () => {
    const { fixture, router, store } = await renderComponent();
    await router.navigateByUrl('/admin/models');

    fixture.detectChanges();

    await waitFor(() => {
      expect(store.selectSnapshot(AppStore.pageTitle)).toBe('Models');
    });

    expect(screen.getByRole('tab', { name: 'Models' })).toHaveAttribute('aria-selected', 'true');
    expect(screen.getByRole('tab', { name: 'Users' })).toHaveAttribute('aria-selected', 'false');
  });

  it('should navigate to users when clicking Users tab', async () => {
    const { fixture, router } = await renderComponent();
    await router.navigateByUrl('/admin/models');

    fixture.detectChanges();

    const user = userEvent.setup();
    await user.click(screen.getByRole('tab', { name: 'Users' }));

    await waitFor(() => {
      expect(router.url).toBe('/admin/users');
    });
  });

  it('should render small tabs size when isMobile is true', async () => {
    const { fixture, store } = await renderComponent();
    fixture.detectChanges();

    expect(screen.getByRole('tablist')).toHaveAttribute('data-size', 'default');

    await firstValueFrom(store.dispatch(new AppActions.SetIsMobile(true)));
    fixture.detectChanges();

    await waitFor(() => {
      expect(screen.getByRole('tablist')).toHaveAttribute('data-size', 'small');
    });
  });

  it('should default to Models tab and page title on initial load', async () => {
    const { fixture, store } = await renderComponent();

    fixture.detectChanges();

    await waitFor(() => {
      expect(store.selectSnapshot(AppStore.pageTitle)).toBe('Models');
    });

    expect(screen.getByRole('tab', { name: 'Models' })).toHaveAttribute('aria-selected', 'true');
    expect(screen.getByRole('tab', { name: 'Users' })).toHaveAttribute('aria-selected', 'false');
  });

  it('should keep Models selected and page title when url is an unknown admin route', async () => {
    const { fixture, router, store } = await renderComponent();
    await router.navigateByUrl('/admin/unknown');

    fixture.detectChanges();

    await waitFor(() => {
      expect(store.selectSnapshot(AppStore.pageTitle)).toBe('Models');
    });

    expect(screen.getByRole('tab', { name: 'Models' })).toHaveAttribute('aria-selected', 'true');
    expect(screen.getByRole('tab', { name: 'Users' })).toHaveAttribute('aria-selected', 'false');
  });

  it('should not navigate when tab index is not handled', async () => {
    const { fixture, router } = await renderComponent();
    const navigateSpy = vi.spyOn(router, 'navigate');

    fixture.detectChanges();
    fixture.componentInstance.onTabChange(2);

    expect(navigateSpy).not.toHaveBeenCalled();
  });

  it('should navigate to models when clicking Models tab', async () => {
    const { fixture, router } = await renderComponent();
    await router.navigateByUrl('/admin/users');

    fixture.detectChanges();

    const user = userEvent.setup();
    await user.click(screen.getByRole('tab', { name: 'Models' }));

    await waitFor(() => {
      expect(router.url).toBe('/admin/models');
    });
  });
});
