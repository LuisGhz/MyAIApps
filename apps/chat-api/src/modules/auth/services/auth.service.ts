import { Injectable, Logger, UnauthorizedException } from '@nestjs/common';
import { JwtService } from '@nestjs/jwt';
import * as crypto from 'node:crypto';
import pkceChallenge from 'pkce-challenge';
import { EnvService } from '@cfg/schema/env.service';
import { UserService } from '../../user/services';
import { User } from '../../user/entities';
import { GithubOauthService } from './github-oauth.service';
import { RefreshTokenService } from './refresh-token.service';
import { RefreshToken } from '../entities';
import { GithubCallback } from '../interfaces';
import { Request, Response } from 'express';
import { COOKIE_CODE_VERIFIER, COOKIE_STATE } from '../const/cookies.const';
import { JwtSign } from 'src/common/interfaces';

export interface PkceData {
  state: string;
  codeVerifier: string;
  codeChallenge: string;
}

export interface AuthResult {
  accessToken: string;
  refreshToken: RefreshToken;
  user: User;
}

@Injectable()
export class AuthService {
  private readonly logger = new Logger(AuthService.name);

  constructor(
    private readonly jwtService: JwtService,
    private readonly envService: EnvService,
    private readonly userService: UserService,
    private readonly githubOauthService: GithubOauthService,
    private readonly refreshTokenService: RefreshTokenService,
  ) {}

  async generatePkceData(): Promise<PkceData> {
    const { code_verifier, code_challenge } = await pkceChallenge();
    const state = crypto.randomBytes(32).toString('hex');

    return {
      state,
      codeVerifier: code_verifier,
      codeChallenge: code_challenge,
    };
  }

  getGithubAuthorizeUrl(state: string, codeChallenge: string): string {
    return this.githubOauthService.buildAuthorizeUrl(state, codeChallenge);
  }

  validateCallbackParams(
    { error, code, state, errorDescription, clearCookies }: GithubCallback,
    req: Request,
    res: Response,
  ): void {
    // Handle GitHub OAuth errors
    if (error) {
      this.logger.warn(`GitHub OAuth error: ${error} - ${errorDescription}`);
      clearCookies();
      const errorMessage = encodeURIComponent(errorDescription || error);
      res.redirect(
        `${this.envService.frontendUrl}/auth/login?errorMessage=${errorMessage}`,
      );
      return;
    }

    // Validate required params
    if (!code || !state) {
      this.logger.warn('Missing code or state in callback');
      clearCookies();
      const errorMessage = encodeURIComponent(
        'Missing authorization code or state',
      );
      res.redirect(
        `${this.envService.frontendUrl}/auth/login?errorMessage=${errorMessage}`,
      );
      return;
    }

    // Validate state
    const cookieState = req.cookies[COOKIE_STATE];
    if (!this.validateState(cookieState, state)) {
      this.logger.warn('State mismatch in OAuth callback');
      clearCookies();
      const errorMessage = encodeURIComponent(
        'Invalid state parameter. Please try again.',
      );
      res.redirect(
        `${this.envService.frontendUrl}/auth/login?errorMessage=${errorMessage}`,
      );
      return;
    }

    // Get code verifier
    const codeVerifier = req.cookies[COOKIE_CODE_VERIFIER];
    if (!codeVerifier) {
      this.logger.warn('Missing code verifier in OAuth callback');
      clearCookies();
      const errorMessage = encodeURIComponent(
        'Missing code verifier. Please try again.',
      );
      res.redirect(
        `${this.envService.frontendUrl}/auth/login?errorMessage=${errorMessage}`,
      );
    }
  }

  async handleCallback(
    code: string,
    codeVerifier: string,
    agentInfo: string,
  ): Promise<AuthResult> {
    const tokenResponse = await this.githubOauthService.exchangeCodeForToken(
      code,
      codeVerifier,
    );
    const githubUser = await this.githubOauthService.fetchGithubUser(
      tokenResponse.access_token,
    );
    const email =
      githubUser.email ||
      (await this.githubOauthService.fetchPrimaryEmail(
        tokenResponse.access_token,
      ));

    const user = await this.userService.findOrCreate({
      ghLogin: githubUser.login,
      name: githubUser.name || githubUser.login,
      avatar: githubUser.avatar_url,
      email: email || undefined,
    });

    const activeSessions = await this.refreshTokenService.countActiveSessions(
      user.id,
    );
    const maxSessions = this.envService.maxSessionsPerUser;

    if (activeSessions >= maxSessions) {
      throw new UnauthorizedException(
        `Maximum number of sessions (${maxSessions}) reached. Please logout from another device.`,
      );
    }

    const refreshToken = await this.refreshTokenService.create(user, agentInfo);
    const accessToken = this.generateAccessToken(user);

    return {
      accessToken,
      refreshToken,
      user,
    };
  }

  generateAccessToken(user: User): string {
    const payload: JwtSign = {
      sub: user.id,
      name: user.name || user.ghLogin,
      email: user.ghLogin,
      role: user.role.name,
    };

    return this.jwtService.sign(payload);
  }

  async logout(token: string): Promise<void> {
    const refreshToken = await this.refreshTokenService.findByToken(token);

    if (!refreshToken) {
      return;
    }

    await this.refreshTokenService.revoke(token);
  }

  async refreshAccessToken(token: string): Promise<string> {
    const refreshToken = await this.refreshTokenService.findValidByToken(token);

    if (!refreshToken) {
      throw new UnauthorizedException('Invalid or expired refresh token');
    }

    return this.generateAccessToken(refreshToken.user);
  }

  validateState(cookieState: string | undefined, queryState: string): boolean {
    if (!cookieState || !queryState) {
      return false;
    }
    return cookieState === queryState;
  }
}
