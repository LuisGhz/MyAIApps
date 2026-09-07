import { getPrompt, translationObject } from './translation.utils';

describe('translation.utils', () => {
  it('builds a prompt without context when none is provided', () => {
    const prompt = getPrompt('Necesito practicar mas');

    expect(prompt).toContain('Text enhance: ""Necesito practicar mas"".');
    expect(prompt).not.toContain('Also consider the following context');
  });

  it('builds a prompt with context when one is provided', () => {
    const prompt = getPrompt('Necesito practicar mas', 'Job interview');

    expect(prompt).toContain('Text enhance: ""Necesito practicar mas"".');
    expect(prompt).toContain('Job interview');
  });

  it('validates translation payloads with the zod schema', () => {
    const validPayload = {
      formalB2: 'I need more practice.',
      formalC1: 'I require additional practice.',
      grammarFix: 'I need more practice.',
      informalB2: 'I need more practice.',
      informalC1: 'I could use more practice.',
    };

    expect(translationObject.safeParse(validPayload).success).toBe(true);
    expect(
      translationObject.safeParse({
        grammarFix: 'I need more practice.',
      }).success,
    ).toBe(false);
  });
});