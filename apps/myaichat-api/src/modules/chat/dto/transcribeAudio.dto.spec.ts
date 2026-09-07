import { plainToInstance } from 'class-transformer';
import { validate } from 'class-validator';
import {
  TranscribeAudioReqDto,
  TranscribeAudioResDto,
} from './transcribeAudio.dto';

describe('TranscribeAudioReqDto', () => {
  describe('valid payload', () => {
    it.each([
      [{}, 0],
      [{ temperature: 0 }, 0],
      [{ temperature: 1 }, 1],
      [{ temperature: 0.5 }, 0.5],
    ])('should create a valid instance with payload %p', async (payload, expected) => {
      const instance = plainToInstance(TranscribeAudioReqDto, payload);
      const errors = await validate(instance);

      expect(errors).toHaveLength(0);
      expect(instance.temperature).toBe(expected);
    });
  });

  describe('temperature field (optional)', () => {
    it('should accept undefined temperature and use default value', async () => {
      const payload = {};

      const instance = plainToInstance(TranscribeAudioReqDto, payload);
      const errors = await validate(instance);

      expect(errors).toHaveLength(0);
      expect(instance.temperature).toBe(0);
    });

    it('should transform temperature from string to number', async () => {
      const payload = {
        temperature: '0.7',
      };

      const instance = plainToInstance(TranscribeAudioReqDto, payload);
      const errors = await validate(instance);

      expect(errors).toHaveLength(0);
      expect(instance.temperature).toBe(0.7);
      expect(typeof instance.temperature).toBe('number');
    });

    it('should transform temperature from string "0" to 0', async () => {
      const payload = {
        temperature: '0',
      };

      const instance = plainToInstance(TranscribeAudioReqDto, payload);
      const errors = await validate(instance);

      expect(errors).toHaveLength(0);
      expect(instance.temperature).toBe(0);
    });

    it('should transform temperature from string "1" to 1', async () => {
      const payload = {
        temperature: '1',
      };

      const instance = plainToInstance(TranscribeAudioReqDto, payload);
      const errors = await validate(instance);

      expect(errors).toHaveLength(0);
      expect(instance.temperature).toBe(1);
    });

    it('should fail validation when temperature is null', async () => {
      const payload = {
        temperature: null,
      };

      const instance = plainToInstance(TranscribeAudioReqDto, payload);
      const errors = await validate(instance);

      expect(errors).toHaveLength(1);
      expect(errors[0].property).toBe('temperature');
      expect(errors[0].constraints).toHaveProperty('isNumber');
    });

    it('should fail validation when temperature is less than 0', async () => {
      const payload = {
        temperature: -0.1,
      };

      const instance = plainToInstance(TranscribeAudioReqDto, payload);
      const errors = await validate(instance);

      expect(errors).toHaveLength(1);
      expect(errors[0].property).toBe('temperature');
      expect(errors[0].constraints).toHaveProperty('min');
    });

    it('should fail validation when temperature is negative', async () => {
      const payload = {
        temperature: -1,
      };

      const instance = plainToInstance(TranscribeAudioReqDto, payload);
      const errors = await validate(instance);

      expect(errors).toHaveLength(1);
      expect(errors[0].property).toBe('temperature');
      expect(errors[0].constraints).toHaveProperty('min');
    });

    it('should fail validation when temperature exceeds maximum limit', async () => {
      const payload = {
        temperature: 1.1,
      };

      const instance = plainToInstance(TranscribeAudioReqDto, payload);
      const errors = await validate(instance);

      expect(errors).toHaveLength(1);
      expect(errors[0].property).toBe('temperature');
      expect(errors[0].constraints).toHaveProperty('max');
    });

    it('should fail validation when temperature far exceeds maximum', async () => {
      const payload = {
        temperature: 10,
      };

      const instance = plainToInstance(TranscribeAudioReqDto, payload);
      const errors = await validate(instance);

      expect(errors).toHaveLength(1);
      expect(errors[0].property).toBe('temperature');
      expect(errors[0].constraints).toHaveProperty('max');
    });

    it('should fail validation when temperature is not a number after transform', async () => {
      const payload = {
        temperature: 'invalid',
      };

      const instance = plainToInstance(TranscribeAudioReqDto, payload);
      const errors = await validate(instance);

      expect(errors).toHaveLength(1);
      expect(errors[0].property).toBe('temperature');
      expect(errors[0].constraints).toHaveProperty('isNumber');
    });

    it('should fail validation when temperature is an object', async () => {
      const payload = {
        temperature: { value: 0.5 },
      };

      const instance = plainToInstance(TranscribeAudioReqDto, payload);
      const errors = await validate(instance);

      expect(errors).toHaveLength(1);
      expect(errors[0].property).toBe('temperature');
      expect(errors[0].constraints).toHaveProperty('isNumber');
    });

    it('should fail validation when temperature is an invalid type', async () => {
      const payload = {
        temperature: { value: 0.5 },
      };

      const instance = plainToInstance(TranscribeAudioReqDto, payload);
      const errors = await validate(instance);

      expect(errors.length).toBeGreaterThan(0);
      expect(errors[0].property).toBe('temperature');
      expect(errors[0].constraints).toHaveProperty('isNumber');
    });

    it('should fail validation when temperature is boolean', async () => {
      const payload = {
        temperature: true,
      };

      const instance = plainToInstance(TranscribeAudioReqDto, payload);
      const errors = await validate(instance);

      expect(errors).toHaveLength(1);
      expect(errors[0].property).toBe('temperature');
      expect(errors[0].constraints).toHaveProperty('isNumber');
    });

    it('should fail validation when temperature is NaN', async () => {
      const payload = {
        temperature: NaN,
      };

      const instance = plainToInstance(TranscribeAudioReqDto, payload);
      const errors = await validate(instance);

      expect(errors).toHaveLength(1);
      expect(errors[0].property).toBe('temperature');
      expect(errors[0].constraints).toHaveProperty('isNumber');
    });

    it('should fail validation when temperature is Infinity', async () => {
      const payload = {
        temperature: Infinity,
      };

      const instance = plainToInstance(TranscribeAudioReqDto, payload);
      const errors = await validate(instance);

      expect(errors).toHaveLength(1);
      expect(errors[0].property).toBe('temperature');
      expect(errors[0].constraints).toHaveProperty('max');
    });
  });

  describe('boundary values', () => {
    it('should accept temperature exactly at minimum boundary (0)', async () => {
      const payload = {
        temperature: 0,
      };

      const instance = plainToInstance(TranscribeAudioReqDto, payload);
      const errors = await validate(instance);

      expect(errors).toHaveLength(0);
      expect(instance.temperature).toBe(0);
    });

    it('should reject temperature below minimum boundary (-0.01)', async () => {
      const payload = {
        temperature: -0.01,
      };

      const instance = plainToInstance(TranscribeAudioReqDto, payload);
      const errors = await validate(instance);

      expect(errors).toHaveLength(1);
      expect(errors[0].constraints).toHaveProperty('min');
    });

    it('should accept temperature exactly at maximum boundary (1)', async () => {
      const payload = {
        temperature: 1,
      };

      const instance = plainToInstance(TranscribeAudioReqDto, payload);
      const errors = await validate(instance);

      expect(errors).toHaveLength(0);
      expect(instance.temperature).toBe(1);
    });

    it('should reject temperature above maximum boundary (1.01)', async () => {
      const payload = {
        temperature: 1.01,
      };

      const instance = plainToInstance(TranscribeAudioReqDto, payload);
      const errors = await validate(instance);

      expect(errors).toHaveLength(1);
      expect(errors[0].constraints).toHaveProperty('max');
    });
  });

  describe('edge cases with decimal values', () => {
    it('should accept very small positive decimal', async () => {
      const payload = {
        temperature: 0.0001,
      };

      const instance = plainToInstance(TranscribeAudioReqDto, payload);
      const errors = await validate(instance);

      expect(errors).toHaveLength(0);
      expect(instance.temperature).toBe(0.0001);
    });

    it('should accept temperature close to maximum', async () => {
      const payload = {
        temperature: 0.9999,
      };

      const instance = plainToInstance(TranscribeAudioReqDto, payload);
      const errors = await validate(instance);

      expect(errors).toHaveLength(0);
      expect(instance.temperature).toBe(0.9999);
    });
  });
});

describe('TranscribeAudioResDto', () => {
  it('should have all required properties defined', () => {
    const instance = new TranscribeAudioResDto();

    expect(instance).toBeDefined();
  });
});
