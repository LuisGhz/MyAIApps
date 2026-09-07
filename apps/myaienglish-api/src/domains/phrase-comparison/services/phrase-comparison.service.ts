import { Injectable } from '@nestjs/common';
import { OpenAIService } from '../../../common';
import { ComparePhrasesReqDto } from '../dtos/compare-phrases.req.dto';
import {
  compareInstructions,
  getComparePrompt,
  openAICompareFormat,
} from 'src/common/utils';

@Injectable()
export class PhraseComparisonService {
  constructor(private openAIService: OpenAIService) {}

  async comparePhrases(dto: ComparePhrasesReqDto) {
    const { inputs, context } = dto;
    const prompt = getComparePrompt(inputs, context);
    const res: any = await this.openAIService.client.responses.parse({
      model: 'gpt-4o-mini',
      instructions: compareInstructions,
      input: prompt,
      text: {
        format: openAICompareFormat,
      },
    });
    return res.output_parsed;
  }
}
