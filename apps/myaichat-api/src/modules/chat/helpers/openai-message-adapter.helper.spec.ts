import {
  setSystemMessage,
  transformMessagesToOpenAIFormat,
  transformNewMessageToOpenAIFormat,
  isImage,
} from './openai-message-adapter.helper';
import { Message, MessageRole } from '../entities';

describe('openai-message-adapter.helper', () => {
  const cdnDomain = 'https://cdn.example.com/';

  describe('setSystemMessage', () => {
    it('should return default system message when no prompt provided', () => {
      const result = setSystemMessage();

      expect(result).toEqual([
        {
          role: 'system',
          content: 'You are a helpful assistant.',
        },
      ]);
    });

    it('should return custom system message when prompt provided', () => {
      const customPrompt =
        'You are a coding assistant specialized in TypeScript.';

      const result = setSystemMessage(customPrompt);

      expect(result).toEqual([
        {
          role: 'system',
          content: customPrompt,
        },
      ]);
    });

    it('should handle empty string prompt', () => {
      const result = setSystemMessage('');

      expect(result).toEqual([
        {
          role: 'system',
          content: 'You are a helpful assistant.',
        },
      ]);
    });
  });

  describe('isImage', () => {
    it('should return true for .png files', () => {
      expect(isImage('images/photo.png')).toBe(true);
    });

    it('should return true for .jpg files', () => {
      expect(isImage('images/picture.jpg')).toBe(true);
    });

    it('should return true for .jpeg files', () => {
      expect(isImage('images/snapshot.jpeg')).toBe(true);
    });

    it('should return false for .gif files', () => {
      expect(isImage('images/animation.gif')).toBe(false);
    });

    it('should return false for .pdf files', () => {
      expect(isImage('documents/file.pdf')).toBe(false);
    });

    it('should return false for files without extension', () => {
      expect(isImage('images/file')).toBe(false);
    });

    it('should be case-sensitive', () => {
      expect(isImage('images/photo.PNG')).toBe(false);
    });
  });

  describe('transformMessagesToOpenAIFormat', () => {
    it('should transform single user message without image', () => {
      const messages: Message[] = [
        {
          id: '1',
          content: 'Hello, how are you?',
          role: MessageRole.USER,
          createdAt: new Date(),
        } as Message,
      ];

      const result = transformMessagesToOpenAIFormat(messages, cdnDomain);

      expect(result).toEqual([
        {
          role: 'user',
          content: [{ type: 'input_text', text: 'Hello, how are you?' }],
        },
      ]);
    });

    it('should transform single assistant message', () => {
      const messages: Message[] = [
        {
          id: '1',
          content: 'I am doing great!',
          role: MessageRole.ASSISTANT,
          createdAt: new Date(),
        } as Message,
      ];

      const result = transformMessagesToOpenAIFormat(messages, cdnDomain);

      expect(result).toEqual([
        {
          role: 'assistant',
          content: 'I am doing great!',
        },
      ]);
    });

    it('should transform user message with image', () => {
      const messages: Message[] = [
        {
          id: '1',
          content: 'What is in this image?',
          role: MessageRole.USER,
          fileKey: 'images/test.png',
          createdAt: new Date(),
        } as Message,
      ];

      const result = transformMessagesToOpenAIFormat(messages, cdnDomain);

      expect(result).toEqual([
        {
          role: 'user',
          content: [
            { type: 'input_text', text: 'What is in this image?' },
            {
              type: 'input_image',
              image_url: 'https://cdn.example.com/images/test.png',
              detail: 'high',
            },
          ],
        },
      ]);
    });

    it('should include previous assistant image in next user message', () => {
      const messages: Message[] = [
        {
          id: '1',
          content: 'Generate an image',
          role: MessageRole.USER,
          createdAt: new Date(),
        } as Message,
        {
          id: '2',
          content: 'Here is the image',
          role: MessageRole.ASSISTANT,
          fileKey: 'images/generated.png',
          createdAt: new Date(),
        } as Message,
        {
          id: '3',
          content: 'Make it brighter',
          role: MessageRole.USER,
          createdAt: new Date(),
        } as Message,
      ];

      const result = transformMessagesToOpenAIFormat(messages, cdnDomain);

      expect(result[2]).toEqual({
        role: 'user',
        content: [
          { type: 'input_text', text: 'Make it brighter' },
          {
            type: 'input_image',
            image_url: 'https://cdn.example.com/images/generated.png',
            detail: 'high',
          },
        ],
      });
    });

    it('should not include previous image if it is not from assistant', () => {
      const messages: Message[] = [
        {
          id: '1',
          content: 'First message',
          role: MessageRole.USER,
          fileKey: 'images/user.png',
          createdAt: new Date(),
        } as Message,
        {
          id: '2',
          content: 'Second message',
          role: MessageRole.USER,
          createdAt: new Date(),
        } as Message,
      ];

      const result = transformMessagesToOpenAIFormat(messages, cdnDomain);

      expect(result[1]).toEqual({
        role: 'user',
        content: [{ type: 'input_text', text: 'Second message' }],
      });
    });

    it('should handle non-image file keys', () => {
      const messages: Message[] = [
        {
          id: '1',
          content: 'Check this file',
          role: MessageRole.USER,
          fileKey: 'documents/file.pdf',
          createdAt: new Date(),
        } as Message,
      ];

      const result = transformMessagesToOpenAIFormat(messages, cdnDomain);

      expect(result).toEqual([
        {
          role: 'user',
          content: [{ type: 'input_text', text: 'Check this file' }],
        },
      ]);
    });

    it('should handle multiple messages with mixed content', () => {
      const messages: Message[] = [
        {
          id: '1',
          content: 'Hello',
          role: MessageRole.USER,
          createdAt: new Date(),
        } as Message,
        {
          id: '2',
          content: 'Hi there!',
          role: MessageRole.ASSISTANT,
          createdAt: new Date(),
        } as Message,
        {
          id: '3',
          content: 'Look at this',
          role: MessageRole.USER,
          fileKey: 'images/photo.jpg',
          createdAt: new Date(),
        } as Message,
      ];

      const result = transformMessagesToOpenAIFormat(messages, cdnDomain);

      expect(result).toHaveLength(3);
      expect((result[0] as any).role).toBe('user');
      expect((result[1] as any).role).toBe('assistant');
      expect((result[2] as any).role).toBe('user');
    });

    it('should handle empty messages array', () => {
      const result = transformMessagesToOpenAIFormat([], cdnDomain);

      expect(result).toEqual([]);
    });
  });

  describe('transformNewMessageToOpenAIFormat', () => {
    it('should transform message without any images', () => {
      const message = 'Tell me a joke';

      const result = transformNewMessageToOpenAIFormat(message, cdnDomain);

      expect(result).toEqual([
        {
          role: 'user',
          content: [{ type: 'input_text', text: 'Tell me a joke' }],
        },
      ]);
    });

    it('should transform message with user uploaded image', () => {
      const message = 'What do you see?';
      const fileKey = 'images/upload.png';

      const result = transformNewMessageToOpenAIFormat(
        message,
        cdnDomain,
        undefined,
        fileKey,
      );

      expect(result).toEqual([
        {
          role: 'user',
          content: [
            { type: 'input_text', text: 'What do you see?' },
            {
              type: 'input_image',
              image_url: 'https://cdn.example.com/images/upload.png',
              detail: 'high',
            },
          ],
        },
      ]);
    });

    it('should include previous assistant image', () => {
      const message = 'Modify this image';
      const prevMessage: Message = {
        id: '1',
        content: 'Generated image',
        role: MessageRole.ASSISTANT,
        fileKey: 'images/generated.jpeg',
        createdAt: new Date(),
      } as Message;

      const result = transformNewMessageToOpenAIFormat(
        message,
        cdnDomain,
        prevMessage,
      );

      expect(result).toEqual([
        {
          role: 'user',
          content: [
            { type: 'input_text', text: 'Modify this image' },
            {
              type: 'input_image',
              image_url: 'https://cdn.example.com/images/generated.jpeg',
              detail: 'high',
            },
          ],
        },
      ]);
    });

    it('should include both user and assistant images', () => {
      const message = 'Combine these';
      const fileKey = 'images/user.png';
      const prevMessage: Message = {
        id: '1',
        content: 'Previous',
        role: MessageRole.ASSISTANT,
        fileKey: 'images/assistant.jpg',
        createdAt: new Date(),
      } as Message;

      const result = transformNewMessageToOpenAIFormat(
        message,
        cdnDomain,
        prevMessage,
        fileKey,
      );

      expect((result[0] as any).content).toHaveLength(3);
      expect((result[0] as any).content[0]).toEqual({
        type: 'input_text',
        text: 'Combine these',
      });
      expect((result[0] as any).content[1]).toEqual({
        type: 'input_image',
        image_url: 'https://cdn.example.com/images/user.png',
        detail: 'high',
      });
      expect((result[0] as any).content[2]).toEqual({
        type: 'input_image',
        image_url: 'https://cdn.example.com/images/assistant.jpg',
        detail: 'high',
      });
    });

    it('should not include previous message if it is not from assistant', () => {
      const message = 'New message';
      const prevMessage: Message = {
        id: '1',
        content: 'Previous user message',
        role: MessageRole.USER,
        fileKey: 'images/user.png',
        createdAt: new Date(),
      } as Message;

      const result = transformNewMessageToOpenAIFormat(
        message,
        cdnDomain,
        prevMessage,
      );

      expect(result).toEqual([
        {
          role: 'user',
          content: [{ type: 'input_text', text: 'New message' }],
        },
      ]);
    });

    it('should not include previous image if it is not an image file', () => {
      const message = 'Check this';
      const prevMessage: Message = {
        id: '1',
        content: 'File sent',
        role: MessageRole.ASSISTANT,
        fileKey: 'documents/file.txt',
        createdAt: new Date(),
      } as Message;

      const result = transformNewMessageToOpenAIFormat(
        message,
        cdnDomain,
        prevMessage,
      );

      expect(result).toEqual([
        {
          role: 'user',
          content: [{ type: 'input_text', text: 'Check this' }],
        },
      ]);
    });

    it('should handle empty message text', () => {
      const result = transformNewMessageToOpenAIFormat('', cdnDomain);

      expect(result).toEqual([
        {
          role: 'user',
          content: [{ type: 'input_text', text: '' }],
        },
      ]);
    });
  });
});
