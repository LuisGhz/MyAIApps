import { z } from 'zod';

const envSchema = z.object({
  NODE_ENV: z
    .enum(['development', 'production', 'test'])
    .default('development'),
  FRONTEND_URL: z.url().default('http://localhost:4200'),
  PORT: z.coerce.number().default(3000),
  OPENAI_API_KEY: z.string().min(1, 'OPENAI_API_KEY is required'),
  DB_HOST: z.string().default('localhost'),
  DB_PORT: z.coerce.number().default(5432),
  DB_USERNAME: z.string().min(1, 'DB_USERNAME is required'),
  DB_PASSWORD: z.string().min(1, 'DB_PASSWORD is required'),
  DB_NAME: z.string().min(1, 'DB_NAME is required'),
  // Auth0 Configuration
  AUTH0_DOMAIN: z.string().min(1, 'AUTH0_DOMAIN is required'),
  AUTH0_AUDIENCE: z.string().min(1, 'AUTH0_AUDIENCE is required'),
});

export type EnvConfig = z.infer<typeof envSchema>;

export function validateEnv(config: Record<string, any>): EnvConfig {
  const result = envSchema.safeParse(config);

  if (!result.success) {
    const errors = result.error.issues
      .map((issue) => `${issue.path.join('.')}: ${issue.message}`)
      .join(', ');
    throw new Error(`Environment validation failed: ${errors}`);
  }

  return result.data;
}
