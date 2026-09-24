export type Verdict = 'incorrect' | 'correct' | 'both_correct' | 'better';

export class PhraseAnalysisDto {
  input: string;
  verdict: Verdict;
  score?: number;
  explanation: string;
}

export class ComparePhrasesResDto {
  analyses: PhraseAnalysisDto[];
  recommended?: string | null;
}
