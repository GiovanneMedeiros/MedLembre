import { cn } from "../../lib/cn";

export function Logo({ className }: { className?: string }) {
  return (
    <span className={cn("inline-flex items-center gap-2", className)}>
      <img src="/icon-192.png" alt="" className="h-9 w-9" />
      <span className="font-heading text-lg font-bold tracking-tight text-ink-900">
        Med<span className="text-brand-600">Lembre</span>
      </span>
    </span>
  );
}
