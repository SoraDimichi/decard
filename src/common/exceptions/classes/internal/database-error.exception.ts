import { ErrorCode } from '../../constants/error-codes';
import { InternalException } from '../base/internal-exception.base';

export class DatabaseErrorException extends InternalException {
  constructor(
    message: string = 'Database operation failed',
    cause: Error | unknown = new Error('Unknown database error'),
  ) {
    super(ErrorCode.DATABASE_ERROR, message, cause);
  }
}
