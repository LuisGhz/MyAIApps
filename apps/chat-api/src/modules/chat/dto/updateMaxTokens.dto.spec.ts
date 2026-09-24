import { plainToInstance } from 'class-transformer';
import { validate } from 'class-validator';
import { UpdateMaxTokensReqDto } from './updateMaxTokens.dto';

describe('UpdateMaxTokensReqDto', () => {
  describe('valid payload', () => {
    it.each([[1], [128000], [50000]])(
      'should create a valid instance with maxTokens %i',
      async (value) => {
        const payload = { maxTokens: value };

        const instance = plainToInstance(UpdateMaxTokensReqDto, payload);
        const errors = await validate(instance);

        expect(errors).toHaveLength(0);
        expect(instance.maxTokens).toBe(value);
      },
    );
  });

  describe('maxTokens field', () => {
    it.each([
      {},
      { maxTokens: null },
      { maxTokens: undefined },
      { maxTokens: 0 },
      { maxTokens: -100 },
      { maxTokens: 128001 },
      { maxTokens: 1000.5 },
      { maxTokens: '1000' },
      { maxTokens: 'invalid' },
      { maxTokens: {} },
      { maxTokens: [1000] },
    ])('should fail validation for payload %p', async (payload) => {
      const instance = plainToInstance(UpdateMaxTokensReqDto, payload as any);
      const errors = await validate(instance);

      expect(errors.length).toBeGreaterThan(0);
      expect(errors[0].property).toBe('maxTokens');
    });
  });

  describe('boundary values', () => {
    it('should accept maxTokens exactly at minimum boundary (1)', async () => {
      const payload = {
        maxTokens: 1,
      };

      const instance = plainToInstance(UpdateMaxTokensReqDto, payload);
      const errors = await validate(instance);

      expect(errors).toHaveLength(0);
      expect(instance.maxTokens).toBe(1);
    });

    it('should reject maxTokens below minimum boundary (0)', async () => {
      const payload = {
        maxTokens: 0,
      };

      const instance = plainToInstance(UpdateMaxTokensReqDto, payload);
      const errors = await validate(instance);

      expect(errors).toHaveLength(1);
      expect(errors[0].constraints).toHaveProperty('min');
    });

    it('should accept maxTokens exactly at maximum boundary (128000)', async () => {
      const payload = {
        maxTokens: 128000,
      };

      const instance = plainToInstance(UpdateMaxTokensReqDto, payload);
      const errors = await validate(instance);

      expect(errors).toHaveLength(0);
      expect(instance.maxTokens).toBe(128000);
    });

    it('should reject maxTokens above maximum boundary (128001)', async () => {
      const payload = {
        maxTokens: 128001,
      };

      const instance = plainToInstance(UpdateMaxTokensReqDto, payload);
      const errors = await validate(instance);

      expect(errors).toHaveLength(1);
      expect(errors[0].constraints).toHaveProperty('max');
    });
  });
});
