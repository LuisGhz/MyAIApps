import {
  ComparePhrasesResDto,
  PhraseAnalysisDto,
} from './compare-phrases.res.dto';

describe('ComparePhrasesResDto', () => {
  it('stores analyses and a recommended phrase', () => {
    const analysis = Object.assign(new PhraseAnalysisDto(), {
      explanation: 'The second phrase uses the correct tense.',
      input: 'I sent it yesterday',
      score: 0.95,
      verdict: 'better' as const,
    });
    const dto = Object.assign(new ComparePhrasesResDto(), {
      analyses: [analysis],
      recommended: 'I sent it yesterday',
    });

    expect(dto.analyses).toEqual([analysis]);
    expect(dto.recommended).toBe('I sent it yesterday');
  });

  it('allows recommendations to be omitted', () => {
    const dto = Object.assign(new ComparePhrasesResDto(), {
      analyses: [
        Object.assign(new PhraseAnalysisDto(), {
          explanation: 'This phrase is already correct.',
          input: 'I am ready',
          verdict: 'correct' as const,
        }),
      ],
    });

    expect(dto.analyses).toHaveLength(1);
    expect(dto.recommended).toBeUndefined();
  });
});