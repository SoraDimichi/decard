import { Module } from '@nestjs/common';
import { PaparaController } from './papara.controller';
import { WebhookController } from './webhook.controller';
import { PaparaService } from './papara.service';
import { CryptoService } from './crypto.service';
import { PrismaService } from '../prisma.service';

@Module({
  imports: [],
  controllers: [PaparaController, WebhookController],
  providers: [PaparaService, CryptoService, PrismaService],
  exports: [PaparaService],
})
export class PaparaModule {}
