import {
  IsBoolean,
  IsNumber,
  IsOptional,
  IsPositive,
  IsString,
  IsUrl,
  IsUUID,
  MaxLength,
  Min,
  ValidateNested,
  ValidateIf,
  IsIn,
} from 'class-validator';
import { Type } from 'class-transformer';
import { ApiPropertyOptional, ApiProperty } from '@nestjs/swagger';
import { ReasoningLevelRequired } from '../validators';

export class UpdateModelDeveloperDto {
  @ApiPropertyOptional({
    description: 'Updated developer name',
    maxLength: 100,
    example: 'OpenAI',
  })
  @IsOptional()
  @IsString()
  @MaxLength(100)
  name?: string;

  @ApiPropertyOptional({
    description: 'Updated developer website URL',
    example: 'https://openai.com',
  })
  @IsOptional()
  @IsUrl()
  link?: string;

  @ApiPropertyOptional({
    description: 'Updated developer image URL',
    example: 'https://example.com/openai-logo.png',
  })
  @IsOptional()
  @IsUrl()
  imageUrl?: string;
}

export class UpdateModelPriceDto {
  @ApiPropertyOptional({
    description: 'Updated input token price',
    example: 0.03,
  })
  @IsOptional()
  @IsNumber()
  @IsPositive()
  input?: number;

  @ApiPropertyOptional({
    description: 'Updated output token price',
    example: 0.06,
  })
  @IsOptional()
  @IsNumber()
  @IsPositive()
  output?: number;
}

export class UpdateModelMetadataDto {
  @ApiPropertyOptional({
    description: 'Updated context window size',
    minimum: 1,
    example: 128000,
  })
  @IsOptional()
  @IsNumber()
  @Min(1)
  contextWindow?: number;

  @ApiPropertyOptional({
    description: 'Updated maximum output tokens',
    minimum: 1,
    example: 16384,
  })
  @IsOptional()
  @IsNumber()
  @Min(1)
  maxOutputTokens?: number;

  @ApiPropertyOptional({
    description: 'Updated knowledge cutoff date',
    example: 'Oct 2023',
  })
  @IsOptional()
  @IsString()
  knowledgeCutoff?: string;
}

export class UpdateModelReqDto {
  @ApiPropertyOptional({
    description: 'Updated model full name',
    maxLength: 100,
    example: 'GPT-4 Omni',
  })
  @IsOptional()
  @IsString()
  @MaxLength(100)
  name?: string;

  @ApiPropertyOptional({
    description: 'Updated model short name',
    maxLength: 20,
    example: 'GPT-4o',
  })
  @IsOptional()
  @IsString()
  @MaxLength(20)
  shortName?: string;

  @ApiPropertyOptional({
    description: 'Updated model value/identifier',
    maxLength: 100,
    example: 'gpt-4o',
  })
  @IsOptional()
  @IsString()
  @MaxLength(100)
  value?: string;

  @ApiPropertyOptional({
    description: 'Updated model documentation URL',
    example: 'https://platform.openai.com/docs/models/gpt-4o',
  })
  @IsOptional()
  @IsUrl()
  link?: string;

  @ApiPropertyOptional({
    description: 'Updated guest access setting',
    example: false,
  })
  @IsOptional()
  @IsBoolean()
  guestAccess?: boolean;

  @ApiPropertyOptional({
    description: 'Updated model pricing',
    type: UpdateModelPriceDto,
  })
  @IsOptional()
  @ValidateNested()
  @Type(() => UpdateModelPriceDto)
  price?: UpdateModelPriceDto;

  @ApiPropertyOptional({
    description: 'Updated model temperature support',
    example: true,
  })
  @IsOptional()
  @IsBoolean()
  supportsTemperature?: boolean;

  @ApiPropertyOptional({
    description: 'Update reasoning capability',
    example: true,
  })
  @IsOptional()
  @IsBoolean()
  isReasoning?: boolean;

  @ApiPropertyOptional({
    description: 'Update reasoning capability level',
    example: 'low',
  })
  @ValidateIf(
    (o) =>
      o.isReasoning === true ||
      (o.reasoningLevel !== undefined && o.reasoningLevel !== null),
  )
  @IsString()
  @IsIn(['minimal', 'low', 'medium', 'high'])
  @ReasoningLevelRequired()
  reasoningLevel?: string | null;

  @ApiPropertyOptional({
    description: 'Updated model metadata',
    type: UpdateModelMetadataDto,
  })
  @IsOptional()
  @ValidateNested()
  @Type(() => UpdateModelMetadataDto)
  metadata?: UpdateModelMetadataDto;

  @ApiPropertyOptional({
    description: 'Updated developer ID',
    example: '123e4567-e89b-12d3-a456-426614174000',
  })
  @IsOptional()
  @IsUUID()
  developerId?: string;
}

export class UpdateModelResDto {
  @ApiProperty({ description: 'Model ID' })
  id: string;

  @ApiProperty({ description: 'Model full name' })
  name: string;

  @ApiProperty({ description: 'Model short name' })
  shortName: string;

  @ApiProperty({ description: 'Model value/identifier' })
  value: string;

  @ApiProperty({ description: 'Model documentation URL' })
  link: string;

  @ApiProperty({ description: 'Guest access enabled' })
  guestAccess: boolean;

  @ApiProperty({
    description: 'Model pricing',
    type: 'object',
    properties: {
      input: { type: 'number' },
      output: { type: 'number' },
    },
  })
  price: {
    input: number;
    output: number;
  };

  @ApiProperty({
    description: 'Indicates if the model supports temperature parameter',
    example: true,
  })
  supportsTemperature: boolean;

  @ApiProperty({
    description: 'Indicates if the model is designed for reasoning tasks',
    example: false,
  })
  isReasoning: boolean;

  @ApiProperty({
    description: 'Reasoning capability level of the model',
    example: 'advanced',
    nullable: true,
  })
  reasoningLevel: string | null;

  @ApiProperty({
    description: 'Model metadata',
    type: 'object',
    properties: {
      contextWindow: { type: 'number' },
      maxOutputTokens: { type: 'number' },
      knowledgeCutoff: { type: 'string' },
    },
  })
  metadata: {
    contextWindow: number;
    maxOutputTokens: number;
    knowledgeCutoff: string;
  };

  @ApiProperty({
    description: 'Developer details',
    type: 'object',
    properties: {
      id: { type: 'string' },
      name: { type: 'string' },
      link: { type: 'string' },
      imageUrl: { type: 'string' },
    },
  })
  developer: {
    id: string;
    name: string;
    link: string;
    imageUrl: string;
  };

  @ApiProperty({ description: 'Creation timestamp' })
  createdAt: Date;

  @ApiProperty({ description: 'Last update timestamp' })
  updatedAt: Date;
}
