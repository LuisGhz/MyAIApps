import { Transform } from 'class-transformer';
import {
  IsBoolean,
  IsInt,
  IsNotEmpty,
  IsNumber,
  IsOptional,
  IsString,
  IsUUID,
  Max,
  Min,
} from 'class-validator';
import { ApiProperty, ApiPropertyOptional } from '@nestjs/swagger';
import { IsValidModelId } from '@mdl/validators';

export class SendMessageReqDto {
  @ApiPropertyOptional({
    description: 'Existing chat ID to continue conversation',
    example: '123e4567-e89b-12d3-a456-426614174000',
  })
  @IsOptional()
  @IsUUID()
  chatId?: string;

  @ApiPropertyOptional({
    description: 'Prompt ID to use for the message',
    example: '123e4567-e89b-12d3-a456-426614174000',
  })
  @IsOptional()
  @IsUUID()
  promptId?: string;

  @ApiProperty({
    description: 'Message content',
    example: 'Hello, how can you help me?',
  })
  @IsNotEmpty()
  @IsString()
  message: string;

  @ApiProperty({
    description: 'AI model ID to use',
    example: '123e4567-e89b-12d3-a456-426614174000',
  })
  @IsUUID()
  @IsValidModelId({
    message: 'Invalid model ID. Please use a registered model ID.',
  })
  modelId: string;

  @ApiProperty({
    description: 'Model developer/provider',
    example: 'openai',
  })
  @IsNotEmpty()
  @IsString()
  modelDeveloper: string;

  @ApiProperty({
    description: 'Maximum tokens for response',
    minimum: 1,
    maximum: 16384,
    example: 2048,
  })
  @Transform(({ value }) => Number.parseInt(value, 10))
  @IsInt()
  @Min(1)
  @Max(16384)
  maxTokens: number;

  @ApiProperty({
    description: 'Temperature for response randomness',
    minimum: 0,
    maximum: 1,
    example: 0.7,
  })
  @Transform(({ value }) => Number(value))
  @IsNumber()
  @Min(0)
  @Max(1)
  temperature: number;

  @ApiProperty({
    description: 'Enable image generation',
    example: false,
  })
  @IsBoolean()
  @Transform(({ value }) => value === 'true' || value === true)
  isImageGeneration: boolean;

  @ApiProperty({
    description: 'Enable web search',
    example: false,
  })
  @IsBoolean()
  @Transform(({ value }) => value === 'true' || value === true)
  isWebSearch: boolean;
}

export class SendMessageResDto {
  @ApiProperty({ description: 'Chat ID' })
  chatId: string;

  @ApiProperty({ description: 'Response message' })
  message: string;

  @ApiProperty({ description: 'Number of input tokens used' })
  inputTokens: number;

  @ApiProperty({ description: 'Number of output tokens used' })
  outputTokens: number;

  @ApiPropertyOptional({ description: 'Generated chat title' })
  title?: string;
}
