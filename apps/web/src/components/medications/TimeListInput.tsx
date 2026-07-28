import { useState } from "react";
import { Plus, X } from "lucide-react";
import { inputClassName } from "../auth/inputClassName";

interface TimeListInputProps {
  value: string[];
  onChange: (value: string[]) => void;
}

export function TimeListInput({ value, onChange }: TimeListInputProps) {
  const [draft, setDraft] = useState("08:00");

  function addTime() {
    if (!draft || value.includes(draft)) return;
    onChange([...value, draft].sort());
  }

  function removeTime(time: string) {
    onChange(value.filter((t) => t !== time));
  }

  return (
    <div>
      <div className="flex gap-2">
        <input
          type="time"
          value={draft}
          onChange={(event) => setDraft(event.target.value)}
          className={inputClassName}
        />
        <button
          type="button"
          onClick={addTime}
          className="flex h-11 shrink-0 items-center gap-1.5 rounded-xl bg-brand-50 px-4 text-sm font-semibold text-brand-700 transition-colors hover:bg-brand-100"
        >
          <Plus className="h-4 w-4" />
          Adicionar
        </button>
      </div>

      {value.length > 0 && (
        <div className="mt-3 flex flex-wrap gap-2">
          {value.map((time) => (
            <span
              key={time}
              className="inline-flex items-center gap-1.5 rounded-full bg-ink-900/[0.05] px-3 py-1.5 text-sm font-medium text-ink-900"
            >
              {time}
              <button
                type="button"
                onClick={() => removeTime(time)}
                aria-label={`Remover horário ${time}`}
                className="text-ink-300 hover:text-red-600"
              >
                <X className="h-3.5 w-3.5" />
              </button>
            </span>
          ))}
        </div>
      )}
    </div>
  );
}
