import { Content } from '@google/genai';
import { Message, MessageRole } from '../entities';
import {
  setSystemMessageGemini,
  messagesTransformerForGemini,
  newMessageTransformerForGemini,
} from './gemini-message-adapter.helper';
import * as imageFetcherHelper from './image-fetcher.helper';

jest.mock('./image-fetcher.helper');

describe('gemini-message-adapter.helper', () => {
  describe('setSystemMessageGemini', () => {
    it('should return default system message when no prompt provided', () => {
      const result = setSystemMessageGemini();

      expect(result).toEqual({
        role: 'user',
        parts: [{ text: 'You are a helpful assistant.' }],
      });
    });

    it('should return custom system message when prompt provided', () => {
      const customPrompt = 'You are a coding assistant.';

      const result = setSystemMessageGemini(customPrompt);

      expect(result).toEqual({
        role: 'user',
        parts: [{ text: customPrompt }],
      });
    });

    it('should handle empty string prompt', () => {
      const result = setSystemMessageGemini('');

      expect(result).toEqual({
        role: 'user',
        parts: [{ text: 'You are a helpful assistant.' }],
      });
    });
  });

  describe('messagesTransformerForGemini', () => {
    const cdnUrl = 'https://cdn.example.com/';
    let fetchImageAsBase64Mock: jest.SpyInstance;

    beforeEach(() => {
      fetchImageAsBase64Mock = jest.spyOn(
        imageFetcherHelper,
        'fetchImageAsBase64',
      );
    });

    afterEach(() => {
      jest.clearAllMocks();
    });

    it('should transform user message without image', async () => {
      const messages: Message[] = [
        {
          id: '1',
          content: 'Hello',
          role: MessageRole.USER,
          createdAt: new Date(),
        } as Message,
      ];

      const result = await messagesTransformerForGemini(messages, cdnUrl);

      expect(result).toEqual([
        {
          role: 'user',
          parts: [{ text: 'Hello' }],
        },
      ]);
      expect(fetchImageAsBase64Mock).not.toHaveBeenCalled();
    });

    it('should transform assistant message without image', async () => {
      const messages: Message[] = [
        {
          id: '1',
          content: 'Hi there!',
          role: MessageRole.ASSISTANT,
          createdAt: new Date(),
        } as Message,
      ];

      const result = await messagesTransformerForGemini(messages, cdnUrl);

      expect(result).toEqual([
        {
          role: 'model',
          parts: [{ text: 'Hi there!' }],
        },
      ]);
    });

    it('should transform user message with image', async () => {
      const messages: Message[] = [
        {
          id: '1',
          content: 'What is this?',
          role: MessageRole.USER,
          fileKey: 'images/test.png',
          createdAt: new Date(),
        } as Message,
      ];

      fetchImageAsBase64Mock.mockResolvedValue({
        mimeType: 'image/png',
        dataBase64: 'base64data',
      });

      const result = await messagesTransformerForGemini(messages, cdnUrl);

      expect(result).toEqual([
        {
          role: 'user',
          parts: [
            { text: 'What is this?' },
            {
              inlineData: {
                mimeType: 'image/png',
                data: 'base64data',
              },
            },
          ],
        },
      ]);
      expect(fetchImageAsBase64Mock).toHaveBeenCalledWith(
        'https://cdn.example.com/images/test.png',
      );
    });

    it('should transform multiple messages with mixed roles and images', async () => {
      const messages: Message[] = [
        {
          id: '1',
          content: 'Hello',
          role: MessageRole.USER,
          createdAt: new Date(),
        } as Message,
        {
          id: '2',
          content: 'Hi!',
          role: MessageRole.ASSISTANT,
          createdAt: new Date(),
        } as Message,
        {
          id: '3',
          content: 'Check this image',
          role: MessageRole.USER,
          fileKey: 'images/photo.jpg',
          createdAt: new Date(),
        } as Message,
      ];

      fetchImageAsBase64Mock.mockResolvedValue({
        mimeType: 'image/jpeg',
        dataBase64: 'jpegbase64data',
      });

      const result = await messagesTransformerForGemini(messages, cdnUrl);

      expect(result).toHaveLength(3);
      expect(result[0]).toEqual({
        role: 'user',
        parts: [{ text: 'Hello' }],
      });
      expect(result[1]).toEqual({
        role: 'model',
        parts: [{ text: 'Hi!' }],
      });
      expect(result[2]).toEqual({
        role: 'user',
        parts: [
          { text: 'Check this image' },
          {
            inlineData: {
              mimeType: 'image/jpeg',
              data: 'jpegbase64data',
            },
          },
        ],
      });
    });

    it('should handle image fetch returning undefined', async () => {
      const messages: Message[] = [
        {
          id: '1',
          content: 'Image message',
          role: MessageRole.USER,
          fileKey: 'images/missing.png',
          createdAt: new Date(),
        } as Message,
      ];

      fetchImageAsBase64Mock.mockResolvedValue(undefined);

      const result = await messagesTransformerForGemini(messages, cdnUrl);

      expect(result).toEqual([
        {
          role: 'user',
          parts: [
            { text: 'Image message' },
            {
              inlineData: {
                mimeType: 'image/png',
                data: '',
              },
            },
          ],
        },
      ]);
    });

    it('should handle empty messages array', async () => {
      const result = await messagesTransformerForGemini([], cdnUrl);

      expect(result).toEqual([]);
    });
  });

  describe('newMessageTransformerForGemini', () => {
    it('should transform message without image', () => {
      const message = 'Hello, how are you?';

      const result = newMessageTransformerForGemini(message);

      expect(result).toEqual({
        role: MessageRole.USER,
        parts: [{ text: 'Hello, how are you?' }],
      });
    });

    it('should transform message with image', () => {
      const message = 'What is in this image?';
      const image = {
        mimeType: 'image/png',
        dataBase64: 'base64imagedata',
      };

      const result = newMessageTransformerForGemini(message, image);

      expect(result).toEqual({
        role: MessageRole.USER,
        parts: [
          { text: 'What is in this image?' },
          {
            inlineData: {
              data: 'base64imagedata',
              mimeType: 'image/png',
            },
          },
        ],
      });
    });

    it('should handle empty message string', () => {
      const result = newMessageTransformerForGemini('');

      expect(result).toEqual({
        role: MessageRole.USER,
        parts: [{ text: '' }],
      });
    });

    it('should handle image with different mime type', () => {
      const message = 'Check this JPEG';
      const image = {
        mimeType: 'image/jpeg',
        dataBase64: 'jpegdata',
      };

      const result = newMessageTransformerForGemini(message, image);

      expect(result).toEqual({
        role: MessageRole.USER,
        parts: [
          { text: 'Check this JPEG' },
          {
            inlineData: {
              data: 'jpegdata',
              mimeType: 'image/jpeg',
            },
          },
        ],
      });
    });
  });
});
