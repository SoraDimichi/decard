import { CryptoService } from './crypto.service';
import { Injectable } from '@nestjs/common';
import {
  CreatePayinSimpleDto,
  CreatePayinSimpleResponseDto,
} from './dto/create-payin-simple.dto';
import { ConfigService } from '@nestjs/config';
import { plainToInstance } from 'class-transformer';
import { validate } from 'class-validator';
import { PrismaService } from 'src/prisma.service';

const USER_ID = 1234131231231;

@Injectable()
export class PaparaService {
  private readonly baseUrl: string = 'https://decard.com';
  private readonly timeout: number = 30000;
  private readonly shopKey: string;

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

  async createPayin(payload: CreatePayinSimpleDto) {
    const p = {
      ...payload,
      shop_key: this.shopKey,
      order_currency: 'TRY',
      payment_currency: 'TRY',
      payment_method: 'papara',
      success_url: 'https://example.com/success',
      fail_url: 'https://example.com/fail',
      lang: 'en',
      payment_method_details: {
        first_name: 'test',
        last_name: 'test',
        user_id: '1234',
      },
    };

    const url = new URL('/rest/paymentgate/simple/', this.baseUrl);
    const controller = new AbortController();
    const timeoutId = setTimeout(() => controller.abort(), this.timeout);

    const response = await fetch(url.toString(), {
      method: 'POST',
      headers: this.getSignedHeaders(p),
      body: JSON.stringify(payload),
      signal: controller.signal,
    });

    clearTimeout(timeoutId);

    if (!response.ok) {
      throw new Error(`HTTP error! Status: ${response.status}`);
    }

    const data = plainToInstance(
      CreatePayinSimpleResponseDto,
      await response.json(),
    );

    const errors = await validate(data);
    if (errors.length > 0) throw new Error('Invalid API response');

    // this.prisma.ledger.create({
    //   orderToken: data.order_token,
    //   amount: payload.amount,
    //   status: 'pending',
    // });
  }
}
