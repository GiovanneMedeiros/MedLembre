import { AlertTriangle, Clock, MoreVertical, Package, Pause, Pencil, Pill, Play, Trash2 } from "lucide-react";
import { useEffect, useState } from "react";
import { MedicationStatusBadge } from "./MedicationStatusBadge";
import type { Medication } from "../../types/medication";
import { formatDateBR, formatDiasSemana } from "../../lib/date";
import { cn } from "../../lib/cn";
import { medicationHex } from "../../lib/medicationColors";

interface MedicationCardProps {
  medication: Medication;
  onEdit: () => void;
  onDelete: () => void;
  onToggleStatus: () => void;
  isTogglingStatus?: boolean;
}

const WEEK_LETTERS = ["D", "S", "T", "Q", "Q", "S", "S"];

export function MedicationCard({ medication, onEdit, onDelete, onToggleStatus, isTogglingStatus }: MedicationCardProps) {
  const [isMenuOpen, setIsMenuOpen] = useState(false);
  const [grown, setGrown] = useState(false);
  const isActive = medication.status === "ATIVO";
  const color = medicationHex(medication.cor);

  const hasStock = medication.estoqueQuantidade !== null;
  const estoqueBaixo =
    medication.estoqueQuantidade !== null &&
    medication.estoqueAlertaLimiar !== null &&
    medication.estoqueQuantidade <= medication.estoqueAlertaLimiar;
  // Barra de estoque: cheia quando há 4x o limite de alerta (ou 30 unidades sem limite).
  const stockRef = Math.max((medication.estoqueAlertaLimiar ?? 0) * 4, 30);
  const stockPct = hasStock ? Math.min(100, Math.round(((medication.estoqueQuantidade ?? 0) / stockRef) * 100)) : 0;

  useEffect(() => {
    const id = requestAnimationFrame(() => setGrown(true));
    return () => cancelAnimationFrame(id);
  }, []);

  return (
    <div
      className={cn(
        "relative flex h-full flex-col rounded-3xl border border-ink-900/[0.06] bg-white shadow-soft transition-[opacity,filter] duration-300",
        !isActive && "opacity-75 saturate-50",
      )}
    >
      {/* Faixa na cor do medicamento */}
      <div className="h-1.5 w-full rounded-t-[1.4rem]" style={{ background: `linear-gradient(90deg, ${color}, ${color}66)` }} aria-hidden="true" />

      <div className="flex flex-1 flex-col p-5 sm:p-6">
        <div className="flex items-start justify-between gap-3">
          <div className="flex min-w-0 items-center gap-3.5">
            {medication.fotoUrl ? (
              <img
                src={medication.fotoUrl}
                alt=""
                width={48}
                height={48}
                loading="lazy"
                className="h-12 w-12 shrink-0 rounded-2xl object-cover ring-2 ring-white shadow-soft"
              />
            ) : (
              <span
                className="flex h-12 w-12 shrink-0 items-center justify-center rounded-2xl text-white shadow-soft"
                style={{ background: `linear-gradient(135deg, ${color}, ${color}cc)` }}
                aria-hidden="true"
              >
                <Pill className="h-5 w-5 rotate-45" />
              </span>
            )}
            <div className="min-w-0">
              <h3 className="truncate font-heading text-lg font-bold text-ink-900">{medication.nome}</h3>
              <p className="truncate text-sm text-ink-500">{medication.dosagem}</p>
            </div>
          </div>

          <div className="relative shrink-0">
            <button
              type="button"
              onClick={() => setIsMenuOpen((open) => !open)}
              aria-label={`Mais opções para ${medication.nome}`}
              aria-expanded={isMenuOpen}
              className="flex h-9 w-9 items-center justify-center rounded-xl text-ink-300 transition-colors hover:bg-ink-900/[0.05] hover:text-ink-900"
            >
              <MoreVertical className="h-4 w-4" aria-hidden="true" />
            </button>

            {isMenuOpen && (
              <>
                <div className="fixed inset-0 z-10" onClick={() => setIsMenuOpen(false)} aria-hidden="true" />
                <div
                  className="absolute top-10 right-0 z-20 w-44 origin-top-right animate-rise overflow-hidden rounded-2xl border border-ink-900/[0.06] bg-white py-1.5 shadow-lift"
                  style={{ animationDuration: "0.2s" }}
                >
                  <button
                    type="button"
                    onClick={() => {
                      setIsMenuOpen(false);
                      onEdit();
                    }}
                    className="flex w-full items-center gap-2.5 px-4 py-2.5 text-left text-sm text-ink-700 transition-colors hover:bg-ink-900/[0.04]"
                  >
                    <Pencil className="h-4 w-4" aria-hidden="true" />
                    Editar
                  </button>
                  <button
                    type="button"
                    disabled={isTogglingStatus}
                    onClick={() => {
                      setIsMenuOpen(false);
                      onToggleStatus();
                    }}
                    className="flex w-full items-center gap-2.5 px-4 py-2.5 text-left text-sm text-ink-700 transition-colors hover:bg-ink-900/[0.04] disabled:opacity-50"
                  >
                    {isActive ? <Pause className="h-4 w-4" aria-hidden="true" /> : <Play className="h-4 w-4" aria-hidden="true" />}
                    {isActive ? "Pausar" : "Ativar"}
                  </button>
                  <button
                    type="button"
                    onClick={() => {
                      setIsMenuOpen(false);
                      onDelete();
                    }}
                    className="flex w-full items-center gap-2.5 px-4 py-2.5 text-left text-sm text-red-600 transition-colors hover:bg-red-50"
                  >
                    <Trash2 className="h-4 w-4" aria-hidden="true" />
                    Excluir
                  </button>
                </div>
              </>
            )}
          </div>
        </div>

        {medication.observacao && (
          <p className="mt-3 line-clamp-2 text-sm text-pretty text-ink-500">{medication.observacao}</p>
        )}

        {/* Horários */}
        <ul className="mt-4 flex flex-wrap gap-1.5" aria-label="Horários">
          {medication.horarios.map((horario, i) => (
            <li
              key={horario}
              className="inline-flex animate-dose-pop items-center gap-1.5 rounded-full bg-ink-900/[0.04] px-3 py-1.5 text-sm font-semibold text-ink-900 tabular-nums"
              style={{ animationDelay: `${0.15 + i * 0.06}s` }}
            >
              {i === 0 && <Clock className="h-3.5 w-3.5" style={{ color }} aria-hidden="true" />}
              {horario}
            </li>
          ))}
        </ul>

        {/* Dias da semana */}
        <div className="mt-3 flex items-center gap-1" aria-label={formatDiasSemana(medication.diasSemana)}>
          {WEEK_LETTERS.map((letter, day) => {
            const on = medication.diasSemana.includes(day);
            return (
              <span
                key={day}
                aria-hidden="true"
                className={cn(
                  "flex h-6 w-6 items-center justify-center rounded-full text-[10px] font-bold transition-colors",
                  on ? "text-white" : "bg-ink-900/[0.04] text-ink-300",
                )}
                style={on ? { backgroundColor: color } : undefined}
              >
                {letter}
              </span>
            );
          })}
          <span className="ml-1.5 truncate text-xs text-ink-500">{formatDiasSemana(medication.diasSemana)}</span>
        </div>

        {/* Estoque */}
        {hasStock && (
          <div className="mt-4">
            <div className="flex items-center justify-between text-xs">
              <span className={cn("flex items-center gap-1.5 font-semibold", estoqueBaixo ? "text-amber-700" : "text-ink-500")}>
                {estoqueBaixo ? (
                  <AlertTriangle className="h-3.5 w-3.5" aria-hidden="true" />
                ) : (
                  <Package className="h-3.5 w-3.5" aria-hidden="true" />
                )}
                {estoqueBaixo ? "Estoque baixo" : "Estoque"}
              </span>
              <span className="font-semibold text-ink-900 tabular-nums">
                {medication.estoqueQuantidade === 1 ? "resta 1" : `restam ${medication.estoqueQuantidade}`}
              </span>
            </div>
            <div
              className="mt-1.5 h-1.5 overflow-hidden rounded-full bg-ink-900/[0.06]"
              role="progressbar"
              aria-label="Estoque"
              aria-valuenow={medication.estoqueQuantidade ?? 0}
              aria-valuemin={0}
              aria-valuemax={stockRef}
            >
              <div
                className={cn(
                  "h-full rounded-full transition-[width] duration-1000 ease-out",
                  estoqueBaixo ? "bg-amber-500" : "bg-emerald-500",
                )}
                style={{ width: grown ? `${Math.max(stockPct, 3)}%` : "0%" }}
              />
            </div>
          </div>
        )}

        <div className="mt-auto pt-5">
        <div className="flex items-center justify-between gap-3 border-t border-ink-900/[0.06] pt-4">
          <p className="truncate text-xs text-ink-300">
            Desde {formatDateBR(medication.dataInicio.slice(0, 10))}
            {medication.dataFim && ` até ${formatDateBR(medication.dataFim.slice(0, 10))}`}
          </p>
          <MedicationStatusBadge status={medication.status} />
        </div>
        </div>
      </div>
    </div>
  );
}
