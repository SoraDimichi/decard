import { CryptoService } from './crypto.service';
import { Injectable } from '@nestjs/common';
import {
  CreatePayinDto,
  CreatePayinResponseDto,
} from './dto/create-payin-simple.dto';
import { ConfigService } from '@nestjs/config';
import { plainToInstance } from 'class-transformer';
import { validate } from 'class-validator';
import { PrismaService } from 'src/prisma.service';
import { DEFAULT_USER } from 'src/seed';
import {
  CreatePayoutDto,
  CreatePayoutResponseDto,
} from './dto/create-payout-papara.dto';

@Injectable()
export class PaparaService {
  private readonly baseUrl: string = 'https://decard.com';
  private readonly timeout = 30000;
  private readonly shopKey: string;
  private readonly currency = 'TRY';

  constructor(
    private readonly cryptoService: CryptoService,
    private configService: ConfigService,
    private prisma: PrismaService,
  ) {
    this.shopKey = this.configService.get<string>('SHOP_KEY') || '';
  }

  private getSignedHeaders<T extends Record<string, unknown>>(
    payload: T,
  ): Record<string, string> {
    return {
      'Content-Type': 'application/json',
      'Api-sign': this.cryptoService.getApiSign(payload),
    };
  }

  private async makeApiRequest<
    T extends Record<string, unknown>,
    R extends object,
  >(endpoint: string, payload: T, responseType: new () => R): Promise<R> {
    const url = new URL(endpoint, this.baseUrl);
    const controller = new AbortController();
    const timeoutId = setTimeout(() => controller.abort(), this.timeout);

    try {
      const response = await fetch(url.toString(), {
        method: 'POST',
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

  async createPayin(payload: CreatePayinDto) {
    const preparedPayload = {
      ...payload,
      shop_key: this.shopKey,
      order_currency: this.currency,
      payment_currency: this.currency,
      payment_method: 'papara',
      success_url: 'https://example.com/success',
      fail_url: 'https://example.com/fail',
      lang: 'en',
      payment_method_details: {
        first_name: DEFAULT_USER.first_name,
        last_name: DEFAULT_USER.last_name,
        user_id: DEFAULT_USER.id,
      },
    };
    return this.makeApiRequest(
      '/rest/paymentgate/simple/',
      preparedPayload,
      CreatePayinResponseDto,
    );
  }

  async createPaparaPayout(payload: CreatePayoutDto) {
    const preparedPayload = {
      ...payload,
      currency: this.currency,
      user_id: DEFAULT_USER.id,
      recipient_full_name: `${DEFAULT_USER.first_name} ${DEFAULT_USER.last_name}`,
      shop_key: this.shopKey,
    };
    return this.makeApiRequest(
      '/rest/payoutgate/papara/',
      preparedPayload,
      CreatePayoutResponseDto,
    );
  }
}
