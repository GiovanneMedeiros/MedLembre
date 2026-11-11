import { useEffect, useRef, useState } from "react";
import { Check, Clock3, Loader2 } from "lucide-react";
import type { TimelineItem } from "../../types/dashboard";
import { DoseStatusBadge } from "./DoseStatusBadge";
import { cn } from "../../lib/cn";
import { medicationDotClass } from "../../lib/medicationColors";

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

  // Anima só na transição para "tomado", não no carregamento inicial.
  const [justTaken, setJustTaken] = useState(false);
  const prevTaken = useRef(isTaken);
  useEffect(() => {
    if (isTaken && !prevTaken.current) {
      setJustTaken(true);
      const id = setTimeout(() => setJustTaken(false), 800);
      prevTaken.current = isTaken;
      return () => clearTimeout(id);
    }
    prevTaken.current = isTaken;
  }, [isTaken]);

  async function handleSnooze() {
    if (!onSnooze) return;
    await onSnooze();
    setJustSnoozed(true);
    setTimeout(() => setJustSnoozed(false), 4000);
  }

  return (
    <li className="relative flex items-center gap-4 py-4">
      <span className="relative shrink-0">
        {justTaken && (
          <span className="absolute inset-0 animate-ring-burst rounded-full bg-emerald-400" aria-hidden="true" />
        )}
        <button
          type="button"
          onClick={onToggle}
          disabled={isLoading}
          aria-label={isTaken ? "Desmarcar como tomado" : "Marcar como tomado"}
          className={cn(
            "relative flex h-9 w-9 touch-manipulation items-center justify-center rounded-full border-2 transition-colors duration-300 disabled:opacity-50",
            isTaken
              ? "border-emerald-500 bg-emerald-500 text-white"
              : "border-ink-900/15 bg-white text-transparent hover:border-brand-400 hover:text-brand-300",
            justTaken && "animate-check-pop",
          )}
        >
          {isLoading ? <Loader2 className="h-4 w-4 animate-spin text-ink-500" /> : <Check className="h-4 w-4" strokeWidth={3} />}
        </button>
      </span>

      {item.fotoUrl && (
        <img
          src={item.fotoUrl}
          alt=""
          width={40}
          height={40}
          loading="lazy"
          className={cn("h-10 w-10 shrink-0 rounded-xl object-cover transition-opacity", isTaken && "opacity-60")}
        />
      )}

      <div className={cn("min-w-0 flex-1 transition-opacity duration-300", isTaken && "opacity-60")}>
        <p className="flex items-center gap-2 text-sm font-semibold text-ink-900">
          {!item.fotoUrl && (
            <span className={cn("h-2 w-2 shrink-0 rounded-full", medicationDotClass(item.cor))} aria-hidden="true" />
          )}
          <span className="tabular-nums">{item.horario}</span>
          <span className="truncate">{item.nome}</span>
        </p>
        <p className="truncate text-sm text-ink-500">
          {item.dosagem}
          <span aria-live="polite">
            {justSnoozed && <span className="ml-2 text-brand-600">Lembraremos em 5 min</span>}
          </span>
        </p>
      </div>

      {canSnooze && (
        <button
          type="button"
          onClick={handleSnooze}
          disabled={isSnoozing}
          aria-label="Lembrar em 5 minutos"
          className="flex h-9 shrink-0 items-center gap-1.5 rounded-full border border-ink-900/10 px-3 text-xs font-semibold text-ink-500 transition-colors hover:border-brand-300 hover:text-brand-600 disabled:opacity-50"
        >
          <Clock3 className="h-3.5 w-3.5" aria-hidden="true" />
          <span className="hidden sm:inline">+5min</span>
        </button>
      )}

      <DoseStatusBadge status={item.status} />
    </li>
  );
}
