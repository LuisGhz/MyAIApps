import { IsBoolean } from 'class-validator';

export class UpdateImageGenerationReqDto {
  @IsBoolean()
  isImageGeneration: boolean;
}
