import { Global, Module } from '@nestjs/common';
import { AuthModule } from '@auth/auth.module';
import { JwtGuard } from './guards';
import { APP_GUARD } from '@nestjs/core';
import { CacheModule } from '@nestjs/cache-manager';
import { createKeyv } from '@keyv/redis';
import { EnvService } from '@cfg/schema/env.service';
import { AppCacheService } from './services/app-cache.service';

@Global()
@Module({
  imports: [
    AuthModule,
    CacheModule.registerAsync({
      inject: [EnvService],
      useFactory: async (envService: EnvService) => ({
        ttl: envService.cacheTTL,
        store: createKeyv(envService.redisHost),
      }),
    }),
  ],
  providers: [
    JwtGuard,
    {
      provide: APP_GUARD,
      useClass: JwtGuard,
    },
    AppCacheService,
  ],
  exports: [JwtGuard, AppCacheService],
})
export class CommonModule {}
