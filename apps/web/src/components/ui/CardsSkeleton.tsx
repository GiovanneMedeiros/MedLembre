import { cn } from "../../lib/cn";

/** Blocos com brilho passando, no formato da grade que vai carregar. */
export function CardsSkeleton({ count = 6, className, itemClassName }: { count?: number; className?: string; itemClassName?: string }) {
  return (
    <div className={cn("grid gap-5 sm:grid-cols-2 lg:grid-cols-3", className)} aria-busy="true" aria-label="Carregando…">
      {Array.from({ length: count }, (_, i) => (
        <div
          key={i}
          className={cn(
            "h-52 animate-shimmer rounded-3xl bg-gradient-to-r from-ink-900/[0.04] via-ink-900/[0.08] to-ink-900/[0.04] bg-[length:200%_100%]",
            itemClassName,
          )}
          style={{ animationDelay: `${i * 0.08}s` }}
        />
      ))}
    </div>
  );
}
