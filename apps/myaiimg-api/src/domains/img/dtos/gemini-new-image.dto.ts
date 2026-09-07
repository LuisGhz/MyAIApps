import { IsIn, IsOptional, IsString, ValidateNested } from 'class-validator';
import { Transform, plainToInstance } from 'class-transformer';

export class GeminiModelOptionsReqDto {
  @IsString()
  @IsIn(['1K', '2K', '4K'])
  size: string;
  @IsString()
  @IsIn([
    '21:9',
    '16:9',
    '4:3',
    '3:2',
    '1:1',
    '9:16',
    '3:4',
    '2:3',
    '5:4',
    '4:5',
  ])
  aspectRatio: string;
}

export class GeminiNewImageReqDto {
  @IsString()
  prompt: string;
  @IsIn(['gemini-2.5-flash-image', 'gemini-3-pro-image-preview'])
  model: string;
  @Transform(({ value }) => {
    const parsed = typeof value === 'string' ? JSON.parse(value) : value;
    return plainToInstance(GeminiModelOptionsReqDto, parsed);
  })
  @ValidateNested()
  options: GeminiModelOptionsReqDto;
  @IsOptional()
  @IsString()
  lastGeneratedImageKey?: string;
}
