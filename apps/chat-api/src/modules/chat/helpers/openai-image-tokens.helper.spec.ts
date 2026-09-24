import {
  getImageGenerationTokens,
  calculateImageGenerationTokens,
  calculateImageGenerationTokensWithPartials,
} from './openai-image-tokens.helper';
import type { ImageGenerationToolConfig } from '../interfaces';

describe('openai-image-tokens.helper', () => {
  describe('getImageGenerationTokens', () => {
    it('should return correct tokens for 1024x1024 medium quality', () => {
      const result = getImageGenerationTokens('1024x1024', 'medium');

      expect(result).toBe(1056);
    });

    it('should return correct tokens for 1024x1024 low quality', () => {
      const result = getImageGenerationTokens('1024x1024', 'low');

      expect(result).toBe(272);
    });

    it('should return correct tokens for 1024x1024 high quality', () => {
      const result = getImageGenerationTokens('1024x1024', 'high');

      expect(result).toBe(4160);
    });

    it('should return correct tokens for 1024x1536 medium quality', () => {
      const result = getImageGenerationTokens('1024x1536', 'medium');

      expect(result).toBe(1584);
    });

    it('should return correct tokens for 1536x1024 high quality', () => {
      const result = getImageGenerationTokens('1536x1024', 'high');

      expect(result).toBe(6208);
    });

    it('should return correct tokens for auto size with low quality', () => {
      const result = getImageGenerationTokens('auto', 'low');

      expect(result).toBe(272);
    });

    it('should use default size when undefined', () => {
      const result = getImageGenerationTokens(undefined, 'medium');

      expect(result).toBe(1056);
    });

    it('should use default quality when undefined', () => {
      const result = getImageGenerationTokens('1024x1024', undefined);

      expect(result).toBe(1056);
    });

    it('should use defaults when both parameters are undefined', () => {
      const result = getImageGenerationTokens();

      expect(result).toBe(1056);
    });

    it('should throw error for invalid size', () => {
      expect(() => getImageGenerationTokens('invalid-size', 'medium')).toThrow(
        'Invalid image size: invalid-size',
      );
    });

    it('should throw error for invalid quality', () => {
      expect(() => getImageGenerationTokens('1024x1024', 'invalid')).toThrow(
        'Invalid image quality: invalid',
      );
    });

    it('should handle null size by using default', () => {
      const result = getImageGenerationTokens(null as any, 'medium');

      expect(result).toBe(1056);
    });

    it('should handle null quality by using default', () => {
      const result = getImageGenerationTokens('1024x1024', null as any);

      expect(result).toBe(1056);
    });
  });

  describe('calculateImageGenerationTokens', () => {
    it('should calculate tokens for given tool config', () => {
      const toolConfig: ImageGenerationToolConfig = {
        type: 'image_generation',
        size: '1024x1024',
        quality: 'high',
      };

      const result = calculateImageGenerationTokens(toolConfig);

      expect(result).toBe(4160);
    });

    it('should calculate tokens for 1024x1536 low quality', () => {
      const toolConfig: ImageGenerationToolConfig = {
        type: 'image_generation',
        size: '1024x1536',
        quality: 'low',
      };

      const result = calculateImageGenerationTokens(toolConfig);

      expect(result).toBe(408);
    });

    it('should calculate tokens for auto size', () => {
      const toolConfig: ImageGenerationToolConfig = {
        type: 'image_generation',
        size: 'auto',
        quality: 'medium',
      };

      const result = calculateImageGenerationTokens(toolConfig);

      expect(result).toBe(1056);
    });

    it('should handle missing quality in config', () => {
      const toolConfig: ImageGenerationToolConfig = {
        type: 'image_generation',
        size: '1024x1024',
        quality: undefined as any,
      };

      const result = calculateImageGenerationTokens(toolConfig);

      expect(result).toBe(1056);
    });
  });

  describe('calculateImageGenerationTokensWithPartials', () => {
    it('should calculate base tokens without partial images', () => {
      const result = calculateImageGenerationTokensWithPartials(
        '1024x1024',
        'medium',
        0,
      );

      expect(result).toBe(1056);
    });

    it('should add tokens for one partial image', () => {
      const result = calculateImageGenerationTokensWithPartials(
        '1024x1024',
        'medium',
        1,
      );

      expect(result).toBe(2112);
    });

    it('should add tokens for two partial images', () => {
      const result = calculateImageGenerationTokensWithPartials(
        '1024x1024',
        'medium',
        2,
      );

      expect(result).toBe(3168);
    });

    it('should add tokens for three partial images', () => {
      const result = calculateImageGenerationTokensWithPartials(
        '1024x1024',
        'medium',
        3,
      );

      expect(result).toBe(4224);
    });

    it('should cap at three partial images', () => {
      const result = calculateImageGenerationTokensWithPartials(
        '1024x1024',
        'medium',
        5,
      );

      expect(result).toBe(4224);
    });

    it('should handle negative partial images as zero', () => {
      const result = calculateImageGenerationTokensWithPartials(
        '1024x1024',
        'medium',
        -1,
      );

      expect(result).toBe(1056);
    });

    it('should use defaults when parameters are undefined', () => {
      const result = calculateImageGenerationTokensWithPartials();

      expect(result).toBe(1056);
    });

    it('should calculate correctly for high quality with partials', () => {
      const result = calculateImageGenerationTokensWithPartials(
        '1024x1024',
        'high',
        2,
      );

      expect(result).toBe(12480);
    });

    it('should calculate correctly for 1536x1024 with one partial', () => {
      const result = calculateImageGenerationTokensWithPartials(
        '1536x1024',
        'low',
        1,
      );

      expect(result).toBe(800);
    });
  });
});
