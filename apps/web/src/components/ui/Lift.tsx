import type { ReactNode } from "react";
import { cn } from "../../lib/cn";

/**
 * Faz o card "levantar" no hover. Fica separado da animação de entrada
 * (que também usa transform) para uma não anular a outra.
 */
export function Lift({ children, className }: { children: ReactNode; className?: string }) {
  return (
    <div
      className={cn(
        "relative h-full rounded-3xl transition-[transform,box-shadow] hover:z-10 focus-within:z-10 duration-300 ease-out hover:-translate-y-1 hover:shadow-lift",
        className,
      )}
    >
      {children}
    </div>
  );
}
