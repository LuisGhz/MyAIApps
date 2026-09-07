import { Module } from '@nestjs/common';
import { PhraseComparisonService } from './services/phrase-comparison.service';
import { PhraseComparisonController } from './phrase-comparison.controller';

@Module({
  controllers: [PhraseComparisonController],
  providers: [PhraseComparisonService],
  exports: [PhraseComparisonService],
})
export class PhraseComparisonModule {}
