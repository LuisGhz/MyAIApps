import { Test, TestingModule } from '@nestjs/testing';
import { OpenAIService } from './openai.service';
import { EnvService } from '@cfg/schema/env.service';
import OpenAI from 'openai';
import { StreamResponseParams } from '../interfaces';

jest.mock('openai');

const envServiceMock = {
  openaiApiKey: 'test-openai-api-key',
  cdnDomain: 'https://cdn.example.com/',
};

type MockOpenAIResponse = {
  output_text: string;
  usage?: { input_tokens?: number; output_tokens?: number } | null;
  output?: Array<{ type: string; result?: string }>;
  incomplete_details?: { reason?: string } | null;
  error?: { message?: string; type?: string } | null;
};

type MockOpenAIEvent = {
  type: string;
  delta?: string;
  response?: MockOpenAIResponse;
};

type MockOpenAIRequest = {
  model: string;
  input?: unknown;
  instructions?: string;
  max_output_tokens?: number;
  temperature?: number;
  tools?: unknown[];
  reasoning?: { effort?: string };
};

type MockOpenAIStream = Iterable<MockOpenAIEvent> & {
  on: jest.Mock;
  finalResponse: jest.Mock<Promise<MockOpenAIResponse>, []>;
};

const mockStreamResponse = {
  on: jest.fn(),
  finalResponse: jest.fn<Promise<MockOpenAIResponse>, []>(),
};

const mockOpenAIClient = {
  responses: {
    stream: jest.fn<MockOpenAIStream, [MockOpenAIRequest]>(),
    create: jest.fn<Promise<MockOpenAIResponse>, [MockOpenAIRequest]>(),
  },
};

describe('OpenAIService', () => {
  let service: OpenAIService;

  beforeEach(async () => {
    jest.clearAllMocks();

    (OpenAI as jest.MockedClass<typeof OpenAI>).mockImplementation(
      () => mockOpenAIClient as unknown as OpenAI,
    );

    const module: TestingModule = await Test.createTestingModule({
      providers: [
        OpenAIService,
        {
          provide: EnvService,
          useValue: envServiceMock,
        },
      ],
    }).compile();

    service = module.get<OpenAIService>(OpenAIService);
  });

  describe('streamResponse', () => {
    const baseParams: StreamResponseParams = {
      previousMessages: [],
      newMessage: 'Hello, how are you?',
      model: 'gpt-4',
      maxTokens: 1000,
      temperature: 0.7,
      supportsTemperature: true,
      isImageGeneration: false,
      isWebSearch: false,
    };

    const mockFinalResponse = {
      output_text: 'I am doing well, thank you for asking!',
      usage: {
        input_tokens: 10,
        output_tokens: 15,
      },
      output: [],
    };

    const setupStreamMock = (
      response: MockOpenAIResponse = mockFinalResponse,
      includesDeltaEvent = true,
    ): MockOpenAIStream => {
      const eventsToReturn: MockOpenAIEvent[] = [];

      if (includesDeltaEvent) {
        eventsToReturn.push({
          type: 'response.output_text.delta',
          delta: 'Hello',
        });
      }

      eventsToReturn.push({
        type: 'response.completed',
        response,
      });

      const iterator = {
        [Symbol.iterator]: function* () {
          for (const event of eventsToReturn) {
            yield event;
          }
        },
      };

      return {
        ...mockStreamResponse,
        ...iterator,
      };
    };

    it('should stream response successfully with temperature support', async () => {
      const onDeltaMock = jest.fn();
      const streamMock = setupStreamMock();
      mockOpenAIClient.responses.stream.mockReturnValue(streamMock);

      const result = await service.streamResponse(baseParams, onDeltaMock);

      expect(result).toEqual({
        content: 'I am doing well, thank you for asking!',
        inputTokens: 10,
        outputTokens: 15,
        imageKey: undefined,
      });
      expect(mockOpenAIClient.responses.stream).toHaveBeenCalledWith(
        expect.objectContaining({
          model: 'gpt-4',
          temperature: 0.7,
        }),
      );
    });

    it('should not include temperature when supportsTemperature is false', async () => {
      const onDeltaMock = jest.fn();
      const paramsNoTemp = {
        ...baseParams,
        supportsTemperature: false,
      };

      const streamMock = setupStreamMock();
      mockOpenAIClient.responses.stream.mockReturnValue(streamMock);

      await service.streamResponse(paramsNoTemp, onDeltaMock);

      expect(
        mockOpenAIClient.responses.stream.mock.calls[0][0].temperature,
      ).toBeUndefined();
    });

    it('should include fileKey in message transformation when provided', async () => {
      const onDeltaMock = jest.fn();
      const paramsWithFile = {
        ...baseParams,
        fileKey: 'document-123.pdf',
      };

      const streamMock = setupStreamMock();
      mockOpenAIClient.responses.stream.mockReturnValue(streamMock);

      await service.streamResponse(paramsWithFile, onDeltaMock);

      expect(mockOpenAIClient.responses.stream).toHaveBeenCalled();
    });

    it('should handle reasoning configuration when enabled', async () => {
      const onDeltaMock = jest.fn();
      const paramsWithReasoning = {
        ...baseParams,
        isReasoning: true,
        reasoningLevel: 'medium',
      };

      const streamMock = setupStreamMock();
      mockOpenAIClient.responses.stream.mockReturnValue(streamMock);

      await service.streamResponse(paramsWithReasoning, onDeltaMock);

      expect(mockOpenAIClient.responses.stream).toHaveBeenCalledWith(
        expect.objectContaining({
          reasoning: {
            effort: 'medium',
          },
        }),
      );
    });

    it('should handle response.completed event properly', async () => {
      const onDeltaMock = jest.fn();
      const completedResponse = {
        output_text: 'Completed response',
        usage: {
          input_tokens: 5,
          output_tokens: 10,
        },
        output: [],
      };

      const streamMock = setupStreamMock(completedResponse);
      mockOpenAIClient.responses.stream.mockReturnValue(streamMock);

      const result = await service.streamResponse(baseParams, onDeltaMock);

      expect(result.content).toBe('Completed response');
      expect(result.inputTokens).toBe(5);
      expect(result.outputTokens).toBe(10);
    });

    it('should handle response.incomplete event with incomplete details', async () => {
      const onDeltaMock = jest.fn();
      const incompleteResponse = {
        output_text: 'Incomplete response',
        usage: {
          input_tokens: 5,
          output_tokens: 8,
        },
        output: [],
        incomplete_details: {
          reason: 'max_tokens',
        },
      };

      const iterator = {
        [Symbol.iterator]: function* () {
          yield {
            type: 'response.output_text.delta',
            delta: 'Hello',
          };
          yield {
            type: 'response.incomplete',
            response: incompleteResponse,
          };
        },
      };

      const streamMock = {
        ...mockStreamResponse,
        ...iterator,
      };
      mockOpenAIClient.responses.stream.mockReturnValue(streamMock);

      const result = await service.streamResponse(baseParams, onDeltaMock);

      expect(result.content).toBe('Incomplete response');
      expect(result.outputTokens).toBe(8);
    });

    it('should handle response.failed event with error information', async () => {
      const onDeltaMock = jest.fn();
      const failedResponse = {
        output_text: '',
        usage: {
          input_tokens: 0,
          output_tokens: 0,
        },
        output: [],
        error: {
          message: 'Request failed',
          type: 'server_error',
        },
      };

      const iterator = {
        [Symbol.iterator]: function* () {
          yield {
            type: 'response.failed',
            response: failedResponse,
          };
        },
      };

      const streamMock = {
        ...mockStreamResponse,
        ...iterator,
      };
      mockOpenAIClient.responses.stream.mockReturnValue(streamMock);

      const result = await service.streamResponse(baseParams, onDeltaMock);

      expect(result).toBeDefined();
    });

    it('should call onDelta callback with streaming deltas', async () => {
      const onDeltaMock = jest.fn();
      const streamMock = setupStreamMock();
      mockOpenAIClient.responses.stream.mockReturnValue(streamMock);

      await service.streamResponse(baseParams, onDeltaMock);

      expect(onDeltaMock).toHaveBeenCalledWith('Hello');
    });

    it('should handle image generation response with image tokens', async () => {
      const onDeltaMock = jest.fn();
      const paramsWithImage = {
        ...baseParams,
        isImageGeneration: true,
      };

      const mockImageResponse = {
        output_text: 'Here is your generated image',
        usage: {
          input_tokens: 10,
          output_tokens: 15,
        },
        output: [
          {
            type: 'image_generation_call',
            result: 'base64imagedata',
          },
        ],
      };

      const streamMock = setupStreamMock(mockImageResponse);
      mockOpenAIClient.responses.stream.mockReturnValue(streamMock);

      const result = await service.streamResponse(paramsWithImage, onDeltaMock);

      expect(result.imageKey).toBe('base64imagedata');
      expect(result.content).toBe('Here is your generated image');
    });

    it('should handle web search tool parameters', async () => {
      const onDeltaMock = jest.fn();
      const paramsWithWebSearch = {
        ...baseParams,
        isWebSearch: true,
      };

      const streamMock = setupStreamMock();
      mockOpenAIClient.responses.stream.mockReturnValue(streamMock);

      await service.streamResponse(paramsWithWebSearch, onDeltaMock);

      expect(
        Array.isArray(mockOpenAIClient.responses.stream.mock.calls[0][0].tools),
      ).toBe(true);
    });

    it('should handle custom system prompt', async () => {
      const onDeltaMock = jest.fn();
      const paramsWithSystemPrompt = {
        ...baseParams,
        systemPrompt: 'You are a helpful assistant',
      };

      const streamMock = setupStreamMock();
      mockOpenAIClient.responses.stream.mockReturnValue(streamMock);

      await service.streamResponse(paramsWithSystemPrompt, onDeltaMock);

      expect(mockOpenAIClient.responses.stream).toHaveBeenCalledWith(
        expect.objectContaining({
          instructions: 'You are a helpful assistant',
        }),
      );
    });

    it('should handle response with missing usage data', async () => {
      const onDeltaMock = jest.fn();
      const mockResponseNoUsage = {
        output_text: 'Response without usage',
        usage: null,
        output: [],
      };

      const streamMock = setupStreamMock(mockResponseNoUsage);
      mockOpenAIClient.responses.stream.mockReturnValue(streamMock);

      const result = await service.streamResponse(baseParams, onDeltaMock);

      expect(result.inputTokens).toBe(0);
      expect(result.outputTokens).toBe(0);
    });

    it('should propagate stream errors to caller', async () => {
      const onDeltaMock = jest.fn();
      const error = new Error('OpenAI API Error');

      mockOpenAIClient.responses.stream.mockImplementation(() => {
        const iterator = {
          [Symbol.iterator]: () => ({
            next: () => {
              throw error;
            },
          }),
        };
        return { ...mockStreamResponse, ...iterator };
      });

      await expect(
        service.streamResponse(baseParams, onDeltaMock),
      ).rejects.toThrow('OpenAI API Error');
    });

    it('should handle network timeout errors', async () => {
      const onDeltaMock = jest.fn();
      const timeoutError = new Error('Request timeout');

      mockOpenAIClient.responses.stream.mockImplementation(() => {
        const iterator = {
          [Symbol.iterator]: () => ({
            next: () => {
              throw timeoutError;
            },
          }),
        };
        return { ...mockStreamResponse, ...iterator };
      });

      await expect(
        service.streamResponse(baseParams, onDeltaMock),
      ).rejects.toThrow('Request timeout');
    });

    it('should handle empty message response', async () => {
      const onDeltaMock = jest.fn();
      const mockEmptyResponse = {
        output_text: '',
        usage: {
          input_tokens: 5,
          output_tokens: 0,
        },
        output: [],
      };

      const streamMock = setupStreamMock(mockEmptyResponse);
      mockOpenAIClient.responses.stream.mockReturnValue(streamMock);

      const result = await service.streamResponse(baseParams, onDeltaMock);

      expect(result.content).toBe('');
      expect(result.outputTokens).toBe(0);
    });

    it('should handle maximum token limits', async () => {
      const onDeltaMock = jest.fn();
      const paramsMaxTokens = {
        ...baseParams,
        maxTokens: 4000,
      };

      const streamMock = setupStreamMock();
      mockOpenAIClient.responses.stream.mockReturnValue(streamMock);

      await service.streamResponse(paramsMaxTokens, onDeltaMock);

      expect(mockOpenAIClient.responses.stream).toHaveBeenCalled();
    });

    it('should handle reasoning with default level when not specified', async () => {
      const onDeltaMock = jest.fn();
      const paramsWithReasoningNoLevel = {
        ...baseParams,
        isReasoning: true,
      };

      const streamMock = setupStreamMock();
      mockOpenAIClient.responses.stream.mockReturnValue(streamMock);

      await service.streamResponse(paramsWithReasoningNoLevel, onDeltaMock);

      expect(mockOpenAIClient.responses.stream).toHaveBeenCalledWith(
        expect.objectContaining({
          reasoning: {
            effort: 'low',
          },
        }),
      );
    });

    it('should handle reasoning with high effort level', async () => {
      const onDeltaMock = jest.fn();
      const paramsHighEffort = {
        ...baseParams,
        isReasoning: true,
        reasoningLevel: 'high',
      };

      const streamMock = setupStreamMock();
      mockOpenAIClient.responses.stream.mockReturnValue(streamMock);

      await service.streamResponse(paramsHighEffort, onDeltaMock);

      expect(mockOpenAIClient.responses.stream).toHaveBeenCalledWith(
        expect.objectContaining({
          reasoning: {
            effort: 'high',
          },
        }),
      );
    });

    it('should ignore reasoning parameters when isReasoning is false', async () => {
      const onDeltaMock = jest.fn();
      const paramsNoReasoning = {
        ...baseParams,
        isReasoning: false,
        reasoningLevel: 'high',
      };

      const streamMock = setupStreamMock();
      mockOpenAIClient.responses.stream.mockReturnValue(streamMock);

      await service.streamResponse(paramsNoReasoning, onDeltaMock);

      expect(
        mockOpenAIClient.responses.stream.mock.calls[0][0].reasoning,
      ).toBeUndefined();
    });

    it('should combine image generation and reasoning features', async () => {
      const onDeltaMock = jest.fn();
      const paramsWithBothFeatures = {
        ...baseParams,
        isImageGeneration: true,
        isReasoning: true,
        reasoningLevel: 'medium',
      };

      const mockCombinedResponse = {
        output_text: 'Generated image with reasoning',
        usage: {
          input_tokens: 20,
          output_tokens: 30,
        },
        output: [
          {
            type: 'image_generation_call',
            result: 'image-data',
          },
        ],
      };

      const streamMock = setupStreamMock(mockCombinedResponse);
      mockOpenAIClient.responses.stream.mockReturnValue(streamMock);

      const result = await service.streamResponse(
        paramsWithBothFeatures,
        onDeltaMock,
      );

      expect(result.content).toBe('Generated image with reasoning');
      expect(result.imageKey).toBe('image-data');
    });

    it('should handle multiple delta events before completion', async () => {
      const onDeltaMock = jest.fn();
      const deltaEvents = [
        { type: 'response.output_text.delta', delta: 'Hello' },
        { type: 'response.output_text.delta', delta: ' ' },
        { type: 'response.output_text.delta', delta: 'World' },
      ];

      const iterator = {
        [Symbol.iterator]: function* () {
          for (const event of deltaEvents) {
            yield event;
          }
          yield {
            type: 'response.completed',
            response: mockFinalResponse,
          };
        },
      };

      mockOpenAIClient.responses.stream.mockReturnValue({
        ...mockStreamResponse,
        ...iterator,
      });

      await service.streamResponse(baseParams, onDeltaMock);

      expect(onDeltaMock).toHaveBeenCalledTimes(3);
      expect(onDeltaMock).toHaveBeenNthCalledWith(1, 'Hello');
      expect(onDeltaMock).toHaveBeenNthCalledWith(2, ' ');
      expect(onDeltaMock).toHaveBeenNthCalledWith(3, 'World');
    });
  });

  describe('generateTitle', () => {
    const mockCreateResponse = {
      output_text: 'Generated Chat Title',
    };

    it('should generate chat title successfully', async () => {
      const userMessage = 'Hello, what is TypeScript?';
      const assistantResponse = 'TypeScript is a typed superset of JavaScript.';

      mockOpenAIClient.responses.create.mockResolvedValue(mockCreateResponse);

      const result = await service.generateTitle(
        userMessage,
        assistantResponse,
      );

      expect(result).toBe('Generated Chat Title');
      expect(mockOpenAIClient.responses.create).toHaveBeenCalledWith(
        expect.objectContaining({
          max_output_tokens: 30,
        }),
      );
    });

    it('should trim whitespace from generated title', async () => {
      const userMessage = 'Test message';
      const assistantResponse = 'Test response';

      mockOpenAIClient.responses.create.mockResolvedValue({
        output_text: '  Trimmed Title  ',
      });

      const result = await service.generateTitle(
        userMessage,
        assistantResponse,
      );

      expect(result).toBe('Trimmed Title');
    });

    it('should return default title on generation error', async () => {
      const userMessage = 'Test message';
      const assistantResponse = 'Test response';

      mockOpenAIClient.responses.create.mockRejectedValue(
        new Error('API Error'),
      );

      const result = await service.generateTitle(
        userMessage,
        assistantResponse,
      );

      expect(result).toBe('New Chat');
    });

    it('should handle empty response text gracefully', async () => {
      const userMessage = 'Test message';
      const assistantResponse = 'Test response';

      mockOpenAIClient.responses.create.mockResolvedValue({
        output_text: '',
      });

      const result = await service.generateTitle(
        userMessage,
        assistantResponse,
      );

      expect(result).toBe('');
    });

    it('should handle network failure during title generation', async () => {
      const userMessage = 'Test message';
      const assistantResponse = 'Test response';

      mockOpenAIClient.responses.create.mockRejectedValue(
        new Error('Network error'),
      );

      const result = await service.generateTitle(
        userMessage,
        assistantResponse,
      );

      expect(result).toBe('New Chat');
    });

    it('should handle very long generated titles', async () => {
      const userMessage = 'Test message';
      const assistantResponse = 'Test response';
      const longTitle =
        'This is a very long title that exceeds the typical length of a chat title';

      mockOpenAIClient.responses.create.mockResolvedValue({
        output_text: longTitle,
      });

      const result = await service.generateTitle(
        userMessage,
        assistantResponse,
      );

      expect(result).toBe(longTitle);
    });
  });
});
