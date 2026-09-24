import { Injectable, Logger } from '@nestjs/common';
import {
  GetObjectCommand,
  PutObjectCommand,
  S3Client,
} from '@aws-sdk/client-s3';
import { Readable } from 'stream';
import { EnvService } from '@config/env';
import { randomBytes } from 'crypto';

@Injectable()
export class S3Service {
  #logger = new Logger(S3Service.name);
  #s3Client: S3Client;
  #bucket: string;

  constructor(private readonly envService: EnvService) {
    this.#s3Client = new S3Client({
      region: this.envService.awsS3Region,
      credentials: {
        accessKeyId: this.envService.awsAccessKeyId,
        secretAccessKey: this.envService.awsSecretAccessKey,
      },
    });
    this.#bucket = this.envService.awsS3Bucket;
  }

  async uploadImage(buffer: Buffer, userSub: string): Promise<string> {
    const normalizedUserSub = userSub.replace(/\|/g, '-');
    const randomString = randomBytes(5).toString('hex');
    const date = new Date().toISOString().split('T')[0];
    const key = `myaiimg/${normalizedUserSub}/${randomString}-${date}.png`;

    try {
      const command = new PutObjectCommand({
        Bucket: this.#bucket,
        Key: key,
        Body: buffer,
        ContentType: 'image/png',
      });

      await this.#s3Client.send(command);
      this.#logger.log(`Successfully uploaded image to S3: ${key}`);
      return key;
    } catch (error) {
      this.#logger.error('Failed to upload image to S3', error);
      throw error;
    }
  }

  async downloadImage(key: string): Promise<Buffer> {
    try {
      const command = new GetObjectCommand({
        Bucket: this.#bucket,
        Key: key,
      });

      const response = await this.#s3Client.send(command);
      const stream = response.Body as Readable;

      return new Promise<Buffer>((resolve, reject) => {
        const chunks: Buffer[] = [];
        stream.on('data', (chunk: Buffer) => chunks.push(chunk));
        stream.on('end', () => resolve(Buffer.concat(chunks)));
        stream.on('error', reject);
      });
    } catch (error) {
      this.#logger.error(`Failed to download image from S3: ${key}`, error);
      throw error;
    }
  }
}
