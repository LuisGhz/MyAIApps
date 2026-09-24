import { zodTextFormat } from 'openai/helpers/zod';
import z from 'zod';

export const compareInstructions = `
  You are an expert English teacher. Compare the following phrases or words provided by the user. Respond strictly in the specified formats, without any extra commentary, explanations, or unrelated content.
`;

export const getComparePrompt = (text: string[], context?: string) => {
  return `
    Inputs:
    ${text.map((t) => `"${t}"`).join('\n')}
    ${context ? `Also consider the following context which can help you to give result, consider this context can be in another language such as spanish: ""${context}""` : ''}
  `;
};

export const compareObject = z.object({
  inputs: z.array(
    z.object({
      input: z.string().describe('The input phrase/word.'),
      explanation: z
        .string()
        .describe(
          'Explanation of the word or phrase, e.g., usage, meaning, or context.',
        ),
    }),
  ),
  summary: z
    .string()
    .describe(
      'A final summary of the comparison, e.g., usage, differences or similarities.',
    ),
});

export type CompareSchema = z.infer<typeof compareObject>;

export const openAICompareFormat = zodTextFormat(compareObject, 'compare');
