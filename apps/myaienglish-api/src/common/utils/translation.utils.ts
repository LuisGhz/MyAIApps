import { zodTextFormat } from 'openai/helpers/zod';
import z from 'zod';

export const translationInstructions = `
  You are a senior English teacher and your sole responsibility is to provide improved English version of the given text.
  * Only generate English variations as requested (grammar fix, informal and formal for B2 and C1 levels).
  * Do not answer or perform any other tasks outside of providing these English variations.
  * Respond strictly in the specified formats, without any extra commentary, explanations, or unrelated content.
  * If the request is not related to improving English variations, politely refuse to answer.
  * Sometimes the provided text may be in another language (e.g., Spanish); in such cases, translate it to English first before providing the variations.
  * English should sound natural and fluent, as if written by a native speaker.
  * If the result is the same for informal B2 and C1, or formal B2 and C1, you can leave only C1 level for each informal or formal variation.
`;

export const getPrompt = (text: string, context?: string) => {
  return `
    Text enhance: ""${text}"".
    ${context ? `Also consider the following context which can help you to give result, consider this context can be in another language such as spanish: ""${context}""` : ''}
  `;
};

export const translationObject = z.object({
  grammarFix: z.string().describe('The translated text.'),
  informalB2: z.string().describe('The translated text in an informal way for B2 level.'),
  informalC1: z.string().describe('The translated text in an informal way for C1 level.'),
  formalB2: z.string().describe('The translated text in a formal way for B2 level.'),
  formalC1: z.string().describe('The translated text in a formal way for C1 level.'),
});

export type TranslationSchema = z.infer<typeof translationObject>;

export const openAITranslationFormat = zodTextFormat(
  translationObject,
  'translation',
);
