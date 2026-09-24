import { Injectable, BadRequestException, Logger } from '@nestjs/common';
import {
  S3Client,
  PutObjectCommand,
  DeleteObjectsCommand,
} from '@aws-sdk/client-s3';
import { randomBytes } from 'node:crypto';
import { EnvService } from '@cfg/schema/env.service';
import { ALLOWED_FILE_TYPES, ALLOWED_FILE_EXTENSIONS } from '../consts';
import path from 'node:path';

@Injectable()
export class S3Service {
  readonly #logger = new Logger(S3Service.name);

  constructor(private readonly envService: EnvService) {}

  async deleteFiles(keys: string[]): Promise<void> {
    if (keys.length === 0) return;

    const client = this.#getClient();
    const command = new DeleteObjectsCommand({
      Bucket: this.envService.s3BucketName,
      Delete: {
        Objects: keys.map((key) => ({ Key: key })),
      },
    });

    try {
      await client.send(command);
      this.#logger.log(`Deleted ${keys.length} files from S3`);
    } catch (error) {
      this.#logger.error('Failed to delete files from S3', error);
      throw error;
    }
  }

  async uploadFile(file: Express.Multer.File): Promise<string> {
    this.#validateFile(file);

    const hexPrefix = randomBytes(16).toString('hex');
    const originalName = file.originalname;
    const key = `myaichat/${hexPrefix}-${originalName}`;

    const client = this.#getClient();
    const command = new PutObjectCommand({
      Bucket: this.envService.s3BucketName,
      Key: key,
      Body: file.buffer,
      ContentType: file.mimetype,
    });

    await client.send(command);

    return key;
  }

  #getClient(): S3Client {
    return new S3Client({
      region: 'mx-central-1',
      credentials: {
        accessKeyId: this.envService.s3AccessKey,
        secretAccessKey: this.envService.s3SecretKey,
      },
    });
  }

  #validateFile(file: Express.Multer.File): void {
    if (!file) throw new BadRequestException('No file provided');

    const mimeType = file.mimetype;
    const extension = path.extname(file.originalname).toLowerCase();

    const isValidMimeType = ALLOWED_FILE_TYPES.includes(mimeType as any);
    const isValidExtension = ALLOWED_FILE_EXTENSIONS.includes(extension as any);

    if (!isValidMimeType || !isValidExtension)
      throw new BadRequestException(
        `Invalid file type. Allowed types: ${ALLOWED_FILE_EXTENSIONS.join(', ')}`,
      );
  }
}
