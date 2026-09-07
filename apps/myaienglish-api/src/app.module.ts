import { Module } from '@nestjs/common';
import { APP_GUARD } from '@nestjs/core';
import { ConfigModule } from './config';
import { CommonModule } from './common';
import { JwtAuthGuard } from './common/guards';
import {
  EnglishEnhancerModule,
  UserModule,
  PhraseComparisonModule,
  HealthModule,
  PhrasalVerbsModule,
} from './domains';

@Module({
  imports: [
    ConfigModule,
    CommonModule,
    EnglishEnhancerModule,
    UserModule,
    PhraseComparisonModule,
    HealthModule,
    PhrasalVerbsModule,
  ],
  providers: [
    {
      provide: APP_GUARD,
      useClass: JwtAuthGuard,
    },
  ],
})
export class AppModule {}
