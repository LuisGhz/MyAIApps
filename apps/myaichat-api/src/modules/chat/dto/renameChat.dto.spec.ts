import { plainToInstance } from 'class-transformer';
import { validate } from 'class-validator';
import { RenameChatReqDto } from './renameChat.dto';

describe('RenameChatReqDto', () => {
  describe('valid payload', () => {
    it.each([
      ['short title', 'New Chat'],
      ['long title', 'A'.repeat(255)],
      ['special characters', 'Chat @#$%^&*() with special chars'],
      ['unicode characters', '你好世界 مرحبا العالم 🌍'],
    ])('should create a valid instance with %s', async (_, title) => {
      const payload = { title };
      const instance = plainToInstance(RenameChatReqDto, payload);
      const errors = await validate(instance);

      expect(errors).toHaveLength(0);
      expect(instance.title).toBe(title);
      if (title.length === 255) expect(instance.title).toHaveLength(255);
    });
  });

  describe('title field validation failures', () => {
    it.each([
      ['not provided', {}, 'isNotEmpty'],
      ['empty string', { title: '' }, 'isNotEmpty'],
      ['null', { title: null }, 'isString'],
      ['not a string', { title: 123 }, 'isString'],
      ['an object', { title: { name: 'Chat' } }, 'isString'],
      ['an array', { title: ['Chat', 'Name'] }, 'isString'],
      ['exceeds 255 characters', { title: 'A'.repeat(256) }, 'maxLength'],
    ])(
      'should fail validation when title is %s',
      async (_, payload, expectedConstraint) => {
        const instance = plainToInstance(RenameChatReqDto, payload);
        const errors = await validate(instance);

        expect(errors).toHaveLength(1);
        expect(errors[0].property).toBe('title');
        expect(errors[0].constraints).toHaveProperty(expectedConstraint);
      },
    );
  });

  describe('boundary values', () => {
    it.each([
      ['exactly 1 character', 'A', 1],
      ['exactly 255 characters', 'B'.repeat(255), 255],
    ])('should accept title with %s', async (_, title, expectedLength) => {
      const payload = { title };
      const instance = plainToInstance(RenameChatReqDto, payload);
      const errors = await validate(instance);

      expect(errors).toHaveLength(0);
      expect(instance.title).toHaveLength(expectedLength);
    });
  });

  it('should reject title with 256 characters', async () => {
    const payload = {
      title: 'C'.repeat(256),
    };

    const instance = plainToInstance(RenameChatReqDto, payload);
    const errors = await validate(instance);

    expect(errors).toHaveLength(1);
    expect(errors[0].constraints).toHaveProperty('maxLength');
  });
});
