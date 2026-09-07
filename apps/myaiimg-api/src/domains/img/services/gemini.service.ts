import { Injectable, Logger } from '@nestjs/common';
import { GoogleGenAI, Part } from '@google/genai';
import { EnvService } from '@config/env';
import { base64toImage } from '@img/util/base64toImage.util';
import { GeminiNewImageReqDto } from '@img/dtos/gemini-new-image.dto';

@Injectable()
export class GeminiService {
  private readonly geminiClient: GoogleGenAI;
  private readonly logger = new Logger(GeminiService.name);

  constructor(private readonly envService: EnvService) {
    this.geminiClient = new GoogleGenAI({
      apiKey: this.envService.geminiApiKey,
    });
  }

  async genImage(dto: GeminiNewImageReqDto) {
    this.logger.debug({
      model: dto.model,
      contents: [
        {
          role: 'user',
          parts: [
            {
              text: dto.prompt,
            },
          ],
        },
      ],
      config: {
        responseModalities: ['TEXT', 'IMAGE'],
        imageConfig: {
          aspectRatio: dto.options.aspectRatio,
          imageSize: dto.options.size,
        },
      },
    });
    const res = await this.geminiClient.models.generateContent({
      model: dto.model,
      contents: [
        {
          role: 'user',
          parts: [
            {
              text: dto.prompt,
            },
          ],
        },
      ],
      config: {
        responseModalities: ['TEXT', 'IMAGE'],
        imageConfig: {
          aspectRatio: dto.options.aspectRatio,
          imageSize: dto.options.size,
        },
      },
    });

    const base64 = res.data;
    if (!base64) throw new Error('No image data received from Gemini API');
    return base64toImage(base64);
  }

  async editImage(dto: GeminiNewImageReqDto, files: Express.Multer.File[]) {
    const filesPart: Part[] = files.map((file) => ({
      inlineData: {
        mimeType: file.mimetype,
        data: file.buffer.toString('base64'),
      },
    }));
    this.logger.debug({
      model: dto.model,
      contents: [
        {
          role: 'user',
          parts: [
            {
              text: dto.prompt,
            },
            ...filesPart,
          ],
        },
      ],
      config: {
        responseModalities: ['TEXT', 'IMAGE'],
        imageConfig: {
          aspectRatio: dto.options.aspectRatio,
          imageSize: dto.options.size,
        },
      },
    });
    const res = await this.geminiClient.models.generateContent({
      model: dto.model,
      contents: [
        {
          role: 'user',
          parts: [
            {
              text: dto.prompt,
            },
            ...filesPart,
          ],
        },
      ],
      config: {
        responseModalities: ['TEXT', 'IMAGE'],
        imageConfig: {
          aspectRatio: dto.options.aspectRatio,
          imageSize: dto.options.size,
        },
      },
    });

    const base64 = res.data;
    if (!base64) throw new Error('No image data received from Gemini API');
    return base64toImage(base64);
  }
}
