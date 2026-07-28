import type { ReactNode } from "react";
import { cn } from "../../lib/cn";

interface SegmentedToggleProps {
  options: { value: string; label: ReactNode }[];
  value: string;
  onChange: (value: string) => void;
  className?: string;
}

export function SegmentedToggle({ options, value, onChange, className }: SegmentedToggleProps) {
  return (
    <div
      role="tablist"
      className={cn("inline-flex items-center gap-1 rounded-full border border-ink-900/[0.06] bg-white p-1 shadow-soft", className)}
    >
      {options.map((option) => {
        const isActive = option.value === value;
        return (
          <button
            key={option.value}
            type="button"
            role="tab"
            aria-selected={isActive}
            onClick={() => onChange(option.value)}
            className={cn(
              "relative rounded-full px-4 py-2 text-sm font-semibold transition-colors duration-200",
              isActive ? "bg-brand-600 text-white shadow-soft" : "text-ink-500 hover:text-ink-900",
            )}
          >
            {option.label}
          </button>
        );
      })}
    </div>
  );
}
