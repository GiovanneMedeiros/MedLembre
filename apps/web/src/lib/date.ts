// Sempre usa os getters locais (getFullYear/getMonth/getDate), nunca
// toISOString() — em timezones atrás de UTC (ex: Brasil, UTC-3),
// toISOString() adianta a data à noite, criando erro de "um dia a mais".
export function toLocalDateString(date: Date): string {
  const year = date.getFullYear();
  const month = String(date.getMonth() + 1).padStart(2, "0");
  const day = String(date.getDate()).padStart(2, "0");
  return `${year}-${month}-${day}`;
}

export function todayLocalDateString(): string {
  return toLocalDateString(new Date());
}

const WEEKDAY_LABELS = ["Dom", "Seg", "Ter", "Qua", "Qui", "Sex", "Sáb"];
const WEEKDAY_LABELS_FULL = [
  "Domingo",
  "Segunda-feira",
  "Terça-feira",
  "Quarta-feira",
  "Quinta-feira",
  "Sexta-feira",
  "Sábado",
];

export function weekdayLabel(day: number, full = false): string {
  return full ? WEEKDAY_LABELS_FULL[day] : WEEKDAY_LABELS[day];
}

export function formatDiasSemana(dias: number[]): string {
  if (dias.length === 7) return "Todos os dias";
  const sorted = [...dias].sort((a, b) => a - b);
  if (sorted.join(",") === "1,2,3,4,5") return "Dias de semana";
  if (sorted.join(",") === "0,6") return "Fins de semana";
  return sorted.map((d) => weekdayLabel(d)).join(", ");
}

export function formatDateBR(dateOnly: string): string {
  const [year, month, day] = dateOnly.split("-");
  return `${day}/${month}/${year}`;
}

export function formatTimeBR(isoString: string): string {
  const date = new Date(isoString);
  return date.toLocaleTimeString("pt-BR", { hour: "2-digit", minute: "2-digit" });
}
