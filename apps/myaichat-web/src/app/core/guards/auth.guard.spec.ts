import { ActivatedRouteSnapshot, Router, RouterStateSnapshot } from '@angular/router';
import { TestBed } from '@angular/core/testing';
import { Store, provideStore } from '@ngxs/store';
import { beforeEach, describe, expect, it, vi } from 'vitest';
import { firstValueFrom } from 'rxjs';

import { createMockRouter, createTestJwt } from '@sh/testing';
import { AuthActions } from '@st/auth/auth.actions';
import { AuthStore } from '@st/auth/auth.store';
import { authGuard } from './auth.guard';

describe('authGuard', () => {
  let store: Store;
  let router: ReturnType<typeof createMockRouter>;

  beforeEach(() => {
    vi.clearAllMocks();
    router = createMockRouter();
    TestBed.configureTestingModule({
      providers: [provideStore([AuthStore]), { provide: Router, useValue: router }],
    });

    store = TestBed.inject(Store);
  });

  const route = {} as ActivatedRouteSnapshot;
  const state = { url: '/chat' } as RouterStateSnapshot;

  it('should allow navigation when the user is authenticated', async () => {
    await firstValueFrom(
      store.dispatch(new AuthActions.Login({ token: createTestJwt({ role: 'user' }) })),
    );

    const result = TestBed.runInInjectionContext(() => authGuard(route, state));

    expect(result).toBe(true);
    expect(router.navigate).not.toHaveBeenCalled();
  });

  it('should deny navigation and redirect to login when the user is not authenticated', () => {
    const result = TestBed.runInInjectionContext(() => authGuard(route, state));

    expect(result).toBe(false);
    expect(router.navigate).toHaveBeenCalledWith(['/auth/login']);
  });
});