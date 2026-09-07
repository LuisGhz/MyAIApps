import { validate } from 'class-validator';
import { plainToInstance } from 'class-transformer';
import {
  GeminiNewImageReqDto,
  GeminiModelOptionsReqDto,
} from './gemini-new-image.dto';

describe('GeminiModelOptionsReqDto', () => {
  describe('Valid payloads', () => {
    it('should validate successfully with valid size and aspectRatio', async () => {
      const payload = {
        size: '1K',
        aspectRatio: '16:9',
      };

      const instance = plainToInstance(GeminiModelOptionsReqDto, payload);
      const errors = await validate(instance);

      expect(errors.length).toBe(0);
      expect(instance.size).toBe('1K');
      expect(instance.aspectRatio).toBe('16:9');
    });

    it('should validate successfully with all valid size options', async () => {
      const validSizes = ['1K', '2K', '4K'];

      for (const size of validSizes) {
        const payload = {
          size,
          aspectRatio: '1:1',
        };

        const instance = plainToInstance(GeminiModelOptionsReqDto, payload);
        const errors = await validate(instance);

        expect(errors.length).toBe(0);
        expect(instance.size).toBe(size);
      }
    });

    it('should validate successfully with all valid aspectRatio options', async () => {
      const validAspectRatios = [
        '21:9',
        '16:9',
        '4:3',
        '3:2',
        '1:1',
        '9:16',
        '3:4',
        '2:3',
        '5:4',
        '4:5',
      ];

      for (const aspectRatio of validAspectRatios) {
        const payload = {
          size: '1K',
          aspectRatio,
        };

        const instance = plainToInstance(GeminiModelOptionsReqDto, payload);
        const errors = await validate(instance);

        expect(errors.length).toBe(0);
        expect(instance.aspectRatio).toBe(aspectRatio);
      }
    });
  });

  describe('Invalid payloads - size field', () => {
    it('should fail when size is missing', async () => {
      const payload = {
        aspectRatio: '16:9',
      };

      const instance = plainToInstance(GeminiModelOptionsReqDto, payload);
      const errors = await validate(instance);

      expect(errors.length).toBeGreaterThan(0);
      const sizeError = errors.find((err) => err.property === 'size');
      expect(sizeError).toBeDefined();
      expect(sizeError?.constraints).toHaveProperty('isString');
    });

    it('should fail when size is not a string', async () => {
      const payload = {
        size: 1024,
        aspectRatio: '16:9',
      };

      const instance = plainToInstance(GeminiModelOptionsReqDto, payload);
      const errors = await validate(instance);

      expect(errors.length).toBeGreaterThan(0);
      const sizeError = errors.find((err) => err.property === 'size');
      expect(sizeError).toBeDefined();
      expect(sizeError?.constraints).toHaveProperty('isString');
    });

    it('should fail when size is not in allowed values', async () => {
      const payload = {
        size: '8K',
        aspectRatio: '16:9',
      };

      const instance = plainToInstance(GeminiModelOptionsReqDto, payload);
      const errors = await validate(instance);

      expect(errors.length).toBeGreaterThan(0);
      const sizeError = errors.find((err) => err.property === 'size');
      expect(sizeError).toBeDefined();
      expect(sizeError?.constraints).toHaveProperty('isIn');
    });

    it('should fail when size is empty string', async () => {
      const payload = {
        size: '',
        aspectRatio: '16:9',
      };

      const instance = plainToInstance(GeminiModelOptionsReqDto, payload);
      const errors = await validate(instance);

      expect(errors.length).toBeGreaterThan(0);
      const sizeError = errors.find((err) => err.property === 'size');
      expect(sizeError).toBeDefined();
      expect(sizeError?.constraints).toHaveProperty('isIn');
    });
  });

  describe('Invalid payloads - aspectRatio field', () => {
    it('should fail when aspectRatio is missing', async () => {
      const payload = {
        size: '1K',
      };

      const instance = plainToInstance(GeminiModelOptionsReqDto, payload);
      const errors = await validate(instance);

      expect(errors.length).toBeGreaterThan(0);
      const aspectRatioError = errors.find(
        (err) => err.property === 'aspectRatio',
      );
      expect(aspectRatioError).toBeDefined();
      expect(aspectRatioError?.constraints).toHaveProperty('isString');
    });

    it('should fail when aspectRatio is not a string', async () => {
      const payload = {
        size: '1K',
        aspectRatio: 16 / 9,
      };

      const instance = plainToInstance(GeminiModelOptionsReqDto, payload);
      const errors = await validate(instance);

      expect(errors.length).toBeGreaterThan(0);
      const aspectRatioError = errors.find(
        (err) => err.property === 'aspectRatio',
      );
      expect(aspectRatioError).toBeDefined();
      expect(aspectRatioError?.constraints).toHaveProperty('isString');
    });

    it('should fail when aspectRatio is not in allowed values', async () => {
      const payload = {
        size: '1K',
        aspectRatio: '32:9',
      };

      const instance = plainToInstance(GeminiModelOptionsReqDto, payload);
      const errors = await validate(instance);

      expect(errors.length).toBeGreaterThan(0);
      const aspectRatioError = errors.find(
        (err) => err.property === 'aspectRatio',
      );
      expect(aspectRatioError).toBeDefined();
      expect(aspectRatioError?.constraints).toHaveProperty('isIn');
    });

    it('should fail when aspectRatio is empty string', async () => {
      const payload = {
        size: '1K',
        aspectRatio: '',
      };

      const instance = plainToInstance(GeminiModelOptionsReqDto, payload);
      const errors = await validate(instance);

      expect(errors.length).toBeGreaterThan(0);
      const aspectRatioError = errors.find(
        (err) => err.property === 'aspectRatio',
      );
      expect(aspectRatioError).toBeDefined();
      expect(aspectRatioError?.constraints).toHaveProperty('isIn');
    });
  });
});

describe('GeminiNewImageReqDto', () => {
  describe('Valid payloads', () => {
    it('should validate successfully with all required fields', async () => {
      const payload = {
        prompt: 'A beautiful sunset over the ocean',
        model: 'gemini-2.5-flash-image',
        options: JSON.stringify({
          size: '1K',
          aspectRatio: '16:9',
        }),
      };

      const instance = plainToInstance(GeminiNewImageReqDto, payload);
      const errors = await validate(instance);

      expect(errors.length).toBe(0);
      expect(instance.prompt).toBe('A beautiful sunset over the ocean');
      expect(instance.model).toBe('gemini-2.5-flash-image');
      expect(instance.options.size).toBe('1K');
      expect(instance.options.aspectRatio).toBe('16:9');
    });

    it('should validate successfully with options as object', async () => {
      const payload = {
        prompt: 'A mountain landscape',
        model: 'gemini-3-pro-image-preview',
        options: {
          size: '2K',
          aspectRatio: '4:3',
        },
      };

      const instance = plainToInstance(GeminiNewImageReqDto, payload);
      const errors = await validate(instance);

      expect(errors.length).toBe(0);
      expect(instance.prompt).toBe('A mountain landscape');
      expect(instance.model).toBe('gemini-3-pro-image-preview');
      expect(instance.options.size).toBe('2K');
      expect(instance.options.aspectRatio).toBe('4:3');
    });

    it('should validate successfully with optional lastGeneratedImageKey', async () => {
      const payload = {
        prompt: 'A starry night sky',
        model: 'gemini-2.5-flash-image',
        options: JSON.stringify({
          size: '4K',
          aspectRatio: '21:9',
        }),
        lastGeneratedImageKey: 'previous-image-key-123',
      };

      const instance = plainToInstance(GeminiNewImageReqDto, payload);
      const errors = await validate(instance);

      expect(errors.length).toBe(0);
      expect(instance.prompt).toBe('A starry night sky');
      expect(instance.lastGeneratedImageKey).toBe('previous-image-key-123');
    });

    it('should validate successfully with both valid model options', async () => {
      const validModels = ['gemini-2.5-flash-image', 'gemini-3-pro-image-preview'];

      for (const model of validModels) {
        const payload = {
          prompt: 'Test prompt',
          model,
          options: JSON.stringify({
            size: '1K',
            aspectRatio: '1:1',
          }),
        };

        const instance = plainToInstance(GeminiNewImageReqDto, payload);
        const errors = await validate(instance);

        expect(errors.length).toBe(0);
        expect(instance.model).toBe(model);
      }
    });
  });

  describe('Invalid payloads - prompt field', () => {
    it('should fail when prompt is missing', async () => {
      const payload = {
        model: 'gemini-2.5-flash-image',
        options: JSON.stringify({
          size: '1K',
          aspectRatio: '16:9',
        }),
      };

      const instance = plainToInstance(GeminiNewImageReqDto, payload);
      const errors = await validate(instance);

      expect(errors.length).toBeGreaterThan(0);
      const promptError = errors.find((err) => err.property === 'prompt');
      expect(promptError).toBeDefined();
      expect(promptError?.constraints).toHaveProperty('isString');
    });

    it('should fail when prompt is not a string', async () => {
      const payload = {
        prompt: 12345,
        model: 'gemini-2.5-flash-image',
        options: JSON.stringify({
          size: '1K',
          aspectRatio: '16:9',
        }),
      };

      const instance = plainToInstance(GeminiNewImageReqDto, payload);
      const errors = await validate(instance);

      expect(errors.length).toBeGreaterThan(0);
      const promptError = errors.find((err) => err.property === 'prompt');
      expect(promptError).toBeDefined();
      expect(promptError?.constraints).toHaveProperty('isString');
    });

    it('should fail when prompt is empty string', async () => {
      const payload = {
        prompt: '',
        model: 'gemini-2.5-flash-image',
        options: JSON.stringify({
          size: '1K',
          aspectRatio: '16:9',
        }),
      };

      const instance = plainToInstance(GeminiNewImageReqDto, payload);
      const errors = await validate(instance);

      expect(errors.length).toBe(0);
    });

    it('should fail when prompt is null', async () => {
      const payload = {
        prompt: null,
        model: 'gemini-2.5-flash-image',
        options: JSON.stringify({
          size: '1K',
          aspectRatio: '16:9',
        }),
      };

      const instance = plainToInstance(GeminiNewImageReqDto, payload);
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
          size: '1K',
          aspectRatio: '16:9',
        }),
      };

      const instance = plainToInstance(GeminiNewImageReqDto, payload);
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
          size: '1K',
          aspectRatio: '16:9',
        }),
      };

      const instance = plainToInstance(GeminiNewImageReqDto, payload);
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
          size: '1K',
          aspectRatio: '16:9',
        }),
      };

      const instance = plainToInstance(GeminiNewImageReqDto, payload);
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
          size: '1K',
          aspectRatio: '16:9',
        }),
      };

      const instance = plainToInstance(GeminiNewImageReqDto, payload);
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
        model: 'gemini-2.5-flash-image',
        options: JSON.stringify({
          size: 'invalid-size',
          aspectRatio: '16:9',
        }),
      };

      const instance = plainToInstance(GeminiNewImageReqDto, payload);
      const errors = await validate(instance);

      expect(errors.length).toBeGreaterThan(0);
      const optionsError = errors.find((err) => err.property === 'options');
      expect(optionsError).toBeDefined();
      expect(optionsError?.children).toBeDefined();
    });

    it('should fail when options has invalid nested aspectRatio', async () => {
      const payload = {
        prompt: 'A beautiful landscape',
        model: 'gemini-2.5-flash-image',
        options: JSON.stringify({
          size: '1K',
          aspectRatio: 'invalid-ratio',
        }),
      };

      const instance = plainToInstance(GeminiNewImageReqDto, payload);
      const errors = await validate(instance);

      expect(errors.length).toBeGreaterThan(0);
      const optionsError = errors.find((err) => err.property === 'options');
      expect(optionsError).toBeDefined();
      expect(optionsError?.children).toBeDefined();
    });

    it('should fail when options is invalid JSON string', async () => {
      const payload = {
        prompt: 'A beautiful landscape',
        model: 'gemini-2.5-flash-image',
        options: 'invalid-json',
      };

      expect(() => {
        plainToInstance(GeminiNewImageReqDto, payload);
      }).toThrow(SyntaxError);
    });
  });

  describe('Invalid payloads - lastGeneratedImageKey field', () => {
    it('should fail when lastGeneratedImageKey is not a string', async () => {
      const payload = {
        prompt: 'A beautiful landscape',
        model: 'gemini-2.5-flash-image',
        options: JSON.stringify({
          size: '1K',
          aspectRatio: '16:9',
        }),
        lastGeneratedImageKey: 12345,
      };

      const instance = plainToInstance(GeminiNewImageReqDto, payload);
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
        model: 'gemini-2.5-flash-image',
        options: JSON.stringify({
          size: '1K',
          aspectRatio: '16:9',
        }),
        lastGeneratedImageKey: ['key1', 'key2'],
      };

      const instance = plainToInstance(GeminiNewImageReqDto, payload);
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
        model: 'gemini-2.5-flash-image',
        options: JSON.stringify({
          size: '1K',
          aspectRatio: '16:9',
        }),
      };

      const instance = plainToInstance(GeminiNewImageReqDto, payload);
      const errors = await validate(instance);

      expect(errors.length).toBe(0);
      expect(instance.lastGeneratedImageKey).toBeUndefined();
    });

    it('should validate successfully when lastGeneratedImageKey is empty string', async () => {
      const payload = {
        prompt: 'A beautiful landscape',
        model: 'gemini-2.5-flash-image',
        options: JSON.stringify({
          size: '1K',
          aspectRatio: '16:9',
        }),
        lastGeneratedImageKey: '',
      };

      const instance = plainToInstance(GeminiNewImageReqDto, payload);
      const errors = await validate(instance);

      expect(errors.length).toBe(0);
      expect(instance.lastGeneratedImageKey).toBe('');
    });

    it('should handle very long prompt strings', async () => {
      const longPrompt = 'A'.repeat(10000);
      const payload = {
        prompt: longPrompt,
        model: 'gemini-2.5-flash-image',
        options: JSON.stringify({
          size: '1K',
          aspectRatio: '16:9',
        }),
      };

      const instance = plainToInstance(GeminiNewImageReqDto, payload);
      const errors = await validate(instance);

      expect(errors.length).toBe(0);
      expect(instance.prompt).toBe(longPrompt);
    });

    it('should handle special characters in prompt', async () => {
      const specialPrompt = 'Test with special chars: @#$%^&*()[]{}!?<>"\'\n\t';
      const payload = {
        prompt: specialPrompt,
        model: 'gemini-2.5-flash-image',
        options: JSON.stringify({
          size: '1K',
          aspectRatio: '16:9',
        }),
      };

      const instance = plainToInstance(GeminiNewImageReqDto, payload);
      const errors = await validate(instance);

      expect(errors.length).toBe(0);
      expect(instance.prompt).toBe(specialPrompt);
    });

    it('should handle Unicode characters in prompt', async () => {
      const unicodePrompt = '日本語のテキスト 🌸🌊🗻';
      const payload = {
        prompt: unicodePrompt,
        model: 'gemini-2.5-flash-image',
        options: JSON.stringify({
          size: '1K',
          aspectRatio: '16:9',
        }),
      };

      const instance = plainToInstance(GeminiNewImageReqDto, payload);
      const errors = await validate(instance);

      expect(errors.length).toBe(0);
      expect(instance.prompt).toBe(unicodePrompt);
    });
  });
});
