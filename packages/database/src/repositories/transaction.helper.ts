import { Injectable } from '@nestjs/common';
import { PrismaService } from '../prisma/prisma.service';

/**
 * Helper class để thực hiện các transaction trong database
 */
@Injectable()
export class TransactionHelper {
  constructor(private readonly prisma: PrismaService) {}

  /**
   * Thực hiện một hàm trong transaction
   * @param fn Hàm cần thực hiện trong transaction
   * @returns Promise với kết quả từ hàm đã thực hiện
   */
  async executeTransaction<T>(fn: (tx: unknown) => Promise<T>): Promise<T> {
    return this.prisma.$transaction(async (tx) => {
      return await fn(tx);
    });
  }

  /**
   * Thực hiện một loạt các hàm trong cùng một transaction
   * @param fns Danh sách các hàm cần thực hiện
   * @returns Promise với kết quả từ các hàm đã thực hiện
   */
  async executeTransactionBatch<T>(fns: ((tx: unknown) => Promise<T>)[]): Promise<T[]> {
    return this.prisma.$transaction(async (tx) => {
      const results: T[] = [];
      for (const fn of fns) {
        results.push(await fn(tx));
      }
      return results;
    });
  }
} 