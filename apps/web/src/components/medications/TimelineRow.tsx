import { useState } from "react";
import { Check, Clock3, Loader2 } from "lucide-react";
import type { TimelineItem } from "../../types/dashboard";
import { DoseStatusBadge } from "./DoseStatusBadge";
import { cn } from "../../lib/cn";

interface TimelineRowProps {
  item: TimelineItem;
  onToggle: () => void;
  isLoading?: boolean;
  onSnooze?: () => Promise<unknown>;
  isSnoozing?: boolean;
}

const SNOOZABLE_STATUSES = new Set(["pendente", "atrasado", "proximo"]);

export function TimelineRow({ item, onToggle, isLoading, onSnooze, isSnoozing }: TimelineRowProps) {
  const isTaken = item.status === "tomado";
  const canSnooze = Boolean(onSnooze) && SNOOZABLE_STATUSES.has(item.status);
  const [justSnoozed, setJustSnoozed] = useState(false);

  async function handleSnooze() {
    if (!onSnooze) return;
    await onSnooze();
    setJustSnoozed(true);
    setTimeout(() => setJustSnoozed(false), 4000);
  }

  return (
    <li className="flex items-center gap-4 py-4">
      <button
        type="button"
        onClick={onToggle}
        disabled={isLoading}
        aria-label={isTaken ? "Desmarcar como tomado" : "Marcar como tomado"}
        className={cn(
          "flex h-9 w-9 shrink-0 items-center justify-center rounded-full border-2 transition-colors disabled:opacity-50",
          isTaken
            ? "border-emerald-500 bg-emerald-500 text-white"
            : "border-ink-900/15 text-transparent hover:border-brand-400",
        )}
      >
        {isLoading ? <Loader2 className="h-4 w-4 animate-spin text-ink-500" /> : <Check className="h-4 w-4" />}
      </button>

      <div className="min-w-0 flex-1">
        <p className="text-sm font-semibold text-ink-900">
          {item.horario} · {item.nome}
        </p>
        <p className="truncate text-sm text-ink-500">
          {item.dosagem}
          {justSnoozed && <span className="ml-2 text-brand-600">· Lembraremos em 5 min</span>}
        </p>
      </div>

      {canSnooze && (
        <button
          type="button"
          onClick={handleSnooze}
          disabled={isSnoozing}
          className="flex h-9 shrink-0 items-center gap-1.5 rounded-full border border-ink-900/10 px-3 text-xs font-semibold text-ink-500 transition-colors hover:border-brand-300 hover:text-brand-600 disabled:opacity-50"
        >
          <Clock3 className="h-3.5 w-3.5" aria-hidden="true" />
          +5min
        </button>
      )}

      <DoseStatusBadge status={item.status} />
    </li>
  );
}
