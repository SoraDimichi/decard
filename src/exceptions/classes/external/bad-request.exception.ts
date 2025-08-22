import { HttpStatus } from '@nestjs/common';
import { ErrorCode } from '../../constants/error-codes';
import { ExternalException } from '../base/external-exception.base';

export class BadRequestException extends ExternalException {
  constructor(message: string = 'Bad request', details?: Record<string, any>) {
    super(ErrorCode.BAD_REQUEST, message, HttpStatus.BAD_REQUEST, details);
  }
}
