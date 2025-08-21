import {
  Body,
  Controller,
  HttpCode,
  HttpStatus,
  Post,
  Put,
} from '@nestjs/common';
import { CreatePayinDto } from './dto/create-payin-simple.dto';
import { PaparaService } from './papara.service';
import { CreatePayoutDto } from './dto/create-payout-papara.dto';
import { ConfirmPayoutDto } from './dto/confirm-payout.dto';
import { WebhookNotificationDto } from './dto/webhook-notification.dto';
import { PrismaService } from 'src/prisma.service';

@Controller()
export class PaparaController {
  constructor(
    private papara: PaparaService,
    private prisma: PrismaService,
  ) {}

  @Post('try/papara/payin')
  createPayment(@Body() payload: CreatePayinDto) {
    return this.papara.createPayin(payload);
  }

  @Post('try/papara/payout')
  createPaparaPayout(@Body() payload: CreatePayoutDto) {
    return this.papara.createPaparaPayout(payload);
  }

  @Put('try/papara/payout/confirm')
  confirmPayout(@Body() payload: ConfirmPayoutDto) {
    return this.papara.confirmPayout(payload);
  }

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
