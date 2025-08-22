import { HttpException, HttpStatus } from '@nestjs/common';
import { ErrorCode, ErrorType } from '../../constants/error-codes';

export class ExternalException extends HttpException {
  constructor(
    public readonly code: ErrorCode,
    public readonly message: string,
    public readonly statusCode: HttpStatus = HttpStatus.BAD_REQUEST,
    public readonly details?: Record<string, any>,
  ) {
    super(
      {
        type: ErrorType.EXTERNAL,
        code,
        message,
        details,
      },
      statusCode,
    );
  }
}
