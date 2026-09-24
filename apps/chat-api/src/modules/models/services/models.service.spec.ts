import { Test, TestingModule } from '@nestjs/testing';
import { getRepositoryToken } from '@nestjs/typeorm';
import { Repository } from 'typeorm';
import { BadRequestException, NotFoundException } from '@nestjs/common';
import { ModelsService } from './models.service';
import { Model, ModelDeveloper } from '../entities';
import { AppCacheService } from '@cmn/services/app-cache.service';
import { CACHE_KEYS } from '@cmn/consts/cache.const';

describe('ModelsService', () => {
  let service: ModelsService;
  let modelRepositoryMock: jest.Mocked<Repository<Model>>;
  let developerRepositoryMock: jest.Mocked<Repository<ModelDeveloper>>;
  let appCacheServiceMock: jest.Mocked<AppCacheService>;

  const mockModel: Model = {
    id: '1',
    name: 'Test Model',
    shortName: 'TM',
    value: 'test-model',
    link: 'https://example.com',
    priceInput: 0.001,
    priceOutput: 0.002,
    contextWindow: 4096,
    maxOutputTokens: 2048,
    knowledgeCutoff: '2024-01-01',
    guestAccess: false,
    supportsTemperature: true,
    isReasoning: false,
    reasoningLevel: null,
    developer: {
      id: 'dev-1',
      name: 'OpenAI',
      link: 'https://openai.com',
      imageUrl: 'https://example.com/image.png',
      models: [],
      createdAt: new Date(),
      updatedAt: new Date(),
    },
    createdAt: new Date(),
    updatedAt: new Date(),
  };

  const mockDeveloper: ModelDeveloper = {
    id: 'dev-1',
    name: 'OpenAI',
    link: 'https://openai.com',
    imageUrl: 'https://example.com/image.png',
    models: [],
    createdAt: new Date(),
    updatedAt: new Date(),
  };

  beforeEach(async () => {
    modelRepositoryMock = {
      findOne: jest.fn(),
      find: jest.fn(),
      count: jest.fn(),
      create: jest.fn(),
      save: jest.fn(),
      remove: jest.fn(),
    } as unknown as jest.Mocked<Repository<Model>>;

    developerRepositoryMock = {
      findOne: jest.fn(),
      find: jest.fn(),
      create: jest.fn(),
      save: jest.fn(),
    } as unknown as jest.Mocked<Repository<ModelDeveloper>>;

    appCacheServiceMock = {
      get: jest.fn(),
      setLong: jest.fn(),
      del: jest.fn(),
    } as unknown as jest.Mocked<AppCacheService>;

    const module: TestingModule = await Test.createTestingModule({
      providers: [
        ModelsService,
        {
          provide: getRepositoryToken(Model),
          useValue: modelRepositoryMock,
        },
        {
          provide: getRepositoryToken(ModelDeveloper),
          useValue: developerRepositoryMock,
        },
        {
          provide: AppCacheService,
          useValue: appCacheServiceMock,
        },
      ],
    }).compile();

    service = module.get<ModelsService>(ModelsService);

    jest.clearAllMocks();
  });

  it('should be defined', () => {
    expect(service).toBeDefined();
  });

  describe('create', () => {
    it('should create model with existing developer by developerId', async () => {
      const createDto = {
        name: 'GPT-4',
        shortName: 'GPT4',
        value: 'gpt-4',
        link: 'https://openai.com/gpt4',
        guestAccess: true,
        price: { input: 0.003, output: 0.006 },
        supportsTemperature: true,
        isReasoning: false,
        reasoningLevel: null,
        metadata: {
          contextWindow: 8192,
          maxOutputTokens: 4096,
          knowledgeCutoff: '2024-04-01',
        },
        developerId: 'dev-1',
      };

      const createdModel = { ...mockModel, ...createDto };

      modelRepositoryMock.findOne.mockResolvedValue(null);
      developerRepositoryMock.findOne.mockResolvedValue(mockDeveloper);
      modelRepositoryMock.create.mockReturnValue(createdModel as any);
      modelRepositoryMock.save.mockResolvedValue(createdModel as any);
      appCacheServiceMock.del.mockResolvedValue(undefined);

      const result = await service.create(createDto as any);

      expect(developerRepositoryMock.findOne).toHaveBeenCalledWith({
        where: { id: 'dev-1' },
      });
      expect(modelRepositoryMock.create).toHaveBeenCalled();
      expect(modelRepositoryMock.save).toHaveBeenCalled();
      expect(appCacheServiceMock.del).toHaveBeenCalledWith(
        CACHE_KEYS.MODELS_FIND_ALL,
      );
      expect(result).toBeDefined();
      expect(result.value).toBe('gpt-4');
    });

    it('should create model with new developer', async () => {
      const createDto = {
        name: 'Claude 3',
        shortName: 'C3',
        value: 'claude-3',
        link: 'https://anthropic.com/claude3',
        guestAccess: false,
        price: { input: 0.0015, output: 0.0075 },
        supportsTemperature: true,
        isReasoning: false,
        reasoningLevel: null,
        metadata: {
          contextWindow: 200000,
          maxOutputTokens: 4096,
          knowledgeCutoff: '2024-06-01',
        },
        developer: {
          name: 'Anthropic',
          link: 'https://anthropic.com',
          imageUrl: 'https://example.com/anthropic.png',
        },
      };

      const newDeveloper = {
        id: 'dev-2',
        ...createDto.developer,
        models: [],
        createdAt: new Date(),
        updatedAt: new Date(),
      };

      const createdModel = {
        ...mockModel,
        ...createDto,
        developer: newDeveloper,
      };

      modelRepositoryMock.findOne.mockResolvedValue(null);
      developerRepositoryMock.findOne.mockResolvedValue(null);
      developerRepositoryMock.create.mockReturnValue(newDeveloper as any);
      developerRepositoryMock.save.mockResolvedValue(newDeveloper as any);
      modelRepositoryMock.create.mockReturnValue(createdModel as any);
      modelRepositoryMock.save.mockResolvedValue(createdModel as any);
      appCacheServiceMock.del.mockResolvedValue(undefined);

      const result = await service.create(createDto as any);

      expect(developerRepositoryMock.findOne).toHaveBeenCalledWith({
        where: { name: 'Anthropic' },
      });
      expect(developerRepositoryMock.create).toHaveBeenCalled();
      expect(developerRepositoryMock.save).toHaveBeenCalled();
      expect(modelRepositoryMock.save).toHaveBeenCalled();
      expect(result.value).toBe('claude-3');
    });

    it('should create model with existing developer by name', async () => {
      const createDto = {
        name: 'Claude 3 Updated',
        shortName: 'C3U',
        value: 'claude-3-updated',
        link: 'https://anthropic.com/claude3',
        guestAccess: false,
        price: { input: 0.0015, output: 0.0075 },
        supportsTemperature: true,
        isReasoning: false,
        reasoningLevel: null,
        metadata: {
          contextWindow: 200000,
          maxOutputTokens: 4096,
          knowledgeCutoff: '2024-06-01',
        },
        developer: {
          name: 'Anthropic',
          link: 'https://anthropic.com',
          imageUrl: 'https://example.com/anthropic.png',
        },
      };

      const existingDeveloper = {
        id: 'dev-2',
        name: 'Anthropic',
        link: 'https://anthropic.com',
        imageUrl: 'https://example.com/anthropic.png',
        models: [],
        createdAt: new Date(),
        updatedAt: new Date(),
      };

      const createdModel = {
        ...mockModel,
        ...createDto,
        developer: existingDeveloper,
      };

      modelRepositoryMock.findOne.mockResolvedValue(null);
      developerRepositoryMock.findOne.mockResolvedValue(
        existingDeveloper as any,
      );
      modelRepositoryMock.create.mockReturnValue(createdModel as any);
      modelRepositoryMock.save.mockResolvedValue(createdModel as any);
      appCacheServiceMock.del.mockResolvedValue(undefined);

      const result = await service.create(createDto as any);

      expect(developerRepositoryMock.create).not.toHaveBeenCalled();
      expect(developerRepositoryMock.save).not.toHaveBeenCalled();
      expect(result.value).toBe('claude-3-updated');
    });

    it('should set guestAccess to false by default', async () => {
      const createDto = {
        name: 'Test Model',
        shortName: 'TM',
        value: 'test-model',
        link: 'https://example.com',
        price: { input: 0.001, output: 0.002 },
        supportsTemperature: true,
        isReasoning: false,
        reasoningLevel: null,
        metadata: {
          contextWindow: 4096,
          maxOutputTokens: 2048,
          knowledgeCutoff: '2024-01-01',
        },
        developerId: 'dev-1',
      };

      const createdModel = {
        ...mockModel,
        ...createDto,
        guestAccess: false,
      };

      modelRepositoryMock.findOne.mockResolvedValue(null);
      developerRepositoryMock.findOne.mockResolvedValue(mockDeveloper as any);
      modelRepositoryMock.create.mockReturnValue(createdModel as any);
      modelRepositoryMock.save.mockResolvedValue(createdModel as any);
      appCacheServiceMock.del.mockResolvedValue(undefined);

      const result = await service.create(createDto as any);

      expect(result.guestAccess).toBe(false);
    });
  });

  describe('findAll', () => {
    it('should return cached models if available', async () => {
      const cachedModels = [
        {
          id: '1',
          name: 'Model 1',
          shortName: 'M1',
          value: 'model-1',
          guestAccess: false,
          developer: {
            name: 'Dev 1',
            imageUrl: 'https://example.com/dev1.png',
          },
        },
      ];

      appCacheServiceMock.get.mockResolvedValue(cachedModels);

      const result = await service.findAll();

      expect(appCacheServiceMock.get).toHaveBeenCalledWith(
        CACHE_KEYS.MODELS_FIND_ALL,
      );
      expect(result).toEqual(cachedModels);
      expect(modelRepositoryMock.find).not.toHaveBeenCalled();
    });

    it('should fetch models from database and cache them', async () => {
      const models = [mockModel];

      appCacheServiceMock.get.mockResolvedValue(null);
      modelRepositoryMock.find.mockResolvedValue(models as any);

      const result = await service.findAll();

      expect(modelRepositoryMock.find).toHaveBeenCalledWith({
        relations: ['developer'],
        order: { name: 'ASC' },
      });
      expect(appCacheServiceMock.setLong).toHaveBeenCalledWith(
        CACHE_KEYS.MODELS_FIND_ALL,
        expect.any(Array),
      );
      expect(result).toHaveLength(1);
      expect(result[0].value).toBe('test-model');
    });

    it('should return models sorted by name', async () => {
      const models = [
        { ...mockModel, name: 'Zebra Model', value: 'zebra' },
        { ...mockModel, id: '2', name: 'Alpha Model', value: 'alpha' },
      ];

      appCacheServiceMock.get.mockResolvedValue(null);
      modelRepositoryMock.find.mockResolvedValue(models as any);

      await service.findAll();

      expect(modelRepositoryMock.find).toHaveBeenCalledWith({
        relations: ['developer'],
        order: { name: 'ASC' },
      });
    });

    it('should map models to list response DTOs', async () => {
      const models = [mockModel];

      appCacheServiceMock.get.mockResolvedValue(null);
      modelRepositoryMock.find.mockResolvedValue(models as any);

      const result = await service.findAll();

      expect(result[0]).toHaveProperty('id');
      expect(result[0]).toHaveProperty('name');
      expect(result[0]).toHaveProperty('shortName');
      expect(result[0]).toHaveProperty('value');
      expect(result[0]).toHaveProperty('guestAccess');
      expect(result[0]).toHaveProperty('developer');
      expect(result[0].developer).toHaveProperty('name');
      expect(result[0].developer).toHaveProperty('imageUrl');
    });
  });

  describe('findOne', () => {
    it('should return model by id', async () => {
      modelRepositoryMock.findOne.mockResolvedValue(mockModel as any);

      const result = await service.findOne('1');

      expect(modelRepositoryMock.findOne).toHaveBeenCalledWith({
        where: { id: '1' },
        relations: ['developer'],
      });
      expect(result).toBeDefined();
      expect(result.id).toBe('1');
      expect(result.value).toBe('test-model');
    });

    it('should map model to response DTO', async () => {
      modelRepositoryMock.findOne.mockResolvedValue(mockModel as any);

      const result = await service.findOne('1');

      expect(result).toHaveProperty('id');
      expect(result).toHaveProperty('name');
      expect(result).toHaveProperty('shortName');
      expect(result).toHaveProperty('value');
      expect(result).toHaveProperty('link');
      expect(result).toHaveProperty('guestAccess');
      expect(result).toHaveProperty('price');
      expect(result).toHaveProperty('supportsTemperature');
      expect(result).toHaveProperty('isReasoning');
      expect(result).toHaveProperty('reasoningLevel');
      expect(result).toHaveProperty('metadata');
      expect(result).toHaveProperty('developer');
      expect(result).toHaveProperty('createdAt');
      expect(result).toHaveProperty('updatedAt');
    });

    it('should convert price properties to numbers', async () => {
      const modelWithStringPrice = {
        ...mockModel,
        priceInput: '0.001',
        priceOutput: '0.002',
      };

      modelRepositoryMock.findOne.mockResolvedValue(
        modelWithStringPrice as any,
      );

      const result = await service.findOne('1');

      expect(typeof result.price.input).toBe('number');
      expect(typeof result.price.output).toBe('number');
      expect(result.price.input).toBe(0.001);
      expect(result.price.output).toBe(0.002);
    });
  });

  describe('findByValue', () => {
    it('should return cached model if available', async () => {
      const cachedModel = {
        id: '1',
        name: 'Test Model',
        value: 'test-model',
        shortName: 'TM',
        link: 'https://example.com',
        guestAccess: false,
        price: { input: 0.001, output: 0.002 },
        metadata: {
          contextWindow: 4096,
          maxOutputTokens: 2048,
          knowledgeCutoff: '2024-01-01',
        },
        developer: {
          id: 'dev-1',
          name: 'OpenAI',
          link: 'https://openai.com',
          imageUrl: 'https://example.com/image.png',
        },
        createdAt: new Date(),
        updatedAt: new Date(),
      };

      appCacheServiceMock.get.mockResolvedValue(cachedModel);

      const result = await service.findByValue('test-model');

      expect(appCacheServiceMock.get).toHaveBeenCalledWith(
        `${CACHE_KEYS.GET_BY_VALUE}:test-model`,
      );
      expect(result).toEqual(cachedModel);
      expect(modelRepositoryMock.findOne).not.toHaveBeenCalled();
    });

    it('should fetch model from database and cache it', async () => {
      appCacheServiceMock.get.mockResolvedValue(null);
      modelRepositoryMock.findOne.mockResolvedValue(mockModel as any);

      const result = await service.findByValue('test-model');

      expect(modelRepositoryMock.findOne).toHaveBeenCalledWith({
        where: { value: 'test-model' },
        relations: ['developer'],
      });
      expect(appCacheServiceMock.setLong).toHaveBeenCalledWith(
        `${CACHE_KEYS.GET_BY_VALUE}:test-model`,
        expect.any(Object),
      );
      expect(result).toBeDefined();
      expect(result.value).toBe('test-model');
    });

    it('should map model to response DTO', async () => {
      appCacheServiceMock.get.mockResolvedValue(null);
      modelRepositoryMock.findOne.mockResolvedValue(mockModel as any);

      const result = await service.findByValue('test-model');

      expect(result).toHaveProperty('id');
      expect(result).toHaveProperty('name');
      expect(result).toHaveProperty('value');
      expect(result).toHaveProperty('supportsTemperature');
      expect(result).toHaveProperty('isReasoning');
      expect(result).toHaveProperty('reasoningLevel');
      expect(result).toHaveProperty('developer');
    });
  });

  describe('update', () => {
    it('should update model with all properties', async () => {
      const updateDto = {
        name: 'Updated Model',
        shortName: 'UM',
        value: 'updated-model',
        link: 'https://updated.com',
        guestAccess: true,
        price: { input: 0.005, output: 0.01 },
        metadata: {
          contextWindow: 16384,
          maxOutputTokens: 8192,
          knowledgeCutoff: '2024-12-01',
        },
      };

      const updatedModel = { ...mockModel, ...updateDto };

      modelRepositoryMock.findOne.mockResolvedValue(mockModel as any);
      modelRepositoryMock.save.mockResolvedValue(updatedModel as any);
      appCacheServiceMock.get.mockResolvedValue(null);
      appCacheServiceMock.del.mockResolvedValue(undefined);

      const result = await service.update('1', updateDto as any);

      expect(modelRepositoryMock.findOne).toHaveBeenCalledWith({
        where: { id: '1' },
        relations: ['developer'],
      });
      expect(modelRepositoryMock.save).toHaveBeenCalled();
      expect(appCacheServiceMock.del).toHaveBeenCalledWith(
        CACHE_KEYS.MODELS_FIND_ALL,
      );
      expect(result.name).toBe('Updated Model');
      expect(result.value).toBe('updated-model');
    });

    it('should update only provided properties', async () => {
      const updateDto = {
        name: 'New Name',
      };

      const updatedModel = { ...mockModel, name: 'New Name' };

      modelRepositoryMock.findOne.mockResolvedValue(mockModel as any);
      modelRepositoryMock.save.mockResolvedValue(updatedModel as any);
      appCacheServiceMock.get.mockResolvedValue(null);
      appCacheServiceMock.del.mockResolvedValue(undefined);

      const result = await service.update('1', updateDto as any);

      expect(result.name).toBe('New Name');
      expect(modelRepositoryMock.save).toHaveBeenCalled();
    });

    it('should update partial price properties', async () => {
      const updateDto = {
        price: { input: 0.002 },
      };

      const updatedModel = {
        ...mockModel,
        priceInput: 0.002,
      };

      modelRepositoryMock.findOne.mockResolvedValue(mockModel as any);
      modelRepositoryMock.save.mockResolvedValue(updatedModel as any);
      appCacheServiceMock.get.mockResolvedValue(null);
      appCacheServiceMock.del.mockResolvedValue(undefined);

      const result = await service.update('1', updateDto as any);

      expect(result.price.input).toBe(0.002);
      expect(modelRepositoryMock.save).toHaveBeenCalled();
    });

    it('should update partial metadata properties', async () => {
      const updateDto = {
        metadata: {
          contextWindow: 8192,
        },
      };

      const updatedModel = {
        ...mockModel,
        contextWindow: 8192,
      };

      modelRepositoryMock.findOne.mockResolvedValue(mockModel as any);
      modelRepositoryMock.save.mockResolvedValue(updatedModel as any);
      appCacheServiceMock.get.mockResolvedValue(null);
      appCacheServiceMock.del.mockResolvedValue(undefined);

      const result = await service.update('1', updateDto as any);

      expect(result.metadata.contextWindow).toBe(8192);
      expect(modelRepositoryMock.save).toHaveBeenCalled();
    });

    it('should update developer by developerId', async () => {
      const newDeveloper = {
        id: 'dev-2',
        name: 'Anthropic',
        link: 'https://anthropic.com',
        imageUrl: 'https://example.com/anthropic.png',
        models: [],
        createdAt: new Date(),
        updatedAt: new Date(),
      };

      const updateDto = {
        developerId: 'dev-2',
      };

      const updatedModel = { ...mockModel, developer: newDeveloper };

      modelRepositoryMock.findOne.mockResolvedValue(mockModel as any);
      developerRepositoryMock.findOne.mockResolvedValue(newDeveloper as any);
      modelRepositoryMock.save.mockResolvedValue(updatedModel as any);
      appCacheServiceMock.get.mockResolvedValue(null);
      appCacheServiceMock.del.mockResolvedValue(undefined);

      const result = await service.update('1', updateDto as any);

      expect(developerRepositoryMock.findOne).toHaveBeenCalledWith({
        where: { id: 'dev-2' },
      });
      expect(result.developer.id).toBe('dev-2');
      expect(modelRepositoryMock.save).toHaveBeenCalled();
    });

    it('should invalidate value cache if model has cached value', async () => {
      const updateDto = {
        name: 'Updated',
      };

      const mockModelForTest = { ...mockModel, value: 'specific-test-model' };
      const updatedModel = { ...mockModelForTest, name: 'Updated' };

      modelRepositoryMock.findOne.mockResolvedValue(mockModelForTest as any);
      modelRepositoryMock.save.mockResolvedValue(updatedModel as any);
      appCacheServiceMock.get.mockImplementation(async (key) => {
        if (key === `${CACHE_KEYS.GET_BY_VALUE}:specific-test-model`) {
          return { id: '1', value: 'specific-test-model' };
        }
        return null;
      });
      appCacheServiceMock.del.mockResolvedValue(undefined);

      await service.update('1', updateDto as any);

      expect(appCacheServiceMock.get).toHaveBeenCalledWith(
        `${CACHE_KEYS.GET_BY_VALUE}:specific-test-model`,
      );
      expect(appCacheServiceMock.del).toHaveBeenCalled();
    });

    it('should update supportsTemperature', async () => {
      const updateDto = { supportsTemperature: false };
      const updatedModel = { ...mockModel, supportsTemperature: false };

      modelRepositoryMock.findOne.mockResolvedValue(mockModel as any);
      modelRepositoryMock.save.mockResolvedValue(updatedModel as any);
      appCacheServiceMock.get.mockResolvedValue(null);
      appCacheServiceMock.del.mockResolvedValue(undefined);

      const result = await service.update('1', updateDto as any);

      expect(result.supportsTemperature).toBe(false);
      expect(modelRepositoryMock.save).toHaveBeenCalled();
    });

    it('should update isReasoning and reasoningLevel', async () => {
      const updateDto = { isReasoning: true, reasoningLevel: 'high' };
      const updatedModel = {
        ...mockModel,
        isReasoning: true,
        reasoningLevel: 'high',
      };

      modelRepositoryMock.findOne.mockResolvedValue(mockModel as any);
      modelRepositoryMock.save.mockResolvedValue(updatedModel as any);
      appCacheServiceMock.get.mockResolvedValue(null);
      appCacheServiceMock.del.mockResolvedValue(undefined);

      const result = await service.update('1', updateDto as any);

      expect(result.isReasoning).toBe(true);
      expect(result.reasoningLevel).toBe('high');
      expect(modelRepositoryMock.save).toHaveBeenCalled();
    });

    it('should set reasoningLevel to null when isReasoning is set to false', async () => {
      const reasoningModel = {
        ...mockModel,
        isReasoning: true,
        reasoningLevel: 'high',
      };
      const updateDto = { isReasoning: false, reasoningLevel: null };
      const updatedModel = {
        ...reasoningModel,
        isReasoning: false,
        reasoningLevel: null,
      };

      modelRepositoryMock.findOne.mockResolvedValue(reasoningModel as any);
      modelRepositoryMock.save.mockResolvedValue(updatedModel as any);
      appCacheServiceMock.get.mockResolvedValue(null);
      appCacheServiceMock.del.mockResolvedValue(undefined);

      const result = await service.update('1', updateDto as any);

      expect(result.isReasoning).toBe(false);
      expect(result.reasoningLevel).toBeNull();
      expect(modelRepositoryMock.save).toHaveBeenCalled();
    });
  });

  describe('remove', () => {
    it('should remove model by id', async () => {
      modelRepositoryMock.findOne.mockResolvedValue(mockModel as any);
      modelRepositoryMock.remove.mockResolvedValue(mockModel as any);
      appCacheServiceMock.get.mockResolvedValue(null);
      appCacheServiceMock.del.mockResolvedValue(undefined);

      await service.remove('1');

      expect(modelRepositoryMock.findOne).toHaveBeenCalledWith({
        where: { id: '1' },
        relations: ['developer'],
      });
      expect(modelRepositoryMock.remove).toHaveBeenCalledWith(mockModel);
      expect(appCacheServiceMock.del).toHaveBeenCalledWith(
        CACHE_KEYS.MODELS_FIND_ALL,
      );
    });

    it('should invalidate value cache when removing model', async () => {
      const mockModelForTest = {
        ...mockModel,
        value: 'specific-model-to-remove',
      };

      modelRepositoryMock.findOne.mockResolvedValue(mockModelForTest as any);
      modelRepositoryMock.remove.mockResolvedValue(mockModelForTest as any);
      appCacheServiceMock.get.mockImplementation(async (key) => {
        if (key === `${CACHE_KEYS.GET_BY_VALUE}:specific-model-to-remove`) {
          return { id: '1', value: 'specific-model-to-remove' };
        }
        return null;
      });
      appCacheServiceMock.del.mockResolvedValue(undefined);

      await service.remove('1');

      expect(appCacheServiceMock.get).toHaveBeenCalledWith(
        `${CACHE_KEYS.GET_BY_VALUE}:specific-model-to-remove`,
      );
      expect(appCacheServiceMock.del).toHaveBeenCalled();
    });

    it('should invalidate findAll cache after removing model', async () => {
      modelRepositoryMock.findOne.mockResolvedValue(mockModel as any);
      modelRepositoryMock.remove.mockResolvedValue(mockModel as any);
      appCacheServiceMock.get.mockResolvedValue(null);
      appCacheServiceMock.del.mockResolvedValue(undefined);

      await service.remove('1');

      expect(appCacheServiceMock.del).toHaveBeenCalledWith(
        CACHE_KEYS.MODELS_FIND_ALL,
      );
    });
  });

  describe('getDevelopers', () => {
    it('should return all developers sorted by name', async () => {
      const developers = [
        mockDeveloper,
        {
          id: 'dev-2',
          name: 'Anthropic',
          link: 'https://anthropic.com',
          imageUrl: 'https://example.com/anthropic.png',
          models: [],
          createdAt: new Date(),
          updatedAt: new Date(),
        },
      ];

      developerRepositoryMock.find.mockResolvedValue(developers as any);

      const result = await service.getDevelopers();

      expect(developerRepositoryMock.find).toHaveBeenCalledWith({
        order: { name: 'ASC' },
      });
      expect(result).toHaveLength(2);
      expect(result).toEqual(developers);
    });

    it('should return empty array when no developers exist', async () => {
      developerRepositoryMock.find.mockResolvedValue([]);

      const result = await service.getDevelopers();

      expect(result).toEqual([]);
    });
  });

  describe('existsById', () => {
    it('should return true when model exists by id', async () => {
      modelRepositoryMock.count.mockResolvedValue(1);

      const result = await service.existsById('1');

      expect(modelRepositoryMock.count).toHaveBeenCalledWith({
        where: { id: '1' },
      });
      expect(result).toBe(true);
    });

    it('should return false when model does not exist by id', async () => {
      modelRepositoryMock.count.mockResolvedValue(0);

      const result = await service.existsById('nonexistent-id');

      expect(modelRepositoryMock.count).toHaveBeenCalledWith({
        where: { id: 'nonexistent-id' },
      });
      expect(result).toBe(false);
    });
  });

  describe('existsByValue', () => {
    it('should return true when model exists by value', async () => {
      modelRepositoryMock.count.mockResolvedValue(1);

      const result = await service.existsByValue('test-model');

      expect(modelRepositoryMock.count).toHaveBeenCalledWith({
        where: { value: 'test-model' },
      });
      expect(result).toBe(true);
    });

    it('should return false when model does not exist by value', async () => {
      modelRepositoryMock.count.mockResolvedValue(0);

      const result = await service.existsByValue('nonexistent');

      expect(modelRepositoryMock.count).toHaveBeenCalledWith({
        where: { value: 'nonexistent' },
      });
      expect(result).toBe(false);
    });
  });

  describe('validateGuestAccess', () => {
    it('should not throw when user is not guest', async () => {
      await expect(
        service.validateGuestAccess('test-model', 'user'),
      ).resolves.toBeUndefined();

      expect(appCacheServiceMock.get).not.toHaveBeenCalled();
      expect(modelRepositoryMock.findOne).not.toHaveBeenCalled();
    });

    it('should validate guest access using cache', async () => {
      const cachedModel = {
        id: '1',
        name: 'Test Model',
        guestAccess: true,
      };

      appCacheServiceMock.get.mockResolvedValue(cachedModel);

      await expect(
        service.validateGuestAccess('test-model', 'guest'),
      ).resolves.toBeUndefined();

      expect(appCacheServiceMock.get).toHaveBeenCalledWith(
        `${CACHE_KEYS.GET_BY_VALUE_FOR_GUEST}:test-model`,
      );
      expect(modelRepositoryMock.findOne).not.toHaveBeenCalled();
    });

    it('should validate guest access from database and cache it', async () => {
      appCacheServiceMock.get.mockResolvedValue(null);
      modelRepositoryMock.findOne.mockResolvedValue({
        id: '1',
        name: 'Test Model',
        guestAccess: true,
      } as any);

      await expect(
        service.validateGuestAccess('test-model', 'guest'),
      ).resolves.toBeUndefined();

      expect(modelRepositoryMock.findOne).toHaveBeenCalledWith({
        where: { value: 'test-model' },
        select: ['id', 'name', 'guestAccess'],
      });
      expect(appCacheServiceMock.setLong).toHaveBeenCalled();
    });

    it('should cache guest access check result', async () => {
      appCacheServiceMock.get.mockResolvedValue(null);
      modelRepositoryMock.findOne.mockResolvedValue({
        id: '1',
        name: 'Test Model',
        guestAccess: true,
      } as any);

      await service.validateGuestAccess('test-model', 'guest');

      expect(appCacheServiceMock.setLong).toHaveBeenCalledWith(
        `${CACHE_KEYS.GET_BY_VALUE_FOR_GUEST}:test-model`,
        {
          id: '1',
          name: 'Test Model',
          guestAccess: true,
        },
      );
    });

    it('should validate guest access with cached model with guestAccess false', async () => {
      const cachedModel = {
        id: '1',
        name: 'Test Model',
        guestAccess: false,
      };

      appCacheServiceMock.get.mockResolvedValue(cachedModel);

      await expect(
        service.validateGuestAccess('test-model', 'guest'),
      ).rejects.toThrow();

      expect(appCacheServiceMock.get).toHaveBeenCalledWith(
        `${CACHE_KEYS.GET_BY_VALUE_FOR_GUEST}:test-model`,
      );
    });
  });

  describe('validateGuestAccessById', () => {
    it('should not throw when user is not guest', async () => {
      await expect(
        service.validateGuestAccessById('1', 'user'),
      ).resolves.toBeUndefined();

      expect(appCacheServiceMock.get).not.toHaveBeenCalled();
      expect(modelRepositoryMock.findOne).not.toHaveBeenCalled();
    });

    it('should validate guest access using cache by id', async () => {
      const cachedModel = {
        id: '1',
        name: 'Test Model',
        guestAccess: true,
      };

      appCacheServiceMock.get.mockResolvedValue(cachedModel);

      await expect(
        service.validateGuestAccessById('1', 'guest'),
      ).resolves.toBeUndefined();

      expect(appCacheServiceMock.get).toHaveBeenCalledWith(
        `${CACHE_KEYS.GET_BY_ID_FOR_GUEST}:1`,
      );
      expect(modelRepositoryMock.findOne).not.toHaveBeenCalled();
    });

    it('should fetch model from database and cache it when not in cache', async () => {
      appCacheServiceMock.get.mockResolvedValue(null);
      modelRepositoryMock.findOne.mockResolvedValue({
        id: '1',
        name: 'Test Model',
        guestAccess: true,
      } as any);

      await expect(
        service.validateGuestAccessById('1', 'guest'),
      ).resolves.toBeUndefined();

      expect(modelRepositoryMock.findOne).toHaveBeenCalledWith({
        where: { id: '1' },
        select: ['id', 'name', 'guestAccess'],
      });
      expect(appCacheServiceMock.setLong).toHaveBeenCalled();
    });

    it('should cache guest access by id check result', async () => {
      appCacheServiceMock.get.mockResolvedValue(null);
      modelRepositoryMock.findOne.mockResolvedValue({
        id: '1',
        name: 'Test Model',
        guestAccess: true,
      } as any);

      await service.validateGuestAccessById('1', 'guest');

      expect(appCacheServiceMock.setLong).toHaveBeenCalledWith(
        `${CACHE_KEYS.GET_BY_ID_FOR_GUEST}:1`,
        {
          id: '1',
          name: 'Test Model',
          guestAccess: true,
        },
      );
    });

    it('should throw when cached model has guestAccess false', async () => {
      const cachedModel = {
        id: '1',
        name: 'Test Model',
        guestAccess: false,
      };

      appCacheServiceMock.get.mockResolvedValue(cachedModel);

      await expect(
        service.validateGuestAccessById('1', 'guest'),
      ).rejects.toThrow();

      expect(appCacheServiceMock.get).toHaveBeenCalledWith(
        `${CACHE_KEYS.GET_BY_ID_FOR_GUEST}:1`,
      );
    });

    it('should throw when model from database has guestAccess false', async () => {
      appCacheServiceMock.get.mockResolvedValue(null);
      modelRepositoryMock.findOne.mockResolvedValue({
        id: '1',
        name: 'Restricted Model',
        guestAccess: false,
      } as any);

      await expect(
        service.validateGuestAccessById('1', 'guest'),
      ).rejects.toThrow();
    });

    it('should throw NotFoundException when model does not exist', async () => {
      appCacheServiceMock.get.mockResolvedValue(null);
      modelRepositoryMock.findOne.mockResolvedValue(null);

      await expect(
        service.validateGuestAccessById('nonexistent-id', 'guest'),
      ).rejects.toThrow(NotFoundException);
    });
  });
});
