import { OpenAIService } from '../../../common';
import { EnhanceTextReqDto } from '../dtos/enhance-text.req.dto';
import { EnhanceService } from './enhance.service';

describe('EnhanceService', () => {
  let service: EnhanceService;
  let openAIService: jest.Mocked<OpenAIService>;

  beforeEach(() => {
    openAIService = {
      enhanceText: jest.fn(),
    } as Partial<jest.Mocked<OpenAIService>> as jest.Mocked<OpenAIService>;
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

    openAIService.enhanceText.mockResolvedValue(result);

    await expect(service.enhanceText(dto)).resolves.toEqual(result);
    expect(openAIService.enhanceText).toHaveBeenCalledWith(
      dto.textToEnhance,
      dto.context,
    );
  });
});