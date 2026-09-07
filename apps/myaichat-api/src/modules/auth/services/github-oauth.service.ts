import { Injectable, Logger, UnauthorizedException } from '@nestjs/common';
import { EnvService } from '@cfg/schema/env.service';
import type {
  GithubTokenResponse,
  GithubUser,
  GithubEmail,
} from '../interfaces';

@Injectable()
export class GithubOauthService {
  private readonly logger = new Logger(GithubOauthService.name);

  private readonly authorizeUrl = 'https://github.com/login/oauth/authorize';
  private readonly tokenUrl = 'https://github.com/login/oauth/access_token';
  private readonly userUrl = 'https://api.github.com/user';
  private readonly emailsUrl = 'https://api.github.com/user/emails';

  constructor(private readonly envService: EnvService) {}

  buildAuthorizeUrl(state: string, codeChallenge: string): string {
    const params = new URLSearchParams({
      client_id: this.envService.githubClientId,
      redirect_uri: this.envService.githubCallbackUrl,
      scope: 'read:user user:email',
      state,
      code_challenge: codeChallenge,
      code_challenge_method: 'S256',
    });

    const url = new URL(this.authorizeUrl);
    url.search = params.toString();

    return url.toString();
  }

  async exchangeCodeForToken(
    code: string,
    codeVerifier: string,
  ): Promise<GithubTokenResponse> {
    const response = await fetch(this.tokenUrl, {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
        Accept: 'application/json',
      },
      body: JSON.stringify({
        client_id: this.envService.githubClientId,
        client_secret: this.envService.githubClientSecret,
        code,
        redirect_uri: this.envService.githubCallbackUrl,
        code_verifier: codeVerifier,
      }),
    });

    const data = await response.json();

    if (data.error) {
      this.logger.error(
        `GitHub token exchange failed: ${data.error_description || data.error}`,
      );
      throw new UnauthorizedException(data.error_description || data.error);
    }

    return data as GithubTokenResponse;
  }

  async fetchGithubUser(accessToken: string): Promise<GithubUser> {
    const response = await fetch(this.userUrl, {
      headers: {
        Authorization: `Bearer ${accessToken}`,
        Accept: 'application/json',
      },
    });

    if (!response.ok) {
      throw new Error('Failed to fetch GitHub user');
    }

    return response.json() as Promise<GithubUser>;
  }

  async fetchPrimaryEmail(accessToken: string): Promise<string | null> {
    try {
      const response = await fetch(this.emailsUrl, {
        headers: {
          Authorization: `Bearer ${accessToken}`,
          Accept: 'application/json',
        },
      });

      if (!response.ok) {
        return null;
      }

      const emails = (await response.json()) as GithubEmail[];
      const primaryEmail = emails.find((e) => e.primary && e.verified);

      return primaryEmail?.email || null;
    } catch {
      this.logger.warn('Failed to fetch GitHub emails');
      return null;
    }
  }
}
