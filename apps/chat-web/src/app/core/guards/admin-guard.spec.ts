import { ActivatedRouteSnapshot, RouterStateSnapshot } from '@angular/router';
import { TestBed } from '@angular/core/testing';
import { Store, provideStore } from '@ngxs/store';
import { beforeEach, describe, expect, it, vi } from 'vitest';
import { firstValueFrom } from 'rxjs';

import { createTestJwt } from '@sh/testing';
import { AuthActions } from '@st/auth/auth.actions';
import { AuthStore } from '@st/auth/auth.store';
import { adminGuard } from './admin-guard';

describe('adminGuard', () => {
  let store: Store;

  beforeEach(() => {
    vi.clearAllMocks();
    TestBed.configureTestingModule({
      providers: [provideStore([AuthStore])],
    });

    store = TestBed.inject(Store);
  });

  const route = {} as ActivatedRouteSnapshot;
  const state = { url: '/admin' } as RouterStateSnapshot;

  it('should allow navigation when the authenticated user is an admin', async () => {
    await firstValueFrom(
      store.dispatch(new AuthActions.Login({ token: createTestJwt({ role: 'admin' }) })),
    );

    const result = TestBed.runInInjectionContext(() => adminGuard(route, state));

    expect(result).toBe(true);
  });

  it('should deny navigation when the authenticated user is not an admin', async () => {
    await firstValueFrom(
      store.dispatch(new AuthActions.Login({ token: createTestJwt({ role: 'user' }) })),
    );

    const result = TestBed.runInInjectionContext(() => adminGuard(route, state));

    expect(result).toBe(false);
  });

  it('should deny navigation when the user is not authenticated', () => {
    const result = TestBed.runInInjectionContext(() => adminGuard(route, state));

    expect(result).toBe(false);
  });
});