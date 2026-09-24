import { Injectable, Logger } from '@nestjs/common';
import OpenAI from 'openai';
import { EnvService } from '@cfg/schema/env.service';
import type { TranscribeAudioResDto } from '../dto';

@Injectable()
export class TranscriptionService {
  private readonly logger = new Logger(TranscriptionService.name);
  private readonly client: OpenAI;
  private readonly TRANSCRIPTION_MODEL = 'gpt-4o-mini-transcribe';

  constructor(private readonly envService: EnvService) {
    this.client = new OpenAI({
      apiKey: this.envService.openaiApiKey,
    });
  }

  async transcribeAudio(
    file: Express.Multer.File,
    temperature: number = 0,
  ): Promise<TranscribeAudioResDto> {
    try {
      this.logger.debug(
        `Starting transcription for file: ${file.originalname}, size: ${file.size} bytes`,
      );

      // Create a File object from the buffer
      const audioFile = new File(
        [new Uint8Array(file.buffer)],
        file.originalname,
        {
          type: file.mimetype,
        },
      );

      const response = await this.client.audio.transcriptions.create({
        file: audioFile,
        model: this.TRANSCRIPTION_MODEL,
        temperature,
        response_format: 'json',
      });

      this.logger.debug('Transcription completed successfully');

      return {
        text: response.text,
        usage:
          response.usage && 'input_tokens' in response.usage
            ? {
                inputTokens: response.usage.input_tokens,
                outputTokens: response.usage.output_tokens,
                totalTokens: response.usage.total_tokens,
              }
            : undefined,
      };
    } catch (error) {
      this.logger.error('Error during audio transcription', error);
      throw error;
    }
  }
}
