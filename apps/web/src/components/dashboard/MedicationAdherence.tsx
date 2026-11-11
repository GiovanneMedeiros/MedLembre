import { useEffect, useState } from "react";
import { Link } from "react-router-dom";
import { AlarmClockOff, ChevronRight, Pill } from "lucide-react";
import type { MedicationAdherence as MedAdherence, MissedSlot } from "../../hooks/useAdherenceHistory";
import { medicationHex } from "../../lib/medicationColors";

interface MedicationAdherenceProps {
  items: MedAdherence[];
  mostMissed: MissedSlot | null;
  totalCadastrados: number;
}

export function MedicationAdherence({ items, mostMissed, totalCadastrados }: MedicationAdherenceProps) {
  const [grown, setGrown] = useState(false);
  useEffect(() => {
    const id = requestAnimationFrame(() => setGrown(true));
    return () => cancelAnimationFrame(id);
  }, []);

  return (
    <div className="rounded-3xl border border-ink-900/[0.06] bg-white p-5 shadow-soft sm:p-6">
      <div className="flex items-center justify-between gap-3">
        <div className="flex items-center gap-2 text-sm font-semibold text-ink-900">
          <Pill className="h-4 w-4 text-brand-600" aria-hidden="true" />
          Por medicamento
        </div>
        <Link
          to="/dashboard/medicamentos"
          className="group inline-flex items-center gap-0.5 rounded-full px-2 py-1 text-xs font-semibold text-brand-600 transition-colors hover:bg-brand-50"
        >
          Ver todos ({totalCadastrados})
          <ChevronRight className="h-3.5 w-3.5 transition-transform group-hover:translate-x-0.5" aria-hidden="true" />
        </Link>
      </div>
      <p className="mt-1 text-xs text-ink-500">Doses tomadas nos últimos 7 dias.</p>

      {items.length === 0 ? (
        <p className="mt-4 text-sm text-ink-500">Ainda não há doses registradas nesta semana.</p>
      ) : (
        <ul className="mt-4 space-y-3.5">
          {items.map((med, i) => (
            <li key={med.medicationId}>
              <div className="flex items-center justify-between gap-3 text-sm">
                <span className="flex min-w-0 items-center gap-2">
                  <span
                    className="h-2.5 w-2.5 shrink-0 rounded-full"
                    style={{ backgroundColor: medicationHex(med.cor) }}
                    aria-hidden="true"
                  />
                  <span className="truncate font-medium text-ink-900">{med.nome}</span>
                </span>
                <span className="shrink-0 text-xs font-semibold text-ink-500 tabular-nums">
                  {med.taken}/{med.total}
                  <span className="ml-1.5 text-ink-900">{med.pct}%</span>
                </span>
              </div>
              <div
                className="mt-1.5 h-2 overflow-hidden rounded-full bg-ink-900/[0.06]"
                role="progressbar"
                aria-label={`${med.nome}: ${med.pct}% das doses tomadas`}
                aria-valuenow={med.pct}
                aria-valuemin={0}
                aria-valuemax={100}
              >
                <div
                  className="h-full rounded-full transition-[width] duration-700 ease-out"
                  style={{
                    width: grown ? `${Math.max(med.pct, 2)}%` : "0%",
                    backgroundColor: medicationHex(med.cor),
                    transitionDelay: `${i * 60}ms`,
                  }}
                />
              </div>
            </li>
          ))}
        </ul>
      )}

      {mostMissed && (
        <div className="mt-5 flex gap-3 rounded-2xl bg-brand-50 p-3.5">
          <AlarmClockOff className="mt-0.5 h-4 w-4 shrink-0 text-brand-600" aria-hidden="true" />
          <p className="text-sm text-pretty text-brand-900">
            A dose das <strong className="tabular-nums">{mostMissed.horario}</strong> foi esquecida{" "}
            {mostMissed.missed} vezes nesta semana.{" "}
            <Link to="/dashboard/configuracoes" className="font-semibold text-brand-700 underline-offset-2 hover:underline">
              Revisar lembretes
            </Link>
          </p>
        </div>
      )}
    </div>
  );
}
