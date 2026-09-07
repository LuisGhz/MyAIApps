import { ConfigService } from '@nestjs/config';
import { EnvService } from './env.service';
import type { EnvConfig } from './env.schema';

describe('EnvService', () => {
  let service: EnvService;
  let configService: { get: jest.Mock };

  beforeEach(() => {
    configService = {
      get: jest.fn(),
    };
    service = new EnvService(
      configService as unknown as ConfigService<EnvConfig, true>,
    );
  });

  afterEach(() => {
    jest.clearAllMocks();
  });

  it.each([
    ['nodeEnv', 'NODE_ENV', 'test'],
    ['frontendUrl', 'FRONTEND_URL', 'http://localhost:4200'],
    ['port', 'PORT', 3000],
    ['openaiApiKey', 'OPENAI_API_KEY', 'test-key'],
    ['dbHost', 'DB_HOST', 'localhost'],
    ['dbPort', 'DB_PORT', 5432],
    ['dbUsername', 'DB_USERNAME', 'postgres'],
    ['dbPassword', 'DB_PASSWORD', 'postgres'],
    ['dbName', 'DB_NAME', 'myaienglishapi'],
    ['auth0Domain', 'AUTH0_DOMAIN', 'tenant.auth0.com'],
    ['auth0Audience', 'AUTH0_AUDIENCE', 'https://api.example.com'],
  ])('reads %s from %s', (getter, key, value) => {
    configService.get.mockReturnValueOnce(value);

    expect((service as Record<string, string | number>)[getter]).toBe(value);
    expect(configService.get).toHaveBeenCalledWith(key, { infer: true });
  });
});