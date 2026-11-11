import { useEffect, useState } from "react";
import { ArrowDownRight, ArrowUpRight, Minus, TrendingUp } from "lucide-react";
import type { DayAdherence } from "../../hooks/useAdherenceHistory";
import { useCountUp } from "../../hooks/useCountUp";
import { cn } from "../../lib/cn";

interface AdherenceChartProps {
  days: DayAdherence[];
  weekPct: number | null;
  lastWeekPct: number | null;
}

const GOAL = 80;
const weekdayShort = new Intl.DateTimeFormat("pt-BR", { weekday: "short" });
const dayMonth = new Intl.DateTimeFormat("pt-BR", { weekday: "short", day: "numeric", month: "short" });

function cap(text: string) {
  return text.charAt(0).toUpperCase() + text.slice(1);
}

function parseLocal(date: string) {
  const [y, m, d] = date.split("-").map(Number);
  return new Date(y, m - 1, d);
}

function Delta({ current, previous }: { current: number; previous: number }) {
  const diff = current - previous;
  const Icon = diff > 0 ? ArrowUpRight : diff < 0 ? ArrowDownRight : Minus;
  const text =
    diff === 0 ? "igual à semana passada" : `${diff > 0 ? "+" : "−"}${Math.abs(diff)} pts vs semana passada`;
  return (
    <span
      className={cn(
        "inline-flex items-center gap-1 rounded-full px-2.5 py-1 text-xs font-semibold tabular-nums",
        diff > 0 && "bg-emerald-50 text-emerald-700",
        diff < 0 && "bg-amber-50 text-amber-700",
        diff === 0 && "bg-ink-900/[0.05] text-ink-500",
      )}
    >
      <Icon className="h-3.5 w-3.5" aria-hidden="true" />
      {text}
    </span>
  );
}

export function AdherenceChart({ days, weekPct, lastWeekPct }: AdherenceChartProps) {
  const animated = useCountUp(weekPct ?? 0, 1100);
  const [grown, setGrown] = useState(false);
  const [active, setActive] = useState<string | null>(null);

  useEffect(() => {
    const id = requestAnimationFrame(() => setGrown(true));
    return () => cancelAnimationFrame(id);
  }, []);

  const isGood = (weekPct ?? 0) >= GOAL;
  const allEmpty = days.every((d) => d.pct === null);

  return (
    <div className="flex h-full flex-col rounded-3xl border border-ink-900/[0.06] bg-white p-5 shadow-soft sm:p-6">
      <div className="flex flex-wrap items-start justify-between gap-3">
        <div>
          <div className="flex items-center gap-2 text-sm font-semibold text-ink-900">
            <TrendingUp className="h-4 w-4 text-emerald-600" aria-hidden="true" />
            Adesão nos últimos 7 dias
          </div>
          <div className="mt-3 flex flex-wrap items-center gap-3">
            <span
              className={cn(
                "font-heading text-5xl font-extrabold tracking-tight tabular-nums",
                weekPct === null ? "text-ink-300" : isGood ? "text-emerald-600" : "text-amber-600",
              )}
            >
              {weekPct === null ? "–" : `${animated}%`}
            </span>
            {weekPct !== null && lastWeekPct !== null && <Delta current={weekPct} previous={lastWeekPct} />}
          </div>
          <p className="mt-1 text-sm text-ink-500">Doses tomadas em relação ao total programado.</p>
        </div>
      </div>

      {/* Gráfico: uma barra por dia */}
      <div className="relative mt-5 flex-1">
        <div className="mb-3 flex items-center justify-between gap-3 text-xs font-semibold text-ink-300">
          <span>Últimos {days.length} dias</span>
          <span className="flex items-center gap-3">
            <span className="flex items-center gap-1.5">
              <span className="h-2.5 w-2.5 rounded-[3px] bg-emerald-500" aria-hidden="true" />
              Doses tomadas
            </span>
            <span className="flex items-center gap-1.5">
              <span className="w-4 border-t border-dashed border-ink-900/40" aria-hidden="true" />
              Meta {GOAL}%
            </span>
          </span>
        </div>
        <div className="relative h-36">
          {/* Linha da meta */}
          <div
            className="pointer-events-none absolute inset-x-0 border-t border-dashed border-ink-900/20"
            style={{ bottom: `${GOAL}%` }}
            aria-hidden="true"
          >
          </div>

          {allEmpty && (
            <>
              <div className="absolute inset-0 flex items-end gap-0.5 sm:gap-1" aria-hidden="true">
                {days.map((day, i) => (
                  <div key={day.date} className="flex h-full flex-1 items-end justify-center">
                    <span
                      className="h-full w-full max-w-7 origin-bottom animate-bar-wave rounded-t-[4px] rounded-b-[2px] bg-gradient-to-t from-emerald-200 to-emerald-100"
                      style={{ animationDelay: `${i * 0.12}s` }}
                    />
                  </div>
                ))}
              </div>
              <div className="absolute inset-0 flex items-center justify-center">
                <p className="max-w-xs rounded-2xl bg-white/90 px-4 py-3 text-center text-sm text-pretty text-ink-700 shadow-soft backdrop-blur-sm">
                  Seu gráfico começa a aparecer no primeiro dia em que você marcar uma dose.
                </p>
              </div>
            </>
          )}

          <div className={cn("absolute inset-0 flex items-end gap-0.5 sm:gap-1", allEmpty && "hidden")}>
            {days.map((day, i) => {
              const height = day.pct === null ? 0 : Math.max(day.pct, 4);
              const label =
                day.pct === null
                  ? `${day.isToday ? "Hoje" : dayMonth.format(parseLocal(day.date))}: nenhuma dose programada`
                  : `${day.isToday ? "Hoje" : dayMonth.format(parseLocal(day.date))}: ${day.taken} de ${day.total} doses (${day.pct}%)`;
              const isActive = active === day.date;
              return (
                <div
                  key={day.date}
                  className="group relative flex h-full flex-1 items-end justify-center outline-none"
                  tabIndex={0}
                  role="img"
                  aria-label={label}
                  onMouseEnter={() => setActive(day.date)}
                  onMouseLeave={() => setActive(null)}
                  onFocus={() => setActive(day.date)}
                  onBlur={() => setActive(null)}
                >
                  {day.pct === null ? (
                    <span className="mb-0 h-1 w-full max-w-7 rounded-full bg-ink-900/[0.06]" />
                  ) : (
                    <span
                      className={cn(
                        "w-full max-w-7 origin-bottom rounded-t-[4px] rounded-b-[2px] transition-[height,opacity] duration-700 ease-out",
                        day.isToday
                          ? "bg-[repeating-linear-gradient(135deg,var(--color-emerald-500)_0_4px,var(--color-emerald-300)_4px_8px)]"
                          : "bg-emerald-500",
                        active && !isActive && "opacity-40",
                        "group-focus-visible:ring-2 group-focus-visible:ring-brand-500 group-focus-visible:ring-offset-2",
                      )}
                      style={{ height: grown ? `${height}%` : "0%", transitionDelay: `${i * 40}ms` }}
                    />
                  )}

                  {isActive && (
                    <div
                      className={cn(
                        "pointer-events-none absolute z-10 w-max max-w-[11rem]",
                        i < 2 ? "left-0" : i > days.length - 3 ? "right-0" : "left-1/2 -translate-x-1/2",
                      )}
                      style={{ bottom: `calc(${height}% + 8px)` }}
                      aria-hidden="true"
                    >
                     <div
                      className="animate-rise rounded-xl bg-ink-900 px-3 py-2 text-xs text-white shadow-lift"
                      style={{ animationDuration: "0.2s" }}
                     >
                      <p className="font-semibold">
                        {day.isToday ? "Hoje (em andamento)" : cap(dayMonth.format(parseLocal(day.date)))}
                      </p>
                      <p className="mt-0.5 text-white/75 tabular-nums">
                        {day.pct === null ? "Nenhuma dose programada" : `${day.taken} de ${day.total} doses, ${day.pct}%`}
                      </p>
                     </div>
                    </div>
                  )}
                </div>
              );
            })}
          </div>
        </div>

        <div className="mt-2 flex gap-0.5 sm:gap-1" aria-hidden="true">
          {days.map((day) => (
            <span
              key={day.date}
              className={cn(
                "flex-1 text-center text-[10px] font-semibold capitalize sm:text-[11px]",
                day.isToday ? "text-emerald-700" : "text-ink-300",
              )}
            >
              {day.isToday ? "hoje" : weekdayShort.format(parseLocal(day.date)).replace(".", "").slice(0, 3)}
            </span>
          ))}
        </div>
      </div>
    </div>
  );
}
