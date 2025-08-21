import { Injectable } from '@nestjs/common';
import { PrismaService } from 'src/prisma.service';

@Injectable()
export class TransactionsModel {
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

  find(orderToken: string) {
    return this.prisma.transaction.findUnique({ where: { orderToken } });
  }

  private getStatus(status: string) {
    switch (status.toLowerCase()) {
      case 'completed':
        return 'COMPLETED' as const;
      case 'processing':
        return 'PROCESSING' as const;
      case 'failed':
        return 'FAILED' as const;
      case 'canceled':
        return 'CANCELED' as const;
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
    id: number;
    errorCode?: string;
    errorMessage?: string;
  }) {
    const { status, id, errorCode, errorMessage } = payload;

    return this.prisma.transaction.update({
      where: { id },
      data: {
        status: this.getStatus(status),
        errorCode,
        errorMessage,
      },
    });
  }
}
