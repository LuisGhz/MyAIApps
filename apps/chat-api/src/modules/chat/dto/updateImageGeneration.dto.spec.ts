import { plainToInstance } from 'class-transformer';
import { validate } from 'class-validator';
import { UpdateImageGenerationReqDto } from './updateImageGeneration.dto';

describe('UpdateImageGenerationReqDto', () => {
  describe('valid payload', () => {
    it.each([[true], [false]])(
      'should create a valid instance when isImageGeneration is %s',
      async (val) => {
        const payload = { isImageGeneration: val };

        const instance = plainToInstance(UpdateImageGenerationReqDto, payload);
        const errors = await validate(instance);

        expect(errors).toHaveLength(0);
        expect(instance.isImageGeneration).toBe(val);
      },
    );
  });

  describe('isImageGeneration field', () => {
    it.each([
      {},
      { isImageGeneration: null },
      { isImageGeneration: undefined },
      { isImageGeneration: 'true' },
      { isImageGeneration: 'false' },
      { isImageGeneration: 1 },
      { isImageGeneration: 0 },
      { isImageGeneration: '' },
      { isImageGeneration: { value: true } },
      { isImageGeneration: [true] },
      { isImageGeneration: NaN },
    ])('should fail validation for payload %p', async (payload) => {
      const instance = plainToInstance(UpdateImageGenerationReqDto, payload as any);
      const errors = await validate(instance);

      expect(errors).toHaveLength(1);
      expect(errors[0].property).toBe('isImageGeneration');
      expect(errors[0].constraints).toHaveProperty('isBoolean');
    });
  });
});
