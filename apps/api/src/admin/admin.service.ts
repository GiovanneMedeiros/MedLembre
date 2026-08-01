import { Injectable } from '@nestjs/common';
import { Plano } from '@prisma/client';
import { PrismaService } from '../prisma/prisma.service';
import { SupabaseAdminService } from '../supabase-admin/supabase-admin.service';
import { PLAN_ANNUAL_PRICE, PLAN_MONTHLY_PRICE } from '../subscriptions/plan-prices';
import { toDateOnlyString } from '../common/medication-schedule.util';
import type { AdminStats, AdminUser } from './admin.types';

const ONLINE_WINDOW_MINUTES = 5;
const CADASTROS_POR_DIA_JANELA = 14;

@Injectable()
export class AdminService {
  constructor(
    private readonly prisma: PrismaService,
    private readonly supabaseAdmin: SupabaseAdminService,
  ) {}

  async getStats(): Promise<AdminStats> {
    const [users, subscriptions, activityCount, pageviewCounts, uniqueVisitors] =
      await Promise.all([
        this.supabaseAdmin.listUsers(),
        this.prisma.subscription.findMany(),
        this.countOnlineNow(),
        this.countPageviews(),
        this.countUniqueVisitors(),
      ]);

    const subsByUserId = new Map(subscriptions.map((s) => [s.userId, s]));

    const porPlano = { GRATIS: 0, ESSENCIAL: 0, FAMILIA: 0, PREMIUM: 0 };
    let assinaturasAtivas = 0;
    let receitaMensalEstimada = 0;

    for (const user of users) {
      const sub = subsByUserId.get(user.id);
      const plano = sub?.plano ?? Plano.GRATIS;
      porPlano[plano] += 1;

      if (sub && sub.plano !== Plano.GRATIS && sub.status === 'ATIVA') {
        assinaturasAtivas += 1;
        receitaMensalEstimada +=
          sub.periodicidade === 'ANUAL'
            ? (PLAN_ANNUAL_PRICE[sub.plano] ?? 0) / 12
            : PLAN_MONTHLY_PRICE[sub.plano];
      }
    }

    const now = new Date();
    const startOfToday = new Date(now);
    startOfToday.setHours(0, 0, 0, 0);
    const sevenDaysAgo = new Date(now.getTime() - 7 * 24 * 60 * 60 * 1000);
    const thirtyDaysAgo = new Date(now.getTime() - 30 * 24 * 60 * 60 * 1000);

    const cadastrosHoje = users.filter(
      (u) => new Date(u.criadoEm) >= startOfToday,
    ).length;
    const cadastros7dias = users.filter(
      (u) => new Date(u.criadoEm) >= sevenDaysAgo,
    ).length;
    const cadastros30dias = users.filter(
      (u) => new Date(u.criadoEm) >= thirtyDaysAgo,
    ).length;

    const cadastrosPorDia = this.buildCadastrosPorDia(users, now);

    return {
      totalUsuarios: users.length,
      porPlano,
      assinaturasAtivas,
      receitaMensalEstimada: Math.round(receitaMensalEstimada * 100) / 100,
      onlineAgora: activityCount,
      cadastrosHoje,
      cadastros7dias,
      cadastros30dias,
      cadastrosPorDia,
      pageviews: pageviewCounts,
      visitantesUnicos: uniqueVisitors,
    };
  }

  async getUsuarios(): Promise<AdminUser[]> {
    const [users, subscriptions, medicationCounts, familyMemberCounts, activities] =
      await Promise.all([
        this.supabaseAdmin.listUsers(),
        this.prisma.subscription.findMany(),
        this.prisma.medication.groupBy({ by: ['userId'], _count: { id: true } }),
        this.prisma.familyMember.groupBy({ by: ['userId'], _count: { id: true } }),
        this.prisma.userActivity.findMany(),
      ]);

    const subsByUserId = new Map(subscriptions.map((s) => [s.userId, s]));
    const medsByUserId = new Map(
      medicationCounts.map((m) => [m.userId, m._count.id]),
    );
    const familyByUserId = new Map(
      familyMemberCounts.map((f) => [f.userId, f._count.id]),
    );
    const activityByUserId = new Map(
      activities.map((a) => [a.userId, a.lastSeenAt]),
    );

    return users
      .map((user) => {
        const sub = subsByUserId.get(user.id);
        const lastSeen = activityByUserId.get(user.id);
        return {
          id: user.id,
          email: user.email,
          nome: user.nome,
          criadoEm: user.criadoEm,
          emailConfirmado: user.emailConfirmado,
          plano: sub?.plano ?? Plano.GRATIS,
          status: sub?.status ?? 'ATIVA',
          medicamentos: medsByUserId.get(user.id) ?? 0,
          familiares: familyByUserId.get(user.id) ?? 0,
          ultimoAcesso: lastSeen ? lastSeen.toISOString() : null,
        };
      })
      .sort((a, b) => new Date(b.criadoEm).getTime() - new Date(a.criadoEm).getTime());
  }

  private async countOnlineNow(): Promise<number> {
    const threshold = new Date(Date.now() - ONLINE_WINDOW_MINUTES * 60 * 1000);
    return this.prisma.userActivity.count({
      where: { lastSeenAt: { gte: threshold } },
    });
  }

  private async countPageviews(): Promise<AdminStats['pageviews']> {
    const now = new Date();
    const startOfToday = new Date(now);
    startOfToday.setHours(0, 0, 0, 0);
    const sevenDaysAgo = new Date(now.getTime() - 7 * 24 * 60 * 60 * 1000);
    const thirtyDaysAgo = new Date(now.getTime() - 30 * 24 * 60 * 60 * 1000);

    const [hoje, ultimos7dias, ultimos30dias, total] = await Promise.all([
      this.prisma.pageView.count({ where: { createdAt: { gte: startOfToday } } }),
      this.prisma.pageView.count({ where: { createdAt: { gte: sevenDaysAgo } } }),
      this.prisma.pageView.count({ where: { createdAt: { gte: thirtyDaysAgo } } }),
      this.prisma.pageView.count(),
    ]);

    return { hoje, ultimos7dias, ultimos30dias, total };
  }

  private async countUniqueVisitors(): Promise<AdminStats['visitantesUnicos']> {
    const now = new Date();
    const startOfToday = new Date(now);
    startOfToday.setHours(0, 0, 0, 0);
    const sevenDaysAgo = new Date(now.getTime() - 7 * 24 * 60 * 60 * 1000);
    const thirtyDaysAgo = new Date(now.getTime() - 30 * 24 * 60 * 60 * 1000);

    const [hoje, ultimos7dias, ultimos30dias] = await Promise.all([
      this.prisma.pageView.findMany({
        where: { createdAt: { gte: startOfToday } },
        distinct: ['visitorId'],
        select: { visitorId: true },
      }),
      this.prisma.pageView.findMany({
        where: { createdAt: { gte: sevenDaysAgo } },
        distinct: ['visitorId'],
        select: { visitorId: true },
      }),
      this.prisma.pageView.findMany({
        where: { createdAt: { gte: thirtyDaysAgo } },
        distinct: ['visitorId'],
        select: { visitorId: true },
      }),
    ]);

    return {
      hoje: hoje.length,
      ultimos7dias: ultimos7dias.length,
      ultimos30dias: ultimos30dias.length,
    };
  }

  private buildCadastrosPorDia(
    users: { criadoEm: string }[],
    now: Date,
  ): AdminStats['cadastrosPorDia'] {
    const counts = new Map<string, number>();

    for (const user of users) {
      const dateOnly = toDateOnlyString(new Date(user.criadoEm));
      counts.set(dateOnly, (counts.get(dateOnly) ?? 0) + 1);
    }

    const result: AdminStats['cadastrosPorDia'] = [];
    for (let i = CADASTROS_POR_DIA_JANELA - 1; i >= 0; i -= 1) {
      const cursor = new Date(now);
      cursor.setDate(cursor.getDate() - i);
      const dateOnly = toDateOnlyString(cursor);
      result.push({ data: dateOnly, total: counts.get(dateOnly) ?? 0 });
    }

    return result;
  }
}
