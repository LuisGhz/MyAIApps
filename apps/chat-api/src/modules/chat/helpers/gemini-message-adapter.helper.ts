import { Content, Part } from '@google/genai';
import { Message, MessageRole } from '../entities';
import { fetchImageAsBase64 } from './image-fetcher.helper';

export const setSystemMessageGemini = (systemPrompt?: string): Content => {
  return {
    role: 'user',
    parts: [
      {
        text: systemPrompt || 'You are a helpful assistant.',
      },
    ],
  };
};

export const messagesTransformerForGemini = async (
  messages: Message[],
  cdnUrl: string,
): Promise<Content[]> => {
  const results: Content[] = [];
  for (const msg of messages) {
    const partWithImage: Part[] = [];
    if (msg.fileKey) {
      const fullUrl = `${cdnUrl}${msg.fileKey}`;
      const img = await fetchImageAsBase64(fullUrl);
      partWithImage.push({
        inlineData: {
          mimeType: img?.mimeType || 'image/png',
          data: img?.dataBase64 || '',
        },
      });
    }
    results.push({
      role: msg.role === MessageRole.ASSISTANT ? 'model' : msg.role,
      parts: [
        {
          text: msg.content,
        },
        ...partWithImage,
      ],
    });
  }
  return results;
};

export const newMessageTransformerForGemini = (
  newMessage: string,
  image?: {
    mimeType: string;
    dataBase64: string;
  },
): Content => {
  const partWithImage: Part[] = [];
  if (image) {
    partWithImage.push({
      inlineData: {
        data: image.dataBase64,
        mimeType: image.mimeType,
      },
    });
  }
  return {
    role: MessageRole.USER,
    parts: [
      {
        text: newMessage,
      },
      ...partWithImage,
    ],
  };
};
