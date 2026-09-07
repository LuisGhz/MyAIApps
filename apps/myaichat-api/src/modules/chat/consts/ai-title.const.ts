export const OPENAI_CHAT_TITLE_MODEL = 'gpt-4o-mini';
export const GEMINI_CHAT_TITLE_MODEL = 'gemini-2.0-flash-lite';

export const CHAT_TITLE_PROMPT = (
  userMessage: string,
  assistantResponse: string,
) => `Generate a very short title (max 6 words) for a conversation that starts with this exchange. Return only the title, no quotes or extra text, Do not utilize special characters like ", neither markdown characters.

User: ${userMessage}
Assistant: ${assistantResponse.slice(0, 500)}`;
