export interface CompareReqModel {
  context?: string;
  inputs: string[];
}

export interface CompareResModel {
  inputs: {
    input: string;
    explanation: string;
  }[];
  summary: string;
}
