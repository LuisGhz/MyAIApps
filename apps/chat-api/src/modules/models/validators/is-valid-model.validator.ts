import { Injectable } from '@nestjs/common';
import {
  registerDecorator,
  ValidationOptions,
  ValidatorConstraint,
  ValidatorConstraintInterface,
} from 'class-validator';
import { ModelsService } from '../services';

@Injectable()
@ValidatorConstraint({ name: 'isValidModel', async: true })
export class IsValidModelConstraint implements ValidatorConstraintInterface {
  constructor(private readonly modelsService: ModelsService) {}

  async validate(value: string): Promise<boolean> {
    if (!value || typeof value !== 'string') {
      return false;
    }

    return this.modelsService.existsByValue(value);
  }

  defaultMessage(): string {
    return 'Model "$value" is not a valid model. Please use a registered model value.';
  }
}

export function IsValidModel(validationOptions?: ValidationOptions) {
  return function (object: object, propertyName: string) {
    registerDecorator({
      target: object.constructor,
      propertyName,
      options: validationOptions,
      constraints: [],
      validator: IsValidModelConstraint,
    });
  };
}
