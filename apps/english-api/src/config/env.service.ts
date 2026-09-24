import { Injectable } from '@nestjs/common';
import { ConfigService } from '@nestjs/config';
import type { EnvConfig } from './env.schema';

@Injectable()
export class EnvService {
  constructor(private configService: ConfigService<EnvConfig, true>) {}

  get nodeEnv(): string {
    return this.configService.get('NODE_ENV', { infer: true });
  }

  get frontendUrl(): string {
    return this.configService.get('FRONTEND_URL', { infer: true });
  }

  get port(): number {
    return this.configService.get('PORT', { infer: true });
  }

  get openaiApiKey(): string {
    return this.configService.get('OPENAI_API_KEY', { infer: true });
  }

  get dbHost(): string {
    return this.configService.get('DB_HOST', { infer: true });
  }

  get dbPort(): number {
    return this.configService.get('DB_PORT', { infer: true });
  }

  get dbUsername(): string {
    return this.configService.get('DB_USERNAME', { infer: true });
  }

  get dbPassword(): string {
    return this.configService.get('DB_PASSWORD', { infer: true });
  }

  get dbName(): string {
    return this.configService.get('DB_NAME', { infer: true });
  }

  get auth0Domain(): string {
    return this.configService.get('AUTH0_DOMAIN', { infer: true });
  }

  get auth0Audience(): string {
    return this.configService.get('AUTH0_AUDIENCE', { infer: true });
  }
}
