import { ExecutionContext } from '@nestjs/common';
import { ROUTE_ARGS_METADATA } from '@nestjs/common/constants';
import type { JwtPayload } from '../interfaces';
import { CurrentUser } from './current-user.decorator';

type ParamMetadata = {
  data: unknown;
  factory: (data: unknown, ctx: ExecutionContext) => JwtPayload | undefined;
};

class TestController {
  getProfile(@CurrentUser() _user: JwtPayload) {
    return _user;
  }
}

const getCurrentUserFactory = () => {
  const metadata = Reflect.getMetadata(
    ROUTE_ARGS_METADATA,
    TestController,
    'getProfile',
  ) as Record<string, ParamMetadata>;

  return Object.values(metadata)[0];
};

describe('CurrentUser', () => {
  it('extracts the authenticated user from the request', () => {
    const currentUserMetadata = getCurrentUserFactory();
    const user: JwtPayload = {
      aud: ['https://api.example.com'],
      azp: 'client-id',
      exp: 2,
      iat: 1,
      iss: 'https://tenant.auth0.com/',
      scope: 'read:profile',
      sub: 'user-1',
    };
    const context = {
      switchToHttp: () => ({
        getRequest: () => ({ user }),
      }),
    } as ExecutionContext;

    expect(currentUserMetadata.factory(currentUserMetadata.data, context)).toEqual(
      user,
    );
  });

  it('returns undefined when the request does not contain a user', () => {
    const currentUserMetadata = getCurrentUserFactory();
    const context = {
      switchToHttp: () => ({
        getRequest: () => ({}),
      }),
    } as ExecutionContext;

    expect(currentUserMetadata.factory(currentUserMetadata.data, context)).toBe(
      undefined,
    );
  });
});