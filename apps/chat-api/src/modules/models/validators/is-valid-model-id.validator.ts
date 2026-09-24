import { Injectable } from '@nestjs/common';
import {
  registerDecorator,
  ValidationOptions,
  ValidatorConstraint,
  ValidatorConstraintInterface,
} from 'class-validator';
import { ModelsService } from '../services';

@Injectable()
@ValidatorConstraint({ name: 'isValidModelId', async: true })
export class IsValidModelIdConstraint implements ValidatorConstraintInterface {
  constructor(private readonly modelsService: ModelsService) {}

  async validate(value: string): Promise<boolean> {
    if (!value || typeof value !== 'string') return false;
    return this.modelsService.existsById(value);
  }

  defaultMessage(): string {
    return 'Model with id "$value" does not exist.';
  }
}

export function IsValidModelId(validationOptions?: ValidationOptions) {
  return function (object: object, propertyName: string) {
    registerDecorator({
      target: object.constructor,
      propertyName,
      options: validationOptions,
      constraints: [],
      validator: IsValidModelIdConstraint,
    });
  };
}
