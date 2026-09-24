import { Test, TestingModule } from '@nestjs/testing';
import { UnauthorizedException } from '@nestjs/common';
import { GithubOauthService } from './github-oauth.service';
import { EnvService } from '@cfg/schema/env.service';

const envServiceMock = {
  githubClientId: 'test-client-id',
  githubClientSecret: 'test-client-secret',
  githubCallbackUrl: 'http://localhost:3000/auth/callback',
};

describe('GithubOauthService', () => {
  let githubOauthService: GithubOauthService;
  let envServiceInstance: EnvService;

  beforeEach(async () => {
    jest.clearAllMocks();
    global.fetch = jest.fn();

    const module: TestingModule = await Test.createTestingModule({
      providers: [
        GithubOauthService,
        {
          provide: EnvService,
          useValue: envServiceMock,
        },
      ],
    }).compile();

    githubOauthService = module.get<GithubOauthService>(GithubOauthService);
    envServiceInstance = module.get<EnvService>(EnvService);
  });

  it('should build GitHub authorization URL with correct parameters', () => {
    const state = 'random-state-string';
    const codeChallenge = 'code-challenge-string';

    const result = githubOauthService.buildAuthorizeUrl(state, codeChallenge);

    expect(result).toContain('https://github.com/login/oauth/authorize');
    expect(result).toContain(`client_id=${envServiceMock.githubClientId}`);
    expect(result).toContain(
      `redirect_uri=${encodeURIComponent(envServiceMock.githubCallbackUrl)}`,
    );
    expect(result).toContain('scope=read%3Auser+user%3Aemail');
    expect(result).toContain(`state=${state}`);
    expect(result).toContain(`code_challenge=${codeChallenge}`);
    expect(result).toContain('code_challenge_method=S256');
  });

  it('should exchange code for token successfully', async () => {
    const code = 'auth-code';
    const codeVerifier = 'code-verifier';
    const mockTokenResponse = {
      access_token: 'github-access-token',
      token_type: 'bearer',
      scope: 'read:user,user:email',
    };
    (global.fetch as jest.Mock).mockResolvedValue({
      json: jest.fn().mockResolvedValue(mockTokenResponse),
    });

    const result = await githubOauthService.exchangeCodeForToken(
      code,
      codeVerifier,
    );

    expect(result).toEqual(mockTokenResponse);
    expect(global.fetch).toHaveBeenCalledWith(
      'https://github.com/login/oauth/access_token',
      {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
          Accept: 'application/json',
        },
        body: JSON.stringify({
          client_id: envServiceMock.githubClientId,
          client_secret: envServiceMock.githubClientSecret,
          code,
          redirect_uri: envServiceMock.githubCallbackUrl,
          code_verifier: codeVerifier,
        }),
      },
    );
    expect(global.fetch).toHaveBeenCalledTimes(1);
  });

  it('should fetch GitHub user successfully', async () => {
    const accessToken = 'valid-access-token';
    const mockGithubUser = {
      id: 12345,
      login: 'testuser',
      name: 'Test User',
      avatar_url: 'https://github.com/avatar.jpg',
      email: 'test@example.com',
    };
    (global.fetch as jest.Mock).mockResolvedValue({
      ok: true,
      json: jest.fn().mockResolvedValue(mockGithubUser),
    });

    const result = await githubOauthService.fetchGithubUser(accessToken);

    expect(result).toEqual(mockGithubUser);
    expect(global.fetch).toHaveBeenCalledWith('https://api.github.com/user', {
      headers: {
        Authorization: `Bearer ${accessToken}`,
        Accept: 'application/json',
      },
    });
    expect(global.fetch).toHaveBeenCalledTimes(1);
  });

  it('should fetch primary email successfully', async () => {
    const accessToken = 'valid-access-token';
    const mockEmails = [
      { email: 'secondary@example.com', primary: false, verified: true },
      { email: 'primary@example.com', primary: true, verified: true },
    ];
    (global.fetch as jest.Mock).mockResolvedValue({
      ok: true,
      json: jest.fn().mockResolvedValue(mockEmails),
    });

    const result = await githubOauthService.fetchPrimaryEmail(accessToken);

    expect(result).toBe('primary@example.com');
    expect(global.fetch).toHaveBeenCalledWith(
      'https://api.github.com/user/emails',
      {
        headers: {
          Authorization: `Bearer ${accessToken}`,
          Accept: 'application/json',
        },
      },
    );
    expect(global.fetch).toHaveBeenCalledTimes(1);
  });

  it('should throw UnauthorizedException when token exchange returns error', async () => {
    const code = 'invalid-code';
    const codeVerifier = 'code-verifier';
    const mockErrorResponse = {
      error: 'bad_verification_code',
      error_description: 'The code passed is incorrect or expired.',
    };
    (global.fetch as jest.Mock).mockResolvedValue({
      json: jest.fn().mockResolvedValue(mockErrorResponse),
    });

    await expect(
      githubOauthService.exchangeCodeForToken(code, codeVerifier),
    ).rejects.toThrow(UnauthorizedException);
    await expect(
      githubOauthService.exchangeCodeForToken(code, codeVerifier),
    ).rejects.toThrow('The code passed is incorrect or expired.');
  });

  it('should throw UnauthorizedException when token exchange returns error without description', async () => {
    const code = 'invalid-code';
    const codeVerifier = 'code-verifier';
    const mockErrorResponse = {
      error: 'invalid_grant',
    };
    (global.fetch as jest.Mock).mockResolvedValue({
      json: jest.fn().mockResolvedValue(mockErrorResponse),
    });

    await expect(
      githubOauthService.exchangeCodeForToken(code, codeVerifier),
    ).rejects.toThrow(UnauthorizedException);
    await expect(
      githubOauthService.exchangeCodeForToken(code, codeVerifier),
    ).rejects.toThrow('invalid_grant');
  });

  it('should throw error when fetching GitHub user fails', async () => {
    const accessToken = 'invalid-token';
    (global.fetch as jest.Mock).mockResolvedValue({
      ok: false,
      json: jest.fn().mockResolvedValue({}),
    });

    await expect(
      githubOauthService.fetchGithubUser(accessToken),
    ).rejects.toThrow('Failed to fetch GitHub user');
  });

  it('should return null when fetching emails fails with non-ok response', async () => {
    const accessToken = 'valid-access-token';
    (global.fetch as jest.Mock).mockResolvedValue({
      ok: false,
      json: jest.fn().mockResolvedValue({}),
    });

    const result = await githubOauthService.fetchPrimaryEmail(accessToken);

    expect(result).toBeNull();
  });

  it('should return null when fetching emails throws exception', async () => {
    const accessToken = 'valid-access-token';
    (global.fetch as jest.Mock).mockRejectedValue(new Error('Network error'));

    const result = await githubOauthService.fetchPrimaryEmail(accessToken);

    expect(result).toBeNull();
  });

  it('should return null when no primary verified email exists', async () => {
    const accessToken = 'valid-access-token';
    const mockEmails = [
      { email: 'unverified@example.com', primary: true, verified: false },
      { email: 'secondary@example.com', primary: false, verified: true },
    ];
    (global.fetch as jest.Mock).mockResolvedValue({
      ok: true,
      json: jest.fn().mockResolvedValue(mockEmails),
    });

    const result = await githubOauthService.fetchPrimaryEmail(accessToken);

    expect(result).toBeNull();
  });

  it('should return null when emails array is empty', async () => {
    const accessToken = 'valid-access-token';
    (global.fetch as jest.Mock).mockResolvedValue({
      ok: true,
      json: jest.fn().mockResolvedValue([]),
    });

    const result = await githubOauthService.fetchPrimaryEmail(accessToken);

    expect(result).toBeNull();
  });
});
