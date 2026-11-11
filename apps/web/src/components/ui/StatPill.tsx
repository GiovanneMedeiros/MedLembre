import type { LucideIcon } from "lucide-react";
import { useCountUp } from "../../hooks/useCountUp";
import { cn } from "../../lib/cn";

interface StatPillProps {
  icon: LucideIcon;
  value: number;
  label: string;
  tone?: "brand" | "emerald" | "amber" | "ink";
  delay?: number;
}

const TONES = {
  brand: "bg-brand-50 text-brand-600",
  emerald: "bg-emerald-50 text-emerald-600",
  amber: "bg-amber-50 text-amber-600",
  ink: "bg-ink-900/[0.05] text-ink-500",
};

/** Indicador compacto com número que conta até o valor. */
export function StatPill({ icon: Icon, value, label, tone = "brand", delay = 0 }: StatPillProps) {
  const animated = useCountUp(value, 900);
  return (
    <div
      className="flex animate-rise items-center gap-3 rounded-2xl border border-ink-900/[0.06] bg-white/90 px-4 py-3 shadow-soft backdrop-blur-sm"
      style={{ animationDelay: `${delay}s` }}
    >
      <span className={cn("flex h-10 w-10 shrink-0 items-center justify-center rounded-xl", TONES[tone])}>
        <Icon className="h-5 w-5" aria-hidden="true" />
      </span>
      <div className="min-w-0">
        <p className="font-heading text-2xl leading-none font-extrabold text-ink-900 tabular-nums">{animated}</p>
        <p className="mt-1 truncate text-xs font-medium text-ink-500">{label}</p>
      </div>
    </div>
  );
}
