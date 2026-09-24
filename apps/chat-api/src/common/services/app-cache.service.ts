import { EnvService } from '@cfg/schema/env.service';
import { Cache, CACHE_MANAGER } from '@nestjs/cache-manager';
import { Inject, Injectable } from '@nestjs/common';

@Injectable()
export class AppCacheService {
  constructor(
    @Inject(CACHE_MANAGER) private readonly cacheManager: Cache,
    private readonly envService: EnvService,
  ) {}

  async get<T>(key: string): Promise<T | undefined> {
    return this.cacheManager.get<T>(key);
  }

  async setShort<T>(key: string, value: T): Promise<void> {
    await this.cacheManager.set<T>(key, value, this.envService.cacheShortTTL);
  }

  async set<T>(key: string, value: T, ttl?: number): Promise<void> {
    if (ttl) {
      await this.cacheManager.set<T>(key, value, ttl);
      return;
    }
    await this.cacheManager.set<T>(key, value);
  }

  async setLong<T>(key: string, value: T): Promise<void> {
    await this.cacheManager.set<T>(key, value, this.envService.cacheLongTTL);
  }

  async del(key: string): Promise<void> {
    await this.cacheManager.del(key);
  }
}
