import { Injectable } from '@nestjs/common';
import { ConfigService } from '@nestjs/config';
import { DEFAULT_USER } from 'src/seed';
import { CryptoService } from './crypto.service';
import {
  CreatePayinDto,
  CreatePayinResponseDto,
} from './dto/create-payin-simple.dto';
import { PaparaBaseService } from './papara-base.service';
import { TransactionsRepository } from './transactions.repository';

@Injectable()
export class PaparaPayinService extends PaparaBaseService {
  constructor(
    protected readonly crypto: CryptoService,
    protected config: ConfigService,
    private transactions: TransactionsRepository,
  ) {
    super(crypto, config);
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
        user_id: DEFAULT_USER.id.toString(),
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

    return response;
  }
}
