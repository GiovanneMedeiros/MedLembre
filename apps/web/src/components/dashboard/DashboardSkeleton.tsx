import { cn } from "../../lib/cn";

function Block({ className }: { className?: string }) {
  return (
    <div
      className={cn(
        "animate-shimmer bg-[length:200%_100%] bg-gradient-to-r from-ink-900/[0.04] via-ink-900/[0.08] to-ink-900/[0.04]",
        className,
      )}
    />
  );
}

export function DashboardSkeleton() {
  return (
    <div aria-busy="true" aria-label="Carregando painel">
      <div className="mt-8 grid items-center gap-8 lg:grid-cols-[minmax(0,1.25fr)_minmax(0,1fr)] lg:gap-12">
        <Block className="h-72 rounded-3xl" />
        <Block className="mx-auto aspect-square w-full max-w-[300px] rounded-full" />
      </div>
      <div className="mt-10 grid gap-6 lg:grid-cols-[minmax(0,1fr)_20rem]">
        <Block className="h-80 rounded-3xl" />
        <div className="flex flex-col gap-6">
          <Block className="h-40 rounded-3xl" />
          <Block className="h-24 rounded-3xl" />
        </div>
      </div>
    </div>
  );
}
