import { IsNotEmpty, IsString, MaxLength } from 'class-validator';
import { ApiProperty } from '@nestjs/swagger';

export class RenameChatReqDto {
  @ApiProperty({
    description: 'New chat title',
    maxLength: 255,
    example: 'My AI Conversation',
  })
  @IsString()
  @IsNotEmpty()
  @MaxLength(255)
  title: string;
}
