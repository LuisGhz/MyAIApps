import { validate } from 'class-validator';
import { plainToInstance } from 'class-transformer';
import {
  UpdatePromptReqDto,
  UpdatePromptMessageDto,
  UpdatePromptResDto,
} from './updatePrompt.dto';
import { PromptMessageRole } from '../entities';

describe('UpdatePromptMessageDto', () => {
  it('should validate a valid message payload', async () => {
    const payload = {
      role: PromptMessageRole.USER,
      content: 'Updated message',
    };

    const instance = plainToInstance(UpdatePromptMessageDto, payload);
    const errors = await validate(instance);

    expect(errors).toHaveLength(0);
    expect(instance.role).toBe(PromptMessageRole.USER);
    expect(instance.content).toBe('Updated message');
  });

  it('should validate with optional id field', async () => {
    const payload = {
      id: '550e8400-e29b-41d4-a716-446655440000',
      role: PromptMessageRole.ASSISTANT,
      content: 'Assistant response',
    };

    const instance = plainToInstance(UpdatePromptMessageDto, payload);
    const errors = await validate(instance);

    expect(errors).toHaveLength(0);
    expect(instance.id).toBe('550e8400-e29b-41d4-a716-446655440000');
  });

  describe('id field validation', () => {
    it('should fail when id is not a valid UUID', async () => {
      const payload = {
        id: 'not-a-uuid',
        role: PromptMessageRole.USER,
        content: 'Message',
      };

      const instance = plainToInstance(UpdatePromptMessageDto, payload);
      const errors = await validate(instance);

      expect(errors).toHaveLength(1);
      expect(errors[0].property).toBe('id');
      expect(errors[0].constraints).toHaveProperty('isUuid');
    });

    it('should fail when id is a number', async () => {
      const payload = {
        id: 12345,
        role: PromptMessageRole.USER,
        content: 'Message',
      };

      const instance = plainToInstance(UpdatePromptMessageDto, payload);
      const errors = await validate(instance);

      expect(errors).toHaveLength(1);
      expect(errors[0].property).toBe('id');
      expect(errors[0].constraints).toHaveProperty('isUuid');
    });

    it('should validate when id is omitted', async () => {
      const payload = {
        role: PromptMessageRole.USER,
        content: 'Message',
      };

      const instance = plainToInstance(UpdatePromptMessageDto, payload);
      const errors = await validate(instance);

      expect(errors).toHaveLength(0);
      expect(instance.id).toBeUndefined();
    });
  });

  describe('role field validation', () => {
    it('should fail when role is missing', async () => {
      const payload = {
        content: 'Message',
      };

      const instance = plainToInstance(UpdatePromptMessageDto, payload);
      const errors = await validate(instance);

      expect(errors).toHaveLength(1);
      expect(errors[0].property).toBe('role');
      expect(errors[0].constraints).toHaveProperty('isEnum');
    });

    it('should fail when role is invalid', async () => {
      const payload = {
        role: 'invalid_role',
        content: 'Message',
      };

      const instance = plainToInstance(UpdatePromptMessageDto, payload);
      const errors = await validate(instance);

      expect(errors).toHaveLength(1);
      expect(errors[0].property).toBe('role');
      expect(errors[0].constraints).toHaveProperty('isEnum');
    });

    it('should validate with user role', async () => {
      const payload = {
        role: PromptMessageRole.USER,
        content: 'Message',
      };

      const instance = plainToInstance(UpdatePromptMessageDto, payload);
      const errors = await validate(instance);

      expect(errors).toHaveLength(0);
      expect(instance.role).toBe(PromptMessageRole.USER);
    });

    it('should validate with assistant role', async () => {
      const payload = {
        role: PromptMessageRole.ASSISTANT,
        content: 'Message',
      };

      const instance = plainToInstance(UpdatePromptMessageDto, payload);
      const errors = await validate(instance);

      expect(errors).toHaveLength(0);
      expect(instance.role).toBe(PromptMessageRole.ASSISTANT);
    });
  });

  describe('content field validation', () => {
    it('should fail when content is missing', async () => {
      const payload = {
        role: PromptMessageRole.USER,
      };

      const instance = plainToInstance(UpdatePromptMessageDto, payload);
      const errors = await validate(instance);

      expect(errors).toHaveLength(1);
      expect(errors[0].property).toBe('content');
      expect(errors[0].constraints).toHaveProperty('isString');
    });

    it('should fail when content is not a string', async () => {
      const payload = {
        role: PromptMessageRole.USER,
        content: 123,
      };

      const instance = plainToInstance(UpdatePromptMessageDto, payload);
      const errors = await validate(instance);

      expect(errors).toHaveLength(1);
      expect(errors[0].property).toBe('content');
      expect(errors[0].constraints).toHaveProperty('isString');
    });

    it('should fail when content is empty string', async () => {
      const payload = {
        role: PromptMessageRole.USER,
        content: '',
      };

      const instance = plainToInstance(UpdatePromptMessageDto, payload);
      const errors = await validate(instance);

      expect(errors).toHaveLength(0);
    });
  });

  describe('edge cases', () => {
    it('should validate with very long content', async () => {
      const payload = {
        role: PromptMessageRole.USER,
        content: 'a'.repeat(5000),
      };

      const instance = plainToInstance(UpdatePromptMessageDto, payload);
      const errors = await validate(instance);

      expect(errors).toHaveLength(0);
    });

    it('should validate with special characters', async () => {
      const payload = {
        role: PromptMessageRole.USER,
        content: '!@#$%^&*()_+-=[]{}|;:",.<>?/~`',
      };

      const instance = plainToInstance(UpdatePromptMessageDto, payload);
      const errors = await validate(instance);

      expect(errors).toHaveLength(0);
    });
  });
});

describe('UpdatePromptReqDto', () => {
  it('should validate a minimal update payload', async () => {
    const payload = {
      name: 'Updated Name',
    };

    const instance = plainToInstance(UpdatePromptReqDto, payload);
    const errors = await validate(instance);

    expect(errors).toHaveLength(0);
    expect(instance.name).toBe('Updated Name');
    expect(instance.content).toBeUndefined();
    expect(instance.messages).toBeUndefined();
  });

  it('should validate with all fields', async () => {
    const payload = {
      name: 'Updated Name',
      content: 'Updated content',
      messages: [
        {
          id: '550e8400-e29b-41d4-a716-446655440000',
          role: PromptMessageRole.USER,
          content: 'Hello',
        },
      ],
    };

    const instance = plainToInstance(UpdatePromptReqDto, payload);
    const errors = await validate(instance);

    expect(errors).toHaveLength(0);
    expect(instance.name).toBe('Updated Name');
    expect(instance.content).toBe('Updated content');
    expect(instance.messages).toHaveLength(1);
  });

  it('should validate with empty payload', async () => {
    const payload = {};

    const instance = plainToInstance(UpdatePromptReqDto, payload);
    const errors = await validate(instance);

    expect(errors).toHaveLength(0);
  });

  describe('name field validation', () => {
    it('should fail when name exceeds max length', async () => {
      const payload = {
        name: 'a'.repeat(256),
      };

      const instance = plainToInstance(UpdatePromptReqDto, payload);
      const errors = await validate(instance);

      expect(errors).toHaveLength(1);
      expect(errors[0].property).toBe('name');
      expect(errors[0].constraints).toHaveProperty('maxLength');
    });

    it('should fail when name is not a string', async () => {
      const payload = {
        name: 123,
      };

      const instance = plainToInstance(UpdatePromptReqDto, payload);
      const errors = await validate(instance);

      expect(errors).toHaveLength(1);
      expect(errors[0].property).toBe('name');
      expect(errors[0].constraints).toHaveProperty('isString');
    });

    it('should validate when name is at max length', async () => {
      const payload = {
        name: 'a'.repeat(255),
      };

      const instance = plainToInstance(UpdatePromptReqDto, payload);
      const errors = await validate(instance);

      expect(errors).toHaveLength(0);
      expect(instance.name).toHaveLength(255);
    });

    it('should validate when name is omitted', async () => {
      const payload = {
        content: 'New content',
      };

      const instance = plainToInstance(UpdatePromptReqDto, payload);
      const errors = await validate(instance);

      expect(errors).toHaveLength(0);
      expect(instance.name).toBeUndefined();
    });
  });

  describe('content field validation', () => {
    it('should fail when content is not a string', async () => {
      const payload = {
        content: { text: 'Content' },
      };

      const instance = plainToInstance(UpdatePromptReqDto, payload);
      const errors = await validate(instance);

      expect(errors).toHaveLength(1);
      expect(errors[0].property).toBe('content');
      expect(errors[0].constraints).toHaveProperty('isString');
    });

    it('should validate when content is omitted', async () => {
      const payload = {
        name: 'Updated Name',
      };

      const instance = plainToInstance(UpdatePromptReqDto, payload);
      const errors = await validate(instance);

      expect(errors).toHaveLength(0);
      expect(instance.content).toBeUndefined();
    });

    it('should validate with empty string content', async () => {
      const payload = {
        content: '',
      };

      const instance = plainToInstance(UpdatePromptReqDto, payload);
      const errors = await validate(instance);

      expect(errors).toHaveLength(0);
    });

    it('should validate with very long content', async () => {
      const payload = {
        content: 'a'.repeat(10000),
      };

      const instance = plainToInstance(UpdatePromptReqDto, payload);
      const errors = await validate(instance);

      expect(errors).toHaveLength(0);
    });
  });

  describe('messages field validation', () => {
    it('should fail when messages is not an array', async () => {
      const payload = {
        messages: 'not an array',
      };

      const instance = plainToInstance(UpdatePromptReqDto, payload);
      const errors = await validate(instance);

      expect(errors).toHaveLength(1);
      expect(errors[0].property).toBe('messages');
      expect(errors[0].constraints).toHaveProperty('isArray');
    });

    it('should fail when messages contains invalid message object', async () => {
      const payload = {
        messages: [
          {
            id: '550e8400-e29b-41d4-a716-446655440000',
            role: 'invalid',
            content: 'Message',
          },
        ],
      };

      const instance = plainToInstance(UpdatePromptReqDto, payload);
      const errors = await validate(instance);

      expect(errors.length).toBeGreaterThan(0);
    });

    it('should validate with empty messages array', async () => {
      const payload = {
        messages: [],
      };

      const instance = plainToInstance(UpdatePromptReqDto, payload);
      const errors = await validate(instance);

      expect(errors).toHaveLength(0);
      expect(instance.messages).toEqual([]);
    });

    it('should validate when messages is omitted', async () => {
      const payload = {
        name: 'Updated',
      };

      const instance = plainToInstance(UpdatePromptReqDto, payload);
      const errors = await validate(instance);

      expect(errors).toHaveLength(0);
      expect(instance.messages).toBeUndefined();
    });
  });

  describe('edge cases', () => {
    it('should validate with only name field', async () => {
      const payload = {
        name: 'Updated Name',
      };

      const instance = plainToInstance(UpdatePromptReqDto, payload);
      const errors = await validate(instance);

      expect(errors).toHaveLength(0);
    });

    it('should validate with only content field', async () => {
      const payload = {
        content: 'Updated content',
      };

      const instance = plainToInstance(UpdatePromptReqDto, payload);
      const errors = await validate(instance);

      expect(errors).toHaveLength(0);
    });

    it('should validate with only messages field', async () => {
      const payload = {
        messages: [
          {
            role: PromptMessageRole.USER,
            content: 'Message',
          },
        ],
      };

      const instance = plainToInstance(UpdatePromptReqDto, payload);
      const errors = await validate(instance);

      expect(errors).toHaveLength(0);
    });

    it('should validate with large messages array', async () => {
      const messages = Array.from({ length: 50 }, (_, i) => {
        const paddedIndex = String(i).padStart(2, '0');
        return {
          id: `550e8400-e29b-41d4-a716-44665544000${paddedIndex}`.slice(0, 36),
          role:
            i % 2 === 0 ? PromptMessageRole.USER : PromptMessageRole.ASSISTANT,
          content: `Message ${i}`,
        };
      });

      const payload = {
        messages,
      };

      const instance = plainToInstance(UpdatePromptReqDto, payload);
      const errors = await validate(instance);

      expect(errors).toHaveLength(0);
      expect(instance.messages).toHaveLength(50);
    });
  });
});
