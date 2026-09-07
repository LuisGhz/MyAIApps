import { plainToInstance } from 'class-transformer';
import { validate } from 'class-validator';
import { UpdateWebSearchReqDto } from './updateWebSearch.dto';

describe('UpdateWebSearchReqDto', () => {
  describe('valid payload', () => {
    it.each([[true], [false]])(
      'should create a valid instance when isWebSearch is %s',
      async (val) => {
        const payload = { isWebSearch: val };

        const instance = plainToInstance(UpdateWebSearchReqDto, payload);
        const errors = await validate(instance);

        expect(errors).toHaveLength(0);
        expect(instance.isWebSearch).toBe(val);
      },
    );
  });

  describe('isWebSearch field', () => {
    it.each([
      {},
      { isWebSearch: null },
      { isWebSearch: undefined },
      { isWebSearch: 'true' },
      { isWebSearch: 'false' },
      { isWebSearch: 1 },
      { isWebSearch: 0 },
      { isWebSearch: '' },
      { isWebSearch: { value: true } },
      { isWebSearch: [true] },
      { isWebSearch: NaN },
    ])('should fail validation for payload %p', async (payload) => {
      const instance = plainToInstance(UpdateWebSearchReqDto, payload as any);
      const errors = await validate(instance);

      expect(errors).toHaveLength(1);
      expect(errors[0].property).toBe('isWebSearch');
      expect(errors[0].constraints).toHaveProperty('isBoolean');
    });
  });
});
