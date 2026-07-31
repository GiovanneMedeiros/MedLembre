import { Injectable, Logger } from '@nestjs/common';
import { Cron } from '@nestjs/schedule';
import { Plano, SubscriptionStatus } from '@prisma/client';
import { PrismaService } from '../prisma/prisma.service';
import { DashboardService } from '../dashboard/dashboard.service';
import { EmailService } from '../email/email.service';
import { SupabaseAdminService } from '../supabase-admin/supabase-admin.service';
import { toDateOnlyString } from '../common/medication-schedule.util';

// Recurso Família/Premium: todo início de semana, um resumo de adesão dos
// últimos 7 dias é enviado por e-mail pro responsável pela conta — cobrindo
// o próprio perfil e o de cada familiar acompanhado.
@Injectable()
export class WeeklyReportScheduler {
  private readonly logger = new Logger(WeeklyReportScheduler.name);

  constructor(
    private readonly prisma: PrismaService,
    private readonly dashboardService: DashboardService,
    private readonly email: EmailService,
    private readonly supabaseAdmin: SupabaseAdminService,
  ) {}

  // 08:00 toda segunda-feira. O container roda com TZ=America/Sao_Paulo,
  // então esse horário já é hora de Brasília.
  @Cron('0 8 * * 1')
  async sendWeeklyReports() {
    if (!this.email.isConfigured()) return;

    try {
      const subscriptions = await this.prisma.subscription.findMany({
        where: {
          plano: { in: [Plano.FAMILIA, Plano.PREMIUM] },
          status: SubscriptionStatus.ATIVA,
        },
      });

      for (const subscription of subscriptions) {
        await this.sendReportForUser(subscription.userId);
      }
    } catch (error) {
      const message = error instanceof Error ? error.message : 'Erro desconhecido';
      this.logger.error(`Falha ao processar relatórios semanais: ${message}`);
    }
  }

  private async sendReportForUser(userId: string) {
    const email = await this.supabaseAdmin.getUserEmail(userId);
    if (!email) return;

    const now = new Date();
    const today = toDateOnlyString(now);

    const familyMembers = await this.prisma.familyMember.findMany({
      where: { userId },
      orderBy: { createdAt: 'asc' },
    });

    const profiles: { nome: string; adesao: number | null }[] = [];

    const ownerAdesao = await this.dashboardService.computeWeeklyAdherence(
      userId,
      null,
      today,
      now,
    );
    profiles.push({ nome: 'Você', adesao: ownerAdesao });

    for (const member of familyMembers) {
      const adesao = await this.dashboardService.computeWeeklyAdherence(
        userId,
        member.id,
        today,
        now,
      );
      profiles.push({ nome: member.nome, adesao });
    }

    const relevantProfiles = profiles.filter((p) => p.adesao !== null);
    if (relevantProfiles.length === 0) return;

    const html = this.buildEmailHtml(relevantProfiles);

    await this.email.send(email, 'Seu resumo semanal — MedLembre', html);
  }

  private buildEmailHtml(profiles: { nome: string; adesao: number | null }[]): string {
    const rows = profiles
      .map(
        (p) => `
          <tr>
            <td style="padding:8px 0;color:#1c1917;font-size:14px;">${p.nome}</td>
            <td style="padding:8px 0;text-align:right;font-weight:700;color:${
              (p.adesao ?? 0) >= 80 ? '#059669' : '#d97706'
            };font-size:14px;">${p.adesao}%</td>
          </tr>`,
      )
      .join('');

    return `
      <div style="font-family:Arial,sans-serif;max-width:480px;margin:0 auto;padding:24px;">
        <h2 style="color:#1c1917;font-size:18px;">Resumo da sua semana</h2>
        <p style="color:#57534e;font-size:14px;">Adesão aos medicamentos nos últimos 7 dias:</p>
        <table style="width:100%;border-collapse:collapse;margin-top:12px;">
          ${rows}
        </table>
        <p style="margin-top:24px;color:#a8a29e;font-size:12px;">
          Você recebe este e-mail semanalmente por fazer parte de um plano Família ou Premium do MedLembre.
        </p>
      </div>`;
  }
}
