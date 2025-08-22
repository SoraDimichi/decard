import { Module } from '@nestjs/common';
import { PaparaController } from './papara.controller';
import { WebhookController } from './webhook.controller';
import { WebhookService } from './webhook.service';
import { CryptoService } from './crypto.service';
import { PrismaService } from '../prisma.service';
import { TransactionsRepository } from './transactions.repository';
import { PaparaPayinService } from './papara-payin.service';
import { PaparaPayoutService } from './papara-payout.service';

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
export class PaparaModule {}
