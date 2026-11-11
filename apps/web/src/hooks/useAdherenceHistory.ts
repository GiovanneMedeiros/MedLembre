import { useMemo } from "react";
import { useQuery } from "@tanstack/react-query";
import { api } from "../lib/api";
import { toLocalDateString } from "../lib/date";
import { useFamilyScope } from "../contexts/FamilyScopeContext";
import type { HistoricoResult, TimelineItem } from "../types/dashboard";

const DAYS = 14;

export interface DayAdherence {
  date: string; // YYYY-MM-DD local
  taken: number;
  total: number;
  pct: number | null; // null = nenhuma dose programada
  isToday: boolean;
}

export interface MedicationAdherence {
  medicationId: string;
  nome: string;
  cor: string;
  taken: number;
  total: number;
  pct: number;
}

export interface MissedSlot {
  horario: string;
  missed: number;
}

export interface AdherenceHistory {
  days: DayAdherence[];
  streak: number;
  thisWeekPct: number | null;
  lastWeekPct: number | null;
  perMedication: MedicationAdherence[];
  mostMissed: MissedSlot | null;
  limitedTo: number;
}

function pct(taken: number, total: number) {
  return total === 0 ? null : Math.round((taken / total) * 100);
}

function summarize(items: TimelineItem[], totalDias: number): AdherenceHistory {
  const today = new Date();
  const todayKey = toLocalDateString(today);
  const span = Math.min(DAYS, Math.max(1, totalDias));

  const days: DayAdherence[] = [];
  const index = new Map<string, DayAdherence>();
  for (let i = span - 1; i >= 0; i -= 1) {
    const d = new Date(today);
    d.setDate(d.getDate() - i);
    const key = toLocalDateString(d);
    const day: DayAdherence = { date: key, taken: 0, total: 0, pct: null, isToday: key === todayKey };
    days.push(day);
    index.set(key, day);
  }

  const lastWeekStart = days.length > 7 ? days[days.length - 7].date : days[0].date;
  const perMed = new Map<string, MedicationAdherence>();
  const missedBySlot = new Map<string, number>();

  for (const item of items) {
    const key = toLocalDateString(new Date(item.scheduledFor));
    const day = index.get(key);
    if (!day) continue;

    // Dose de hoje ainda dentro da tolerância não conta como falha.
    const counts = item.status === "tomado" || item.status === "perdido" || item.status === "atrasado";
    if (!counts) continue;

    const taken = item.status === "tomado";
    day.total += 1;
    if (taken) day.taken += 1;

    if (key >= lastWeekStart) {
      const med = perMed.get(item.medicationId) ?? {
        medicationId: item.medicationId,
        nome: item.nome,
        cor: item.cor,
        taken: 0,
        total: 0,
        pct: 0,
      };
      med.total += 1;
      if (taken) med.taken += 1;
      perMed.set(item.medicationId, med);

      if (!taken) missedBySlot.set(item.horario, (missedBySlot.get(item.horario) ?? 0) + 1);
    }
  }

  for (const day of days) day.pct = pct(day.taken, day.total);

  // Sequência: dias seguidos com 100% das doses. Hoje só soma se estiver
  // completo até agora; se não estiver, não quebra (o dia ainda não acabou).
  let streak = 0;
  for (let i = days.length - 1; i >= 0; i -= 1) {
    const day = days[i];
    if (day.total === 0) continue;
    if (day.taken === day.total) streak += 1;
    else if (day.isToday) continue;
    else break;
  }

  const sumRange = (range: DayAdherence[]) => {
    const taken = range.reduce((acc, d) => acc + d.taken, 0);
    const total = range.reduce((acc, d) => acc + d.total, 0);
    return pct(taken, total);
  };

  const thisWeek = days.slice(-7);
  const lastWeek = days.length > 7 ? days.slice(0, days.length - 7) : [];

  const mostMissedEntry = [...missedBySlot.entries()].sort((a, b) => b[1] - a[1])[0];

  return {
    days,
    streak,
    thisWeekPct: sumRange(thisWeek),
    lastWeekPct: lastWeek.length >= 7 ? sumRange(lastWeek) : null,
    perMedication: [...perMed.values()]
      .map((m) => ({ ...m, pct: Math.round((m.taken / m.total) * 100) }))
      .sort((a, b) => a.pct - b.pct || a.nome.localeCompare(b.nome)),
    mostMissed: mostMissedEntry && mostMissedEntry[1] >= 2 ? { horario: mostMissedEntry[0], missed: mostMissedEntry[1] } : null,
    limitedTo: span,
  };
}

/** Histórico das últimas 2 semanas resumido para os gráficos do dashboard. */
export function useAdherenceHistory() {
  const { familyMemberId } = useFamilyScope();

  const query = useQuery({
    queryKey: ["historico", familyMemberId, DAYS],
    queryFn: () => {
      const params = new URLSearchParams({ dias: String(DAYS) });
      if (familyMemberId) params.set("familyMemberId", familyMemberId);
      return api.get<HistoricoResult>(`/dashboard/historico?${params.toString()}`);
    },
    refetchInterval: 5 * 60_000,
  });

  const summary = useMemo(
    () => (query.data ? summarize(query.data.items, query.data.totalDias) : null),
    [query.data],
  );

  return { ...query, summary };
}
