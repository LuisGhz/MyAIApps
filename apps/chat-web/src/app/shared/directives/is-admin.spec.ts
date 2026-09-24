import { Component, inject, provideEnvironmentInitializer } from '@angular/core';
import { Store, provideStore } from '@ngxs/store';
import { render, screen, waitFor } from '@testing-library/angular';
import { beforeEach, describe, expect, it, vi } from 'vitest';
import { firstValueFrom } from 'rxjs';

import { createTestJwt } from '@sh/testing';
import { AuthActions } from '@st/auth/auth.actions';
import { AuthStore } from '@st/auth/auth.store';
import { IsAdmin } from './is-admin';

@Component({
  imports: [IsAdmin],
  template: '<p *appIsAdmin>Admin content</p>',
})
class TestHost {}

describe('IsAdmin', () => {
  beforeEach(() => {
    vi.clearAllMocks();
  });

  const renderHost = async (role: 'admin' | 'user' = 'admin') => {
    const result = await render(TestHost, {
      providers: [
        provideStore([AuthStore]),
        provideEnvironmentInitializer(() => {
          const store = inject(Store);
          store.dispatch(
            new AuthActions.Login({
              token: createTestJwt({ role }),
            }),
          );
        }),
      ],
    });

    const store = result.fixture.debugElement.injector.get(Store);

    return { ...result, store };
  };

  it('should render the embedded view when the current user is an admin', async () => {
    await renderHost('admin');

    expect(screen.getByText('Admin content')).toBeInTheDocument();
  });

  it('should not render the embedded view when the current user is not an admin', async () => {
    await renderHost('user');

    expect(screen.queryByText('Admin content')).not.toBeInTheDocument();
  });

  it('should react to role changes from admin to non-admin', async () => {
    const { fixture, store } = await renderHost('admin');

    expect(screen.getByText('Admin content')).toBeInTheDocument();

    await firstValueFrom(
      store.dispatch(
        new AuthActions.UploadToken({
          token: createTestJwt({ role: 'user' }),
        }),
      ),
    );
    fixture.detectChanges();

    await waitFor(() => {
      expect(screen.queryByText('Admin content')).not.toBeInTheDocument();
    });
  });
});
