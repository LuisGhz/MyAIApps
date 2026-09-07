import {
  ResponseInput,
  ResponseInputText,
  ResponseInputImage,
} from 'openai/resources/responses/responses.js';
import type { Message } from '../entities/message.entity';

export const setSystemMessage = (
  systemPrompt = 'You are a helpful assistant.',
): ResponseInput => {
  const prompt = typeof systemPrompt === 'string' && systemPrompt.trim()
    ? systemPrompt
    : 'You are a helpful assistant.';

  return [
    {
      role: 'system',
      content: prompt,
    },
  ];
};

export const transformMessagesToOpenAIFormat = (
  messages: Message[],
  cdnDomain: string,
): ResponseInput => {
  return messages.map((msg, index) => {
    // Handle user messages
    if (msg.role === 'user') {
      const content: Array<ResponseInputText | ResponseInputImage> = [];

      // Add text content
      content.push({ type: 'input_text', text: msg.content });

      // Add image if present in user message
      if (msg.fileKey && isImage(msg.fileKey)) {
        const imageUrl = `${cdnDomain}${msg.fileKey}`;
        content.push(img(imageUrl));
      }

      if (index > 0) {
        const prevMsg = messages[index - 1];
        const prevContent = handlePrevMessageWithImage(prevMsg, cdnDomain);
        content.push(...prevContent);
      }

      return { role: 'user', content };
    }

    return {
      role: 'assistant',
      content: msg.content,
    };
  });
};

export const transformNewMessageToOpenAIFormat = (
  message: string,
  cdnDomain: string,
  prevMessage?: Message,
  fileKey?: string,
): ResponseInput => {
  const content: Array<ResponseInputText | ResponseInputImage> = [
    { type: 'input_text' as const, text: message },
  ];

  // Add user's uploaded image if present
  if (fileKey && isImage(fileKey)) {
    const imageUrl = `${cdnDomain}${fileKey}`;
    content.push(img(imageUrl));
  }

  // Add previous assistant's image if present (for image modification)
  if (prevMessage) {
    const prevContent = handlePrevMessageWithImage(prevMessage, cdnDomain);
    content.push(...prevContent);
  }

  return [
    {
      role: 'user',
      content,
    },
  ];
};

export const isImage = (fileKey: string): boolean => {
  const imageExtensions = ['.png', '.jpg', '.jpeg'];
  return imageExtensions.some((ext) => fileKey.endsWith(ext));
};

const handlePrevMessageWithImage = (
  prevMessage: Message,
  cdnDomain: string,
): Array<ResponseInputText | ResponseInputImage> => {
  const content: Array<ResponseInputText | ResponseInputImage> = [];
  if (
    prevMessage?.role === 'assistant' &&
    prevMessage?.fileKey &&
    isImage(prevMessage.fileKey)
  ) {
    const assistantImageUrl = `${cdnDomain}${prevMessage.fileKey}`;
    content.push(img(assistantImageUrl));
  }
  return content;
};

const img = (url: string): ResponseInputImage => ({
  type: 'input_image' as const,
  image_url: url,
  detail: 'high',
});
