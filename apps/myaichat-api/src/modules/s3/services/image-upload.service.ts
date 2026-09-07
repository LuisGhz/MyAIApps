import { Injectable, Logger } from '@nestjs/common';
import { S3Client, PutObjectCommand } from '@aws-sdk/client-s3';
import { randomBytes } from 'node:crypto';
import { EnvService } from '@cfg/schema/env.service';

@Injectable()
export class ImageUploadService {
  readonly #logger = new Logger(ImageUploadService.name);

  constructor(private readonly envService: EnvService) {}

  async uploadBase64Image(base64Data: string): Promise<string> {
    const buffer = this.#base64ToBuffer(base64Data);
    this.#logger.debug(buffer);
    const randomName = this.#generateRandomFileName();
    const key = `myaichat/generated/${randomName}.png`;

    const client = this.#getClient();
    const command = new PutObjectCommand({
      Bucket: this.envService.s3BucketName,
      Key: key,
      Body: buffer,
      ContentType: 'image/png',
    });

    try {
      await client.send(command);
      this.#logger.log(`Uploaded generated image to S3: ${key}`);
      return key;
    } catch (error) {
      this.#logger.error('Failed to upload generated image to S3', error);
      throw error;
    }
  }

  #base64ToBuffer(base64Data: string): Buffer {
    const base64String = base64Data.replace(/^data:image\/\w+;base64,/, '');
    return Buffer.from(base64String, 'base64');
  }

  #generateRandomFileName(): string {
    return randomBytes(16).toString('hex');
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
}
