import { Module } from '@nestjs/common';
import { PaparaController } from './papara.controller';
import { WebhookController } from './webhook.controller';
import { PaparaService } from './papara.service';
import { WebhookService } from './webhook.service';
import { CryptoService } from './crypto.service';
import { PrismaService } from '../prisma.service';
import { TransactionsModel } from './transactions.model';

@Module({
  imports: [],
  controllers: [PaparaController, WebhookController],
  providers: [
    PaparaService,
    WebhookService,
    CryptoService,
    PrismaService,
    TransactionsModel,
  ],
  exports: [PaparaService],
})
export class PaparaModule {}
