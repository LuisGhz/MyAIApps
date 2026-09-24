import { ArrayMinSize, IsArray, IsOptional, IsString } from 'class-validator';

export class ComparePhrasesReqDto {
  @IsArray()
  @ArrayMinSize(2)
  @IsString({ each: true })
  inputs: string[];

  @IsOptional()
  @IsString()
  context?: string;
}
