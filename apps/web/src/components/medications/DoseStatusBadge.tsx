import { AlarmClock, Check, Clock, TriangleAlert } from "lucide-react";
import type { DoseStatus } from "../../types/dashboard";
import { cn } from "../../lib/cn";

const CONFIG: Record<DoseStatus, { label: string; className: string; icon: typeof Check }> = {
  tomado: { label: "Tomado", className: "bg-emerald-50 text-emerald-700", icon: Check },
  proximo: { label: "Próximo", className: "bg-sky-50 text-sky-700", icon: AlarmClock },
  pendente: { label: "Pendente", className: "bg-amber-50 text-amber-700", icon: Clock },
  atrasado: { label: "Atrasado", className: "bg-red-50 text-red-700", icon: TriangleAlert },
};

export function DoseStatusBadge({ status }: { status: DoseStatus }) {
  const { label, className, icon: Icon } = CONFIG[status];

  return (
    <span className={cn("inline-flex items-center gap-1.5 rounded-full px-2.5 py-1 text-xs font-semibold", className)}>
      <Icon className="h-3.5 w-3.5" aria-hidden="true" />
      {label}
    </span>
  );
}
