import { Test, TestingModule } from '@nestjs/testing';
import { Logger } from '@nestjs/common';
import { S3Service } from './s3.service';
import { EnvService } from '@config/env';
import { S3Client, PutObjectCommand, GetObjectCommand } from '@aws-sdk/client-s3';
import { EventEmitter } from 'events';
import { randomBytes } from 'crypto';

jest.mock('@aws-sdk/client-s3');
jest.mock('crypto');

const createMockStream = (chunks: Buffer[], streamError?: Error) => {
  const emitter = new EventEmitter();
  setImmediate(() => {
    if (streamError) {
      emitter.emit('error', streamError);
    } else {
      for (const chunk of chunks) emitter.emit('data', chunk);
      emitter.emit('end');
    }
  });
  return emitter;
};

describe('S3Service', () => {
  let service: S3Service;
  let envServiceInstance: EnvService;
  let s3ClientMock: jest.Mocked<S3Client>;

  const envServiceMock = {
    awsS3Region: 'us-east-1',
    awsAccessKeyId: 'test-access-key-id',
    awsSecretAccessKey: 'test-secret-access-key',
    awsS3Bucket: 'test-bucket',
  };

  const mockRandomBytes = Buffer.from('randomhex');

  beforeEach(async () => {
    s3ClientMock = {
      send: jest.fn().mockResolvedValue({}) as any,
    } as any;

    (S3Client as jest.Mock).mockImplementation(() => s3ClientMock);
    (randomBytes as jest.Mock).mockReturnValue(mockRandomBytes);
    mockRandomBytes.toString = jest.fn().mockReturnValue('72616e646f6d686578');

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

    jest.spyOn(Logger.prototype, 'debug').mockImplementation();
    jest.spyOn(Logger.prototype, 'log').mockImplementation();
    jest.spyOn(Logger.prototype, 'error').mockImplementation();
  });

  afterEach(() => {
    jest.clearAllMocks();
  });

  it('should be defined', () => {
    expect(service).toBeDefined();
  });

  it('should upload an image to S3 with correct parameters', async () => {
    const buffer = Buffer.from('image-buffer-data');
    const userSub = 'auth0|user123';

    const result = await service.uploadImage(buffer, userSub);

    expect(randomBytes).toHaveBeenCalledWith(5);
    expect(s3ClientMock.send).toHaveBeenCalledTimes(1);
    expect(s3ClientMock.send).toHaveBeenCalledWith(expect.any(PutObjectCommand));
    expect(result).toMatch(
      /^myaiimg\/auth0-user123\/72616e646f6d686578-\d{4}-\d{2}-\d{2}\.png$/,
    );
  });

  it('should normalize userSub by replacing pipe characters', async () => {
    const buffer = Buffer.from('test-image');
    const userSub = 'google|oauth|user456';

    const result = await service.uploadImage(buffer, userSub);

    expect(result).toContain('google-oauth-user456');
    expect(result).not.toContain('|');
  });

  it('should generate unique key with random string and date', async () => {
    const buffer = Buffer.from('unique-image');
    const userSub = 'user789';

    const result = await service.uploadImage(buffer, userSub);

    expect(randomBytes).toHaveBeenCalledWith(5);
    expect(mockRandomBytes.toString).toHaveBeenCalledWith('hex');
    expect(result).toContain('72616e646f6d686578');
    expect(result).toMatch(/\d{4}-\d{2}-\d{2}\.png$/);
  });

  it('should log success message when image is uploaded', async () => {
    const buffer = Buffer.from('logged-image');
    const userSub = 'user999';

    const loggerLogSpy = jest.spyOn(Logger.prototype, 'log');

    const result = await service.uploadImage(buffer, userSub);

    expect(loggerLogSpy).toHaveBeenCalledWith(
      `Successfully uploaded image to S3: ${result}`,
    );
  });

  it('should log error and throw when S3 upload fails', async () => {
    const buffer = Buffer.from('fail-upload');
    const userSub = 'user-fail';
    const s3Error = new Error('S3 upload failed');

    (s3ClientMock.send as any).mockRejectedValue(s3Error);

    const loggerErrorSpy = jest.spyOn(Logger.prototype, 'error');

    await expect(service.uploadImage(buffer, userSub)).rejects.toThrow(
      'S3 upload failed',
    );
    expect(loggerErrorSpy).toHaveBeenCalledWith(
      'Failed to upload image to S3',
      s3Error,
    );
    expect(s3ClientMock.send).toHaveBeenCalledTimes(1);
  });

  it('should throw when S3 client returns network error', async () => {
    const buffer = Buffer.from('network-error-image');
    const userSub = 'network-user';
    const networkError = new Error('Network timeout');

    (s3ClientMock.send as any).mockRejectedValue(networkError);

    await expect(service.uploadImage(buffer, userSub)).rejects.toThrow(
      'Network timeout',
    );
    expect(s3ClientMock.send).toHaveBeenCalledTimes(1);
  });

  it('should throw when S3 client returns access denied error', async () => {
    const buffer = Buffer.from('access-denied-image');
    const userSub = 'restricted-user';
    const accessError = new Error('Access Denied');

    (s3ClientMock.send as any).mockRejectedValue(accessError);

    await expect(service.uploadImage(buffer, userSub)).rejects.toThrow(
      'Access Denied',
    );
  });

  it('should handle empty buffer upload attempt', async () => {
    const emptyBuffer = Buffer.from('');
    const userSub = 'empty-user';

    const result = await service.uploadImage(emptyBuffer, userSub);

    expect(s3ClientMock.send).toHaveBeenCalledTimes(1);
    expect(result).toMatch(
      /^myaiimg\/empty-user\/72616e646f6d686578-\d{4}-\d{2}-\d{2}\.png$/,
    );
  });

  it('should handle userSub with special characters', async () => {
    const buffer = Buffer.from('special-char-image');
    const userSub = 'user|with|many||pipes|||';

    const result = await service.uploadImage(buffer, userSub);

    expect(result).toContain('user-with-many--pipes---');
    expect(result).not.toContain('|');
  });

  it('should throw when randomBytes generation fails', async () => {
    const buffer = Buffer.from('random-fail-image');
    const userSub = 'random-fail-user';
    const randomError = new Error('Crypto module error');

    (randomBytes as jest.Mock).mockImplementation(() => {
      throw randomError;
    });

    await expect(service.uploadImage(buffer, userSub)).rejects.toThrow(
      'Crypto module error',
    );
  });

  it('should download an image from S3 and return a Buffer', async () => {
    const key = 'myaiimg/auth0-user123/abc-2026-03-06.png';
    const chunks = [Buffer.from('chunk1'), Buffer.from('chunk2')];
    const mockStream = createMockStream(chunks);

    (s3ClientMock.send as jest.Mock).mockResolvedValue({ Body: mockStream });

    const result = await service.downloadImage(key);

    expect(s3ClientMock.send).toHaveBeenCalledTimes(1);
    expect(s3ClientMock.send).toHaveBeenCalledWith(expect.any(GetObjectCommand));
    expect(result).toEqual(Buffer.concat(chunks));
  });

  it('should call GetObjectCommand with correct bucket and key', async () => {
    const key = 'myaiimg/user/some-image.png';
    const mockStream = createMockStream([Buffer.from('data')]);

    (s3ClientMock.send as jest.Mock).mockResolvedValue({ Body: mockStream });

    await service.downloadImage(key);

    expect(jest.mocked(GetObjectCommand)).toHaveBeenCalledWith({
      Bucket: envServiceMock.awsS3Bucket,
      Key: key,
    });
  });

  it('should concatenate multiple stream chunks into a single Buffer', async () => {
    const key = 'myaiimg/user/multi-chunk.png';
    const chunks = [Buffer.from('part1'), Buffer.from('part2'), Buffer.from('part3')];
    const mockStream = createMockStream(chunks);

    (s3ClientMock.send as jest.Mock).mockResolvedValue({ Body: mockStream });

    const result = await service.downloadImage(key);

    expect(result).toEqual(Buffer.concat(chunks));
    expect(result.toString()).toBe('part1part2part3');
  });

  it('should log error and throw when S3 download fails', async () => {
    const key = 'myaiimg/user/fail.png';
    const s3Error = new Error('S3 download failed');

    (s3ClientMock.send as jest.Mock).mockRejectedValue(s3Error);

    const loggerErrorSpy = jest.spyOn(Logger.prototype, 'error');

    await expect(service.downloadImage(key)).rejects.toThrow('S3 download failed');
    expect(loggerErrorSpy).toHaveBeenCalledWith(
      `Failed to download image from S3: ${key}`,
      s3Error,
    );
  });

  it('should throw when stream emits an error', async () => {
    const key = 'myaiimg/user/stream-error.png';
    const streamError = new Error('Stream read failure');
    const mockStream = createMockStream([], streamError);

    (s3ClientMock.send as jest.Mock).mockResolvedValue({ Body: mockStream });

    await expect(service.downloadImage(key)).rejects.toThrow('Stream read failure');
  });
});
