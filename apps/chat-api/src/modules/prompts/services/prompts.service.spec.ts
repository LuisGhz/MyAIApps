import { Test, TestingModule } from '@nestjs/testing';
import { getRepositoryToken } from '@nestjs/typeorm';
import { BadRequestException, NotFoundException } from '@nestjs/common';
import { Repository } from 'typeorm';
import { PromptsService } from './prompts.service';
import { Prompt, PromptMessage, PromptMessageRole } from '../entities';
import { Chat } from '@chat/entities';
import { User } from '@usr/entities';
import { CreatePromptReqDto, UpdatePromptReqDto } from '../dto';

const promptRepositoryMock = {
  create: jest.fn(),
  save: jest.fn(),
  find: jest.fn(),
  findOne: jest.fn(),
  remove: jest.fn(),
};

const promptMessageRepositoryMock = {
  create: jest.fn(),
  delete: jest.fn(),
  remove: jest.fn(),
};

const chatRepositoryMock = {
  count: jest.fn(),
};

describe('PromptsService', () => {
  let service: PromptsService;
  let promptRepositoryInstance: Repository<Prompt>;
  let promptMessageRepositoryInstance: Repository<PromptMessage>;
  let chatRepositoryInstance: Repository<Chat>;

  beforeEach(async () => {
    jest.clearAllMocks();

    const module: TestingModule = await Test.createTestingModule({
      providers: [
        PromptsService,
        {
          provide: getRepositoryToken(Prompt),
          useValue: promptRepositoryMock,
        },
        {
          provide: getRepositoryToken(PromptMessage),
          useValue: promptMessageRepositoryMock,
        },
        {
          provide: getRepositoryToken(Chat),
          useValue: chatRepositoryMock,
        },
      ],
    }).compile();

    service = module.get<PromptsService>(PromptsService);
    promptRepositoryInstance = module.get<Repository<Prompt>>(
      getRepositoryToken(Prompt),
    );
    promptMessageRepositoryInstance = module.get<Repository<PromptMessage>>(
      getRepositoryToken(PromptMessage),
    );
    chatRepositoryInstance = module.get<Repository<Chat>>(
      getRepositoryToken(Chat),
    );
  });

  it('should be defined', () => {
    expect(service).toBeDefined();
  });

  describe('create', () => {
    it('should create a prompt without messages', async () => {
      const userId = 'user-id-123';
      const dto: CreatePromptReqDto = {
        name: 'Test Prompt',
        content: 'Test content',
      };

      const createdPrompt = {
        id: 'prompt-id-123',
        name: dto.name,
        content: dto.content,
        user: { id: userId } as User,
        messages: [],
        createdAt: new Date(),
        updatedAt: new Date(),
      };

      promptRepositoryMock.create.mockReturnValue(createdPrompt);
      promptRepositoryMock.save.mockResolvedValue(createdPrompt);

      const result = await service.create(dto, userId);

      expect(promptRepositoryMock.create).toHaveBeenCalledWith({
        name: dto.name,
        content: dto.content,
        user: { id: userId },
        messages: undefined,
      });
      expect(promptRepositoryMock.save).toHaveBeenCalledWith(createdPrompt);
      expect(result).toEqual({
        id: createdPrompt.id,
        name: createdPrompt.name,
        content: createdPrompt.content,
        messages: [],
        createdAt: createdPrompt.createdAt,
        updatedAt: createdPrompt.updatedAt,
      });
    });

    it('should create a prompt with messages', async () => {
      const userId = 'user-id-123';
      const dto: CreatePromptReqDto = {
        name: 'Test Prompt',
        content: 'Test content',
        messages: [
          { role: PromptMessageRole.USER, content: 'Hello' },
          { role: PromptMessageRole.ASSISTANT, content: 'Hi there' },
        ],
      };

      const mockMessages = [
        {
          id: 'msg-1',
          role: PromptMessageRole.USER,
          content: 'Hello',
          createdAt: new Date(),
          updatedAt: new Date(),
        },
        {
          id: 'msg-2',
          role: PromptMessageRole.ASSISTANT,
          content: 'Hi there',
          createdAt: new Date(),
          updatedAt: new Date(),
        },
      ];

      const createdPrompt = {
        id: 'prompt-id-123',
        name: dto.name,
        content: dto.content,
        user: { id: userId } as User,
        messages: mockMessages,
        createdAt: new Date(),
        updatedAt: new Date(),
      };

      promptMessageRepositoryMock.create.mockImplementation((msg) => msg);
      promptRepositoryMock.create.mockReturnValue(createdPrompt);
      promptRepositoryMock.save.mockResolvedValue(createdPrompt);

      const result = await service.create(dto, userId);

      expect(promptMessageRepositoryMock.create).toHaveBeenCalledTimes(2);
      expect(promptRepositoryMock.save).toHaveBeenCalledWith(createdPrompt);
      expect(result.messages).toHaveLength(2);
    });
  });

  describe('findAll', () => {
    it('should return all prompts for a user', async () => {
      const userId = 'user-id-123';
      const mockPrompts = [
        {
          id: 'prompt-1',
          name: 'Prompt 1',
          content: 'Content 1',
          messages: [{ id: 'msg-1' }, { id: 'msg-2' }],
          createdAt: new Date(),
          updatedAt: new Date(),
        },
        {
          id: 'prompt-2',
          name: 'Prompt 2',
          content: 'Content 2',
          messages: [],
          createdAt: new Date(),
          updatedAt: new Date(),
        },
      ];

      promptRepositoryMock.find.mockResolvedValue(mockPrompts);

      const result = await service.findAll(userId);

      expect(promptRepositoryMock.find).toHaveBeenCalledWith({
        where: { user: { id: userId } },
        relations: ['messages'],
        order: { updatedAt: 'DESC' },
      });
      expect(result).toHaveLength(2);
      expect(result[0].messageCount).toBe(2);
      expect(result[1].messageCount).toBe(0);
    });
  });

  describe('findAllSummary', () => {
    it('should return summary of all prompts for a user', async () => {
      const userId = 'user-id-123';
      const mockPrompts = [
        { id: 'prompt-1', name: 'Prompt A' },
        { id: 'prompt-2', name: 'Prompt B' },
      ];

      promptRepositoryMock.find.mockResolvedValue(mockPrompts);

      const result = await service.findAllSummary(userId);

      expect(promptRepositoryMock.find).toHaveBeenCalledWith({
        where: { user: { id: userId } },
        select: ['id', 'name'],
        order: { name: 'ASC' },
      });
      expect(result).toHaveLength(2);
      expect(result[0]).toEqual({ id: 'prompt-1', name: 'Prompt A' });
    });
  });

  describe('findOne', () => {
    it('should return a single prompt by id', async () => {
      const userId = 'user-id-123';
      const promptId = 'prompt-id-123';
      const mockPrompt = {
        id: promptId,
        name: 'Test Prompt',
        content: 'Test content',
        messages: [
          {
            id: 'msg-1',
            role: PromptMessageRole.USER,
            content: 'Hello',
            createdAt: new Date(),
            updatedAt: new Date(),
          },
        ],
        createdAt: new Date(),
        updatedAt: new Date(),
      };

      promptRepositoryMock.findOne.mockResolvedValue(mockPrompt);

      const result = await service.findOne(promptId, userId);

      expect(promptRepositoryMock.findOne).toHaveBeenCalledWith({
        where: { id: promptId, user: { id: userId } },
        relations: ['messages', 'user'],
      });
      expect(result.id).toBe(promptId);
      expect(result.messages).toHaveLength(1);
    });
  });

  describe('findOneForChat', () => {
    it('should return a prompt with messages ordered by createdAt', async () => {
      const userId = 'user-id-123';
      const promptId = 'prompt-id-123';
      const mockPrompt = {
        id: promptId,
        name: 'Test Prompt',
        content: 'Test content',
        messages: [
          { id: 'msg-1', content: 'First', createdAt: new Date('2023-01-01') },
          { id: 'msg-2', content: 'Second', createdAt: new Date('2023-01-02') },
        ],
      };

      promptRepositoryMock.findOne.mockResolvedValue(mockPrompt);

      const result = await service.findOneForChat(promptId, userId);

      expect(promptRepositoryMock.findOne).toHaveBeenCalledWith({
        where: { id: promptId, user: { id: userId } },
        relations: ['messages'],
        order: { messages: { createdAt: 'ASC' } },
      });
      expect(result).toEqual(mockPrompt);
    });
  });

  describe('update', () => {
    it('should update prompt name and content', async () => {
      const userId = 'user-id-123';
      const promptId = 'prompt-id-123';
      const dto: UpdatePromptReqDto = {
        name: 'Updated Name',
        content: 'Updated content',
      };

      const existingPrompt = {
        id: promptId,
        name: 'Old Name',
        content: 'Old content',
        messages: [],
        createdAt: new Date(),
        updatedAt: new Date(),
      };

      const updatedPrompt = {
        ...existingPrompt,
        name: dto.name,
        content: dto.content,
      };

      promptRepositoryMock.findOne.mockResolvedValue(existingPrompt);
      promptRepositoryMock.save.mockResolvedValue(updatedPrompt);

      const result = await service.update(promptId, dto, userId);

      expect(promptRepositoryMock.save).toHaveBeenCalledWith(
        expect.objectContaining({
          name: dto.name,
          content: dto.content,
        }),
      );
      expect(result.name).toBe(dto.name);
      expect(result.content).toBe(dto.content);
    });

    it('should update prompt messages by creating new ones', async () => {
      const userId = 'user-id-123';
      const promptId = 'prompt-id-123';
      const dto: UpdatePromptReqDto = {
        messages: [{ role: PromptMessageRole.USER, content: 'New message' }],
      };

      const existingPrompt = {
        id: promptId,
        name: 'Test Prompt',
        content: 'Test content',
        messages: [],
        createdAt: new Date(),
        updatedAt: new Date(),
      };

      const newMessage = {
        id: 'new-msg-1',
        role: PromptMessageRole.USER,
        content: 'New message',
        createdAt: new Date(),
        updatedAt: new Date(),
      };

      promptRepositoryMock.findOne.mockResolvedValue(existingPrompt);
      promptMessageRepositoryMock.create.mockReturnValue(newMessage);
      promptRepositoryMock.save.mockResolvedValue({
        ...existingPrompt,
        messages: [newMessage],
      });

      const result = await service.update(promptId, dto, userId);

      expect(promptMessageRepositoryMock.create).toHaveBeenCalledWith({
        role: dto.messages?.[0].role,
        content: dto.messages?.[0].content,
        prompt: existingPrompt,
      });
      expect(result.messages).toHaveLength(1);
    });

    it('should update existing messages and delete removed ones', async () => {
      const userId = 'user-id-123';
      const promptId = 'prompt-id-123';
      const dto: UpdatePromptReqDto = {
        messages: [
          { id: 'msg-1', role: PromptMessageRole.USER, content: 'Updated' },
        ],
      };

      const existingPrompt = {
        id: promptId,
        name: 'Test Prompt',
        content: 'Test content',
        messages: [
          { id: 'msg-1', role: PromptMessageRole.USER, content: 'Old' },
          { id: 'msg-2', role: PromptMessageRole.ASSISTANT, content: 'Old 2' },
        ],
        createdAt: new Date(),
        updatedAt: new Date(),
      };

      promptRepositoryMock.findOne.mockResolvedValue(existingPrompt);
      promptRepositoryMock.save.mockResolvedValue(existingPrompt);

      await service.update(promptId, dto, userId);

      expect(promptMessageRepositoryMock.delete).toHaveBeenCalledWith([
        'msg-2',
      ]);
    });
  });

  describe('remove', () => {
    it('should delete a prompt when not used by any chats', async () => {
      const userId = 'user-id-123';
      const promptId = 'prompt-id-123';
      const mockPrompt = {
        id: promptId,
        name: 'Test Prompt',
        content: 'Test content',
        messages: [],
      };

      promptRepositoryMock.findOne.mockResolvedValue(mockPrompt);
      chatRepositoryMock.count.mockResolvedValue(0);
      promptRepositoryMock.remove.mockResolvedValue(mockPrompt);

      await service.remove(promptId, userId);

      expect(chatRepositoryMock.count).toHaveBeenCalledWith({
        where: { prompt: { id: promptId } },
      });
      expect(promptRepositoryMock.remove).toHaveBeenCalledWith(mockPrompt);
    });
  });

  describe('deleteMessage', () => {
    it('should delete a specific message from a prompt', async () => {
      const userId = 'user-id-123';
      const promptId = 'prompt-id-123';
      const messageId = 'msg-id-123';

      const mockMessage = {
        id: messageId,
        role: PromptMessageRole.USER,
        content: 'Test',
      };

      const mockPrompt = {
        id: promptId,
        name: 'Test Prompt',
        content: 'Test content',
        messages: [mockMessage],
      };

      promptRepositoryMock.findOne.mockResolvedValue(mockPrompt);
      promptMessageRepositoryMock.remove.mockResolvedValue(mockMessage);

      await service.deleteMessage(promptId, messageId, userId);

      expect(promptMessageRepositoryMock.remove).toHaveBeenCalledWith(
        mockMessage,
      );
    });
  });

  describe('findOne', () => {
    it('should throw NotFoundException when prompt does not exist', async () => {
      const userId = 'user-id-123';
      const promptId = 'non-existent-id';

      promptRepositoryMock.findOne.mockResolvedValue(null);

      await expect(service.findOne(promptId, userId)).rejects.toThrow(
        NotFoundException,
      );
      await expect(service.findOne(promptId, userId)).rejects.toThrow(
        `Prompt with id ${promptId} not found`,
      );
    });
  });

  describe('findOneForChat', () => {
    it('should throw NotFoundException when prompt does not exist', async () => {
      const userId = 'user-id-123';
      const promptId = 'non-existent-id';

      promptRepositoryMock.findOne.mockResolvedValue(null);

      await expect(service.findOneForChat(promptId, userId)).rejects.toThrow(
        NotFoundException,
      );
      await expect(service.findOneForChat(promptId, userId)).rejects.toThrow(
        `Prompt with id ${promptId} not found`,
      );
    });
  });

  describe('update', () => {
    it('should throw NotFoundException when prompt does not exist', async () => {
      const userId = 'user-id-123';
      const promptId = 'non-existent-id';
      const dto: UpdatePromptReqDto = { name: 'Updated' };

      promptRepositoryMock.findOne.mockResolvedValue(null);

      await expect(service.update(promptId, dto, userId)).rejects.toThrow(
        NotFoundException,
      );
    });

    it('should handle partial updates without affecting other fields', async () => {
      const userId = 'user-id-123';
      const promptId = 'prompt-id-123';
      const dto: UpdatePromptReqDto = { name: 'Updated Name' };

      const existingPrompt = {
        id: promptId,
        name: 'Old Name',
        content: 'Original content',
        messages: [],
        createdAt: new Date(),
        updatedAt: new Date(),
      };

      promptRepositoryMock.findOne.mockResolvedValue(existingPrompt);
      promptRepositoryMock.save.mockResolvedValue({
        ...existingPrompt,
        name: dto.name,
      });

      const result = await service.update(promptId, dto, userId);

      expect(result.name).toBe(dto.name);
      expect(result.content).toBe('Original content');
    });

    it('should handle empty messages array', async () => {
      const userId = 'user-id-123';
      const promptId = 'prompt-id-123';
      const dto: UpdatePromptReqDto = { messages: [] };

      const existingPrompt = {
        id: promptId,
        name: 'Test Prompt',
        content: 'Test content',
        messages: [
          { id: 'msg-1', role: PromptMessageRole.USER, content: 'Old' },
        ],
        createdAt: new Date(),
        updatedAt: new Date(),
      };

      promptRepositoryMock.findOne.mockResolvedValue(existingPrompt);
      promptRepositoryMock.save.mockResolvedValue({
        ...existingPrompt,
        messages: [],
      });

      await service.update(promptId, dto, userId);

      expect(promptMessageRepositoryMock.delete).toHaveBeenCalledWith([
        'msg-1',
      ]);
    });
  });

  describe('remove', () => {
    it('should throw NotFoundException when prompt does not exist', async () => {
      const userId = 'user-id-123';
      const promptId = 'non-existent-id';

      promptRepositoryMock.findOne.mockResolvedValue(null);

      await expect(service.remove(promptId, userId)).rejects.toThrow(
        NotFoundException,
      );
    });

    it('should throw BadRequestException when prompt is used by chats', async () => {
      const userId = 'user-id-123';
      const promptId = 'prompt-id-123';
      const mockPrompt = {
        id: promptId,
        name: 'Test Prompt',
        messages: [],
      };

      promptRepositoryMock.findOne.mockResolvedValue(mockPrompt);
      chatRepositoryMock.count.mockResolvedValue(3);

      await expect(service.remove(promptId, userId)).rejects.toThrow(
        BadRequestException,
      );
      await expect(service.remove(promptId, userId)).rejects.toThrow(
        'Cannot delete prompt. It is currently being used by 3 chat(s).',
      );
    });
  });

  describe('deleteMessage', () => {
    it('should throw NotFoundException when prompt does not exist', async () => {
      const userId = 'user-id-123';
      const promptId = 'non-existent-id';
      const messageId = 'msg-id-123';

      promptRepositoryMock.findOne.mockResolvedValue(null);

      await expect(
        service.deleteMessage(promptId, messageId, userId),
      ).rejects.toThrow(NotFoundException);
    });

    it('should throw NotFoundException when message does not exist in prompt', async () => {
      const userId = 'user-id-123';
      const promptId = 'prompt-id-123';
      const messageId = 'non-existent-msg-id';

      const mockPrompt = {
        id: promptId,
        name: 'Test Prompt',
        content: 'Test content',
        messages: [{ id: 'different-msg-id', content: 'Test' }],
      };

      promptRepositoryMock.findOne.mockResolvedValue(mockPrompt);

      await expect(
        service.deleteMessage(promptId, messageId, userId),
      ).rejects.toThrow(NotFoundException);
      await expect(
        service.deleteMessage(promptId, messageId, userId),
      ).rejects.toThrow(
        `Message with id ${messageId} not found in prompt ${promptId}`,
      );
    });
  });

  describe('findAll', () => {
    it('should handle prompts with null messages', async () => {
      const userId = 'user-id-123';
      const mockPrompts = [
        {
          id: 'prompt-1',
          name: 'Prompt 1',
          content: 'Content 1',
          messages: null,
          createdAt: new Date(),
          updatedAt: new Date(),
        },
      ];

      promptRepositoryMock.find.mockResolvedValue(mockPrompts);

      const result = await service.findAll(userId);

      expect(result[0].messageCount).toBe(0);
    });
  });
});
