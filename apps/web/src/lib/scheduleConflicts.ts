import type { Medication } from "../types/medication";

export interface ScheduleConflict {
  nomeA: string;
  nomeB: string;
  horarioA: string;
  horarioB: string;
}

const CONFLICT_THRESHOLD_MINUTES = 30;

function toMinutes(horario: string): number {
  const [hours, minutes] = horario.split(":").map(Number);
  return hours * 60 + minutes;
}

function shareWeekday(a: number[], b: number[]): boolean {
  return a.some((day) => b.includes(day));
}

// Compara todos os pares de medicamentos ativos da mesma pessoa e aponta
// horários muito próximos (dentro de CONFLICT_THRESHOLD_MINUTES), num dia
// da semana em comum — útil pra revisar com o médico/farmacêutico.
export function findScheduleConflicts(medications: Medication[]): ScheduleConflict[] {
  const active = medications.filter((m) => m.status === "ATIVO");
  const conflicts: ScheduleConflict[] = [];

  for (let i = 0; i < active.length; i += 1) {
    for (let j = i + 1; j < active.length; j += 1) {
      const medA = active[i];
      const medB = active[j];
      if (!shareWeekday(medA.diasSemana, medB.diasSemana)) continue;

      for (const horarioA of medA.horarios) {
        for (const horarioB of medB.horarios) {
          const diff = Math.abs(toMinutes(horarioA) - toMinutes(horarioB));
          if (diff > 0 && diff <= CONFLICT_THRESHOLD_MINUTES) {
            conflicts.push({ nomeA: medA.nome, nomeB: medB.nome, horarioA, horarioB });
          }
        }
      }
    }
  }

  return conflicts;
}
