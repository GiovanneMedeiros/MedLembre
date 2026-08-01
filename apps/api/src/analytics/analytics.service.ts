import { Injectable } from '@nestjs/common';
import { PrismaService } from '../prisma/prisma.service';

@Injectable()
export class AnalyticsService {
  constructor(private readonly prisma: PrismaService) {}

  async trackPageview(path: string, visitorId: string): Promise<void> {
    await this.prisma.pageView.create({
      data: { path: path.slice(0, 200), visitorId },
    });
  }
}
