import { plainToInstance } from 'class-transformer';
import { validate } from 'class-validator';
import { ChatMessagesReqDto, ChatMessagesResDto } from './chatMessages.dto';

describe('ChatMessagesReqDto', () => {
  describe('valid payload', () => {
    it('should create a valid instance with no fields', async () => {
      const payload = {};

      const instance = plainToInstance(ChatMessagesReqDto, payload);
      const errors = await validate(instance);

      expect(errors).toHaveLength(0);
    });

    it('should create a valid instance with beforeMessageId', async () => {
      const payload = {
        beforeMessageId: '550e8400-e29b-41d4-a716-446655440000',
      };

      const instance = plainToInstance(ChatMessagesReqDto, payload);
      const errors = await validate(instance);

      expect(errors).toHaveLength(0);
      expect(instance.beforeMessageId).toBe(payload.beforeMessageId);
    });
  });

  describe('beforeMessageId field (optional)', () => {
    it('should accept valid UUID for beforeMessageId', async () => {
      const payload = {
        beforeMessageId: '550e8400-e29b-41d4-a716-446655440000',
      };

      const instance = plainToInstance(ChatMessagesReqDto, payload);
      const errors = await validate(instance);

      expect(errors).toHaveLength(0);
      expect(instance.beforeMessageId).toBe(payload.beforeMessageId);
    });

    it('should fail validation when beforeMessageId is invalid UUID', async () => {
      const payload = {
        beforeMessageId: 'not-a-uuid',
      };

      const instance = plainToInstance(ChatMessagesReqDto, payload);
      const errors = await validate(instance);

      expect(errors).toHaveLength(1);
      expect(errors[0].property).toBe('beforeMessageId');
      expect(errors[0].constraints).toHaveProperty('isUuid');
    });

    it('should accept undefined beforeMessageId', async () => {
      const payload = {};

      const instance = plainToInstance(ChatMessagesReqDto, payload);
      const errors = await validate(instance);

      expect(errors).toHaveLength(0);
      expect(instance.beforeMessageId).toBeUndefined();
    });

    it('should fail validation when beforeMessageId is empty string', async () => {
      const payload = {
        beforeMessageId: '',
      };

      const instance = plainToInstance(ChatMessagesReqDto, payload);
      const errors = await validate(instance);

      expect(errors).toHaveLength(1);
      expect(errors[0].property).toBe('beforeMessageId');
      expect(errors[0].constraints).toHaveProperty('isUuid');
    });

    it('should fail validation when beforeMessageId is not a valid UUID pattern', async () => {
      const payload = {
        beforeMessageId: 'not-a-valid-uuid-format',
      };

      const instance = plainToInstance(ChatMessagesReqDto, payload);
      const errors = await validate(instance);

      expect(errors.length).toBeGreaterThan(0);
      expect(errors[0].property).toBe('beforeMessageId');
      expect(errors[0].constraints).toHaveProperty('isUuid');
    });

    it('should fail validation when beforeMessageId is a number', async () => {
      const payload = {
        beforeMessageId: 12345,
      };

      const instance = plainToInstance(ChatMessagesReqDto, payload);
      const errors = await validate(instance);

      expect(errors).toHaveLength(1);
      expect(errors[0].property).toBe('beforeMessageId');
      expect(errors[0].constraints).toHaveProperty('isUuid');
    });
  });
});

describe('ChatMessagesResDto', () => {
  it('should have all required properties defined', () => {
    const instance = new ChatMessagesResDto();

    expect(instance).toBeDefined();
  });
});
