import { weekdayLabel } from "../../lib/date";
import { cn } from "../../lib/cn";

interface WeekdayToggleProps {
  value: number[];
  onChange: (value: number[]) => void;
}

const PRESETS: { label: string; days: number[] }[] = [
  { label: "Todos os dias", days: [0, 1, 2, 3, 4, 5, 6] },
  { label: "Dias de semana", days: [1, 2, 3, 4, 5] },
  { label: "Fins de semana", days: [0, 6] },
];

export function WeekdayToggle({ value, onChange }: WeekdayToggleProps) {
  function toggleDay(day: number) {
    if (value.includes(day)) {
      onChange(value.filter((d) => d !== day));
    } else {
      onChange([...value, day].sort((a, b) => a - b));
    }
  }

  return (
    <div>
      <div className="flex flex-wrap gap-2">
        {PRESETS.map((preset) => (
          <button
            key={preset.label}
            type="button"
            onClick={() => onChange(preset.days)}
            className="rounded-full border border-ink-900/10 px-3 py-1 text-xs font-medium text-ink-500 transition-colors hover:border-brand-300 hover:text-brand-600"
          >
            {preset.label}
          </button>
        ))}
      </div>

      <div className="mt-3 flex gap-1.5">
        {[0, 1, 2, 3, 4, 5, 6].map((day) => {
          const isActive = value.includes(day);
          return (
            <button
              key={day}
              type="button"
              onClick={() => toggleDay(day)}
              aria-pressed={isActive}
              className={cn(
                "flex h-10 w-10 items-center justify-center rounded-full text-xs font-semibold transition-colors",
                isActive ? "bg-brand-600 text-white" : "bg-ink-900/[0.04] text-ink-500 hover:bg-ink-900/[0.08]",
              )}
            >
              {weekdayLabel(day).slice(0, 3)}
            </button>
          );
        })}
      </div>
    </div>
  );
}
