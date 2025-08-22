import { ErrorCode } from '../../constants/error-codes';
import { InternalException } from '../base/internal-exception.base';

export class InternalValidationErrorException extends InternalException {
  constructor(
    message: string = 'Internal validation failed',
    validationErrors: Record<string, string[]>,
  ) {
    super(ErrorCode.VALIDATION_ERROR, message, { validationErrors });
  }
}
