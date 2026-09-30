import { OpenAIService } from '../../../common';
import {
  compareInstructions,
  getComparePrompt,
  openAICompareFormat,
} from '../../../common/utils';
import { ComparePhrasesReqDto } from '../dtos/compare-phrases.req.dto';
import { PhraseComparisonService } from './phrase-comparison.service';

describe('PhraseComparisonService', () => {
  let service: PhraseComparisonService;
  let parseResponse: jest.Mock;

  beforeEach(() => {
    parseResponse = jest.fn();
    const openAIService = {
      client: { responses: { parse: parseResponse } },
    } as unknown as OpenAIService;
    service = new PhraseComparisonService(openAIService);
  });

  afterEach(() => {
    jest.clearAllMocks();
  });

  it('passes the comparison inputs and context to the OpenAI service', async () => {
    const dto: ComparePhrasesReqDto = {
      context: 'Meeting notes',
      inputs: ['We discussed about it', 'We discussed it'],
    };
    const result = {
      inputs: [
        {
          explanation: 'The verb does not need the preposition here.',
          input: dto.inputs[0],
        },
        {
          explanation: 'This is the more natural construction.',
          input: dto.inputs[1],
        },
      ],
      summary: 'Use discuss directly without about in this sentence.',
    };

    parseResponse.mockResolvedValue({ output_parsed: result });

    await expect(service.comparePhrases(dto)).resolves.toEqual(result);
    expect(parseResponse).toHaveBeenCalledWith({
      model: 'gpt-4o-mini',
      instructions: compareInstructions,
      input: getComparePrompt(dto.inputs, dto.context),
      text: { format: openAICompareFormat },
    });
  });
});
