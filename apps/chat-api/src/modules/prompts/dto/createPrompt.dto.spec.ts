import { validate } from 'class-validator';
import { plainToInstance } from 'class-transformer';
import {
  CreatePromptReqDto,
  CreatePromptMessageDto,
  CreatePromptResDto,
} from './createPrompt.dto';
import { PromptMessageRole } from '../entities';

describe('CreatePromptMessageDto', () => {
  it('should validate a valid message payload', async () => {
    const payload = {
      role: PromptMessageRole.USER,
      content: 'Hello, how are you?',
    };

    const instance = plainToInstance(CreatePromptMessageDto, payload);
    const errors = await validate(instance);

    expect(errors).toHaveLength(0);
    expect(instance.role).toBe(PromptMessageRole.USER);
    expect(instance.content).toBe('Hello, how are you?');
  });

  it('should validate with assistant role', async () => {
    const payload = {
      role: PromptMessageRole.ASSISTANT,
      content: 'I am doing well, thank you!',
    };

    const instance = plainToInstance(CreatePromptMessageDto, payload);
    const errors = await validate(instance);

    expect(errors).toHaveLength(0);
    expect(instance.role).toBe(PromptMessageRole.ASSISTANT);
  });

  describe('role field validation', () => {
    it('should fail when role is missing', async () => {
      const payload = {
        content: 'Hello',
      };

      const instance = plainToInstance(CreatePromptMessageDto, payload);
      const errors = await validate(instance);

      expect(errors).toHaveLength(1);
      expect(errors[0].property).toBe('role');
      expect(errors[0].constraints).toHaveProperty('isEnum');
    });

    it('should fail when role is invalid', async () => {
      const payload = {
        role: 'invalid_role',
        content: 'Hello',
      };

      const instance = plainToInstance(CreatePromptMessageDto, payload);
      const errors = await validate(instance);

      expect(errors).toHaveLength(1);
      expect(errors[0].property).toBe('role');
      expect(errors[0].constraints).toHaveProperty('isEnum');
    });

    it('should fail when role is null', async () => {
      const payload = {
        role: null,
        content: 'Hello',
      };

      const instance = plainToInstance(CreatePromptMessageDto, payload);
      const errors = await validate(instance);

      expect(errors).toHaveLength(1);
      expect(errors[0].property).toBe('role');
    });
  });

  describe('content field validation', () => {
    it('should fail when content is missing', async () => {
      const payload = {
        role: PromptMessageRole.USER,
      };

      const instance = plainToInstance(CreatePromptMessageDto, payload);
      const errors = await validate(instance);

      expect(errors).toHaveLength(1);
      expect(errors[0].property).toBe('content');
      expect(errors[0].constraints).toHaveProperty('isNotEmpty');
    });

    it('should fail when content is not a string', async () => {
      const payload = {
        role: PromptMessageRole.USER,
        content: 123,
      };

      const instance = plainToInstance(CreatePromptMessageDto, payload);
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

      const instance = plainToInstance(CreatePromptMessageDto, payload);
      const errors = await validate(instance);

      expect(errors).toHaveLength(1);
      expect(errors[0].property).toBe('content');
      expect(errors[0].constraints).toHaveProperty('isNotEmpty');
    });

    it('should fail when content is null', async () => {
      const payload = {
        role: PromptMessageRole.USER,
        content: null,
      };

      const instance = plainToInstance(CreatePromptMessageDto, payload);
      const errors = await validate(instance);

      expect(errors).toHaveLength(1);
      expect(errors[0].property).toBe('content');
    });
  });

  describe('edge cases', () => {
    it('should validate with very long content', async () => {
      const payload = {
        role: PromptMessageRole.USER,
        content: 'a'.repeat(10000),
      };

      const instance = plainToInstance(CreatePromptMessageDto, payload);
      const errors = await validate(instance);

      expect(errors).toHaveLength(0);
    });

    it('should validate with special characters in content', async () => {
      const payload = {
        role: PromptMessageRole.USER,
        content: '!@#$%^&*()_+-=[]{}|;:",.<>?/~`',
      };

      const instance = plainToInstance(CreatePromptMessageDto, payload);
      const errors = await validate(instance);

      expect(errors).toHaveLength(0);
    });
  });
});

describe('CreatePromptReqDto', () => {
  it('should validate a valid create prompt payload', async () => {
    const payload = {
      name: 'My Prompt',
      content: 'This is a prompt content',
    };

    const instance = plainToInstance(CreatePromptReqDto, payload);
    const errors = await validate(instance);

    expect(errors).toHaveLength(0);
    expect(instance.name).toBe('My Prompt');
    expect(instance.content).toBe('This is a prompt content');
    expect(instance.messages).toBeUndefined();
  });

  it('should validate with messages array', async () => {
    const payload = {
      name: 'My Prompt',
      content: 'Content',
      messages: [
        { role: PromptMessageRole.USER, content: 'Hello' },
        { role: PromptMessageRole.ASSISTANT, content: 'Hi there!' },
      ],
    };

    const instance = plainToInstance(CreatePromptReqDto, payload);
    const errors = await validate(instance);

    expect(errors).toHaveLength(0);
    expect(instance.messages).toHaveLength(2);
  });

  describe('name field validation', () => {
    it('should fail when name is missing', async () => {
      const payload = {
        content: 'Content',
      };

      const instance = plainToInstance(CreatePromptReqDto, payload);
      const errors = await validate(instance);

      expect(errors).toHaveLength(1);
      expect(errors[0].property).toBe('name');
      expect(errors[0].constraints).toHaveProperty('isNotEmpty');
    });

    it('should fail when name is not a string', async () => {
      const payload = {
        name: 123,
        content: 'Content',
      };

      const instance = plainToInstance(CreatePromptReqDto, payload);
      const errors = await validate(instance);

      expect(errors).toHaveLength(1);
      expect(errors[0].property).toBe('name');
      expect(errors[0].constraints).toHaveProperty('isString');
    });

    it('should fail when name exceeds max length', async () => {
      const payload = {
        name: 'a'.repeat(256),
        content: 'Content',
      };

      const instance = plainToInstance(CreatePromptReqDto, payload);
      const errors = await validate(instance);

      expect(errors).toHaveLength(1);
      expect(errors[0].property).toBe('name');
      expect(errors[0].constraints).toHaveProperty('maxLength');
    });

    it('should fail when name is empty string', async () => {
      const payload = {
        name: '',
        content: 'Content',
      };

      const instance = plainToInstance(CreatePromptReqDto, payload);
      const errors = await validate(instance);

      expect(errors).toHaveLength(1);
      expect(errors[0].property).toBe('name');
      expect(errors[0].constraints).toHaveProperty('isNotEmpty');
    });

    it('should fail when name is null', async () => {
      const payload = {
        name: null,
        content: 'Content',
      };

      const instance = plainToInstance(CreatePromptReqDto, payload);
      const errors = await validate(instance);

      expect(errors).toHaveLength(1);
      expect(errors[0].property).toBe('name');
    });
  });

  describe('content field validation', () => {
    it('should fail when content is missing', async () => {
      const payload = {
        name: 'My Prompt',
      };

      const instance = plainToInstance(CreatePromptReqDto, payload);
      const errors = await validate(instance);

      expect(errors).toHaveLength(1);
      expect(errors[0].property).toBe('content');
      expect(errors[0].constraints).toHaveProperty('isNotEmpty');
    });

    it('should fail when content is not a string', async () => {
      const payload = {
        name: 'My Prompt',
        content: { text: 'Content' },
      };

      const instance = plainToInstance(CreatePromptReqDto, payload);
      const errors = await validate(instance);

      expect(errors).toHaveLength(1);
      expect(errors[0].property).toBe('content');
      expect(errors[0].constraints).toHaveProperty('isString');
    });

    it('should fail when content is empty string', async () => {
      const payload = {
        name: 'My Prompt',
        content: '',
      };

      const instance = plainToInstance(CreatePromptReqDto, payload);
      const errors = await validate(instance);

      expect(errors).toHaveLength(1);
      expect(errors[0].property).toBe('content');
      expect(errors[0].constraints).toHaveProperty('isNotEmpty');
    });

    it('should fail when content is null', async () => {
      const payload = {
        name: 'My Prompt',
        content: null,
      };

      const instance = plainToInstance(CreatePromptReqDto, payload);
      const errors = await validate(instance);

      expect(errors).toHaveLength(1);
      expect(errors[0].property).toBe('content');
    });
  });

  describe('messages field validation', () => {
    it('should fail when messages is not an array', async () => {
      const payload = {
        name: 'My Prompt',
        content: 'Content',
        messages: 'not an array',
      };

      const instance = plainToInstance(CreatePromptReqDto, payload);
      const errors = await validate(instance);

      expect(errors).toHaveLength(1);
      expect(errors[0].property).toBe('messages');
      expect(errors[0].constraints).toHaveProperty('isArray');
    });

    it('should fail when messages contains invalid message', async () => {
      const payload = {
        name: 'My Prompt',
        content: 'Content',
        messages: [
          { role: PromptMessageRole.USER, content: 'Hello' },
          { role: 'invalid', content: 'Bad message' },
        ],
      };

      const instance = plainToInstance(CreatePromptReqDto, payload);
      const errors = await validate(instance, { skipMissingProperties: false });

      expect(errors.length).toBeGreaterThan(0);
      const messageErrors = errors.find((e) => e.property === 'messages');
      expect(messageErrors).toBeDefined();
    });

    it('should fail when messages contains object with missing role', async () => {
      const payload = {
        name: 'My Prompt',
        content: 'Content',
        messages: [{ content: 'Hello' }],
      };

      const instance = plainToInstance(CreatePromptReqDto, payload);
      const errors = await validate(instance);

      expect(errors.length).toBeGreaterThan(0);
    });
  });

  describe('edge cases', () => {
    it('should validate with empty messages array', async () => {
      const payload = {
        name: 'My Prompt',
        content: 'Content',
        messages: [],
      };

      const instance = plainToInstance(CreatePromptReqDto, payload);
      const errors = await validate(instance);

      expect(errors).toHaveLength(0);
      expect(instance.messages).toEqual([]);
    });

    it('should validate when messages field is omitted', async () => {
      const payload = {
        name: 'My Prompt',
        content: 'Content',
      };

      const instance = plainToInstance(CreatePromptReqDto, payload);
      const errors = await validate(instance);

      expect(errors).toHaveLength(0);
      expect(instance.messages).toBeUndefined();
    });

    it('should validate at max name length', async () => {
      const payload = {
        name: 'a'.repeat(255),
        content: 'Content',
      };

      const instance = plainToInstance(CreatePromptReqDto, payload);
      const errors = await validate(instance);

      expect(errors).toHaveLength(0);
      expect(instance.name).toHaveLength(255);
    });

    it('should validate with large messages array', async () => {
      const messages = Array.from({ length: 100 }, (_, i) => ({
        role:
          i % 2 === 0 ? PromptMessageRole.USER : PromptMessageRole.ASSISTANT,
        content: `Message ${i}`,
      }));

      const payload = {
        name: 'My Prompt',
        content: 'Content',
        messages,
      };

      const instance = plainToInstance(CreatePromptReqDto, payload);
      const errors = await validate(instance);

      expect(errors).toHaveLength(0);
      expect(instance.messages).toHaveLength(100);
    });
  });
});
