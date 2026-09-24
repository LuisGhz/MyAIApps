import { createToolParamsIfEnabled } from './openai-tools.helper';

describe('openai-tools.helper', () => {
  describe('createToolParamsIfEnabled', () => {
    it('should return empty array when both tools are disabled', () => {
      const result = createToolParamsIfEnabled(false, false);

      expect(result).toEqual([]);
    });

    it('should return only image generation tool when enabled', () => {
      const result = createToolParamsIfEnabled(false, true);

      expect(result).toEqual([
        {
          type: 'image_generation',
          size: '1024x1024',
          quality: 'medium',
          background: 'auto',
          input_fidelity: 'high',
        },
      ]);
    });

    it('should return only web search tool when enabled', () => {
      const result = createToolParamsIfEnabled(true, false);

      expect(result).toEqual([
        {
          type: 'web_search',
          search_context_size: 'medium',
        },
      ]);
    });

    it('should return both tools when both are enabled', () => {
      const result = createToolParamsIfEnabled(true, true);

      expect(result).toHaveLength(2);
      expect(result[0]).toEqual({
        type: 'image_generation',
        size: '1024x1024',
        quality: 'medium',
        background: 'auto',
        input_fidelity: 'high',
      });
      expect(result[1]).toEqual({
        type: 'web_search',
        search_context_size: 'medium',
      });
    });

    it('should maintain correct order with image generation first', () => {
      const result = createToolParamsIfEnabled(true, true);

      expect(result[0].type).toBe('image_generation');
      expect(result[1].type).toBe('web_search');
    });
  });
});
