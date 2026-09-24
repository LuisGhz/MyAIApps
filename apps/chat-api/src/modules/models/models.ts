type ModelPrice = {
  input: number;
  output: number;
};

type ModelMetadata = {
  contextWindow: number;
  maxOutputTokens: number;
  knowledgeCutoff: string;
};

type DevelopBy = {
  name: string;
  link: string;
  imageUrl: string;
};

export type ModelsValues =
  | 'gpt-4o'
  | 'gpt-4o-mini'
  | 'gpt-4.1-2025-04-14'
  | 'gpt-4.1-mini-2025-04-14'
  | 'o4-mini'
  | 'gemini-3-flash-preview'
  | 'gemini-3-pro-preview';

export type ModelInfo = {
  name: string;
  shortName: string;
  value: ModelsValues;
  developBy: DevelopBy;
  link: string;
  price: ModelPrice;
  metadata: ModelMetadata;
};

export const MODELS: ModelInfo[] = [
  {
    name: 'GPT 4o',
    shortName: '4o',
    value: 'gpt-4o',
    developBy: {
      name: 'OpenAI',
      link: 'https://openai.com',
      imageUrl: 'https://openai.com/favicon.ico',
    },
    link: 'https://platform.openai.com/docs/models/gpt-4o',
    price: {
      input: 2.5,
      output: 10,
    },
    metadata: {
      contextWindow: 128_000,
      maxOutputTokens: 16384,
      knowledgeCutoff: 'Sep 2023',
    },
  },
  {
    value: 'gpt-4o-mini',
    shortName: '4om',
    name: 'GPT 4o Mini',
    developBy: {
      name: 'OpenAI',
      link: 'https://openai.com',
      imageUrl: 'https://openai.com/favicon.ico',
    },
    link: 'https://platform.openai.com/docs/models/gpt-4o-mini',
    price: {
      input: 0.15,
      output: 0.6,
    },
    metadata: {
      contextWindow: 128_000,
      maxOutputTokens: 16384,
      knowledgeCutoff: 'Sep 2023',
    },
  },
  {
    name: 'GPT 4.1',
    shortName: '4.1',
    value: 'gpt-4.1-2025-04-14',
    developBy: {
      name: 'OpenAI',
      link: 'https://openai.com',
      imageUrl: 'https://openai.com/favicon.ico',
    },
    link: 'https://platform.openai.com/docs/models/gpt-4.1',
    price: {
      input: 2,
      output: 8,
    },
    metadata: {
      contextWindow: 1_047_576,
      maxOutputTokens: 32_768,
      knowledgeCutoff: 'May 2024',
    },
  },
  {
    name: 'Gemini 3 Flash',
    shortName: '3F',
    value: 'gemini-3-flash-preview',
    developBy: {
      name: 'Google',
      link: 'https://gemini.google.com/',
      imageUrl:
        'https://www.gstatic.com/lamda/images/gemini_favicon_f069958c85030456e93de685481c559f160ea06b.png',
    },
    link: 'https://docs.cloud.google.com/vertex-ai/generative-ai/docs/models/gemini/3-flash',
    price: {
      input: 0.5,
      output: 3,
    },
    metadata: {
      contextWindow: 1_048_576,
      maxOutputTokens: 65_536,
      knowledgeCutoff: 'Jan 2025',
    },
  },
  {
    name: 'Gemini 3 Pro',
    shortName: '3P',
    value: 'gemini-3-pro-preview',
    developBy: {
      name: 'Google',
      link: 'https://gemini.google.com/',
      imageUrl:
        'https://www.gstatic.com/lamda/images/gemini_favicon_f069958c85030456e93de685481c559f160ea06b.png',
    },
    link: 'https://docs.cloud.google.com/vertex-ai/generative-ai/docs/models/gemini/3-pro',
    price: {
      input: 2,
      output: 12,
    },
    metadata: {
      contextWindow: 1_048_576,
      maxOutputTokens: 65_536,
      knowledgeCutoff: 'Jan 2025',
    },
  },
] as const;

export const DEFAULT_MODEL: ModelsValues = 'gemini-3-flash-preview';
