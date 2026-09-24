import { Module } from '@nestjs/common';
import { EnhanceService } from './services/enhance.service';
import { EnhanceController } from './enhance.controller';

@Module({
  controllers: [EnhanceController],
  providers: [EnhanceService],
  exports: [EnhanceService],
})
export class EnglishEnhancerModule {}
