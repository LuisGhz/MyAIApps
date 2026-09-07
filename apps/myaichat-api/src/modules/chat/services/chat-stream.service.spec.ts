import { Test, TestingModule } from '@nestjs/testing';
import { ChatStreamService } from './chat-stream.service';
import { ChatService } from './chat.service';
import { AIProviderRegistry } from './ai-provider-registry.service';
import { ImageUploadService } from '@s3/services';
import { EnvService } from '@cfg/schema/env.service';
import { PromptsService } from '@prompts/services';
import { ModelsService } from '@models/services';
import { Chat, Message, MessageRole } from '../entities';
import { User } from '@usr/entities';
import { Prompt } from '@prompts/entities';
import { StreamEventType } from '../dto';
import type { AIProvider } from '../interfaces';

const chatServiceMock = {
  createChat: jest.fn(),
  findChatByIdOrFail: jest.fn(),
  saveMessage: jest.fn(),
  updateChatTitle: jest.fn(),
};

const aiProviderRegistryMock = {
  getProvider: jest.fn(),
  getAvailableProviders: jest.fn(),
};

const imageUploadServiceMock = {
  uploadBase64Image: jest.fn(),
};

const envServiceMock = {
  cdnDomain: 'https://cdn.example.com/',
  geminiApiKey: 'test-gemini-key',
  openaiApiKey: 'test-openai-key',
};

const promptsServiceMock = {
  findOneForChat: jest.fn(),
};

const modelsServiceMock = {
  findOne: jest.fn(),
};

const mockAIProvider: Partial<AIProvider> = {
  providerName: 'openai',
  streamResponse: jest.fn(),
  generateTitle: jest.fn(),
};

describe('ChatStreamService', () => {
  let service: ChatStreamService;
  let chatServiceInstance: ChatService;
  let aiProviderRegistryInstance: AIProviderRegistry;
  let imageUploadServiceInstance: ImageUploadService;
  let envServiceInstance: EnvService;
  let promptsServiceInstance: PromptsService;
  let modelsServiceInstance: ModelsService;

  beforeEach(async () => {
    jest.clearAllMocks();

    const module: TestingModule = await Test.createTestingModule({
      providers: [
        ChatStreamService,
        {
          provide: ChatService,
          useValue: chatServiceMock,
        },
        {
          provide: AIProviderRegistry,
          useValue: aiProviderRegistryMock,
        },
        {
          provide: ImageUploadService,
          useValue: imageUploadServiceMock,
        },
        {
          provide: EnvService,
          useValue: envServiceMock,
        },
        {
          provide: PromptsService,
          useValue: promptsServiceMock,
        },
        {
          provide: ModelsService,
          useValue: modelsServiceMock,
        },
      ],
    }).compile();

    service = module.get<ChatStreamService>(ChatStreamService);
    chatServiceInstance = module.get<ChatService>(ChatService);
    aiProviderRegistryInstance =
      module.get<AIProviderRegistry>(AIProviderRegistry);
    imageUploadServiceInstance =
      module.get<ImageUploadService>(ImageUploadService);
    envServiceInstance = module.get<EnvService>(EnvService);
    promptsServiceInstance = module.get<PromptsService>(PromptsService);
    modelsServiceInstance = module.get<ModelsService>(ModelsService);

    modelsServiceMock.findOne.mockResolvedValue({
      id: 'default-model',
      value: 'gpt-4',
      supportsTemperature: true,
      isReasoning: false,
      reasoningLevel: undefined,
    });
  });

  it('should be defined', () => {
    expect(service).toBeDefined();
  });

  it('should stream a message with existing chat', async () => {
    const userId = 'user-123';
    const chatId = 'chat-123';
    const message = 'Hello AI';
    const model = 'gpt-4';
    const provider = 'openai';
    const onEvent = jest.fn();

    const existingChat: Chat = {
      id: chatId,
      model,
      maxTokens: 1000,
      temperature: 0.7,
      messages: [],
      isImageGeneration: false,
      isWebSearch: false,
      user: { id: userId } as User,
      createdAt: new Date(),
      updatedAt: new Date(),
    } as Chat;

    chatServiceMock.findChatByIdOrFail.mockResolvedValue(existingChat);
    aiProviderRegistryMock.getProvider.mockReturnValue({
      ...mockAIProvider,
      streamResponse: jest.fn().mockImplementation(async (params, onDelta) => {
        onDelta('Hello ');
        onDelta('there!');
        return { inputTokens: 10, outputTokens: 20 };
      }),
    });

    await service.handleStreamMessage({
      chatId,
      message,
      modelId: '550e8400-e29b-41d4-a716-446655440000',
      maxTokens: 1000,
      temperature: 0.7,
      userId,
      provider,
      isImageGeneration: false,
      isWebSearch: false,
      onEvent,
    });

    expect(aiProviderRegistryMock.getProvider).toHaveBeenCalledWith(provider);
    expect(chatServiceMock.findChatByIdOrFail).toHaveBeenCalledWith(
      chatId,
      userId,
    );
    expect(chatServiceMock.saveMessage).toHaveBeenCalledTimes(2);
    expect(chatServiceMock.saveMessage).toHaveBeenCalledWith({
      chat: existingChat,
      content: message,
      role: MessageRole.USER,
      inputTokens: 10,
      fileKey: undefined,
    });
    expect(chatServiceMock.saveMessage).toHaveBeenCalledWith({
      chat: existingChat,
      content: 'Hello there!',
      role: MessageRole.ASSISTANT,
      outputTokens: 20,
      fileKey: undefined,
    });
    expect(onEvent).toHaveBeenCalledWith({
      type: StreamEventType.DELTA,
      data: 'Hello ',
    });
    expect(onEvent).toHaveBeenCalledWith({
      type: StreamEventType.DELTA,
      data: 'there!',
    });
    expect(onEvent).toHaveBeenCalledWith({
      type: StreamEventType.DONE,
      data: {
        chatId,
        inputTokens: 10,
        outputTokens: 20,
        title: undefined,
        imageUrl: undefined,
      },
    });
  });

  it('should create new chat and generate title when chatId is not provided', async () => {
    const userId = 'user-123';
    const message = 'What is AI?';
    const model = 'gpt-4';
    const provider = 'openai';
    const onEvent = jest.fn();
    const generatedTitle = 'Artificial Intelligence Basics';

    const newChat: Chat = {
      id: 'new-chat-123',
      model,
      maxTokens: 1000,
      temperature: 0.7,
      messages: [],
      isImageGeneration: false,
      isWebSearch: false,
      user: { id: userId } as User,
      createdAt: new Date(),
      updatedAt: new Date(),
    } as Chat;

    chatServiceMock.createChat.mockResolvedValue(newChat);
    const providerInstance = {
      ...mockAIProvider,
      streamResponse: jest.fn().mockImplementation(async (params, onDelta) => {
        onDelta('AI is ');
        onDelta('amazing!');
        return { inputTokens: 15, outputTokens: 25 };
      }),
      generateTitle: jest.fn().mockResolvedValue(generatedTitle),
    };
    aiProviderRegistryMock.getProvider.mockReturnValue(providerInstance);

    await service.handleStreamMessage({
      message,
      modelId: '550e8400-e29b-41d4-a716-446655440000',
      maxTokens: 1000,
      temperature: 0.7,
      userId,
      provider,
      isImageGeneration: false,
      isWebSearch: false,
      onEvent,
    });

    expect(chatServiceMock.createChat).toHaveBeenCalledWith({
      user: { id: userId },
      model,
      maxTokens: 1000,
      temperature: 0.7,
      isImageGeneration: false,
      isWebSearch: false,
      prompt: undefined,
    });
    expect(providerInstance.generateTitle).toHaveBeenCalledWith(
      message,
      'AI is amazing!',
    );
    expect(chatServiceMock.updateChatTitle).toHaveBeenCalledWith(
      newChat.id,
      generatedTitle,
    );
    expect(onEvent).toHaveBeenCalledWith({
      type: StreamEventType.DONE,
      data: {
        chatId: newChat.id,
        inputTokens: 15,
        outputTokens: 25,
        title: generatedTitle,
        imageUrl: undefined,
      },
    });
  });

  it('should handle file attachment with message', async () => {
    const userId = 'user-123';
    const chatId = 'chat-123';
    const message = 'Analyze this file';
    const model = 'gpt-4';
    const provider = 'openai';
    const fileKey = 'files/document.pdf';
    const onEvent = jest.fn();

    const existingChat: Chat = {
      id: chatId,
      model,
      maxTokens: 1000,
      temperature: 0.7,
      messages: [],
      isImageGeneration: false,
      isWebSearch: false,
      user: { id: userId } as User,
      createdAt: new Date(),
      updatedAt: new Date(),
    } as Chat;

    chatServiceMock.findChatByIdOrFail.mockResolvedValue(existingChat);
    aiProviderRegistryMock.getProvider.mockReturnValue({
      ...mockAIProvider,
      streamResponse: jest.fn().mockImplementation(async (params, onDelta) => {
        expect(params.fileKey).toBe(fileKey);
        onDelta('Analysis complete');
        return { inputTokens: 50, outputTokens: 100 };
      }),
    });

    await service.handleStreamMessage({
      chatId,
      message,
      modelId: '550e8400-e29b-41d4-a716-446655440000',
      maxTokens: 1000,
      temperature: 0.7,
      userId,
      provider,
      fileKey,
      isImageGeneration: false,
      isWebSearch: false,
      onEvent,
    });

    expect(chatServiceMock.saveMessage).toHaveBeenCalledWith({
      chat: existingChat,
      content: message,
      role: MessageRole.USER,
      inputTokens: 50,
      fileKey,
    });
    expect(chatServiceMock.saveMessage).toHaveBeenCalledWith({
      chat: existingChat,
      content: 'Analysis complete',
      role: MessageRole.ASSISTANT,
      outputTokens: 100,
      fileKey: undefined,
    });
  });

  it('should handle image generation and upload result', async () => {
    const userId = 'user-123';
    const chatId = 'chat-123';
    const message = 'Generate a sunset image';
    const model = 'dall-e-3';
    const provider = 'openai';
    const imageBase64 = 'base64-encoded-image-data';
    const uploadedImageKey = 'images/generated-123.png';
    const onEvent = jest.fn();

    const existingChat: Chat = {
      id: chatId,
      model,
      maxTokens: 1000,
      temperature: 0.7,
      messages: [],
      isImageGeneration: true,
      isWebSearch: false,
      user: { id: userId } as User,
      createdAt: new Date(),
      updatedAt: new Date(),
    } as Chat;

    chatServiceMock.findChatByIdOrFail.mockResolvedValue(existingChat);
    aiProviderRegistryMock.getProvider.mockReturnValue({
      ...mockAIProvider,
      streamResponse: jest.fn().mockImplementation(async (params, onDelta) => {
        expect(params.isImageGeneration).toBe(true);
        onDelta('Image generated');
        return { inputTokens: 20, outputTokens: 5, imageKey: imageBase64 };
      }),
    });
    imageUploadServiceMock.uploadBase64Image.mockResolvedValue(
      uploadedImageKey,
    );

    await service.handleStreamMessage({
      chatId,
      message,
      modelId: '550e8400-e29b-41d4-a716-446655440000',
      maxTokens: 1000,
      temperature: 0.7,
      userId,
      provider,
      isImageGeneration: true,
      isWebSearch: false,
      onEvent,
    });

    expect(imageUploadServiceMock.uploadBase64Image).toHaveBeenCalledWith(
      imageBase64,
    );
    expect(chatServiceMock.saveMessage).toHaveBeenCalledWith({
      chat: existingChat,
      content: 'Image generated',
      role: MessageRole.ASSISTANT,
      outputTokens: 5,
      fileKey: uploadedImageKey,
    });
    expect(onEvent).toHaveBeenCalledWith({
      type: StreamEventType.DONE,
      data: {
        chatId,
        inputTokens: 20,
        outputTokens: 5,
        title: undefined,
        imageUrl: `${envServiceMock.cdnDomain}${uploadedImageKey}`,
      },
    });
  });

  it('should include prompt messages when chat has a prompt', async () => {
    const userId = 'user-123';
    const chatId = 'chat-123';
    const message = 'Hello';
    const model = 'gpt-4';
    const provider = 'openai';
    const onEvent = jest.fn();

    const prompt: Prompt = {
      id: 'prompt-123',
      messages: [
        { role: 'system', content: 'You are a helpful assistant' },
        { role: 'user', content: 'Always be concise' },
      ],
    } as Prompt;

    const existingChat: Chat = {
      id: chatId,
      model,
      maxTokens: 1000,
      temperature: 0.7,
      messages: [
        { role: MessageRole.USER, content: 'Previous message' } as Message,
      ],
      prompt,
      isImageGeneration: false,
      isWebSearch: false,
      user: { id: userId } as User,
      createdAt: new Date(),
      updatedAt: new Date(),
    } as Chat;

    chatServiceMock.findChatByIdOrFail.mockResolvedValue(existingChat);
    const streamResponseMock = jest
      .fn()
      .mockImplementation(async (params, onDelta) => {
        expect(params.previousMessages).toHaveLength(3);
        expect(params.previousMessages[0].role).toBe('system');
        expect(params.previousMessages[0].content).toBe(
          'You are a helpful assistant',
        );
        onDelta('Response');
        return { inputTokens: 10, outputTokens: 5 };
      });
    aiProviderRegistryMock.getProvider.mockReturnValue({
      ...mockAIProvider,
      streamResponse: streamResponseMock,
    });

    await service.handleStreamMessage({
      chatId,
      message,
      modelId: '550e8400-e29b-41d4-a716-446655440000',
      maxTokens: 1000,
      temperature: 0.7,
      userId,
      provider,
      isImageGeneration: false,
      isWebSearch: false,
      onEvent,
    });

    expect(streamResponseMock).toHaveBeenCalled();
    const callArgs = streamResponseMock.mock.calls[0][0];
    expect(callArgs.previousMessages).toHaveLength(3);
  });

  it('should create new chat with prompt when promptId is provided', async () => {
    const userId = 'user-123';
    const promptId = 'prompt-123';
    const message = 'Test message';
    const model = 'gpt-4';
    const provider = 'openai';
    const onEvent = jest.fn();

    const prompt: Prompt = {
      id: promptId,
      name: 'Test Prompt',
      content: 'Be helpful and concise',
      messages: [],
      user: { id: userId } as User,
      chats: [],
      createdAt: new Date(),
      updatedAt: new Date(),
    } as Prompt;

    const newChat: Chat = {
      id: 'new-chat-456',
      model,
      maxTokens: 1000,
      temperature: 0.7,
      messages: [],
      prompt,
      isImageGeneration: false,
      isWebSearch: false,
      user: { id: userId } as User,
      createdAt: new Date(),
      updatedAt: new Date(),
    } as Chat;

    promptsServiceMock.findOneForChat.mockResolvedValue(prompt);
    chatServiceMock.createChat.mockResolvedValue(newChat);
    aiProviderRegistryMock.getProvider.mockReturnValue({
      ...mockAIProvider,
      streamResponse: jest.fn().mockImplementation(async (params, onDelta) => {
        expect(params.systemPrompt).toBe(prompt.content);
        onDelta('Response');
        return { inputTokens: 10, outputTokens: 5 };
      }),
      generateTitle: jest.fn().mockResolvedValue('New Chat Title'),
    });

    await service.handleStreamMessage({
      promptId,
      message,
      modelId: '550e8400-e29b-41d4-a716-446655440000',
      maxTokens: 1000,
      temperature: 0.7,
      userId,
      provider,
      isImageGeneration: false,
      isWebSearch: false,
      onEvent,
    });

    expect(promptsServiceMock.findOneForChat).toHaveBeenCalledWith(
      promptId,
      userId,
    );
    expect(chatServiceMock.createChat).toHaveBeenCalledWith({
      user: { id: userId },
      model,
      maxTokens: 1000,
      temperature: 0.7,
      isImageGeneration: false,
      isWebSearch: false,
      prompt,
    });
  });

  it('should handle web search enabled chats', async () => {
    const userId = 'user-123';
    const message = 'Search for recent news';
    const model = 'gpt-4';
    const provider = 'openai';
    const onEvent = jest.fn();

    const newChat: Chat = {
      id: 'chat-789',
      model,
      maxTokens: 1000,
      temperature: 0.7,
      messages: [],
      isImageGeneration: false,
      isWebSearch: true,
      user: { id: userId } as User,
      createdAt: new Date(),
      updatedAt: new Date(),
    } as Chat;

    chatServiceMock.createChat.mockResolvedValue(newChat);
    aiProviderRegistryMock.getProvider.mockReturnValue({
      ...mockAIProvider,
      streamResponse: jest.fn().mockImplementation(async (params, onDelta) => {
        expect(params.isWebSearch).toBe(true);
        onDelta('Search results');
        return { inputTokens: 30, outputTokens: 60 };
      }),
      generateTitle: jest.fn().mockResolvedValue('Web Search Results'),
    });

    await service.handleStreamMessage({
      message,
      modelId: '550e8400-e29b-41d4-a716-446655440000',
      maxTokens: 1000,
      temperature: 0.7,
      userId,
      provider,
      isImageGeneration: false,
      isWebSearch: true,
      onEvent,
    });

    expect(chatServiceMock.createChat).toHaveBeenCalledWith({
      user: { id: userId },
      model,
      maxTokens: 1000,
      temperature: 0.7,
      isImageGeneration: false,
      isWebSearch: true,
      prompt: undefined,
    });
  });

  it('should throw error when chat not found or user does not own it', async () => {
    const userId = 'user-123';
    const chatId = 'non-existent-chat';
    const message = 'Hello';
    const model = 'gpt-4';
    const provider = 'openai';
    const onEvent = jest.fn();

    chatServiceMock.findChatByIdOrFail.mockRejectedValue(
      new Error('Chat not found'),
    );

    await expect(
      service.handleStreamMessage({
        chatId,
        message,
        modelId: '550e8400-e29b-41d4-a716-446655440000',
        maxTokens: 1000,
        temperature: 0.7,
        userId,
        provider,
        isImageGeneration: false,
        isWebSearch: false,
        onEvent,
      }),
    ).rejects.toThrow('Chat not found');

    expect(chatServiceMock.findChatByIdOrFail).toHaveBeenCalledWith(
      chatId,
      userId,
    );
    expect(onEvent).not.toHaveBeenCalled();
    expect(chatServiceMock.saveMessage).not.toHaveBeenCalled();
  });

  it('should handle AI provider streaming errors', async () => {
    const userId = 'user-123';
    const chatId = 'chat-123';
    const message = 'Hello';
    const model = 'gpt-4';
    const provider = 'openai';
    const onEvent = jest.fn();

    const existingChat: Chat = {
      id: chatId,
      model,
      maxTokens: 1000,
      temperature: 0.7,
      messages: [],
      isImageGeneration: false,
      isWebSearch: false,
      user: { id: userId } as User,
      createdAt: new Date(),
      updatedAt: new Date(),
    } as Chat;

    chatServiceMock.findChatByIdOrFail.mockResolvedValue(existingChat);
    aiProviderRegistryMock.getProvider.mockReturnValue({
      ...mockAIProvider,
      streamResponse: jest
        .fn()
        .mockRejectedValue(new Error('API rate limit exceeded')),
    });

    await expect(
      service.handleStreamMessage({
        chatId,
        message,
        modelId: '550e8400-e29b-41d4-a716-446655440000',
        maxTokens: 1000,
        temperature: 0.7,
        userId,
        provider,
        isImageGeneration: false,
        isWebSearch: false,
        onEvent,
      }),
    ).rejects.toThrow('API rate limit exceeded');

    expect(chatServiceMock.saveMessage).not.toHaveBeenCalled();
    expect(chatServiceMock.updateChatTitle).not.toHaveBeenCalled();
  });

  it('should handle image upload failures gracefully', async () => {
    const userId = 'user-123';
    const chatId = 'chat-123';
    const message = 'Generate image';
    const model = 'dall-e-3';
    const provider = 'openai';
    const imageBase64 = 'base64-data';
    const onEvent = jest.fn();

    const existingChat: Chat = {
      id: chatId,
      model,
      maxTokens: 1000,
      temperature: 0.7,
      messages: [],
      isImageGeneration: true,
      isWebSearch: false,
      user: { id: userId } as User,
      createdAt: new Date(),
      updatedAt: new Date(),
    } as Chat;

    chatServiceMock.findChatByIdOrFail.mockResolvedValue(existingChat);
    aiProviderRegistryMock.getProvider.mockReturnValue({
      ...mockAIProvider,
      streamResponse: jest.fn().mockImplementation(async (params, onDelta) => {
        onDelta('Image created');
        return { inputTokens: 10, outputTokens: 5, imageKey: imageBase64 };
      }),
    });
    imageUploadServiceMock.uploadBase64Image.mockRejectedValue(
      new Error('S3 upload failed'),
    );

    await expect(
      service.handleStreamMessage({
        chatId,
        message,
        modelId: '550e8400-e29b-41d4-a716-446655440000',
        maxTokens: 1000,
        temperature: 0.7,
        userId,
        provider,
        isImageGeneration: true,
        isWebSearch: false,
        onEvent,
      }),
    ).rejects.toThrow('S3 upload failed');

    expect(imageUploadServiceMock.uploadBase64Image).toHaveBeenCalledWith(
      imageBase64,
    );
  });

  it('should handle title generation failures without breaking the flow', async () => {
    const userId = 'user-123';
    const message = 'Test message';
    const model = 'gpt-4';
    const provider = 'openai';
    const onEvent = jest.fn();

    const newChat: Chat = {
      id: 'new-chat-123',
      model,
      maxTokens: 1000,
      temperature: 0.7,
      messages: [],
      isImageGeneration: false,
      isWebSearch: false,
      user: { id: userId } as User,
      createdAt: new Date(),
      updatedAt: new Date(),
    } as Chat;

    chatServiceMock.createChat.mockResolvedValue(newChat);
    const providerInstance = {
      ...mockAIProvider,
      streamResponse: jest.fn().mockImplementation(async (params, onDelta) => {
        onDelta('Response');
        return { inputTokens: 10, outputTokens: 5 };
      }),
      generateTitle: jest
        .fn()
        .mockRejectedValue(new Error('Title generation failed')),
    };
    aiProviderRegistryMock.getProvider.mockReturnValue(providerInstance);

    await expect(
      service.handleStreamMessage({
        message,
        modelId: '550e8400-e29b-41d4-a716-446655440000',
        maxTokens: 1000,
        temperature: 0.7,
        userId,
        provider,
        isImageGeneration: false,
        isWebSearch: false,
        onEvent,
      }),
    ).rejects.toThrow('Title generation failed');

    expect(providerInstance.generateTitle).toHaveBeenCalledWith(
      message,
      'Response',
    );
    expect(chatServiceMock.updateChatTitle).not.toHaveBeenCalled();
  });

  it('should handle empty message content from AI provider', async () => {
    const userId = 'user-123';
    const chatId = 'chat-123';
    const message = 'Hello';
    const model = 'gpt-4';
    const provider = 'openai';
    const onEvent = jest.fn();

    const existingChat: Chat = {
      id: chatId,
      model,
      maxTokens: 1000,
      temperature: 0.7,
      messages: [],
      isImageGeneration: false,
      isWebSearch: false,
      user: { id: userId } as User,
      createdAt: new Date(),
      updatedAt: new Date(),
    } as Chat;

    chatServiceMock.findChatByIdOrFail.mockResolvedValue(existingChat);
    aiProviderRegistryMock.getProvider.mockReturnValue({
      ...mockAIProvider,
      streamResponse: jest.fn().mockImplementation(async () => {
        return { inputTokens: 5, outputTokens: 0 };
      }),
    });

    await service.handleStreamMessage({
      chatId,
      message,
      modelId: '550e8400-e29b-41d4-a716-446655440000',
      maxTokens: 1000,
      temperature: 0.7,
      userId,
      provider,
      isImageGeneration: false,
      isWebSearch: false,
      onEvent,
    });

    expect(chatServiceMock.saveMessage).toHaveBeenCalledWith({
      chat: existingChat,
      content: message,
      role: MessageRole.USER,
      inputTokens: 5,
      fileKey: undefined,
    });
    expect(chatServiceMock.saveMessage).toHaveBeenCalledWith({
      chat: existingChat,
      content: '',
      role: MessageRole.ASSISTANT,
      outputTokens: 0,
      fileKey: undefined,
    });
    expect(onEvent).toHaveBeenCalledWith({
      type: StreamEventType.DONE,
      data: {
        chatId,
        inputTokens: 5,
        outputTokens: 0,
        title: undefined,
        imageUrl: undefined,
      },
    });
  });

  it('should handle prompt not found when promptId is invalid', async () => {
    const userId = 'user-123';
    const promptId = 'invalid-prompt-id';
    const message = 'Test message';
    const model = 'gpt-4';
    const provider = 'openai';
    const onEvent = jest.fn();

    promptsServiceMock.findOneForChat.mockRejectedValue(
      new Error('Prompt not found'),
    );

    await expect(
      service.handleStreamMessage({
        promptId,
        message,
        modelId: '550e8400-e29b-41d4-a716-446655440000',
        maxTokens: 1000,
        temperature: 0.7,
        userId,
        provider,
        isImageGeneration: false,
        isWebSearch: false,
        onEvent,
      }),
    ).rejects.toThrow('Prompt not found');

    expect(promptsServiceMock.findOneForChat).toHaveBeenCalledWith(
      promptId,
      userId,
    );
    expect(chatServiceMock.createChat).not.toHaveBeenCalled();
  });

  it('should fetch model data and pass to AI provider', async () => {
    const userId = 'user-123';
    const chatId = 'chat-123';
    const message = 'Hello';
    const model = 'gpt-4';
    const provider = 'openai';
    const onEvent = jest.fn();

    const modelData = {
      id: 'model-123',
      value: model,
      supportsTemperature: true,
      isReasoning: false,
      reasoningLevel: undefined,
    };

    const existingChat: Chat = {
      id: chatId,
      model,
      maxTokens: 1000,
      temperature: 0.7,
      messages: [],
      isImageGeneration: false,
      isWebSearch: false,
      user: { id: userId } as User,
      createdAt: new Date(),
      updatedAt: new Date(),
    } as Chat;

    chatServiceMock.findChatByIdOrFail.mockResolvedValue(existingChat);
    modelsServiceMock.findOne.mockResolvedValue(modelData);
    const streamResponseMock = jest
      .fn()
      .mockImplementation(async (params, onDelta) => {
        expect(params.supportsTemperature).toBe(true);
        expect(params.isReasoning).toBe(false);
        expect(params.reasoningLevel).toBeUndefined();
        onDelta('Response');
        return { inputTokens: 10, outputTokens: 5 };
      });
    aiProviderRegistryMock.getProvider.mockReturnValue({
      ...mockAIProvider,
      streamResponse: streamResponseMock,
    });

    await service.handleStreamMessage({
      chatId,
      message,
      modelId: '550e8400-e29b-41d4-a716-446655440000',
      maxTokens: 1000,
      temperature: 0.7,
      userId,
      provider,
      isImageGeneration: false,
      isWebSearch: false,
      onEvent,
    });

    expect(modelsServiceMock.findOne).toHaveBeenCalledWith(
      '550e8400-e29b-41d4-a716-446655440000',
    );
    expect(streamResponseMock).toHaveBeenCalled();
  });

  it('should handle models with reasoning enabled', async () => {
    const userId = 'user-123';
    const chatId = 'chat-123';
    const message = 'Solve this complex problem';
    const model = 'o1';
    const provider = 'openai';
    const onEvent = jest.fn();

    const modelData = {
      id: 'model-456',
      value: model,
      supportsTemperature: false,
      isReasoning: true,
      reasoningLevel: 'high',
    };

    const existingChat: Chat = {
      id: chatId,
      model,
      maxTokens: 2000,
      temperature: 1.0,
      messages: [],
      isImageGeneration: false,
      isWebSearch: false,
      user: { id: userId } as User,
      createdAt: new Date(),
      updatedAt: new Date(),
    } as Chat;

    chatServiceMock.findChatByIdOrFail.mockResolvedValue(existingChat);
    modelsServiceMock.findOne.mockResolvedValue(modelData);
    const streamResponseMock = jest
      .fn()
      .mockImplementation(async (params, onDelta) => {
        expect(params.isReasoning).toBe(true);
        expect(params.reasoningLevel).toBe('high');
        expect(params.supportsTemperature).toBe(false);
        onDelta('Reasoning step 1: ');
        onDelta('Therefore, the answer is...');
        return { inputTokens: 100, outputTokens: 200 };
      });
    aiProviderRegistryMock.getProvider.mockReturnValue({
      ...mockAIProvider,
      streamResponse: streamResponseMock,
    });

    await service.handleStreamMessage({
      chatId,
      message,
      modelId: '550e8400-e29b-41d4-a716-446655440000',
      maxTokens: 2000,
      temperature: 1.0,
      userId,
      provider,
      isImageGeneration: false,
      isWebSearch: false,
      onEvent,
    });

    expect(modelsServiceMock.findOne).toHaveBeenCalledWith(
      '550e8400-e29b-41d4-a716-446655440000',
    );
    expect(streamResponseMock).toHaveBeenCalled();
    const callArgs = streamResponseMock.mock.calls[0][0];
    expect(callArgs.isReasoning).toBe(true);
    expect(callArgs.reasoningLevel).toBe('high');
  });

  it('should handle model not found error', async () => {
    const userId = 'user-123';
    const chatId = 'chat-123';
    const message = 'Hello';
    const model = 'unknown-model';
    const provider = 'openai';
    const onEvent = jest.fn();

    const existingChat: Chat = {
      id: chatId,
      model,
      maxTokens: 1000,
      temperature: 0.7,
      messages: [],
      isImageGeneration: false,
      isWebSearch: false,
      user: { id: userId } as User,
      createdAt: new Date(),
      updatedAt: new Date(),
    } as Chat;

    chatServiceMock.findChatByIdOrFail.mockResolvedValue(existingChat);
    modelsServiceMock.findOne.mockRejectedValue(new Error('Model not found'));

    await expect(
      service.handleStreamMessage({
        chatId,
        message,
        modelId: '550e8400-e29b-41d4-a716-446655440000',
        maxTokens: 1000,
        temperature: 0.7,
        userId,
        provider,
        isImageGeneration: false,
        isWebSearch: false,
        onEvent,
      }),
    ).rejects.toThrow('Model not found');

    expect(modelsServiceMock.findOne).toHaveBeenCalledWith(
      '550e8400-e29b-41d4-a716-446655440000',
    );
    expect(onEvent).not.toHaveBeenCalled();
  });

  it('should pass model temperature support to AI provider', async () => {
    const userId = 'user-123';
    const chatId = 'chat-123';
    const message = 'Creative task';
    const model = 'gpt-4-turbo';
    const provider = 'openai';
    const temperature = 0.9;
    const onEvent = jest.fn();

    const modelData = {
      id: 'model-789',
      value: model,
      supportsTemperature: true,
      isReasoning: false,
      reasoningLevel: undefined,
    };

    const existingChat: Chat = {
      id: chatId,
      model,
      maxTokens: 1000,
      temperature,
      messages: [],
      isImageGeneration: false,
      isWebSearch: false,
      user: { id: userId } as User,
      createdAt: new Date(),
      updatedAt: new Date(),
    } as Chat;

    chatServiceMock.findChatByIdOrFail.mockResolvedValue(existingChat);
    modelsServiceMock.findOne.mockResolvedValue(modelData);
    const streamResponseMock = jest
      .fn()
      .mockImplementation(async (params, onDelta) => {
        expect(params.temperature).toBe(temperature);
        expect(params.supportsTemperature).toBe(true);
        onDelta('Creative response');
        return { inputTokens: 20, outputTokens: 30 };
      });
    aiProviderRegistryMock.getProvider.mockReturnValue({
      ...mockAIProvider,
      streamResponse: streamResponseMock,
    });

    await service.handleStreamMessage({
      chatId,
      message,
      modelId: '550e8400-e29b-41d4-a716-446655440000',
      maxTokens: 1000,
      temperature,
      userId,
      provider,
      isImageGeneration: false,
      isWebSearch: false,
      onEvent,
    });

    expect(streamResponseMock).toHaveBeenCalled();
    const callArgs = streamResponseMock.mock.calls[0][0];
    expect(callArgs.supportsTemperature).toBe(true);
    expect(callArgs.temperature).toBe(temperature);
  });

  it('should handle message saving failures', async () => {
    const userId = 'user-123';
    const chatId = 'chat-123';
    const message = 'Hello';
    const model = 'gpt-4';
    const provider = 'openai';
    const onEvent = jest.fn();

    const existingChat: Chat = {
      id: chatId,
      model,
      maxTokens: 1000,
      temperature: 0.7,
      messages: [],
      isImageGeneration: false,
      isWebSearch: false,
      user: { id: userId } as User,
      createdAt: new Date(),
      updatedAt: new Date(),
    } as Chat;

    chatServiceMock.findChatByIdOrFail.mockResolvedValue(existingChat);
    aiProviderRegistryMock.getProvider.mockReturnValue({
      ...mockAIProvider,
      streamResponse: jest.fn().mockImplementation(async (params, onDelta) => {
        onDelta('Response');
        return { inputTokens: 10, outputTokens: 5 };
      }),
    });
    chatServiceMock.saveMessage.mockRejectedValueOnce(
      new Error('Database connection failed'),
    );

    await expect(
      service.handleStreamMessage({
        chatId,
        message,
        modelId: '550e8400-e29b-41d4-a716-446655440000',
        maxTokens: 1000,
        temperature: 0.7,
        userId,
        provider,
        isImageGeneration: false,
        isWebSearch: false,
        onEvent,
      }),
    ).rejects.toThrow('Database connection failed');

    expect(chatServiceMock.saveMessage).toHaveBeenCalledTimes(1);
    expect(onEvent).toHaveBeenCalledWith({
      type: StreamEventType.DELTA,
      data: 'Response',
    });
  });
});
