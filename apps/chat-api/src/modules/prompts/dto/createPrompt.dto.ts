import {
  IsNotEmpty,
  IsOptional,
  IsString,
  MaxLength,
  IsArray,
  ValidateNested,
  IsEnum,
} from 'class-validator';
import { Type } from 'class-transformer';
import { ApiProperty, ApiPropertyOptional } from '@nestjs/swagger';
import { PromptMessageRole } from '../entities';

export class CreatePromptMessageDto {
  @ApiProperty({
    description: 'Message role',
    enum: PromptMessageRole,
    example: PromptMessageRole.USER,
  })
  @IsEnum(PromptMessageRole, {
    message: `role must be one of: ${Object.values(PromptMessageRole).join(', ')}`,
  })
  role: PromptMessageRole;

  @ApiProperty({
    description: 'Message content',
    example: 'You are a helpful assistant',
  })
  @IsNotEmpty()
  @IsString()
  content: string;
}

export class CreatePromptReqDto {
  @ApiProperty({
    description: 'Prompt name',
    maxLength: 255,
    example: 'My Custom Prompt',
  })
  @IsNotEmpty()
  @IsString()
  @MaxLength(255)
  name: string;

  @ApiProperty({
    description: 'Prompt content/instructions',
    example: 'You are an AI assistant that helps with coding tasks',
  })
  @IsNotEmpty()
  @IsString()
  content: string;

  @ApiPropertyOptional({
    description: 'List of messages in the prompt',
    type: [CreatePromptMessageDto],
  })
  @IsOptional()
  @IsArray()
  @ValidateNested({ each: true })
  @Type(() => CreatePromptMessageDto)
  messages?: CreatePromptMessageDto[];
}

export class CreatePromptResDto {
  @ApiProperty({ description: 'Prompt ID' })
  id: string;

  @ApiProperty({ description: 'Prompt name' })
  name: string;

  @ApiProperty({ description: 'Prompt content' })
  content: string;

  @ApiProperty({ description: 'Prompt messages' })
  messages: { id: string; role: PromptMessageRole; content: string }[];

  @ApiProperty({ description: 'Creation timestamp' })
  createdAt: Date;

  @ApiProperty({ description: 'Last update timestamp' })
  updatedAt: Date;
}
