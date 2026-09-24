import { IsOptional, IsString } from 'class-validator';

export class EnhanceTextReqDto {
  @IsString()
  @IsOptional()
  context?: string;

  @IsString()
  textToEnhance: string;
}
