import {
  registerDecorator,
  ValidationOptions,
  ValidatorConstraint,
  ValidatorConstraintInterface,
  ValidationArguments,
} from 'class-validator';

@ValidatorConstraint({ name: 'isReasoningLevelRequired', async: false })
export class ReasoningLevelRequiredConstraint implements ValidatorConstraintInterface {
  validate(
    value: string | null | undefined,
    args: ValidationArguments,
  ): boolean {
    const { isReasoning } = args.object as {
      isReasoning?: boolean;
      reasoningLevel?: string | null;
    };

    // If isReasoning is true, reasoningLevel must be provided and non-empty
    if (isReasoning === true) {
      return typeof value === 'string' && value.trim().length > 0;
    }

    // If isReasoning is false or undefined, reasoningLevel can be anything
    return true;
  }

  defaultMessage(args: ValidationArguments): string {
    return 'Reasoning level is required';
  }
}

export function ReasoningLevelRequired(validationOptions?: ValidationOptions) {
  return function (object: object, propertyName: string) {
    registerDecorator({
      target: object.constructor,
      propertyName,
      options: validationOptions,
      constraints: [],
      validator: ReasoningLevelRequiredConstraint,
    });
  };
}
