import { Injectable } from '@nestjs/common';
import { OpenAIService } from '../../../common';
import { ComparePhrasesReqDto } from '../dtos/compare-phrases.req.dto';
import {
  CompareSchema,
  compareObject,
  compareInstructions,
  getComparePrompt,
  openAICompareFormat,
} from 'src/common/utils';

@Injectable()
export class PhraseComparisonService {
  constructor(private openAIService: OpenAIService) {}

  async comparePhrases(
    dto: ComparePhrasesReqDto,
  ): Promise<CompareSchema | null> {
    const { inputs, context } = dto;
    const prompt = getComparePrompt(inputs, context);
    const res = (await this.openAIService.client.responses.parse({
      model: 'gpt-4o-mini',
      instructions: compareInstructions,
      input: prompt,
      text: {
        format: openAICompareFormat,
      },
    })) as { output_parsed: unknown };
    return res.output_parsed === null
      ? null
      : compareObject.parse(res.output_parsed);
  }
}
