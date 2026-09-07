import { Test, TestingModule } from '@nestjs/testing';
import { JwtService } from '@nestjs/jwt';
import { AuthService } from './auth.service';
import { EnvService } from '@cfg/schema/env.service';
import { UserService } from '../../user/services';
import { GithubOauthService } from './github-oauth.service';
import { RefreshTokenService } from './refresh-token.service';
import { User } from '../../user/entities';
import { RefreshToken } from '../entities';
import { UnauthorizedException } from '@nestjs/common';
import { Request, Response } from 'express';
import { COOKIE_CODE_VERIFIER, COOKIE_STATE } from '../const/cookies.const';

const jwtServiceMock = {
  sign: jest.fn(),
};

const envServiceMock = {
  frontendUrl: 'http://localhost:3000',
  maxSessionsPerUser: 5,
};

const userServiceMock = {
  findOrCreate: jest.fn(),
};

const githubOauthServiceMock = {
  buildAuthorizeUrl: jest.fn(),
  exchangeCodeForToken: jest.fn(),
  fetchGithubUser: jest.fn(),
  fetchPrimaryEmail: jest.fn(),
};

const refreshTokenServiceMock = {
  countActiveSessions: jest.fn(),
  create: jest.fn(),
  findByToken: jest.fn(),
  findValidByToken: jest.fn(),
  revoke: jest.fn(),
};

describe('AuthService', () => {
  let authService: AuthService;

  const mockUser = {
    id: 'user-id',
    ghLogin: 'testuser',
    name: 'Test User',
    avatar: 'https://avatar.url',
    role: { name: 'user' },
  } as User;

  const mockRefreshToken = {
    id: 'token-id',
    token: 'refresh-token',
    user: mockUser,
  } as RefreshToken;

  beforeEach(async () => {
    jest.clearAllMocks();

    const module: TestingModule = await Test.createTestingModule({
      providers: [
        AuthService,
        { provide: JwtService, useValue: jwtServiceMock },
        { provide: EnvService, useValue: envServiceMock },
        { provide: UserService, useValue: userServiceMock },
        { provide: GithubOauthService, useValue: githubOauthServiceMock },
        { provide: RefreshTokenService, useValue: refreshTokenServiceMock },
      ],
    }).compile();

    authService = module.get<AuthService>(AuthService);
  });

  describe('generatePkceData', () => {
    it('should generate PKCE data with state, code verifier, and code challenge', async () => {
      const result = await authService.generatePkceData();

      expect(result).toMatchObject({
        state: expect.any(String),
        codeVerifier: expect.any(String),
        codeChallenge: expect.any(String),
      });
      expect(result.state.length).toBeGreaterThan(0);
    });
  });

  describe('getGithubAuthorizeUrl', () => {
    it('should return GitHub authorize URL', () => {
      const state = 'test-state';
      const codeChallenge = 'test-challenge';
      const expectedUrl = 'https://github.com/login/oauth/authorize?params=test';
      githubOauthServiceMock.buildAuthorizeUrl.mockReturnValue(expectedUrl);

      const result = authService.getGithubAuthorizeUrl(state, codeChallenge);

      expect(result).toBe(expectedUrl);
      expect(githubOauthServiceMock.buildAuthorizeUrl).toHaveBeenCalledWith(
        state,
        codeChallenge,
      );
    });
  });

  describe('validateCallbackParams', () => {
    let mockReq: Partial<Request>;
    let mockRes: Partial<Response>;
    let clearCookies: jest.Mock;

    beforeEach(() => {
      mockReq = { cookies: {} };
      mockRes = { redirect: jest.fn() };
      clearCookies = jest.fn();
    });

    it('should redirect if GitHub returns an error and use error as message if description is missing', () => {
      const callback = {
        error: 'access_denied',
        errorDescription: '',
        clearCookies,
      } as any;

      authService.validateCallbackParams(callback, mockReq as Request, mockRes as Response);

      expect(mockRes.redirect).toHaveBeenCalledWith(
        expect.stringContaining('errorMessage=access_denied'),
      );
    });

    it('should redirect if code or state is missing', () => {
      const callback = { code: '', state: 'state', clearCookies } as any;

      authService.validateCallbackParams(callback, mockReq as Request, mockRes as Response);

      expect(clearCookies).toHaveBeenCalled();
      expect(mockRes.redirect).toHaveBeenCalledWith(
        expect.stringContaining('errorMessage=Missing%20authorization%20code%20or%20state'),
      );
    });

    it('should redirect if state mismatch', () => {
      const callback = { code: 'code', state: 'wrong-state', clearCookies } as any;
      mockReq.cookies[COOKIE_STATE] = 'correct-state';

      authService.validateCallbackParams(callback, mockReq as Request, mockRes as Response);

      expect(clearCookies).toHaveBeenCalled();
      expect(mockRes.redirect).toHaveBeenCalledWith(
        expect.stringContaining('errorMessage=Invalid%20state%20parameter'),
      );
    });

    it('should redirect if code verifier is missing', () => {
      const callback = { code: 'code', state: 'state', clearCookies } as any;
      mockReq.cookies[COOKIE_STATE] = 'state';

      authService.validateCallbackParams(callback, mockReq as Request, mockRes as Response);

      expect(clearCookies).toHaveBeenCalled();
      expect(mockRes.redirect).toHaveBeenCalledWith(
        expect.stringContaining('errorMessage=Missing%20code%20verifier'),
      );
    });

    it('should not redirect if all params are valid', () => {
      const callback = { code: 'code', state: 'state', clearCookies } as any;
      mockReq.cookies[COOKIE_STATE] = 'state';
      mockReq.cookies[COOKIE_CODE_VERIFIER] = 'verifier';

      authService.validateCallbackParams(callback, mockReq as Request, mockRes as Response);

      expect(mockRes.redirect).not.toHaveBeenCalled();
      expect(clearCookies).not.toHaveBeenCalled();
    });
  });

  describe('handleCallback', () => {
    const code = 'auth-code';
    const codeVerifier = 'verifier';
    const agentInfo = 'Mozilla/5.0';
    const mockTokenResponse = { access_token: 'github-token' };

    it('should handle callback and return auth result', async () => {
      const mockGithubUser = {
        login: 'testuser',
        name: 'Test User',
        avatar_url: 'https://avatar.url',
        email: 'test@example.com',
      };

      githubOauthServiceMock.exchangeCodeForToken.mockResolvedValue(mockTokenResponse);
      githubOauthServiceMock.fetchGithubUser.mockResolvedValue(mockGithubUser);
      userServiceMock.findOrCreate.mockResolvedValue(mockUser);
      refreshTokenServiceMock.countActiveSessions.mockResolvedValue(2);
      refreshTokenServiceMock.create.mockResolvedValue(mockRefreshToken);
      jwtServiceMock.sign.mockReturnValue('jwt-access-token');

      const result = await authService.handleCallback(code, codeVerifier, agentInfo);

      expect(result).toEqual({
        accessToken: 'jwt-access-token',
        refreshToken: mockRefreshToken,
        user: mockUser,
      });
      expect(userServiceMock.findOrCreate).toHaveBeenCalledWith({
        ghLogin: mockGithubUser.login,
        name: mockGithubUser.name,
        avatar: mockGithubUser.avatar_url,
        email: mockGithubUser.email,
      });
    });

    it('should fetch primary email if github user email is missing', async () => {
      const mockGithubUser = {
        login: 'testuser',
        name: null,
        avatar_url: 'https://avatar.url',
        email: null,
      };

      githubOauthServiceMock.exchangeCodeForToken.mockResolvedValue(mockTokenResponse);
      githubOauthServiceMock.fetchGithubUser.mockResolvedValue(mockGithubUser);
      githubOauthServiceMock.fetchPrimaryEmail.mockResolvedValue('primary@email.com');
      userServiceMock.findOrCreate.mockResolvedValue(mockUser);
      refreshTokenServiceMock.countActiveSessions.mockResolvedValue(0);
      refreshTokenServiceMock.create.mockResolvedValue(mockRefreshToken);
      jwtServiceMock.sign.mockReturnValue('token');

      await authService.handleCallback(code, codeVerifier, agentInfo);

      expect(githubOauthServiceMock.fetchPrimaryEmail).toHaveBeenCalledWith(mockTokenResponse.access_token);
      expect(userServiceMock.findOrCreate).toHaveBeenCalledWith(expect.objectContaining({
        email: 'primary@email.com',
        name: 'testuser', // fallback to login
      }));
    });

    it('should use undefined if email is completely missing', async () => {
      const mockGithubUser = {
        login: 'testuser',
        name: 'Test',
        avatar_url: 'https://avatar.url',
        email: null,
      };

      githubOauthServiceMock.exchangeCodeForToken.mockResolvedValue(mockTokenResponse);
      githubOauthServiceMock.fetchGithubUser.mockResolvedValue(mockGithubUser);
      githubOauthServiceMock.fetchPrimaryEmail.mockResolvedValue(null);
      userServiceMock.findOrCreate.mockResolvedValue(mockUser);
      refreshTokenServiceMock.countActiveSessions.mockResolvedValue(0);
      refreshTokenServiceMock.create.mockResolvedValue(mockRefreshToken);
      jwtServiceMock.sign.mockReturnValue('token');

      await authService.handleCallback(code, codeVerifier, agentInfo);

      expect(userServiceMock.findOrCreate).toHaveBeenCalledWith(expect.objectContaining({
        email: undefined,
      }));
    });

    it('should throw UnauthorizedException if max sessions reached', async () => {
      githubOauthServiceMock.exchangeCodeForToken.mockResolvedValue(mockTokenResponse);
      githubOauthServiceMock.fetchGithubUser.mockResolvedValue({ email: 'test@test.com' });
      userServiceMock.findOrCreate.mockResolvedValue(mockUser);
      refreshTokenServiceMock.countActiveSessions.mockResolvedValue(5);

      await expect(
        authService.handleCallback(code, codeVerifier, agentInfo),
      ).rejects.toThrow(UnauthorizedException);
    });
  });

  describe('generateAccessToken', () => {
    it('should generate access token for user and use ghLogin if name is missing', () => {
      const userWithoutName = { ...mockUser, name: '' };
      const expectedToken = 'generated-access-token';
      jwtServiceMock.sign.mockReturnValue(expectedToken);

      const result = authService.generateAccessToken(userWithoutName);

      expect(result).toBe(expectedToken);
      expect(jwtServiceMock.sign).toHaveBeenCalledWith(expect.objectContaining({
        name: userWithoutName.ghLogin,
      }));
    });
  });

  describe('logout', () => {
    it('should revoke refresh token if found', async () => {
      const token = 'refresh-token';
      refreshTokenServiceMock.findByToken.mockResolvedValue(mockRefreshToken);
      refreshTokenServiceMock.revoke.mockResolvedValue(undefined);

      await authService.logout(token);

      expect(refreshTokenServiceMock.revoke).toHaveBeenCalledWith(token);
    });

    it('should do nothing if refresh token not found', async () => {
      refreshTokenServiceMock.findByToken.mockResolvedValue(null);

      await authService.logout('unknown');

      expect(refreshTokenServiceMock.revoke).not.toHaveBeenCalled();
    });
  });

  describe('refreshAccessToken', () => {
    it('should return new access token for valid refresh token', async () => {
      const token = 'valid-token';
      refreshTokenServiceMock.findValidByToken.mockResolvedValue(mockRefreshToken);
      jwtServiceMock.sign.mockReturnValue('new-token');

      const result = await authService.refreshAccessToken(token);

      expect(result).toBe('new-token');
      expect(jwtServiceMock.sign).toHaveBeenCalled();
    });

    it('should throw UnauthorizedException for invalid token', async () => {
      refreshTokenServiceMock.findValidByToken.mockResolvedValue(null);

      await expect(authService.refreshAccessToken('invalid')).rejects.toThrow(UnauthorizedException);
    });
  });

  describe('validateState', () => {
    it('should return true if states match', () => {
      expect(authService.validateState('state', 'state')).toBe(true);
    });

    it('should return false if states do not match', () => {
      expect(authService.validateState('state', 'wrong')).toBe(false);
    });

    it('should return false if either state is missing', () => {
      expect(authService.validateState(undefined, 'state')).toBe(false);
      expect(authService.validateState('state', '')).toBe(false);
    });
  });
});

