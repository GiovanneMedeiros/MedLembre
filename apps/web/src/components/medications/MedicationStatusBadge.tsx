import type { MedicationStatus } from "../../types/medication";
import { cn } from "../../lib/cn";

export function MedicationStatusBadge({ status }: { status: MedicationStatus }) {
  const isActive = status === "ATIVO";

  return (
    <span
      className={cn(
        "inline-flex items-center gap-1.5 rounded-full px-2.5 py-1 text-xs font-semibold",
        isActive ? "bg-emerald-50 text-emerald-700" : "bg-ink-900/[0.05] text-ink-500",
      )}
    >
      <span className={cn("h-1.5 w-1.5 rounded-full", isActive ? "bg-emerald-500" : "bg-ink-300")} />
      {isActive ? "Ativo" : "Pausado"}
    </span>
  );
}
