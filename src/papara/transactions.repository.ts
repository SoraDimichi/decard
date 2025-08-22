import { Injectable } from '@nestjs/common';
import { PrismaService } from 'src/prisma.service';

@Injectable()
export class TransactionsRepository {
  constructor(private prisma: PrismaService) {}

  create(
    payload:
      | {
          type: 'PAYOUT';
          amount: number;
          number: string;
          orderToken: string;
          userId: number;
        }
      | {
          type: 'PAYIN';
          amount: number;
          orderToken: string;
          userId: number;
        },
  ) {
    const { userId, ...other } = payload;
    return this.prisma.transaction.create({
      data: {
        status: 'PENDING',
        ...other,
        user: { connect: { id: userId } },
      },
    });
  }

  private getStatus(status: string) {
    switch (status.toLowerCase()) {
      case 'success':
        return 'COMPLETED' as const;
      case 'progress':
      case 'pending':
      case 'create':
      case 'check':
      case 'auth':
      case 'preauth':
        return 'PROCESSING' as const;
      case 'reversal':
      case 'refund':
      case 'canceled':
        return 'CANCELED' as const;
      case 'error':
      case 'failed':
        return 'FAILED' as const;
      default:
        return 'PENDING' as const;
    }
  }

  async getUserBalance(userId: number) {
    return this.prisma.$queryRaw<{ balance: number }[]>`
    SELECT COALESCE(
      SUM(CASE WHEN type = 'PAYIN' THEN amount ELSE 0 END), 0
    ) -
    COALESCE(
      SUM(CASE WHEN type = 'PAYOUT' THEN amount ELSE 0 END), 0
    ) AS balance
    FROM "Transaction"
    WHERE "userId" = ${userId} AND status = 'COMPLETED'
  `.then((rows) => rows[0]?.balance || 0);
  }

  async update(payload: {
    status: string;
    orderToken: string;
    errorCode?: string;
    errorMessage?: string;
  }) {
    const { status, orderToken, errorCode, errorMessage } = payload;

    return this.prisma.transaction.update({
      where: { orderToken },
      data: {
        status: this.getStatus(status),
        errorCode,
        errorMessage,
      },
    });
  }
}
