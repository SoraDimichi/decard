import { Module, MiddlewareConsumer, RequestMethod } from '@nestjs/common';
import { ConfigService } from '@nestjs/config';
import { PaparaController } from './papara.controller';
import { WebhookController } from './webhook.controller';
import { WebhookService } from './webhook.service';
import { CryptoService } from './crypto.service';
import { PrismaService } from '../prisma.service';
import { TransactionsRepository } from './transactions.repository';
import { PaparaPayinService } from './papara-payin.service';
import { PaparaPayoutService } from './papara-payout.service';
import { IpWhitelistMiddleware } from '../common/middleware/ip-whitelist.middleware';

@Module({
  imports: [],
  controllers: [PaparaController, WebhookController],
  providers: [
    PaparaPayinService,
    PaparaPayoutService,
    WebhookService,
    CryptoService,
    PrismaService,
    TransactionsRepository,
  ],
  exports: [PaparaPayinService, PaparaPayoutService],
})
export class PaparaModule {
  constructor(private configService: ConfigService) {}

  configure(consumer: MiddlewareConsumer) {
    const webhookRoute = this.configService.get<string>(
      'WEBHOOK_ROUTE',
      'webhook',
    );

    consumer
      .apply(IpWhitelistMiddleware)
      .forRoutes({ path: webhookRoute, method: RequestMethod.POST });
  }
}
