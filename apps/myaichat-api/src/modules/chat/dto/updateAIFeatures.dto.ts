import { IsBoolean } from 'class-validator';
import { ApiProperty } from '@nestjs/swagger';

export class UpdateAIFeaturesReqDto {
  @ApiProperty({
    description: 'Enable web search for this chat',
    example: false,
  })
  @IsBoolean()
  isWebSearch: boolean;

  @ApiProperty({
    description: 'Enable image generation for this chat',
    example: false,
  })
  @IsBoolean()
  isImageGeneration: boolean;
}
