import { HttpException, HttpStatus, Logger } from '@nestjs/common';
import { ErrorCode, ErrorType } from '../../constants/error-codes';

export class InternalException extends HttpException {
  protected readonly logger = new Logger(InternalException.name);

  constructor(
    public readonly code: ErrorCode,
    public readonly message: string,
    public readonly cause: Error | unknown = new Error('Unknown cause'),
  ) {
    super(
      {
        type: ErrorType.INTERNAL,
        code,
        message: 'Internal server error',
      },
      HttpStatus.INTERNAL_SERVER_ERROR,
    );

    this.logError();
  }

  private logError(): void {
    this.logger.error(
      `[${this.code}] ${this.message}`,
      this.cause instanceof Error ? this.cause.stack : String(this.cause),
    );
  }
}
