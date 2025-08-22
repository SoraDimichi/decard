import { Injectable } from '@nestjs/common';
import { WebhookNotificationDto } from './dto/webhook-notification.dto';
import { TransactionsModel } from './transactions.model';
import { CryptoService } from './crypto.service';
import { BadRequestException } from '../exceptions/classes/external/bad-request.exception';

@Injectable()
export class WebhookService {
  constructor(
    private transactions: TransactionsModel,
    private readonly crypto: CryptoService,
  ) {}

  validateSignature(notification: WebhookNotificationDto): void {
    const isValidSignature = this.crypto.verifySign(notification);
    if (!isValidSignature) {
      throw new BadRequestException('Invalid signature');
    }
  }

  async handleTransactionStatusUpdate(notification: WebhookNotificationDto) {
    this.validateSignature(notification);

    await this.transactions.update({
      orderToken: notification.token,
      status: notification.status,
      errorCode: notification.error_code,
      errorMessage: notification.error_message,
    });

    return { success: true };
  }
}
