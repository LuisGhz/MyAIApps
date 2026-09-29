import { Test, TestingModule } from '@nestjs/testing';
import { getRepositoryToken } from '@nestjs/typeorm';
import { DataSource } from 'typeorm';
import { Logger } from '@nestjs/common';
import { ModelSeedService } from './model-seed.service';
import { Model, ModelDeveloper } from '../entities';

type MockRepository<T> = {
  count: jest.MockedFunction<() => Promise<number>>;
  findOne: jest.MockedFunction<
    (options: { where?: Partial<T> }) => Promise<Partial<T> | null>
  >;
  create: jest.MockedFunction<(entity: Partial<T>) => Partial<T>>;
  save: jest.MockedFunction<
    (entity: Partial<T> | Partial<T>[]) => Promise<Partial<T> | Partial<T>[]>
  >;
};

const createMockRepository = <T>(): MockRepository<T> => ({
  count: jest.fn<Promise<number>, []>(),
  findOne: jest.fn<
    Promise<Partial<T> | null>,
    [options: { where?: Partial<T> }]
  >(),
  create: jest.fn<Partial<T>, [entity: Partial<T>]>(),
  save: jest.fn<
    Promise<Partial<T> | Partial<T>[]>,
    [entity: Partial<T> | Partial<T>[]]
  >(),
});

type DataSourceMock = {
  query: jest.MockedFunction<
    (query: string, parameters?: unknown[]) => Promise<{ exists?: boolean }[]>
  >;
};

const createMockDataSource = (): DataSourceMock => ({
  query: jest.fn<
    Promise<{ exists?: boolean }[]>,
    [query: string, parameters?: unknown[]]
  >(),
});

type LoggerMock = {
  log: jest.MockedFunction<Logger['log']>;
  warn: jest.MockedFunction<Logger['warn']>;
  error: jest.MockedFunction<Logger['error']>;
  debug: jest.MockedFunction<Logger['debug']>;
};

const createMockLogger = (): LoggerMock => ({
  log: jest.fn<ReturnType<Logger['log']>, Parameters<Logger['log']>>(),
  warn: jest.fn<ReturnType<Logger['warn']>, Parameters<Logger['warn']>>(),
  error: jest.fn<ReturnType<Logger['error']>, Parameters<Logger['error']>>(),
  debug: jest.fn<ReturnType<Logger['debug']>, Parameters<Logger['debug']>>(),
});

type ModelSeedServiceInternals = {
  logger: LoggerMock;
  seedModels: () => Promise<void>;
  checkTableExists: (tableName: string) => Promise<boolean>;
};

const getServiceInternals = (
  service: ModelSeedService,
): ModelSeedServiceInternals => service as unknown as ModelSeedServiceInternals;

describe('ModelSeedService', () => {
  let service: ModelSeedService;
  let modelRepositoryMock: MockRepository<Model>;
  let developerRepositoryMock: MockRepository<ModelDeveloper>;
  let dataSourceMock: DataSourceMock;
  let loggerMock: LoggerMock;

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
    getServiceInternals(service).logger = loggerMock;

    jest.clearAllMocks();
  });

  describe('onModuleInit', () => {
    it('should call seedModels on initialization', async () => {
      const seedModelsSpy = jest.spyOn(
        getServiceInternals(service),
        'seedModels',
      );
      modelRepositoryMock.count.mockResolvedValue(1);
      dataSourceMock.query.mockResolvedValue([{ exists: true }]);

      await service.onModuleInit();

      expect(seedModelsSpy).toHaveBeenCalledTimes(1);
    });
  });

  describe('checkTableExists', () => {
    it('should return true when table exists', async () => {
      dataSourceMock.query.mockResolvedValue([{ exists: true }]);

      const result =
        await getServiceInternals(service).checkTableExists('models');

      expect(result).toBe(true);
      expect(dataSourceMock.query).toHaveBeenCalledWith(
        expect.stringContaining('information_schema.tables'),
        ['models'],
      );
    });

    it('should return false when table does not exist', async () => {
      dataSourceMock.query.mockResolvedValue([{ exists: false }]);

      const result =
        await getServiceInternals(service).checkTableExists('models');

      expect(result).toBe(false);
    });

    it('should query the database with correct table name', async () => {
      dataSourceMock.query.mockResolvedValue([{ exists: true }]);

      await getServiceInternals(service).checkTableExists('developers');

      expect(dataSourceMock.query).toHaveBeenCalledWith(expect.any(String), [
        'developers',
      ]);
    });
  });

  describe('seedModels', () => {
    it('should skip seeding when models table does not exist', async () => {
      dataSourceMock.query.mockResolvedValue([{ exists: false }]);

      await getServiceInternals(service).seedModels();

      expect(loggerMock.warn).toHaveBeenCalledWith(
        'Models table does not exist, skipping seed...',
      );
      expect(modelRepositoryMock.count).not.toHaveBeenCalled();
    });

    it('should skip seeding when models already exist', async () => {
      dataSourceMock.query.mockResolvedValue([{ exists: true }]);
      modelRepositoryMock.count.mockResolvedValue(5);

      await getServiceInternals(service).seedModels();

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

      dataSourceMock.query.mockResolvedValue([{ exists: true }]);
      modelRepositoryMock.count.mockResolvedValue(0);
      developerRepositoryMock.findOne.mockResolvedValue(null);
      developerRepositoryMock.create.mockReturnValue(mockDeveloper);
      developerRepositoryMock.save.mockResolvedValue(mockDeveloper);
      modelRepositoryMock.save.mockResolvedValue([mockModel]);

      jest
        .spyOn(getServiceInternals(service), 'checkTableExists')
        .mockResolvedValue(true);

      await getServiceInternals(service).seedModels();

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

      dataSourceMock.query.mockResolvedValue([{ exists: true }]);
      modelRepositoryMock.count.mockResolvedValue(0);
      developerRepositoryMock.findOne.mockResolvedValue(mockDeveloper);
      modelRepositoryMock.save.mockResolvedValue([]);

      jest
        .spyOn(getServiceInternals(service), 'checkTableExists')
        .mockResolvedValue(true);

      await getServiceInternals(service).seedModels();

      expect(developerRepositoryMock.findOne).toHaveBeenCalled();
      expect(developerRepositoryMock.create).not.toHaveBeenCalled();
    });

    it('should log successful completion with count of models created', async () => {
      dataSourceMock.query.mockResolvedValue([{ exists: true }]);
      modelRepositoryMock.count.mockResolvedValue(0);
      developerRepositoryMock.findOne.mockResolvedValue(null);
      developerRepositoryMock.create.mockReturnValue({
        id: 'dev-1',
      });
      developerRepositoryMock.save.mockResolvedValue({
        id: 'dev-1',
      });
      modelRepositoryMock.save.mockResolvedValue(
        Array.from({ length: 3 }, () => ({ id: 'model' })),
      );

      jest
        .spyOn(getServiceInternals(service), 'checkTableExists')
        .mockResolvedValue(true);

      await getServiceInternals(service).seedModels();

      expect(loggerMock.log).toHaveBeenCalledWith(
        expect.stringContaining('Models seeded successfully'),
      );
    });

    it('should call model repository save with constructed model objects', async () => {
      const mockDeveloper: Partial<ModelDeveloper> = {
        id: 'dev-1',
        name: 'OpenAI',
      };

      dataSourceMock.query.mockResolvedValue([{ exists: true }]);
      modelRepositoryMock.count.mockResolvedValue(0);
      developerRepositoryMock.findOne.mockResolvedValue(mockDeveloper);
      modelRepositoryMock.save.mockResolvedValue([]);

      jest
        .spyOn(getServiceInternals(service), 'checkTableExists')
        .mockResolvedValue(true);

      await getServiceInternals(service).seedModels();

      const savedModelBatch = modelRepositoryMock.save.mock.calls[0]?.[0];
      expect(Array.isArray(savedModelBatch)).toBe(true);
      if (!Array.isArray(savedModelBatch)) {
        throw new Error('Expected models to be saved as a batch');
      }
      expect(
        savedModelBatch.some((model) => model.developer?.name === 'OpenAI'),
      ).toBe(true);
    });
  });
});
