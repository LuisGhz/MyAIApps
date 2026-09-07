import { HttpClient, HttpHeaders, provideHttpClient, withInterceptors } from '@angular/common/http';
import { HttpTestingController, provideHttpClientTesting } from '@angular/common/http/testing';
import { Router } from '@angular/router';
import { TestBed } from '@angular/core/testing';
import { Store, provideStore } from '@ngxs/store';
import { afterEach, beforeEach, describe, expect, it, vi } from 'vitest';
import { firstValueFrom } from 'rxjs';

import { createMockRouter, createTestJwt } from '@sh/testing';
import { AuthActions } from '@st/auth/auth.actions';
import { AuthStore } from '@st/auth/auth.store';
import { authInterceptor } from './auth-interceptor';

describe('authInterceptor', () => {
  let httpClient: HttpClient;
  let httpTestingController: HttpTestingController;
  let store: Store;
  let router: ReturnType<typeof createMockRouter>;

  beforeEach(() => {
    vi.clearAllMocks();
    router = createMockRouter();
    TestBed.configureTestingModule({
      providers: [
        provideStore([AuthStore]),
        provideHttpClient(withInterceptors([authInterceptor])),
        provideHttpClientTesting(),
        { provide: Router, useValue: router },
      ],
    });

    httpClient = TestBed.inject(HttpClient);
    httpTestingController = TestBed.inject(HttpTestingController);
    store = TestBed.inject(Store);
  });

  afterEach(() => {
    httpTestingController.verify();
  });

  it('should leave requests unchanged when there is no auth token', () => {
    httpClient.get('/public').subscribe();

    const request = httpTestingController.expectOne('/public');

    expect(request.request.headers.has('Authorization')).toBe(false);
    expect(request.request.withCredentials).toBe(false);

    request.flush({ ok: true });
  });

  it('should add the authorization header, enable credentials, and upload refreshed tokens', async () => {
    await firstValueFrom(
      store.dispatch(new AuthActions.Login({ token: createTestJwt({ role: 'user' }) })),
    );

    httpClient.get('/protected').subscribe();

    const request = httpTestingController.expectOne('/protected');

    expect(request.request.headers.get('Authorization')).toMatch(/^Bearer /);
    expect(request.request.withCredentials).toBe(true);

    request.flush(
      { ok: true },
      {
        headers: new HttpHeaders({ 'x-new-access-token': 'fresh-token' }),
      },
    );

    expect(store.selectSnapshot(AuthStore.token)).toBe('fresh-token');
  });

  it('should logout and redirect to login on unauthorized responses', async () => {
    await firstValueFrom(
      store.dispatch(new AuthActions.Login({ token: createTestJwt({ role: 'admin' }) })),
    );

    httpClient.get('/protected').subscribe({ error: () => undefined });

    const request = httpTestingController.expectOne('/protected');
    request.flush('Unauthorized', { status: 401, statusText: 'Unauthorized' });

    expect(store.selectSnapshot(AuthStore.isAuthenticated)).toBe(false);
    expect(store.selectSnapshot(AuthStore.token)).toBeNull();
    expect(router.navigate).toHaveBeenCalledWith(['/auth/login']);
  });
});