import { ExecutionContext } from '@nestjs/common';
import { Reflector } from '@nestjs/core';
import { IS_PUBLIC_KEY } from '../decorators';
import { JwtAuthGuard } from './jwt-auth.guard';

describe('JwtAuthGuard', () => {
  let guard: JwtAuthGuard;
  let reflector: jest.Mocked<Reflector>;
  let context: ExecutionContext;

  beforeEach(() => {
    reflector = {
      getAllAndOverride: jest.fn(),
    } as unknown as jest.Mocked<Reflector>;
    guard = new JwtAuthGuard(reflector);
    context = {
      getClass: jest.fn(),
      getHandler: jest.fn(),
    } as unknown as ExecutionContext;
  });

  afterEach(() => {
    jest.clearAllMocks();
    jest.restoreAllMocks();
  });

  it('allows public routes without delegating to the passport guard', () => {
    const authGuardPrototype = Object.getPrototypeOf(
      JwtAuthGuard.prototype,
    ) as Record<string, (context: ExecutionContext) => unknown>;
    const canActivateSpy = jest.spyOn(authGuardPrototype, 'canActivate');

    reflector.getAllAndOverride.mockReturnValue(true);

    expect(guard.canActivate(context)).toBe(true);
    expect(reflector.getAllAndOverride).toHaveBeenCalledWith(IS_PUBLIC_KEY, [
      context.getHandler(),
      context.getClass(),
    ]);
    expect(canActivateSpy).not.toHaveBeenCalled();
  });

  it('delegates protected routes to the passport guard', async () => {
    const authGuardPrototype = Object.getPrototypeOf(
      JwtAuthGuard.prototype,
    ) as Record<string, (context: ExecutionContext) => unknown>;
    const canActivateSpy = jest
      .spyOn(authGuardPrototype, 'canActivate')
      .mockResolvedValue(true);

    reflector.getAllAndOverride.mockReturnValue(false);

    await expect(guard.canActivate(context)).resolves.toBe(true);
    expect(canActivateSpy).toHaveBeenCalledWith(context);
  });
});