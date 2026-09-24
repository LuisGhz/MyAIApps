import { Test, TestingModule } from '@nestjs/testing';
import { getRepositoryToken } from '@nestjs/typeorm';
import { Repository } from 'typeorm';
import { NotFoundException, BadRequestException } from '@nestjs/common';
import { ChatService } from './chat.service';
import { Chat, Message, MessageRole } from '../entities';
import { EnvService } from '@cfg/schema/env.service';
import { S3Service } from '@s3/services';
import { User } from '@usr/entities';
import { Prompt } from '@prompts/entities';

const chatRepositoryMock = {
  create: jest.fn(),
  save: jest.fn(),
  findOne: jest.fn(),
  find: jest.fn(),
  update: jest.fn(),
  remove: jest.fn(),
  createQueryBuilder: jest.fn(),
};

const messageRepositoryMock = {
  create: jest.fn(),
  save: jest.fn(),
  findOne: jest.fn(),
  count: jest.fn(),
  createQueryBuilder: jest.fn(),
};

const envServiceMock = {
  cdnDomain: 'https://cdn.example.com/',
  geminiApiKey: 'test-gemini-key',
  openaiApiKey: 'test-openai-key',
};

const s3ServiceMock = {
  deleteFiles: jest.fn(),
  uploadFile: jest.fn(),
  getSignedUrl: jest.fn(),
};

describe('ChatService', () => {
  let service: ChatService;
  let chatRepositoryInstance: Repository<Chat>;
  let messageRepositoryInstance: Repository<Message>;
  let envServiceInstance: EnvService;
  let s3ServiceInstance: S3Service;

  beforeEach(async () => {
    jest.clearAllMocks();

    const module: TestingModule = await Test.createTestingModule({
      providers: [
        ChatService,
        {
          provide: getRepositoryToken(Chat),
          useValue: chatRepositoryMock,
        },
        {
          provide: getRepositoryToken(Message),
          useValue: messageRepositoryMock,
        },
        {
          provide: EnvService,
          useValue: envServiceMock,
        },
        {
          provide: S3Service,
          useValue: s3ServiceMock,
        },
      ],
    }).compile();

    service = module.get<ChatService>(ChatService);
    chatRepositoryInstance = module.get<Repository<Chat>>(
      getRepositoryToken(Chat),
    );
    messageRepositoryInstance = module.get<Repository<Message>>(
      getRepositoryToken(Message),
    );
    envServiceInstance = module.get<EnvService>(EnvService);
    s3ServiceInstance = module.get<S3Service>(S3Service);
  });

  describe('createChat', () => {
    it('should create a chat with required data', async () => {
      const user = { id: 'user-1' } as User;
      const prompt = { id: 'prompt-1' } as Prompt;
      const chatData = {
        user,
        model: 'gpt-4',
        maxTokens: 4096,
        temperature: 0.7,
        prompt,
      };

      const createdChat = {
        id: 'chat-1',
        ...chatData,
        isImageGeneration: false,
        isWebSearch: false,
      } as Chat;

      chatRepositoryMock.create.mockReturnValue(createdChat);
      chatRepositoryMock.save.mockResolvedValue(createdChat);

      const result = await service.createChat(chatData);

      expect(chatRepositoryMock.create).toHaveBeenCalledWith({
        user,
        model: 'gpt-4',
        maxTokens: 4096,
        temperature: 0.7,
        isImageGeneration: false,
        isWebSearch: false,
        prompt,
      });
      expect(chatRepositoryMock.save).toHaveBeenCalledWith(createdChat);
      expect(result).toEqual(createdChat);
    });

    it('should create a chat with isImageGeneration and isWebSearch flags', async () => {
      const user = { id: 'user-1' } as User;
      const chatData = {
        user,
        model: 'gpt-4',
        maxTokens: 4096,
        temperature: 0.7,
        isImageGeneration: true,
        isWebSearch: false,
      };

      const createdChat = { id: 'chat-1', ...chatData } as Chat;

      chatRepositoryMock.create.mockReturnValue(createdChat);
      chatRepositoryMock.save.mockResolvedValue(createdChat);

      await service.createChat(chatData);

      expect(chatRepositoryMock.create).toHaveBeenCalledWith({
        user,
        model: 'gpt-4',
        maxTokens: 4096,
        temperature: 0.7,
        isImageGeneration: true,
        isWebSearch: false,
        prompt: undefined,
      });
    });

    it('should default isImageGeneration and isWebSearch to false', async () => {
      const user = { id: 'user-1' } as User;
      const chatData = {
        user,
        model: 'gpt-4',
        maxTokens: 4096,
        temperature: 0.7,
      };

      const createdChat = {
        id: 'chat-1',
        ...chatData,
        isImageGeneration: false,
        isWebSearch: false,
      } as Chat;

      chatRepositoryMock.create.mockReturnValue(createdChat);
      chatRepositoryMock.save.mockResolvedValue(createdChat);

      await service.createChat(chatData);

      expect(chatRepositoryMock.create).toHaveBeenCalledWith(
        expect.objectContaining({
          isImageGeneration: false,
          isWebSearch: false,
        }),
      );
    });
  });

  describe('findChatById', () => {
    it('should return a chat when found', async () => {
      const chatId = 'chat-1';
      const userId = 'user-1';
      const foundChat = {
        id: chatId,
        user: { id: userId },
        messages: [],
        prompt: null,
      } as unknown as Chat;

      chatRepositoryMock.findOne.mockResolvedValue(foundChat);

      const result = await service.findChatById(chatId, userId);

      expect(chatRepositoryMock.findOne).toHaveBeenCalledWith({
        where: { id: chatId, user: { id: userId } },
        relations: ['user', 'messages', 'prompt', 'prompt.messages'],
        order: {
          messages: { createdAt: 'ASC' },
          prompt: { messages: { createdAt: 'ASC' } },
        },
      });
      expect(result).toEqual(foundChat);
    });

    it('should return null when chat is not found', async () => {
      const chatId = 'chat-1';
      const userId = 'user-1';

      chatRepositoryMock.findOne.mockResolvedValue(null);

      const result = await service.findChatById(chatId, userId);

      expect(result).toBeNull();
    });

    it('should load chat with messages and prompt relationships', async () => {
      const chatId = 'chat-1';
      const userId = 'user-1';
      const message = { id: 'msg-1', role: MessageRole.USER } as Message;
      const prompt = { id: 'prompt-1', messages: [] } as unknown as Prompt;
      const foundChat = {
        id: chatId,
        user: { id: userId },
        messages: [message],
        prompt,
      } as Chat;

      chatRepositoryMock.findOne.mockResolvedValue(foundChat);

      const result = await service.findChatById(chatId, userId);

      expect(result?.messages).toHaveLength(1);
      expect(result?.prompt).toBeDefined();
    });
  });

  describe('findChatByIdOrFail', () => {
    it('should return a chat when found', async () => {
      const chatId = 'chat-1';
      const userId = 'user-1';
      const foundChat = { id: chatId, user: { id: userId } } as Chat;

      chatRepositoryMock.findOne.mockResolvedValue(foundChat);

      const result = await service.findChatByIdOrFail(chatId, userId);

      expect(result).toEqual(foundChat);
    });

    it('should throw NotFoundException when chat is not found', async () => {
      const chatId = 'chat-1';
      const userId = 'user-1';

      chatRepositoryMock.findOne.mockResolvedValue(null);

      await expect(service.findChatByIdOrFail(chatId, userId)).rejects.toThrow(
        NotFoundException,
      );
    });

    it('should throw NotFoundException with correct message', async () => {
      const chatId = 'chat-1';
      const userId = 'user-1';

      chatRepositoryMock.findOne.mockResolvedValue(null);

      await expect(service.findChatByIdOrFail(chatId, userId)).rejects.toThrow(
        `Chat with id ${chatId} not found`,
      );
    });
  });

  describe('saveMessage', () => {
    it('should save a message with all fields', async () => {
      const chat = { id: 'chat-1' } as Chat;
      const messageData = {
        chat,
        content: 'Hello',
        role: MessageRole.USER,
        inputTokens: 10,
        outputTokens: 5,
        fileKey: 'file-123',
      };

      const savedMessage = { id: 'msg-1', ...messageData } as Message;

      messageRepositoryMock.create.mockReturnValue(savedMessage);
      messageRepositoryMock.save.mockResolvedValue(savedMessage);

      const result = await service.saveMessage(messageData);

      expect(messageRepositoryMock.create).toHaveBeenCalledWith(messageData);
      expect(messageRepositoryMock.save).toHaveBeenCalledWith(savedMessage);
      expect(result).toEqual(savedMessage);
    });

    it('should save a message without optional token fields', async () => {
      const chat = { id: 'chat-1' } as Chat;
      const messageData = {
        chat,
        content: 'Hello',
        role: MessageRole.USER,
      };

      const savedMessage = { id: 'msg-1', ...messageData } as Message;

      messageRepositoryMock.create.mockReturnValue(savedMessage);
      messageRepositoryMock.save.mockResolvedValue(savedMessage);

      const result = await service.saveMessage(messageData);

      expect(messageRepositoryMock.create).toHaveBeenCalledWith(
        expect.objectContaining({
          chat,
          content: 'Hello',
          role: MessageRole.USER,
        }),
      );
      expect(result).toBeDefined();
    });

    it('should save a message with ASSISTANT role', async () => {
      const chat = { id: 'chat-1' } as Chat;
      const messageData = {
        chat,
        content: 'Response',
        role: MessageRole.ASSISTANT,
      };

      const savedMessage = { id: 'msg-1', ...messageData } as Message;

      messageRepositoryMock.create.mockReturnValue(savedMessage);
      messageRepositoryMock.save.mockResolvedValue(savedMessage);

      await service.saveMessage(messageData);

      expect(messageRepositoryMock.create).toHaveBeenCalledWith(
        expect.objectContaining({
          role: MessageRole.ASSISTANT,
        }),
      );
    });
  });

  describe('updateChatTitle', () => {
    it('should update chat title', async () => {
      const chatId = 'chat-1';
      const title = 'New Title';

      chatRepositoryMock.update.mockResolvedValue({ affected: 1 });

      await service.updateChatTitle(chatId, title);

      expect(chatRepositoryMock.update).toHaveBeenCalledWith(chatId, { title });
    });

    it('should handle empty title', async () => {
      const chatId = 'chat-1';
      const title = '';

      chatRepositoryMock.update.mockResolvedValue({ affected: 1 });

      await service.updateChatTitle(chatId, title);

      expect(chatRepositoryMock.update).toHaveBeenCalledWith(chatId, {
        title: '',
      });
    });
  });

  describe('updateAIFeatures', () => {
    it('should update isImageGeneration flag', async () => {
      const chatId = 'chat-1';
      const dto = { isImageGeneration: true, isWebSearch: false };

      chatRepositoryMock.update.mockResolvedValue({ affected: 1 });

      await service.updateAIFeatures(chatId, dto);

      expect(chatRepositoryMock.update).toHaveBeenCalledWith(chatId, {
        isImageGeneration: true,
        isWebSearch: false,
      });
    });

    it('should update isWebSearch flag', async () => {
      const chatId = 'chat-1';
      const dto = { isImageGeneration: false, isWebSearch: true };

      chatRepositoryMock.update.mockResolvedValue({ affected: 1 });

      await service.updateAIFeatures(chatId, dto);

      expect(chatRepositoryMock.update).toHaveBeenCalledWith(chatId, {
        isImageGeneration: false,
        isWebSearch: true,
      });
    });

    it('should update both flags to false', async () => {
      const chatId = 'chat-1';
      const dto = { isImageGeneration: false, isWebSearch: false };

      chatRepositoryMock.update.mockResolvedValue({ affected: 1 });

      await service.updateAIFeatures(chatId, dto);

      expect(chatRepositoryMock.update).toHaveBeenCalledWith(chatId, {
        isImageGeneration: false,
        isWebSearch: false,
      });
    });

    it('should throw BadRequestException when both flags are true', async () => {
      const chatId = 'chat-1';
      const dto = { isImageGeneration: true, isWebSearch: true };

      await expect(service.updateAIFeatures(chatId, dto)).rejects.toThrow(
        BadRequestException,
      );
    });

    it('should throw BadRequestException with correct message', async () => {
      const chatId = 'chat-1';
      const dto = { isImageGeneration: true, isWebSearch: true };

      await expect(service.updateAIFeatures(chatId, dto)).rejects.toThrow(
        'Cannot enable both web search and image generation at the same time',
      );
    });
  });

  describe('updateChatMaxTokens', () => {
    it('should update chat maxTokens', async () => {
      const chatId = 'chat-1';
      const maxTokens = 8192;

      chatRepositoryMock.update.mockResolvedValue({ affected: 1 });

      await service.updateChatMaxTokens(chatId, maxTokens);

      expect(chatRepositoryMock.update).toHaveBeenCalledWith(chatId, {
        maxTokens,
      });
    });

    it('should handle minimum token value', async () => {
      const chatId = 'chat-1';
      const maxTokens = 100;

      chatRepositoryMock.update.mockResolvedValue({ affected: 1 });

      await service.updateChatMaxTokens(chatId, maxTokens);

      expect(chatRepositoryMock.update).toHaveBeenCalledWith(chatId, {
        maxTokens: 100,
      });
    });

    it('should handle large token value', async () => {
      const chatId = 'chat-1';
      const maxTokens = 128000;

      chatRepositoryMock.update.mockResolvedValue({ affected: 1 });

      await service.updateChatMaxTokens(chatId, maxTokens);

      expect(chatRepositoryMock.update).toHaveBeenCalledWith(chatId, {
        maxTokens: 128000,
      });
    });
  });

  describe('updateChatTemperature', () => {
    it('should update chat temperature', async () => {
      const chatId = 'chat-1';
      const temperature = 0.5;

      chatRepositoryMock.update.mockResolvedValue({ affected: 1 });

      await service.updateChatTemperature(chatId, temperature);

      expect(chatRepositoryMock.update).toHaveBeenCalledWith(chatId, {
        temperature,
      });
    });

    it('should handle minimum temperature value', async () => {
      const chatId = 'chat-1';
      const temperature = 0;

      chatRepositoryMock.update.mockResolvedValue({ affected: 1 });

      await service.updateChatTemperature(chatId, temperature);

      expect(chatRepositoryMock.update).toHaveBeenCalledWith(chatId, {
        temperature: 0,
      });
    });

    it('should handle maximum temperature value', async () => {
      const chatId = 'chat-1';
      const temperature = 2;

      chatRepositoryMock.update.mockResolvedValue({ affected: 1 });

      await service.updateChatTemperature(chatId, temperature);

      expect(chatRepositoryMock.update).toHaveBeenCalledWith(chatId, {
        temperature: 2,
      });
    });
  });

  describe('getChatMessages', () => {
    it('should return chat messages with pagination', async () => {
      const chatId = 'chat-1';
      const userId = 'user-1';
      const message = {
        id: 'msg-1',
        content: 'Hello',
        role: MessageRole.USER,
        createdAt: new Date('2025-01-01'),
        inputTokens: 10,
        outputTokens: null,
        fileKey: null,
      };

      const chat = {
        id: chatId,
        maxTokens: 4096,
        temperature: 0.7,
        isImageGeneration: false,
        isWebSearch: false,
      } as Chat;

      chatRepositoryMock.findOne.mockResolvedValue(chat);
      messageRepositoryMock.createQueryBuilder.mockReturnValue({
        where: jest.fn().mockReturnThis(),
        select: jest.fn().mockReturnThis(),
        orderBy: jest.fn().mockReturnThis(),
        take: jest.fn().mockReturnThis(),
        andWhere: jest.fn().mockReturnThis(),
        getMany: jest.fn().mockResolvedValue([message]),
      });

      const result = await service.getChatMessages(chatId, userId);

      expect(chatRepositoryMock.findOne).toHaveBeenCalledWith({
        where: { id: chatId, user: { id: userId } },
        select: [
          'id',
          'maxTokens',
          'temperature',
          'isImageGeneration',
          'isWebSearch',
        ],
      });
      expect(result.messages).toHaveLength(1);
      expect(result.hasMore).toBe(false);
      expect(result.maxTokens).toBe(4096);
      expect(result.temperature).toBe(0.7);
    });

    it('should include file URL when fileKey is present', async () => {
      const chatId = 'chat-1';
      const userId = 'user-1';
      const message = {
        id: 'msg-1',
        content: 'Check this file',
        role: MessageRole.ASSISTANT,
        createdAt: new Date('2025-01-01'),
        inputTokens: null,
        outputTokens: 5,
        fileKey: 'uploads/file.pdf',
      };

      const chat = {
        id: chatId,
        maxTokens: 4096,
        temperature: 0.7,
        isImageGeneration: false,
        isWebSearch: false,
      } as Chat;

      chatRepositoryMock.findOne.mockResolvedValue(chat);
      messageRepositoryMock.createQueryBuilder.mockReturnValue({
        where: jest.fn().mockReturnThis(),
        select: jest.fn().mockReturnThis(),
        orderBy: jest.fn().mockReturnThis(),
        take: jest.fn().mockReturnThis(),
        andWhere: jest.fn().mockReturnThis(),
        getMany: jest.fn().mockResolvedValue([message]),
      });

      const result = await service.getChatMessages(chatId, userId);

      expect(result.messages[0].file).toBe(
        `${envServiceMock.cdnDomain}uploads/file.pdf`,
      );
    });

    it('should handle pagination with beforeMessageId', async () => {
      const chatId = 'chat-1';
      const userId = 'user-1';
      const beforeMessageId = 'msg-0';
      const beforeDate = new Date('2025-01-01');
      const message = {
        id: 'msg-1',
        content: 'Hello',
        role: MessageRole.USER,
        createdAt: new Date('2025-01-02'),
        inputTokens: 10,
        outputTokens: null,
        fileKey: null,
      };

      const chat = {
        id: chatId,
        maxTokens: 4096,
        temperature: 0.7,
        isImageGeneration: false,
        isWebSearch: false,
      } as Chat;

      chatRepositoryMock.findOne.mockResolvedValueOnce(chat);
      messageRepositoryMock.findOne.mockResolvedValue({
        id: beforeMessageId,
        createdAt: beforeDate,
      });

      const queryBuilderMock = {
        where: jest.fn().mockReturnThis(),
        select: jest.fn().mockReturnThis(),
        orderBy: jest.fn().mockReturnThis(),
        take: jest.fn().mockReturnThis(),
        andWhere: jest.fn().mockReturnThis(),
        getMany: jest.fn().mockResolvedValue([message]),
      };

      messageRepositoryMock.createQueryBuilder.mockReturnValue(
        queryBuilderMock,
      );

      await service.getChatMessages(chatId, userId, beforeMessageId);

      expect(messageRepositoryMock.findOne).toHaveBeenCalledWith({
        where: { id: beforeMessageId, chat: { id: chatId } },
        select: ['id', 'createdAt'],
      });
      expect(queryBuilderMock.andWhere).toHaveBeenCalledWith(
        'message.createdAt < :beforeDate',
        { beforeDate },
      );
    });

    it('should indicate hasMore when messages exceed pageSize', async () => {
      const chatId = 'chat-1';
      const userId = 'user-1';
      const messages = Array.from({ length: 21 }, (_, i) => ({
        id: `msg-${i}`,
        content: `Message ${i}`,
        role: MessageRole.USER,
        createdAt: new Date(`2025-01-${String(i + 1).padStart(2, '0')}`),
        inputTokens: 10,
        outputTokens: null,
        fileKey: null,
      }));

      const chat = {
        id: chatId,
        maxTokens: 4096,
        temperature: 0.7,
        isImageGeneration: false,
        isWebSearch: false,
      } as Chat;

      chatRepositoryMock.findOne.mockResolvedValue(chat);
      messageRepositoryMock.createQueryBuilder.mockReturnValue({
        where: jest.fn().mockReturnThis(),
        select: jest.fn().mockReturnThis(),
        orderBy: jest.fn().mockReturnThis(),
        take: jest.fn().mockReturnThis(),
        andWhere: jest.fn().mockReturnThis(),
        getMany: jest.fn().mockResolvedValue(messages),
      });

      const result = await service.getChatMessages(chatId, userId);

      expect(result.hasMore).toBe(true);
      expect(result.messages).toHaveLength(20);
    });

    it('should throw NotFoundException when chat is not found', async () => {
      const chatId = 'chat-1';
      const userId = 'user-1';

      chatRepositoryMock.findOne.mockResolvedValue(null);

      await expect(service.getChatMessages(chatId, userId)).rejects.toThrow(
        NotFoundException,
      );
    });

    it('should return empty messages array when no messages exist', async () => {
      const chatId = 'chat-1';
      const userId = 'user-1';

      const chat = {
        id: chatId,
        maxTokens: 4096,
        temperature: 0.7,
        isImageGeneration: false,
        isWebSearch: false,
      } as Chat;

      chatRepositoryMock.findOne.mockResolvedValue(chat);
      messageRepositoryMock.createQueryBuilder.mockReturnValue({
        where: jest.fn().mockReturnThis(),
        select: jest.fn().mockReturnThis(),
        orderBy: jest.fn().mockReturnThis(),
        take: jest.fn().mockReturnThis(),
        andWhere: jest.fn().mockReturnThis(),
        getMany: jest.fn().mockResolvedValue([]),
      });

      const result = await service.getChatMessages(chatId, userId);

      expect(result.messages).toHaveLength(0);
      expect(result.hasMore).toBe(false);
    });
  });

  describe('getUserChats', () => {
    it('should return user chats ordered by createdAt descending', async () => {
      const userId = 'user-1';
      const chats = [
        {
          id: 'chat-1',
          title: 'Recent Chat',
          createdAt: new Date('2025-01-15'),
        },
        {
          id: 'chat-2',
          title: 'Older Chat',
          createdAt: new Date('2025-01-10'),
        },
      ] as Chat[];

      chatRepositoryMock.find.mockResolvedValue(chats);

      const result = await service.getUserChats(userId);

      expect(chatRepositoryMock.find).toHaveBeenCalledWith({
        where: { user: { id: userId } },
        order: { createdAt: 'DESC' },
        select: ['id', 'title', 'createdAt'],
      });
      expect(result).toEqual(chats);
      expect(result).toHaveLength(2);
    });

    it('should return empty array when user has no chats', async () => {
      const userId = 'user-1';

      chatRepositoryMock.find.mockResolvedValue([]);

      const result = await service.getUserChats(userId);

      expect(result).toEqual([]);
    });

    it('should only select required fields', async () => {
      const userId = 'user-1';
      const chats = [
        {
          id: 'chat-1',
          title: 'Chat 1',
          createdAt: new Date('2025-01-15'),
        },
      ] as Chat[];

      chatRepositoryMock.find.mockResolvedValue(chats);

      await service.getUserChats(userId);

      expect(chatRepositoryMock.find).toHaveBeenCalledWith(
        expect.objectContaining({
          select: ['id', 'title', 'createdAt'],
        }),
      );
    });
  });

  describe('hasMessages', () => {
    it('should return true when messages exist', async () => {
      const chatId = 'chat-1';

      messageRepositoryMock.count.mockResolvedValue(5);

      const result = await service.hasMessages(chatId);

      expect(messageRepositoryMock.count).toHaveBeenCalledWith({
        where: { chat: { id: chatId } },
      });
      expect(result).toBe(true);
    });

    it('should return false when no messages exist', async () => {
      const chatId = 'chat-1';

      messageRepositoryMock.count.mockResolvedValue(0);

      const result = await service.hasMessages(chatId);

      expect(result).toBe(false);
    });
  });

  describe('deleteChat', () => {
    it('should delete chat and its file attachments', async () => {
      const chatId = 'chat-1';
      const userId = 'user-1';
      const messages = [
        { id: 'msg-1', fileKey: 'file-1.pdf' },
        { id: 'msg-2', fileKey: 'file-2.pdf' },
      ] as Message[];

      const chat = {
        id: chatId,
        user: { id: userId },
        messages,
      } as Chat;

      chatRepositoryMock.findOne.mockResolvedValue(chat);
      s3ServiceMock.deleteFiles.mockResolvedValue(undefined);
      chatRepositoryMock.remove.mockResolvedValue(chat);

      await service.deleteChat(chatId, userId);

      expect(s3ServiceMock.deleteFiles).toHaveBeenCalledWith([
        'file-1.pdf',
        'file-2.pdf',
      ]);
      expect(chatRepositoryMock.remove).toHaveBeenCalledWith(chat);
    });

    it('should delete chat without files when no attachments exist', async () => {
      const chatId = 'chat-1';
      const userId = 'user-1';
      const messages = [
        { id: 'msg-1', fileKey: null },
        { id: 'msg-2', fileKey: null },
      ] as unknown as Message[];

      const chat = {
        id: chatId,
        user: { id: userId },
        messages,
      } as Chat;

      chatRepositoryMock.findOne.mockResolvedValue(chat);
      chatRepositoryMock.remove.mockResolvedValue(chat);

      await service.deleteChat(chatId, userId);

      expect(s3ServiceMock.deleteFiles).not.toHaveBeenCalled();
      expect(chatRepositoryMock.remove).toHaveBeenCalledWith(chat);
    });

    it('should only delete files with keys when some messages have attachments', async () => {
      const chatId = 'chat-1';
      const userId = 'user-1';
      const messages = [
        { id: 'msg-1', fileKey: 'file-1.pdf' },
        { id: 'msg-2', fileKey: null },
        { id: 'msg-3', fileKey: 'file-3.pdf' },
      ] as Message[];

      const chat = {
        id: chatId,
        user: { id: userId },
        messages,
      } as Chat;

      chatRepositoryMock.findOne.mockResolvedValue(chat);
      s3ServiceMock.deleteFiles.mockResolvedValue(undefined);
      chatRepositoryMock.remove.mockResolvedValue(chat);

      await service.deleteChat(chatId, userId);

      expect(s3ServiceMock.deleteFiles).toHaveBeenCalledWith([
        'file-1.pdf',
        'file-3.pdf',
      ]);
    });

    it('should throw NotFoundException when chat does not belong to user', async () => {
      const chatId = 'chat-1';
      const userId = 'user-1';

      chatRepositoryMock.findOne.mockResolvedValue(null);

      await expect(service.deleteChat(chatId, userId)).rejects.toThrow(
        NotFoundException,
      );
    });

    it('should not delete chat if file deletion fails', async () => {
      const chatId = 'chat-1';
      const userId = 'user-1';
      const messages = [{ id: 'msg-1', fileKey: 'file-1.pdf' }] as Message[];
      const chat = {
        id: chatId,
        user: { id: userId },
        messages,
      } as Chat;

      chatRepositoryMock.findOne.mockResolvedValue(chat);
      s3ServiceMock.deleteFiles.mockRejectedValue(
        new Error('S3 deletion failed'),
      );

      await expect(service.deleteChat(chatId, userId)).rejects.toThrow();
      expect(chatRepositoryMock.remove).not.toHaveBeenCalled();
    });
  });
});
