import { authGuardFn } from '@auth0/auth0-angular';
import { describe, expect, it } from 'vitest';
import { authChildGuard, authGuard } from './auth-guard';

describe('authGuard', () => {
  it('should re-export the auth0 guard function for route activation', () => {
    expect(authGuard).toBe(authGuardFn);
  });

  it('should re-export the auth0 guard function for child-route activation', () => {
    expect(authChildGuard).toBe(authGuardFn);
  });
});
