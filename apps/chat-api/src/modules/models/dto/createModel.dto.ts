import {
  IsBoolean,
  IsIn,
  IsNotEmpty,
  IsNumber,
  IsOptional,
  IsPositive,
  IsString,
  IsUrl,
  IsUUID,
  MaxLength,
  Min,
  ValidateIf,
  ValidateNested,
} from 'class-validator';
import { Transform, Type } from 'class-transformer';
import { ApiProperty, ApiPropertyOptional } from '@nestjs/swagger';
import { ReasoningLevelRequired } from '../validators';

export class CreateModelDeveloperDto {
  @ApiProperty({
    description: 'Developer name',
    maxLength: 100,
    example: 'OpenAI',
  })
  @IsNotEmpty()
  @IsString()
  @MaxLength(100)
  name: string;

  @ApiProperty({
    description: 'Developer website URL',
    example: 'https://openai.com',
  })
  @IsNotEmpty()
  @IsUrl()
  link: string;

  @ApiProperty({
    description: 'Developer image URL',
    example: 'https://example.com/openai-logo.png',
  })
  @IsNotEmpty()
  @IsUrl()
  imageUrl: string;
}

export class CreateModelPriceDto {
  @ApiProperty({
    description: 'Input token price',
    example: 0.03,
  })
  @IsNumber()
  @IsPositive()
  input: number;

  @ApiProperty({
    description: 'Output token price',
    example: 0.06,
  })
  @IsNumber()
  @IsPositive()
  output: number;
}

export class CreateModelMetadataDto {
  @ApiProperty({
    description: 'Context window size',
    minimum: 1,
    example: 128000,
  })
  @IsNumber()
  @Min(1)
  contextWindow: number;

  @ApiProperty({
    description: 'Maximum output tokens',
    minimum: 1,
    example: 16384,
  })
  @IsNumber()
  @Min(1)
  maxOutputTokens: number;

  @ApiProperty({
    description: 'Knowledge cutoff date',
    example: 'Oct 2023',
  })
  @IsNotEmpty()
  @IsString()
  knowledgeCutoff: string;
}

export class CreateModelReqDto {
  @ApiProperty({
    description: 'Model full name',
    maxLength: 100,
    example: 'GPT-4 Omni',
  })
  @IsNotEmpty()
  @IsString()
  @MaxLength(100)
  name: string;

  @ApiProperty({
    description: 'Model short name',
    maxLength: 20,
    example: 'GPT-4o',
  })
  @IsNotEmpty()
  @IsString()
  @MaxLength(20)
  shortName: string;

  @ApiProperty({
    description: 'Model value/identifier',
    maxLength: 100,
    example: 'gpt-4o',
  })
  @IsNotEmpty()
  @IsString()
  @MaxLength(100)
  value: string;

  @ApiProperty({
    description: 'Model documentation URL',
    example: 'https://platform.openai.com/docs/models/gpt-4o',
  })
  @IsNotEmpty()
  @IsUrl()
  link: string;

  @ApiPropertyOptional({
    description: 'Allow guest access to this model',
    default: false,
    example: false,
  })
  @IsOptional()
  @IsBoolean()
  guestAccess?: boolean;

  @ApiProperty({
    description: 'Model pricing',
    type: CreateModelPriceDto,
  })
  @ValidateNested()
  @Type(() => CreateModelPriceDto)
  price: CreateModelPriceDto;

  @ApiProperty({
    description: 'Indicates if the model supports temperature parameter',
    example: true,
  })
  @Transform(({ value }) => value === 'true' || value === true)
  @IsBoolean()
  supportsTemperature: boolean;


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

  @ApiProperty({
    description: 'Model metadata',
    type: CreateModelMetadataDto,
  })
  @ValidateNested()
  @Type(() => CreateModelMetadataDto)
  metadata: CreateModelMetadataDto;

  @ApiPropertyOptional({
    description: 'Existing developer ID',
    example: '123e4567-e89b-12d3-a456-426614174000',
  })
  @IsOptional()
  @IsUUID()
  developerId?: string;

  @ApiPropertyOptional({
    description: 'New developer details (if not using existing developer)',
    type: CreateModelDeveloperDto,
  })
  @IsOptional()
  @ValidateNested()
  @Type(() => CreateModelDeveloperDto)
  developer?: CreateModelDeveloperDto;
}

export class CreateModelResDto {
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

  @ApiProperty({ description: 'Supports temperature parameter' })
  supportsTemperature: boolean;

  @ApiProperty({ description: 'Is reasoning model', example: false })
  isReasoning: boolean;

  @ApiProperty({ description: 'Reasoning level', nullable: true })
  @ValidateIf(
    (o) =>
      o.isReasoning === true ||
      (o.reasoningLevel !== undefined && o.reasoningLevel !== null),
  )
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
