import { IsBoolean } from 'class-validator';

export class UpdateWebSearchReqDto {
  @IsBoolean()
  isWebSearch: boolean;
}
