import { Check } from "lucide-react";
import { cn } from "../../lib/cn";
import { MEDICATION_COLORS, medicationDotClass } from "../../lib/medicationColors";

interface ColorPickerProps {
  value: string;
  onChange: (value: string) => void;
}

export function ColorPicker({ value, onChange }: ColorPickerProps) {
  return (
    <div className="flex flex-wrap gap-2.5">
      {MEDICATION_COLORS.map((cor) => {
        const isSelected = value === cor;
        return (
          <button
            key={cor}
            type="button"
            onClick={() => onChange(cor)}
            aria-label={`Cor ${cor}`}
            aria-pressed={isSelected}
            className={cn(
              "flex h-9 w-9 items-center justify-center rounded-full transition-transform hover:scale-110",
              medicationDotClass(cor),
              isSelected && "ring-2 ring-offset-2 ring-ink-900",
            )}
          >
            {isSelected && <Check className="h-4 w-4 text-white" aria-hidden="true" />}
          </button>
        );
      })}
    </div>
  );
}
