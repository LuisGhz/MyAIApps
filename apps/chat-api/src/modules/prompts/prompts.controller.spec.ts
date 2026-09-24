import { Test, TestingModule } from '@nestjs/testing';
import { PromptsController } from './prompts.controller';
import { PromptsService } from './services';
import type { JwtPayload } from '@cmn/interfaces';
import {
  CreatePromptReqDto,
  CreatePromptResDto,
  UpdatePromptReqDto,
  UpdatePromptResDto,
  PromptResDto,
  PromptListItemResDto,
  PromptListItemSummaryResDto,
} from './dto';
import { PromptMessageRole } from './entities';

const promptsServiceMock = {
  create: jest.fn(),
  findAll: jest.fn(),
  findAllSummary: jest.fn(),
  findOne: jest.fn(),
  update: jest.fn(),
  remove: jest.fn(),
  deleteMessage: jest.fn(),
};

describe('PromptsController', () => {
  let controller: PromptsController;
  let promptsServiceInstance: PromptsService;

  const mockUser: JwtPayload = {
    sub: 'user-123',
    name: 'testuser',
    email: 'testuser@example.com',
    role: 'user',
    exp: Math.floor(Date.now() / 1000) + 3600,
    iat: Math.floor(Date.now() / 1000),
  };

  const mockPromptId = '550e8400-e29b-41d4-a716-446655440000';
  const mockMessageId = '660e8400-e29b-41d4-a716-446655440001';

  beforeEach(async () => {
    jest.clearAllMocks();

    const module: TestingModule = await Test.createTestingModule({
      controllers: [PromptsController],
      providers: [
        {
          provide: PromptsService,
          useValue: promptsServiceMock,
        },
      ],
    }).compile();

    controller = module.get<PromptsController>(PromptsController);
    promptsServiceInstance = module.get<PromptsService>(PromptsService);
  });

  it('should be defined', () => {
    expect(controller).toBeDefined();
  });

  describe('create', () => {
    it('should create a prompt and return the response', async () => {
      const dto: CreatePromptReqDto = {
        name: 'Test Prompt',
        content: 'Test content',
        messages: [{ role: PromptMessageRole.USER, content: 'Hello' }],
      };
      const expectedResponse: CreatePromptResDto = {
        id: mockPromptId,
        name: 'Test Prompt',
        content: 'Test content',
        messages: [
          { id: mockMessageId, role: PromptMessageRole.USER, content: 'Hello' },
        ],
        createdAt: new Date(),
        updatedAt: new Date(),
      };
      promptsServiceMock.create.mockResolvedValue(expectedResponse);

      const result = await controller.create(dto, mockUser);

      expect(result).toEqual(expectedResponse);
      expect(promptsServiceMock.create).toHaveBeenCalledTimes(1);
      expect(promptsServiceMock.create).toHaveBeenCalledWith(dto, mockUser.sub);
    });
  });

  describe('findAll', () => {
    it('should return all prompts for the user', async () => {
      const expectedResponse: PromptListItemResDto[] = [
        {
          id: mockPromptId,
          name: 'Prompt 1',
          content: 'Content 1',
          messageCount: 3,
          createdAt: new Date(),
          updatedAt: new Date(),
        },
        {
          id: '770e8400-e29b-41d4-a716-446655440002',
          name: 'Prompt 2',
          content: 'Content 2',
          messageCount: 5,
          createdAt: new Date(),
          updatedAt: new Date(),
        },
      ];
      promptsServiceMock.findAll.mockResolvedValue(expectedResponse);

      const result = await controller.findAll(mockUser);

      expect(result).toEqual(expectedResponse);
      expect(promptsServiceMock.findAll).toHaveBeenCalledTimes(1);
      expect(promptsServiceMock.findAll).toHaveBeenCalledWith(mockUser.sub);
    });
  });

  describe('findAllSummary', () => {
    it('should return summary of all prompts for the user', async () => {
      const expectedResponse: PromptListItemSummaryResDto[] = [
        {
          id: mockPromptId,
          name: 'Prompt 1',
        },
        {
          id: '770e8400-e29b-41d4-a716-446655440002',
          name: 'Prompt 2',
        },
      ];
      promptsServiceMock.findAllSummary.mockResolvedValue(expectedResponse);

      const result = await controller.findAllSummary(mockUser);

      expect(result).toEqual(expectedResponse);
      expect(promptsServiceMock.findAllSummary).toHaveBeenCalledTimes(1);
      expect(promptsServiceMock.findAllSummary).toHaveBeenCalledWith(
        mockUser.sub,
      );
    });
  });

  describe('findOne', () => {
    it('should return a single prompt by id', async () => {
      const expectedResponse: PromptResDto = {
        id: mockPromptId,
        name: 'Test Prompt',
        content: 'Test content',
        messages: [
          {
            id: mockMessageId,
            role: PromptMessageRole.USER,
            content: 'Hello',
            createdAt: new Date(),
            updatedAt: new Date(),
          },
          {
            id: '770e8400-e29b-41d4-a716-446655440003',
            role: PromptMessageRole.ASSISTANT,
            content: 'Hi there',
            createdAt: new Date(),
            updatedAt: new Date(),
          },
        ],
        createdAt: new Date(),
        updatedAt: new Date(),
      };
      promptsServiceMock.findOne.mockResolvedValue(expectedResponse);

      const result = await controller.findOne(mockPromptId, mockUser);

      expect(result).toEqual(expectedResponse);
      expect(promptsServiceMock.findOne).toHaveBeenCalledTimes(1);
      expect(promptsServiceMock.findOne).toHaveBeenCalledWith(
        mockPromptId,
        mockUser.sub,
      );
    });
  });

  describe('update', () => {
    it('should update a prompt and return the updated response', async () => {
      const dto: UpdatePromptReqDto = {
        name: 'Updated Prompt',
        content: 'Updated content',
      };
      const expectedResponse: UpdatePromptResDto = {
        id: mockPromptId,
        name: 'Updated Prompt',
        content: 'Updated content',
        messages: [],
        createdAt: new Date(),
        updatedAt: new Date(),
      };
      promptsServiceMock.update.mockResolvedValue(expectedResponse);

      const result = await controller.update(mockPromptId, dto, mockUser);

      expect(result).toEqual(expectedResponse);
      expect(promptsServiceMock.update).toHaveBeenCalledTimes(1);
      expect(promptsServiceMock.update).toHaveBeenCalledWith(
        mockPromptId,
        dto,
        mockUser.sub,
      );
    });
  });

  describe('remove', () => {
    it('should delete a prompt and return void', async () => {
      promptsServiceMock.remove.mockResolvedValue(undefined);

      const result = await controller.remove(mockPromptId, mockUser);

      expect(result).toBeUndefined();
      expect(promptsServiceMock.remove).toHaveBeenCalledTimes(1);
      expect(promptsServiceMock.remove).toHaveBeenCalledWith(
        mockPromptId,
        mockUser.sub,
      );
    });
  });

  describe('deleteMessage', () => {
    it('should delete a message from a prompt and return void', async () => {
      promptsServiceMock.deleteMessage.mockResolvedValue(undefined);

      const result = await controller.deleteMessage(
        mockPromptId,
        mockMessageId,
        mockUser,
      );

      expect(result).toBeUndefined();
      expect(promptsServiceMock.deleteMessage).toHaveBeenCalledTimes(1);
      expect(promptsServiceMock.deleteMessage).toHaveBeenCalledWith(
        mockPromptId,
        mockMessageId,
        mockUser.sub,
      );
    });
  });

  describe('create', () => {
    it('should handle empty messages array', async () => {
      const dto: CreatePromptReqDto = {
        name: 'Prompt without messages',
        content: 'Content only',
        messages: [],
      };
      const expectedResponse: CreatePromptResDto = {
        id: mockPromptId,
        name: 'Prompt without messages',
        content: 'Content only',
        messages: [],
        createdAt: new Date(),
        updatedAt: new Date(),
      };
      promptsServiceMock.create.mockResolvedValue(expectedResponse);

      const result = await controller.create(dto, mockUser);

      expect(result).toEqual(expectedResponse);
      expect(promptsServiceMock.create).toHaveBeenCalledWith(dto, mockUser.sub);
    });

    it('should handle undefined messages', async () => {
      const dto: CreatePromptReqDto = {
        name: 'Prompt without messages',
        content: 'Content only',
      };
      const expectedResponse: CreatePromptResDto = {
        id: mockPromptId,
        name: 'Prompt without messages',
        content: 'Content only',
        messages: [],
        createdAt: new Date(),
        updatedAt: new Date(),
      };
      promptsServiceMock.create.mockResolvedValue(expectedResponse);

      const result = await controller.create(dto, mockUser);

      expect(result).toEqual(expectedResponse);
      expect(promptsServiceMock.create).toHaveBeenCalledWith(dto, mockUser.sub);
    });

    it('should handle service errors when creating prompt', async () => {
      const dto: CreatePromptReqDto = {
        name: 'Test Prompt',
        content: 'Test content',
      };
      const error = new Error('Database error');
      promptsServiceMock.create.mockRejectedValue(error);

      await expect(controller.create(dto, mockUser)).rejects.toThrow(
        'Database error',
      );
      expect(promptsServiceMock.create).toHaveBeenCalledWith(dto, mockUser.sub);
    });
  });

  describe('findAll', () => {
    it('should return empty array when user has no prompts', async () => {
      promptsServiceMock.findAll.mockResolvedValue([]);

      const result = await controller.findAll(mockUser);

      expect(result).toEqual([]);
      expect(promptsServiceMock.findAll).toHaveBeenCalledWith(mockUser.sub);
    });

    it('should handle service errors when fetching prompts', async () => {
      const error = new Error('Database connection failed');
      promptsServiceMock.findAll.mockRejectedValue(error);

      await expect(controller.findAll(mockUser)).rejects.toThrow(
        'Database connection failed',
      );
      expect(promptsServiceMock.findAll).toHaveBeenCalledWith(mockUser.sub);
    });
  });

  describe('findAllSummary', () => {
    it('should return empty array when user has no prompts', async () => {
      promptsServiceMock.findAllSummary.mockResolvedValue([]);

      const result = await controller.findAllSummary(mockUser);

      expect(result).toEqual([]);
      expect(promptsServiceMock.findAllSummary).toHaveBeenCalledWith(
        mockUser.sub,
      );
    });

    it('should handle service errors when fetching summary', async () => {
      const error = new Error('Query timeout');
      promptsServiceMock.findAllSummary.mockRejectedValue(error);

      await expect(controller.findAllSummary(mockUser)).rejects.toThrow(
        'Query timeout',
      );
      expect(promptsServiceMock.findAllSummary).toHaveBeenCalledWith(
        mockUser.sub,
      );
    });
  });

  describe('findOne', () => {
    it('should handle invalid UUID format', async () => {
      const invalidId = 'invalid-uuid';
      const error = new Error('Invalid UUID');
      promptsServiceMock.findOne.mockRejectedValue(error);

      await expect(controller.findOne(invalidId, mockUser)).rejects.toThrow(
        'Invalid UUID',
      );
    });

    it('should handle non-existent prompt', async () => {
      const error = new Error('Prompt not found');
      promptsServiceMock.findOne.mockRejectedValue(error);

      await expect(controller.findOne(mockPromptId, mockUser)).rejects.toThrow(
        'Prompt not found',
      );
      expect(promptsServiceMock.findOne).toHaveBeenCalledWith(
        mockPromptId,
        mockUser.sub,
      );
    });

    it('should handle unauthorized access to prompt', async () => {
      const error = new Error('Unauthorized');
      promptsServiceMock.findOne.mockRejectedValue(error);

      await expect(controller.findOne(mockPromptId, mockUser)).rejects.toThrow(
        'Unauthorized',
      );
      expect(promptsServiceMock.findOne).toHaveBeenCalledWith(
        mockPromptId,
        mockUser.sub,
      );
    });
  });

  describe('update', () => {
    it('should handle partial updates', async () => {
      const dto: UpdatePromptReqDto = {
        name: 'Only name updated',
      };
      const expectedResponse: UpdatePromptResDto = {
        id: mockPromptId,
        name: 'Only name updated',
        content: 'Original content',
        messages: [],
        createdAt: new Date(),
        updatedAt: new Date(),
      };
      promptsServiceMock.update.mockResolvedValue(expectedResponse);

      const result = await controller.update(mockPromptId, dto, mockUser);

      expect(result).toEqual(expectedResponse);
      expect(promptsServiceMock.update).toHaveBeenCalledWith(
        mockPromptId,
        dto,
        mockUser.sub,
      );
    });

    it('should handle update errors', async () => {
      const dto: UpdatePromptReqDto = {
        name: 'Updated',
      };
      const error = new Error('Update failed');
      promptsServiceMock.update.mockRejectedValue(error);

      await expect(
        controller.update(mockPromptId, dto, mockUser),
      ).rejects.toThrow('Update failed');
      expect(promptsServiceMock.update).toHaveBeenCalledWith(
        mockPromptId,
        dto,
        mockUser.sub,
      );
    });

    it('should handle non-existent prompt during update', async () => {
      const dto: UpdatePromptReqDto = {
        name: 'Updated',
      };
      const error = new Error('Prompt not found');
      promptsServiceMock.update.mockRejectedValue(error);

      await expect(
        controller.update(mockPromptId, dto, mockUser),
      ).rejects.toThrow('Prompt not found');
    });
  });

  describe('remove', () => {
    it('should handle non-existent prompt during deletion', async () => {
      const error = new Error('Prompt not found');
      promptsServiceMock.remove.mockRejectedValue(error);

      await expect(controller.remove(mockPromptId, mockUser)).rejects.toThrow(
        'Prompt not found',
      );
      expect(promptsServiceMock.remove).toHaveBeenCalledWith(
        mockPromptId,
        mockUser.sub,
      );
    });

    it('should handle unauthorized deletion attempt', async () => {
      const error = new Error('Unauthorized');
      promptsServiceMock.remove.mockRejectedValue(error);

      await expect(controller.remove(mockPromptId, mockUser)).rejects.toThrow(
        'Unauthorized',
      );
    });

    it('should handle database errors during deletion', async () => {
      const error = new Error('Database constraint violation');
      promptsServiceMock.remove.mockRejectedValue(error);

      await expect(controller.remove(mockPromptId, mockUser)).rejects.toThrow(
        'Database constraint violation',
      );
    });
  });

  describe('deleteMessage', () => {
    it('should handle non-existent message', async () => {
      const error = new Error('Message not found');
      promptsServiceMock.deleteMessage.mockRejectedValue(error);

      await expect(
        controller.deleteMessage(mockPromptId, mockMessageId, mockUser),
      ).rejects.toThrow('Message not found');
      expect(promptsServiceMock.deleteMessage).toHaveBeenCalledWith(
        mockPromptId,
        mockMessageId,
        mockUser.sub,
      );
    });

    it('should handle invalid message UUID', async () => {
      const invalidMessageId = 'invalid-uuid';
      const error = new Error('Invalid UUID');
      promptsServiceMock.deleteMessage.mockRejectedValue(error);

      await expect(
        controller.deleteMessage(mockPromptId, invalidMessageId, mockUser),
      ).rejects.toThrow('Invalid UUID');
    });

    it('should handle deletion of message from non-existent prompt', async () => {
      const error = new Error('Prompt not found');
      promptsServiceMock.deleteMessage.mockRejectedValue(error);

      await expect(
        controller.deleteMessage(mockPromptId, mockMessageId, mockUser),
      ).rejects.toThrow('Prompt not found');
    });
  });
});
