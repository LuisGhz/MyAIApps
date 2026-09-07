import { Type, Transform, plainToInstance } from 'class-transformer';
import {
  IsIn,
  IsNotEmpty,
  IsOptional,
  IsString,
  ValidateNested,
} from 'class-validator';

export class OpenAIModelOptionsReqDto {
  @IsString()
  @IsIn(['1024x1024', '1536x1024', '1024x1536'])
  size: '1024x1024' | '1536x1024' | '1024x1536';
  @IsString()
  @IsIn(['low', 'medium', 'high', 'auto'])
  quality: 'low' | 'medium' | 'high' | 'auto';
}

export class OpenAINewImageReqDto {
  @IsString()
  prompt: string;
  @IsIn(['gpt-image-1.5', 'gpt-image-1-mini'])
  model: string;
  @Transform(({ value }) => {
    const parsed = typeof value === 'string' ? JSON.parse(value) : value;
    return plainToInstance(OpenAIModelOptionsReqDto, parsed);
  })
  @ValidateNested()
  options: OpenAIModelOptionsReqDto;
  @IsOptional()
  @IsString()
  lastGeneratedImageKey?: string;
}
