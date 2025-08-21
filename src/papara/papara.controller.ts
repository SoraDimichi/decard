import { Body, Controller, Post, Put } from '@nestjs/common';
import { CreatePayinDto } from './dto/create-payin-simple.dto';
import { PaparaService } from './papara.service';
import { CreatePayoutDto } from './dto/create-payout-papara.dto';
import { ConfirmPayoutDto } from './dto/confirm-payout.dto';

@Controller()
export class PaparaController {
  constructor(private papara: PaparaService) {}

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
}
