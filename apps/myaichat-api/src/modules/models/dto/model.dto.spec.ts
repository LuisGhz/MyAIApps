import 'reflect-metadata';
import { plainToInstance } from 'class-transformer';
import {
  ModelResDto,
  ModelListItemResDto,
  ModelDeveloperResDto,
  DeveloperListItemResDto,
} from './model.dto';

describe('Model DTOs', () => {
  describe('ModelDeveloperResDto', () => {
    it('should transform valid payload', () => {
      const payload = {
        id: '550e8400-e29b-41d4-a716-446655440000',
        name: 'OpenAI',
        link: 'https://openai.com',
        imageUrl: 'https://openai.com/logo.png',
      };

      const instance = plainToInstance(ModelDeveloperResDto, payload);

      expect(instance.id).toBe('550e8400-e29b-41d4-a716-446655440000');
      expect(instance.name).toBe('OpenAI');
      expect(instance.link).toBe('https://openai.com');
      expect(instance.imageUrl).toBe('https://openai.com/logo.png');
      expect(instance).toBeInstanceOf(ModelDeveloperResDto);
    });

    it('should handle missing optional properties gracefully', () => {
      const payload = {
        id: '550e8400-e29b-41d4-a716-446655440000',
        name: 'OpenAI',
      };

      const instance = plainToInstance(ModelDeveloperResDto, payload);

      expect(instance.id).toBe('550e8400-e29b-41d4-a716-446655440000');
      expect(instance.name).toBe('OpenAI');
      expect(instance.link).toBeUndefined();
      expect(instance.imageUrl).toBeUndefined();
    });

    it('should preserve property types', () => {
      const payload = {
        id: '550e8400-e29b-41d4-a716-446655440000',
        name: 'OpenAI',
        link: 'https://openai.com',
        imageUrl: 'https://openai.com/logo.png',
      };

      const instance = plainToInstance(ModelDeveloperResDto, payload);

      expect(typeof instance.id).toBe('string');
      expect(typeof instance.name).toBe('string');
      expect(typeof instance.link).toBe('string');
      expect(typeof instance.imageUrl).toBe('string');
    });
  });

  describe('DeveloperListItemResDto', () => {
    it('should transform valid payload', () => {
      const payload = {
        id: '550e8400-e29b-41d4-a716-446655440000',
        name: 'OpenAI',
        link: 'https://openai.com',
        imageUrl: 'https://openai.com/logo.png',
      };

      const instance = plainToInstance(DeveloperListItemResDto, payload);

      expect(instance.id).toBe('550e8400-e29b-41d4-a716-446655440000');
      expect(instance.name).toBe('OpenAI');
      expect(instance.link).toBe('https://openai.com');
      expect(instance.imageUrl).toBe('https://openai.com/logo.png');
      expect(instance).toBeInstanceOf(DeveloperListItemResDto);
    });

    it('should have identical structure to ModelDeveloperResDto', () => {
      const payload = {
        id: '550e8400-e29b-41d4-a716-446655440000',
        name: 'Google',
        link: 'https://google.com',
        imageUrl: 'https://google.com/logo.png',
      };

      const devResInstance = plainToInstance(ModelDeveloperResDto, payload);
      const listItemInstance = plainToInstance(
        DeveloperListItemResDto,
        payload,
      );

      expect(devResInstance.id).toBe(listItemInstance.id);
      expect(devResInstance.name).toBe(listItemInstance.name);
      expect(devResInstance.link).toBe(listItemInstance.link);
      expect(devResInstance.imageUrl).toBe(listItemInstance.imageUrl);
    });

    it('should preserve property types', () => {
      const payload = {
        id: '550e8400-e29b-41d4-a716-446655440000',
        name: 'OpenAI',
        link: 'https://openai.com',
        imageUrl: 'https://openai.com/logo.png',
      };

      const instance = plainToInstance(DeveloperListItemResDto, payload);

      expect(typeof instance.id).toBe('string');
      expect(typeof instance.name).toBe('string');
      expect(typeof instance.link).toBe('string');
      expect(typeof instance.imageUrl).toBe('string');
    });
  });

  describe('ModelResDto', () => {
    const validPayload = {
      id: '550e8400-e29b-41d4-a716-446655440001',
      name: 'GPT-4',
      shortName: 'gpt-4',
      value: 'gpt-4-turbo',
      link: 'https://openai.com/gpt-4',
      guestAccess: true,
      price: {
        input: 0.03,
        output: 0.06,
      },
      metadata: {
        contextWindow: 8192,
        maxOutputTokens: 4096,
        knowledgeCutoff: '2024-01-01',
      },
      developer: {
        id: '550e8400-e29b-41d4-a716-446655440000',
        name: 'OpenAI',
        link: 'https://openai.com',
        imageUrl: 'https://openai.com/logo.png',
      },
      createdAt: new Date('2024-01-01'),
      updatedAt: new Date('2024-01-02'),
    };

    it('should transform valid payload', () => {
      const instance = plainToInstance(ModelResDto, validPayload);

      expect(instance.id).toBe('550e8400-e29b-41d4-a716-446655440001');
      expect(instance.name).toBe('GPT-4');
      expect(instance.shortName).toBe('gpt-4');
      expect(instance.value).toBe('gpt-4-turbo');
      expect(instance.link).toBe('https://openai.com/gpt-4');
      expect(instance.guestAccess).toBe(true);
      expect(instance.price.input).toBe(0.03);
      expect(instance.price.output).toBe(0.06);
      expect(instance.metadata.contextWindow).toBe(8192);
      expect(instance.metadata.maxOutputTokens).toBe(4096);
      expect(instance.metadata.knowledgeCutoff).toBe('2024-01-01');
      expect(instance.developer.name).toBe('OpenAI');
      expect(instance).toBeInstanceOf(ModelResDto);
    });

    it('should preserve nested object structures', () => {
      const instance = plainToInstance(ModelResDto, validPayload);

      expect(instance.price).toEqual({
        input: 0.03,
        output: 0.06,
      });
      expect(instance.metadata).toEqual({
        contextWindow: 8192,
        maxOutputTokens: 4096,
        knowledgeCutoff: '2024-01-01',
      });
      expect(instance.developer).toEqual(validPayload.developer);
    });

    it('should handle dates as Date objects', () => {
      const instance = plainToInstance(ModelResDto, validPayload);

      expect(instance.createdAt).toEqual(new Date('2024-01-01'));
      expect(instance.updatedAt).toEqual(new Date('2024-01-02'));
    });

    it('should preserve boolean property', () => {
      const payload = {
        ...validPayload,
        guestAccess: false,
      };

      const instance = plainToInstance(ModelResDto, payload);

      expect(instance.guestAccess).toBe(false);
      expect(typeof instance.guestAccess).toBe('boolean');
    });

    it('should handle partial payload', () => {
      const payload = {
        id: '550e8400-e29b-41d4-a716-446655440001',
        name: 'GPT-4',
        shortName: 'gpt-4',
      };

      const instance = plainToInstance(ModelResDto, payload);

      expect(instance.id).toBe('550e8400-e29b-41d4-a716-446655440001');
      expect(instance.name).toBe('GPT-4');
      expect(instance.shortName).toBe('gpt-4');
      expect(instance.value).toBeUndefined();
      expect(instance.price).toBeUndefined();
    });

    it('should preserve all string properties', () => {
      const instance = plainToInstance(ModelResDto, validPayload);

      expect(typeof instance.id).toBe('string');
      expect(typeof instance.name).toBe('string');
      expect(typeof instance.shortName).toBe('string');
      expect(typeof instance.value).toBe('string');
      expect(typeof instance.link).toBe('string');
    });

    it('should preserve numeric properties in nested objects', () => {
      const instance = plainToInstance(ModelResDto, validPayload);

      expect(typeof instance.price.input).toBe('number');
      expect(typeof instance.price.output).toBe('number');
      expect(typeof instance.metadata.contextWindow).toBe('number');
      expect(typeof instance.metadata.maxOutputTokens).toBe('number');
    });
  });

  describe('ModelListItemResDto', () => {
    const validPayload = {
      id: '550e8400-e29b-41d4-a716-446655440001',
      name: 'GPT-4',
      shortName: 'gpt-4',
      value: 'gpt-4-turbo',
      guestAccess: true,
      developer: {
        name: 'OpenAI',
        imageUrl: 'https://openai.com/logo.png',
      },
    };

    it('should transform valid payload', () => {
      const instance = plainToInstance(ModelListItemResDto, validPayload);

      expect(instance.id).toBe('550e8400-e29b-41d4-a716-446655440001');
      expect(instance.name).toBe('GPT-4');
      expect(instance.shortName).toBe('gpt-4');
      expect(instance.value).toBe('gpt-4-turbo');
      expect(instance.guestAccess).toBe(true);
      expect(instance.developer.name).toBe('OpenAI');
      expect(instance.developer.imageUrl).toBe('https://openai.com/logo.png');
      expect(instance).toBeInstanceOf(ModelListItemResDto);
    });

    it('should preserve nested developer object', () => {
      const instance = plainToInstance(ModelListItemResDto, validPayload);

      expect(instance.developer).toEqual({
        name: 'OpenAI',
        imageUrl: 'https://openai.com/logo.png',
      });
    });

    it('should handle boolean property correctly', () => {
      const payload = {
        ...validPayload,
        guestAccess: false,
      };

      const instance = plainToInstance(ModelListItemResDto, payload);

      expect(instance.guestAccess).toBe(false);
      expect(typeof instance.guestAccess).toBe('boolean');
    });

    it('should preserve string properties', () => {
      const instance = plainToInstance(ModelListItemResDto, validPayload);

      expect(typeof instance.id).toBe('string');
      expect(typeof instance.name).toBe('string');
      expect(typeof instance.shortName).toBe('string');
      expect(typeof instance.value).toBe('string');
      expect(typeof instance.developer.name).toBe('string');
      expect(typeof instance.developer.imageUrl).toBe('string');
    });

    it('should include only essential fields compared to ModelResDto', () => {
      const fullPayload = {
        id: '550e8400-e29b-41d4-a716-446655440001',
        name: 'GPT-4',
        shortName: 'gpt-4',
        value: 'gpt-4-turbo',
        guestAccess: true,
        developer: {
          name: 'OpenAI',
          imageUrl: 'https://openai.com/logo.png',
        },
      };

      const instance = plainToInstance(ModelListItemResDto, fullPayload);

      expect(instance).not.toHaveProperty('link');
      expect(instance).not.toHaveProperty('price');
      expect(instance).not.toHaveProperty('metadata');
      expect(instance).not.toHaveProperty('createdAt');
      expect(instance).not.toHaveProperty('updatedAt');
    });

    it('should handle partial payload', () => {
      const payload = {
        id: '550e8400-e29b-41d4-a716-446655440001',
        name: 'GPT-4',
      };

      const instance = plainToInstance(ModelListItemResDto, payload);

      expect(instance.id).toBe('550e8400-e29b-41d4-a716-446655440001');
      expect(instance.name).toBe('GPT-4');
      expect(instance.shortName).toBeUndefined();
      expect(instance.value).toBeUndefined();
    });

    it('should handle partial developer object', () => {
      const payload = {
        ...validPayload,
        developer: {
          name: 'OpenAI',
        },
      };

      const instance = plainToInstance(ModelListItemResDto, payload);

      expect(instance.developer.name).toBe('OpenAI');
      expect(instance.developer.imageUrl).toBeUndefined();
    });
  });
});
