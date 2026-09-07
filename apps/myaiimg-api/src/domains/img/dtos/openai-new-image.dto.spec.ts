import { validate } from 'class-validator';
import { plainToInstance } from 'class-transformer';
import {
  OpenAINewImageReqDto,
  OpenAIModelOptionsReqDto,
} from './openai-new-image.dto';

describe('OpenAIModelOptionsReqDto', () => {
  describe('Valid payloads', () => {
    it('should validate successfully with valid size and quality', async () => {
      const payload = {
        size: '1024x1024',
        quality: 'high',
      };

      const instance = plainToInstance(OpenAIModelOptionsReqDto, payload);
      const errors = await validate(instance);

      expect(errors.length).toBe(0);
      expect(instance.size).toBe('1024x1024');
      expect(instance.quality).toBe('high');
    });

    it('should validate successfully with all valid size options', async () => {
      const validSizes = ['1024x1024', '1536x1024', '1024x1536'];

      for (const size of validSizes) {
        const payload = {
          size,
          quality: 'auto',
        };

        const instance = plainToInstance(OpenAIModelOptionsReqDto, payload);
        const errors = await validate(instance);

        expect(errors.length).toBe(0);
        expect(instance.size).toBe(size);
      }
    });

    it('should validate successfully with all valid quality options', async () => {
      const validQualities = ['low', 'medium', 'high', 'auto'];

      for (const quality of validQualities) {
        const payload = {
          size: '1024x1024',
          quality,
        };

        const instance = plainToInstance(OpenAIModelOptionsReqDto, payload);
        const errors = await validate(instance);

        expect(errors.length).toBe(0);
        expect(instance.quality).toBe(quality);
      }
    });
  });

  describe('Invalid payloads - size field', () => {
    it('should fail when size is missing', async () => {
      const payload = {
        quality: 'high',
      };

      const instance = plainToInstance(OpenAIModelOptionsReqDto, payload);
      const errors = await validate(instance);

      expect(errors.length).toBeGreaterThan(0);
      const sizeError = errors.find((err) => err.property === 'size');
      expect(sizeError).toBeDefined();
      expect(sizeError?.constraints).toHaveProperty('isString');
    });

    it('should fail when size is not a string', async () => {
      const payload = {
        size: 1024,
        quality: 'high',
      };

      const instance = plainToInstance(OpenAIModelOptionsReqDto, payload);
      const errors = await validate(instance);

      expect(errors.length).toBeGreaterThan(0);
      const sizeError = errors.find((err) => err.property === 'size');
      expect(sizeError).toBeDefined();
      expect(sizeError?.constraints).toHaveProperty('isString');
    });

    it('should fail when size is not in allowed values', async () => {
      const payload = {
        size: '2048x2048',
        quality: 'high',
      };

      const instance = plainToInstance(OpenAIModelOptionsReqDto, payload);
      const errors = await validate(instance);

      expect(errors.length).toBeGreaterThan(0);
      const sizeError = errors.find((err) => err.property === 'size');
      expect(sizeError).toBeDefined();
      expect(sizeError?.constraints).toHaveProperty('isIn');
    });

    it('should fail when size is empty string', async () => {
      const payload = {
        size: '',
        quality: 'high',
      };

      const instance = plainToInstance(OpenAIModelOptionsReqDto, payload);
      const errors = await validate(instance);

      expect(errors.length).toBeGreaterThan(0);
      const sizeError = errors.find((err) => err.property === 'size');
      expect(sizeError).toBeDefined();
      expect(sizeError?.constraints).toHaveProperty('isIn');
    });
  });

  describe('Invalid payloads - quality field', () => {
    it('should fail when quality is missing', async () => {
      const payload = {
        size: '1024x1024',
      };

      const instance = plainToInstance(OpenAIModelOptionsReqDto, payload);
      const errors = await validate(instance);

      expect(errors.length).toBeGreaterThan(0);
      const qualityError = errors.find((err) => err.property === 'quality');
      expect(qualityError).toBeDefined();
      expect(qualityError?.constraints).toHaveProperty('isString');
    });

    it('should fail when quality is not a string', async () => {
      const payload = {
        size: '1024x1024',
        quality: 100,
      };

      const instance = plainToInstance(OpenAIModelOptionsReqDto, payload);
      const errors = await validate(instance);

      expect(errors.length).toBeGreaterThan(0);
      const qualityError = errors.find((err) => err.property === 'quality');
      expect(qualityError).toBeDefined();
      expect(qualityError?.constraints).toHaveProperty('isString');
    });

    it('should fail when quality is not in allowed values', async () => {
      const payload = {
        size: '1024x1024',
        quality: 'ultra',
      };

      const instance = plainToInstance(OpenAIModelOptionsReqDto, payload);
      const errors = await validate(instance);

      expect(errors.length).toBeGreaterThan(0);
      const qualityError = errors.find((err) => err.property === 'quality');
      expect(qualityError).toBeDefined();
      expect(qualityError?.constraints).toHaveProperty('isIn');
    });

    it('should fail when quality is empty string', async () => {
      const payload = {
        size: '1024x1024',
        quality: '',
      };

      const instance = plainToInstance(OpenAIModelOptionsReqDto, payload);
      const errors = await validate(instance);

      expect(errors.length).toBeGreaterThan(0);
      const qualityError = errors.find((err) => err.property === 'quality');
      expect(qualityError).toBeDefined();
      expect(qualityError?.constraints).toHaveProperty('isIn');
    });
  });
});

describe('OpenAINewImageReqDto', () => {
  describe('Valid payloads', () => {
    it('should validate successfully with all required fields', async () => {
      const payload = {
        prompt: 'A beautiful sunset over the ocean',
        model: 'gpt-image-1.5',
        options: JSON.stringify({
          size: '1024x1024',
          quality: 'high',
        }),
      };

      const instance = plainToInstance(OpenAINewImageReqDto, payload);
      const errors = await validate(instance);

      expect(errors.length).toBe(0);
      expect(instance.prompt).toBe('A beautiful sunset over the ocean');
      expect(instance.model).toBe('gpt-image-1.5');
      expect(instance.options.size).toBe('1024x1024');
      expect(instance.options.quality).toBe('high');
    });

    it('should validate successfully with options as object', async () => {
      const payload = {
        prompt: 'A mountain landscape',
        model: 'gpt-image-1-mini',
        options: {
          size: '1536x1024',
          quality: 'medium',
        },
      };

      const instance = plainToInstance(OpenAINewImageReqDto, payload);
      const errors = await validate(instance);

      expect(errors.length).toBe(0);
      expect(instance.prompt).toBe('A mountain landscape');
      expect(instance.model).toBe('gpt-image-1-mini');
      expect(instance.options.size).toBe('1536x1024');
      expect(instance.options.quality).toBe('medium');
    });

    it('should validate successfully with optional lastGeneratedImageKey', async () => {
      const payload = {
        prompt: 'A starry night sky',
        model: 'gpt-image-1.5',
        options: JSON.stringify({
          size: '1024x1536',
          quality: 'auto',
        }),
        lastGeneratedImageKey: 'previous-image-key-456',
      };

      const instance = plainToInstance(OpenAINewImageReqDto, payload);
      const errors = await validate(instance);

      expect(errors.length).toBe(0);
      expect(instance.prompt).toBe('A starry night sky');
      expect(instance.lastGeneratedImageKey).toBe('previous-image-key-456');
    });

    it('should validate successfully with both valid model options', async () => {
      const validModels = ['gpt-image-1.5', 'gpt-image-1-mini'];

      for (const model of validModels) {
        const payload = {
          prompt: 'Test prompt',
          model,
          options: JSON.stringify({
            size: '1024x1024',
            quality: 'low',
          }),
        };

        const instance = plainToInstance(OpenAINewImageReqDto, payload);
        const errors = await validate(instance);

        expect(errors.length).toBe(0);
        expect(instance.model).toBe(model);
      }
    });
  });

  describe('Invalid payloads - prompt field', () => {
    it('should fail when prompt is missing', async () => {
      const payload = {
        model: 'gpt-image-1.5',
        options: JSON.stringify({
          size: '1024x1024',
          quality: 'high',
        }),
      };

      const instance = plainToInstance(OpenAINewImageReqDto, payload);
      const errors = await validate(instance);

      expect(errors.length).toBeGreaterThan(0);
      const promptError = errors.find((err) => err.property === 'prompt');
      expect(promptError).toBeDefined();
      expect(promptError?.constraints).toHaveProperty('isString');
    });

    it('should fail when prompt is not a string', async () => {
      const payload = {
        prompt: 12345,
        model: 'gpt-image-1.5',
        options: JSON.stringify({
          size: '1024x1024',
          quality: 'high',
        }),
      };

      const instance = plainToInstance(OpenAINewImageReqDto, payload);
      const errors = await validate(instance);

      expect(errors.length).toBeGreaterThan(0);
      const promptError = errors.find((err) => err.property === 'prompt');
      expect(promptError).toBeDefined();
      expect(promptError?.constraints).toHaveProperty('isString');
    });

    it('should fail when prompt is empty string', async () => {
      const payload = {
        prompt: '',
        model: 'gpt-image-1.5',
        options: JSON.stringify({
          size: '1024x1024',
          quality: 'high',
        }),
      };

      const instance = plainToInstance(OpenAINewImageReqDto, payload);
      const errors = await validate(instance);

      expect(errors.length).toBe(0);
    });

    it('should fail when prompt is null', async () => {
      const payload = {
        prompt: null,
        model: 'gpt-image-1.5',
        options: JSON.stringify({
          size: '1024x1024',
          quality: 'high',
        }),
      };

      const instance = plainToInstance(OpenAINewImageReqDto, payload);
      const errors = await validate(instance);

      expect(errors.length).toBeGreaterThan(0);
      const promptError = errors.find((err) => err.property === 'prompt');
      expect(promptError).toBeDefined();
      expect(promptError?.constraints).toHaveProperty('isString');
    });
  });

  describe('Invalid payloads - model field', () => {
    it('should fail when model is missing', async () => {
      const payload = {
        prompt: 'A beautiful landscape',
        options: JSON.stringify({
          size: '1024x1024',
          quality: 'high',
        }),
      };

      const instance = plainToInstance(OpenAINewImageReqDto, payload);
      const errors = await validate(instance);

      expect(errors.length).toBeGreaterThan(0);
      const modelError = errors.find((err) => err.property === 'model');
      expect(modelError).toBeDefined();
      expect(modelError?.constraints).toHaveProperty('isIn');
    });

    it('should fail when model is not in allowed values', async () => {
      const payload = {
        prompt: 'A beautiful landscape',
        model: 'invalid-model',
        options: JSON.stringify({
          size: '1024x1024',
          quality: 'high',
        }),
      };

      const instance = plainToInstance(OpenAINewImageReqDto, payload);
      const errors = await validate(instance);

      expect(errors.length).toBeGreaterThan(0);
      const modelError = errors.find((err) => err.property === 'model');
      expect(modelError).toBeDefined();
      expect(modelError?.constraints).toHaveProperty('isIn');
    });

    it('should fail when model is empty string', async () => {
      const payload = {
        prompt: 'A beautiful landscape',
        model: '',
        options: JSON.stringify({
          size: '1024x1024',
          quality: 'high',
        }),
      };

      const instance = plainToInstance(OpenAINewImageReqDto, payload);
      const errors = await validate(instance);

      expect(errors.length).toBeGreaterThan(0);
      const modelError = errors.find((err) => err.property === 'model');
      expect(modelError).toBeDefined();
      expect(modelError?.constraints).toHaveProperty('isIn');
    });

    it('should fail when model is null', async () => {
      const payload = {
        prompt: 'A beautiful landscape',
        model: null,
        options: JSON.stringify({
          size: '1024x1024',
          quality: 'high',
        }),
      };

      const instance = plainToInstance(OpenAINewImageReqDto, payload);
      const errors = await validate(instance);

      expect(errors.length).toBeGreaterThan(0);
      const modelError = errors.find((err) => err.property === 'model');
      expect(modelError).toBeDefined();
      expect(modelError?.constraints).toHaveProperty('isIn');
    });
  });

  describe('Invalid payloads - options field', () => {
    it('should fail when options has invalid nested size', async () => {
      const payload = {
        prompt: 'A beautiful landscape',
        model: 'gpt-image-1.5',
        options: JSON.stringify({
          size: 'invalid-size',
          quality: 'high',
        }),
      };

      const instance = plainToInstance(OpenAINewImageReqDto, payload);
      const errors = await validate(instance);

      expect(errors.length).toBeGreaterThan(0);
      const optionsError = errors.find((err) => err.property === 'options');
      expect(optionsError).toBeDefined();
      expect(optionsError?.children).toBeDefined();
    });

    it('should fail when options has invalid nested quality', async () => {
      const payload = {
        prompt: 'A beautiful landscape',
        model: 'gpt-image-1.5',
        options: JSON.stringify({
          size: '1024x1024',
          quality: 'invalid-quality',
        }),
      };

      const instance = plainToInstance(OpenAINewImageReqDto, payload);
      const errors = await validate(instance);

      expect(errors.length).toBeGreaterThan(0);
      const optionsError = errors.find((err) => err.property === 'options');
      expect(optionsError).toBeDefined();
      expect(optionsError?.children).toBeDefined();
    });

    it('should fail when options is invalid JSON string', async () => {
      const payload = {
        prompt: 'A beautiful landscape',
        model: 'gpt-image-1.5',
        options: 'invalid-json',
      };

      expect(() => {
        plainToInstance(OpenAINewImageReqDto, payload);
      }).toThrow(SyntaxError);
    });
  });

  describe('Invalid payloads - lastGeneratedImageKey field', () => {
    it('should fail when lastGeneratedImageKey is not a string', async () => {
      const payload = {
        prompt: 'A beautiful landscape',
        model: 'gpt-image-1.5',
        options: JSON.stringify({
          size: '1024x1024',
          quality: 'high',
        }),
        lastGeneratedImageKey: 12345,
      };

      const instance = plainToInstance(OpenAINewImageReqDto, payload);
      const errors = await validate(instance);

      expect(errors.length).toBeGreaterThan(0);
      const keyError = errors.find(
        (err) => err.property === 'lastGeneratedImageKey',
      );
      expect(keyError).toBeDefined();
      expect(keyError?.constraints).toHaveProperty('isString');
    });

    it('should fail when lastGeneratedImageKey is an array', async () => {
      const payload = {
        prompt: 'A beautiful landscape',
        model: 'gpt-image-1.5',
        options: JSON.stringify({
          size: '1024x1024',
          quality: 'high',
        }),
        lastGeneratedImageKey: ['key1', 'key2'],
      };

      const instance = plainToInstance(OpenAINewImageReqDto, payload);
      const errors = await validate(instance);

      expect(errors.length).toBeGreaterThan(0);
      const keyError = errors.find(
        (err) => err.property === 'lastGeneratedImageKey',
      );
      expect(keyError).toBeDefined();
      expect(keyError?.constraints).toHaveProperty('isString');
    });
  });

  describe('Edge cases', () => {
    it('should validate successfully when lastGeneratedImageKey is omitted', async () => {
      const payload = {
        prompt: 'A beautiful landscape',
        model: 'gpt-image-1.5',
        options: JSON.stringify({
          size: '1024x1024',
          quality: 'high',
        }),
      };

      const instance = plainToInstance(OpenAINewImageReqDto, payload);
      const errors = await validate(instance);

      expect(errors.length).toBe(0);
      expect(instance.lastGeneratedImageKey).toBeUndefined();
    });

    it('should validate successfully when lastGeneratedImageKey is empty string', async () => {
      const payload = {
        prompt: 'A beautiful landscape',
        model: 'gpt-image-1.5',
        options: JSON.stringify({
          size: '1024x1024',
          quality: 'high',
        }),
        lastGeneratedImageKey: '',
      };

      const instance = plainToInstance(OpenAINewImageReqDto, payload);
      const errors = await validate(instance);

      expect(errors.length).toBe(0);
      expect(instance.lastGeneratedImageKey).toBe('');
    });

    it('should handle very long prompt strings', async () => {
      const longPrompt = 'A'.repeat(10000);
      const payload = {
        prompt: longPrompt,
        model: 'gpt-image-1.5',
        options: JSON.stringify({
          size: '1024x1024',
          quality: 'high',
        }),
      };

      const instance = plainToInstance(OpenAINewImageReqDto, payload);
      const errors = await validate(instance);

      expect(errors.length).toBe(0);
      expect(instance.prompt).toBe(longPrompt);
    });

    it('should handle special characters in prompt', async () => {
      const specialPrompt = 'Test with special chars: @#$%^&*()[]{}!?<>"\'\n\t';
      const payload = {
        prompt: specialPrompt,
        model: 'gpt-image-1.5',
        options: JSON.stringify({
          size: '1024x1024',
          quality: 'high',
        }),
      };

      const instance = plainToInstance(OpenAINewImageReqDto, payload);
      const errors = await validate(instance);

      expect(errors.length).toBe(0);
      expect(instance.prompt).toBe(specialPrompt);
    });

    it('should handle Unicode characters in prompt', async () => {
      const unicodePrompt = '日本語のテキスト 🌸🌊🗻';
      const payload = {
        prompt: unicodePrompt,
        model: 'gpt-image-1.5',
        options: JSON.stringify({
          size: '1024x1024',
          quality: 'high',
        }),
      };

      const instance = plainToInstance(OpenAINewImageReqDto, payload);
      const errors = await validate(instance);

      expect(errors.length).toBe(0);
      expect(instance.prompt).toBe(unicodePrompt);
    });

    it('should validate successfully with different size and quality combinations', async () => {
      const combinations = [
        { size: '1024x1024', quality: 'low' },
        { size: '1536x1024', quality: 'medium' },
        { size: '1024x1536', quality: 'auto' },
      ];

      for (const { size, quality } of combinations) {
        const payload = {
          prompt: 'Test prompt',
          model: 'gpt-image-1.5',
          options: JSON.stringify({ size, quality }),
        };

        const instance = plainToInstance(OpenAINewImageReqDto, payload);
        const errors = await validate(instance);

        expect(errors.length).toBe(0);
        expect(instance.options.size).toBe(size);
        expect(instance.options.quality).toBe(quality);
      }
    });
  });
});
