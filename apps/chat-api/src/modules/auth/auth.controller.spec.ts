import { Test, TestingModule } from '@nestjs/testing';
import { UnauthorizedException } from '@nestjs/common';
import { AuthController } from './auth.controller';
import { AuthService } from './services';
import { EnvService } from '@cfg/schema/env.service';
import type { Request, Response } from 'express';
import {
  COOKIE_STATE,
  COOKIE_CODE_VERIFIER,
  COOKIE_REFRESH_TOKEN,
} from './const/cookies.const';

const authServiceMock = {
  generatePkceData: jest.fn(),
  getGithubAuthorizeUrl: jest.fn(),
  validateCallbackParams: jest.fn(),
  handleCallback: jest.fn(),
  logout: jest.fn(),
};

const envServiceMock = {
  isProduction: false,
  frontendUrl: 'http://localhost:3000',
};

describe('AuthController', () => {
  let controller: AuthController;
  let authServiceInstance: AuthService;
  let envServiceInstance: EnvService;

  beforeEach(async () => {
    jest.clearAllMocks();

    const module: TestingModule = await Test.createTestingModule({
      controllers: [AuthController],
      providers: [
        {
          provide: AuthService,
          useValue: authServiceMock,
        },
        {
          provide: EnvService,
          useValue: envServiceMock,
        },
      ],
    }).compile();

    controller = module.get<AuthController>(AuthController);
    authServiceInstance = module.get<AuthService>(AuthService);
    envServiceInstance = module.get<EnvService>(EnvService);
  });

  it('should be defined', () => {
    expect(controller).toBeDefined();
  });

  describe('login', () => {
    it('should generate PKCE data and redirect to GitHub authorize URL', async () => {
      const pkceData = {
        state: 'mock-state',
        codeVerifier: 'mock-verifier',
        codeChallenge: 'mock-challenge',
      };
      const authorizeUrl = 'https://github.com/login/oauth/authorize?params';

      authServiceMock.generatePkceData.mockResolvedValue(pkceData);
      authServiceMock.getGithubAuthorizeUrl.mockReturnValue(authorizeUrl);

      const res = {
        cookie: jest.fn(),
        redirect: jest.fn(),
      } as unknown as Response;

      await controller.login(res);

      expect(authServiceInstance.generatePkceData).toHaveBeenCalledTimes(1);
      expect(authServiceInstance.getGithubAuthorizeUrl).toHaveBeenCalledWith(
        pkceData.state,
        pkceData.codeChallenge,
      );
      expect(res.cookie).toHaveBeenCalledWith(COOKIE_STATE, pkceData.state, {
        httpOnly: true,
        secure: false,
        maxAge: 300000,
      });
      expect(res.cookie).toHaveBeenCalledWith(
        COOKIE_CODE_VERIFIER,
        pkceData.codeVerifier,
        {
          httpOnly: true,
          secure: false,
          maxAge: 300000,
        },
      );
      expect(res.redirect).toHaveBeenCalledWith(authorizeUrl);
    });

    it('should set secure cookies when in production', async () => {
      const pkceData = {
        state: 'mock-state',
        codeVerifier: 'mock-verifier',
        codeChallenge: 'mock-challenge',
      };
      const authorizeUrl = 'https://github.com/login/oauth/authorize?params';

      authServiceMock.generatePkceData.mockResolvedValue(pkceData);
      authServiceMock.getGithubAuthorizeUrl.mockReturnValue(authorizeUrl);
      envServiceMock.isProduction = true;

      const res = {
        cookie: jest.fn(),
        redirect: jest.fn(),
      } as unknown as Response;

      await controller.login(res);

      expect(res.cookie).toHaveBeenCalledWith(COOKIE_STATE, pkceData.state, {
        httpOnly: true,
        secure: true,
        maxAge: 300000,
      });
      expect(res.cookie).toHaveBeenCalledWith(
        COOKIE_CODE_VERIFIER,
        pkceData.codeVerifier,
        {
          httpOnly: true,
          secure: true,
          maxAge: 300000,
        },
      );

      envServiceMock.isProduction = false;
    });
  });

  describe('callback', () => {
    it('should validate params, handle callback, and redirect to success page', async () => {
      const code = 'mock-code';
      const state = 'mock-state';
      const codeVerifier = 'mock-verifier';
      const agentInfo = 'Mozilla/5.0';
      const accessToken = 'mock-access-token';
      const refreshToken = {
        token: 'mock-refresh-token',
        exp: new Date(Date.now() + 7 * 24 * 60 * 60 * 1000),
      };
      const mockUser = {
        id: 1,
        ghLogin: 'testuser',
        name: 'Test User',
      };

      const result = {
        accessToken,
        refreshToken,
        user: mockUser,
      };

      authServiceMock.handleCallback.mockResolvedValue(result);

      const req = {
        cookies: {
          [COOKIE_CODE_VERIFIER]: codeVerifier,
        },
        headers: {
          'user-agent': agentInfo,
        },
      } as unknown as Request;

      const res = {
        cookie: jest.fn(),
        clearCookie: jest.fn(),
        redirect: jest.fn(),
      } as unknown as Response;

      await controller.callback(code, state, '', '', req, res);

      expect(authServiceInstance.validateCallbackParams).toHaveBeenCalledWith(
        {
          error: '',
          code,
          state,
          errorDescription: '',
          clearCookies: expect.any(Function),
        },
        req,
        res,
      );
      expect(authServiceInstance.handleCallback).toHaveBeenCalledWith(
        code,
        codeVerifier,
        agentInfo,
      );
      expect(res.clearCookie).toHaveBeenCalledWith(COOKIE_STATE);
      expect(res.clearCookie).toHaveBeenCalledWith(COOKIE_CODE_VERIFIER);
      expect(res.cookie).toHaveBeenCalledWith(
        COOKIE_REFRESH_TOKEN,
        refreshToken.token,
        {
          httpOnly: true,
          secure: false,
          maxAge: expect.any(Number),
        },
      );
      expect(res.redirect).toHaveBeenCalledWith(
        `${envServiceMock.frontendUrl}/auth/success?accessToken=${accessToken}`,
      );
    });

    it('should clear cookies and redirect to login on UnauthorizedException', async () => {
      const code = 'mock-code';
      const state = 'mock-state';
      const codeVerifier = 'mock-verifier';
      const errorMessage = 'Maximum sessions reached';

      authServiceMock.handleCallback.mockRejectedValue(
        new UnauthorizedException(errorMessage),
      );

      const req = {
        cookies: {
          [COOKIE_CODE_VERIFIER]: codeVerifier,
        },
        headers: {
          'user-agent': 'Mozilla/5.0',
        },
      } as unknown as Request;

      const res = {
        cookie: jest.fn(),
        clearCookie: jest.fn(),
        redirect: jest.fn(),
      } as unknown as Response;

      await controller.callback(code, state, '', '', req, res);

      expect(res.clearCookie).toHaveBeenCalledWith(COOKIE_STATE);
      expect(res.clearCookie).toHaveBeenCalledWith(COOKIE_CODE_VERIFIER);
      expect(res.redirect).toHaveBeenCalledWith(
        `${envServiceMock.frontendUrl}/auth/login?errorMessage=${encodeURIComponent(errorMessage)}`,
      );
    });

    it('should clear cookies and redirect to login on generic Error', async () => {
      const code = 'mock-code';
      const state = 'mock-state';
      const codeVerifier = 'mock-verifier';
      const errorMessage = 'Network error';

      authServiceMock.handleCallback.mockRejectedValue(new Error(errorMessage));

      const req = {
        cookies: {
          [COOKIE_CODE_VERIFIER]: codeVerifier,
        },
        headers: {
          'user-agent': 'Mozilla/5.0',
        },
      } as unknown as Request;

      const res = {
        cookie: jest.fn(),
        clearCookie: jest.fn(),
        redirect: jest.fn(),
      } as unknown as Response;

      await controller.callback(code, state, '', '', req, res);

      expect(res.clearCookie).toHaveBeenCalledWith(COOKIE_STATE);
      expect(res.clearCookie).toHaveBeenCalledWith(COOKIE_CODE_VERIFIER);
      expect(res.redirect).toHaveBeenCalledWith(
        `${envServiceMock.frontendUrl}/auth/login?errorMessage=${encodeURIComponent(errorMessage)}`,
      );
    });

    it('should handle unknown error types', async () => {
      const code = 'mock-code';
      const state = 'mock-state';
      const codeVerifier = 'mock-verifier';

      authServiceMock.handleCallback.mockRejectedValue('Unknown error');

      const req = {
        cookies: {
          [COOKIE_CODE_VERIFIER]: codeVerifier,
        },
        headers: {
          'user-agent': 'Mozilla/5.0',
        },
      } as unknown as Request;

      const res = {
        cookie: jest.fn(),
        clearCookie: jest.fn(),
        redirect: jest.fn(),
      } as unknown as Response;

      await controller.callback(code, state, '', '', req, res);

      expect(res.redirect).toHaveBeenCalledWith(
        `${envServiceMock.frontendUrl}/auth/login?errorMessage=${encodeURIComponent('Authentication failed. Please try again.')}`,
      );
    });

    it('should use "Unknown" when user-agent header is missing', async () => {
      const code = 'mock-code';
      const state = 'mock-state';
      const codeVerifier = 'mock-verifier';
      const accessToken = 'mock-access-token';
      const refreshToken = {
        token: 'mock-refresh-token',
        exp: new Date(Date.now() + 7 * 24 * 60 * 60 * 1000),
      };
      const mockUser = {
        id: 1,
        ghLogin: 'testuser',
        name: 'Test User',
      };

      const result = {
        accessToken,
        refreshToken,
        user: mockUser,
      };

      authServiceMock.handleCallback.mockResolvedValue(result);

      const req = {
        cookies: {
          [COOKIE_CODE_VERIFIER]: codeVerifier,
        },
        headers: {},
      } as unknown as Request;

      const res = {
        cookie: jest.fn(),
        clearCookie: jest.fn(),
        redirect: jest.fn(),
      } as unknown as Response;

      await controller.callback(code, state, '', '', req, res);

      expect(authServiceInstance.handleCallback).toHaveBeenCalledWith(
        code,
        codeVerifier,
        'Unknown',
      );
    });
  });

  describe('logout', () => {
    it('should call logout service with refresh token and clear cookie', async () => {
      const refreshToken = 'mock-refresh-token';

      const req = {
        cookies: {
          [COOKIE_REFRESH_TOKEN]: refreshToken,
        },
      } as unknown as Request;

      const res = {
        clearCookie: jest.fn(),
        json: jest.fn(),
      } as unknown as Response;

      await controller.logout(req, res);

      expect(authServiceInstance.logout).toHaveBeenCalledWith(refreshToken);
      expect(res.clearCookie).toHaveBeenCalledWith(COOKIE_REFRESH_TOKEN);
      expect(res.json).toHaveBeenCalledWith({
        message: 'Logged out successfully',
      });
    });

    it('should clear cookie even when refresh token is missing', async () => {
      const req = {
        cookies: {},
      } as unknown as Request;

      const res = {
        clearCookie: jest.fn(),
        json: jest.fn(),
      } as unknown as Response;

      await controller.logout(req, res);

      expect(authServiceInstance.logout).not.toHaveBeenCalled();
      expect(res.clearCookie).toHaveBeenCalledWith(COOKIE_REFRESH_TOKEN);
      expect(res.json).toHaveBeenCalledWith({
        message: 'Logged out successfully',
      });
    });

    it('should handle logout service errors gracefully', async () => {
      const refreshToken = 'mock-refresh-token';

      authServiceMock.logout.mockRejectedValue(new Error('Database error'));

      const req = {
        cookies: {
          [COOKIE_REFRESH_TOKEN]: refreshToken,
        },
      } as unknown as Request;

      const res = {
        clearCookie: jest.fn(),
        json: jest.fn(),
      } as unknown as Response;

      await expect(controller.logout(req, res)).rejects.toThrow(
        'Database error',
      );
      expect(authServiceInstance.logout).toHaveBeenCalledWith(refreshToken);
    });
  });
});
