import { Test, TestingModule } from '@nestjs/testing';
import { CACHE_MANAGER } from '@nestjs/cache-manager';
import { AppCacheService } from './app-cache.service';
import { EnvService } from '@cfg/schema/env.service';

describe('AppCacheService', () => {
  let appCacheServiceInstance: AppCacheService;
  let cacheManagerMock: jest.Mocked<any>;
  let envServiceMock: jest.Mocked<EnvService>;

  beforeEach(async () => {
    cacheManagerMock = {
      get: jest.fn(),
      set: jest.fn(),
      del: jest.fn(),
    };

    envServiceMock = {
      cacheShortTTL: 300,
      cacheLongTTL: 3600,
    } as jest.Mocked<EnvService>;

    const module: TestingModule = await Test.createTestingModule({
      providers: [
        AppCacheService,
        {
          provide: CACHE_MANAGER,
          useValue: cacheManagerMock,
        },
        {
          provide: EnvService,
          useValue: envServiceMock,
        },
      ],
    }).compile();

    appCacheServiceInstance = module.get<AppCacheService>(AppCacheService);
  });

  describe('get', () => {
    it('should retrieve a value from cache by key', async () => {
      const testKey = 'test-key';
      const testValue = { data: 'test-data' };
      cacheManagerMock.get.mockResolvedValue(testValue);

      const result = await appCacheServiceInstance.get(testKey);

      expect(result).toEqual(testValue);
      expect(cacheManagerMock.get).toHaveBeenCalledWith(testKey);
      expect(cacheManagerMock.get).toHaveBeenCalledTimes(1);
    });

    it('should return undefined when key does not exist', async () => {
      const testKey = 'non-existent-key';
      cacheManagerMock.get.mockResolvedValue(undefined);

      const result = await appCacheServiceInstance.get(testKey);

      expect(result).toBeUndefined();
      expect(cacheManagerMock.get).toHaveBeenCalledWith(testKey);
    });

    it('should preserve value type when retrieving from cache', async () => {
      const testKey = 'string-key';
      const testValue = 'string-value';
      cacheManagerMock.get.mockResolvedValue(testValue);

      const result = await appCacheServiceInstance.get<string>(testKey);

      expect(result).toBe(testValue);
      expect(typeof result).toBe('string');
    });
  });

  describe('setShort', () => {
    it('should set a value with short TTL', async () => {
      const testKey = 'short-key';
      const testValue = { data: 'test' };
      cacheManagerMock.set.mockResolvedValue(undefined);

      await appCacheServiceInstance.setShort(testKey, testValue);

      expect(cacheManagerMock.set).toHaveBeenCalledWith(
        testKey,
        testValue,
        envServiceMock.cacheShortTTL,
      );
      expect(cacheManagerMock.set).toHaveBeenCalledTimes(1);
    });

    it('should use cacheShortTTL from envService', async () => {
      const testKey = 'key';
      const testValue = 'value';
      cacheManagerMock.set.mockResolvedValue(undefined);

      await appCacheServiceInstance.setShort(testKey, testValue);

      expect(cacheManagerMock.set).toHaveBeenCalledWith(
        testKey,
        testValue,
        envServiceMock.cacheShortTTL,
      );
    });
  });

  describe('set', () => {
    it('should set a value without TTL when ttl is not provided', async () => {
      const testKey = 'key-without-ttl';
      const testValue = { data: 'test' };
      cacheManagerMock.set.mockResolvedValue(undefined);

      await appCacheServiceInstance.set(testKey, testValue);

      expect(cacheManagerMock.set).toHaveBeenCalledWith(testKey, testValue);
      expect(cacheManagerMock.set).toHaveBeenCalledTimes(1);
    });

    it('should set a value with custom TTL when provided', async () => {
      const testKey = 'key-with-ttl';
      const testValue = 'value';
      const customTTL = 1200;
      cacheManagerMock.set.mockResolvedValue(undefined);

      await appCacheServiceInstance.set(testKey, testValue, customTTL);

      expect(cacheManagerMock.set).toHaveBeenCalledWith(
        testKey,
        testValue,
        customTTL,
      );
      expect(cacheManagerMock.set).toHaveBeenCalledTimes(1);
    });

    it('should not call cacheManager.set twice when custom TTL is provided', async () => {
      const testKey = 'key';
      const testValue = 'value';
      const customTTL = 500;
      cacheManagerMock.set.mockResolvedValue(undefined);

      await appCacheServiceInstance.set(testKey, testValue, customTTL);

      expect(cacheManagerMock.set).toHaveBeenCalledTimes(1);
    });
  });

  describe('setLong', () => {
    it('should set a value with long TTL', async () => {
      const testKey = 'long-key';
      const testValue = { persistent: 'data' };
      cacheManagerMock.set.mockResolvedValue(undefined);

      await appCacheServiceInstance.setLong(testKey, testValue);

      expect(cacheManagerMock.set).toHaveBeenCalledWith(
        testKey,
        testValue,
        envServiceMock.cacheLongTTL,
      );
      expect(cacheManagerMock.set).toHaveBeenCalledTimes(1);
    });

    it('should use cacheLongTTL from envService', async () => {
      const testKey = 'key';
      const testValue = 'value';
      cacheManagerMock.set.mockResolvedValue(undefined);

      await appCacheServiceInstance.setLong(testKey, testValue);

      expect(cacheManagerMock.set).toHaveBeenCalledWith(
        testKey,
        testValue,
        envServiceMock.cacheLongTTL,
      );
    });
  });

  describe('del', () => {
    it('should delete a value from cache by key', async () => {
      const testKey = 'key-to-delete';
      cacheManagerMock.del.mockResolvedValue(undefined);

      await appCacheServiceInstance.del(testKey);

      expect(cacheManagerMock.del).toHaveBeenCalledWith(testKey);
      expect(cacheManagerMock.del).toHaveBeenCalledTimes(1);
    });

    it('should handle deletion of non-existent keys', async () => {
      const testKey = 'non-existent-key';
      cacheManagerMock.del.mockResolvedValue(undefined);

      await expect(
        appCacheServiceInstance.del(testKey),
      ).resolves.toBeUndefined();

      expect(cacheManagerMock.del).toHaveBeenCalledWith(testKey);
    });
  });
});
