import { Plano } from '@prisma/client';

export interface PlanLimits {
  maxMedications: number | null;
  maxFamilyMembers: number | null;
  historyDays: number | null;
  // Lembrete por WhatsApp/SMS tem custo por mensagem — só planos pagos.
  // No Grátis o lembrete continua chegando por notificação push.
  whatsappEnabled: boolean;
  // Controle de estoque de medicamentos e alerta de reposição.
  estoqueEnabled: boolean;
  // Quantos contatos de emergência (escalonamento) o plano permite.
  maxEmergencyContacts: number;
  // Relatório semanal de adesão por e-mail.
  weeklyReportEnabled: boolean;
  // Alerta de horários próximos entre medicamentos da mesma pessoa.
  conflictAlertEnabled: boolean;
}

// null = ilimitado. Precisa ficar em sincronia com o que é anunciado
// em apps/web/src/data/plans.ts.
export const PLAN_LIMITS: Record<Plano, PlanLimits> = {
  GRATIS: {
    maxMedications: 1,
    maxFamilyMembers: 0,
    historyDays: 7,
    whatsappEnabled: false,
    estoqueEnabled: false,
    maxEmergencyContacts: 0,
    weeklyReportEnabled: false,
    conflictAlertEnabled: false,
  },
  ESSENCIAL: {
    maxMedications: 5,
    maxFamilyMembers: 0,
    historyDays: 30,
    whatsappEnabled: true,
    estoqueEnabled: true,
    maxEmergencyContacts: 0,
    weeklyReportEnabled: false,
    conflictAlertEnabled: true,
  },
  FAMILIA: {
    maxMedications: null,
    maxFamilyMembers: 5,
    historyDays: 90,
    whatsappEnabled: true,
    estoqueEnabled: true,
    maxEmergencyContacts: 1,
    weeklyReportEnabled: true,
    conflictAlertEnabled: true,
  },
  PREMIUM: {
    maxMedications: null,
    maxFamilyMembers: null,
    historyDays: null,
    whatsappEnabled: true,
    estoqueEnabled: true,
    maxEmergencyContacts: 3,
    weeklyReportEnabled: true,
    conflictAlertEnabled: true,
  },
};

// O plano Grátis funciona como um teste temporário: passadas essas horas
// desde a criação da assinatura, o acesso é bloqueado até o upgrade.
export const FREE_TRIAL_HOURS = 48;
