import { Injectable } from '@nestjs/common';
import { ConfigService } from '@nestjs/config';
import { Env } from './env.schema';

@Injectable()
export class EnvService {
  constructor(private readonly configService: ConfigService<Env>) {}

  get nodeEnv(): Env['NODE_ENV'] {
    return this.configService.get('NODE_ENV', { infer: true })!;
  }

  get port(): number {
    return this.configService.get('PORT', { infer: true })!;
  }

  get dbHost(): string {
    return this.configService.get('DB_HOST', { infer: true })!;
  }

  get dbPort(): number {
    return this.configService.get('DB_PORT', { infer: true })!;
  }

  get dbUsername(): string {
    return this.configService.get('DB_USERNAME', { infer: true })!;
  }

  get dbPassword(): string {
    return this.configService.get('DB_PASSWORD', { infer: true })!;
  }

  get dbName(): string {
    return this.configService.get('DB_NAME', { infer: true })!;
  }

  get jwtSecret(): string {
    return this.configService.get('JWT_SECRET', { infer: true })!;
  }

  get jwtExpiresIn(): string {
    return this.configService.get('JWT_EXPIRES_IN', { infer: true })!;
  }

  get refreshTokenLength(): number {
    return this.configService.get('REFRESH_TOKEN_LENGTH', { infer: true })!;
  }

  get refreshTokenExpiresIn(): string {
    return this.configService.get('REFRESH_TOKEN_EXPIRES_IN', { infer: true })!;
  }

  get openaiApiKey(): string {
    return this.configService.get('OPENAI_API_KEY', { infer: true })!;
  }

  get geminiApiKey(): string {
    return this.configService.get('GEMINI_API_KEY', { infer: true })!;
  }

  get githubClientId(): string {
    return this.configService.get('GITHUB_CLIENT_ID', { infer: true })!;
  }

  get githubClientSecret(): string {
    return this.configService.get('GITHUB_CLIENT_SECRET', { infer: true })!;
  }

  get githubCallbackUrl(): string {
    return this.configService.get('GITHUB_CALLBACK_URL', { infer: true })!;
  }

  get frontendUrl(): string {
    return this.configService.get('FRONTEND_URL', { infer: true })!;
  }

  get maxSessionsPerUser(): number {
    return this.configService.get('MAX_SESSIONS_PER_USER', { infer: true })!;
  }

  get isProduction(): boolean {
    return this.nodeEnv === 'production';
  }

  get cdnDomain(): string {
    return this.configService.get('CDN_DOMAIN', { infer: true })!;
  }

  get s3AccessKey(): string {
    return this.configService.get('S3_ACCESS_KEY', { infer: true })!;
  }

  get s3SecretKey(): string {
    return this.configService.get('S3_SECRET_KEY', { infer: true })!;
  }

  get s3BucketName(): string {
    return this.configService.get('S3_BUCKET_NAME', { infer: true })!;
  }

  get throttle(): { ttl: number; limit: number } {
    return {
      ttl: this.configService.get('THROTTLE_TTL', { infer: true })!,
      limit: this.configService.get('THROTTLE_LIMIT', { infer: true })!,
    };
  }

  get redisHost(): string {
    return this.configService.get('REDIS_HOST', { infer: true })!;
  }

  get cacheShortTTL(): number {
    return this.configService.get('CACHE_SHORT_TTL', { infer: true })!;
  }

  get cacheTTL(): number {
    return this.configService.get('CACHE_TTL', { infer: true })!;
  }

  get cacheLongTTL(): number {
    return this.configService.get('CACHE_LONG_TTL', { infer: true })!;
  }
}
