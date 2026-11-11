import { Fragment, type ReactNode } from "react";
import { Moon, Sunrise, Sun, Sunset } from "lucide-react";
import type { LucideIcon } from "lucide-react";
import type { TimelineItem } from "../../types/dashboard";

interface DayTimelineProps {
  items: TimelineItem[];
  now: Date;
  renderRow: (item: TimelineItem) => ReactNode;
}

interface Period {
  label: string;
  icon: LucideIcon;
  from: number;
  to: number;
}

const PERIODS: Period[] = [
  { label: "Madrugada", icon: Moon, from: 0, to: 5 },
  { label: "Manhã", icon: Sunrise, from: 5, to: 12 },
  { label: "Tarde", icon: Sun, from: 12, to: 18 },
  { label: "Noite", icon: Sunset, from: 18, to: 24 },
];

function hourOf(horario: string) {
  return Number(horario.split(":")[0]);
}

function NowMarker({ now }: { now: Date }) {
  const time = now.toLocaleTimeString("pt-BR", { hour: "2-digit", minute: "2-digit" });
  return (
    <li className="relative flex items-center gap-4 py-1" aria-label={`Agora, ${time}`}>
      <span className="flex w-9 shrink-0 justify-center">
        <span className="relative inline-flex h-3 w-3 rounded-full bg-brand-600 ring-4 ring-white" />
      </span>
      <span className="text-xs font-bold text-brand-600 tabular-nums">Agora, {time}</span>
      <span className="h-px flex-1 bg-gradient-to-r from-brand-300 to-transparent" />
    </li>
  );
}

export function DayTimeline({ items, now, renderRow }: DayTimelineProps) {
  const sorted = [...items].sort((a, b) => a.scheduledFor.localeCompare(b.scheduledFor));
  const nowMs = now.getTime();
  const firstFutureIndex = sorted.findIndex((item) => new Date(item.scheduledFor).getTime() > nowMs);
  const nowBeforeKey =
    firstFutureIndex === -1 ? null : `${sorted[firstFutureIndex].medicationId}-${sorted[firstFutureIndex].scheduledFor}`;

  const groups = PERIODS.map((period) => ({
    period,
    items: sorted.filter((item) => {
      const h = hourOf(item.horario);
      return h >= period.from && h < period.to;
    }),
  })).filter((group) => group.items.length > 0);

  const lastGroup = groups[groups.length - 1];

  return (
    <div className="space-y-6">
      {groups.map(({ period, items: groupItems }, gi) => {
        const Icon = period.icon;
        const done = groupItems.filter((i) => i.status === "tomado").length;
        return (
          <section
            key={period.label}
            className="animate-rise"
            style={{ animationDelay: `${0.15 + gi * 0.08}s` }}
            aria-label={period.label}
          >
            <div className="flex items-center gap-2">
              <Icon className="h-4 w-4 text-brand-500" aria-hidden="true" />
              <h3 className="text-sm font-bold text-ink-900">{period.label}</h3>
              <span className="text-xs font-medium text-ink-300 tabular-nums">
                {done}/{groupItems.length}
              </span>
            </div>
            <ul className="relative mt-1">
              {/* Trilho vertical ligando as doses */}
              <span className="absolute top-6 bottom-6 left-[17px] w-0.5 rounded-full bg-ink-900/[0.06]" aria-hidden="true" />
              {groupItems.map((item) => {
                const key = `${item.medicationId}-${item.scheduledFor}`;
                return (
                  <Fragment key={key}>
                    {key === nowBeforeKey && <NowMarker now={now} />}
                    {renderRow(item)}
                  </Fragment>
                );
              })}
              {nowBeforeKey === null && lastGroup?.period.label === period.label && <NowMarker now={now} />}
            </ul>
          </section>
        );
      })}
    </div>
  );
}
