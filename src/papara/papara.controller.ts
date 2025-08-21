import { Body, Controller, Post } from '@nestjs/common';
import { CreatePayinDto } from './dto/create-payin-simple.dto';
import { CreatePayoutDto } from './dto/create-payout-papara.dto';
import { PaparaPayinService } from './papara-payin.service';
import { PaparaPayoutService } from './papara-payout.service';

@Controller()
export class PaparaController {
  constructor(
    private paparaPayin: PaparaPayinService,
    private paparaPayout: PaparaPayoutService,
  ) {}

  @Post('/payin')
  createPayment(@Body() payload: CreatePayinDto) {
    return this.paparaPayin.createPayin(payload);
  }

  @Post('/payout')
  createPaparaPayout(@Body() payload: CreatePayoutDto) {
    return this.paparaPayout.createPaparaPayout(payload);
  }
}
