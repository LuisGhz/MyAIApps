import { Test, TestingModule } from '@nestjs/testing';
import type { CompareSchema } from '../../common/utils';
import { ComparePhrasesReqDto } from './dtos/compare-phrases.req.dto';
import { PhraseComparisonController } from './phrase-comparison.controller';
import { PhraseComparisonService } from './services/phrase-comparison.service';

describe('PhraseComparisonController', () => {
  let controller: PhraseComparisonController;
  let phraseComparisonService: jest.Mocked<PhraseComparisonService>;

  beforeEach(async () => {
    const phraseComparisonServiceMock = {
      comparePhrases: jest.fn(),
    } as Partial<jest.Mocked<PhraseComparisonService>> as jest.Mocked<PhraseComparisonService>;

    const module: TestingModule = await Test.createTestingModule({
      controllers: [PhraseComparisonController],
      providers: [
        {
          provide: PhraseComparisonService,
          useValue: phraseComparisonServiceMock,
        },
      ],
    }).compile();

    controller = module.get(PhraseComparisonController);
    phraseComparisonService = module.get(PhraseComparisonService);
  });

  afterEach(() => {
    jest.clearAllMocks();
  });

  it('delegates phrase comparison requests to the service', async () => {
    const body: ComparePhrasesReqDto = {
      context: 'Business email',
      inputs: ['I have sent it yesterday', 'I sent it yesterday'],
    };
    const result: CompareSchema = {
      inputs: [
        {
          explanation: 'Incorrect tense for the time marker used.',
          input: body.inputs[0],
        },
        {
          explanation: 'This matches the expected tense.',
          input: body.inputs[1],
        },
      ],
      summary: 'Use the simple past form with yesterday.',
    };

    phraseComparisonService.comparePhrases.mockResolvedValue(result);

    await expect(controller.compare(body)).resolves.toEqual(result);
    expect(phraseComparisonService.comparePhrases).toHaveBeenCalledWith(body);
  });
});