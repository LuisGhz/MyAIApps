import { ExecutionContext } from '@nestjs/common';
import { GuestModelAccessGuard } from './guest-model-access.guard';
import { ModelsService } from '@mdl/services';
import type { JwtPayload } from '@cmn/interfaces';

describe('GuestModelAccessGuard', () => {
  let guard: GuestModelAccessGuard;
  let modelsService: jest.Mocked<ModelsService>;

  const createMockExecutionContext = (
    overrides: {
      request?: Record<string, any>;
    } = {},
  ) => {
    const mockRequest = {
      user: null,
      body: {},
      ...(overrides.request || {}),
    };

    const mockContext = {
      switchToHttp: jest.fn(),
    } as unknown as jest.Mocked<ExecutionContext>;

    (mockContext.switchToHttp as jest.Mock).mockReturnValue({
      getRequest: () => mockRequest,
    });

    return mockContext;
  };

  beforeEach(() => {
    modelsService = {
      validateGuestAccessById: jest.fn(),
    } as unknown as jest.Mocked<ModelsService>;

    guard = new GuestModelAccessGuard(modelsService);
  });

  describe('canActivate', () => {
    it('should return true when user is not guest', async () => {
      const user: JwtPayload = {
        sub: 'user-id',
        name: 'User',
        email: 'user@example.com',
        role: 'user',
        exp: Math.floor(Date.now() / 1000) + 3600,
        iat: Math.floor(Date.now() / 1000),
      };

      const context = createMockExecutionContext({
        request: {
          user,
          body: { modelId: 'some-model-id' },
        },
      });

      const result = await guard.canActivate(context);

      expect(result).toBe(true);
      expect(modelsService.validateGuestAccessById).not.toHaveBeenCalled();
    });

    it('should return true when user is null', async () => {
      const context = createMockExecutionContext({
        request: {
          user: null,
          body: { modelId: 'some-model-id' },
        },
      });

      const result = await guard.canActivate(context);

      expect(result).toBe(true);
      expect(modelsService.validateGuestAccessById).not.toHaveBeenCalled();
    });

    it('should return true when request body has no model', async () => {
      const user: JwtPayload = {
        sub: 'guest-id',
        name: 'Guest',
        email: 'guest@example.com',
        role: 'guest',
        exp: Math.floor(Date.now() / 1000) + 3600,
        iat: Math.floor(Date.now() / 1000),
      };

      const context = createMockExecutionContext({
        request: {
          user,
          body: {},
        },
      });

      const result = await guard.canActivate(context);

      expect(result).toBe(true);
      expect(modelsService.validateGuestAccessById).not.toHaveBeenCalled();
    });

    it('should validate guest access when user is guest and model is provided', async () => {
      const user: JwtPayload = {
        sub: 'guest-id',
        name: 'Guest',
        email: 'guest@example.com',
        role: 'guest',
        exp: Math.floor(Date.now() / 1000) + 3600,
        iat: Math.floor(Date.now() / 1000),
      };

      const context = createMockExecutionContext({
        request: {
          user,
          body: { modelId: 'gpt-4-id' },
        },
      });

      (
        modelsService.validateGuestAccessById as jest.Mock
      ).mockResolvedValueOnce(undefined);

      const result = await guard.canActivate(context);

      expect(result).toBe(true);
      expect(modelsService.validateGuestAccessById).toHaveBeenCalledWith(
        'gpt-4-id',
        'guest',
      );
    });

    it('should throw error when guest access validation fails', async () => {
      const user: JwtPayload = {
        sub: 'guest-id',
        name: 'Guest',
        email: 'guest@example.com',
        role: 'guest',
        exp: Math.floor(Date.now() / 1000) + 3600,
        iat: Math.floor(Date.now() / 1000),
      };

      const context = createMockExecutionContext({
        request: {
          user,
          body: { modelId: 'gpt-4-id' },
        },
      });

      const error = new Error('Guest access denied for this model');
      (
        modelsService.validateGuestAccessById as jest.Mock
      ).mockRejectedValueOnce(error);

      await expect(guard.canActivate(context)).rejects.toThrow(error);
    });

    it('should return true for guest user with empty model value', async () => {
      const user: JwtPayload = {
        sub: 'guest-id',
        name: 'Guest',
        email: 'guest@example.com',
        role: 'guest',
        exp: Math.floor(Date.now() / 1000) + 3600,
        iat: Math.floor(Date.now() / 1000),
      };

      const context = createMockExecutionContext({
        request: {
          user,
          body: { modelId: null },
        },
      });

      const result = await guard.canActivate(context);

      expect(result).toBe(true);
      expect(modelsService.validateGuestAccessById).not.toHaveBeenCalled();
    });

    it('should return true for guest user with empty string model', async () => {
      const user: JwtPayload = {
        sub: 'guest-id',
        name: 'Guest',
        email: 'guest@example.com',
        role: 'guest',
        exp: Math.floor(Date.now() / 1000) + 3600,
        iat: Math.floor(Date.now() / 1000),
      };

      const context = createMockExecutionContext({
        request: {
          user,
          body: { modelId: '' },
        },
      });

      const result = await guard.canActivate(context);

      expect(result).toBe(true);
      expect(modelsService.validateGuestAccessById).not.toHaveBeenCalled();
    });

    it('should validate guest access with different model values', async () => {
      const user: JwtPayload = {
        sub: 'guest-id',
        name: 'Guest',
        email: 'guest@example.com',
        role: 'guest',
        exp: Math.floor(Date.now() / 1000) + 3600,
        iat: Math.floor(Date.now() / 1000),
      };

      const modelIds = ['model-id-1', 'model-id-2', 'model-id-3'];

      for (const modelId of modelIds) {
        const context = createMockExecutionContext({
          request: {
            user,
            body: { modelId },
          },
        });

        (
          modelsService.validateGuestAccessById as jest.Mock
        ).mockResolvedValueOnce(undefined);

        const result = await guard.canActivate(context);

        expect(result).toBe(true);
        expect(modelsService.validateGuestAccessById).toHaveBeenCalledWith(
          modelId,
          'guest',
        );
      }
    });
  });
});
