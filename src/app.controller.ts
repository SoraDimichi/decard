import { Controller, Get, Post, Body } from '@nestjs/common';
import { AppService } from './app.service';
import { User } from '@prisma/client';

@Controller()
export class AppController {
  constructor(private readonly appService: AppService) {}

  @Get('users')
  getUsers(): Promise<User[]> {
    return this.appService.getUsers();
  }

  @Post('users')
  createUser(
    @Body()
    userData: {
      first_name: string;
      last_name: string;
      email: string;
      password: string;
    },
  ): Promise<User> {
    return this.appService.createUser(userData);
  }
}
