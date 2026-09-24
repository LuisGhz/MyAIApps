import { Test, TestingModule } from '@nestjs/testing';
import { NotFoundException } from '@nestjs/common';
import { AIProviderRegistry } from './ai-provider-registry.service';
import { AI_PROVIDERS, type AIProvider } from '../interfaces';

const mockAIProvider1: AIProvider = {
  providerName: 'openai',
  streamResponse: jest.fn(),
  generateTitle: jest.fn(),
};

const mockAIProvider2: AIProvider = {
  providerName: 'google',
  streamResponse: jest.fn(),
  generateTitle: jest.fn(),
};

describe('AIProviderRegistry', () => {
  let service: AIProviderRegistry;
  let providersArray: AIProvider[];

  beforeEach(async () => {
    jest.clearAllMocks();

    providersArray = [mockAIProvider1, mockAIProvider2];

    const module: TestingModule = await Test.createTestingModule({
      providers: [
        AIProviderRegistry,
        {
          provide: AI_PROVIDERS,
          useValue: providersArray,
        },
      ],
    }).compile();

    service = module.get<AIProviderRegistry>(AIProviderRegistry);
  });

  describe('getProvider', () => {
    it('should return the provider when it exists', () => {
      const provider = service.getProvider('openai');

      expect(provider).toBe(mockAIProvider1);
      expect(provider.providerName).toBe('openai');
    });

    it('should return a different provider when requested', () => {
      const provider = service.getProvider('google');

      expect(provider).toBe(mockAIProvider2);
      expect(provider.providerName).toBe('google');
    });

    it('should throw NotFoundException when provider does not exist', () => {
      expect(() => service.getProvider('nonexistent')).toThrow(
        NotFoundException,
      );
      expect(() => service.getProvider('nonexistent')).toThrow(
        "AI provider 'nonexistent' is not available",
      );
    });

    it('should be case-sensitive when looking up providers', () => {
      expect(() => service.getProvider('OpenAI')).toThrow(NotFoundException);
    });
  });

  describe('getAvailableProviders', () => {
    it('should return all available provider names', () => {
      const providers = service.getAvailableProviders();

      expect(providers).toHaveLength(2);
      expect(providers).toContain('openai');
      expect(providers).toContain('google');
    });

    it('should return an empty array when no providers are registered', async () => {
      const emptyModule: TestingModule = await Test.createTestingModule({
        providers: [
          AIProviderRegistry,
          {
            provide: AI_PROVIDERS,
            useValue: [],
          },
        ],
      }).compile();

      const emptyService =
        emptyModule.get<AIProviderRegistry>(AIProviderRegistry);
      const providers = emptyService.getAvailableProviders();

      expect(providers).toEqual([]);
    });

    it('should return consistent order of provider names', () => {
      const providers1 = service.getAvailableProviders();
      const providers2 = service.getAvailableProviders();

      expect(providers1).toEqual(providers2);
    });
  });
});
