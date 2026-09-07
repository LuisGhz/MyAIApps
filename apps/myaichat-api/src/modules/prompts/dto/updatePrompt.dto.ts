import {
  IsOptional,
  IsString,
  MaxLength,
  IsArray,
  ValidateNested,
  IsEnum,
  IsUUID,
} from 'class-validator';
import { Type } from 'class-transformer';
import { ApiPropertyOptional, ApiProperty } from '@nestjs/swagger';
import { PromptMessageRole } from '../entities';

export class UpdatePromptMessageDto {
  @ApiPropertyOptional({
    description: 'Message ID (for updating existing message)',
    example: '123e4567-e89b-12d3-a456-426614174000',
  })
  @IsOptional()
  @IsUUID()
  id?: string;

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
  @IsString()
  content: string;
}

export class UpdatePromptReqDto {
  @ApiPropertyOptional({
    description: 'Updated prompt name',
    maxLength: 255,
    example: 'My Updated Prompt',
  })
  @IsOptional()
  @IsString()
  @MaxLength(255)
  name?: string;

  @ApiPropertyOptional({
    description: 'Updated prompt content',
    example: 'You are an AI assistant that helps with coding tasks',
  })
  @IsOptional()
  @IsString()
  content?: string;

  @ApiPropertyOptional({
    description: 'Updated list of messages',
    type: [UpdatePromptMessageDto],
  })
  @IsOptional()
  @IsArray()
  @ValidateNested({ each: true })
  @Type(() => UpdatePromptMessageDto)
  messages?: UpdatePromptMessageDto[];
}

export class UpdatePromptResDto {
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
