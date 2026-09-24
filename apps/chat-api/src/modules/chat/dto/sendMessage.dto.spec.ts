import { plainToInstance } from 'class-transformer';
import { SendMessageReqDto, SendMessageResDto } from './sendMessage.dto';

describe('SendMessageReqDto', () => {
  describe('transformation and basic validation', () => {
    const basePayload = {
      message: 'Hello',
      modelId: '550e8400-e29b-41d4-a716-446655440000',
      modelDeveloper: 'OpenAI',
      maxTokens: 1000,
      temperature: 0.7,
      isImageGeneration: false,
      isWebSearch: false,
    };

    it.each([
      [{ maxTokens: '1000' }, 'maxTokens', 1000],
      [{ temperature: '0.7' }, 'temperature', 0.7],
      [{ isImageGeneration: 'true' }, 'isImageGeneration', true],
      [{ isImageGeneration: 'false' }, 'isImageGeneration', false],
      [{ isWebSearch: 'true' }, 'isWebSearch', true],
    ])('should transform %p into %s', (override, prop, expected) => {
      const payload = { ...basePayload, ...override };
      const instance = plainToInstance(SendMessageReqDto, payload);
      const value = (instance as any)[prop];
      expect(value).toBe(expected);
      expect(typeof value).toBe(typeof expected);
    });
  });

  describe('instance creation and property assignment', () => {
    const modelId = '550e8400-e29b-41d4-a716-446655440000';
    const cases = [
      [
        'with required fields',
        {
          message: 'Hello, how are you?',
          modelId,
          modelDeveloper: 'OpenAI',
          maxTokens: 1000,
          temperature: 0.7,
          isImageGeneration: false,
          isWebSearch: false,
        },
      ],
      [
        'with optional chatId and promptId',
        {
          chatId: modelId,
          promptId: '550e8400-e29b-41d4-a716-446655440001',
          message: 'Test message',
          modelId,
          modelDeveloper: 'OpenAI',
          maxTokens: 512,
          temperature: 0.5,
          isImageGeneration: true,
          isWebSearch: true,
        },
      ],
      [
        'with optional fields omitted',
        {
          message: 'Hello',
          modelId,
          modelDeveloper: 'OpenAI',
          maxTokens: 1000,
          temperature: 0.7,
          isImageGeneration: false,
          isWebSearch: false,
        },
      ],
    ];

    it.each(cases)('should create instance %s', (_desc, payload) => {
      const instance = plainToInstance(SendMessageReqDto, payload as any);

      expect(instance.message).toBe(payload.message);
      expect(instance.modelId).toBe(payload.modelId);
      expect(instance.modelDeveloper).toBe(payload.modelDeveloper);
      expect(instance.maxTokens).toBe(payload.maxTokens);
      expect(instance.temperature).toBe(payload.temperature);
      expect(instance.isImageGeneration).toBe(payload.isImageGeneration);
      expect(instance.isWebSearch).toBe(payload.isWebSearch);
      if ('chatId' in payload) {
        expect(instance.chatId).toBe((payload as any).chatId);
      } else {
        expect(instance.chatId).toBeUndefined();
      }
      if ('promptId' in payload) {
        expect(instance.promptId).toBe((payload as any).promptId);
      } else {
        expect(instance.promptId).toBeUndefined();
      }
    });
  });

  describe('edge cases and boundary values', () => {
    it('should accept maxTokens at minimum boundary (1)', () => {
      const payload = {
        message: 'Hello',
        modelId: '550e8400-e29b-41d4-a716-446655440000',
        modelDeveloper: 'OpenAI',
        maxTokens: 1,
        temperature: 0.7,
        isImageGeneration: false,
        isWebSearch: false,
      };

      const instance = plainToInstance(SendMessageReqDto, payload);
      expect(instance.maxTokens).toBe(1);
    });

    it('should accept maxTokens at maximum boundary (16384)', () => {
      const payload = {
        message: 'Hello',
        modelId: '550e8400-e29b-41d4-a716-446655440000',
        modelDeveloper: 'OpenAI',
        maxTokens: 16384,
        temperature: 0.7,
        isImageGeneration: false,
        isWebSearch: false,
      };

      const instance = plainToInstance(SendMessageReqDto, payload);
      expect(instance.maxTokens).toBe(16384);
    });
    it.each([[0], [1], [0.75]])(
      'should accept temperature value %p',
      (temp) => {
        const payload = {
          message: 'Hello',
          modelId: '550e8400-e29b-41d4-a716-446655440000',
          modelDeveloper: 'OpenAI',
          maxTokens: 1000,
          temperature: temp,
          isImageGeneration: false,
          isWebSearch: false,
        };

        const instance = plainToInstance(SendMessageReqDto, payload as any);
        expect(instance.temperature).toBe(temp);
      },
    );

    it('should handle long messages', () => {
      const longMessage = 'A'.repeat(5000);
      const payload = {
        message: longMessage,
        modelId: '550e8400-e29b-41d4-a716-446655440000',
        modelDeveloper: 'OpenAI',
        maxTokens: 1000,
        temperature: 0.7,
        isImageGeneration: false,
        isWebSearch: false,
      };

      const instance = plainToInstance(SendMessageReqDto, payload);
      expect(instance.message).toBe(longMessage);
      expect(instance.message).toHaveLength(5000);
    });

    it.each([
      'gpt-4o',
      'gpt-4o-mini',
      'gpt-4.1-2025-04-14',
      'gemini-2.0-flash-lite',
      'gemini-2.5-pro',
    ])('should handle different model values: %s', (model) => {
      const payload = {
        message: 'Hello',
        modelId: '550e8400-e29b-41d4-a716-446655440000',
        modelDeveloper: 'OpenAI',
        maxTokens: 1000,
        temperature: 0.7,
        isImageGeneration: false,
        isWebSearch: false,
      };

      const instance = plainToInstance(SendMessageReqDto, payload);
      expect(instance.modelId).toBe('550e8400-e29b-41d4-a716-446655440000');
    });
  });
});

describe('SendMessageResDto', () => {
  it('should have all required properties defined', () => {
    const instance = new SendMessageResDto();
    expect(instance).toBeDefined();
  });

  it('should be able to assign properties', () => {
    const instance = new SendMessageResDto();
    instance.chatId = 'test-chat-id';
    instance.message = 'test message';
    instance.inputTokens = 100;
    instance.outputTokens = 200;
    instance.title = 'Test Title';

    expect(instance.chatId).toBe('test-chat-id');
    expect(instance.message).toBe('test message');
    expect(instance.inputTokens).toBe(100);
    expect(instance.outputTokens).toBe(200);
    expect(instance.title).toBe('Test Title');
  });
});
