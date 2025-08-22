import { ErrorCode } from '../../constants/error-codes';
import { InternalException } from '../base/internal-exception.base';

export class ApiErrorException extends InternalException {
  constructor(
    message: string = 'API request failed',
    cause: Error | unknown = new Error('Unknown API error'),
  ) {
    super(ErrorCode.API_ERROR, message, cause);
  }
}
