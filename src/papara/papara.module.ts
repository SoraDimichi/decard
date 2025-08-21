import { Module } from '@nestjs/common';
import { PaparaController } from './papara.controller';
import { PaparaService } from './papara.service';
import { CryptoService } from './crypto.service';

@Module({
  imports: [],
  controllers: [PaparaController],
  providers: [PaparaService, CryptoService],
  exports: [PaparaService],
})
export class PaparaModule {}
