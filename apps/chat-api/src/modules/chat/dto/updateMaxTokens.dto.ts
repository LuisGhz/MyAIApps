import { IsInt, Max, Min } from 'class-validator';
import { ApiProperty } from '@nestjs/swagger';

export class UpdateMaxTokensReqDto {
  @ApiProperty({
    description: 'Maximum tokens for chat responses',
    minimum: 1,
    maximum: 128000,
    example: 2048,
  })
  @IsInt()
  @Min(1)
  @Max(128000)
  maxTokens: number;
}
