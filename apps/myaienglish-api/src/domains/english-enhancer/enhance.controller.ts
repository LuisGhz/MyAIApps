import { Body, Controller, Post } from '@nestjs/common';
import { EnhanceService } from './services/enhance.service';
import { EnhanceTextReqDto } from './dtos/enhance-text.req.dto';

@Controller('api/enhance')
export class EnhanceController {
  constructor(private enhanceService: EnhanceService) {}

  @Post()
  async enhance(@Body() body: EnhanceTextReqDto) {
    return this.enhanceService.enhanceText(body);
  }
}
