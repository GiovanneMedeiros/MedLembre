export function toDateOnlyString(date: Date): string {
  const year = date.getFullYear();
  const month = String(date.getMonth() + 1).padStart(2, '0');
  const day = String(date.getDate()).padStart(2, '0');
  return `${year}-${month}-${day}`;
}

export function combineDateAndTime(dateOnly: string, horario: string): Date {
  return new Date(`${dateOnly}T${horario}:00`);
}

export function isWithinRange(dateOnly: string, dataInicio: Date, dataFim: Date | null): boolean {
  const target = combineDateAndTime(dateOnly, '00:00');
  if (target < new Date(toDateOnlyString(dataInicio) + 'T00:00:00')) return false;
  if (dataFim && target > new Date(toDateOnlyString(dataFim) + 'T23:59:59')) return false;
  return true;
}

export function currentTimeString(date: Date = new Date()): string {
  const hours = String(date.getHours()).padStart(2, '0');
  const minutes = String(date.getMinutes()).padStart(2, '0');
  return `${hours}:${minutes}`;
}
