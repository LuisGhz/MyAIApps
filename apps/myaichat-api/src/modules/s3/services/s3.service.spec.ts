import { Test, TestingModule } from '@nestjs/testing';
import { BadRequestException } from '@nestjs/common';
import { S3Service } from './s3.service';
import { EnvService } from '@cfg/schema/env.service';
import {
  S3Client,
  PutObjectCommand,
  DeleteObjectsCommand,
} from '@aws-sdk/client-s3';

jest.mock('@aws-sdk/client-s3');

const envServiceMock: Partial<EnvService> = {
  s3BucketName: 'test-bucket',
  s3AccessKey: 'test-access-key',
  s3SecretKey: 'test-secret-key',
};

describe('S3Service', () => {
  let service: S3Service;
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
        S3Service,
        {
          provide: EnvService,
          useValue: envServiceMock,
        },
      ],
    }).compile();

    service = module.get<S3Service>(S3Service);
    envServiceInstance = module.get<EnvService>(EnvService);
  });

  it('should be defined', () => {
    expect(service).toBeDefined();
  });

  it('should upload a file successfully', async () => {
    const mockFile: Express.Multer.File = {
      fieldname: 'file',
      originalname: 'test.png',
      encoding: '7bit',
      mimetype: 'image/png',
      buffer: Buffer.from('test-image-data'),
      size: 1024,
    } as Express.Multer.File;
    s3ClientMock.send.mockResolvedValue({} as any);

    const result = await service.uploadFile(mockFile);

    expect(result).toMatch(/^myaichat\/[a-f0-9]{32}-test\.png$/);
    expect(s3ClientMock.send).toHaveBeenCalledTimes(1);
  });

  it('should upload files with different mime types', async () => {
    const mockFile: Express.Multer.File = {
      fieldname: 'file',
      originalname: 'photo.jpg',
      encoding: '7bit',
      mimetype: 'image/jpeg',
      buffer: Buffer.from('test-image-data'),
      size: 2048,
    } as Express.Multer.File;
    s3ClientMock.send.mockResolvedValue({} as any);

    const result = await service.uploadFile(mockFile);

    expect(result).toMatch(/^myaichat\/[a-f0-9]{32}-photo\.jpg$/);
    expect(s3ClientMock.send).toHaveBeenCalledTimes(1);
  });

  it('should delete files successfully', async () => {
    const keys = ['myaichat/file1.png', 'myaichat/file2.jpg'];
    s3ClientMock.send.mockResolvedValue({} as any);

    await service.deleteFiles(keys);

    expect(s3ClientMock.send).toHaveBeenCalledTimes(1);
  });

  it('should delete multiple files at once', async () => {
    const keys = [
      'myaichat/test1.png',
      'myaichat/test2.jpg',
      'myaichat/test3.jpeg',
    ];
    s3ClientMock.send.mockResolvedValue({} as any);

    await service.deleteFiles(keys);

    expect(s3ClientMock.send).toHaveBeenCalledTimes(1);
  });

  it('should not attempt to delete when keys array is empty', async () => {
    await service.deleteFiles([]);

    expect(s3ClientMock.send).not.toHaveBeenCalled();
  });

  it('should create S3Client with correct configuration', async () => {
    const mockFile: Express.Multer.File = {
      fieldname: 'file',
      originalname: 'test.png',
      encoding: '7bit',
      mimetype: 'image/png',
      buffer: Buffer.from('test-image-data'),
      size: 1024,
    } as Express.Multer.File;
    s3ClientMock.send.mockResolvedValue({} as any);

    await service.uploadFile(mockFile);

    expect(S3Client).toHaveBeenCalledWith({
      region: 'mx-central-1',
      credentials: {
        accessKeyId: 'test-access-key',
        secretAccessKey: 'test-secret-key',
      },
    });
  });
});
