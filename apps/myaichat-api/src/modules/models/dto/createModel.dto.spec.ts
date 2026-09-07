import 'reflect-metadata';
import { plainToInstance } from 'class-transformer';
import { validate } from 'class-validator';
import {
  CreateModelReqDto,
  CreateModelPriceDto,
  CreateModelMetadataDto,
  CreateModelDeveloperDto,
} from './createModel.dto';

describe('CreateModel DTOs', () => {
  describe('CreateModelPriceDto', () => {
    it('should validate correct payload', async () => {
      const payload = {
        input: 0.5,
        output: 1.5,
      };

      const instance = plainToInstance(CreateModelPriceDto, payload);
      const errors = await validate(instance);

      expect(errors).toHaveLength(0);
      expect(instance.input).toBe(0.5);
      expect(instance.output).toBe(1.5);
    });

    it('should fail when input is negative', async () => {
      const payload = {
        input: -0.5,
        output: 1.5,
      };

      const instance = plainToInstance(CreateModelPriceDto, payload);
      const errors = await validate(instance);

      expect(errors).toHaveLength(1);
      expect(errors[0].property).toBe('input');
      expect(errors[0].constraints).toHaveProperty('isPositive');
    });

    it('should fail when input is zero', async () => {
      const payload = {
        input: 0,
        output: 1.5,
      };

      const instance = plainToInstance(CreateModelPriceDto, payload);
      const errors = await validate(instance);

      expect(errors).toHaveLength(1);
      expect(errors[0].property).toBe('input');
      expect(errors[0].constraints).toHaveProperty('isPositive');
    });

    it('should fail when input is not a number', async () => {
      const payload = {
        input: 'not-a-number',
        output: 1.5,
      };

      const instance = plainToInstance(CreateModelPriceDto, payload);
      const errors = await validate(instance);

      expect(errors.length).toBeGreaterThan(0);
      expect(errors[0].property).toBe('input');
    });

    it('should fail when output is negative', async () => {
      const payload = {
        input: 0.5,
        output: -1.5,
      };

      const instance = plainToInstance(CreateModelPriceDto, payload);
      const errors = await validate(instance);

      expect(errors).toHaveLength(1);
      expect(errors[0].property).toBe('output');
      expect(errors[0].constraints).toHaveProperty('isPositive');
    });

    it('should fail when output is zero', async () => {
      const payload = {
        input: 0.5,
        output: 0,
      };

      const instance = plainToInstance(CreateModelPriceDto, payload);
      const errors = await validate(instance);

      expect(errors).toHaveLength(1);
      expect(errors[0].property).toBe('output');
      expect(errors[0].constraints).toHaveProperty('isPositive');
    });

    it('should fail when output is not a number', async () => {
      const payload = {
        input: 0.5,
        output: 'not-a-number',
      };

      const instance = plainToInstance(CreateModelPriceDto, payload);
      const errors = await validate(instance);

      expect(errors.length).toBeGreaterThan(0);
      expect(errors[0].property).toBe('output');
    });
  });

  describe('CreateModelMetadataDto', () => {
    it('should validate correct payload', async () => {
      const payload = {
        contextWindow: 4096,
        maxOutputTokens: 2048,
        knowledgeCutoff: '2024-01-01',
      };

      const instance = plainToInstance(CreateModelMetadataDto, payload);
      const errors = await validate(instance);

      expect(errors).toHaveLength(0);
      expect(instance.contextWindow).toBe(4096);
      expect(instance.maxOutputTokens).toBe(2048);
      expect(instance.knowledgeCutoff).toBe('2024-01-01');
    });

    it('should fail when contextWindow is zero', async () => {
      const payload = {
        contextWindow: 0,
        maxOutputTokens: 2048,
        knowledgeCutoff: '2024-01-01',
      };

      const instance = plainToInstance(CreateModelMetadataDto, payload);
      const errors = await validate(instance);

      expect(errors).toHaveLength(1);
      expect(errors[0].property).toBe('contextWindow');
      expect(errors[0].constraints).toHaveProperty('min');
    });

    it('should fail when contextWindow is negative', async () => {
      const payload = {
        contextWindow: -1024,
        maxOutputTokens: 2048,
        knowledgeCutoff: '2024-01-01',
      };

      const instance = plainToInstance(CreateModelMetadataDto, payload);
      const errors = await validate(instance);

      expect(errors).toHaveLength(1);
      expect(errors[0].property).toBe('contextWindow');
      expect(errors[0].constraints).toHaveProperty('min');
    });

    it('should fail when contextWindow is not a number', async () => {
      const payload = {
        contextWindow: 'not-a-number',
        maxOutputTokens: 2048,
        knowledgeCutoff: '2024-01-01',
      };

      const instance = plainToInstance(CreateModelMetadataDto, payload);
      const errors = await validate(instance);

      expect(errors.length).toBeGreaterThan(0);
      expect(errors[0].property).toBe('contextWindow');
    });

    it('should fail when maxOutputTokens is zero', async () => {
      const payload = {
        contextWindow: 4096,
        maxOutputTokens: 0,
        knowledgeCutoff: '2024-01-01',
      };

      const instance = plainToInstance(CreateModelMetadataDto, payload);
      const errors = await validate(instance);

      expect(errors).toHaveLength(1);
      expect(errors[0].property).toBe('maxOutputTokens');
      expect(errors[0].constraints).toHaveProperty('min');
    });

    it('should fail when maxOutputTokens is negative', async () => {
      const payload = {
        contextWindow: 4096,
        maxOutputTokens: -512,
        knowledgeCutoff: '2024-01-01',
      };

      const instance = plainToInstance(CreateModelMetadataDto, payload);
      const errors = await validate(instance);

      expect(errors).toHaveLength(1);
      expect(errors[0].property).toBe('maxOutputTokens');
      expect(errors[0].constraints).toHaveProperty('min');
    });

    it('should fail when maxOutputTokens is not a number', async () => {
      const payload = {
        contextWindow: 4096,
        maxOutputTokens: 'not-a-number',
        knowledgeCutoff: '2024-01-01',
      };

      const instance = plainToInstance(CreateModelMetadataDto, payload);
      const errors = await validate(instance);

      expect(errors.length).toBeGreaterThan(0);
      expect(errors[0].property).toBe('maxOutputTokens');
    });

    it('should fail when knowledgeCutoff is not a string', async () => {
      const payload = {
        contextWindow: 4096,
        maxOutputTokens: 2048,
        knowledgeCutoff: 12345,
      };

      const instance = plainToInstance(CreateModelMetadataDto, payload);
      const errors = await validate(instance);

      expect(errors.length).toBeGreaterThan(0);
      expect(errors[0].property).toBe('knowledgeCutoff');
      expect(errors[0].constraints).toHaveProperty('isString');
    });

    it('should fail when knowledgeCutoff is empty string', async () => {
      const payload = {
        contextWindow: 4096,
        maxOutputTokens: 2048,
        knowledgeCutoff: '',
      };

      const instance = plainToInstance(CreateModelMetadataDto, payload);
      const errors = await validate(instance);

      expect(errors).toHaveLength(1);
      expect(errors[0].property).toBe('knowledgeCutoff');
      expect(errors[0].constraints).toHaveProperty('isNotEmpty');
    });
  });

  describe('CreateModelDeveloperDto', () => {
    it('should validate correct payload', async () => {
      const payload = {
        name: 'OpenAI',
        link: 'https://openai.com',
        imageUrl: 'https://openai.com/logo.png',
      };

      const instance = plainToInstance(CreateModelDeveloperDto, payload);
      const errors = await validate(instance);

      expect(errors).toHaveLength(0);
      expect(instance.name).toBe('OpenAI');
      expect(instance.link).toBe('https://openai.com');
      expect(instance.imageUrl).toBe('https://openai.com/logo.png');
    });

    it('should fail when name is empty', async () => {
      const payload = {
        name: '',
        link: 'https://openai.com',
        imageUrl: 'https://openai.com/logo.png',
      };

      const instance = plainToInstance(CreateModelDeveloperDto, payload);
      const errors = await validate(instance);

      expect(errors).toHaveLength(1);
      expect(errors[0].property).toBe('name');
      expect(errors[0].constraints).toHaveProperty('isNotEmpty');
    });

    it('should fail when name exceeds max length', async () => {
      const payload = {
        name: 'a'.repeat(101),
        link: 'https://openai.com',
        imageUrl: 'https://openai.com/logo.png',
      };

      const instance = plainToInstance(CreateModelDeveloperDto, payload);
      const errors = await validate(instance);

      expect(errors).toHaveLength(1);
      expect(errors[0].property).toBe('name');
      expect(errors[0].constraints).toHaveProperty('maxLength');
    });

    it('should fail when name is not a string', async () => {
      const payload = {
        name: 12345,
        link: 'https://openai.com',
        imageUrl: 'https://openai.com/logo.png',
      };

      const instance = plainToInstance(CreateModelDeveloperDto, payload);
      const errors = await validate(instance);

      expect(errors.length).toBeGreaterThan(0);
      expect(errors[0].property).toBe('name');
      expect(errors[0].constraints).toHaveProperty('isString');
    });

    it('should fail when link is not a valid URL', async () => {
      const payload = {
        name: 'OpenAI',
        link: 'not-a-url',
        imageUrl: 'https://openai.com/logo.png',
      };

      const instance = plainToInstance(CreateModelDeveloperDto, payload);
      const errors = await validate(instance);

      expect(errors).toHaveLength(1);
      expect(errors[0].property).toBe('link');
      expect(errors[0].constraints).toHaveProperty('isUrl');
    });

    it('should fail when link is empty', async () => {
      const payload = {
        name: 'OpenAI',
        link: '',
        imageUrl: 'https://openai.com/logo.png',
      };

      const instance = plainToInstance(CreateModelDeveloperDto, payload);
      const errors = await validate(instance);

      expect(errors.length).toBeGreaterThan(0);
      expect(errors[0].property).toBe('link');
    });

    it('should fail when imageUrl is not a valid URL', async () => {
      const payload = {
        name: 'OpenAI',
        link: 'https://openai.com',
        imageUrl: 'not-a-url',
      };

      const instance = plainToInstance(CreateModelDeveloperDto, payload);
      const errors = await validate(instance);

      expect(errors).toHaveLength(1);
      expect(errors[0].property).toBe('imageUrl');
      expect(errors[0].constraints).toHaveProperty('isUrl');
    });

    it('should fail when imageUrl is empty', async () => {
      const payload = {
        name: 'OpenAI',
        link: 'https://openai.com',
        imageUrl: '',
      };

      const instance = plainToInstance(CreateModelDeveloperDto, payload);
      const errors = await validate(instance);

      expect(errors.length).toBeGreaterThan(0);
      expect(errors[0].property).toBe('imageUrl');
    });
  });

  describe('CreateModelReqDto', () => {
    const validPayload = {
      name: 'GPT-4',
      shortName: 'gpt-4',
      value: 'gpt-4-turbo',
      link: 'https://openai.com/gpt-4',
      supportsTemperature: true,
      price: {
        input: 0.03,
        output: 0.06,
      },
      metadata: {
        contextWindow: 8192,
        maxOutputTokens: 4096,
        knowledgeCutoff: '2024-01-01',
      },
    };

    it('should validate correct payload with required fields only', async () => {
      const instance = plainToInstance(CreateModelReqDto, validPayload);
      const errors = await validate(instance);

      expect(errors).toHaveLength(0);
      expect(instance.name).toBe('GPT-4');
      expect(instance.shortName).toBe('gpt-4');
      expect(instance.value).toBe('gpt-4-turbo');
      expect(instance.link).toBe('https://openai.com/gpt-4');
      expect(instance.price.input).toBe(0.03);
      expect(instance.metadata.contextWindow).toBe(8192);
    });

    it('should validate correct payload with all fields', async () => {
      const payload = {
        ...validPayload,
        guestAccess: true,
        developerId: '550e8400-e29b-41d4-a716-446655440000',
        developer: {
          name: 'OpenAI',
          link: 'https://openai.com',
          imageUrl: 'https://openai.com/logo.png',
        },
      };

      const instance = plainToInstance(CreateModelReqDto, payload);
      const errors = await validate(instance);

      expect(errors).toHaveLength(0);
      expect(instance.guestAccess).toBe(true);
      expect(instance.developerId).toBe('550e8400-e29b-41d4-a716-446655440000');
      expect(instance.developer?.name).toBe('OpenAI');
    });

    it('should fail when name is empty', async () => {
      const payload = { ...validPayload, name: '' };
      const instance = plainToInstance(CreateModelReqDto, payload);
      const errors = await validate(instance);

      expect(errors.length).toBeGreaterThan(0);
      expect(errors[0].property).toBe('name');
    });

    it('should fail when name exceeds max length', async () => {
      const payload = { ...validPayload, name: 'a'.repeat(101) };
      const instance = plainToInstance(CreateModelReqDto, payload);
      const errors = await validate(instance);

      expect(errors.length).toBeGreaterThan(0);
      const nameError = errors.find((e) => e.property === 'name');
      expect(nameError).toBeDefined();
      expect(nameError?.constraints).toHaveProperty('maxLength');
    });

    it('should fail when name is not a string', async () => {
      const payload = { ...validPayload, name: 12345 };
      const instance = plainToInstance(CreateModelReqDto, payload);
      const errors = await validate(instance);

      expect(errors.length).toBeGreaterThan(0);
      expect(errors[0].property).toBe('name');
    });

    it('should fail when shortName is empty', async () => {
      const payload = { ...validPayload, shortName: '' };
      const instance = plainToInstance(CreateModelReqDto, payload);
      const errors = await validate(instance);

      expect(errors.length).toBeGreaterThan(0);
      expect(errors[0].property).toBe('shortName');
    });

    it('should fail when shortName exceeds max length', async () => {
      const payload = { ...validPayload, shortName: 'a'.repeat(21) };
      const instance = plainToInstance(CreateModelReqDto, payload);
      const errors = await validate(instance);

      expect(errors.length).toBeGreaterThan(0);
      const shortNameError = errors.find((e) => e.property === 'shortName');
      expect(shortNameError).toBeDefined();
      expect(shortNameError?.constraints).toHaveProperty('maxLength');
    });

    it('should fail when shortName is not a string', async () => {
      const payload = { ...validPayload, shortName: 12345 };
      const instance = plainToInstance(CreateModelReqDto, payload);
      const errors = await validate(instance);

      expect(errors.length).toBeGreaterThan(0);
      expect(errors[0].property).toBe('shortName');
    });

    it('should fail when value is empty', async () => {
      const payload = { ...validPayload, value: '' };
      const instance = plainToInstance(CreateModelReqDto, payload);
      const errors = await validate(instance);

      expect(errors.length).toBeGreaterThan(0);
      expect(errors[0].property).toBe('value');
    });

    it('should fail when value exceeds max length', async () => {
      const payload = { ...validPayload, value: 'a'.repeat(101) };
      const instance = plainToInstance(CreateModelReqDto, payload);
      const errors = await validate(instance);

      expect(errors.length).toBeGreaterThan(0);
      const valueError = errors.find((e) => e.property === 'value');
      expect(valueError).toBeDefined();
      expect(valueError?.constraints).toHaveProperty('maxLength');
    });

    it('should fail when value is not a string', async () => {
      const payload = { ...validPayload, value: 12345 };
      const instance = plainToInstance(CreateModelReqDto, payload);
      const errors = await validate(instance);

      expect(errors.length).toBeGreaterThan(0);
      expect(errors[0].property).toBe('value');
    });

    it('should fail when link is not a valid URL', async () => {
      const payload = { ...validPayload, link: 'not-a-url' };
      const instance = plainToInstance(CreateModelReqDto, payload);
      const errors = await validate(instance);

      expect(errors.length).toBeGreaterThan(0);
      const linkError = errors.find((e) => e.property === 'link');
      expect(linkError).toBeDefined();
      expect(linkError?.constraints).toHaveProperty('isUrl');
    });

    it('should fail when link is empty', async () => {
      const payload = { ...validPayload, link: '' };
      const instance = plainToInstance(CreateModelReqDto, payload);
      const errors = await validate(instance);

      expect(errors.length).toBeGreaterThan(0);
      expect(errors[0].property).toBe('link');
    });

    it('should fail when guestAccess is not a boolean', async () => {
      const payload = { ...validPayload, guestAccess: 'true' };
      const instance = plainToInstance(CreateModelReqDto, payload);
      const errors = await validate(instance);

      expect(errors.length).toBeGreaterThan(0);
      expect(errors[0].property).toBe('guestAccess');
      expect(errors[0].constraints).toHaveProperty('isBoolean');
    });

    it('should fail when price is invalid', async () => {
      const payload = {
        ...validPayload,
        price: {
          input: -0.5,
          output: 0.06,
        },
      };

      const instance = plainToInstance(CreateModelReqDto, payload);
      const errors = await validate(instance);

      expect(errors.length).toBeGreaterThan(0);
      const priceError = errors.find((e) => e.property === 'price');
      expect(priceError).toBeDefined();
    });

    it('should fail when metadata is invalid', async () => {
      const payload = {
        ...validPayload,
        metadata: {
          contextWindow: 0,
          maxOutputTokens: 4096,
          knowledgeCutoff: '2024-01-01',
        },
      };

      const instance = plainToInstance(CreateModelReqDto, payload);
      const errors = await validate(instance);

      expect(errors.length).toBeGreaterThan(0);
      const metadataError = errors.find((e) => e.property === 'metadata');
      expect(metadataError).toBeDefined();
    });

    it('should fail when developerId is not a valid UUID', async () => {
      const payload = {
        ...validPayload,
        developerId: 'not-a-uuid',
      };

      const instance = plainToInstance(CreateModelReqDto, payload);
      const errors = await validate(instance);

      expect(errors.length).toBeGreaterThan(0);
      const devIdError = errors.find((e) => e.property === 'developerId');
      expect(devIdError).toBeDefined();
      expect(devIdError?.constraints).toHaveProperty('isUuid');
    });

    it('should fail when developer is invalid', async () => {
      const payload = {
        ...validPayload,
        developer: {
          name: '',
          link: 'https://openai.com',
          imageUrl: 'https://openai.com/logo.png',
        },
      };

      const instance = plainToInstance(CreateModelReqDto, payload);
      const errors = await validate(instance);

      expect(errors.length).toBeGreaterThan(0);
      const devError = errors.find((e) => e.property === 'developer');
      expect(devError).toBeDefined();
    });

    it('should allow optional guestAccess to be omitted', async () => {
      const instance = plainToInstance(CreateModelReqDto, validPayload);
      const errors = await validate(instance);

      expect(errors).toHaveLength(0);
      expect(instance.guestAccess).toBeUndefined();
    });

    it('should allow optional developerId to be omitted', async () => {
      const instance = plainToInstance(CreateModelReqDto, validPayload);
      const errors = await validate(instance);

      expect(errors).toHaveLength(0);
      expect(instance.developerId).toBeUndefined();
    });

    it('should allow optional developer to be omitted', async () => {
      const instance = plainToInstance(CreateModelReqDto, validPayload);
      const errors = await validate(instance);

      expect(errors).toHaveLength(0);
      expect(instance.developer).toBeUndefined();
    });

    it('should validate successfully even with extra properties', async () => {
      const payload = {
        ...validPayload,
        extraProperty: 'should-be-ignored',
        anotherExtra: 12345,
      };

      const instance = plainToInstance(CreateModelReqDto, payload);
      const errors = await validate(instance);

      expect(errors).toHaveLength(0);
    });

    it('should validate boundary value for name at max length', async () => {
      const payload = { ...validPayload, name: 'a'.repeat(100) };
      const instance = plainToInstance(CreateModelReqDto, payload);
      const errors = await validate(instance);

      expect(errors).toHaveLength(0);
      expect(instance.name).toHaveLength(100);
    });

    it('should validate boundary value for shortName at max length', async () => {
      const payload = { ...validPayload, shortName: 'a'.repeat(20) };
      const instance = plainToInstance(CreateModelReqDto, payload);
      const errors = await validate(instance);

      expect(errors).toHaveLength(0);
      expect(instance.shortName).toHaveLength(20);
    });

    it('should validate boundary value for value at max length', async () => {
      const payload = { ...validPayload, value: 'a'.repeat(100) };
      const instance = plainToInstance(CreateModelReqDto, payload);
      const errors = await validate(instance);

      expect(errors).toHaveLength(0);
      expect(instance.value).toHaveLength(100);
    });
  });
});
