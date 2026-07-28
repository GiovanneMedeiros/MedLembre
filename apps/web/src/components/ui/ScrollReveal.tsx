import type { ReactNode } from "react";
import { useInView } from "../../hooks/useInView";
import { cn } from "../../lib/cn";

interface ScrollRevealProps {
  children: ReactNode;
  className?: string;
  delay?: number;
}

export function ScrollReveal({ children, className, delay = 0 }: ScrollRevealProps) {
  const { ref, isInView } = useInView<HTMLDivElement>();

  return (
    <div
      ref={ref}
      className={cn(!isInView && "opacity-0", isInView && "animate-fade-up", className)}
      style={isInView ? { animationDelay: `${delay}ms` } : undefined}
    >
      {children}
    </div>
  );
}
