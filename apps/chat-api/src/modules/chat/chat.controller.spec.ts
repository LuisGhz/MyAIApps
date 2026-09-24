import { Test, TestingModule } from '@nestjs/testing';
import { BadRequestException } from '@nestjs/common';
import type { Response } from 'express';
import { ChatController } from './chat.controller';
import {
  ChatService,
  ChatStreamService,
  TranscriptionService,
} from './services';
import { S3Service } from '@s3/services';
import { GuestModelAccessGuard } from '@cmn/guards';
import type { JwtPayload } from '@cmn/interfaces';
import { StreamEventType } from './dto';
import type { ChatStreamEvent } from './dto';

describe('ChatController', () => {
  let controller: ChatController;
  let chatServiceMock: jest.Mocked<ChatService>;
  let chatStreamServiceMock: jest.Mocked<ChatStreamService>;
  let transcriptionServiceMock: jest.Mocked<TranscriptionService>;
  let s3ServiceMock: jest.Mocked<S3Service>;

  const mockUser: JwtPayload = {
    sub: 'user-id-123',
    email: 'test@example.com',
    iat: Math.floor(Date.now() / 1000),
    exp: Math.floor(Date.now() / 1000) + 3600,
    name: 'Test User',
    role: 'user',
  };

  const mockFile: Express.Multer.File = {
    fieldname: 'file',
    originalname: 'test.png',
    encoding: '7bit',
    mimetype: 'image/png',
    size: 1024,
    destination: '/tmp',
    filename: 'test.png',
    path: '/tmp/test.png',
    buffer: Buffer.from('test-data'),
    stream: undefined as any,
  };

  const mockAudioFile: Express.Multer.File = {
    fieldname: 'audio',
    originalname: 'test.mp3',
    encoding: '7bit',
    mimetype: 'audio/mpeg',
    size: 2048,
    destination: '/tmp',
    filename: 'test.mp3',
    path: '/tmp/test.mp3',
    buffer: Buffer.from('audio-data'),
    stream: undefined as any,
  };

  const mockChat = {
    id: 'chat-id-123',
    title: 'Test Chat',
    messages: [],
    maxTokens: 4096,
    temperature: 1.0,
    model: 'gpt-4',
    isImageGeneration: false,
    isWebSearch: false,
  } as any;

  const mockChatMessages = {
    messages: [
      {
        id: 'msg-1',
        content: 'Hello',
        role: 'user',
        createdAt: new Date(),
      },
    ],
    hasMore: false,
    maxTokens: 4096,
    temperature: 1.0,
    isWebSearch: false,
    isImageGeneration: false,
  };

  const mockTranscriptionResponse = {
    text: 'Transcribed text from audio',
  };

  beforeEach(async () => {
    chatServiceMock = {
      getUserChats: jest.fn(),
      getChatMessages: jest.fn(),
      findChatByIdOrFail: jest.fn(),
      updateChatTitle: jest.fn(),
      updateAIFeatures: jest.fn(),
      updateChatMaxTokens: jest.fn(),
      updateChatTemperature: jest.fn(),
      deleteChat: jest.fn(),
    } as Partial<jest.Mocked<ChatService>> as jest.Mocked<ChatService>;

    chatStreamServiceMock = {
      handleStreamMessage: jest.fn(),
    } as Partial<
      jest.Mocked<ChatStreamService>
    > as jest.Mocked<ChatStreamService>;

    transcriptionServiceMock = {
      transcribeAudio: jest.fn(),
    } as Partial<
      jest.Mocked<TranscriptionService>
    > as jest.Mocked<TranscriptionService>;

    s3ServiceMock = {
      uploadFile: jest.fn(),
    } as Partial<jest.Mocked<S3Service>> as jest.Mocked<S3Service>;

    const module: TestingModule = await Test.createTestingModule({
      controllers: [ChatController],
      providers: [
        {
          provide: ChatService,
          useValue: chatServiceMock,
        },
        {
          provide: ChatStreamService,
          useValue: chatStreamServiceMock,
        },
        {
          provide: TranscriptionService,
          useValue: transcriptionServiceMock,
        },
        {
          provide: S3Service,
          useValue: s3ServiceMock,
        },
      ],
    })
      .overrideGuard(GuestModelAccessGuard)
      .useValue({ canActivate: () => true })
      .compile();

    controller = module.get<ChatController>(ChatController);
  });

  afterEach(() => {
    jest.clearAllMocks();
  });

  describe('getUserChats', () => {
    it('should return user chats', async () => {
      chatServiceMock.getUserChats.mockResolvedValue([mockChat]);

      const result = await controller.getUserChats(mockUser);

      expect(result).toEqual([mockChat]);
      expect(chatServiceMock.getUserChats).toHaveBeenCalledWith(mockUser.sub);
      expect(chatServiceMock.getUserChats).toHaveBeenCalledTimes(1);
    });

    it('should return empty array when user has no chats', async () => {
      chatServiceMock.getUserChats.mockResolvedValue([]);

      const result = await controller.getUserChats(mockUser);

      expect(result).toEqual([]);
      expect(chatServiceMock.getUserChats).toHaveBeenCalledWith(mockUser.sub);
    });

    it('should propagate service error when getting chats fails', async () => {
      const serviceError = new Error('Database connection failed');
      chatServiceMock.getUserChats.mockRejectedValue(serviceError);

      await expect(controller.getUserChats(mockUser)).rejects.toThrow(
        'Database connection failed',
      );

      expect(chatServiceMock.getUserChats).toHaveBeenCalledWith(mockUser.sub);
    });
  });

  describe('getChatMessages', () => {
    it('should return chat messages with pagination', async () => {
      chatServiceMock.getChatMessages.mockResolvedValue(mockChatMessages);

      const result = await controller.getChatMessages(
        mockChat.id,
        { beforeMessageId: undefined },
        mockUser,
      );

      expect(result).toEqual(mockChatMessages);
      expect(chatServiceMock.getChatMessages).toHaveBeenCalledWith(
        mockChat.id,
        mockUser.sub,
        undefined,
      );
      expect(chatServiceMock.getChatMessages).toHaveBeenCalledTimes(1);
    });

    it('should return chat messages before a specific message', async () => {
      const beforeMessageId = 'msg-2';
      chatServiceMock.getChatMessages.mockResolvedValue(mockChatMessages);

      const result = await controller.getChatMessages(
        mockChat.id,
        { beforeMessageId },
        mockUser,
      );

      expect(result).toEqual(mockChatMessages);
      expect(chatServiceMock.getChatMessages).toHaveBeenCalledWith(
        mockChat.id,
        mockUser.sub,
        beforeMessageId,
      );
    });

    it('should handle non-existent chat', async () => {
      const nonExistentChatId = 'non-existent-id';
      const notFoundError = new Error('Chat not found');
      chatServiceMock.getChatMessages.mockRejectedValue(notFoundError);

      await expect(
        controller.getChatMessages(
          nonExistentChatId,
          { beforeMessageId: undefined },
          mockUser,
        ),
      ).rejects.toThrow('Chat not found');

      expect(chatServiceMock.getChatMessages).toHaveBeenCalledWith(
        nonExistentChatId,
        mockUser.sub,
        undefined,
      );
    });

    it('should handle service error during message retrieval', async () => {
      const dbError = new Error('Database connection lost');
      chatServiceMock.getChatMessages.mockRejectedValue(dbError);

      await expect(
        controller.getChatMessages(
          mockChat.id,
          { beforeMessageId: undefined },
          mockUser,
        ),
      ).rejects.toThrow('Database connection lost');
    });
  });

  describe('renameChat', () => {
    it('should rename chat successfully', async () => {
      const newTitle = 'Updated Chat Title';
      chatServiceMock.findChatByIdOrFail.mockResolvedValue(mockChat);
      chatServiceMock.updateChatTitle.mockResolvedValue(undefined);

      await controller.renameChat(mockChat.id, { title: newTitle }, mockUser);

      expect(chatServiceMock.findChatByIdOrFail).toHaveBeenCalledWith(
        mockChat.id,
        mockUser.sub,
      );
      expect(chatServiceMock.updateChatTitle).toHaveBeenCalledWith(
        mockChat.id,
        newTitle,
      );
      expect(chatServiceMock.findChatByIdOrFail).toHaveBeenCalledTimes(1);
      expect(chatServiceMock.updateChatTitle).toHaveBeenCalledTimes(1);
    });

    it('should fail when chat does not exist', async () => {
      const newTitle = 'Updated Title';
      const notFoundError = new Error('Chat not found');
      chatServiceMock.findChatByIdOrFail.mockRejectedValue(notFoundError);

      await expect(
        controller.renameChat('non-existent-id', { title: newTitle }, mockUser),
      ).rejects.toThrow('Chat not found');

      expect(chatServiceMock.updateChatTitle).not.toHaveBeenCalled();
    });

    it('should handle update failure after chat validation', async () => {
      const newTitle = 'Updated Title';
      const updateError = new Error('Title update failed');
      chatServiceMock.findChatByIdOrFail.mockResolvedValue(mockChat);
      chatServiceMock.updateChatTitle.mockRejectedValue(updateError);

      await expect(
        controller.renameChat(mockChat.id, { title: newTitle }, mockUser),
      ).rejects.toThrow('Title update failed');

      expect(chatServiceMock.findChatByIdOrFail).toHaveBeenCalledTimes(1);
      expect(chatServiceMock.updateChatTitle).toHaveBeenCalledTimes(1);
    });
  });

  describe('updateAIFeatures', () => {
    it('should update AI features successfully', async () => {
      const updateDto = {
        isImageGeneration: true,
        isWebSearch: false,
      };
      chatServiceMock.findChatByIdOrFail.mockResolvedValue(mockChat);
      chatServiceMock.updateAIFeatures.mockResolvedValue(undefined);

      await controller.updateAIFeatures(mockChat.id, updateDto, mockUser);

      expect(chatServiceMock.findChatByIdOrFail).toHaveBeenCalledWith(
        mockChat.id,
        mockUser.sub,
      );
      expect(chatServiceMock.updateAIFeatures).toHaveBeenCalledWith(
        mockChat.id,
        updateDto,
      );
      expect(chatServiceMock.findChatByIdOrFail).toHaveBeenCalledTimes(1);
      expect(chatServiceMock.updateAIFeatures).toHaveBeenCalledTimes(1);
    });

    it('should fail when chat does not exist', async () => {
      const updateDto = {
        isImageGeneration: true,
        isWebSearch: false,
      };
      const notFoundError = new Error('Chat not found');
      chatServiceMock.findChatByIdOrFail.mockRejectedValue(notFoundError);

      await expect(
        controller.updateAIFeatures('non-existent-id', updateDto, mockUser),
      ).rejects.toThrow('Chat not found');

      expect(chatServiceMock.updateAIFeatures).not.toHaveBeenCalled();
    });

    it('should handle update failure when enabling both features', async () => {
      const updateDto = {
        isImageGeneration: true,
        isWebSearch: true,
      };
      const updateError = new Error('Failed to update features');
      chatServiceMock.findChatByIdOrFail.mockResolvedValue(mockChat);
      chatServiceMock.updateAIFeatures.mockRejectedValue(updateError);

      await expect(
        controller.updateAIFeatures(mockChat.id, updateDto, mockUser),
      ).rejects.toThrow('Failed to update features');
    });
  });

  describe('updateMaxTokens', () => {
    it('should update max tokens successfully', async () => {
      const maxTokens = 2048;
      chatServiceMock.findChatByIdOrFail.mockResolvedValue(mockChat);
      chatServiceMock.updateChatMaxTokens.mockResolvedValue(undefined);

      await controller.updateMaxTokens(mockChat.id, { maxTokens }, mockUser);

      expect(chatServiceMock.findChatByIdOrFail).toHaveBeenCalledWith(
        mockChat.id,
        mockUser.sub,
      );
      expect(chatServiceMock.updateChatMaxTokens).toHaveBeenCalledWith(
        mockChat.id,
        maxTokens,
      );
      expect(chatServiceMock.findChatByIdOrFail).toHaveBeenCalledTimes(1);
      expect(chatServiceMock.updateChatMaxTokens).toHaveBeenCalledTimes(1);
    });

    it('should fail when chat does not exist', async () => {
      const maxTokens = 2048;
      const notFoundError = new Error('Chat not found');
      chatServiceMock.findChatByIdOrFail.mockRejectedValue(notFoundError);

      await expect(
        controller.updateMaxTokens('non-existent-id', { maxTokens }, mockUser),
      ).rejects.toThrow('Chat not found');

      expect(chatServiceMock.updateChatMaxTokens).not.toHaveBeenCalled();
    });

    it('should handle update failure with boundary max token value', async () => {
      const maxTokens = 128000;
      const updateError = new Error('Max tokens exceeds limit');
      chatServiceMock.findChatByIdOrFail.mockResolvedValue(mockChat);
      chatServiceMock.updateChatMaxTokens.mockRejectedValue(updateError);

      await expect(
        controller.updateMaxTokens(mockChat.id, { maxTokens }, mockUser),
      ).rejects.toThrow('Max tokens exceeds limit');
    });
  });

  describe('updateTemperature', () => {
    it('should update temperature successfully', async () => {
      const temperature = 0.7;
      chatServiceMock.findChatByIdOrFail.mockResolvedValue(mockChat);
      chatServiceMock.updateChatTemperature.mockResolvedValue(undefined);

      await controller.updateTemperature(
        mockChat.id,
        { temperature },
        mockUser,
      );

      expect(chatServiceMock.findChatByIdOrFail).toHaveBeenCalledWith(
        mockChat.id,
        mockUser.sub,
      );
      expect(chatServiceMock.updateChatTemperature).toHaveBeenCalledWith(
        mockChat.id,
        temperature,
      );
      expect(chatServiceMock.findChatByIdOrFail).toHaveBeenCalledTimes(1);
      expect(chatServiceMock.updateChatTemperature).toHaveBeenCalledTimes(1);
    });

    it('should fail when chat does not exist', async () => {
      const temperature = 0.5;
      const notFoundError = new Error('Chat not found');
      chatServiceMock.findChatByIdOrFail.mockRejectedValue(notFoundError);

      await expect(
        controller.updateTemperature(
          'non-existent-id',
          { temperature },
          mockUser,
        ),
      ).rejects.toThrow('Chat not found');

      expect(chatServiceMock.updateChatTemperature).not.toHaveBeenCalled();
    });

    it('should handle update failure with boundary temperature values', async () => {
      const temperature = 2.0;
      const updateError = new Error('Temperature must be between 0 and 1');
      chatServiceMock.findChatByIdOrFail.mockResolvedValue(mockChat);
      chatServiceMock.updateChatTemperature.mockRejectedValue(updateError);

      await expect(
        controller.updateTemperature(mockChat.id, { temperature }, mockUser),
      ).rejects.toThrow('Temperature must be between 0 and 1');
    });
  });

  describe('deleteChat', () => {
    it('should delete chat successfully', async () => {
      chatServiceMock.deleteChat.mockResolvedValue(undefined);

      await controller.deleteChat(mockChat.id, mockUser);

      expect(chatServiceMock.deleteChat).toHaveBeenCalledWith(
        mockChat.id,
        mockUser.sub,
      );
      expect(chatServiceMock.deleteChat).toHaveBeenCalledTimes(1);
    });

    it('should fail when chat does not exist', async () => {
      const notFoundError = new Error('Chat not found');
      chatServiceMock.deleteChat.mockRejectedValue(notFoundError);

      await expect(
        controller.deleteChat('non-existent-id', mockUser),
      ).rejects.toThrow('Chat not found');

      expect(chatServiceMock.deleteChat).toHaveBeenCalledWith(
        'non-existent-id',
        mockUser.sub,
      );
    });

    it('should handle delete failure due to database error', async () => {
      const dbError = new Error('Database transaction failed');
      chatServiceMock.deleteChat.mockRejectedValue(dbError);

      await expect(
        controller.deleteChat(mockChat.id, mockUser),
      ).rejects.toThrow('Database transaction failed');

      expect(chatServiceMock.deleteChat).toHaveBeenCalledWith(
        mockChat.id,
        mockUser.sub,
      );
    });
  });

  describe('transcribeAudio', () => {
    it('should transcribe audio successfully', async () => {
      transcriptionServiceMock.transcribeAudio.mockResolvedValue(
        mockTranscriptionResponse,
      );

      const result = await controller.transcribeAudio(
        mockAudioFile,
        { temperature: 0 },
        mockUser,
      );

      expect(result).toEqual(mockTranscriptionResponse);
      expect(transcriptionServiceMock.transcribeAudio).toHaveBeenCalledWith(
        mockAudioFile,
        0,
      );
      expect(transcriptionServiceMock.transcribeAudio).toHaveBeenCalledTimes(1);
    });

    it('should transcribe audio with different temperature', async () => {
      transcriptionServiceMock.transcribeAudio.mockResolvedValue(
        mockTranscriptionResponse,
      );

      const temperature = 0.5;
      const result = await controller.transcribeAudio(
        mockAudioFile,
        { temperature },
        mockUser,
      );

      expect(result).toEqual(mockTranscriptionResponse);
      expect(transcriptionServiceMock.transcribeAudio).toHaveBeenCalledWith(
        mockAudioFile,
        temperature,
      );
    });

    it('should throw BadRequestException when audio file is missing', async () => {
      await expect(
        controller.transcribeAudio(undefined, { temperature: 0 }, mockUser),
      ).rejects.toThrow(BadRequestException);

      expect(transcriptionServiceMock.transcribeAudio).not.toHaveBeenCalled();
    });

    it('should throw BadRequestException when audio file type is invalid', async () => {
      const invalidAudioFile = {
        ...mockAudioFile,
        mimetype: 'video/mp4',
      };

      await expect(
        controller.transcribeAudio(
          invalidAudioFile,
          { temperature: 0 },
          mockUser,
        ),
      ).rejects.toThrow(BadRequestException);

      expect(transcriptionServiceMock.transcribeAudio).not.toHaveBeenCalled();
    });

    it('should handle transcription service failure', async () => {
      const transcriptionError = new Error('API rate limit exceeded');
      transcriptionServiceMock.transcribeAudio.mockRejectedValue(
        transcriptionError,
      );

      await expect(
        controller.transcribeAudio(mockAudioFile, { temperature: 0 }, mockUser),
      ).rejects.toThrow('API rate limit exceeded');

      expect(transcriptionServiceMock.transcribeAudio).toHaveBeenCalledTimes(1);
    });
  });

  describe('sendMessageOpenAI', () => {
    let mockRes: jest.Mocked<Response>;

    beforeEach(() => {
      mockRes = {
        setHeader: jest.fn(),
        flushHeaders: jest.fn(),
        write: jest.fn(),
        end: jest.fn(),
      } as unknown as jest.Mocked<Response>;
    });

    it('should send message without file successfully', async () => {
      const sendMessageDto = {
        chatId: 'chat-123',
        promptId: 'prompt-123',
        message: 'Test message',
        modelId: '550e8400-e29b-41d4-a716-446655440000',
        maxTokens: 1024,
        temperature: 0.7,
        modelDeveloper: 'openai',
        isImageGeneration: false,
        isWebSearch: false,
      };

      chatStreamServiceMock.handleStreamMessage.mockResolvedValue(undefined);

      await controller.sendMessageOpenAI(
        sendMessageDto,
        undefined,
        mockUser,
        mockRes,
      );

      expect(mockRes.setHeader).toHaveBeenCalledWith(
        'Content-Type',
        'text/event-stream',
      );
      expect(mockRes.setHeader).toHaveBeenCalledWith(
        'Cache-Control',
        'no-cache',
      );
      expect(mockRes.setHeader).toHaveBeenCalledWith(
        'Connection',
        'keep-alive',
      );
      expect(mockRes.flushHeaders).toHaveBeenCalled();
      expect(chatStreamServiceMock.handleStreamMessage).toHaveBeenCalled();
      expect(mockRes.end).toHaveBeenCalled();
    });

    it('should send message with file successfully', async () => {
      const sendMessageDto = {
        chatId: 'chat-123',
        promptId: 'prompt-123',
        message: 'Test message with image',
        modelId: '550e8400-e29b-41d4-a716-446655440000',
        maxTokens: 1024,
        temperature: 0.7,
        modelDeveloper: 'openai',
        isImageGeneration: false,
        isWebSearch: false,
      };

      const fileKey = 's3-key-123';
      s3ServiceMock.uploadFile.mockResolvedValue(fileKey);
      chatStreamServiceMock.handleStreamMessage.mockResolvedValue(undefined);

      await controller.sendMessageOpenAI(
        sendMessageDto,
        mockFile,
        mockUser,
        mockRes,
      );

      expect(s3ServiceMock.uploadFile).toHaveBeenCalledWith(mockFile);
      expect(chatStreamServiceMock.handleStreamMessage).toHaveBeenCalledWith(
        expect.objectContaining({
          fileKey,
          chatId: sendMessageDto.chatId,
          userId: mockUser.sub,
          provider: sendMessageDto.modelDeveloper,
        }),
      );
      expect(mockRes.end).toHaveBeenCalled();
    });

    it('should send message with image generation enabled', async () => {
      const sendMessageDto = {
        chatId: 'chat-123',
        promptId: 'prompt-123',
        message: 'Generate an image',
        modelId: '550e8400-e29b-41d4-a716-446655440000',
        maxTokens: 1024,
        temperature: 0.7,
        modelDeveloper: 'openai',
        isImageGeneration: true,
        isWebSearch: false,
      };

      chatStreamServiceMock.handleStreamMessage.mockResolvedValue(undefined);

      await controller.sendMessageOpenAI(
        sendMessageDto,
        undefined,
        mockUser,
        mockRes,
      );

      expect(chatStreamServiceMock.handleStreamMessage).toHaveBeenCalledWith(
        expect.objectContaining({
          isImageGeneration: true,
        }),
      );
      expect(mockRes.end).toHaveBeenCalled();
    });

    it('should send message with web search enabled', async () => {
      const sendMessageDto = {
        chatId: 'chat-123',
        promptId: 'prompt-123',
        message: 'Search the web',
        modelId: '550e8400-e29b-41d4-a716-446655440000',
        maxTokens: 1024,
        temperature: 0.7,
        modelDeveloper: 'openai',
        isImageGeneration: false,
        isWebSearch: true,
      };

      chatStreamServiceMock.handleStreamMessage.mockResolvedValue(undefined);

      await controller.sendMessageOpenAI(
        sendMessageDto,
        undefined,
        mockUser,
        mockRes,
      );

      expect(chatStreamServiceMock.handleStreamMessage).toHaveBeenCalledWith(
        expect.objectContaining({
          isWebSearch: true,
        }),
      );
      expect(mockRes.end).toHaveBeenCalled();
    });

    it('should handle stream with SSE event callback', async () => {
      const sendMessageDto = {
        chatId: 'chat-123',
        promptId: 'prompt-123',
        message: 'Test message',
        modelId: '550e8400-e29b-41d4-a716-446655440000',
        maxTokens: 1024,
        temperature: 0.7,
        modelDeveloper: 'openai',
        isImageGeneration: false,
        isWebSearch: false,
      };

      let eventCallback: ((event: ChatStreamEvent) => void) | undefined;

      chatStreamServiceMock.handleStreamMessage.mockImplementation(
        async (params) => {
          eventCallback = params.onEvent;
          eventCallback({
            type: StreamEventType.DELTA,
            data: 'test response',
          });
        },
      );

      await controller.sendMessageOpenAI(
        sendMessageDto,
        undefined,
        mockUser,
        mockRes,
      );

      expect(mockRes.write).toHaveBeenCalled();
      expect(mockRes.end).toHaveBeenCalled();
    });

    it('should throw BadRequestException when file is invalid', async () => {
      const sendMessageDto = {
        chatId: 'chat-123',
        promptId: 'prompt-123',
        message: 'Test message',
        modelId: '550e8400-e29b-41d4-a716-446655440000',
        maxTokens: 1024,
        temperature: 0.7,
        modelDeveloper: 'openai',
        isImageGeneration: false,
        isWebSearch: false,
      };

      const invalidFile = {
        ...mockFile,
        mimetype: 'application/pdf',
      };

      await expect(
        controller.sendMessageOpenAI(
          sendMessageDto,
          invalidFile,
          mockUser,
          mockRes,
        ),
      ).rejects.toThrow(BadRequestException);

      expect(s3ServiceMock.uploadFile).not.toHaveBeenCalled();
    });

    it('should handle S3 upload failure', async () => {
      const sendMessageDto = {
        chatId: 'chat-123',
        promptId: 'prompt-123',
        message: 'Test message with image',
        modelId: '550e8400-e29b-41d4-a716-446655440000',
        maxTokens: 1024,
        temperature: 0.7,
        modelDeveloper: 'openai',
        isImageGeneration: false,
        isWebSearch: false,
      };

      const uploadError = new Error('S3 upload failed');
      s3ServiceMock.uploadFile.mockRejectedValue(uploadError);

      await expect(
        controller.sendMessageOpenAI(
          sendMessageDto,
          mockFile,
          mockUser,
          mockRes,
        ),
      ).rejects.toThrow(uploadError);

      expect(chatStreamServiceMock.handleStreamMessage).not.toHaveBeenCalled();
    });

    it('should handle stream service error with error event', async () => {
      const sendMessageDto = {
        chatId: 'chat-123',
        promptId: 'prompt-123',
        message: 'Test message',
        modelId: '550e8400-e29b-41d4-a716-446655440000',
        maxTokens: 1024,
        temperature: 0.7,
        modelDeveloper: 'openai',
        isImageGeneration: false,
        isWebSearch: false,
      };

      const streamError = new Error('Stream processing failed');
      chatStreamServiceMock.handleStreamMessage.mockRejectedValue(streamError);

      await controller.sendMessageOpenAI(
        sendMessageDto,
        undefined,
        mockUser,
        mockRes,
      );

      expect(mockRes.write).toHaveBeenCalledWith(
        expect.stringContaining('STREAM_ERROR'),
      );
      expect(mockRes.end).toHaveBeenCalled();
    });

    it('should handle non-Error exception in stream processing', async () => {
      const sendMessageDto = {
        chatId: 'chat-123',
        promptId: 'prompt-123',
        message: 'Test message',
        modelId: '550e8400-e29b-41d4-a716-446655440000',
        maxTokens: 1024,
        temperature: 0.7,
        modelDeveloper: 'openai',
        isImageGeneration: false,
        isWebSearch: false,
      };

      chatStreamServiceMock.handleStreamMessage.mockRejectedValue(
        'String error',
      );

      await controller.sendMessageOpenAI(
        sendMessageDto,
        undefined,
        mockUser,
        mockRes,
      );

      expect(mockRes.write).toHaveBeenCalledWith(
        expect.stringContaining('An error occurred'),
      );
      expect(mockRes.end).toHaveBeenCalled();
    });
  });
});
