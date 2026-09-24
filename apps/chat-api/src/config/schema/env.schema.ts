import { z } from 'zod';

export const envSchema = z.object({
  NODE_ENV: z.enum(['development', 'production', 'test']),
  PORT: z.string().transform(Number),

  DB_HOST: z.string(),
  DB_PORT: z.string().transform(Number),
  DB_USERNAME: z.string(),
  DB_PASSWORD: z.string(),
  DB_NAME: z.string(),

  JWT_SECRET: z.string(),
  JWT_EXPIRES_IN: z.string(),
  REFRESH_TOKEN_LENGTH: z.string().transform(Number),
  REFRESH_TOKEN_EXPIRES_IN: z.string(),

  OPENAI_API_KEY: z.string(),
  GEMINI_API_KEY: z.string(),
  GITHUB_CLIENT_ID: z.string(),
  GITHUB_CLIENT_SECRET: z.string(),
  GITHUB_CALLBACK_URL: z.string(),
  FRONTEND_URL: z.string(),
  MAX_SESSIONS_PER_USER: z.string().transform(Number),

  CDN_DOMAIN: z.string(),
  S3_ACCESS_KEY: z.string(),
  S3_SECRET_KEY: z.string(),
  S3_BUCKET_NAME: z.string(),

  THROTTLE_TTL: z.string().transform(Number),
  THROTTLE_LIMIT: z.string().transform(Number),

  REDIS_HOST: z.string(),
  CACHE_SHORT_TTL: z.string().transform(Number),
  CACHE_TTL: z.string().transform(Number),
  CACHE_LONG_TTL: z.string().transform(Number),
});

export type Env = z.infer<typeof envSchema>;

export const validateEnv = (env: Record<string, unknown>): Env => {
  const parsed = envSchema.safeParse(env);

  if (!parsed.success) {
    console.error('❌ Invalid environment variables:', parsed.error.message);
    process.exit(1);
  }

  return parsed.data;
};
