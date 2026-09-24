import { Test, TestingModule } from '@nestjs/testing';
import { ConfigService } from '@nestjs/config';
import { EnvService } from './env.service';
import { EnvSchema } from './env.schema';

describe('EnvService', () => {
  let service: EnvService;
  let configServiceMock: jest.Mocked<ConfigService<EnvSchema>>;

  beforeEach(async () => {
    configServiceMock = {
      get: jest.fn(),
    } as any;

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

  it('should be defined', () => {
    expect(service).toBeDefined();
  });

  describe('nodeEnv', () => {
    it('should return NODE_ENV value', () => {
      const mockValue = 'production';
      configServiceMock.get.mockReturnValue(mockValue);

      const result = service.nodeEnv;

      expect(configServiceMock.get).toHaveBeenCalledWith('NODE_ENV', {
        infer: true,
      });
      expect(result).toBe(mockValue);
    });
  });

  describe('port', () => {
    it('should return PORT value', () => {
      const mockValue = '3000';
      configServiceMock.get.mockReturnValue(mockValue);

      const result = service.port;

      expect(configServiceMock.get).toHaveBeenCalledWith('PORT', {
        infer: true,
      });
      expect(result).toBe(mockValue);
    });
  });

  describe('openAIApiKey', () => {
    it('should return OPENAI_API_KEY value', () => {
      const mockValue = 'sk-test-key';
      configServiceMock.get.mockReturnValue(mockValue);

      const result = service.openAIApiKey;

      expect(configServiceMock.get).toHaveBeenCalledWith('OPENAI_API_KEY', {
        infer: true,
      });
      expect(result).toBe(mockValue);
    });
  });

  describe('geminiApiKey', () => {
    it('should return GEMINI_API_KEY value', () => {
      const mockValue = 'gemini-test-key';
      configServiceMock.get.mockReturnValue(mockValue);

      const result = service.geminiApiKey;

      expect(configServiceMock.get).toHaveBeenCalledWith('GEMINI_API_KEY', {
        infer: true,
      });
      expect(result).toBe(mockValue);
    });
  });

  describe('dbHost', () => {
    it('should return DB_HOST value', () => {
      const mockValue = 'localhost';
      configServiceMock.get.mockReturnValue(mockValue);

      const result = service.dbHost;

      expect(configServiceMock.get).toHaveBeenCalledWith('DB_HOST', {
        infer: true,
      });
      expect(result).toBe(mockValue);
    });
  });

  describe('dbPort', () => {
    it('should return DB_PORT value', () => {
      const mockValue = 5432;
      configServiceMock.get.mockReturnValue(mockValue);

      const result = service.dbPort;

      expect(configServiceMock.get).toHaveBeenCalledWith('DB_PORT', {
        infer: true,
      });
      expect(result).toBe(mockValue);
    });
  });

  describe('dbUsername', () => {
    it('should return DB_USERNAME value', () => {
      const mockValue = 'testuser';
      configServiceMock.get.mockReturnValue(mockValue);

      const result = service.dbUsername;

      expect(configServiceMock.get).toHaveBeenCalledWith('DB_USERNAME', {
        infer: true,
      });
      expect(result).toBe(mockValue);
    });
  });

  describe('dbPassword', () => {
    it('should return DB_PASSWORD value', () => {
      const mockValue = 'testpassword';
      configServiceMock.get.mockReturnValue(mockValue);

      const result = service.dbPassword;

      expect(configServiceMock.get).toHaveBeenCalledWith('DB_PASSWORD', {
        infer: true,
      });
      expect(result).toBe(mockValue);
    });
  });

  describe('dbName', () => {
    it('should return DB_NAME value', () => {
      const mockValue = 'testdb';
      configServiceMock.get.mockReturnValue(mockValue);

      const result = service.dbName;

      expect(configServiceMock.get).toHaveBeenCalledWith('DB_NAME', {
        infer: true,
      });
      expect(result).toBe(mockValue);
    });
  });

  describe('auth0Domain', () => {
    it('should return AUTH0_DOMAIN value', () => {
      const mockValue = 'test.auth0.com';
      configServiceMock.get.mockReturnValue(mockValue);

      const result = service.auth0Domain;

      expect(configServiceMock.get).toHaveBeenCalledWith('AUTH0_DOMAIN', {
        infer: true,
      });
      expect(result).toBe(mockValue);
    });
  });

  describe('auth0Audience', () => {
    it('should return AUTH0_AUDIENCE value', () => {
      const mockValue = 'https://api.test.com';
      configServiceMock.get.mockReturnValue(mockValue);

      const result = service.auth0Audience;

      expect(configServiceMock.get).toHaveBeenCalledWith('AUTH0_AUDIENCE', {
        infer: true,
      });
      expect(result).toBe(mockValue);
    });
  });

  describe('awsS3Region', () => {
    it('should return AWS_S3_REGION value', () => {
      const mockValue = 'us-east-1';
      configServiceMock.get.mockReturnValue(mockValue);

      const result = service.awsS3Region;

      expect(configServiceMock.get).toHaveBeenCalledWith('AWS_S3_REGION', {
        infer: true,
      });
      expect(result).toBe(mockValue);
    });
  });

  describe('awsS3Bucket', () => {
    it('should return AWS_S3_BUCKET value', () => {
      const mockValue = 'test-bucket';
      configServiceMock.get.mockReturnValue(mockValue);

      const result = service.awsS3Bucket;

      expect(configServiceMock.get).toHaveBeenCalledWith('AWS_S3_BUCKET', {
        infer: true,
      });
      expect(result).toBe(mockValue);
    });
  });

  describe('awsAccessKeyId', () => {
    it('should return AWS_ACCESS_KEY_ID value', () => {
      const mockValue = 'AKIAIOSFODNN7EXAMPLE';
      configServiceMock.get.mockReturnValue(mockValue);

      const result = service.awsAccessKeyId;

      expect(configServiceMock.get).toHaveBeenCalledWith('AWS_ACCESS_KEY_ID', {
        infer: true,
      });
      expect(result).toBe(mockValue);
    });
  });

  describe('awsSecretAccessKey', () => {
    it('should return AWS_SECRET_ACCESS_KEY value', () => {
      const mockValue = 'wJalrXUtnFEMI/K7MDENG/bPxRfiCYEXAMPLEKEY';
      configServiceMock.get.mockReturnValue(mockValue);

      const result = service.awsSecretAccessKey;

      expect(configServiceMock.get).toHaveBeenCalledWith(
        'AWS_SECRET_ACCESS_KEY',
        {
          infer: true,
        },
      );
      expect(result).toBe(mockValue);
    });
  });

  describe('cdn', () => {
    it('should return CDN_DOMAIN value', () => {
      const mockValue = 'https://cdn.test.com';
      configServiceMock.get.mockReturnValue(mockValue);

      const result = service.cdn;

      expect(configServiceMock.get).toHaveBeenCalledWith('CDN_DOMAIN', {
        infer: true,
      });
      expect(result).toBe(mockValue);
    });
  });
});
