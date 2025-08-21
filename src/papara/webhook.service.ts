import { Injectable, UnauthorizedException } from '@nestjs/common';
import { WebhookNotificationDto } from './dto/webhook-notification.dto';
import { TransactionsModel } from './transactions.model';
import { CryptoService } from './crypto.service';

@Injectable()
export class WebhookService {
  constructor(
    private transactions: TransactionsModel,
    private readonly crypto: CryptoService,
  ) {}

  async handleTransactionStatusUpdate(notification: WebhookNotificationDto) {
    const isValidSignature = this.crypto.verifySign(notification);
    if (!isValidSignature) {
      throw new UnauthorizedException('Invalid signature');
    }

    await this.transactions.update({
      orderToken: notification.token,
      status: notification.status,
      errorCode: notification.error_code,
      errorMessage: notification.error_message,
    });

    return { success: true };
  }
}
