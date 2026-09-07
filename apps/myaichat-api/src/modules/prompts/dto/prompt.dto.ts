import { ApiProperty } from '@nestjs/swagger';
import { PromptMessageRole } from '../entities';

export class PromptMessageResDto {
  @ApiProperty({ description: 'Message ID' })
  id: string;

  @ApiProperty({
    description: 'Message role',
    enum: PromptMessageRole,
  })
  role: PromptMessageRole;

  @ApiProperty({ description: 'Message content' })
  content: string;

  @ApiProperty({ description: 'Creation timestamp' })
  createdAt: Date;

  @ApiProperty({ description: 'Last update timestamp' })
  updatedAt: Date;
}

export class PromptResDto {
  @ApiProperty({ description: 'Prompt ID' })
  id: string;

  @ApiProperty({ description: 'Prompt name' })
  name: string;

  @ApiProperty({ description: 'Prompt content' })
  content: string;

  @ApiProperty({ description: 'Prompt messages', type: [PromptMessageResDto] })
  messages: PromptMessageResDto[];

  @ApiProperty({ description: 'Creation timestamp' })
  createdAt: Date;

  @ApiProperty({ description: 'Last update timestamp' })
  updatedAt: Date;
}

export class PromptListItemResDto {
  @ApiProperty({ description: 'Prompt ID' })
  id: string;

  @ApiProperty({ description: 'Prompt name' })
  name: string;

  @ApiProperty({ description: 'Prompt content' })
  content: string;

  @ApiProperty({ description: 'Number of messages' })
  messageCount: number;

  @ApiProperty({ description: 'Creation timestamp' })
  createdAt: Date;

  @ApiProperty({ description: 'Last update timestamp' })
  updatedAt: Date;
}

export class PromptListItemSummaryResDto {
  @ApiProperty({ description: 'Prompt ID' })
  id: string;

  @ApiProperty({ description: 'Prompt name' })
  name: string;
}
