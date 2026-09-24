import { IsOptional, IsUUID } from 'class-validator';
import { ApiProperty, ApiPropertyOptional } from '@nestjs/swagger';

class MessageDto {
  @ApiProperty({ description: 'Message ID' })
  id: string;

  @ApiProperty({ description: 'Message content' })
  content: string;

  @ApiProperty({ description: 'Message role (user/assistant/system)' })
  role: string;

  @ApiProperty({ description: 'Creation timestamp' })
  createdAt: Date;

  @ApiPropertyOptional({ description: 'Number of input tokens' })
  inputTokens?: number;

  @ApiPropertyOptional({ description: 'Number of output tokens' })
  outputTokens?: number;

  @ApiPropertyOptional({ description: 'Attached file key' })
  file?: string;
}

export class ChatMessagesReqDto {
  @ApiPropertyOptional({
    description: 'Message ID to fetch messages before',
    example: '123e4567-e89b-12d3-a456-426614174000',
  })
  @IsOptional()
  @IsUUID()
  beforeMessageId?: string;
}

export class ChatMessagesResDto {
  @ApiProperty({ description: 'List of messages', type: [MessageDto] })
  messages: MessageDto[];

  @ApiProperty({ description: 'Whether there are more messages' })
  hasMore: boolean;

  @ApiProperty({ description: 'Maximum tokens setting' })
  maxTokens: number;

  @ApiProperty({ description: 'Temperature setting' })
  temperature: number;

  @ApiProperty({ description: 'Web search enabled' })
  isWebSearch: boolean;

  @ApiProperty({ description: 'Image generation enabled' })
  isImageGeneration: boolean;
}
