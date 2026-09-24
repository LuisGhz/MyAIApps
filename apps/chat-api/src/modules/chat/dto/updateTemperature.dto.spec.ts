import { plainToInstance } from 'class-transformer';
import { validate } from 'class-validator';
import { UpdateTemperatureReqDto } from './updateTemperature.dto';

describe('UpdateTemperatureReqDto', () => {
  describe('valid payload', () => {
    it.each([[0], [2], [0.7], [1.5]])(
      'should create a valid instance with temperature %p',
      async (val) => {
        const payload = { temperature: val };

        const instance = plainToInstance(UpdateTemperatureReqDto, payload);
        const errors = await validate(instance);

        expect(errors).toHaveLength(0);
        expect(instance.temperature).toBe(val);
      },
    );
  });

  describe('temperature field', () => {
    it('should fail validation when temperature is not provided', async () => {
      const payload = {};

      const instance = plainToInstance(UpdateTemperatureReqDto, payload);
      const errors = await validate(instance);

      expect(errors).toHaveLength(1);
      expect(errors[0].property).toBe('temperature');
      expect(errors[0].constraints).toHaveProperty('isNumber');
    });

    it('should fail validation when temperature is null', async () => {
      const payload = {
        temperature: null,
      };

      const instance = plainToInstance(UpdateTemperatureReqDto, payload);
      const errors = await validate(instance);

      expect(errors).toHaveLength(1);
      expect(errors[0].property).toBe('temperature');
      expect(errors[0].constraints).toHaveProperty('isNumber');
    });

    it('should fail validation when temperature is less than 0', async () => {
      const payload = {
        temperature: -0.1,
      };

      const instance = plainToInstance(UpdateTemperatureReqDto, payload);
      const errors = await validate(instance);

      expect(errors).toHaveLength(1);
      expect(errors[0].property).toBe('temperature');
      expect(errors[0].constraints).toHaveProperty('min');
    });

    it('should fail validation when temperature is negative', async () => {
      const payload = {
        temperature: -1,
      };

      const instance = plainToInstance(UpdateTemperatureReqDto, payload);
      const errors = await validate(instance);

      expect(errors).toHaveLength(1);
      expect(errors[0].property).toBe('temperature');
      expect(errors[0].constraints).toHaveProperty('min');
    });

    it('should fail validation when temperature exceeds maximum limit', async () => {
      const payload = {
        temperature: 2.1,
      };

      const instance = plainToInstance(UpdateTemperatureReqDto, payload);
      const errors = await validate(instance);

      expect(errors).toHaveLength(1);
      expect(errors[0].property).toBe('temperature');
      expect(errors[0].constraints).toHaveProperty('max');
    });

    it('should fail validation when temperature far exceeds maximum', async () => {
      const payload = {
        temperature: 10,
      };

      const instance = plainToInstance(UpdateTemperatureReqDto, payload);
      const errors = await validate(instance);

      expect(errors).toHaveLength(1);
      expect(errors[0].property).toBe('temperature');
      expect(errors[0].constraints).toHaveProperty('max');
    });

    it('should fail validation when temperature is a string', async () => {
      const payload = {
        temperature: '0.7',
      };

      const instance = plainToInstance(UpdateTemperatureReqDto, payload);
      const errors = await validate(instance);

      expect(errors).toHaveLength(1);
      expect(errors[0].property).toBe('temperature');
      expect(errors[0].constraints).toHaveProperty('isNumber');
    });

    it('should fail validation when temperature is not a number type', async () => {
      const payload = {
        temperature: 'invalid',
      };

      const instance = plainToInstance(UpdateTemperatureReqDto, payload);
      const errors = await validate(instance);

      expect(errors).toHaveLength(1);
      expect(errors[0].property).toBe('temperature');
      expect(errors[0].constraints).toHaveProperty('isNumber');
    });

    it('should fail validation when temperature is an object', async () => {
      const payload = {
        temperature: { value: 0.7 },
      };

      const instance = plainToInstance(UpdateTemperatureReqDto, payload);
      const errors = await validate(instance);

      expect(errors).toHaveLength(1);
      expect(errors[0].property).toBe('temperature');
      expect(errors[0].constraints).toHaveProperty('isNumber');
    });

    it('should fail validation when temperature is an array', async () => {
      const payload = {
        temperature: [0.7],
      };

      const instance = plainToInstance(UpdateTemperatureReqDto, payload);
      const errors = await validate(instance);

      expect(errors).toHaveLength(1);
      expect(errors[0].property).toBe('temperature');
      expect(errors[0].constraints).toHaveProperty('isNumber');
    });

    it('should fail validation when temperature is NaN', async () => {
      const payload = {
        temperature: NaN,
      };

      const instance = plainToInstance(UpdateTemperatureReqDto, payload);
      const errors = await validate(instance);

      expect(errors).toHaveLength(1);
      expect(errors[0].property).toBe('temperature');
      expect(errors[0].constraints).toHaveProperty('isNumber');
    });

    it('should fail validation when temperature is Infinity', async () => {
      const payload = {
        temperature: Infinity,
      };

      const instance = plainToInstance(UpdateTemperatureReqDto, payload);
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

      const instance = plainToInstance(UpdateTemperatureReqDto, payload);
      const errors = await validate(instance);

      expect(errors).toHaveLength(0);
      expect(instance.temperature).toBe(0);
    });

    it('should reject temperature below minimum boundary (-0.01)', async () => {
      const payload = {
        temperature: -0.01,
      };

      const instance = plainToInstance(UpdateTemperatureReqDto, payload);
      const errors = await validate(instance);

      expect(errors).toHaveLength(1);
      expect(errors[0].constraints).toHaveProperty('min');
    });

    it('should accept temperature exactly at maximum boundary (2)', async () => {
      const payload = {
        temperature: 2,
      };

      const instance = plainToInstance(UpdateTemperatureReqDto, payload);
      const errors = await validate(instance);

      expect(errors).toHaveLength(0);
      expect(instance.temperature).toBe(2);
    });

    it('should reject temperature above maximum boundary (2.01)', async () => {
      const payload = {
        temperature: 2.01,
      };

      const instance = plainToInstance(UpdateTemperatureReqDto, payload);
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

      const instance = plainToInstance(UpdateTemperatureReqDto, payload);
      const errors = await validate(instance);

      expect(errors).toHaveLength(0);
      expect(instance.temperature).toBe(0.0001);
    });

    it('should accept temperature close to maximum', async () => {
      const payload = {
        temperature: 1.9999,
      };

      const instance = plainToInstance(UpdateTemperatureReqDto, payload);
      const errors = await validate(instance);

      expect(errors).toHaveLength(0);
      expect(instance.temperature).toBe(1.9999);
    });
  });
});
