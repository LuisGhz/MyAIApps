import { Test, TestingModule } from '@nestjs/testing';
import { ModelsController } from './models.controller';
import { ModelsService } from './services';
import {
  CreateModelReqDto,
  CreateModelResDto,
  UpdateModelReqDto,
  UpdateModelResDto,
  ModelResDto,
  ModelListItemResDto,
  DeveloperListItemResDto,
} from './dto';

const modelsServiceMock = {
  create: jest.fn(),
  findAll: jest.fn(),
  getDevelopers: jest.fn(),
  findByValue: jest.fn(),
  findOne: jest.fn(),
  update: jest.fn(),
  remove: jest.fn(),
};

describe('ModelsController', () => {
  let controller: ModelsController;
  let modelsServiceInstance: ModelsService;

  beforeEach(async () => {
    jest.clearAllMocks();

    const module: TestingModule = await Test.createTestingModule({
      controllers: [ModelsController],
      providers: [
        {
          provide: ModelsService,
          useValue: modelsServiceMock,
        },
      ],
    }).compile();

    controller = module.get<ModelsController>(ModelsController);
    modelsServiceInstance = module.get<ModelsService>(ModelsService);
  });

  it('should be defined', () => {
    expect(controller).toBeDefined();
  });

  describe('create', () => {
    it('should create a new model', async () => {
      const createDto: CreateModelReqDto = {
        name: 'GPT-4',
        shortName: 'gpt-4',
        value: 'gpt-4-turbo',
        link: 'https://openai.com',
        guestAccess: true,
        developerId: 'dev-id-123',
        price: {
          input: 0.01,
          output: 0.03,
        },
        metadata: {
          contextWindow: 128000,
          maxOutputTokens: 4096,
          knowledgeCutoff: '2023-12',
        },
      };

      const expectedResult: CreateModelResDto = {
        id: 'model-id-123',
        name: 'GPT-4',
        shortName: 'gpt-4',
        value: 'gpt-4-turbo',
        link: 'https://openai.com',
        guestAccess: true,
        price: {
          input: 0.01,
          output: 0.03,
        },
        metadata: {
          contextWindow: 128000,
          maxOutputTokens: 4096,
          knowledgeCutoff: '2023-12',
        },
        developer: {
          id: 'dev-id-123',
          name: 'OpenAI',
          link: 'https://openai.com',
          imageUrl: 'https://example.com/openai.png',
        },
        createdAt: new Date(),
        updatedAt: new Date(),
      };

      modelsServiceMock.create.mockResolvedValue(expectedResult);

      const result = await controller.create(createDto);

      expect(result).toEqual(expectedResult);
      expect(modelsServiceInstance.create).toHaveBeenCalledTimes(1);
      expect(modelsServiceInstance.create).toHaveBeenCalledWith(createDto);
    });
  });

  describe('findAll', () => {
    it('should return an array of models', async () => {
      const expectedResult: ModelListItemResDto[] = [
        {
          id: 'model-1',
          name: 'GPT-4',
          shortName: 'gpt-4',
          value: 'gpt-4-turbo',
          guestAccess: true,
          developer: {
            name: 'OpenAI',
            imageUrl: 'https://example.com/openai.png',
          },
        },
        {
          id: 'model-2',
          name: 'Claude 3',
          shortName: 'claude-3',
          value: 'claude-3-opus',
          guestAccess: false,
          developer: {
            name: 'Anthropic',
            imageUrl: 'https://example.com/anthropic.png',
          },
        },
      ];

      modelsServiceMock.findAll.mockResolvedValue(expectedResult);

      const result = await controller.findAll();

      expect(result).toEqual(expectedResult);
      expect(modelsServiceInstance.findAll).toHaveBeenCalledTimes(1);
      expect(modelsServiceInstance.findAll).toHaveBeenCalledWith();
    });
  });

  describe('getDevelopers', () => {
    it('should return an array of developers', async () => {
      const expectedResult: DeveloperListItemResDto[] = [
        {
          id: 'dev-1',
          name: 'OpenAI',
          link: 'https://openai.com',
          imageUrl: 'https://example.com/openai.png',
        },
        {
          id: 'dev-2',
          name: 'Anthropic',
          link: 'https://anthropic.com',
          imageUrl: 'https://example.com/anthropic.png',
        },
      ];

      modelsServiceMock.getDevelopers.mockResolvedValue(expectedResult);

      const result = await controller.getDevelopers();

      expect(result).toEqual(expectedResult);
      expect(modelsServiceInstance.getDevelopers).toHaveBeenCalledTimes(1);
      expect(modelsServiceInstance.getDevelopers).toHaveBeenCalledWith();
    });
  });

  describe('findByValue', () => {
    it('should return a model by value', async () => {
      const value = 'gpt-4-turbo';
      const expectedResult: ModelResDto = {
        id: 'model-id-123',
        name: 'GPT-4',
        shortName: 'gpt-4',
        value: 'gpt-4-turbo',
        link: 'https://openai.com',
        guestAccess: true,
        price: {
          input: 0.01,
          output: 0.03,
        },
        metadata: {
          contextWindow: 128000,
          maxOutputTokens: 4096,
          knowledgeCutoff: '2023-12',
        },
        developer: {
          id: 'dev-id-123',
          name: 'OpenAI',
          link: 'https://openai.com',
          imageUrl: 'https://example.com/openai.png',
        },
        createdAt: new Date(),
        updatedAt: new Date(),
      };

      modelsServiceMock.findByValue.mockResolvedValue(expectedResult);

      const result = await controller.findByValue(value);

      expect(result).toEqual(expectedResult);
      expect(modelsServiceInstance.findByValue).toHaveBeenCalledTimes(1);
      expect(modelsServiceInstance.findByValue).toHaveBeenCalledWith(value);
    });
  });

  describe('findOne', () => {
    it('should return a model by id', async () => {
      const id = 'model-id-123';
      const expectedResult: ModelResDto = {
        id: 'model-id-123',
        name: 'GPT-4',
        shortName: 'gpt-4',
        value: 'gpt-4-turbo',
        link: 'https://openai.com',
        guestAccess: true,
        price: {
          input: 0.01,
          output: 0.03,
        },
        metadata: {
          contextWindow: 128000,
          maxOutputTokens: 4096,
          knowledgeCutoff: '2023-12',
        },
        developer: {
          id: 'dev-id-123',
          name: 'OpenAI',
          link: 'https://openai.com',
          imageUrl: 'https://example.com/openai.png',
        },
        createdAt: new Date(),
        updatedAt: new Date(),
      };

      modelsServiceMock.findOne.mockResolvedValue(expectedResult);

      const result = await controller.findOne(id);

      expect(result).toEqual(expectedResult);
      expect(modelsServiceInstance.findOne).toHaveBeenCalledTimes(1);
      expect(modelsServiceInstance.findOne).toHaveBeenCalledWith(id);
    });
  });

  describe('update', () => {
    it('should update a model', async () => {
      const id = 'model-id-123';
      const updateDto: UpdateModelReqDto = {
        name: 'GPT-4 Updated',
        shortName: 'gpt-4-upd',
        guestAccess: false,
        price: {
          input: 0.02,
          output: 0.04,
        },
      };

      const expectedResult: UpdateModelResDto = {
        id: 'model-id-123',
        name: 'GPT-4 Updated',
        shortName: 'gpt-4-upd',
        value: 'gpt-4-turbo',
        link: 'https://openai.com',
        guestAccess: false,
        price: {
          input: 0.02,
          output: 0.04,
        },
        metadata: {
          contextWindow: 128000,
          maxOutputTokens: 4096,
          knowledgeCutoff: '2023-12',
        },
        developer: {
          id: 'dev-id-123',
          name: 'OpenAI',
          link: 'https://openai.com',
          imageUrl: 'https://example.com/openai.png',
        },
        createdAt: new Date(),
        updatedAt: new Date(),
      };

      modelsServiceMock.update.mockResolvedValue(expectedResult);

      const result = await controller.update(id, updateDto);

      expect(result).toEqual(expectedResult);
      expect(modelsServiceInstance.update).toHaveBeenCalledTimes(1);
      expect(modelsServiceInstance.update).toHaveBeenCalledWith(id, updateDto);
    });
  });

  describe('remove', () => {
    it('should remove a model', async () => {
      const id = 'model-id-123';

      modelsServiceMock.remove.mockResolvedValue(undefined);

      const result = await controller.remove(id);

      expect(result).toBeUndefined();
      expect(modelsServiceInstance.remove).toHaveBeenCalledTimes(1);
      expect(modelsServiceInstance.remove).toHaveBeenCalledWith(id);
    });
  });

  describe('findAll', () => {
    it('should return an empty array when no models exist', async () => {
      modelsServiceMock.findAll.mockResolvedValue([]);

      const result = await controller.findAll();

      expect(result).toEqual([]);
      expect(modelsServiceInstance.findAll).toHaveBeenCalledTimes(1);
    });
  });

  describe('getDevelopers', () => {
    it('should return an empty array when no developers exist', async () => {
      modelsServiceMock.getDevelopers.mockResolvedValue([]);

      const result = await controller.getDevelopers();

      expect(result).toEqual([]);
      expect(modelsServiceInstance.getDevelopers).toHaveBeenCalledTimes(1);
    });
  });

  describe('create', () => {
    it('should handle service errors when creating a model', async () => {
      const createDto: CreateModelReqDto = {
        name: 'GPT-4',
        shortName: 'gpt-4',
        value: 'gpt-4-turbo',
        link: 'https://openai.com',
        guestAccess: true,
        developerId: 'invalid-dev-id',
        price: {
          input: 0.01,
          output: 0.03,
        },
        metadata: {
          contextWindow: 128000,
          maxOutputTokens: 4096,
          knowledgeCutoff: '2023-12',
        },
      };

      modelsServiceMock.create.mockRejectedValue(
        new Error('Developer not found'),
      );

      await expect(controller.create(createDto)).rejects.toThrow(
        'Developer not found',
      );
      expect(modelsServiceInstance.create).toHaveBeenCalledTimes(1);
      expect(modelsServiceInstance.create).toHaveBeenCalledWith(createDto);
    });
  });

  describe('findByValue', () => {
    it('should handle service errors when model value is not found', async () => {
      const value = 'non-existent-model';

      modelsServiceMock.findByValue.mockRejectedValue(
        new Error('Model not found'),
      );

      await expect(controller.findByValue(value)).rejects.toThrow(
        'Model not found',
      );
      expect(modelsServiceInstance.findByValue).toHaveBeenCalledTimes(1);
      expect(modelsServiceInstance.findByValue).toHaveBeenCalledWith(value);
    });
  });

  describe('findOne', () => {
    it('should handle service errors when model id is not found', async () => {
      const id = 'non-existent-id';

      modelsServiceMock.findOne.mockRejectedValue(new Error('Model not found'));

      await expect(controller.findOne(id)).rejects.toThrow('Model not found');
      expect(modelsServiceInstance.findOne).toHaveBeenCalledTimes(1);
      expect(modelsServiceInstance.findOne).toHaveBeenCalledWith(id);
    });
  });

  describe('update', () => {
    it('should handle service errors when updating a non-existent model', async () => {
      const id = 'non-existent-id';
      const updateDto: UpdateModelReqDto = {
        name: 'Updated Name',
      };

      modelsServiceMock.update.mockRejectedValue(new Error('Model not found'));

      await expect(controller.update(id, updateDto)).rejects.toThrow(
        'Model not found',
      );
      expect(modelsServiceInstance.update).toHaveBeenCalledTimes(1);
      expect(modelsServiceInstance.update).toHaveBeenCalledWith(id, updateDto);
    });

    it('should handle service errors when updating with duplicate value', async () => {
      const id = 'model-id-123';
      const updateDto: UpdateModelReqDto = {
        value: 'existing-model-value',
      };

      modelsServiceMock.update.mockRejectedValue(
        new Error('Model with this value already exists'),
      );

      await expect(controller.update(id, updateDto)).rejects.toThrow(
        'Model with this value already exists',
      );
      expect(modelsServiceInstance.update).toHaveBeenCalledTimes(1);
    });
  });

  describe('remove', () => {
    it('should handle service errors when removing a non-existent model', async () => {
      const id = 'non-existent-id';

      modelsServiceMock.remove.mockRejectedValue(new Error('Model not found'));

      await expect(controller.remove(id)).rejects.toThrow('Model not found');
      expect(modelsServiceInstance.remove).toHaveBeenCalledTimes(1);
      expect(modelsServiceInstance.remove).toHaveBeenCalledWith(id);
    });
  });
});
