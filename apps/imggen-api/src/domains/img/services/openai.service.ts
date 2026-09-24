import { Injectable, Logger } from '@nestjs/common';
import { EnvService } from '@config/env';
import openAIClient, { toFile } from 'openai';
import { base64toImage } from '@img/util/base64toImage.util';
import { OpenAINewImageReqDto } from '@img/dtos';

@Injectable()
export class OpenAIService {
  private openAI: openAIClient;
  private readonly logger = new Logger(OpenAIService.name);

  constructor(private readonly envService: EnvService) {
    this.openAI = new openAIClient({
      apiKey: this.envService.openAIApiKey,
    });
  }

  async genImage(dto: OpenAINewImageReqDto) {
    this.logger.debug({
      model: dto.model,
      prompt: dto.prompt,
      n: 1,
      size: dto.options.size,
      quality: dto.options.quality,
    });

    const res = await this.openAI.images.generate({
      model: dto.model,
      prompt: dto.prompt,
      n: 1,
      size: dto.options.size,
      quality: dto.options.quality,
    });

    if (!res.data?.[0]?.b64_json)
      throw new Error('Image generation failed: No data returned from OpenAI');

    return base64toImage(res.data[0].b64_json);
  }

  async editImage(dto: OpenAINewImageReqDto, files: Express.Multer.File[]) {
    const cImages = await Promise.all(
      files.map(async (file) =>
        toFile(file.buffer, file.originalname, { type: file.mimetype }),
      ),
    );

    this.logger.debug({
      model: dto.model,
      image: cImages,
      prompt: dto.prompt,
      n: 1,
      size: dto.options.size,
      quality: dto.options.quality,
    });

    const res = await this.openAI.images.edit({
      model: dto.model,
      image: cImages,
      prompt: dto.prompt,
      n: 1,
      size: dto.options.size,
      quality: dto.options.quality,
    });

    if (!res.data?.[0]?.b64_json)
      throw new Error('Image editing failed: No data returned from OpenAI');

    return base64toImage(res.data[0].b64_json);
  }
}
