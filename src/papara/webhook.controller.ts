import { Body, Controller, HttpCode, HttpStatus, Post } from '@nestjs/common';
import { WebhookNotificationDto } from './dto/webhook-notification.dto';
import { WebhookService } from './webhook.service';

@Controller(process.env.WEBHOOK_ROUTE || 'webhook')
export class WebhookController {
  constructor(private webhookService: WebhookService) {}

  @Post()
  @HttpCode(HttpStatus.OK)
  async handleTransactionStatusWebhook(
    @Body() notification: WebhookNotificationDto,
  ) {
    return this.webhookService.handleTransactionStatusUpdate(notification);
  }
}
