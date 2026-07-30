import { Clock, MoreVertical, Pause, Pencil, Play, Trash2 } from "lucide-react";
import { useState } from "react";
import { MedicationStatusBadge } from "./MedicationStatusBadge";
import type { Medication } from "../../types/medication";
import { formatDateBR, formatDiasSemana } from "../../lib/date";
import { cn } from "../../lib/cn";
import { medicationDotClass } from "../../lib/medicationColors";

interface MedicationCardProps {
  medication: Medication;
  onEdit: () => void;
  onDelete: () => void;
  onToggleStatus: () => void;
  isTogglingStatus?: boolean;
}

export function MedicationCard({ medication, onEdit, onDelete, onToggleStatus, isTogglingStatus }: MedicationCardProps) {
  const [isMenuOpen, setIsMenuOpen] = useState(false);
  const isActive = medication.status === "ATIVO";

  return (
    <div
      className={cn(
        "relative rounded-2xl border bg-white p-5 shadow-soft transition-opacity",
        isActive ? "border-ink-900/[0.06]" : "border-ink-900/[0.06] opacity-70",
      )}
    >
      <div className="flex items-start justify-between gap-3">
        <div className="flex min-w-0 items-start gap-2.5">
          <span
            className={cn("mt-1.5 h-2.5 w-2.5 shrink-0 rounded-full", medicationDotClass(medication.cor))}
            aria-hidden="true"
          />
          <div className="min-w-0">
            <h3 className="truncate text-base font-bold text-ink-900">{medication.nome}</h3>
            <p className="text-sm text-ink-500">{medication.dosagem}</p>
          </div>
        </div>

        <div className="relative shrink-0">
          <button
            type="button"
            onClick={() => setIsMenuOpen((open) => !open)}
            aria-label="Mais opções"
            className="flex h-8 w-8 items-center justify-center rounded-lg text-ink-300 hover:bg-ink-900/[0.04] hover:text-ink-900"
          >
            <MoreVertical className="h-4 w-4" />
          </button>

          {isMenuOpen && (
            <>
              <div className="fixed inset-0 z-10" onClick={() => setIsMenuOpen(false)} />
              <div className="absolute right-0 top-9 z-20 w-44 overflow-hidden rounded-xl border border-ink-900/[0.06] bg-white py-1 shadow-lift">
                <button
                  type="button"
                  onClick={() => {
                    setIsMenuOpen(false);
                    onEdit();
                  }}
                  className="flex w-full items-center gap-2.5 px-4 py-2.5 text-left text-sm text-ink-700 hover:bg-ink-900/[0.03]"
                >
                  <Pencil className="h-4 w-4" />
                  Editar
                </button>
                <button
                  type="button"
                  disabled={isTogglingStatus}
                  onClick={() => {
                    setIsMenuOpen(false);
                    onToggleStatus();
                  }}
                  className="flex w-full items-center gap-2.5 px-4 py-2.5 text-left text-sm text-ink-700 hover:bg-ink-900/[0.03] disabled:opacity-50"
                >
                  {isActive ? <Pause className="h-4 w-4" /> : <Play className="h-4 w-4" />}
                  {isActive ? "Pausar" : "Ativar"}
                </button>
                <button
                  type="button"
                  onClick={() => {
                    setIsMenuOpen(false);
                    onDelete();
                  }}
                  className="flex w-full items-center gap-2.5 px-4 py-2.5 text-left text-sm text-red-600 hover:bg-red-50"
                >
                  <Trash2 className="h-4 w-4" />
                  Excluir
                </button>
              </div>
            </>
          )}
        </div>
      </div>

      {medication.observacao && <p className="mt-3 text-sm text-ink-500">{medication.observacao}</p>}

      <div className="mt-4 flex items-center gap-1.5 text-sm text-ink-700">
        <Clock className="h-4 w-4 text-brand-500" aria-hidden="true" />
        {medication.horarios.join(" · ")}
      </div>
      <p className="mt-1 text-xs text-ink-300">{formatDiasSemana(medication.diasSemana)}</p>

      <div className="mt-4 flex items-center justify-between border-t border-ink-900/[0.06] pt-4">
        <p className="text-xs text-ink-300">
          Desde {formatDateBR(medication.dataInicio.slice(0, 10))}
          {medication.dataFim && ` até ${formatDateBR(medication.dataFim.slice(0, 10))}`}
        </p>
        <MedicationStatusBadge status={medication.status} />
      </div>
    </div>
  );
}
