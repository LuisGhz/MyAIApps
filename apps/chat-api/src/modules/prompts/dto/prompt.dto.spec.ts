import { plainToInstance } from 'class-transformer';
import {
  PromptResDto,
  PromptMessageResDto,
  PromptListItemResDto,
  PromptListItemSummaryResDto,
} from './prompt.dto';
import { PromptMessageRole } from '../entities';

describe('PromptMessageResDto', () => {
  it('should instantiate with valid data', () => {
    const payload = {
      id: '550e8400-e29b-41d4-a716-446655440000',
      role: PromptMessageRole.USER,
      content: 'Hello, world!',
      createdAt: new Date('2024-01-01'),
      updatedAt: new Date('2024-01-02'),
    };

    const instance = plainToInstance(PromptMessageResDto, payload);

    expect(instance.id).toBe('550e8400-e29b-41d4-a716-446655440000');
    expect(instance.role).toBe(PromptMessageRole.USER);
    expect(instance.content).toBe('Hello, world!');
    expect(instance.createdAt).toEqual(new Date('2024-01-01'));
    expect(instance.updatedAt).toEqual(new Date('2024-01-02'));
  });

  it('should instantiate with assistant role', () => {
    const payload = {
      id: '550e8400-e29b-41d4-a716-446655440001',
      role: PromptMessageRole.ASSISTANT,
      content: 'Hi there!',
      createdAt: new Date(),
      updatedAt: new Date(),
    };

    const instance = plainToInstance(PromptMessageResDto, payload);

    expect(instance.role).toBe(PromptMessageRole.ASSISTANT);
    expect(instance.content).toBe('Hi there!');
  });

  it('should handle all required fields', () => {
    const payload = {
      id: 'test-id',
      role: PromptMessageRole.USER,
      content: 'Test content',
      createdAt: new Date('2024-06-15'),
      updatedAt: new Date('2024-06-16'),
    };

    const instance = plainToInstance(PromptMessageResDto, payload);

    expect(instance).toEqual(payload);
  });

  it('should preserve dates as Date objects', () => {
    const createdDate = new Date('2024-01-15T10:30:00Z');
    const updatedDate = new Date('2024-01-16T11:45:00Z');
    const payload = {
      id: 'uuid-string',
      role: PromptMessageRole.ASSISTANT,
      content: 'Message',
      createdAt: createdDate,
      updatedAt: updatedDate,
    };

    const instance = plainToInstance(PromptMessageResDto, payload);

    expect(instance.createdAt).toEqual(createdDate);
    expect(instance.updatedAt).toEqual(updatedDate);
  });

  describe('edge cases', () => {
    it('should handle long content', () => {
      const payload = {
        id: 'id-123',
        role: PromptMessageRole.USER,
        content: 'a'.repeat(10000),
        createdAt: new Date(),
        updatedAt: new Date(),
      };

      const instance = plainToInstance(PromptMessageResDto, payload);

      expect(instance.content).toHaveLength(10000);
    });

    it('should handle special characters in content', () => {
      const payload = {
        id: 'id-456',
        role: PromptMessageRole.USER,
        content: '!@#$%^&*()_+-=[]{}|;:",.<>?/~`\n\t',
        createdAt: new Date(),
        updatedAt: new Date(),
      };

      const instance = plainToInstance(PromptMessageResDto, payload);

      expect(instance.content).toContain('!@#$%^&*()');
      expect(instance.content).toContain('\n');
      expect(instance.content).toContain('\t');
    });
  });
});

describe('PromptResDto', () => {
  it('should instantiate with valid data', () => {
    const payload = {
      id: '550e8400-e29b-41d4-a716-446655440000',
      name: 'My Prompt',
      content: 'This is my prompt',
      messages: [
        {
          id: '550e8400-e29b-41d4-a716-446655440001',
          role: PromptMessageRole.USER,
          content: 'Hello',
          createdAt: new Date(),
          updatedAt: new Date(),
        },
        {
          id: '550e8400-e29b-41d4-a716-446655440002',
          role: PromptMessageRole.ASSISTANT,
          content: 'Hi!',
          createdAt: new Date(),
          updatedAt: new Date(),
        },
      ],
      createdAt: new Date('2024-01-01'),
      updatedAt: new Date('2024-01-02'),
    };

    const instance = plainToInstance(PromptResDto, payload);

    expect(instance.id).toBe('550e8400-e29b-41d4-a716-446655440000');
    expect(instance.name).toBe('My Prompt');
    expect(instance.content).toBe('This is my prompt');
    expect(instance.messages).toHaveLength(2);
    expect(instance.createdAt).toEqual(new Date('2024-01-01'));
    expect(instance.updatedAt).toEqual(new Date('2024-01-02'));
  });

  it('should instantiate with empty messages array', () => {
    const payload = {
      id: 'prompt-id',
      name: 'Empty Prompt',
      content: 'No messages',
      messages: [],
      createdAt: new Date(),
      updatedAt: new Date(),
    };

    const instance = plainToInstance(PromptResDto, payload);

    expect(instance.messages).toEqual([]);
  });

  it('should preserve all message properties', () => {
    const messages = [
      {
        id: 'msg-1',
        role: PromptMessageRole.USER,
        content: 'User message',
        createdAt: new Date('2024-01-01'),
        updatedAt: new Date('2024-01-01'),
      },
    ];

    const payload = {
      id: 'prompt-123',
      name: 'Test',
      content: 'Content',
      messages,
      createdAt: new Date(),
      updatedAt: new Date(),
    };

    const instance = plainToInstance(PromptResDto, payload);

    expect(instance.messages[0]).toEqual(messages[0]);
  });

  describe('edge cases', () => {
    it('should handle large messages array', () => {
      const messages = Array.from({ length: 1000 }, (_, i) => ({
        id: `msg-${i}`,
        role:
          i % 2 === 0 ? PromptMessageRole.USER : PromptMessageRole.ASSISTANT,
        content: `Message ${i}`,
        createdAt: new Date(),
        updatedAt: new Date(),
      }));

      const payload = {
        id: 'prompt-large',
        name: 'Large Prompt',
        content: 'Content',
        messages,
        createdAt: new Date(),
        updatedAt: new Date(),
      };

      const instance = plainToInstance(PromptResDto, payload);

      expect(instance.messages).toHaveLength(1000);
    });

    it('should handle long prompt name', () => {
      const payload = {
        id: 'prompt-id',
        name: 'a'.repeat(255),
        content: 'Content',
        messages: [],
        createdAt: new Date(),
        updatedAt: new Date(),
      };

      const instance = plainToInstance(PromptResDto, payload);

      expect(instance.name).toHaveLength(255);
    });

    it('should handle very long content', () => {
      const payload = {
        id: 'prompt-id',
        name: 'Long Content Prompt',
        content: 'x'.repeat(100000),
        messages: [],
        createdAt: new Date(),
        updatedAt: new Date(),
      };

      const instance = plainToInstance(PromptResDto, payload);

      expect(instance.content).toHaveLength(100000);
    });
  });
});

describe('PromptListItemResDto', () => {
  it('should instantiate with valid data', () => {
    const payload = {
      id: '550e8400-e29b-41d4-a716-446655440000',
      name: 'My Prompt',
      content: 'Prompt content',
      messageCount: 5,
      createdAt: new Date('2024-01-01'),
      updatedAt: new Date('2024-01-02'),
    };

    const instance = plainToInstance(PromptListItemResDto, payload);

    expect(instance.id).toBe('550e8400-e29b-41d4-a716-446655440000');
    expect(instance.name).toBe('My Prompt');
    expect(instance.content).toBe('Prompt content');
    expect(instance.messageCount).toBe(5);
    expect(instance.createdAt).toEqual(new Date('2024-01-01'));
    expect(instance.updatedAt).toEqual(new Date('2024-01-02'));
  });

  it('should instantiate with zero message count', () => {
    const payload = {
      id: 'prompt-1',
      name: 'Empty Prompt',
      content: 'No messages yet',
      messageCount: 0,
      createdAt: new Date(),
      updatedAt: new Date(),
    };

    const instance = plainToInstance(PromptListItemResDto, payload);

    expect(instance.messageCount).toBe(0);
  });

  it('should instantiate with large message count', () => {
    const payload = {
      id: 'prompt-2',
      name: 'Big Prompt',
      content: 'Lots of messages',
      messageCount: 10000,
      createdAt: new Date(),
      updatedAt: new Date(),
    };

    const instance = plainToInstance(PromptListItemResDto, payload);

    expect(instance.messageCount).toBe(10000);
  });

  describe('edge cases', () => {
    it('should handle long prompt name', () => {
      const payload = {
        id: 'prompt-id',
        name: 'a'.repeat(255),
        content: 'Content',
        messageCount: 3,
        createdAt: new Date(),
        updatedAt: new Date(),
      };

      const instance = plainToInstance(PromptListItemResDto, payload);

      expect(instance.name).toHaveLength(255);
    });

    it('should handle very long content', () => {
      const payload = {
        id: 'prompt-id',
        name: 'Prompt',
        content: 'b'.repeat(50000),
        messageCount: 10,
        createdAt: new Date(),
        updatedAt: new Date(),
      };

      const instance = plainToInstance(PromptListItemResDto, payload);

      expect(instance.content).toHaveLength(50000);
    });

    it('should preserve integer message count', () => {
      const payload = {
        id: 'prompt-id',
        name: 'Test',
        content: 'Content',
        messageCount: 42,
        createdAt: new Date(),
        updatedAt: new Date(),
      };

      const instance = plainToInstance(PromptListItemResDto, payload);

      expect(instance.messageCount).toBe(42);
      expect(Number.isInteger(instance.messageCount)).toBe(true);
    });
  });
});

describe('PromptListItemSummaryResDto', () => {
  it('should instantiate with valid data', () => {
    const payload = {
      id: '550e8400-e29b-41d4-a716-446655440000',
      name: 'Summary Prompt',
    };

    const instance = plainToInstance(PromptListItemSummaryResDto, payload);

    expect(instance.id).toBe('550e8400-e29b-41d4-a716-446655440000');
    expect(instance.name).toBe('Summary Prompt');
  });

  it('should contain only id and name fields', () => {
    const payload = {
      id: 'test-id',
      name: 'Test Name',
    };

    const instance = plainToInstance(PromptListItemSummaryResDto, payload);

    expect(Object.keys(instance).sort()).toEqual(['id', 'name']);
  });

  describe('edge cases', () => {
    it('should handle long prompt name', () => {
      const payload = {
        id: 'id-123',
        name: 'a'.repeat(255),
      };

      const instance = plainToInstance(PromptListItemSummaryResDto, payload);

      expect(instance.name).toHaveLength(255);
    });

    it('should handle UUID id', () => {
      const uuid = '550e8400-e29b-41d4-a716-446655440000';
      const payload = {
        id: uuid,
        name: 'Test',
      };

      const instance = plainToInstance(PromptListItemSummaryResDto, payload);

      expect(instance.id).toBe(uuid);
    });

    it('should handle special characters in name', () => {
      const payload = {
        id: 'test-id',
        name: '!@#$%^&*()_+-=[]{}|;:",.<>?/~`',
      };

      const instance = plainToInstance(PromptListItemSummaryResDto, payload);

      expect(instance.name).toContain('!@#$%^&*()');
    });

    it('should preserve minimal data structure', () => {
      const payload = {
        id: 'minimal-id',
        name: 'Minimal',
      };

      const instance = plainToInstance(PromptListItemSummaryResDto, payload);

      expect(Object.getOwnPropertyNames(instance)).toEqual(
        expect.arrayContaining(['id', 'name']),
      );
    });
  });
});
