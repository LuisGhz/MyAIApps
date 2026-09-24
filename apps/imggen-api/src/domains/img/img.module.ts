import { Module } from '@nestjs/common';
import { TypeOrmModule } from '@nestjs/typeorm';
import { GeminiService, ImageService, OpenAIService, S3Service } from './services';
import { ImgController } from './img.controller';
import { Image } from './entities/image.entity';

@Module({
  imports: [TypeOrmModule.forFeature([Image])],
  controllers: [ImgController],
  providers: [OpenAIService, GeminiService, S3Service, ImageService],
})
export class ImgModule {}
