import { plainToInstance } from 'class-transformer';
import { validateSync } from 'class-validator';
import { ComparePhrasesReqDto } from './compare-phrases.req.dto';

describe('ComparePhrasesReqDto', () => {
  it('accepts at least two string inputs', () => {
    const dto = plainToInstance(ComparePhrasesReqDto, {
      context: 'Business email',
      inputs: ['I sent it yesterday', 'I have sent it yesterday'],
    });

    expect(validateSync(dto)).toHaveLength(0);
  });

  it('rejects requests with fewer than two inputs', () => {
    const dto = plainToInstance(ComparePhrasesReqDto, {
      inputs: ['Only one phrase'],
    });
    const errors = validateSync(dto);
    const inputError = errors.find(({ property }) => property === 'inputs');

    expect(inputError?.constraints).toHaveProperty('arrayMinSize');
  });

  it('rejects non-string inputs and context values', () => {
    const dto = plainToInstance(ComparePhrasesReqDto, {
      context: 42,
      inputs: ['Valid phrase', 42],
    });
    const errors = validateSync(dto);

    expect(errors.map(({ property }) => property)).toEqual(
      expect.arrayContaining(['context', 'inputs']),
    );
  });
});