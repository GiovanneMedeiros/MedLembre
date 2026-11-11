import type { ReactNode } from "react";
import type { LucideIcon } from "lucide-react";

interface EmptyStateProps {
  icon: LucideIcon;
  title: string;
  description: string;
  action?: ReactNode;
  children?: ReactNode;
}

/** Tela vazia animada: ícone flutuando com uma onda pulsando em volta. */
export function EmptyState({ icon: Icon, title, description, action, children }: EmptyStateProps) {
  return (
    <div className="relative flex animate-rise flex-col items-center overflow-hidden rounded-3xl border border-dashed border-brand-200 bg-white/80 px-6 py-16 text-center shadow-soft backdrop-blur-sm">
      <div className="pointer-events-none absolute -top-24 left-1/2 h-48 w-96 -translate-x-1/2 rounded-full bg-brand-100/60 blur-3xl" aria-hidden="true" />
      <div className="relative">
        <span className="absolute inset-0 animate-ping rounded-3xl bg-brand-200/50" aria-hidden="true" />
        <span className="relative flex h-20 w-20 animate-float items-center justify-center rounded-3xl bg-gradient-to-br from-brand-500 to-brand-700 text-white shadow-lift">
          <Icon className="h-9 w-9" aria-hidden="true" />
        </span>
      </div>
      <h2 className="relative mt-7 font-heading text-xl font-bold text-balance text-ink-900">{title}</h2>
      <p className="relative mt-2 max-w-sm text-sm text-pretty text-ink-500">{description}</p>
      {children}
      {action && <div className="relative mt-7">{action}</div>}
    </div>
  );
}
