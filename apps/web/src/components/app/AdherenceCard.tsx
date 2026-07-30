import { TrendingUp } from "lucide-react";
import { cn } from "../../lib/cn";

interface AdherenceCardProps {
  adesaoSemanal: number | null;
}

export function AdherenceCard({ adesaoSemanal }: AdherenceCardProps) {
  if (adesaoSemanal === null) return null;

  const isGood = adesaoSemanal >= 80;

  return (
    <div className="mt-6 rounded-2xl border border-ink-900/[0.06] bg-white p-5 shadow-soft sm:p-6">
      <div className="flex items-center justify-between gap-4">
        <div className="flex items-center gap-3">
          <div
            className={cn(
              "flex h-10 w-10 shrink-0 items-center justify-center rounded-xl",
              isGood ? "bg-emerald-50 text-emerald-600" : "bg-amber-50 text-amber-600",
            )}
          >
            <TrendingUp className="h-5 w-5" aria-hidden="true" />
          </div>
          <div>
            <p className="text-sm font-semibold text-ink-900">Adesão nos últimos 7 dias</p>
            <p className="text-xs text-ink-500">Doses tomadas em relação ao total programado.</p>
          </div>
        </div>
        <p className={cn("text-2xl font-bold", isGood ? "text-emerald-600" : "text-amber-600")}>
          {adesaoSemanal}%
        </p>
      </div>
      <div className="mt-4 h-2 overflow-hidden rounded-full bg-ink-900/[0.06]">
        <div
          className={cn("h-full rounded-full transition-all", isGood ? "bg-emerald-500" : "bg-amber-500")}
          style={{ width: `${Math.min(100, Math.max(0, adesaoSemanal))}%` }}
        />
      </div>
    </div>
  );
}
