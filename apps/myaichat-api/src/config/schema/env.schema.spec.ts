import { validateEnv, envSchema } from './env.schema';

describe('EnvSchema', () => {
  describe('envSchema', () => {
    it('should parse valid environment variables', () => {
      const validEnv = {
        NODE_ENV: 'development',
        PORT: '3000',
        DB_HOST: 'localhost',
        DB_PORT: '5432',
        DB_USERNAME: 'user',
        DB_PASSWORD: 'password',
        DB_NAME: 'testdb',
        JWT_SECRET: 'secret',
        JWT_EXPIRES_IN: '1h',
        REFRESH_TOKEN_LENGTH: '32',
        REFRESH_TOKEN_EXPIRES_IN: '7d',
        OPENAI_API_KEY: 'openai-key',
        GEMINI_API_KEY: 'gemini-key',
        GITHUB_CLIENT_ID: 'github-client-id',
        GITHUB_CLIENT_SECRET: 'github-secret',
        GITHUB_CALLBACK_URL: 'http://localhost:3000/auth/callback',
        FRONTEND_URL: 'http://localhost:4200',
        MAX_SESSIONS_PER_USER: '5',
        CDN_DOMAIN: 'cdn.example.com',
        S3_ACCESS_KEY: 's3-access-key',
        S3_SECRET_KEY: 's3-secret-key',
        S3_BUCKET_NAME: 'test-bucket',
        THROTTLE_TTL: '60',
        THROTTLE_LIMIT: '10',
        REDIS_HOST: 'localhost',
        CACHE_SHORT_TTL: '300',
        CACHE_TTL: '600',
        CACHE_LONG_TTL: '3600',
      };

      const result = envSchema.parse(validEnv);

      expect(result.NODE_ENV).toBe('development');
      expect(result.PORT).toBe(3000);
      expect(result.DB_HOST).toBe('localhost');
      expect(result.DB_PORT).toBe(5432);
      expect(result.DB_USERNAME).toBe('user');
      expect(result.DB_PASSWORD).toBe('password');
      expect(result.DB_NAME).toBe('testdb');
      expect(result.JWT_SECRET).toBe('secret');
      expect(result.JWT_EXPIRES_IN).toBe('1h');
      expect(result.REFRESH_TOKEN_LENGTH).toBe(32);
      expect(result.REFRESH_TOKEN_EXPIRES_IN).toBe('7d');
      expect(result.OPENAI_API_KEY).toBe('openai-key');
      expect(result.GEMINI_API_KEY).toBe('gemini-key');
      expect(result.GITHUB_CLIENT_ID).toBe('github-client-id');
      expect(result.GITHUB_CLIENT_SECRET).toBe('github-secret');
      expect(result.GITHUB_CALLBACK_URL).toBe(
        'http://localhost:3000/auth/callback',
      );
      expect(result.FRONTEND_URL).toBe('http://localhost:4200');
      expect(result.MAX_SESSIONS_PER_USER).toBe(5);
      expect(result.CDN_DOMAIN).toBe('cdn.example.com');
      expect(result.S3_ACCESS_KEY).toBe('s3-access-key');
      expect(result.S3_SECRET_KEY).toBe('s3-secret-key');
      expect(result.S3_BUCKET_NAME).toBe('test-bucket');
      expect(result.THROTTLE_TTL).toBe(60);
      expect(result.THROTTLE_LIMIT).toBe(10);
      expect(result.REDIS_HOST).toBe('localhost');
      expect(result.CACHE_SHORT_TTL).toBe(300);
      expect(result.CACHE_TTL).toBe(600);
      expect(result.CACHE_LONG_TTL).toBe(3600);
    });

    it('should transform string values to numbers', () => {
      const env = {
        NODE_ENV: 'test',
        PORT: '8080',
        DB_HOST: 'localhost',
        DB_PORT: '3306',
        DB_USERNAME: 'user',
        DB_PASSWORD: 'password',
        DB_NAME: 'testdb',
        JWT_SECRET: 'secret',
        JWT_EXPIRES_IN: '1h',
        REFRESH_TOKEN_LENGTH: '64',
        REFRESH_TOKEN_EXPIRES_IN: '7d',
        OPENAI_API_KEY: 'openai-key',
        GEMINI_API_KEY: 'gemini-key',
        GITHUB_CLIENT_ID: 'github-client-id',
        GITHUB_CLIENT_SECRET: 'github-secret',
        GITHUB_CALLBACK_URL: 'http://localhost:3000/auth/callback',
        FRONTEND_URL: 'http://localhost:4200',
        MAX_SESSIONS_PER_USER: '10',
        CDN_DOMAIN: 'cdn.example.com',
        S3_ACCESS_KEY: 's3-access-key',
        S3_SECRET_KEY: 's3-secret-key',
        S3_BUCKET_NAME: 'test-bucket',
        THROTTLE_TTL: '120',
        THROTTLE_LIMIT: '20',
        REDIS_HOST: 'localhost',
        CACHE_SHORT_TTL: '100',
        CACHE_TTL: '500',
        CACHE_LONG_TTL: '2000',
      };

      const result = envSchema.parse(env);

      expect(typeof result.PORT).toBe('number');
      expect(result.PORT).toBe(8080);
      expect(typeof result.DB_PORT).toBe('number');
      expect(result.DB_PORT).toBe(3306);
      expect(typeof result.REFRESH_TOKEN_LENGTH).toBe('number');
      expect(result.REFRESH_TOKEN_LENGTH).toBe(64);
      expect(typeof result.MAX_SESSIONS_PER_USER).toBe('number');
      expect(result.MAX_SESSIONS_PER_USER).toBe(10);
      expect(typeof result.THROTTLE_TTL).toBe('number');
      expect(result.THROTTLE_TTL).toBe(120);
      expect(typeof result.THROTTLE_LIMIT).toBe('number');
      expect(result.THROTTLE_LIMIT).toBe(20);
    });

    it('should accept production NODE_ENV', () => {
      const env = {
        NODE_ENV: 'production',
        PORT: '3000',
        DB_HOST: 'localhost',
        DB_PORT: '5432',
        DB_USERNAME: 'user',
        DB_PASSWORD: 'password',
        DB_NAME: 'testdb',
        JWT_SECRET: 'secret',
        JWT_EXPIRES_IN: '1h',
        REFRESH_TOKEN_LENGTH: '32',
        REFRESH_TOKEN_EXPIRES_IN: '7d',
        OPENAI_API_KEY: 'openai-key',
        GEMINI_API_KEY: 'gemini-key',
        GITHUB_CLIENT_ID: 'github-client-id',
        GITHUB_CLIENT_SECRET: 'github-secret',
        GITHUB_CALLBACK_URL: 'http://localhost:3000/auth/callback',
        FRONTEND_URL: 'http://localhost:4200',
        MAX_SESSIONS_PER_USER: '5',
        CDN_DOMAIN: 'cdn.example.com',
        S3_ACCESS_KEY: 's3-access-key',
        S3_SECRET_KEY: 's3-secret-key',
        S3_BUCKET_NAME: 'test-bucket',
        THROTTLE_TTL: '60',
        THROTTLE_LIMIT: '10',
        REDIS_HOST: 'localhost',
        CACHE_SHORT_TTL: '300',
        CACHE_TTL: '600',
        CACHE_LONG_TTL: '3600',
      };

      const result = envSchema.parse(env);

      expect(result.NODE_ENV).toBe('production');
    });

    it('should reject invalid NODE_ENV', () => {
      const env = {
        NODE_ENV: 'staging',
        PORT: '3000',
        DB_HOST: 'localhost',
        DB_PORT: '5432',
        DB_USERNAME: 'user',
        DB_PASSWORD: 'password',
        DB_NAME: 'testdb',
        JWT_SECRET: 'secret',
        JWT_EXPIRES_IN: '1h',
        REFRESH_TOKEN_LENGTH: '32',
        REFRESH_TOKEN_EXPIRES_IN: '7d',
        OPENAI_API_KEY: 'openai-key',
        GEMINI_API_KEY: 'gemini-key',
        GITHUB_CLIENT_ID: 'github-client-id',
        GITHUB_CLIENT_SECRET: 'github-secret',
        GITHUB_CALLBACK_URL: 'http://localhost:3000/auth/callback',
        FRONTEND_URL: 'http://localhost:4200',
        MAX_SESSIONS_PER_USER: '5',
        CDN_DOMAIN: 'cdn.example.com',
        S3_ACCESS_KEY: 's3-access-key',
        S3_SECRET_KEY: 's3-secret-key',
        S3_BUCKET_NAME: 'test-bucket',
        THROTTLE_TTL: '60',
        THROTTLE_LIMIT: '10',
        REDIS_HOST: 'localhost',
        CACHE_SHORT_TTL: '300',
        CACHE_TTL: '600',
        CACHE_LONG_TTL: '3600',
      };

      expect(() => envSchema.parse(env)).toThrow();
    });

    it('should reject missing required fields', () => {
      const env = {
        NODE_ENV: 'development',
        PORT: '3000',
      };

      expect(() => envSchema.parse(env)).toThrow();
    });
  });

  describe('validateEnv', () => {
    const consoleErrorSpy = jest.spyOn(console, 'error').mockImplementation();
    const processExitSpy = jest.spyOn(process, 'exit').mockImplementation();

    afterEach(() => {
      consoleErrorSpy.mockClear();
      processExitSpy.mockClear();
    });

    afterAll(() => {
      consoleErrorSpy.mockRestore();
      processExitSpy.mockRestore();
    });

    it('should return parsed environment variables when valid', () => {
      const validEnv = {
        NODE_ENV: 'development',
        PORT: '3000',
        DB_HOST: 'localhost',
        DB_PORT: '5432',
        DB_USERNAME: 'user',
        DB_PASSWORD: 'password',
        DB_NAME: 'testdb',
        JWT_SECRET: 'secret',
        JWT_EXPIRES_IN: '1h',
        REFRESH_TOKEN_LENGTH: '32',
        REFRESH_TOKEN_EXPIRES_IN: '7d',
        OPENAI_API_KEY: 'openai-key',
        GEMINI_API_KEY: 'gemini-key',
        GITHUB_CLIENT_ID: 'github-client-id',
        GITHUB_CLIENT_SECRET: 'github-secret',
        GITHUB_CALLBACK_URL: 'http://localhost:3000/auth/callback',
        FRONTEND_URL: 'http://localhost:4200',
        MAX_SESSIONS_PER_USER: '5',
        CDN_DOMAIN: 'cdn.example.com',
        S3_ACCESS_KEY: 's3-access-key',
        S3_SECRET_KEY: 's3-secret-key',
        S3_BUCKET_NAME: 'test-bucket',
        THROTTLE_TTL: '60',
        THROTTLE_LIMIT: '10',
        REDIS_HOST: 'localhost',
        CACHE_SHORT_TTL: '300',
        CACHE_TTL: '600',
        CACHE_LONG_TTL: '3600',
      };

      const result = validateEnv(validEnv);

      expect(result.NODE_ENV).toBe('development');
      expect(result.PORT).toBe(3000);
      expect(result.DB_HOST).toBe('localhost');
      expect(consoleErrorSpy).not.toHaveBeenCalled();
      expect(processExitSpy).not.toHaveBeenCalled();
    });

    it('should log error and exit process when environment variables are invalid', () => {
      const invalidEnv = {
        NODE_ENV: 'invalid',
        PORT: 'not-a-number',
      };

      validateEnv(invalidEnv);

      expect(consoleErrorSpy).toHaveBeenCalledWith(
        '❌ Invalid environment variables:',
        expect.any(String),
      );
      expect(processExitSpy).toHaveBeenCalledWith(1);
    });

    it('should log error and exit process when required fields are missing', () => {
      const incompleteEnv = {
        NODE_ENV: 'development',
      };

      validateEnv(incompleteEnv);

      expect(consoleErrorSpy).toHaveBeenCalledWith(
        '❌ Invalid environment variables:',
        expect.any(String),
      );
      expect(processExitSpy).toHaveBeenCalledWith(1);
    });
  });
});
