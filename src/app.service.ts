import { Injectable } from '@nestjs/common';
import { PrismaService } from './prisma/prisma.service';
import { User } from '@prisma/client';

@Injectable()
export class AppService {
  constructor(private prisma: PrismaService) {}

  async getUsers(): Promise<User[]> {
    return this.prisma.user.findMany();
  }

  async createUser(data: {
    name?: string;
    email: string;
    password: string;
  }): Promise<User> {
    return this.prisma.user.create({
      data,
    });
  }
}
