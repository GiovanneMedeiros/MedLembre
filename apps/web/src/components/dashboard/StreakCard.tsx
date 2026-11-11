import { Flame } from "lucide-react";
import type { DayAdherence } from "../../hooks/useAdherenceHistory";
import { useCountUp } from "../../hooks/useCountUp";
import { cn } from "../../lib/cn";

interface StreakCardProps {
  streak: number;
  days: DayAdherence[];
}

const weekdayShort = new Intl.DateTimeFormat("pt-BR", { weekday: "short" });
const dayLong = new Intl.DateTimeFormat("pt-BR", { weekday: "long", day: "numeric", month: "long" });

function parseLocal(date: string) {
  const [y, m, d] = date.split("-").map(Number);
  return new Date(y, m - 1, d);
}

function dayLabel(day: DayAdherence) {
  const when = day.isToday ? "Hoje" : dayLong.format(parseLocal(day.date));
  if (day.total === 0) return `${when}: nenhuma dose programada`;
  return `${when}: ${day.taken} de ${day.total} doses tomadas`;
}

function message(streak: number) {
  if (streak === 0) return "Tome todas as doses de hoje para começar uma sequência.";
  if (streak === 1) return "Primeiro dia completo. Continue amanhã!";
  if (streak < 7) return "Dias seguidos sem esquecer nenhuma dose.";
  return "Mais de uma semana sem esquecer nenhuma dose. Incrível!";
}

export function StreakCard({ streak, days }: StreakCardProps) {
  const animated = useCountUp(streak, 900);
  const week = days.slice(-7);
  const isHot = streak >= 3;

  return (
    <div className="relative flex h-full flex-col overflow-hidden rounded-3xl border border-ink-900/[0.06] bg-white p-5 shadow-soft sm:p-6">
      {/* Chama decorativa ao fundo: cresce com a sequência */}
      <div
        className={cn(
          "pointer-events-none absolute -top-6 -right-6 transition-opacity duration-700",
          streak > 0 ? "opacity-100" : "opacity-40",
        )}
        aria-hidden="true"
      >
        <div className="absolute inset-6 rounded-full bg-orange-300/40 blur-2xl" />
        <Flame
          className="relative h-44 w-44 text-orange-500/[0.12]"
          strokeWidth={1.25}
          fill="currentColor"
        />
      </div>

      <div className="relative flex items-center gap-2 text-sm font-semibold text-ink-900">
        <Flame className={cn("h-4 w-4", isHot ? "text-orange-500" : "text-ink-300")} aria-hidden="true" />
        Sequência
      </div>

      <div className="relative mt-3 flex items-baseline gap-2">
        <span className="font-heading text-6xl font-extrabold tracking-tight text-ink-900 tabular-nums">{animated}</span>
        <span className="text-base font-semibold text-ink-500">{streak === 1 ? "dia" : "dias"}</span>
      </div>
      <p className="relative mt-1 max-w-[15rem] text-sm text-pretty text-ink-500">{message(streak)}</p>

      <ol className="relative mt-auto flex items-end justify-between gap-1 pt-6" aria-label="Últimos 7 dias">
        {week.map((day, i) => {
          const complete = day.total > 0 && day.taken === day.total;
          const partial = day.total > 0 && day.taken > 0 && !complete;
          return (
            <li key={day.date} className="flex flex-col items-center gap-1.5" title={dayLabel(day)}>
              <span className="sr-only">{dayLabel(day)}</span>
              <span
                aria-hidden="true"
                className={cn(
                  "flex h-8 w-8 animate-dose-pop items-center justify-center rounded-full text-[11px] font-bold sm:h-9 sm:w-9",
                  complete && "bg-gradient-to-b from-orange-400 to-orange-500 text-white shadow-[0_4px_12px_-4px_rgba(249,115,22,0.6)]",
                  partial && "bg-orange-100 text-orange-700",
                  !complete && !partial && day.total > 0 && "bg-ink-900/[0.06] text-ink-500",
                  day.total === 0 && "border border-dashed border-ink-900/15 text-ink-300",
                  day.isToday && !complete && "ring-2 ring-orange-300 ring-offset-2",
                )}
                style={{ animationDelay: `${0.2 + i * 0.05}s` }}
              >
                {complete ? <Flame className="h-4 w-4" /> : day.total > 0 ? `${day.taken}/${day.total}` : ""}
              </span>
              <span
                aria-hidden="true"
                className={cn("text-[11px] font-semibold", day.isToday ? "text-orange-600" : "text-ink-300")}
              >
                {day.isToday ? "hoje" : weekdayShort.format(parseLocal(day.date)).replace(".", "").slice(0, 3)}
              </span>
            </li>
          );
        })}
      </ol>
    </div>
  );
}
