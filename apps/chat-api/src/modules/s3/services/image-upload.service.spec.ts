import { Test, TestingModule } from '@nestjs/testing';
import { ImageUploadService } from './image-upload.service';
import { EnvService } from '@cfg/schema/env.service';
import { S3Client, PutObjectCommand } from '@aws-sdk/client-s3';

jest.mock('@aws-sdk/client-s3');

const envServiceMock: Partial<EnvService> = {
  s3BucketName: 'test-bucket',
  s3AccessKey: 'test-access-key',
  s3SecretKey: 'test-secret-key',
};

describe('ImageUploadService', () => {
  let service: ImageUploadService;
  let envServiceInstance: EnvService;
  let s3ClientMock: any;

  beforeEach(async () => {
    jest.clearAllMocks();

    s3ClientMock = {
      send: jest.fn(),
    };

    (S3Client as jest.Mock).mockImplementation(() => s3ClientMock);

    const module: TestingModule = await Test.createTestingModule({
      providers: [
        ImageUploadService,
        {
          provide: EnvService,
          useValue: envServiceMock,
        },
      ],
    }).compile();

    service = module.get<ImageUploadService>(ImageUploadService);
    envServiceInstance = module.get<EnvService>(EnvService);
  });

  it('should be defined', () => {
    expect(service).toBeDefined();
  });

  it('should upload a base64 image successfully', async () => {
    const base64Data =
      'data:image/png;base64,iVBORw0KGgoAAAANSUhEUgAAAAEAAAABCAYAAAAfFcSJAAAADUlEQVR42mNk+M9QDwADhgGAWjR9awAAAABJRU5ErkJggg==';
    s3ClientMock.send.mockResolvedValue({} as any);

    const result = await service.uploadBase64Image(base64Data);

    expect(result).toMatch(/^myaichat\/generated\/[a-f0-9]{32}\.png$/);
    expect(s3ClientMock.send).toHaveBeenCalledTimes(1);
  });

  it('should create S3Client with correct configuration', async () => {
    const base64Data =
      'data:image/png;base64,iVBORw0KGgoAAAANSUhEUgAAAAEAAAABCAYAAAAfFcSJAAAADUlEQVR42mNk+M9QDwADhgGAWjR9awAAAABJRU5ErkJggg==';
    s3ClientMock.send.mockResolvedValue({} as any);

    await service.uploadBase64Image(base64Data);

    expect(S3Client).toHaveBeenCalledWith({
      region: 'mx-central-1',
      credentials: {
        accessKeyId: 'test-access-key',
        secretAccessKey: 'test-secret-key',
      },
    });
  });

  it('should return valid S3 key format', async () => {
    const base64Data =
      'data:image/png;base64,iVBORw0KGgoAAAANSUhEUgAAAAEAAAABCAYAAAAfFcSJAAAADUlEQVR42mNk+M9QDwADhgGAWjR9awAAAABJRU5ErkJggg==';
    s3ClientMock.send.mockResolvedValue({} as any);

    const result1 = await service.uploadBase64Image(base64Data);
    const result2 = await service.uploadBase64Image(base64Data);

    expect(result1).toMatch(/^myaichat\/generated\/[a-f0-9]{32}\.png$/);
    expect(result2).toMatch(/^myaichat\/generated\/[a-f0-9]{32}\.png$/);
    expect(result1).not.toBe(result2);
  });
});
