import { ValidationPipe, ValidationError } from '@nestjs/common';
import { BadRequestException } from '../exceptions/classes/external/bad-request.exception';

export class CustomValidationPipe extends ValidationPipe {
  constructor() {
    super({
      whitelist: true,
      transform: true,
      forbidNonWhitelisted: true,
      exceptionFactory: (validationErrors: ValidationError[]) => {
        const formattedErrors = this.formatErrors(validationErrors);
        return new BadRequestException('Validation failed', {
          validationErrors: formattedErrors,
        });
      },
    });
  }

  private formatErrors(
    validationErrors: ValidationError[],
    parentPath: string = '',
  ): Record<string, string[]> {
    return validationErrors.reduce(
      (acc, error) => {
        const property = parentPath
          ? `${parentPath}.${error.property}`
          : error.property;

        if (error.constraints) {
          acc[property] = Object.values(error.constraints);
        }

        if (error.children && error.children.length > 0) {
          const nestedErrors = this.formatErrors(error.children, property);
          Object.assign(acc, nestedErrors);
        }

        return acc;
      },
      {} as Record<string, string[]>,
    );
  }
}
