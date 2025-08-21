import { ConfigService } from '@nestjs/config';
import { plainToInstance } from 'class-transformer';
import { validate } from 'class-validator';
import { CryptoService } from './crypto.service';

export class PaparaBaseService {
  protected readonly baseUrl: string = 'https://decard.com';
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
        throw new Error(`HTTP error! Status: ${response.status}`);
      }

      const data = plainToInstance(responseType, await response.json());
      const errors = await validate(data);

      if (errors.length > 0) {
        throw new Error('Invalid API response');
      }

      return data;
    } catch (error) {
      throw new Error(`API request failed: ${error.message}`);
    } finally {
      clearTimeout(timeoutId);
    }
  }
}
