import { Injectable } from '@nestjs/common';
import { OpenAIService } from '../../../common';
import { EnhanceTextReqDto } from '../dtos/enhance-text.req.dto';
import {
  getPrompt,
  openAITranslationFormat,
  translationInstructions,
} from 'src/common/utils';

@Injectable()
export class EnhanceService {
  constructor(private openAIService: OpenAIService) {}

  async enhanceText({ context, textToEnhance }: EnhanceTextReqDto) {
    const prompt = getPrompt(textToEnhance, context);
    const res = await this.openAIService.client.responses.parse({
      model: 'gpt-4o-mini',
      instructions: translationInstructions,
      input: prompt,
      text: {
        format: openAITranslationFormat,
      },
    });
    return res.output_parsed;
  }
}
