import { plainToInstance } from 'class-transformer';
import { validateSync } from 'class-validator';
import { EnhanceTextReqDto } from './enhance-text.req.dto';

describe('EnhanceTextReqDto', () => {
  it('accepts a valid enhancement payload', () => {
    const dto = plainToInstance(EnhanceTextReqDto, {
      context: 'Job interview',
      textToEnhance: 'Necesito practicar mas',
    });

    expect(validateSync(dto)).toHaveLength(0);
  });

  it('rejects non-string values', () => {
    const dto = plainToInstance(EnhanceTextReqDto, {
      context: 123,
      textToEnhance: 456,
    });
    const errors = validateSync(dto);

    expect(errors.map(({ property }) => property)).toEqual(
      expect.arrayContaining(['context', 'textToEnhance']),
    );
  });
});