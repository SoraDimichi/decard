import { Module } from '@nestjs/common';
import { AppController } from './app.controller';
import { AppService } from './app.service';
import { ConfigModule } from '@nestjs/config';
import { validate } from './env-validate';
import { PrismaService } from './prisma.service';
import { PaparaModule } from './papara/papara.module';

@Module({
  imports: [ConfigModule.forRoot({ validate, isGlobal: true }), PaparaModule],
  controllers: [AppController],
  providers: [AppService, PrismaService],
})
export class AppModule {}
