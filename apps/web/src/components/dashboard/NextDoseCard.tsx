import { useState, type CSSProperties } from "react";
import { Check, Clock3, Loader2, PartyPopper, PlusCircle } from "lucide-react";
import type { TimelineItem } from "../../types/dashboard";
import { Button } from "../ui/Button";
import { cn } from "../../lib/cn";
import { medicationDotClass } from "../../lib/medicationColors";

interface NextDoseCardProps {
  item: TimelineItem | null;
  totalHoje: number;
  now: Date;
  onTake: (item: TimelineItem) => void;
  onSnooze: (item: TimelineItem) => Promise<unknown>;
  isTaking: boolean;
  isSnoozing: boolean;
}

function relativeTime(scheduledFor: string, now: Date) {
  const diffMin = Math.round((new Date(scheduledFor).getTime() - now.getTime()) / 60_000);
  const abs = Math.abs(diffMin);
  const h = Math.floor(abs / 60);
  const m = abs % 60;
  const span = h > 0 ? `${h}h${m > 0 ? ` ${String(m).padStart(2, "0")}min` : ""}` : `${m} min`;

  if (diffMin > 0) return { text: `Próxima dose em ${span}`, late: false, now: false };
  if (abs <= 1) return { text: "Hora da dose", late: false, now: true };
  return { text: `Dose atrasada há ${span}`, late: true, now: false };
}

export function NextDoseCard({ item, totalHoje, now, onTake, onSnooze, isTaking, isSnoozing }: NextDoseCardProps) {
  const [snoozedKey, setSnoozedKey] = useState<string | null>(null);

  if (totalHoje === 0) {
    return (
      <div className="rounded-3xl border border-ink-900/[0.06] bg-white p-6 shadow-soft sm:p-8">
        <p className="font-heading text-xl font-bold text-ink-900">Nenhuma dose programada para hoje</p>
        <p className="mt-2 max-w-sm text-sm text-ink-500">
          Cadastre um medicamento com seus horários e o MedLembre avisa você na hora certa.
        </p>
        <Button as="link" to="/dashboard/medicamentos" size="lg" className="mt-6">
          <PlusCircle className="h-5 w-5" />
          Adicionar medicamento
        </Button>
      </div>
    );
  }

  if (!item) {
    return (
      <div className="relative overflow-hidden rounded-3xl bg-gradient-to-br from-emerald-500 to-emerald-600 p-6 text-white shadow-lift sm:p-8">
        <div className="relative h-10 w-10" aria-hidden="true">
          {Array.from({ length: 14 }, (_, i) => {
            const angle = (i / 14) * Math.PI * 2;
            const dist = 46 + (i % 3) * 14;
            return (
              <span
                key={i}
                className="absolute top-1/2 left-1/2 h-2 w-2 animate-confetti rounded-full"
                style={
                  {
                    "--dx": `${Math.cos(angle) * dist}px`,
                    "--dy": `${Math.sin(angle) * dist}px`,
                    backgroundColor: ["#fde68a", "#ffffff", "#a7f3d0", "#fecaca"][i % 4],
                    animationDelay: `${0.15 + (i % 4) * 0.04}s`,
                  } as CSSProperties
                }
              />
            );
          })}
          <PartyPopper className="relative h-10 w-10 animate-dose-pop" />
        </div>
        <p className="mt-4 font-heading text-2xl font-bold text-balance">Todas as doses de hoje foram tomadas</p>
        <p className="mt-1 text-sm text-white/80">Ótimo trabalho. Amanhã a gente lembra de novo.</p>
        <div className="absolute -right-10 -bottom-12 h-44 w-44 rounded-full border-[18px] border-white/10" aria-hidden="true" />
      </div>
    );
  }

  const key = `${item.medicationId}-${item.scheduledFor}`;
  const { text: relative, late, now: isNow } = relativeTime(item.scheduledFor, now);
  const justSnoozed = snoozedKey === key;

  async function handleSnooze() {
    if (!item) return;
    await onSnooze(item);
    setSnoozedKey(key);
    setTimeout(() => setSnoozedKey((current) => (current === key ? null : current)), 4000);
  }

  return (
    <div
      className={cn(
        "relative overflow-hidden rounded-3xl bg-gradient-to-br p-6 text-white shadow-lift sm:p-8",
        late ? "from-red-600 to-brand-800" : "from-brand-500 to-brand-700",
      )}
    >
      {/* Anéis decorativos ecoando o relógio */}
      <div className="absolute -top-16 -right-16 h-56 w-56 rounded-full border-[20px] border-white/[0.07]" aria-hidden="true" />
      <div className="absolute -top-4 -right-4 h-32 w-32 rounded-full border-[12px] border-white/[0.07]" aria-hidden="true" />

      <div key={key} className="relative animate-rise">
        <div className="flex items-center gap-2 text-sm font-medium text-white/80">
          <span className="relative flex h-2.5 w-2.5">
            {(late || isNow) && (
              <span className="absolute inline-flex h-full w-full animate-ping rounded-full bg-white/70" />
            )}
            <span className="relative inline-flex h-2.5 w-2.5 rounded-full bg-white" />
          </span>
          {relative}
        </div>

        <p className="mt-4 font-heading text-6xl font-extrabold leading-none tracking-tight tabular-nums sm:text-7xl">
          {item.horario}
        </p>

        <div className="mt-5 flex items-center gap-3">
          {item.fotoUrl ? (
            <img src={item.fotoUrl} alt="" width={48} height={48} className="h-12 w-12 shrink-0 rounded-2xl object-cover ring-2 ring-white/40" />
          ) : (
            <span className="flex h-12 w-12 shrink-0 items-center justify-center rounded-2xl bg-white/15">
              <span className={cn("h-4 w-4 rounded-full ring-2 ring-white", medicationDotClass(item.cor))} />
            </span>
          )}
          <div className="min-w-0">
            <p className="truncate text-lg font-bold">{item.nome}</p>
            <p className="truncate text-sm text-white/75">{item.dosagem}</p>
          </div>
        </div>

        <div className="mt-6 flex flex-wrap items-center gap-3">
          <button
            type="button"
            onClick={() => onTake(item)}
            disabled={isTaking}
            className="inline-flex h-12 touch-manipulation items-center gap-2 rounded-full bg-white px-6 text-base font-semibold text-brand-700 shadow-soft transition-transform duration-200 hover:-translate-y-0.5 active:translate-y-0 active:scale-[0.98] disabled:opacity-70"
          >
            {isTaking ? <Loader2 className="h-5 w-5 animate-spin" /> : <Check className="h-5 w-5" strokeWidth={2.5} />}
            Marcar como tomado
          </button>
          <button
            type="button"
            onClick={handleSnooze}
            disabled={isSnoozing}
            className="inline-flex h-12 items-center gap-2 rounded-full border border-white/30 px-5 text-sm font-semibold text-white transition-colors hover:bg-white/10 disabled:opacity-60"
          >
            {isSnoozing ? <Loader2 className="h-4 w-4 animate-spin" /> : <Clock3 className="h-4 w-4" />}
            Lembrar em 5 min
          </button>
          <span aria-live="polite" className="contents">
          {justSnoozed && (
            <span className="animate-rise text-sm text-white/85">
              Combinado, lembramos em 5 min.
            </span>
          )}
          </span>
        </div>
      </div>
    </div>
  );
}

