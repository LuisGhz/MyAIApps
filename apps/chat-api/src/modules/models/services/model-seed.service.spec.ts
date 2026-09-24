import { Test, TestingModule } from '@nestjs/testing';
import { getRepositoryToken } from '@nestjs/typeorm';
import { DataSource, Repository } from 'typeorm';
import { Logger } from '@nestjs/common';
import { ModelSeedService } from './model-seed.service';
import { Model, ModelDeveloper } from '../entities';

const createMockRepository = <T extends { id?: string }>(): jest.Mocked<
  Partial<Repository<T>>
> => ({
  count: jest.fn(),
  findOne: jest.fn(),
  create: jest.fn(),
  save: jest.fn(),
});

const createMockDataSource = (): jest.Mocked<Partial<DataSource>> => ({
  query: jest.fn(),
});

const createMockLogger = (): jest.Mocked<Partial<Logger>> => ({
  log: jest.fn(),
  warn: jest.fn(),
  error: jest.fn(),
  debug: jest.fn(),
});

describe('ModelSeedService', () => {
  let service: ModelSeedService;
  let modelRepositoryMock: jest.Mocked<Partial<Repository<Model>>>;
  let developerRepositoryMock: jest.Mocked<Partial<Repository<ModelDeveloper>>>;
  let dataSourceMock: jest.Mocked<Partial<DataSource>>;
  let loggerMock: jest.Mocked<Partial<Logger>>;

  beforeEach(async () => {
    modelRepositoryMock = createMockRepository<Model>();
    developerRepositoryMock = createMockRepository<ModelDeveloper>();
    dataSourceMock = createMockDataSource();
    loggerMock = createMockLogger();

    const module: TestingModule = await Test.createTestingModule({
      providers: [
        ModelSeedService,
        {
          provide: getRepositoryToken(Model),
          useValue: modelRepositoryMock,
        },
        {
          provide: getRepositoryToken(ModelDeveloper),
          useValue: developerRepositoryMock,
        },
        {
          provide: DataSource,
          useValue: dataSourceMock,
        },
        {
          provide: Logger,
          useValue: loggerMock,
        },
      ],
    }).compile();

    service = module.get<ModelSeedService>(ModelSeedService);
    (service as any).logger = loggerMock;

    jest.clearAllMocks();
  });

  describe('onModuleInit', () => {
    it('should call seedModels on initialization', async () => {
      const seedModelsSpy = jest.spyOn(service as any, 'seedModels');
      (modelRepositoryMock.count as jest.Mock).mockResolvedValue(1);
      (dataSourceMock.query as jest.Mock).mockResolvedValue([{ exists: true }]);

      await service.onModuleInit();

      expect(seedModelsSpy).toHaveBeenCalledTimes(1);
    });
  });

  describe('checkTableExists', () => {
    it('should return true when table exists', async () => {
      (dataSourceMock.query as jest.Mock).mockResolvedValue([{ exists: true }]);

      const result = await (service as any).checkTableExists('models');

      expect(result).toBe(true);
      expect(dataSourceMock.query).toHaveBeenCalledWith(
        expect.stringContaining('information_schema.tables'),
        ['models'],
      );
    });

    it('should return false when table does not exist', async () => {
      (dataSourceMock.query as jest.Mock).mockResolvedValue([
        { exists: false },
      ]);

      const result = await (service as any).checkTableExists('models');

      expect(result).toBe(false);
    });

    it('should query the database with correct table name', async () => {
      (dataSourceMock.query as jest.Mock).mockResolvedValue([{ exists: true }]);

      await (service as any).checkTableExists('developers');

      expect(dataSourceMock.query).toHaveBeenCalledWith(expect.any(String), [
        'developers',
      ]);
    });
  });

  describe('seedModels', () => {
    it('should skip seeding when models table does not exist', async () => {
      (dataSourceMock.query as jest.Mock).mockResolvedValue([
        { exists: false },
      ]);

      await (service as any).seedModels();

      expect(loggerMock.warn).toHaveBeenCalledWith(
        'Models table does not exist, skipping seed...',
      );
      expect(modelRepositoryMock.count).not.toHaveBeenCalled();
    });

    it('should skip seeding when models already exist', async () => {
      (dataSourceMock.query as jest.Mock).mockResolvedValue([{ exists: true }]);
      (modelRepositoryMock.count as jest.Mock).mockResolvedValue(5);

      await (service as any).seedModels();

      expect(loggerMock.log).toHaveBeenCalledWith(
        'Models already seeded, skipping...',
      );
      expect(developerRepositoryMock.findOne).not.toHaveBeenCalled();
    });

    it('should seed models when table exists and is empty', async () => {
      const mockDeveloper: Partial<ModelDeveloper> = {
        id: 'dev-1',
        name: 'OpenAI',
        link: 'https://openai.com',
        imageUrl: 'https://example.com/openai.png',
      };

      const mockModel: Partial<Model> = {
        id: 'model-1',
        name: 'GPT-4',
        shortName: 'gpt-4',
        value: 'gpt-4',
        link: 'https://openai.com/gpt-4',
        priceInput: 0.03,
        priceOutput: 0.06,
        contextWindow: 8192,
        maxOutputTokens: 4096,
        knowledgeCutoff: '2024-01',
        developer: mockDeveloper as ModelDeveloper,
      };

      (dataSourceMock.query as jest.Mock).mockResolvedValue([{ exists: true }]);
      (modelRepositoryMock.count as jest.Mock).mockResolvedValue(0);
      (developerRepositoryMock.findOne as jest.Mock).mockResolvedValue(null);
      (developerRepositoryMock.create as jest.Mock).mockReturnValue(
        mockDeveloper,
      );
      (developerRepositoryMock.save as jest.Mock).mockResolvedValue(
        mockDeveloper,
      );
      (modelRepositoryMock.save as jest.Mock).mockResolvedValue([mockModel]);

      jest.spyOn(service as any, 'checkTableExists').mockResolvedValue(true);

      await (service as any).seedModels();

      expect(developerRepositoryMock.create).toHaveBeenCalled();
      expect(developerRepositoryMock.save).toHaveBeenCalled();
      expect(modelRepositoryMock.save).toHaveBeenCalled();
      expect(loggerMock.log).toHaveBeenCalledWith('Seeding models...');
    });

    it('should reuse existing developers when found', async () => {
      const mockDeveloper: Partial<ModelDeveloper> = {
        id: 'dev-1',
        name: 'OpenAI',
      };

      (dataSourceMock.query as jest.Mock).mockResolvedValue([{ exists: true }]);
      (modelRepositoryMock.count as jest.Mock).mockResolvedValue(0);
      (developerRepositoryMock.findOne as jest.Mock).mockResolvedValue(
        mockDeveloper,
      );
      (modelRepositoryMock.save as jest.Mock).mockResolvedValue([]);

      jest.spyOn(service as any, 'checkTableExists').mockResolvedValue(true);

      await (service as any).seedModels();

      expect(developerRepositoryMock.findOne).toHaveBeenCalled();
      expect(developerRepositoryMock.create).not.toHaveBeenCalled();
    });

    it('should log successful completion with count of models created', async () => {
      (dataSourceMock.query as jest.Mock).mockResolvedValue([{ exists: true }]);
      (modelRepositoryMock.count as jest.Mock).mockResolvedValue(0);
      (developerRepositoryMock.findOne as jest.Mock).mockResolvedValue(null);
      (developerRepositoryMock.create as jest.Mock).mockReturnValue({
        id: 'dev-1',
      });
      (developerRepositoryMock.save as jest.Mock).mockResolvedValue({
        id: 'dev-1',
      });
      (modelRepositoryMock.save as jest.Mock).mockResolvedValue(
        Array(3).fill({ id: 'model' }),
      );

      jest.spyOn(service as any, 'checkTableExists').mockResolvedValue(true);

      await (service as any).seedModels();

      expect(loggerMock.log).toHaveBeenCalledWith(
        expect.stringContaining('Models seeded successfully'),
      );
    });

    it('should call model repository save with constructed model objects', async () => {
      const mockDeveloper: Partial<ModelDeveloper> = {
        id: 'dev-1',
        name: 'OpenAI',
      };

      (dataSourceMock.query as jest.Mock).mockResolvedValue([{ exists: true }]);
      (modelRepositoryMock.count as jest.Mock).mockResolvedValue(0);
      (developerRepositoryMock.findOne as jest.Mock).mockResolvedValue(
        mockDeveloper,
      );
      (modelRepositoryMock.save as jest.Mock).mockResolvedValue([]);

      jest.spyOn(service as any, 'checkTableExists').mockResolvedValue(true);

      await (service as any).seedModels();

      expect(modelRepositoryMock.save).toHaveBeenCalledWith(
        expect.arrayContaining([
          expect.objectContaining({
            developer: expect.any(Object),
          }),
        ]),
      );
    });
  });
});
