import type { ReactNode } from "react";
import { motion } from "motion/react";

const EXPO_OUT = [0.19, 1, 0.22, 1] as const;

interface RevealProps {
  children?: ReactNode;
  className?: string;
  delay?: number;
  y?: number;
  x?: number;
  scale?: number;
  /** true: anima ao carregar. false (padrão): anima ao entrar na tela. */
  onLoad?: boolean;
  as?: "div" | "li" | "p";
}

/** Entrada suave (opacidade + deslocamento). Com "reduzir movimento", só a opacidade anima. */
export function Reveal({ children, className, delay = 0, y = 32, x = 0, scale = 1, onLoad = false, as = "div" }: RevealProps) {
  const Tag = motion[as];
  const hidden = { opacity: 0, y, x, scale };
  const shown = { opacity: 1, y: 0, x: 0, scale: 1 };

  return (
    <Tag
      className={className}
      initial={hidden}
      {...(onLoad ? { animate: shown } : { whileInView: shown, viewport: { once: true, margin: "0px 0px -10% 0px" } })}
      transition={{ duration: 0.85, delay, ease: EXPO_OUT }}
    >
      {children}
    </Tag>
  );
}
