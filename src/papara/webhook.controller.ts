import { Body, Controller, HttpCode, HttpStatus, Post } from '@nestjs/common';
import { WebhookNotificationDto } from './dto/webhook-notification.dto';
import { PrismaService } from '../prisma.service';

@Controller()
export class WebhookController {
  constructor(private prisma: PrismaService) {}

  @Post('webhook/transaction-status')
  @HttpCode(HttpStatus.OK)
  async handleTransactionStatusWebhook(
    @Body() notification: WebhookNotificationDto,
  ) {
    const transaction = await this.prisma.transaction.findUnique({
      where: {
        orderToken: notification.token,
      },
    });

    if (!transaction) {
      return { success: false, message: 'Transaction not found' };
    }

    const status = this.mapStatusFromWebhook(notification.status);

    await this.prisma.transaction.update({
      where: {
        id: transaction.id,
      },
      data: {
        status: status,
        errorCode: notification.error_code || null,
        errorMessage: notification.error_message || null,
      },
    });

    return { success: true };
  }

  private mapStatusFromWebhook(status: string) {
    switch (status.toLowerCase()) {
      case 'completed':
        return 'COMPLETED' as const;
      case 'processing':
        return 'PROCESSING' as const;
      case 'failed':
        return 'FAILED' as const;
      case 'canceled':
        return 'CANCELED' as const;
      default:
        return 'PENDING' as const;
    }
  }
}
