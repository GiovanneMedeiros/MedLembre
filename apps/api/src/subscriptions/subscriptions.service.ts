import { Injectable } from '@nestjs/common';
import { Plano } from '@prisma/client';
import { PrismaService } from '../prisma/prisma.service';

@Injectable()
export class SubscriptionsService {
  constructor(private readonly prisma: PrismaService) {}

  async getOrCreate(userId: string) {
    const existing = await this.prisma.subscription.findUnique({ where: { userId } });
    if (existing) return existing;

    return this.prisma.subscription.create({ data: { userId } });
  }

  async getPlano(userId: string): Promise<Plano> {
    const subscription = await this.getOrCreate(userId);
    return subscription.plano;
  }

  async hasAccessToFamily(userId: string): Promise<boolean> {
    const plano = await this.getPlano(userId);
    return plano === Plano.FAMILIA || plano === Plano.PREMIUM;
  }
}
