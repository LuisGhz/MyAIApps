import { provideHttpClient } from '@angular/common/http';
import { HttpTestingController, provideHttpClientTesting } from '@angular/common/http/testing';
import { TestBed } from '@angular/core/testing';
import { afterEach, beforeEach, describe, expect, it, vi } from 'vitest';

import { environment } from '@env/environment';
import { AuthApi } from './auth-api';

describe('AuthApi', () => {
  let service: AuthApi;
  let httpTestingController: HttpTestingController;

  beforeEach(() => {
    vi.clearAllMocks();
    TestBed.configureTestingModule({
      providers: [AuthApi, provideHttpClient(), provideHttpClientTesting()],
    });

    service = TestBed.inject(AuthApi);
    httpTestingController = TestBed.inject(HttpTestingController);
  });

  afterEach(() => {
    httpTestingController.verify();
  });

  it('should post to the logout endpoint', async () => {
    const logoutPromise = service.logout();
    const request = httpTestingController.expectOne(`${environment.apiUrl}/auth/logout`);

    expect(request.request.method).toBe('POST');
    expect(request.request.body).toEqual({});

    request.flush({ success: true });

    await expect(logoutPromise).resolves.toEqual({ success: true });
  });
});
