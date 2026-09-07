import { IsNumber, IsOptional, Max, Min } from 'class-validator';
import { Transform } from 'class-transformer';
import { ApiProperty, ApiPropertyOptional } from '@nestjs/swagger';

export class TranscribeAudioReqDto {
  @ApiPropertyOptional({
    description: 'Temperature for transcription',
    minimum: 0,
    maximum: 1,
    default: 0,
    example: 0,
  })
  @IsOptional()
  @Transform(({ value }) => Number.parseFloat(value))
  @IsNumber()
  @Min(0)
  @Max(1)
  temperature?: number = 0;
}

export class TranscribeAudioResDto {
  @ApiProperty({ description: 'Transcribed text' })
  text: string;

  @ApiPropertyOptional({
    description: 'Token usage information',
    type: 'object',
    properties: {
      inputTokens: { type: 'number' },
      outputTokens: { type: 'number' },
      totalTokens: { type: 'number' },
    },
  })
  usage?: {
    inputTokens: number;
    outputTokens: number;
    totalTokens: number;
  };
}
