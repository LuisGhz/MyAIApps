import { Test, TestingModule } from '@nestjs/testing';
import { EnhanceTextReqDto } from './dtos/enhance-text.req.dto';
import { EnhanceController } from './enhance.controller';
import { EnhanceService } from './services/enhance.service';

describe('EnhanceController', () => {
  let controller: EnhanceController;
  let enhanceService: jest.Mocked<EnhanceService>;

  beforeEach(async () => {
    const enhanceServiceMock = {
      enhanceText: jest.fn(),
    } as Partial<jest.Mocked<EnhanceService>> as jest.Mocked<EnhanceService>;

    const module: TestingModule = await Test.createTestingModule({
      controllers: [EnhanceController],
      providers: [
        {
          provide: EnhanceService,
          useValue: enhanceServiceMock,
        },
      ],
    }).compile();

    controller = module.get(EnhanceController);
    enhanceService = module.get(EnhanceService);
  });

  afterEach(() => {
    jest.clearAllMocks();
  });

  it('delegates enhancement requests to the service', async () => {
    const body: EnhanceTextReqDto = {
      context: 'Job interview',
      textToEnhance: 'Necesito practicar mi ingles',
    };
    const result = {
      grammarFix: 'I need to practice my English.',
      informalB2: 'I need to practice my English.',
      informalC1: 'I should work on my English.',
      formalB2: 'I need to practice my English.',
      formalC1: 'I need to refine my English.',
    };

    enhanceService.enhanceText.mockResolvedValue(result);

    await expect(controller.enhance(body)).resolves.toEqual(result);
    expect(enhanceService.enhanceText).toHaveBeenCalledWith(body);
  });
});