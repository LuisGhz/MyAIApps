import { Test, TestingModule } from '@nestjs/testing';
import { GeminiService } from './gemini.service';
import { EnvService } from '@cfg/schema/env.service';
import { GoogleGenAI } from '@google/genai';
import { StreamResponseParams } from '../interfaces';

jest.mock('@google/genai');
jest.mock('../helpers', () => ({
  messagesTransformerForGemini: jest
    .fn()
    .mockResolvedValue([
      { role: 'user', parts: [{ text: 'previous message' }] },
    ]),
  newMessageTransformerForGemini: jest.fn().mockReturnValue({
    role: 'user',
    parts: [{ text: 'new message' }],
  }),
  setSystemMessageGemini: jest.fn().mockReturnValue({
    role: 'user',
    parts: [{ text: 'system prompt' }],
  }),
  fetchImageAsBase64: jest.fn(),
}));

const envServiceMock = {
  geminiApiKey: 'test-gemini-api-key',
  cdnDomain: 'https://cdn.example.com/',
};

const mockGoogleGenAIClient = {
  models: {
    generateContentStream: jest.fn(),
    generateContent: jest.fn(),
  },
};

describe('GeminiService', () => {
  let service: GeminiService;
  let envServiceInstance: EnvService;

  beforeEach(async () => {
    jest.clearAllMocks();

    (GoogleGenAI as jest.MockedClass<typeof GoogleGenAI>).mockImplementation(
      () => mockGoogleGenAIClient as any,
    );

    const module: TestingModule = await Test.createTestingModule({
      providers: [
        GeminiService,
        {
          provide: EnvService,
          useValue: envServiceMock,
        },
      ],
    }).compile();

    service = module.get<GeminiService>(GeminiService);
    envServiceInstance = module.get<EnvService>(EnvService);
  });

  describe('streamResponse', () => {
    it('should stream response with text delta', async () => {
      const params: StreamResponseParams = {
        previousMessages: [],
        newMessage: 'Hello',
        model: 'gemini-2.0-flash',
        maxTokens: 1024,
        temperature: 0.7,
        supportsTemperature: true,
        fileKey: undefined,
        isImageGeneration: false,
        isWebSearch: false,
      };

      const mockStream = [
        {
          text: 'Hello ',
          usageMetadata: { promptTokenCount: 10, candidatesTokenCount: 0 },
        },
        {
          text: 'world',
          usageMetadata: { promptTokenCount: 10, candidatesTokenCount: 5 },
        },
      ];

      const deltas: string[] = [];
      mockGoogleGenAIClient.models.generateContentStream.mockResolvedValue(
        mockStream,
      );

      const result = await service.streamResponse(params, (delta) => {
        deltas.push(delta);
      });

      expect(result.content).toBe('Hello world');
      expect(result.inputTokens).toBe(10);
      expect(result.outputTokens).toBe(5);
      expect(deltas).toEqual(['Hello ', 'world']);
      expect(
        mockGoogleGenAIClient.models.generateContentStream,
      ).toHaveBeenCalled();
    });

    it('should include web search tool when isWebSearch is true', async () => {
      const params: StreamResponseParams = {
        previousMessages: [],
        newMessage: 'Search something',
        model: 'gemini-2.0-flash',
        maxTokens: 1024,
        temperature: 0.7,
        supportsTemperature: true,
        isImageGeneration: false,
        isWebSearch: true,
      };

      mockGoogleGenAIClient.models.generateContentStream.mockResolvedValue([
        {
          text: 'search result',
          usageMetadata: { promptTokenCount: 5, candidatesTokenCount: 3 },
        },
      ]);

      await service.streamResponse(params, () => {});

      const callArgs =
        mockGoogleGenAIClient.models.generateContentStream.mock.calls[0][0];
      expect(callArgs.config.tools).toContainEqual({ googleSearch: {} });
    });

    it('should use image generation model when isImageGeneration is true', async () => {
      const params: StreamResponseParams = {
        previousMessages: [],
        newMessage: 'Generate image',
        model: 'gemini-2.0-flash',
        maxTokens: 1024,
        temperature: 0.7,
        supportsTemperature: true,
        isImageGeneration: true,
        isWebSearch: false,
      };

      mockGoogleGenAIClient.models.generateContentStream.mockResolvedValue([
        {
          text: '',
          data: 'base64imagedata',
          usageMetadata: { promptTokenCount: 10, candidatesTokenCount: 0 },
        },
      ]);

      const result = await service.streamResponse(params, () => {});

      const callArgs =
        mockGoogleGenAIClient.models.generateContentStream.mock.calls[0][0];
      expect(callArgs.model).toBe('gemini-2.5-flash-image');
      expect(result.imageKey).toBe('base64imagedata');
    });

    it('should handle system prompt parameter', async () => {
      const params: StreamResponseParams = {
        previousMessages: [],
        newMessage: 'Test message',
        model: 'gemini-2.0-flash',
        maxTokens: 1024,
        temperature: 0.7,
        supportsTemperature: true,
        systemPrompt: 'You are a helpful assistant',
        isImageGeneration: false,
        isWebSearch: false,
      };

      mockGoogleGenAIClient.models.generateContentStream.mockResolvedValue([
        {
          text: 'response',
          usageMetadata: { promptTokenCount: 5, candidatesTokenCount: 3 },
        },
      ]);

      await service.streamResponse(params, () => {});

      const callArgs =
        mockGoogleGenAIClient.models.generateContentStream.mock.calls[0][0];
      expect(callArgs.contents).toBeDefined();
      expect(callArgs.config.temperature).toBe(0.7);
    });

    it('should return zero tokens when usageMetadata is missing', async () => {
      const params: StreamResponseParams = {
        previousMessages: [],
        newMessage: 'Test',
        model: 'gemini-2.0-flash',
        maxTokens: 1024,
        temperature: 0.7,
        supportsTemperature: true,
        isImageGeneration: false,
        isWebSearch: false,
      };

      mockGoogleGenAIClient.models.generateContentStream.mockResolvedValue([
        { text: 'response' },
      ]);

      const result = await service.streamResponse(params, () => {});

      expect(result.inputTokens).toBe(0);
      expect(result.outputTokens).toBe(0);
    });

    it('should accumulate text from multiple chunks', async () => {
      const params: StreamResponseParams = {
        previousMessages: [],
        newMessage: 'Multi chunk test',
        model: 'gemini-2.0-flash',
        maxTokens: 1024,
        temperature: 0.7,
        supportsTemperature: true,
        isImageGeneration: false,
        isWebSearch: false,
      };

      const chunks = [
        { text: 'This ' },
        { text: 'is ' },
        { text: 'a ' },
        { text: 'test' },
      ];
      mockGoogleGenAIClient.models.generateContentStream.mockResolvedValue(
        chunks,
      );

      const result = await service.streamResponse(params, () => {});

      expect(result.content).toBe('This is a test');
    });

    it('should call onDelta callback for each chunk', async () => {
      const params: StreamResponseParams = {
        previousMessages: [],
        newMessage: 'Callback test',
        model: 'gemini-2.0-flash',
        maxTokens: 1024,
        temperature: 0.7,
        supportsTemperature: true,
        isImageGeneration: false,
        isWebSearch: false,
      };

      const chunks = [
        { text: 'chunk1' },
        { text: 'chunk2' },
        { text: 'chunk3' },
      ];
      mockGoogleGenAIClient.models.generateContentStream.mockResolvedValue(
        chunks,
      );

      const onDelta = jest.fn();
      await service.streamResponse(params, onDelta);

      expect(onDelta).toHaveBeenCalledTimes(3);
      expect(onDelta).toHaveBeenNthCalledWith(1, 'chunk1');
      expect(onDelta).toHaveBeenNthCalledWith(2, 'chunk2');
      expect(onDelta).toHaveBeenNthCalledWith(3, 'chunk3');
    });

    it('should throw error when generateContentStream fails', async () => {
      const params: StreamResponseParams = {
        previousMessages: [],
        newMessage: 'Test',
        model: 'gemini-2.0-flash',
        maxTokens: 1024,
        temperature: 0.7,
        supportsTemperature: true,
        isImageGeneration: false,
        isWebSearch: false,
      };

      const error = new Error('API Error');
      mockGoogleGenAIClient.models.generateContentStream.mockRejectedValue(
        error,
      );

      await expect(service.streamResponse(params, () => {})).rejects.toThrow(
        'API Error',
      );
    });

    it('should handle empty response content', async () => {
      const params: StreamResponseParams = {
        previousMessages: [],
        newMessage: 'Test',
        model: 'gemini-2.0-flash',
        maxTokens: 1024,
        temperature: 0.7,
        supportsTemperature: true,
        isImageGeneration: false,
        isWebSearch: false,
      };

      mockGoogleGenAIClient.models.generateContentStream.mockResolvedValue([
        { text: '' },
      ]);

      const result = await service.streamResponse(params, () => {});

      expect(result.content).toBe('');
      expect(result.inputTokens).toBe(0);
      expect(result.outputTokens).toBe(0);
    });

    it('should handle undefined text in chunk', async () => {
      const params: StreamResponseParams = {
        previousMessages: [],
        newMessage: 'Test',
        model: 'gemini-2.0-flash',
        maxTokens: 1024,
        temperature: 0.7,
        supportsTemperature: true,
        isImageGeneration: false,
        isWebSearch: false,
      };

      mockGoogleGenAIClient.models.generateContentStream.mockResolvedValue([
        {
          text: undefined,
          usageMetadata: { promptTokenCount: 5, candidatesTokenCount: 2 },
        },
      ]);

      const result = await service.streamResponse(params, () => {});

      expect(result.content).toBe('');
      expect(result.inputTokens).toBe(5);
      expect(result.outputTokens).toBe(2);
    });

    it('should include temperature when supportsTemperature is true', async () => {
      const params: StreamResponseParams = {
        previousMessages: [],
        newMessage: 'Test',
        model: 'gemini-2.0-flash',
        maxTokens: 1024,
        temperature: 0.9,
        supportsTemperature: true,
        isImageGeneration: false,
        isWebSearch: false,
      };

      mockGoogleGenAIClient.models.generateContentStream.mockResolvedValue([
        {
          text: 'response',
          usageMetadata: { promptTokenCount: 10, candidatesTokenCount: 5 },
        },
      ]);

      await service.streamResponse(params, () => {});

      const callArgs =
        mockGoogleGenAIClient.models.generateContentStream.mock.calls[0][0];
      expect(callArgs.config.temperature).toBe(0.9);
    });

    it('should not include temperature when supportsTemperature is false', async () => {
      const params: StreamResponseParams = {
        previousMessages: [],
        newMessage: 'Test',
        model: 'gemini-2.0-flash',
        maxTokens: 1024,
        temperature: 0.9,
        supportsTemperature: false,
        isImageGeneration: false,
        isWebSearch: false,
      };

      mockGoogleGenAIClient.models.generateContentStream.mockResolvedValue([
        {
          text: 'response',
          usageMetadata: { promptTokenCount: 10, candidatesTokenCount: 5 },
        },
      ]);

      await service.streamResponse(params, () => {});

      const callArgs =
        mockGoogleGenAIClient.models.generateContentStream.mock.calls[0][0];
      expect(callArgs.config.temperature).toBeUndefined();
    });

    it('should not include temperature when supportsTemperature is undefined', async () => {
      const params: StreamResponseParams = {
        previousMessages: [],
        newMessage: 'Test',
        model: 'gemini-2.0-flash',
        maxTokens: 1024,
        temperature: 0.7,
        supportsTemperature: false,
        isImageGeneration: false,
        isWebSearch: false,
      };

      mockGoogleGenAIClient.models.generateContentStream.mockResolvedValue([
        {
          text: 'response',
          usageMetadata: { promptTokenCount: 10, candidatesTokenCount: 5 },
        },
      ]);

      await service.streamResponse(params, () => {});

      const callArgs =
        mockGoogleGenAIClient.models.generateContentStream.mock.calls[0][0];
      expect(callArgs.config.temperature).toBeUndefined();
    });

    it('should handle isReasoning parameter when true', async () => {
      const params: StreamResponseParams = {
        previousMessages: [],
        newMessage: 'Solve a complex problem',
        model: 'gemini-2.0-flash',
        maxTokens: 2000,
        temperature: 0.7,
        supportsTemperature: true,
        isReasoning: true,
        reasoningLevel: 'high',
        isImageGeneration: false,
        isWebSearch: false,
      };

      mockGoogleGenAIClient.models.generateContentStream.mockResolvedValue([
        {
          text: 'reasoning response',
          usageMetadata: { promptTokenCount: 20, candidatesTokenCount: 100 },
        },
      ]);

      const result = await service.streamResponse(params, () => {});

      expect(result.content).toBe('reasoning response');
      expect(result.inputTokens).toBe(20);
      expect(result.outputTokens).toBe(100);

      const callArgs =
        mockGoogleGenAIClient.models.generateContentStream.mock.calls[0][0];
      expect(callArgs.config.thinkingConfig).toBeDefined();
      expect(callArgs.config.thinkingConfig.thinkingLevel).toBe('HIGH');
    });

    it('should pass reasoningLevel parameter to API when reasoning is enabled', async () => {
      const params: StreamResponseParams = {
        previousMessages: [],
        newMessage: 'Complex reasoning task',
        model: 'gemini-2.0-flash',
        maxTokens: 2000,
        temperature: 0.7,
        supportsTemperature: true,
        isReasoning: true,
        reasoningLevel: 'medium',
        isImageGeneration: false,
        isWebSearch: false,
      };

      mockGoogleGenAIClient.models.generateContentStream.mockResolvedValue([
        {
          text: 'response',
          usageMetadata: { promptTokenCount: 15, candidatesTokenCount: 50 },
        },
      ]);

      await service.streamResponse(params, () => {});

      expect(
        mockGoogleGenAIClient.models.generateContentStream,
      ).toHaveBeenCalled();

      const callArgs =
        mockGoogleGenAIClient.models.generateContentStream.mock.calls[0][0];
      expect(callArgs.config.thinkingConfig).toBeDefined();
      expect(callArgs.config.thinkingConfig.thinkingLevel).toBe('MEDIUM');
    });

    it('should handle isReasoning false with reasoningLevel specified', async () => {
      const params: StreamResponseParams = {
        previousMessages: [],
        newMessage: 'Test',
        model: 'gemini-2.0-flash',
        maxTokens: 1024,
        temperature: 0.7,
        supportsTemperature: true,
        isReasoning: false,
        reasoningLevel: 'high',
        isImageGeneration: false,
        isWebSearch: false,
      };

      mockGoogleGenAIClient.models.generateContentStream.mockResolvedValue([
        {
          text: 'response',
          usageMetadata: { promptTokenCount: 10, candidatesTokenCount: 5 },
        },
      ]);

      const result = await service.streamResponse(params, () => {});

      expect(result.content).toBe('response');

      const callArgs =
        mockGoogleGenAIClient.models.generateContentStream.mock.calls[0][0];
      expect(callArgs.config.thinkingConfig).toBeDefined();
      expect(callArgs.config.thinkingConfig.thinkingLevel).toBe('HIGH');
    });

    it('should combine image generation with reasoning features', async () => {
      const params: StreamResponseParams = {
        previousMessages: [],
        newMessage: 'Generate an image based on reasoning',
        model: 'gemini-2.0-flash',
        maxTokens: 2000,
        temperature: 0.7,
        supportsTemperature: true,
        isReasoning: true,
        reasoningLevel: 'medium',
        isImageGeneration: true,
        isWebSearch: false,
      };

      mockGoogleGenAIClient.models.generateContentStream.mockResolvedValue([
        {
          text: 'Generated image',
          data: 'base64image',
          usageMetadata: { promptTokenCount: 25, candidatesTokenCount: 50 },
        },
      ]);

      const result = await service.streamResponse(params, () => {});

      expect(result.content).toBe('Generated image');
      expect(result.imageKey).toBe('base64image');
      expect(result.inputTokens).toBe(25);
      expect(result.outputTokens).toBe(50);

      const callArgs =
        mockGoogleGenAIClient.models.generateContentStream.mock.calls[0][0];
      expect(callArgs.config.thinkingConfig.thinkingLevel).toBe('MEDIUM');
      expect(callArgs.model).toBe('gemini-2.5-flash-image');
    });

    it('should combine web search with reasoning features', async () => {
      const params: StreamResponseParams = {
        previousMessages: [],
        newMessage: 'Search and reason about recent events',
        model: 'gemini-2.0-flash',
        maxTokens: 2000,
        temperature: 0.7,
        supportsTemperature: true,
        isReasoning: true,
        reasoningLevel: 'high',
        isImageGeneration: false,
        isWebSearch: true,
      };

      mockGoogleGenAIClient.models.generateContentStream.mockResolvedValue([
        {
          text: 'search result with reasoning',
          usageMetadata: { promptTokenCount: 30, candidatesTokenCount: 80 },
        },
      ]);

      await service.streamResponse(params, () => {});

      const callArgs =
        mockGoogleGenAIClient.models.generateContentStream.mock.calls[0][0];
      expect(callArgs.config.tools).toContainEqual({ googleSearch: {} });
      expect(callArgs.config.thinkingConfig.thinkingLevel).toBe('HIGH');
    });

    it('should default to HIGH thinking level when reasoningLevel is not provided', async () => {
      const params: StreamResponseParams = {
        previousMessages: [],
        newMessage: 'Test without reasoning level',
        model: 'gemini-2.0-flash',
        maxTokens: 1024,
        temperature: 0.7,
        supportsTemperature: true,
        isImageGeneration: false,
        isWebSearch: false,
      };

      mockGoogleGenAIClient.models.generateContentStream.mockResolvedValue([
        {
          text: 'response',
          usageMetadata: { promptTokenCount: 10, candidatesTokenCount: 5 },
        },
      ]);

      await service.streamResponse(params, () => {});

      const callArgs =
        mockGoogleGenAIClient.models.generateContentStream.mock.calls[0][0];
      expect(callArgs.config.thinkingConfig).toBeDefined();
      expect(callArgs.config.thinkingConfig.thinkingLevel).toBe('HIGH');
    });

    it('should convert lowercase reasoningLevel to uppercase', async () => {
      const params: StreamResponseParams = {
        previousMessages: [],
        newMessage: 'Test case conversion',
        model: 'gemini-2.0-flash',
        maxTokens: 2000,
        temperature: 0.7,
        supportsTemperature: true,
        reasoningLevel: 'low',
        isImageGeneration: false,
        isWebSearch: false,
      };

      mockGoogleGenAIClient.models.generateContentStream.mockResolvedValue([
        {
          text: 'response',
          usageMetadata: { promptTokenCount: 10, candidatesTokenCount: 5 },
        },
      ]);

      await service.streamResponse(params, () => {});

      const callArgs =
        mockGoogleGenAIClient.models.generateContentStream.mock.calls[0][0];
      expect(callArgs.config.thinkingConfig.thinkingLevel).toBe('LOW');
    });
  });

  describe('generateTitle', () => {
    it('should generate title from user and assistant messages', async () => {
      const userMessage = 'What is AI?';
      const assistantResponse = 'AI is artificial intelligence...';

      mockGoogleGenAIClient.models.generateContent.mockResolvedValue({
        text: 'Understanding AI Basics',
      });

      const result = await service.generateTitle(
        userMessage,
        assistantResponse,
      );

      expect(result).toBe('Understanding AI Basics');
      expect(mockGoogleGenAIClient.models.generateContent).toHaveBeenCalledWith(
        expect.objectContaining({
          model: 'gemini-2.0-flash-lite',
          config: { temperature: 0.7, maxOutputTokens: 20 },
        }),
      );
    });

    it('should trim whitespace from generated title', async () => {
      const userMessage = 'Test message';
      const assistantResponse = 'Test response';

      mockGoogleGenAIClient.models.generateContent.mockResolvedValue({
        text: '  Trimmed Title  ',
      });

      const result = await service.generateTitle(
        userMessage,
        assistantResponse,
      );

      expect(result).toBe('Trimmed Title');
    });

    it('should truncate long assistant response to 500 characters', async () => {
      const userMessage = 'Test';
      const longResponse = 'a'.repeat(1000);

      mockGoogleGenAIClient.models.generateContent.mockResolvedValue({
        text: 'Generated Title',
      });

      await service.generateTitle(userMessage, longResponse);

      const callArgs =
        mockGoogleGenAIClient.models.generateContent.mock.calls[0][0];
      const promptText = callArgs.contents[0].parts[0].text;

      expect(promptText).toContain('a'.repeat(500));
      expect(promptText.length).toBeLessThan(1000);
    });

    it('should throw error when generateContent fails', async () => {
      const userMessage = 'Test';
      const assistantResponse = 'Response';

      const error = new Error('Title generation failed');
      mockGoogleGenAIClient.models.generateContent.mockRejectedValue(error);

      await expect(
        service.generateTitle(userMessage, assistantResponse),
      ).rejects.toThrow('Title generation failed');
    });

    it('should handle empty response text', async () => {
      const userMessage = 'Test';
      const assistantResponse = 'Response';

      mockGoogleGenAIClient.models.generateContent.mockResolvedValue({
        text: '',
      });

      const result = await service.generateTitle(
        userMessage,
        assistantResponse,
      );

      expect(result).toBe('');
    });

    it('should handle null text in response', async () => {
      const userMessage = 'Test';
      const assistantResponse = 'Response';

      mockGoogleGenAIClient.models.generateContent.mockResolvedValue({
        text: null,
      });

      await expect(
        service.generateTitle(userMessage, assistantResponse),
      ).rejects.toThrow();
    });

    it('should pass correct parameters to generateContent', async () => {
      const userMessage = 'User asks';
      const assistantResponse = 'Assistant replies';

      mockGoogleGenAIClient.models.generateContent.mockResolvedValue({
        text: 'Title',
      });

      await service.generateTitle(userMessage, assistantResponse);

      const callArgs =
        mockGoogleGenAIClient.models.generateContent.mock.calls[0][0];
      expect(callArgs.model).toBe('gemini-2.0-flash-lite');
      expect(callArgs.contents[0].role).toBe('user');
      expect(callArgs.config.maxOutputTokens).toBe(20);
    });
  });
});
