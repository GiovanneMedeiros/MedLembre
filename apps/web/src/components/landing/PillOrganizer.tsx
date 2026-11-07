import { Check, Moon, Sun } from "lucide-react";
import { cn } from "../../lib/cn";

const DAYS = ["Dom", "Seg", "Ter", "Qua", "Qui", "Sex", "Sáb"];
const TODAY = 2;

type Period = "manha" | "noite";

const PERIOD_STYLE: Record<Period, { lid: string; done: string; doneIcon: string }> = {
  manha: { lid: "bg-manha", done: "bg-manha-soft", doneIcon: "text-[#9a6a12]" },
  noite: { lid: "bg-noite", done: "bg-noite-soft", doneIcon: "text-noite" },
};

/**
 * Porta-comprimidos semanal ilustrado. Dias anteriores aparecem já tomados,
 * a tampa de hoje (manhã) abre ao carregar a página. Decorativo: aria-hidden.
 */
export function PillOrganizer({ size = "lg", className }: { size?: "lg" | "sm"; className?: string }) {
  const isLarge = size === "lg";

  return (
    <div
      aria-hidden="true"
      className={cn(
        "select-none rounded-[1.75rem] border-2 border-ink-900/10 bg-white shadow-[0_32px_64px_-32px_rgba(94,24,21,0.45)]",
        isLarge ? "p-3 sm:p-5" : "p-3 sm:p-4",
        className,
      )}
    >
      <div className={cn("grid grid-cols-[auto_repeat(7,minmax(0,1fr))]", isLarge ? "gap-1.5 sm:gap-2.5" : "gap-1.5")}>
        <span />
        {DAYS.map((day, index) => (
          <span
            key={day}
            className={cn(
              "pb-1 text-center font-bold",
              isLarge ? "text-xs sm:text-sm" : "text-xs",
              index === TODAY ? "text-brand-700" : "text-ink-500",
            )}
          >
            {day}
          </span>
        ))}

        <Row period="manha" isLarge={isLarge} />
        <Row period="noite" isLarge={isLarge} />
      </div>
    </div>
  );
}

function Row({ period, isLarge }: { period: Period; isLarge: boolean }) {
  const Icon = period === "manha" ? Sun : Moon;

  return (
    <>
      <span className="flex items-center pr-1 text-ink-500">
        <Icon className={isLarge ? "h-4 w-4 sm:h-5 sm:w-5" : "h-4 w-4"} strokeWidth={2} />
      </span>
      {DAYS.map((day, index) => {
        const state = index < TODAY ? "done" : index === TODAY && period === "manha" ? "open" : "closed";
        return <Compartment key={day} period={period} state={state} isLarge={isLarge} />;
      })}
    </>
  );
}

function Compartment({
  period,
  state,
  isLarge,
}: {
  period: Period;
  state: "done" | "open" | "closed";
  isLarge: boolean;
}) {
  const style = PERIOD_STYLE[period];

  if (state === "done") {
    return (
      <div className={cn("flex aspect-[4/5] items-center justify-center rounded-xl", style.done)}>
        <Check className={cn(isLarge ? "h-4 w-4 sm:h-5 sm:w-5" : "h-4 w-4", style.doneIcon)} strokeWidth={3} />
      </div>
    );
  }

  if (state === "open") {
    return (
      <div className="relative aspect-[4/5] overflow-hidden rounded-xl bg-cha ring-2 ring-brand-600 ring-offset-2 ring-offset-white">
        <div className="absolute inset-0 flex flex-col items-center justify-center gap-1 sm:gap-1.5">
          {/* cápsula bicolor + comprimido redondo */}
          <span className="h-[18%] w-[62%] rounded-full bg-[linear-gradient(90deg,var(--color-brand-600)_50%,#fff_50%)] shadow-[0_1px_2px_rgba(0,0,0,0.25)]" />
          <span className="aspect-square w-[34%] rounded-full bg-white shadow-[0_1px_2px_rgba(0,0,0,0.25)]" />
        </div>
        <div className={cn("animate-lid-open absolute inset-0 rounded-xl", style.lid)}>
          <LidTab />
        </div>
      </div>
    );
  }

  return (
    <div className={cn("relative aspect-[4/5] rounded-xl", style.lid)}>
      <LidTab />
    </div>
  );
}

function LidTab() {
  return <span className="absolute bottom-[12%] left-1/2 h-[6%] w-[40%] -translate-x-1/2 rounded-full bg-white/45" />;
}
