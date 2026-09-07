import { compareObject, getComparePrompt } from './compare.utils';

describe('compare.utils', () => {
  it('builds a comparison prompt without context when none is provided', () => {
    const prompt = getComparePrompt(['I did not went', 'I did not go']);

    expect(prompt).toContain('"I did not went"');
    expect(prompt).toContain('"I did not go"');
    expect(prompt).not.toContain('Also consider the following context');
  });

  it('builds a comparison prompt with context when one is provided', () => {
    const prompt = getComparePrompt(
      ['I did not went', 'I did not go'],
      'Grammar lesson',
    );

    expect(prompt).toContain('Grammar lesson');
  });

  it('validates comparison payloads with the zod schema', () => {
    const validPayload = {
      inputs: [
        {
          explanation: 'This uses the wrong verb form after did.',
          input: 'I did not went',
        },
        {
          explanation: 'This uses the correct base verb.',
          input: 'I did not go',
        },
      ],
      summary: 'Use the base form after did.',
    };

    expect(compareObject.safeParse(validPayload).success).toBe(true);
    expect(
      compareObject.safeParse({
        inputs: validPayload.inputs,
      }).success,
    ).toBe(false);
  });
});