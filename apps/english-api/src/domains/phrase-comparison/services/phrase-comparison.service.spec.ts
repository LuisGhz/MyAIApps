import { OpenAIService } from '../../../common';
import { ComparePhrasesReqDto } from '../dtos/compare-phrases.req.dto';
import { PhraseComparisonService } from './phrase-comparison.service';

describe('PhraseComparisonService', () => {
  let service: PhraseComparisonService;
  let openAIService: jest.Mocked<OpenAIService>;

  beforeEach(() => {
    openAIService = {
      compare: jest.fn(),
    } as Partial<jest.Mocked<OpenAIService>> as jest.Mocked<OpenAIService>;
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

    openAIService.compare.mockResolvedValue(result);

    await expect(service.comparePhrases(dto)).resolves.toEqual(result);
    expect(openAIService.compare).toHaveBeenCalledWith(dto.inputs, dto.context);
  });
});