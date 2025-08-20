import { Module } from '@nestjs/common';
import { AppController } from './app.controller';
import { AppService } from './app.service';
import { PrismaModule } from './prisma/prisma.module';
import { ConfigModule } from '@nestjs/config';
import { validate } from './env-validate';

@Module({
  imports: [ConfigModule.forRoot({ validate }), PrismaModule],
  controllers: [AppController],
  providers: [AppService],
})
export class AppModule {}
