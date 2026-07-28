export function buildSmsReminderMessage(
  medicationNome: string,
  horario: string,
): string {
  return `💊 MedLembre: hora de tomar ${medicationNome} (${horario}). Abra o app para confirmar.`;
}
