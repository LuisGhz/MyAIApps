import { Injectable } from '@nestjs/common';
import {
  registerDecorator,
  ValidationOptions,
  ValidatorConstraint,
  ValidatorConstraintInterface,
} from 'class-validator';
import path from 'node:path';
import { ALLOWED_FILE_TYPES, ALLOWED_FILE_EXTENSIONS } from '../consts';

@Injectable()
@ValidatorConstraint({ name: 'isValidFileType', async: false })
export class IsValidFileTypeConstraint implements ValidatorConstraintInterface {
  validate(file: Express.Multer.File): boolean {
    if (!file) return true;

    const mimeType = file.mimetype;
    const extension = path.extname(file.originalname).toLowerCase();

    const isValidMimeType = ALLOWED_FILE_TYPES.includes(mimeType as any);
    const isValidExtension = ALLOWED_FILE_EXTENSIONS.includes(extension as any);

    return isValidMimeType && isValidExtension;
  }

  defaultMessage(): string {
    return `Invalid file type. Allowed types: ${ALLOWED_FILE_EXTENSIONS.join(', ')}`;
  }
}

export function IsValidFileType(validationOptions?: ValidationOptions) {
  return function (object: object, propertyName: string) {
    registerDecorator({
      target: object.constructor,
      propertyName,
      options: validationOptions,
      constraints: [],
      validator: IsValidFileTypeConstraint,
    });
  };
}
