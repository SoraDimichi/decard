import { HttpStatus } from '@nestjs/common';
import { ErrorCode } from '../../constants/error-codes';
import { ExternalException } from '../base/external-exception.base';

export class InsufficientFundsException extends ExternalException {
  constructor(
    message: string = 'Insufficient funds for this operation',
    details?: { available: number; requested: number },
  ) {
    super(
      ErrorCode.INSUFFICIENT_FUNDS,
      message,
      HttpStatus.BAD_REQUEST,
      details,
    );
  }
}
