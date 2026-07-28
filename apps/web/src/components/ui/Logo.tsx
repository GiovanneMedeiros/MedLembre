import { cn } from "../../lib/cn";

export function Logo({ className }: { className?: string }) {
  return (
    <span className={cn("inline-flex items-center gap-2", className)}>
      <span className="flex h-9 w-9 items-center justify-center rounded-xl bg-gradient-to-b from-brand-500 to-brand-700 shadow-soft">
        <svg viewBox="0 0 24 24" className="h-5 w-5" fill="none" aria-hidden="true">
          <path
            d="M12 3v18M4.5 12c0-2.5 1-4 3.5-4h8c2.5 0 3.5 1.5 3.5 4s-1 4-3.5 4H8c-2.5 0-3.5-1.5-3.5-4Z"
            stroke="white"
            strokeWidth="1.8"
            strokeLinecap="round"
            strokeLinejoin="round"
          />
        </svg>
      </span>
      <span className="font-heading text-lg font-bold tracking-tight text-ink-900">
        Med<span className="text-brand-600">Lembre</span>
      </span>
    </span>
  );
}
