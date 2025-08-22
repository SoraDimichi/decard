import {
  ArgumentsHost,
  Catch,
  ExceptionFilter,
  HttpException,
  HttpStatus,
  Logger,
} from '@nestjs/common';
import { Request, Response } from 'express';
import { InternalException } from '../classes/base/internal-exception.base';
import { ExternalException } from '../classes/base/external-exception.base';
import { ErrorCode, ErrorType } from '../constants/error-codes';

@Catch()
export class AllExceptionsFilter implements ExceptionFilter {
  private readonly logger = new Logger(AllExceptionsFilter.name);

  catch(exception: unknown, host: ArgumentsHost): void {
    const ctx = host.switchToHttp();
    const response = ctx.getResponse<Response>();
    const request = ctx.getRequest<Request>();

    let statusCode = HttpStatus.INTERNAL_SERVER_ERROR;
    let errorResponse = {
      type: ErrorType.INTERNAL,
      code: ErrorCode.UNKNOWN_ERROR,
      message: 'Internal server error',
      timestamp: new Date().toISOString(),
      path: request.url,
    };

    if (exception instanceof ExternalException) {
      const exceptionResponse = exception.getResponse() as Record<string, any>;
      statusCode = exception.getStatus();
      errorResponse = {
        ...errorResponse,
        ...exceptionResponse,
        timestamp: new Date().toISOString(),
        path: request.url,
      };
    } else if (exception instanceof InternalException) {
      statusCode = HttpStatus.INTERNAL_SERVER_ERROR;
    } else if (exception instanceof HttpException) {
      const exceptionResponse = exception.getResponse() as
        | string
        | Record<string, any>;

      statusCode = exception.getStatus();

      if (typeof exceptionResponse === 'string') {
        errorResponse.message = exceptionResponse;
      } else {
        errorResponse = {
          ...errorResponse,
          ...exceptionResponse,
          timestamp: new Date().toISOString(),
          path: request.url,
        };
      }

      this.logger.error(
        `[${statusCode}] ${request.method} ${request.url}`,
        exception instanceof Error ? exception.stack : null,
      );
    } else {
      const error = exception as Error;
      if (
        'code' in error &&
        typeof error.code === 'string' &&
        error.code.startsWith('P2')
      ) {
        this.logger.error(
          `Database error: ${error.code} - ${error.message}`,
          exception instanceof Error ? exception.stack : String(exception),
        );

        errorResponse = {
          ...errorResponse,
          code: ErrorCode.DATABASE_ERROR,
          message: 'Internal server error',
        };
      } else {
        this.logger.error(
          `Unhandled exception: ${request.method} ${request.url}`,
          exception instanceof Error ? exception.stack : String(exception),
        );
      }
    }

    response.status(statusCode).json(errorResponse);
  }
}
