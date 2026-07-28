import type { WhatsAppButton } from '../providers/whatsapp-provider.interface';

export const BUTTON_ACTION = {
  TOMEI: 'TOMEI',
  SNOOZE: 'SNOOZE',
} as const;

export function encodeButtonId(action: keyof typeof BUTTON_ACTION, medicationId: string, scheduledFor: string) {
  return `${action}:${medicationId}:${scheduledFor}`;
}

export interface DecodedButtonId {
  action: keyof typeof BUTTON_ACTION;
  medicationId: string;
  scheduledFor: string;
}

export function decodeButtonId(id: string): DecodedButtonId | null {
  const [action, medicationId, scheduledFor] = id.split(':');
  if (action !== BUTTON_ACTION.TOMEI && action !== BUTTON_ACTION.SNOOZE) return null;
  if (!medicationId || !scheduledFor) return null;
  return { action, medicationId, scheduledFor };
}

export function buildReminderMessage(medicationNome: string, horario: string): string {
  return [
    '💊 Hora do seu medicamento!',
    '',
    'Está na hora de tomar:',
    medicationNome,
    '',
    `🕐 ${horario}`,
    '',
    'Você já tomou?',
  ].join('\n');
}

export function buildReminderButtons(medicationId: string, scheduledFor: string): WhatsAppButton[] {
  return [
    { id: encodeButtonId('TOMEI', medicationId, scheduledFor), title: 'Tomei' },
    { id: encodeButtonId('SNOOZE', medicationId, scheduledFor), title: 'Lembrar depois' },
  ];
}

export function buildConfirmationMessage(medicationNome: string): string {
  return `Perfeito! Registramos que você tomou ${medicationNome} ✅`;
}

export function buildSnoozeMessage(medicationNome: string, minutes: number): string {
  return `Tudo bem! Vou te lembrar de ${medicationNome} novamente em ${minutes} minutos ⏰`;
}
