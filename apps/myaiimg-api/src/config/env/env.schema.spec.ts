import { validateEnv, envSchema } from './env.schema';

describe('EnvSchema', () => {
  describe('validateEnv', () => {
    const validEnv = {
      NODE_ENV: 'development',
      PORT: '3000',
      OPENAI_API_KEY: 'sk-test-key',
      GEMINI_API_KEY: 'gemini-test-key',
      DB_HOST: 'localhost',
      DB_PORT: '5432',
      DB_USERNAME: 'testuser',
      DB_PASSWORD: 'testpass',
      DB_NAME: 'testdb',
      AUTH0_DOMAIN: 'test.auth0.com',
      AUTH0_AUDIENCE: 'test-audience',
      AWS_S3_REGION: 'us-east-1',
      AWS_S3_BUCKET: 'test-bucket',
      AWS_ACCESS_KEY_ID: 'test-access-key',
      AWS_SECRET_ACCESS_KEY: 'test-secret-key',
      CDN_DOMAIN: 'https://cdn.example.com',
    };

    it('should validate and return parsed environment variables when all required fields are provided', () => {
      const result = validateEnv(validEnv);

      expect(result).toEqual({
        NODE_ENV: 'development',
        PORT: 3000,
        OPENAI_API_KEY: 'sk-test-key',
        GEMINI_API_KEY: 'gemini-test-key',
        DB_HOST: 'localhost',
        DB_PORT: 5432,
        DB_USERNAME: 'testuser',
        DB_PASSWORD: 'testpass',
        DB_NAME: 'testdb',
        AUTH0_DOMAIN: 'test.auth0.com',
        AUTH0_AUDIENCE: 'test-audience',
        AWS_S3_REGION: 'us-east-1',
        AWS_S3_BUCKET: 'test-bucket',
        AWS_ACCESS_KEY_ID: 'test-access-key',
        AWS_SECRET_ACCESS_KEY: 'test-secret-key',
        CDN_DOMAIN: 'https://cdn.example.com',
      });
    });

    it('should transform string PORT to number', () => {
      const result = validateEnv(validEnv);

      expect(result.PORT).toBe(3000);
      expect(typeof result.PORT).toBe('number');
    });

    it('should transform string DB_PORT to number', () => {
      const result = validateEnv(validEnv);

      expect(result.DB_PORT).toBe(5432);
      expect(typeof result.DB_PORT).toBe('number');
    });

    it('should default NODE_ENV to development when not provided', () => {
      const { NODE_ENV, ...envWithoutNodeEnv } = validEnv;

      const result = validateEnv(envWithoutNodeEnv);

      expect(result.NODE_ENV).toBe('development');
    });

    it('should accept production as NODE_ENV', () => {
      const envWithProduction = { ...validEnv, NODE_ENV: 'production' };

      const result = validateEnv(envWithProduction);

      expect(result.NODE_ENV).toBe('production');
    });

    it('should accept test as NODE_ENV', () => {
      const envWithTest = { ...validEnv, NODE_ENV: 'test' };

      const result = validateEnv(envWithTest);

      expect(result.NODE_ENV).toBe('test');
    });

    it('should throw error when OPENAI_API_KEY is missing', () => {
      const { OPENAI_API_KEY, ...envWithoutOpenAI } = validEnv;

      expect(() => validateEnv(envWithoutOpenAI)).toThrow(
        'Invalid environment variables:',
      );
    });

    it('should throw error when GEMINI_API_KEY is missing', () => {
      const { GEMINI_API_KEY, ...envWithoutGemini } = validEnv;

      expect(() => validateEnv(envWithoutGemini)).toThrow(
        'Invalid environment variables:',
      );
    });

    it('should throw error when PORT is missing', () => {
      const { PORT, ...envWithoutPort } = validEnv;

      expect(() => validateEnv(envWithoutPort)).toThrow(
        'Invalid environment variables:',
      );
    });

    it('should throw error when DB_HOST is missing', () => {
      const { DB_HOST, ...envWithoutDbHost } = validEnv;

      expect(() => validateEnv(envWithoutDbHost)).toThrow(
        'Invalid environment variables:',
      );
    });

    it('should throw error when CDN_DOMAIN is not a valid URL', () => {
      const envWithInvalidCdn = { ...validEnv, CDN_DOMAIN: 'not-a-url' };

      expect(() => validateEnv(envWithInvalidCdn)).toThrow(
        'Invalid environment variables:',
      );
    });

    it('should throw error when NODE_ENV is not an allowed value', () => {
      const envWithInvalidNodeEnv = { ...validEnv, NODE_ENV: 'staging' };

      expect(() => validateEnv(envWithInvalidNodeEnv)).toThrow(
        'Invalid environment variables:',
      );
    });

    it('should transform PORT to NaN when PORT is not a valid number string', () => {
      const envWithInvalidPort = { ...validEnv, PORT: 'not-a-number' };

      const result = validateEnv(envWithInvalidPort);

      expect(result.PORT).toBeNaN();
    });

    it('should log error message when validation fails', () => {
      const consoleErrorSpy = jest.spyOn(console, 'error').mockImplementation();
      const { OPENAI_API_KEY, ...envWithoutOpenAI } = validEnv;

      try {
        validateEnv(envWithoutOpenAI);
      } catch (error) {
        expect(consoleErrorSpy).toHaveBeenCalledWith(
          'Invalid environment variables: ',
          expect.any(String),
        );
      }

      consoleErrorSpy.mockRestore();
    });
  });
});
