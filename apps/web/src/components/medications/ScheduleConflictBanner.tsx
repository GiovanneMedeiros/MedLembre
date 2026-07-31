import { AlertTriangle } from "lucide-react";
import type { ScheduleConflict } from "../../lib/scheduleConflicts";

interface ScheduleConflictBannerProps {
  conflicts: ScheduleConflict[];
}

export function ScheduleConflictBanner({ conflicts }: ScheduleConflictBannerProps) {
  if (conflicts.length === 0) return null;

  return (
    <div className="mb-6 rounded-2xl border border-amber-200 bg-amber-50 p-4 sm:p-5">
      <div className="flex items-start gap-3">
        <AlertTriangle className="mt-0.5 h-5 w-5 shrink-0 text-amber-600" aria-hidden="true" />
        <div className="min-w-0 flex-1">
          <p className="text-sm font-bold text-amber-800">Horários muito próximos</p>
          <p className="mt-0.5 text-xs text-amber-700">
            Vale revisar com o médico ou farmacêutico se está tudo certo:
          </p>
          <ul className="mt-1.5 space-y-0.5 text-sm text-amber-700">
            {conflicts.map((conflict, index) => (
              <li key={index}>
                {conflict.nomeA} ({conflict.horarioA}) e {conflict.nomeB} ({conflict.horarioB})
              </li>
            ))}
          </ul>
        </div>
      </div>
    </div>
  );
}
