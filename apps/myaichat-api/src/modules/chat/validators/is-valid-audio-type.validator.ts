import { Injectable } from '@nestjs/common';
import {
  registerDecorator,
  ValidationOptions,
  ValidatorConstraint,
  ValidatorConstraintInterface,
} from 'class-validator';
import path from 'node:path';
import { ALLOWED_AUDIO_TYPES, ALLOWED_AUDIO_EXTENSIONS } from '../consts';

@Injectable()
@ValidatorConstraint({ name: 'isValidAudioType', async: false })
export class IsValidAudioTypeConstraint implements ValidatorConstraintInterface {
  validate(file: Express.Multer.File): boolean {
    if (!file) return true;

    const mimeType = file.mimetype;
    const extension = path.extname(file.originalname).toLowerCase();

    const isValidMimeType = ALLOWED_AUDIO_TYPES.includes(mimeType as any);
    const isValidExtension = ALLOWED_AUDIO_EXTENSIONS.includes(
      extension as any,
    );

    return isValidMimeType && isValidExtension;
  }

  defaultMessage(): string {
    return `Invalid audio file type. Allowed types: ${ALLOWED_AUDIO_EXTENSIONS.join(', ')}`;
  }
}

export function IsValidAudioType(validationOptions?: ValidationOptions) {
  return function (object: object, propertyName: string) {
    registerDecorator({
      target: object.constructor,
      propertyName,
      options: validationOptions,
      constraints: [],
      validator: IsValidAudioTypeConstraint,
    });
  };
}
