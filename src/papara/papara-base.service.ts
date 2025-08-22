import { ConfigService } from '@nestjs/config';
import { plainToInstance } from 'class-transformer';
import { validate } from 'class-validator';
import { ApiErrorException } from '../common/exceptions/classes/internal/api-error.exception';
import { InternalValidationErrorException } from '../common/exceptions/classes/internal/validation-error.exception';
import { CryptoService } from './crypto.service';

export class PaparaBaseService {
  protected readonly baseUrl: string = 'https://decard.me';
  protected readonly timeout = 30000;
  protected readonly shopKey: string;
  protected readonly currency = 'TRY';

  constructor(
    protected readonly crypto: CryptoService,
    protected config: ConfigService,
  ) {
    this.shopKey = this.config.get<string>('SHOP_KEY') || '';
  }

  protected getSignedHeaders<T extends Record<string, unknown>>(
    payload: T,
  ): Record<string, string> {
    return {
      'Content-Type': 'application/json',
      'Api-sign': this.crypto.getApiSign(payload),
    };
  }

  protected async makeApiRequest<
    T extends Record<string, unknown>,
    R extends object,
  >(
    endpoint: string,
    payload: T,
    responseType: new () => R,
    method: 'POST' | 'PUT' = 'POST',
  ): Promise<R> {
    const errors = await validate(payload as object);
    if (errors.length > 0) {
      const validationErrors = errors.reduce(
        (acc, error) => {
          const property = error.property;
          acc[property] = Object.values(error.constraints || {});
          return acc;
        },
        {} as Record<string, string[]>,
      );

      throw new InternalValidationErrorException(
        'Invalid request payload',
        validationErrors,
      );
    }
    const url = new URL(endpoint, this.baseUrl);
    const controller = new AbortController();
    const timeoutId = setTimeout(() => controller.abort(), this.timeout);

    try {
      const response = await fetch(url.toString(), {
        method,
        headers: this.getSignedHeaders(payload),
        body: JSON.stringify(payload),
        signal: controller.signal,
      });

      if (!response.ok) {
        throw new ApiErrorException(`HTTP error! Status: ${response.status}`, {
          status: response.status,
          statusText: response.statusText,
        });
      }

      const data = plainToInstance(responseType, await response.json());
      const errors = await validate(data);

      if (errors.length > 0) {
        const validationErrors = errors.reduce(
          (acc, error) => {
            const property = error.property;
            acc[property] = Object.values(error.constraints || {});
            return acc;
          },
          {} as Record<string, string[]>,
        );

        throw new InternalValidationErrorException(
          'Invalid API response',
          validationErrors,
        );
      }

      return data;
    } finally {
      clearTimeout(timeoutId);
    }
  }
}
