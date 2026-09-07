import { plainToInstance } from 'class-transformer';
import { validate } from 'class-validator';
import { UpdateAIFeaturesReqDto } from './updateAIFeatures.dto';

describe('UpdateAIFeaturesReqDto', () => {
  describe('valid payload', () => {
    it('should create a valid instance with both features enabled', async () => {
      const payload = {
        isWebSearch: true,
        isImageGeneration: true,
      };

      const instance = plainToInstance(UpdateAIFeaturesReqDto, payload);
      const errors = await validate(instance);

      expect(errors).toHaveLength(0);
      expect(instance.isWebSearch).toBe(true);
      expect(instance.isImageGeneration).toBe(true);
    });

    it('should create a valid instance with both features disabled', async () => {
      const payload = {
        isWebSearch: false,
        isImageGeneration: false,
      };

      const instance = plainToInstance(UpdateAIFeaturesReqDto, payload);
      const errors = await validate(instance);

      expect(errors).toHaveLength(0);
      expect(instance.isWebSearch).toBe(false);
      expect(instance.isImageGeneration).toBe(false);
    });

    it('should create a valid instance with mixed feature states', async () => {
      const payload = {
        isWebSearch: true,
        isImageGeneration: false,
      };

      const instance = plainToInstance(UpdateAIFeaturesReqDto, payload);
      const errors = await validate(instance);

      expect(errors).toHaveLength(0);
      expect(instance.isWebSearch).toBe(true);
      expect(instance.isImageGeneration).toBe(false);
    });
  });

  describe('isWebSearch field', () => {
    it('should fail validation when isWebSearch is not provided', async () => {
      const payload = {
        isImageGeneration: true,
      };

      const instance = plainToInstance(UpdateAIFeaturesReqDto, payload);
      const errors = await validate(instance);

      const webSearchError = errors.find((e) => e.property === 'isWebSearch');
      expect(webSearchError).toBeDefined();
      expect(webSearchError?.constraints).toHaveProperty('isBoolean');
    });

    it('should fail validation when isWebSearch is null', async () => {
      const payload = {
        isWebSearch: null,
        isImageGeneration: true,
      };

      const instance = plainToInstance(UpdateAIFeaturesReqDto, payload);
      const errors = await validate(instance);

      const webSearchError = errors.find((e) => e.property === 'isWebSearch');
      expect(webSearchError).toBeDefined();
      expect(webSearchError?.constraints).toHaveProperty('isBoolean');
    });

    it('should fail validation when isWebSearch is a string', async () => {
      const payload = {
        isWebSearch: 'true',
        isImageGeneration: true,
      };

      const instance = plainToInstance(UpdateAIFeaturesReqDto, payload);
      const errors = await validate(instance);

      const webSearchError = errors.find((e) => e.property === 'isWebSearch');
      expect(webSearchError).toBeDefined();
      expect(webSearchError?.constraints).toHaveProperty('isBoolean');
    });

    it('should fail validation when isWebSearch is a number', async () => {
      const payload = {
        isWebSearch: 1,
        isImageGeneration: true,
      };

      const instance = plainToInstance(UpdateAIFeaturesReqDto, payload);
      const errors = await validate(instance);

      const webSearchError = errors.find((e) => e.property === 'isWebSearch');
      expect(webSearchError).toBeDefined();
      expect(webSearchError?.constraints).toHaveProperty('isBoolean');
    });

    it('should fail validation when isWebSearch is an object', async () => {
      const payload = {
        isWebSearch: {},
        isImageGeneration: true,
      };

      const instance = plainToInstance(UpdateAIFeaturesReqDto, payload);
      const errors = await validate(instance);

      const webSearchError = errors.find((e) => e.property === 'isWebSearch');
      expect(webSearchError).toBeDefined();
      expect(webSearchError?.constraints).toHaveProperty('isBoolean');
    });
  });

  describe('isImageGeneration field', () => {
    it('should fail validation when isImageGeneration is not provided', async () => {
      const payload = {
        isWebSearch: true,
      };

      const instance = plainToInstance(UpdateAIFeaturesReqDto, payload);
      const errors = await validate(instance);

      const imageError = errors.find((e) => e.property === 'isImageGeneration');
      expect(imageError).toBeDefined();
      expect(imageError?.constraints).toHaveProperty('isBoolean');
    });

    it('should fail validation when isImageGeneration is null', async () => {
      const payload = {
        isWebSearch: true,
        isImageGeneration: null,
      };

      const instance = plainToInstance(UpdateAIFeaturesReqDto, payload);
      const errors = await validate(instance);

      const imageError = errors.find((e) => e.property === 'isImageGeneration');
      expect(imageError).toBeDefined();
      expect(imageError?.constraints).toHaveProperty('isBoolean');
    });

    it('should fail validation when isImageGeneration is a string', async () => {
      const payload = {
        isWebSearch: true,
        isImageGeneration: 'false',
      };

      const instance = plainToInstance(UpdateAIFeaturesReqDto, payload);
      const errors = await validate(instance);

      const imageError = errors.find((e) => e.property === 'isImageGeneration');
      expect(imageError).toBeDefined();
      expect(imageError?.constraints).toHaveProperty('isBoolean');
    });

    it('should fail validation when isImageGeneration is a number', async () => {
      const payload = {
        isWebSearch: true,
        isImageGeneration: 0,
      };

      const instance = plainToInstance(UpdateAIFeaturesReqDto, payload);
      const errors = await validate(instance);

      const imageError = errors.find((e) => e.property === 'isImageGeneration');
      expect(imageError).toBeDefined();
      expect(imageError?.constraints).toHaveProperty('isBoolean');
    });

    it('should fail validation when isImageGeneration is an array', async () => {
      const payload = {
        isWebSearch: true,
        isImageGeneration: [true],
      };

      const instance = plainToInstance(UpdateAIFeaturesReqDto, payload);
      const errors = await validate(instance);

      const imageError = errors.find((e) => e.property === 'isImageGeneration');
      expect(imageError).toBeDefined();
      expect(imageError?.constraints).toHaveProperty('isBoolean');
    });
  });

  describe('both fields missing', () => {
    it('should fail validation when both fields are missing', async () => {
      const payload = {};

      const instance = plainToInstance(UpdateAIFeaturesReqDto, payload);
      const errors = await validate(instance);

      expect(errors).toHaveLength(2);
      expect(errors.some((e) => e.property === 'isWebSearch')).toBe(true);
      expect(errors.some((e) => e.property === 'isImageGeneration')).toBe(true);
    });
  });
});
