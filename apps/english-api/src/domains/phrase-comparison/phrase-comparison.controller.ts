import { Body, Controller, HttpCode, Post } from '@nestjs/common';
import { PhraseComparisonService } from './services/phrase-comparison.service';
import { ComparePhrasesReqDto } from './dtos/compare-phrases.req.dto';
import { CompareSchema } from 'src/common/utils';

@Controller('api/compare')
export class PhraseComparisonController {
  constructor(private service: PhraseComparisonService) {}

  @Post()
  async compare(
    @Body() body: ComparePhrasesReqDto,
  ): Promise<CompareSchema | null> {
    return this.service.comparePhrases(body);
  }
}
