import { Module } from '@nestjs/common';
import { ConfigModule } from '@nestjs/config';
import { validate } from './env-validate';
import { PaparaModule } from './papara/papara.module';

@Module({
  imports: [ConfigModule.forRoot({ validate, isGlobal: true }), PaparaModule],
  controllers: [],
  providers: [],
})
export class AppModule {}
