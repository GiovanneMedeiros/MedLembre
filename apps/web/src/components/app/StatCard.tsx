import type { LucideIcon } from "lucide-react";
import { cn } from "../../lib/cn";

interface StatCardProps {
  label: string;
  value: string;
  icon: LucideIcon;
  accent?: "brand" | "emerald" | "amber" | "ink";
}

const ACCENTS: Record<NonNullable<StatCardProps["accent"]>, string> = {
  brand: "bg-brand-50 text-brand-600",
  emerald: "bg-emerald-50 text-emerald-600",
  amber: "bg-amber-50 text-amber-600",
  ink: "bg-ink-900/[0.04] text-ink-700",
};

export function StatCard({ label, value, icon: Icon, accent = "brand" }: StatCardProps) {
  return (
    <div className="rounded-2xl border border-ink-900/[0.06] bg-white p-5 shadow-soft">
      <div className={cn("flex h-10 w-10 items-center justify-center rounded-xl", ACCENTS[accent])}>
        <Icon className="h-5 w-5" aria-hidden="true" />
      </div>
      <p className="mt-4 text-2xl font-bold text-ink-900">{value}</p>
      <p className="mt-0.5 text-sm text-ink-500">{label}</p>
    </div>
  );
}
