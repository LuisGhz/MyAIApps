import 'reflect-metadata';
import { plainToInstance } from 'class-transformer';
import { validate } from 'class-validator';
import {
  UpdateModelReqDto,
  UpdateModelPriceDto,
  UpdateModelMetadataDto,
  UpdateModelDeveloperDto,
} from './updateModel.dto';

describe('UpdateModel DTOs', () => {
  describe('UpdateModelPriceDto', () => {
    it('should validate correct payload', async () => {
      const payload = {
        input: 0.5,
        output: 1.5,
      };

      const instance = plainToInstance(UpdateModelPriceDto, payload);
      const errors = await validate(instance);

      expect(errors).toHaveLength(0);
      expect(instance.input).toBe(0.5);
      expect(instance.output).toBe(1.5);
    });

    it('should validate empty payload for optional fields', async () => {
      const payload = {};

      const instance = plainToInstance(UpdateModelPriceDto, payload);
      const errors = await validate(instance);

      expect(errors).toHaveLength(0);
      expect(instance.input).toBeUndefined();
      expect(instance.output).toBeUndefined();
    });

    it('should fail when input is negative', async () => {
      const payload = {
        input: -0.5,
      };

      const instance = plainToInstance(UpdateModelPriceDto, payload);
      const errors = await validate(instance);

      expect(errors).toHaveLength(1);
      expect(errors[0].property).toBe('input');
      expect(errors[0].constraints).toHaveProperty('isPositive');
    });

    it('should fail when input is zero', async () => {
      const payload = {
        input: 0,
      };

      const instance = plainToInstance(UpdateModelPriceDto, payload);
      const errors = await validate(instance);

      expect(errors).toHaveLength(1);
      expect(errors[0].property).toBe('input');
      expect(errors[0].constraints).toHaveProperty('isPositive');
    });

    it('should fail when input is not a number', async () => {
      const payload = {
        input: 'not-a-number',
      };

      const instance = plainToInstance(UpdateModelPriceDto, payload);
      const errors = await validate(instance);

      expect(errors.length).toBeGreaterThan(0);
      expect(errors[0].property).toBe('input');
    });

    it('should fail when output is negative', async () => {
      const payload = {
        output: -1.5,
      };

      const instance = plainToInstance(UpdateModelPriceDto, payload);
      const errors = await validate(instance);

      expect(errors).toHaveLength(1);
      expect(errors[0].property).toBe('output');
      expect(errors[0].constraints).toHaveProperty('isPositive');
    });

    it('should fail when output is zero', async () => {
      const payload = {
        output: 0,
      };

      const instance = plainToInstance(UpdateModelPriceDto, payload);
      const errors = await validate(instance);

      expect(errors).toHaveLength(1);
      expect(errors[0].property).toBe('output');
      expect(errors[0].constraints).toHaveProperty('isPositive');
    });

    it('should fail when output is not a number', async () => {
      const payload = {
        output: 'not-a-number',
      };

      const instance = plainToInstance(UpdateModelPriceDto, payload);
      const errors = await validate(instance);

      expect(errors.length).toBeGreaterThan(0);
      expect(errors[0].property).toBe('output');
    });
  });

  describe('UpdateModelMetadataDto', () => {
    it('should validate correct payload', async () => {
      const payload = {
        contextWindow: 4096,
        maxOutputTokens: 2048,
        knowledgeCutoff: '2024-01-01',
      };

      const instance = plainToInstance(UpdateModelMetadataDto, payload);
      const errors = await validate(instance);

      expect(errors).toHaveLength(0);
      expect(instance.contextWindow).toBe(4096);
      expect(instance.maxOutputTokens).toBe(2048);
      expect(instance.knowledgeCutoff).toBe('2024-01-01');
    });

    it('should validate empty payload for optional fields', async () => {
      const payload = {};

      const instance = plainToInstance(UpdateModelMetadataDto, payload);
      const errors = await validate(instance);

      expect(errors).toHaveLength(0);
      expect(instance.contextWindow).toBeUndefined();
      expect(instance.maxOutputTokens).toBeUndefined();
      expect(instance.knowledgeCutoff).toBeUndefined();
    });

    it('should fail when contextWindow is zero', async () => {
      const payload = {
        contextWindow: 0,
      };

      const instance = plainToInstance(UpdateModelMetadataDto, payload);
      const errors = await validate(instance);

      expect(errors).toHaveLength(1);
      expect(errors[0].property).toBe('contextWindow');
      expect(errors[0].constraints).toHaveProperty('min');
    });

    it('should fail when contextWindow is negative', async () => {
      const payload = {
        contextWindow: -1024,
      };

      const instance = plainToInstance(UpdateModelMetadataDto, payload);
      const errors = await validate(instance);

      expect(errors).toHaveLength(1);
      expect(errors[0].property).toBe('contextWindow');
      expect(errors[0].constraints).toHaveProperty('min');
    });

    it('should fail when contextWindow is not a number', async () => {
      const payload = {
        contextWindow: 'not-a-number',
      };

      const instance = plainToInstance(UpdateModelMetadataDto, payload);
      const errors = await validate(instance);

      expect(errors.length).toBeGreaterThan(0);
      expect(errors[0].property).toBe('contextWindow');
    });

    it('should fail when maxOutputTokens is zero', async () => {
      const payload = {
        maxOutputTokens: 0,
      };

      const instance = plainToInstance(UpdateModelMetadataDto, payload);
      const errors = await validate(instance);

      expect(errors).toHaveLength(1);
      expect(errors[0].property).toBe('maxOutputTokens');
      expect(errors[0].constraints).toHaveProperty('min');
    });

    it('should fail when maxOutputTokens is negative', async () => {
      const payload = {
        maxOutputTokens: -512,
      };

      const instance = plainToInstance(UpdateModelMetadataDto, payload);
      const errors = await validate(instance);

      expect(errors).toHaveLength(1);
      expect(errors[0].property).toBe('maxOutputTokens');
      expect(errors[0].constraints).toHaveProperty('min');
    });

    it('should fail when maxOutputTokens is not a number', async () => {
      const payload = {
        maxOutputTokens: 'not-a-number',
      };

      const instance = plainToInstance(UpdateModelMetadataDto, payload);
      const errors = await validate(instance);

      expect(errors.length).toBeGreaterThan(0);
      expect(errors[0].property).toBe('maxOutputTokens');
    });

    it('should fail when knowledgeCutoff is not a string', async () => {
      const payload = {
        knowledgeCutoff: 12345,
      };

      const instance = plainToInstance(UpdateModelMetadataDto, payload);
      const errors = await validate(instance);

      expect(errors.length).toBeGreaterThan(0);
      expect(errors[0].property).toBe('knowledgeCutoff');
      expect(errors[0].constraints).toHaveProperty('isString');
    });
  });

  describe('UpdateModelDeveloperDto', () => {
    it('should validate correct payload', async () => {
      const payload = {
        name: 'OpenAI',
        link: 'https://openai.com',
        imageUrl: 'https://openai.com/logo.png',
      };

      const instance = plainToInstance(UpdateModelDeveloperDto, payload);
      const errors = await validate(instance);

      expect(errors).toHaveLength(0);
      expect(instance.name).toBe('OpenAI');
      expect(instance.link).toBe('https://openai.com');
      expect(instance.imageUrl).toBe('https://openai.com/logo.png');
    });

    it('should validate empty payload for optional fields', async () => {
      const payload = {};

      const instance = plainToInstance(UpdateModelDeveloperDto, payload);
      const errors = await validate(instance);

      expect(errors).toHaveLength(0);
      expect(instance.name).toBeUndefined();
      expect(instance.link).toBeUndefined();
      expect(instance.imageUrl).toBeUndefined();
    });

    it('should validate when name is provided and within length', async () => {
      const payload = {
        name: 'a'.repeat(100),
      };

      const instance = plainToInstance(UpdateModelDeveloperDto, payload);
      const errors = await validate(instance);

      expect(errors).toHaveLength(0);
      expect(instance.name?.length).toBe(100);
    });

    it('should fail when name exceeds max length', async () => {
      const payload = {
        name: 'a'.repeat(101),
      };

      const instance = plainToInstance(UpdateModelDeveloperDto, payload);
      const errors = await validate(instance);

      expect(errors).toHaveLength(1);
      expect(errors[0].property).toBe('name');
      expect(errors[0].constraints).toHaveProperty('maxLength');
    });

    it('should fail when name is not a string', async () => {
      const payload = {
        name: 12345,
      };

      const instance = plainToInstance(UpdateModelDeveloperDto, payload);
      const errors = await validate(instance);

      expect(errors.length).toBeGreaterThan(0);
      expect(errors[0].property).toBe('name');
      expect(errors[0].constraints).toHaveProperty('isString');
    });

    it('should fail when link is not a valid URL', async () => {
      const payload = {
        link: 'not-a-url',
      };

      const instance = plainToInstance(UpdateModelDeveloperDto, payload);
      const errors = await validate(instance);

      expect(errors).toHaveLength(1);
      expect(errors[0].property).toBe('link');
      expect(errors[0].constraints).toHaveProperty('isUrl');
    });

    it('should validate partial update with only imageUrl', async () => {
      const payload = {
        imageUrl: 'https://openai.com/logo.png',
      };

      const instance = plainToInstance(UpdateModelDeveloperDto, payload);
      const errors = await validate(instance);

      expect(errors).toHaveLength(0);
      expect(instance.imageUrl).toBe('https://openai.com/logo.png');
    });

    it('should fail when imageUrl is not a valid URL', async () => {
      const payload = {
        imageUrl: 'not-a-url',
      };

      const instance = plainToInstance(UpdateModelDeveloperDto, payload);
      const errors = await validate(instance);

      expect(errors).toHaveLength(1);
      expect(errors[0].property).toBe('imageUrl');
      expect(errors[0].constraints).toHaveProperty('isUrl');
    });

    it('should validate partial update with only link', async () => {
      const payload = {
        link: 'https://example.com',
      };

      const instance = plainToInstance(UpdateModelDeveloperDto, payload);
      const errors = await validate(instance);

      expect(errors).toHaveLength(0);
      expect(instance.link).toBe('https://example.com');
    });
  });

  describe('UpdateModelReqDto', () => {
    const validPayload = {
      name: 'GPT-4 Updated',
      shortName: 'gpt-4-upd',
      value: 'gpt-4-turbo-updated',
      link: 'https://openai.com/gpt-4',
      guestAccess: true,
      price: {
        input: 0.03,
        output: 0.06,
      },
      metadata: {
        contextWindow: 8192,
        maxOutputTokens: 4096,
        knowledgeCutoff: '2024-01-01',
      },
      developerId: '550e8400-e29b-41d4-a716-446655440000',
    };

    it('should validate correct payload with all fields', async () => {
      const instance = plainToInstance(UpdateModelReqDto, validPayload);
      const errors = await validate(instance);

      expect(errors).toHaveLength(0);
      expect(instance.name).toBe('GPT-4 Updated');
      expect(instance.shortName).toBe('gpt-4-upd');
      expect(instance.value).toBe('gpt-4-turbo-updated');
      expect(instance.price?.input).toBe(0.03);
    });

    it('should validate empty payload for optional fields', async () => {
      const payload = {};

      const instance = plainToInstance(UpdateModelReqDto, payload);
      const errors = await validate(instance);

      expect(errors).toHaveLength(0);
      expect(instance.name).toBeUndefined();
      expect(instance.shortName).toBeUndefined();
      expect(instance.value).toBeUndefined();
    });

    it('should validate partial update with name only', async () => {
      const payload = { name: 'GPT-5' };
      const instance = plainToInstance(UpdateModelReqDto, payload);
      const errors = await validate(instance);

      expect(errors).toHaveLength(0);
      expect(instance.name).toBe('GPT-5');
    });

    it('should fail when name exceeds max length', async () => {
      const payload = { name: 'a'.repeat(101) };
      const instance = plainToInstance(UpdateModelReqDto, payload);
      const errors = await validate(instance);

      expect(errors).toHaveLength(1);
      expect(errors[0].property).toBe('name');
      expect(errors[0].constraints).toHaveProperty('maxLength');
    });

    it('should fail when name is not a string', async () => {
      const payload = { name: 12345 };
      const instance = plainToInstance(UpdateModelReqDto, payload);
      const errors = await validate(instance);

      expect(errors.length).toBeGreaterThan(0);
      expect(errors[0].property).toBe('name');
    });

    it('should validate partial update with shortName only', async () => {
      const payload = { shortName: 'gpt5' };
      const instance = plainToInstance(UpdateModelReqDto, payload);
      const errors = await validate(instance);

      expect(errors).toHaveLength(0);
      expect(instance.shortName).toBe('gpt5');
    });

    it('should fail when shortName exceeds max length', async () => {
      const payload = { shortName: 'a'.repeat(21) };
      const instance = plainToInstance(UpdateModelReqDto, payload);
      const errors = await validate(instance);

      expect(errors).toHaveLength(1);
      expect(errors[0].property).toBe('shortName');
      expect(errors[0].constraints).toHaveProperty('maxLength');
    });

    it('should fail when shortName is not a string', async () => {
      const payload = { shortName: 12345 };
      const instance = plainToInstance(UpdateModelReqDto, payload);
      const errors = await validate(instance);

      expect(errors.length).toBeGreaterThan(0);
      expect(errors[0].property).toBe('shortName');
    });

    it('should validate partial update with value only', async () => {
      const payload = { value: 'gpt5-turbo' };
      const instance = plainToInstance(UpdateModelReqDto, payload);
      const errors = await validate(instance);

      expect(errors).toHaveLength(0);
      expect(instance.value).toBe('gpt5-turbo');
    });

    it('should fail when value exceeds max length', async () => {
      const payload = { value: 'a'.repeat(101) };
      const instance = plainToInstance(UpdateModelReqDto, payload);
      const errors = await validate(instance);

      expect(errors).toHaveLength(1);
      expect(errors[0].property).toBe('value');
      expect(errors[0].constraints).toHaveProperty('maxLength');
    });

    it('should fail when value is not a string', async () => {
      const payload = { value: 12345 };
      const instance = plainToInstance(UpdateModelReqDto, payload);
      const errors = await validate(instance);

      expect(errors.length).toBeGreaterThan(0);
      expect(errors[0].property).toBe('value');
    });

    it('should fail when link is not a valid URL', async () => {
      const payload = { link: 'not-a-url' };
      const instance = plainToInstance(UpdateModelReqDto, payload);
      const errors = await validate(instance);

      expect(errors).toHaveLength(1);
      expect(errors[0].property).toBe('link');
      expect(errors[0].constraints).toHaveProperty('isUrl');
    });

    it('should validate partial update with link only', async () => {
      const payload = { link: 'https://example.com' };
      const instance = plainToInstance(UpdateModelReqDto, payload);
      const errors = await validate(instance);

      expect(errors).toHaveLength(0);
      expect(instance.link).toBe('https://example.com');
    });

    it('should fail when guestAccess is not a boolean', async () => {
      const payload = { guestAccess: 'true' };
      const instance = plainToInstance(UpdateModelReqDto, payload);
      const errors = await validate(instance);

      expect(errors.length).toBeGreaterThan(0);
      expect(errors[0].property).toBe('guestAccess');
      expect(errors[0].constraints).toHaveProperty('isBoolean');
    });

    it('should validate partial update with supportsTemperature only', async () => {
      const payload = { supportsTemperature: true };
      const instance = plainToInstance(UpdateModelReqDto, payload);
      const errors = await validate(instance);

      expect(errors).toHaveLength(0);
      expect(instance.supportsTemperature).toBe(true);
    });

    it('should validate supportsTemperature as false', async () => {
      const payload = { supportsTemperature: false };
      const instance = plainToInstance(UpdateModelReqDto, payload);
      const errors = await validate(instance);

      expect(errors).toHaveLength(0);
      expect(instance.supportsTemperature).toBe(false);
    });

    it('should fail when supportsTemperature is not a boolean', async () => {
      const payload = { supportsTemperature: 'true' };
      const instance = plainToInstance(UpdateModelReqDto, payload);
      const errors = await validate(instance);

      expect(errors.length).toBeGreaterThan(0);
      expect(errors[0].property).toBe('supportsTemperature');
      expect(errors[0].constraints).toHaveProperty('isBoolean');
    });

    it('should fail when price is invalid', async () => {
      const payload = {
        price: {
          input: -0.5,
          output: 0.06,
        },
      };

      const instance = plainToInstance(UpdateModelReqDto, payload);
      const errors = await validate(instance);

      expect(errors.length).toBeGreaterThan(0);
      const priceError = errors.find((e) => e.property === 'price');
      expect(priceError).toBeDefined();
    });

    it('should fail when metadata is invalid', async () => {
      const payload = {
        metadata: {
          contextWindow: 0,
          maxOutputTokens: 4096,
          knowledgeCutoff: '2024-01-01',
        },
      };

      const instance = plainToInstance(UpdateModelReqDto, payload);
      const errors = await validate(instance);

      expect(errors.length).toBeGreaterThan(0);
      const metadataError = errors.find((e) => e.property === 'metadata');
      expect(metadataError).toBeDefined();
    });

    it('should fail when developerId is not a valid UUID', async () => {
      const payload = {
        developerId: 'not-a-uuid',
      };

      const instance = plainToInstance(UpdateModelReqDto, payload);
      const errors = await validate(instance);

      expect(errors.length).toBeGreaterThan(0);
      expect(errors[0].property).toBe('developerId');
      expect(errors[0].constraints).toHaveProperty('isUuid');
    });

    it('should validate successfully with partial name update', async () => {
      const payload = { name: 'GPT-4 New Name' };
      const instance = plainToInstance(UpdateModelReqDto, payload);
      const errors = await validate(instance);

      expect(errors).toHaveLength(0);
      expect(instance.name).toBe('GPT-4 New Name');
      expect(instance.shortName).toBeUndefined();
    });

    it('should validate successfully with partial price update', async () => {
      const payload = {
        price: {
          input: 0.05,
        },
      };

      const instance = plainToInstance(UpdateModelReqDto, payload);
      const errors = await validate(instance);

      expect(errors).toHaveLength(0);
      expect(instance.price?.input).toBe(0.05);
      expect(instance.price?.output).toBeUndefined();
    });

    it('should validate successfully with partial metadata update', async () => {
      const payload = {
        metadata: {
          contextWindow: 16384,
        },
      };

      const instance = plainToInstance(UpdateModelReqDto, payload);
      const errors = await validate(instance);

      expect(errors).toHaveLength(0);
      expect(instance.metadata?.contextWindow).toBe(16384);
      expect(instance.metadata?.maxOutputTokens).toBeUndefined();
    });

    it('should validate boundary value for name at max length', async () => {
      const payload = { name: 'a'.repeat(100) };
      const instance = plainToInstance(UpdateModelReqDto, payload);
      const errors = await validate(instance);

      expect(errors).toHaveLength(0);
      expect(instance.name?.length).toBe(100);
    });

    it('should validate boundary value for shortName at max length', async () => {
      const payload = { shortName: 'a'.repeat(20) };
      const instance = plainToInstance(UpdateModelReqDto, payload);
      const errors = await validate(instance);

      expect(errors).toHaveLength(0);
      expect(instance.shortName?.length).toBe(20);
    });

    it('should validate boundary value for value at max length', async () => {
      const payload = { value: 'a'.repeat(100) };
      const instance = plainToInstance(UpdateModelReqDto, payload);
      const errors = await validate(instance);

      expect(errors).toHaveLength(0);
      expect(instance.value?.length).toBe(100);
    });

    it('should require reasoningLevel when isReasoning is true', async () => {
      const payload = {
        isReasoning: true,
        reasoningLevel: undefined,
      };

      const instance = plainToInstance(UpdateModelReqDto, payload);
      const errors = await validate(instance);

      expect(errors.length).toBeGreaterThan(0);
      const reasoningLevelError = errors.find(
        (e) => e.property === 'reasoningLevel',
      );
      expect(reasoningLevelError).toBeDefined();
      expect(reasoningLevelError?.constraints).toHaveProperty(
        'isReasoningLevelRequired',
      );
    });

    it('should require reasoningLevel to be non-empty when isReasoning is true', async () => {
      const payload = {
        isReasoning: true,
        reasoningLevel: '',
      };

      const instance = plainToInstance(UpdateModelReqDto, payload);
      const errors = await validate(instance);

      expect(errors.length).toBeGreaterThan(0);
      const reasoningLevelError = errors.find(
        (e) => e.property === 'reasoningLevel',
      );
      expect(reasoningLevelError).toBeDefined();
    });

    it('should require reasoningLevel to be non-whitespace when isReasoning is true', async () => {
      const payload = {
        isReasoning: true,
        reasoningLevel: '   ',
      };

      const instance = plainToInstance(UpdateModelReqDto, payload);
      const errors = await validate(instance);

      expect(errors.length).toBeGreaterThan(0);
      const reasoningLevelError = errors.find(
        (e) => e.property === 'reasoningLevel',
      );
      expect(reasoningLevelError).toBeDefined();
    });

    it('should fail when reasoningLevel is not in allowed values when isReasoning is true', async () => {
      const payload = {
        isReasoning: true,
        reasoningLevel: 'invalid',
      };

      const instance = plainToInstance(UpdateModelReqDto, payload);
      const errors = await validate(instance);

      expect(errors.length).toBeGreaterThan(0);
      const reasoningLevelError = errors.find(
        (e) => e.property === 'reasoningLevel',
      );
      expect(reasoningLevelError).toBeDefined();
      expect(reasoningLevelError?.constraints).toHaveProperty('isIn');
    });

    it('should allow reasoningLevel to be undefined when isReasoning is false', async () => {
      const payload = {
        isReasoning: false,
        reasoningLevel: undefined,
      };

      const instance = plainToInstance(UpdateModelReqDto, payload);
      const errors = await validate(instance);

      expect(errors).toHaveLength(0);
    });

    it('should allow reasoningLevel to be null when isReasoning is false', async () => {
      const payload = {
        isReasoning: false,
        reasoningLevel: null,
      };

      const instance = plainToInstance(UpdateModelReqDto, payload);
      const errors = await validate(instance);

      expect(errors).toHaveLength(0);
    });

    it('should allow reasoningLevel to be undefined when isReasoning is undefined', async () => {
      const payload = {};

      const instance = plainToInstance(UpdateModelReqDto, payload);
      const errors = await validate(instance);

      expect(errors).toHaveLength(0);
    });

    it.each([
      ['minimal'],
      ['low'],
      ['medium'],
      ['high'],
    ])('should validate successfully with %s reasoningLevel when isReasoning is true', async (level) => {
      const payload = {
        isReasoning: true,
        reasoningLevel: level,
      };

      const instance = plainToInstance(UpdateModelReqDto, payload);
      const errors = await validate(instance);

      expect(errors).toHaveLength(0);
      expect(instance.isReasoning).toBe(true);
      expect(instance.reasoningLevel).toBe(level);
    });

    it('should validate successfully with isReasoning and reasoningLevel together', async () => {
      const payload = {
        isReasoning: true,
        reasoningLevel: 'high',
        name: 'GPT-4 Turbo',
      };

      const instance = plainToInstance(UpdateModelReqDto, payload);
      const errors = await validate(instance);

      expect(errors).toHaveLength(0);
      expect(instance.isReasoning).toBe(true);
      expect(instance.reasoningLevel).toBe('high');
    });
  });
});
