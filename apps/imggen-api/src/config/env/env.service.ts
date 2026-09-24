import { Injectable } from '@nestjs/common';
import { ConfigService } from '@nestjs/config';
import { EnvSchema } from './env.schema';

@Injectable()
export class EnvService {
  constructor(private readonly configService: ConfigService<EnvSchema>) {}

  get nodeEnv(): string {
    return this.configService.get<string>('NODE_ENV', { infer: true })!;
  }

  get port(): string {
    return this.configService.get<string>('PORT', { infer: true })!;
  }

  get openAIApiKey(): string {
    return this.configService.get<string>('OPENAI_API_KEY', { infer: true })!;
  }

  get geminiApiKey(): string {
    return this.configService.get<string>('GEMINI_API_KEY', { infer: true })!;
  }

  get dbHost(): string {
    return this.configService.get<string>('DB_HOST', { infer: true })!;
  }

  get dbPort(): number {
    return this.configService.get<number>('DB_PORT', { infer: true })!;
  }

  get dbUsername(): string {
    return this.configService.get<string>('DB_USERNAME', { infer: true })!;
  }

  get dbPassword(): string {
    return this.configService.get<string>('DB_PASSWORD', { infer: true })!;
  }

  get dbName(): string {
    return this.configService.get<string>('DB_NAME', { infer: true })!;
  }

  get auth0Domain(): string {
    return this.configService.get<string>('AUTH0_DOMAIN', { infer: true })!;
  }

  get auth0Audience(): string {
    return this.configService.get<string>('AUTH0_AUDIENCE', { infer: true })!;
  }

  get awsS3Region(): string {
    return this.configService.get<string>('AWS_S3_REGION', { infer: true })!;
  }

  get awsS3Bucket(): string {
    return this.configService.get<string>('AWS_S3_BUCKET', { infer: true })!;
  }

  get awsAccessKeyId(): string {
    return this.configService.get<string>('AWS_ACCESS_KEY_ID', {
      infer: true,
    })!;
  }

  get awsSecretAccessKey(): string {
    return this.configService.get<string>('AWS_SECRET_ACCESS_KEY', {
      infer: true,
    })!;
  }

  get cdn(): string {
    return this.configService.get<string>('CDN_DOMAIN', { infer: true })!;
  }
}
