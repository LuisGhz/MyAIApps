import {
  Body,
  Controller,
  Get,
  Post,
  Query,
  Res,
  StreamableFile,
  UploadedFiles,
  UseInterceptors,
} from '@nestjs/common';
import type { Response } from 'express';
import { FileFieldsInterceptor } from '@nestjs/platform-express';
import { GeminiNewImageReqDto, OpenAINewImageReqDto } from './dtos';
import {
  GeminiService,
  ImageService,
  OpenAIService,
  S3Service,
} from './services';
import { User } from '@common/decorators';
import type { JwtPayload } from '@core/strategies/interfaces';

@Controller('img')
export class ImgController {
  constructor(
    private readonly openAIService: OpenAIService,
    private readonly geminiService: GeminiService,
    private readonly s3Service: S3Service,
    private readonly imageService: ImageService,
  ) {}

  @Post('openai')
  @UseInterceptors(
    FileFieldsInterceptor([
      { name: 'image', maxCount: 1 },
      { name: 'lastGeneratedImage', maxCount: 1 },
    ]),
  )
  async getOpenAIImage(
    @Body() body: OpenAINewImageReqDto,
    @User() user: JwtPayload,
    @UploadedFiles()
    files?: {
      image?: Express.Multer.File[];
      lastGeneratedImage?: Express.Multer.File[];
    },
  ) {
    let buffer: Buffer<ArrayBufferLike> | undefined;
    const imageFile = files?.image?.[0];
    const lastGeneratedImageFile = files?.lastGeneratedImage?.[0];
    if (imageFile || lastGeneratedImageFile) {
      const files = [imageFile, lastGeneratedImageFile].filter(
        (file): file is Express.Multer.File => file !== undefined,
      );
      buffer = await this.openAIService.editImage(body, files);
    } else buffer = await this.openAIService.genImage(body);

    // key is path/filename in S3 bucket
    const key = await this.s3Service.uploadImage(buffer, user.sub);

    // Save image record to database
    await this.imageService.create({ key, userId: user.sub });

    return {
      image: buffer.toString('base64'),
      key,
    };
  }

  @Post('gemini')
  @UseInterceptors(
    FileFieldsInterceptor([
      { name: 'image', maxCount: 1 },
      { name: 'lastGeneratedImage', maxCount: 1 },
    ]),
  )
  async getGeminiImage(
    @Body() body: GeminiNewImageReqDto,
    @User() user: JwtPayload,
    @UploadedFiles()
    files?: {
      image?: Express.Multer.File[];
      lastGeneratedImage?: Express.Multer.File[];
    },
  ) {
    let buffer: Buffer<ArrayBufferLike> | undefined;
    const imageFile = files?.image?.[0];
    const lastGeneratedImageFile = files?.lastGeneratedImage?.[0];
    if (imageFile || lastGeneratedImageFile) {
      const files = [imageFile, lastGeneratedImageFile].filter(
        (file): file is Express.Multer.File => file !== undefined,
      );
      buffer = await this.geminiService.editImage(body, files);
    } else buffer = await this.geminiService.genImage(body);

    const key = await this.s3Service.uploadImage(buffer, user.sub);

    // Save image record to database
    await this.imageService.create({ key, userId: user.sub });

    return {
      image: buffer.toString('base64'),
      key,
    };
  }

  @Get('generated')
  async getUserImages(@User() user: JwtPayload) {
    return await this.imageService.findAllByUserId(user.sub);
  }

  @Get('download')
  async downloadImage(
    @Query('src') src: string,
    @User() user: JwtPayload,
    @Res({ passthrough: true }) res: Response,
  ): Promise<StreamableFile> {
    const filename = src.split('/').pop()!;
    const normalizedUserSub = user.sub.replace(/\|/g, '-');
    const key = `myaiimg/${normalizedUserSub}/${filename}`;

    const buffer = await this.s3Service.downloadImage(key);

    res.set({
      'Content-Type': 'image/png',
      'Content-Disposition': `attachment; filename="${filename}"`,
      'Content-Length': buffer.length,
    });

    return new StreamableFile(buffer);
  }
}
