import { Test, TestingModule } from '@nestjs/testing';
import { ConfigService } from '@nestjs/config';
import { EnvService } from './env.service';
import { Env } from './env.schema';

describe('EnvService', () => {
  let service: EnvService;
  let configServiceMock: jest.Mocked<ConfigService<Env>>;

  beforeEach(async () => {
    configServiceMock = {
      get: jest.fn(),
    } as unknown as jest.Mocked<ConfigService<Env>>;

    const module: TestingModule = await Test.createTestingModule({
      providers: [
        EnvService,
        {
          provide: ConfigService,
          useValue: configServiceMock,
        },
      ],
    }).compile();

    service = module.get<EnvService>(EnvService);
  });

  describe('nodeEnv', () => {
    it('should return NODE_ENV value', () => {
      configServiceMock.get.mockReturnValue('development');

      const result = service.nodeEnv;

      expect(result).toBe('development');
      expect(configServiceMock.get).toHaveBeenCalledWith('NODE_ENV', {
        infer: true,
      });
    });
  });

  describe('port', () => {
    it('should return PORT value as number', () => {
      configServiceMock.get.mockReturnValue(3000);

      const result = service.port;

      expect(result).toBe(3000);
      expect(configServiceMock.get).toHaveBeenCalledWith('PORT', {
        infer: true,
      });
    });
  });

  describe('dbHost', () => {
    it('should return DB_HOST value', () => {
      configServiceMock.get.mockReturnValue('localhost');

      const result = service.dbHost;

      expect(result).toBe('localhost');
      expect(configServiceMock.get).toHaveBeenCalledWith('DB_HOST', {
        infer: true,
      });
    });
  });

  describe('dbPort', () => {
    it('should return DB_PORT value as number', () => {
      configServiceMock.get.mockReturnValue(5432);

      const result = service.dbPort;

      expect(result).toBe(5432);
      expect(configServiceMock.get).toHaveBeenCalledWith('DB_PORT', {
        infer: true,
      });
    });
  });

  describe('dbUsername', () => {
    it('should return DB_USERNAME value', () => {
      configServiceMock.get.mockReturnValue('testuser');

      const result = service.dbUsername;

      expect(result).toBe('testuser');
      expect(configServiceMock.get).toHaveBeenCalledWith('DB_USERNAME', {
        infer: true,
      });
    });
  });

  describe('dbPassword', () => {
    it('should return DB_PASSWORD value', () => {
      configServiceMock.get.mockReturnValue('testpassword');

      const result = service.dbPassword;

      expect(result).toBe('testpassword');
      expect(configServiceMock.get).toHaveBeenCalledWith('DB_PASSWORD', {
        infer: true,
      });
    });
  });

  describe('dbName', () => {
    it('should return DB_NAME value', () => {
      configServiceMock.get.mockReturnValue('testdb');

      const result = service.dbName;

      expect(result).toBe('testdb');
      expect(configServiceMock.get).toHaveBeenCalledWith('DB_NAME', {
        infer: true,
      });
    });
  });

  describe('jwtSecret', () => {
    it('should return JWT_SECRET value', () => {
      configServiceMock.get.mockReturnValue('secret-key');

      const result = service.jwtSecret;

      expect(result).toBe('secret-key');
      expect(configServiceMock.get).toHaveBeenCalledWith('JWT_SECRET', {
        infer: true,
      });
    });
  });

  describe('jwtExpiresIn', () => {
    it('should return JWT_EXPIRES_IN value', () => {
      configServiceMock.get.mockReturnValue('1h');

      const result = service.jwtExpiresIn;

      expect(result).toBe('1h');
      expect(configServiceMock.get).toHaveBeenCalledWith('JWT_EXPIRES_IN', {
        infer: true,
      });
    });
  });

  describe('refreshTokenLength', () => {
    it('should return REFRESH_TOKEN_LENGTH value as number', () => {
      configServiceMock.get.mockReturnValue(32);

      const result = service.refreshTokenLength;

      expect(result).toBe(32);
      expect(configServiceMock.get).toHaveBeenCalledWith(
        'REFRESH_TOKEN_LENGTH',
        { infer: true },
      );
    });
  });

  describe('refreshTokenExpiresIn', () => {
    it('should return REFRESH_TOKEN_EXPIRES_IN value', () => {
      configServiceMock.get.mockReturnValue('7d');

      const result = service.refreshTokenExpiresIn;

      expect(result).toBe('7d');
      expect(configServiceMock.get).toHaveBeenCalledWith(
        'REFRESH_TOKEN_EXPIRES_IN',
        { infer: true },
      );
    });
  });

  describe('openaiApiKey', () => {
    it('should return OPENAI_API_KEY value', () => {
      configServiceMock.get.mockReturnValue('openai-key');

      const result = service.openaiApiKey;

      expect(result).toBe('openai-key');
      expect(configServiceMock.get).toHaveBeenCalledWith('OPENAI_API_KEY', {
        infer: true,
      });
    });
  });

  describe('geminiApiKey', () => {
    it('should return GEMINI_API_KEY value', () => {
      configServiceMock.get.mockReturnValue('gemini-key');

      const result = service.geminiApiKey;

      expect(result).toBe('gemini-key');
      expect(configServiceMock.get).toHaveBeenCalledWith('GEMINI_API_KEY', {
        infer: true,
      });
    });
  });

  describe('githubClientId', () => {
    it('should return GITHUB_CLIENT_ID value', () => {
      configServiceMock.get.mockReturnValue('github-client-id');

      const result = service.githubClientId;

      expect(result).toBe('github-client-id');
      expect(configServiceMock.get).toHaveBeenCalledWith('GITHUB_CLIENT_ID', {
        infer: true,
      });
    });
  });

  describe('githubClientSecret', () => {
    it('should return GITHUB_CLIENT_SECRET value', () => {
      configServiceMock.get.mockReturnValue('github-secret');

      const result = service.githubClientSecret;

      expect(result).toBe('github-secret');
      expect(configServiceMock.get).toHaveBeenCalledWith(
        'GITHUB_CLIENT_SECRET',
        { infer: true },
      );
    });
  });

  describe('githubCallbackUrl', () => {
    it('should return GITHUB_CALLBACK_URL value', () => {
      configServiceMock.get.mockReturnValue(
        'http://localhost:3000/auth/callback',
      );

      const result = service.githubCallbackUrl;

      expect(result).toBe('http://localhost:3000/auth/callback');
      expect(configServiceMock.get).toHaveBeenCalledWith(
        'GITHUB_CALLBACK_URL',
        { infer: true },
      );
    });
  });

  describe('frontendUrl', () => {
    it('should return FRONTEND_URL value', () => {
      configServiceMock.get.mockReturnValue('http://localhost:4200');

      const result = service.frontendUrl;

      expect(result).toBe('http://localhost:4200');
      expect(configServiceMock.get).toHaveBeenCalledWith('FRONTEND_URL', {
        infer: true,
      });
    });
  });

  describe('maxSessionsPerUser', () => {
    it('should return MAX_SESSIONS_PER_USER value as number', () => {
      configServiceMock.get.mockReturnValue(5);

      const result = service.maxSessionsPerUser;

      expect(result).toBe(5);
      expect(configServiceMock.get).toHaveBeenCalledWith(
        'MAX_SESSIONS_PER_USER',
        { infer: true },
      );
    });
  });

  describe('isProduction', () => {

    test.each([
      "production",
      "development",
      "test"
    ])('should return true when NODE_ENV is %s', (env) => {
      configServiceMock.get.mockReturnValue(env);

      const result = service.isProduction;

      expect(result).toBe(env === 'production');
    });
  });

  describe('cdnDomain', () => {
    it('should return CDN_DOMAIN value', () => {
      configServiceMock.get.mockReturnValue('cdn.example.com');

      const result = service.cdnDomain;

      expect(result).toBe('cdn.example.com');
      expect(configServiceMock.get).toHaveBeenCalledWith('CDN_DOMAIN', {
        infer: true,
      });
    });
  });

  describe('s3AccessKey', () => {
    it('should return S3_ACCESS_KEY value', () => {
      configServiceMock.get.mockReturnValue('s3-access-key');

      const result = service.s3AccessKey;

      expect(result).toBe('s3-access-key');
      expect(configServiceMock.get).toHaveBeenCalledWith('S3_ACCESS_KEY', {
        infer: true,
      });
    });
  });

  describe('s3SecretKey', () => {
    it('should return S3_SECRET_KEY value', () => {
      configServiceMock.get.mockReturnValue('s3-secret-key');

      const result = service.s3SecretKey;

      expect(result).toBe('s3-secret-key');
      expect(configServiceMock.get).toHaveBeenCalledWith('S3_SECRET_KEY', {
        infer: true,
      });
    });
  });

  describe('s3BucketName', () => {
    it('should return S3_BUCKET_NAME value', () => {
      configServiceMock.get.mockReturnValue('test-bucket');

      const result = service.s3BucketName;

      expect(result).toBe('test-bucket');
      expect(configServiceMock.get).toHaveBeenCalledWith('S3_BUCKET_NAME', {
        infer: true,
      });
    });
  });

  describe('throttle', () => {
    it('should return throttle configuration object', () => {
      configServiceMock.get.mockReturnValueOnce(60).mockReturnValueOnce(10);

      const result = service.throttle;

      expect(result).toEqual({ ttl: 60, limit: 10 });
      expect(configServiceMock.get).toHaveBeenCalledWith('THROTTLE_TTL', {
        infer: true,
      });
      expect(configServiceMock.get).toHaveBeenCalledWith('THROTTLE_LIMIT', {
        infer: true,
      });
    });
  });

  describe('redisHost', () => {
    it('should return REDIS_HOST value', () => {
      configServiceMock.get.mockReturnValue('localhost');

      const result = service.redisHost;

      expect(result).toBe('localhost');
      expect(configServiceMock.get).toHaveBeenCalledWith('REDIS_HOST', {
        infer: true,
      });
    });
  });

  describe('cacheShortTTL', () => {
    it('should return CACHE_SHORT_TTL value as number', () => {
      configServiceMock.get.mockReturnValue(300);

      const result = service.cacheShortTTL;

      expect(result).toBe(300);
      expect(configServiceMock.get).toHaveBeenCalledWith('CACHE_SHORT_TTL', {
        infer: true,
      });
    });
  });

  describe('cacheTTL', () => {
    it('should return CACHE_TTL value as number', () => {
      configServiceMock.get.mockReturnValue(600);

      const result = service.cacheTTL;

      expect(result).toBe(600);
      expect(configServiceMock.get).toHaveBeenCalledWith('CACHE_TTL', {
        infer: true,
      });
    });
  });

  describe('cacheLongTTL', () => {
    it('should return CACHE_LONG_TTL value as number', () => {
      configServiceMock.get.mockReturnValue(3600);

      const result = service.cacheLongTTL;

      expect(result).toBe(3600);
      expect(configServiceMock.get).toHaveBeenCalledWith('CACHE_LONG_TTL', {
        infer: true,
      });
    });
  });
});
