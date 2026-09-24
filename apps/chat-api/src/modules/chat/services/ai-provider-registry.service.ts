import { Inject, Injectable, NotFoundException } from '@nestjs/common';
import { AI_PROVIDERS, type AIProvider } from '../interfaces';

@Injectable()
export class AIProviderRegistry {
  private readonly providersMap: Map<string, AIProvider>;

  constructor(
    @Inject(AI_PROVIDERS)
    providers: AIProvider[],
  ) {
    this.providersMap = new Map(
      providers.map((provider) => [provider.providerName, provider]),
    );
  }

  getProvider(providerName: string): AIProvider {
    const provider = this.providersMap.get(providerName);

    if (!provider)
      throw new NotFoundException(
        `AI provider '${providerName}' is not available`,
      );

    return provider;
  }

  getAvailableProviders(): string[] {
    return Array.from(this.providersMap.keys());
  }
}
