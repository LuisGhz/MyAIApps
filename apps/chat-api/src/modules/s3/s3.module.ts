import { Global, Module } from '@nestjs/common';
import { S3Service, ImageUploadService } from './services';
import { IsValidFileTypeConstraint } from './validators';

@Global()
@Module({
  providers: [S3Service, ImageUploadService, IsValidFileTypeConstraint],
  exports: [S3Service, ImageUploadService, IsValidFileTypeConstraint],
})
export class S3Module {}
