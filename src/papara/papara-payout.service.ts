import { Injectable } from '@nestjs/common';
import { ConfigService } from '@nestjs/config';
import { DEFAULT_USER } from 'src/seed';
import { CryptoService } from './crypto.service';
import {
  ConfirmPayoutDto,
  ConfirmPayoutResponseDto,
} from './dto/confirm-payout.dto';
import {
  CreatePayoutDto,
  CreatePayoutResponseDto,
} from './dto/create-payout-papara.dto';
import { PaparaBaseService } from './papara-base.service';
import { TransactionsModel } from './transactions.model';

@Injectable()
export class PaparaPayoutService extends PaparaBaseService {
  constructor(
    protected readonly crypto: CryptoService,
    protected config: ConfigService,
    private transactions: TransactionsModel,
  ) {
    super(crypto, config);
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

    await this.transactions.update({
      orderToken: response.order_token,
      status: response.status,
    });

    return response;
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
