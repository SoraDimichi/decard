import { CryptoService } from './crypto.service';
import { Injectable } from '@nestjs/common';
import {
  CreatePayinDto,
  CreatePayinResponseDto,
} from './dto/create-payin-simple.dto';
import { ConfigService } from '@nestjs/config';
import { plainToInstance } from 'class-transformer';
import { validate } from 'class-validator';
import { DEFAULT_USER } from 'src/seed';
import {
  CreatePayoutDto,
  CreatePayoutResponseDto,
} from './dto/create-payout-papara.dto';
import {
  ConfirmPayoutDto,
  ConfirmPayoutResponseDto,
} from './dto/confirm-payout.dto';
import { TransactionsModel } from './transactions.model';

@Injectable()
export class PaparaService {
  private readonly baseUrl: string = 'https://decard.com';
  private readonly timeout = 30000;
  private readonly shopKey: string;
  private readonly currency = 'TRY';

  constructor(
    private readonly crypto: CryptoService,
    private config: ConfigService,
    private transactions: TransactionsModel,
  ) {
    this.shopKey = this.config.get<string>('SHOP_KEY') || '';
  }

  private getSignedHeaders<T extends Record<string, unknown>>(
    payload: T,
  ): Record<string, string> {
    return {
      'Content-Type': 'application/json',
      'Api-sign': this.crypto.getApiSign(payload),
    };
  }

  private async makeApiRequest<
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

    const response = await this.makeApiRequest(
      '/rest/paymentgate/simple/',
      preparedPayload,
      CreatePayinResponseDto,
    );

    await this.transactions.create({
      type: 'PAYIN',
      amount: payload.amount,
      orderToken: response.order_token,
      userId: DEFAULT_USER.id,
    });
  }

  async confirmPayout(payload: ConfirmPayoutDto) {
    const preparedPayload = {
      ...payload,
      shop_key: this.shopKey,
    };

    const response = await this.makeApiRequest(
      '/rest/payoutgate/confirm/',
      preparedPayload,
      ConfirmPayoutResponseDto,
      'PUT',
    );

    const transaction = await this.transactions.find(response.order_token);

    if (transaction) {
      await this.transactions.update({
        id: transaction.id,
        status: response.status,
      });
    }
  }

  private async checkUserBalance(userId: number, amount: number) {
    const userBalance = await this.transactions.getUserBalance(userId);

    if (userBalance < amount) {
      throw new Error(
        `Insufficient funds. Available balance: ${userBalance}, Requested amount: ${amount}`,
      );
    }
  }

  async createPaparaPayout(payload: CreatePayoutDto) {
    await this.checkUserBalance(DEFAULT_USER.id, payload.amount);

    const initPayload = {
      ...payload,
      currency: this.currency,
      user_id: DEFAULT_USER.id,
      recipient_full_name: `${DEFAULT_USER.first_name} ${DEFAULT_USER.last_name}`,
      shop_key: this.shopKey,
    };

    const response = await this.makeApiRequest(
      '/rest/payoutgate/papara/',
      initPayload,
      CreatePayoutResponseDto,
    );

    await this.transactions.create({
      type: 'PAYOUT',
      amount: payload.amount,
      number: payload.number,
      orderToken: response.order_token,
      userId: DEFAULT_USER.id,
    });

    return await this.confirmPayout({
      order_token: response.order_token,
      shop_key: this.shopKey,
    });
  }
}
