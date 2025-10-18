import {
  registerDecorator,
  ValidationOptions,
  ValidationArguments,
  ValidatorConstraint,
  ValidatorConstraintInterface,
} from 'class-validator';

@ValidatorConstraint({ name: 'isFutureDate', async: false })
export class IsFutureDateConstraint implements ValidatorConstraintInterface {
  validate(dateString: string, _args: ValidationArguments): boolean {
    try {
      const date = new Date(dateString);
      const now = new Date();

      // Check if date is valid
      if (isNaN(date.getTime())) {
        return false;
      }

      // Check if date is in the future (with 5 minute buffer for processing time)
      const bufferMinutes = 5;
      const bufferTime = new Date(now.getTime() + bufferMinutes * 60000);

      return date > bufferTime;
    } catch {
      return false;
    }
  }

  defaultMessage(_args: ValidationArguments): string {
    return 'Date must be in the future (at least 5 minutes from now)';
  }
}

export function IsFutureDate(validationOptions?: ValidationOptions) {
  return function (object: object, propertyName: string) {
    registerDecorator({
      target: object.constructor,
      propertyName: propertyName,
      options: validationOptions,
      constraints: [],
      validator: IsFutureDateConstraint,
    });
  };
}

@ValidatorConstraint({ name: 'isBusinessDay', async: false })
export class IsBusinessDayConstraint implements ValidatorConstraintInterface {
  validate(dateString: string, _args: ValidationArguments): boolean {
    try {
      const date = new Date(dateString);
      const dayOfWeek = date.getDay();

      // 0 = Sunday, 6 = Saturday
      // Most businesses are closed on Sunday (0) and possibly Saturday (6)
      return dayOfWeek !== 0; // Allow Monday-Saturday, block Sunday
    } catch {
      return false;
    }
  }

  defaultMessage(_args: ValidationArguments): string {
    return 'Reservations are not available on Sundays';
  }
}

export function IsBusinessDay(validationOptions?: ValidationOptions) {
  return function (object: object, propertyName: string) {
    registerDecorator({
      target: object.constructor,
      propertyName: propertyName,
      options: validationOptions,
      constraints: [],
      validator: IsBusinessDayConstraint,
    });
  };
}

@ValidatorConstraint({ name: 'isWithinDays', async: false })
export class IsWithinDaysConstraint implements ValidatorConstraintInterface {
  validate(dateString: string, args: ValidationArguments): boolean {
    try {
      const date = new Date(dateString);
      const now = new Date();
      const maxDays = args.constraints[0] || 90; // Default 90 days

      const maxDate = new Date(now.getTime() + maxDays * 24 * 60 * 60 * 1000);

      return date <= maxDate;
    } catch {
      return false;
    }
  }

  defaultMessage(args: ValidationArguments): string {
    const maxDays = args.constraints[0] || 90;
    return `Reservation date must be within the next ${maxDays} days`;
  }
}

export function IsWithinDays(
  days: number,
  validationOptions?: ValidationOptions,
) {
  return function (object: object, propertyName: string) {
    registerDecorator({
      target: object.constructor,
      propertyName: propertyName,
      options: validationOptions,
      constraints: [days],
      validator: IsWithinDaysConstraint,
    });
  };
}
