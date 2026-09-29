import { ExecutionContext } from '@nestjs/common';
import { GuestModelAccessGuard } from './guest-model-access.guard';
import { ModelsService } from '@mdl/services';
import type { JwtPayload } from '@cmn/interfaces';

type GuestModelAccessRequest = {
  user?: JwtPayload | null;
  body?: { modelId?: string | null };
};

type ModelsServiceMock = {
  validateGuestAccessById: jest.MockedFunction<
    ModelsService['validateGuestAccessById']
  >;
};

describe('GuestModelAccessGuard', () => {
  let guard: GuestModelAccessGuard;
  let modelsService: ModelsServiceMock;
  let validateGuestAccessByIdMock: ModelsServiceMock['validateGuestAccessById'];

  const createMockExecutionContext = (
    overrides: {
      request?: GuestModelAccessRequest;
    } = {},
  ) => {
    const mockRequest = {
      user: null,
      body: {},
      ...(overrides.request || {}),
    };

    const mockContext = {
      switchToHttp: jest.fn().mockReturnValue({
        getRequest: () => mockRequest,
      }),
    } as unknown as ExecutionContext;

    return mockContext;
  };

  beforeEach(() => {
    validateGuestAccessByIdMock =
      jest.fn<ModelsService['validateGuestAccessById']>();
    modelsService = {
      validateGuestAccessById: validateGuestAccessByIdMock,
    };

    guard = new GuestModelAccessGuard(
      modelsService as unknown as ModelsService,
    );
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
      expect(validateGuestAccessByIdMock).not.toHaveBeenCalled();
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
      expect(validateGuestAccessByIdMock).not.toHaveBeenCalled();
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
      expect(validateGuestAccessByIdMock).not.toHaveBeenCalled();
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

      validateGuestAccessByIdMock.mockResolvedValueOnce(undefined);

      const result = await guard.canActivate(context);

      expect(result).toBe(true);
      expect(validateGuestAccessByIdMock).toHaveBeenCalledWith(
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
      validateGuestAccessByIdMock.mockRejectedValueOnce(error);

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
      expect(validateGuestAccessByIdMock).not.toHaveBeenCalled();
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
      expect(validateGuestAccessByIdMock).not.toHaveBeenCalled();
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

        validateGuestAccessByIdMock.mockResolvedValueOnce(undefined);

        const result = await guard.canActivate(context);

        expect(result).toBe(true);
        expect(validateGuestAccessByIdMock).toHaveBeenCalledWith(
          modelId,
          'guest',
        );
      }
    });
  });
});
