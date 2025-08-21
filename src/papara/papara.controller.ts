import { Body, Controller, Post } from '@nestjs/common';
import { CreatePayinSimpleDto } from './dto/create-payin-simple.dto';
import { PaparaService } from './papara.service';

@Controller('papara')
export class PaparaController {
  constructor(private papara: PaparaService) {}

  @Post('try/papara/payin')
  createPayment(@Body() payload: CreatePayinSimpleDto) {
    return this.papara.createPayin(payload);
  }
}
