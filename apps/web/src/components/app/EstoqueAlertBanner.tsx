import { PackageX } from "lucide-react";
import { Link } from "react-router-dom";
import type { EstoqueAlerta } from "../../types/dashboard";

interface EstoqueAlertBannerProps {
  alertas: EstoqueAlerta[];
}

export function EstoqueAlertBanner({ alertas }: EstoqueAlertBannerProps) {
  if (alertas.length === 0) return null;

  return (
    <div className="mt-6 rounded-2xl border border-amber-200 bg-amber-50 p-4 sm:p-5">
      <div className="flex items-start gap-3">
        <PackageX className="mt-0.5 h-5 w-5 shrink-0 text-amber-600" aria-hidden="true" />
        <div className="min-w-0 flex-1">
          <p className="text-sm font-bold text-amber-800">Estoque acabando</p>
          <ul className="mt-1 space-y-0.5 text-sm text-amber-700">
            {alertas.map((alerta) => (
              <li key={alerta.medicationId}>
                <Link to="/dashboard/medicamentos" className="hover:underline">
                  {alerta.nome}
                </Link>{" "}
                — restam {alerta.estoqueQuantidade}
              </li>
            ))}
          </ul>
        </div>
      </div>
    </div>
  );
}
