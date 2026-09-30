import { OpenAIService } from '../../../common';
import {
  getPrompt,
  openAITranslationFormat,
  translationInstructions,
} from '../../../common/utils';
import { EnhanceTextReqDto } from '../dtos/enhance-text.req.dto';
import { EnhanceService } from './enhance.service';

describe('EnhanceService', () => {
  let service: EnhanceService;
  let parseResponse: jest.Mock;

  beforeEach(() => {
    parseResponse = jest.fn();
    const openAIService = {
      client: { responses: { parse: parseResponse } },
    } as unknown as OpenAIService;
    service = new EnhanceService(openAIService);
  });

  afterEach(() => {
    jest.clearAllMocks();
  });

  it('passes the text and context to the OpenAI service', async () => {
    const dto: EnhanceTextReqDto = {
      context: 'Customer support chat',
      textToEnhance: 'No entiendo este error',
    };
    const result = {
      grammarFix: 'I do not understand this error.',
      informalB2: 'I do not understand this error.',
      informalC1: 'I cannot make sense of this error.',
      formalB2: 'I do not understand this error.',
      formalC1: 'I am unable to understand this error.',
    };

    parseResponse.mockResolvedValue({ output_parsed: result });

    await expect(service.enhanceText(dto)).resolves.toEqual(result);
    expect(parseResponse).toHaveBeenCalledWith({
      model: 'gpt-4o-mini',
      instructions: translationInstructions,
      input: getPrompt(dto.textToEnhance, dto.context),
      text: { format: openAITranslationFormat },
    });
  });
});
