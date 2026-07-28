import { Check, Loader2 } from "lucide-react";
import type { TimelineItem } from "../../types/dashboard";
import { DoseStatusBadge } from "./DoseStatusBadge";
import { cn } from "../../lib/cn";

interface TimelineRowProps {
  item: TimelineItem;
  onToggle: () => void;
  isLoading?: boolean;
}

export function TimelineRow({ item, onToggle, isLoading }: TimelineRowProps) {
  const isTaken = item.status === "tomado";

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
        <p className="truncate text-sm text-ink-500">{item.dosagem}</p>
      </div>

      <DoseStatusBadge status={item.status} />
    </li>
  );
}
