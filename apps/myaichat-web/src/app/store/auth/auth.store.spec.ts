import { Component } from '@angular/core';
import { Store, provideStore } from '@ngxs/store';
import { render } from '@testing-library/angular';
import { beforeEach, describe, expect, it, vi } from 'vitest';
import { firstValueFrom } from 'rxjs';

import { createTestJwt } from '@sh/testing';
import { AuthActions } from './auth.actions';
import { AuthStore } from './auth.store';

@Component({
  template: '',
})
class TestHost {}

describe('AuthStore', () => {
  beforeEach(() => {
    vi.clearAllMocks();
  });

  const renderStore = async () => {
    const result = await render(TestHost, {
      providers: [provideStore([AuthStore])],
    });

    const store = result.fixture.debugElement.injector.get(Store);

    return { ...result, store };
  };

  it('should persist login state and decode token-based selectors', async () => {
    const { store } = await renderStore();
    const token = createTestJwt({
      sub: 'user-1',
      name: 'Luis',
      email: 'luis@example.com',
      role: 'user',
    });

    await firstValueFrom(store.dispatch(new AuthActions.Login({ token })));

    expect(store.selectSnapshot(AuthStore.token)).toBe(token);
    expect(store.selectSnapshot(AuthStore.isAuthenticated)).toBe(true);
    expect(store.selectSnapshot(AuthStore.userId)).toBe('user-1');
    expect(store.selectSnapshot(AuthStore.username)).toBe('Luis');
    expect(store.selectSnapshot(AuthStore.email)).toBe('luis@example.com');
    expect(store.selectSnapshot(AuthStore.role)).toBe('user');
    expect(store.selectSnapshot(AuthStore.isAdmin)).toBe(false);
  });

  it('should upload a new token without changing the authentication flag', async () => {
    const { store } = await renderStore();
    const adminToken = createTestJwt({
      sub: 'admin-1',
      name: 'Admin User',
      email: 'admin@example.com',
      role: 'admin',
    });

    await firstValueFrom(store.dispatch(new AuthActions.UploadToken({ token: adminToken })));

    expect(store.selectSnapshot(AuthStore.token)).toBe(adminToken);
    expect(store.selectSnapshot(AuthStore.isAuthenticated)).toBe(false);
    expect(store.selectSnapshot(AuthStore.role)).toBe('admin');
    expect(store.selectSnapshot(AuthStore.isAdmin)).toBe(true);
  });

  it('should clear the auth state on logout', async () => {
    const { store } = await renderStore();

    await firstValueFrom(
      store.dispatch(
        new AuthActions.Login({
          token: createTestJwt({ role: 'admin' }),
        }),
      ),
    );

    await firstValueFrom(store.dispatch(new AuthActions.Logout()));

    expect(store.selectSnapshot(AuthStore.token)).toBeNull();
    expect(store.selectSnapshot(AuthStore.isAuthenticated)).toBe(false);
  });
});
