import type { Response } from 'express';
import type { SendMessageReqDto } from '../dto';

export interface HandleStreamRequestParams {
  res: Response;
  dto: SendMessageReqDto;
  userId: string;
  provider: string;
  isImageGeneration: boolean;
  isWebSearch: boolean;
  fileKey?: string;
}
