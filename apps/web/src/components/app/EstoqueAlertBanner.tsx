import { PackageX } from "lucide-react";
import { Link } from "react-router-dom";
import type { EstoqueAlerta } from "../../types/dashboard";
import { cn } from "../../lib/cn";

interface EstoqueAlertBannerProps {
  alertas: EstoqueAlerta[];
  className?: string;
}

export function EstoqueAlertBanner({ alertas, className }: EstoqueAlertBannerProps) {
  if (alertas.length === 0) return null;

  return (
    <div className={cn("rounded-3xl border border-amber-200 bg-amber-50 p-5 sm:p-6", className)}>
      <div className="flex items-center gap-2">
        <PackageX className="h-4 w-4 shrink-0 text-amber-600" aria-hidden="true" />
        <p className="text-sm font-bold text-amber-900">Estoque acabando</p>
      </div>
      <ul className="mt-3 space-y-2">
        {alertas.map((alerta) => (
          <li key={alerta.medicationId}>
            <Link
              to="/dashboard/medicamentos"
              className="flex items-center justify-between gap-3 rounded-xl bg-white/70 px-3 py-2 text-sm text-amber-900 transition-colors hover:bg-white"
            >
              <span className="truncate font-medium">{alerta.nome}</span>
              <span className="shrink-0 rounded-full bg-amber-100 px-2 py-0.5 text-xs font-semibold text-amber-800 tabular-nums">
                {alerta.estoqueQuantidade === 1 ? "resta 1" : `restam ${alerta.estoqueQuantidade}`}
              </span>
            </Link>
          </li>
        ))}
      </ul>
    </div>
  );
}
