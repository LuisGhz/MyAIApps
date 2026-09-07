import {
  ExecutionContext,
  ForbiddenException,
  UnauthorizedException,
} from '@nestjs/common';
import { Reflector } from '@nestjs/core';
import { TokenExpiredError } from '@nestjs/jwt';
import { JwtGuard } from './jwt.guard';
import { JwtService } from '@auth/services';
import { RefreshTokenService } from '@auth/services/refresh-token.service';
import { PUBLIC_KEY, ADMIN_ROLE_KEY } from '@cmn/decorators';
import { COOKIE_REFRESH_TOKEN } from '@auth/const/cookies.const';
import { JwtPayload } from '@cmn/interfaces';

describe('JwtGuard', () => {
  let guard: JwtGuard;
  let jwtService: jest.Mocked<JwtService>;
  let refreshTokenService: jest.Mocked<RefreshTokenService>;
  let reflector: jest.Mocked<Reflector>;

  const mockPayload: JwtPayload = {
    sub: 'user-id',
    name: 'Test User',
    email: 'test@example.com',
    role: 'user',
    exp: Math.floor(Date.now() / 1000) + 3600,
    iat: Math.floor(Date.now() / 1000),
  };

  const mockAdminPayload: JwtPayload = {
    sub: 'admin-id',
    name: 'Admin User',
    email: 'admin@example.com',
    role: 'admin',
    exp: Math.floor(Date.now() / 1000) + 3600,
    iat: Math.floor(Date.now() / 1000),
  };

  const createMockExecutionContext = (
    overrides: {
      request?: Record<string, any>;
      response?: Record<string, any>;
    } = {},
  ) => {
    const mockRequest = {
      headers: {
        authorization: 'Bearer valid-token',
      },
      cookies: {},
      ...(overrides.request || {}),
    };

    const mockResponse = {
      setHeader: jest.fn(),
      ...(overrides.response || {}),
    };

    const mockContext = {
      getHandler: jest.fn(),
      getClass: jest.fn(),
      switchToHttp: jest.fn(),
    } as unknown as jest.Mocked<ExecutionContext>;

    (mockContext.switchToHttp as jest.Mock).mockReturnValue({
      getRequest: () => mockRequest,
      getResponse: () => mockResponse,
    });

    return {
      context: mockContext,
      mockRequest,
      mockResponse,
    };
  };

  beforeEach(() => {
    jwtService = {
      verify: jest.fn(),
      decode: jest.fn(),
      signWithPreviousToken: jest.fn(),
    } as unknown as jest.Mocked<JwtService>;

    refreshTokenService = {
      findValidByToken: jest.fn(),
    } as unknown as jest.Mocked<RefreshTokenService>;

    reflector = {
      getAllAndOverride: jest.fn(),
    } as unknown as jest.Mocked<Reflector>;

    guard = new JwtGuard(jwtService, refreshTokenService, reflector);
  });

  describe('canActivate', () => {
    it('should allow access when route is public', async () => {
      const { context } = createMockExecutionContext();
      (reflector.getAllAndOverride as jest.Mock).mockReturnValueOnce(true);

      const result = await guard.canActivate(context);

      expect(result).toBe(true);
      expect(jwtService.verify).not.toHaveBeenCalled();
    });

    it('should return true with valid token', async () => {
      const { context, mockRequest } = createMockExecutionContext();
      (reflector.getAllAndOverride as jest.Mock)
        .mockReturnValueOnce(false)
        .mockReturnValueOnce(false);
      (jwtService.verify as jest.Mock).mockReturnValueOnce(mockPayload);

      const result = await guard.canActivate(context);

      expect(result).toBe(true);
      expect(mockRequest['user']).toEqual(mockPayload);
    });

    it('should throw UnauthorizedException when Authorization header is missing', async () => {
      const { context } = createMockExecutionContext({
        request: { headers: {} },
      });
      (reflector.getAllAndOverride as jest.Mock)
        .mockReturnValueOnce(false)
        .mockReturnValueOnce(false);

      await expect(guard.canActivate(context)).rejects.toThrow(
        UnauthorizedException,
      );
    });

    it('should throw UnauthorizedException when Authorization header does not start with Bearer', async () => {
      const { context } = createMockExecutionContext({
        request: { headers: { authorization: 'Basic invalid' } },
      });
      (reflector.getAllAndOverride as jest.Mock)
        .mockReturnValueOnce(false)
        .mockReturnValueOnce(false);

      await expect(guard.canActivate(context)).rejects.toThrow(
        UnauthorizedException,
      );
    });

    it('should return false when token is invalid and not expired', async () => {
      const { context } = createMockExecutionContext();
      (reflector.getAllAndOverride as jest.Mock)
        .mockReturnValueOnce(false)
        .mockReturnValueOnce(false);
      (jwtService.verify as jest.Mock).mockImplementationOnce(() => {
        throw new Error('Invalid token');
      });

      const result = await guard.canActivate(context);

      expect(result).toBe(false);
    });

    it('should return false when admin role is required but user is not admin and token throws error', async () => {
      const { context } = createMockExecutionContext();
      (reflector.getAllAndOverride as jest.Mock)
        .mockReturnValueOnce(false)
        .mockReturnValueOnce(true);
      (jwtService.verify as jest.Mock).mockReturnValueOnce(mockPayload);

      const result = await guard.canActivate(context);

      expect(result).toBe(false);
    });

    it('should return true with valid token when admin role is required and user is admin', async () => {
      const { context, mockRequest } = createMockExecutionContext();
      (reflector.getAllAndOverride as jest.Mock)
        .mockReturnValueOnce(false)
        .mockReturnValueOnce(true);
      (jwtService.verify as jest.Mock).mockReturnValueOnce(mockAdminPayload);

      const result = await guard.canActivate(context);

      expect(result).toBe(true);
      expect(mockRequest['user']).toEqual(mockAdminPayload);
    });
  });

  describe('handleExpiredToken', () => {
    it('should refresh token and return true with valid refresh token', async () => {
      const newToken = 'new-access-token';
      const { context, mockRequest, mockResponse } = createMockExecutionContext(
        {
          request: {
            headers: { authorization: 'Bearer expired-token' },
            cookies: { [COOKIE_REFRESH_TOKEN]: 'valid-refresh-token' },
          },
        },
      );

      (reflector.getAllAndOverride as jest.Mock)
        .mockReturnValueOnce(false)
        .mockReturnValueOnce(false);
      (jwtService.verify as jest.Mock).mockImplementationOnce(() => {
        throw new TokenExpiredError('expired', new Date());
      });
      (refreshTokenService.findValidByToken as jest.Mock).mockResolvedValueOnce(
        {},
      );
      (jwtService.decode as jest.Mock).mockReturnValueOnce(mockPayload);
      (jwtService.signWithPreviousToken as jest.Mock).mockReturnValueOnce(
        newToken,
      );

      const result = await guard.canActivate(context);

      expect(result).toBe(true);
      expect(mockResponse.setHeader).toHaveBeenCalledWith(
        'Access-Control-Expose-Headers',
        'x-new-access-token',
      );
      expect(mockResponse.setHeader).toHaveBeenCalledWith(
        'x-new-access-token',
        newToken,
      );
      expect(mockRequest['user']).toEqual(mockPayload);
    });

    it('should throw UnauthorizedException when refresh token is missing', async () => {
      const { context } = createMockExecutionContext({
        request: {
          headers: { authorization: 'Bearer expired-token' },
          cookies: {},
        },
      });

      (reflector.getAllAndOverride as jest.Mock)
        .mockReturnValueOnce(false)
        .mockReturnValueOnce(false);
      (jwtService.verify as jest.Mock).mockImplementationOnce(() => {
        throw new TokenExpiredError('expired', new Date());
      });

      await expect(guard.canActivate(context)).rejects.toThrow(
        UnauthorizedException,
      );
    });

    it('should throw UnauthorizedException when refresh token is invalid', async () => {
      const { context } = createMockExecutionContext({
        request: {
          headers: { authorization: 'Bearer expired-token' },
          cookies: { refresh_token: 'invalid-refresh-token' },
        },
      });

      (reflector.getAllAndOverride as jest.Mock)
        .mockReturnValueOnce(false)
        .mockReturnValueOnce(false);
      (jwtService.verify as jest.Mock).mockImplementationOnce(() => {
        throw new TokenExpiredError('expired', new Date());
      });
      (refreshTokenService.findValidByToken as jest.Mock).mockResolvedValueOnce(
        null,
      );

      await expect(guard.canActivate(context)).rejects.toThrow(
        UnauthorizedException,
      );
    });

    it('should throw UnauthorizedException when expired token is required to be admin but is not', async () => {
      const { context } = createMockExecutionContext({
        request: {
          headers: { authorization: 'Bearer expired-token' },
          cookies: { [COOKIE_REFRESH_TOKEN]: 'valid-refresh-token' },
        },
      });

      (reflector.getAllAndOverride as jest.Mock)
        .mockReturnValueOnce(false)
        .mockReturnValueOnce(true);
      (jwtService.verify as jest.Mock).mockImplementationOnce(() => {
        throw new TokenExpiredError('expired', new Date());
      });
      (jwtService.decode as jest.Mock).mockReturnValueOnce(mockPayload);

      await expect(guard.canActivate(context)).rejects.toThrow(
        ForbiddenException,
      );
    });

    it('should throw UnauthorizedException when token refresh fails', async () => {
      const { context } = createMockExecutionContext({
        request: {
          headers: { authorization: 'Bearer expired-token' },
          cookies: { [COOKIE_REFRESH_TOKEN]: 'valid-refresh-token' },
        },
      });

      (reflector.getAllAndOverride as jest.Mock)
        .mockReturnValueOnce(false)
        .mockReturnValueOnce(false);
      (jwtService.verify as jest.Mock).mockImplementationOnce(() => {
        throw new TokenExpiredError('expired', new Date());
      });
      (refreshTokenService.findValidByToken as jest.Mock).mockResolvedValueOnce(
        {},
      );
      (jwtService.decode as jest.Mock).mockImplementationOnce(() => {
        throw new Error('Decode error');
      });

      await expect(guard.canActivate(context)).rejects.toThrow(
        UnauthorizedException,
      );
    });
  });
});
