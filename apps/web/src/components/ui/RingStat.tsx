import { useEffect, useState } from "react";
import { useCountUp } from "../../hooks/useCountUp";

interface RingStatProps {
  pct: number | null;
  label: string;
  delay?: number;
}

/** Indicador com anel que enche até a porcentagem. */
export function RingStat({ pct, label, delay = 0 }: RingStatProps) {
  const value = pct ?? 0;
  const animated = useCountUp(value, 1100);
  const [filled, setFilled] = useState(false);
  const r = 17;
  const len = 2 * Math.PI * r;
  const good = value >= 80;

  useEffect(() => {
    const id = requestAnimationFrame(() => setFilled(true));
    return () => cancelAnimationFrame(id);
  }, []);

  return (
    <div
      className="flex animate-rise items-center gap-3 rounded-2xl border border-ink-900/[0.06] bg-white/90 px-4 py-3 shadow-soft backdrop-blur-sm"
      style={{ animationDelay: `${delay}s` }}
    >
      <svg width="44" height="44" viewBox="0 0 44 44" className="shrink-0 -rotate-90" aria-hidden="true">
        <circle cx="22" cy="22" r={r} fill="none" stroke="var(--color-ink-900)" strokeOpacity="0.06" strokeWidth="5" />
        {value > 0 && (
        <circle
          cx="22"
          cy="22"
          r={r}
          fill="none"
          stroke={good ? "var(--color-emerald-500)" : "var(--color-amber-500)"}
          strokeWidth="5"
          strokeLinecap="round"
          strokeDasharray={`${filled ? (value / 100) * len : 0} ${len}`}
          className="transition-[stroke-dasharray] duration-1000 ease-out"
        />
        )}
      </svg>
      <div className="min-w-0">
        <p className="font-heading text-2xl leading-none font-extrabold text-ink-900 tabular-nums">
          {pct === null ? "–" : `${animated}%`}
        </p>
        <p className="mt-1 truncate text-xs font-medium text-ink-500">{label}</p>
      </div>
    </div>
  );
}
