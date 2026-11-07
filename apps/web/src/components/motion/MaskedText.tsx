import { motion, useReducedMotion, type Variants } from "motion/react";

/**
 * Título que revela palavra por palavra, cada uma subindo de dentro de uma máscara.
 * Adaptado de "Text Reveal (Mask)" (21st.dev / soralabs).
 */

const EXPO_OUT = [0.19, 1, 0.22, 1] as const;

interface MaskedTextProps {
  text: string;
  as?: "h1" | "h2" | "h3" | "p";
  className?: string;
  /** Atraso antes da primeira palavra, em segundos. */
  delay?: number;
  stagger?: number;
  /** true: anima ao carregar a página. false: anima ao entrar na tela. */
  onLoad?: boolean;
}

const word: Variants = {
  hidden: { y: "110%" },
  visible: { y: "0%", transition: { duration: 0.9, ease: EXPO_OUT } },
};

export function MaskedText({ text, as = "h2", className, delay = 0, stagger = 0.06, onLoad = false }: MaskedTextProps) {
  const reduce = useReducedMotion();
  const Tag = motion[as];
  const words = text.split(/\s+/).filter(Boolean);

  const container: Variants = {
    hidden: {},
    visible: { transition: { staggerChildren: stagger, delayChildren: delay } },
  };

  const trigger = onLoad
    ? { animate: "visible" }
    : { whileInView: "visible", viewport: { once: true, margin: "0px 0px -12% 0px" } };

  return (
    <Tag className={className} aria-label={text} initial={reduce ? false : "hidden"} variants={container} {...trigger}>
      {words.map((w, i) => (
        <span key={`${w}-${i}`} aria-hidden="true">
          <span className="-mb-[0.14em] inline-block overflow-hidden pb-[0.14em] align-bottom">
            <motion.span className="inline-block will-change-transform" variants={word}>
              {w}
            </motion.span>
          </span>
          {i < words.length - 1 ? " " : null}
        </span>
      ))}
    </Tag>
  );
}
