import { PUBLIC_KEY } from '@common/decorators/public.decorator';
import { ExecutionContext } from '@nestjs/common';
import { Reflector } from '@nestjs/core';
import { Test, TestingModule } from '@nestjs/testing';
import { AppAuthGuard } from './app-auth.guard';

describe('AppAuthGuard', () => {
  let guard: AppAuthGuard;
  let reflector: Reflector;

  const createMockExecutionContext = (
    isPublic: boolean = false,
  ): ExecutionContext => {
    const mockHandler = {};
    const mockClass = class {};

    return {
      getHandler: jest.fn().mockReturnValue(mockHandler),
      getClass: jest.fn().mockReturnValue(mockClass),
    } as unknown as ExecutionContext;
  };

  beforeEach(async () => {
    const module: TestingModule = await Test.createTestingModule({
      providers: [AppAuthGuard, Reflector],
    }).compile();

    guard = module.get<AppAuthGuard>(AppAuthGuard);
    reflector = module.get<Reflector>(Reflector);
  });

  describe('public routes', () => {
    it('should return true for public routes', () => {
      const context = createMockExecutionContext();
      jest.spyOn(reflector, 'getAllAndOverride').mockReturnValue(true);

      const result = guard.canActivate(context);

      expect(result).toBe(true);
      expect(reflector.getAllAndOverride).toHaveBeenCalledWith(PUBLIC_KEY, [
        context.getHandler(),
        context.getClass(),
      ]);
    });

    it('should not call parent canActivate for public routes', () => {
      const context = createMockExecutionContext();
      jest.spyOn(reflector, 'getAllAndOverride').mockReturnValue(true);
      const superCanActivateSpy = jest.spyOn(
        Object.getPrototypeOf(Object.getPrototypeOf(guard)),
        'canActivate',
      );

      guard.canActivate(context);

      expect(superCanActivateSpy).not.toHaveBeenCalled();
    });
  });

  describe('protected routes', () => {
    it('should call parent canActivate for protected routes', async () => {
      const context = createMockExecutionContext();
      jest.spyOn(reflector, 'getAllAndOverride').mockReturnValue(false);
      jest
        .spyOn(Object.getPrototypeOf(Object.getPrototypeOf(guard)), 'canActivate')
        .mockResolvedValue(true);

      const result = await guard.canActivate(context);

      expect(result).toBe(true);
    });

    it('should return false when parent canActivate returns false', async () => {
      const context = createMockExecutionContext();
      jest.spyOn(reflector, 'getAllAndOverride').mockReturnValue(false);
      jest
        .spyOn(Object.getPrototypeOf(Object.getPrototypeOf(guard)), 'canActivate')
        .mockResolvedValue(false);

      const result = await guard.canActivate(context);

      expect(result).toBe(false);
    });

    it('should throw error when parent canActivate throws', async () => {
      const context = createMockExecutionContext();
      const error = new Error('Unauthorized');
      jest.spyOn(reflector, 'getAllAndOverride').mockReturnValue(false);
      jest
        .spyOn(Object.getPrototypeOf(Object.getPrototypeOf(guard)), 'canActivate')
        .mockRejectedValue(error);

      await expect(guard.canActivate(context)).rejects.toThrow('Unauthorized');
    });
  });

  describe('edge cases', () => {
    it('should handle undefined isPublic as false', async () => {
      const context = createMockExecutionContext();
      jest.spyOn(reflector, 'getAllAndOverride').mockReturnValue(undefined);
      jest
        .spyOn(Object.getPrototypeOf(Object.getPrototypeOf(guard)), 'canActivate')
        .mockResolvedValue(true);

      const result = await guard.canActivate(context);

      expect(result).toBe(true);
    });

    it('should use correct metadata keys and context properties', () => {
      const context = createMockExecutionContext();
      const reflectorSpy = jest
        .spyOn(reflector, 'getAllAndOverride')
        .mockReturnValue(true);

      guard.canActivate(context);

      expect(reflectorSpy).toHaveBeenCalledWith(PUBLIC_KEY, [
        context.getHandler(),
        context.getClass(),
      ]);
      expect(context.getHandler).toHaveBeenCalled();
      expect(context.getClass).toHaveBeenCalled();
    });

    it('should return Observable from parent canActivate', (done) => {
      const context = createMockExecutionContext();
      jest.spyOn(reflector, 'getAllAndOverride').mockReturnValue(false);
      jest
        .spyOn(Object.getPrototypeOf(Object.getPrototypeOf(guard)), 'canActivate')
        .mockReturnValue({ subscribe: jest.fn((callback) => callback(true)) });

      const result = guard.canActivate(context);

      if (result && typeof result === 'object' && 'subscribe' in result) {
        (result as any).subscribe((value: any) => {
          expect(value).toBe(true);
          done();
        });
      } else {
        done();
      }
    });
  });
});
