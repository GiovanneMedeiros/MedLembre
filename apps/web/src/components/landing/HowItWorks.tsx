import { motion } from "motion/react";
import { Container } from "../ui/Container";
import { MaskedText } from "../motion/MaskedText";
import { Reveal } from "../motion/Reveal";
import { STEPS } from "../../data/steps";

const EXPO_OUT = [0.19, 1, 0.22, 1] as const;

export function HowItWorks() {
  return (
    <section id="como-funciona" className="scroll-mt-20 bg-cha py-20 sm:py-28">
      <Container>
        <MaskedText
          text="Pronto para usar em três passos"
          className="max-w-3xl text-4xl font-extrabold leading-tight text-ink-900 sm:text-5xl"
        />
        <Reveal delay={0.2} y={20}>
          <p className="mt-5 max-w-xl text-xl leading-relaxed text-ink-700">
            Leva uns cinco minutos. Se preferir, peça ajuda a alguém da família na primeira vez.
          </p>
        </Reveal>

        <ol className="mt-14 grid gap-12 md:grid-cols-3 md:gap-10">
          {STEPS.map((step, index) => {
            const delay = index * 0.18;
            return (
              <li key={step.title}>
                {/* linha que se desenha da esquerda para a direita */}
                <motion.span
                  aria-hidden="true"
                  className="block h-0.5 origin-left bg-ink-900/20"
                  initial={{ scaleX: 0 }}
                  whileInView={{ scaleX: 1 }}
                  viewport={{ once: true, margin: "0px 0px -10% 0px" }}
                  transition={{ duration: 1, delay, ease: EXPO_OUT }}
                />
                <motion.span
                  aria-hidden="true"
                  className="mt-6 block origin-bottom-left text-6xl font-extrabold leading-none text-brand-600"
                  initial={{ opacity: 0, scale: 0.4, y: 20 }}
                  whileInView={{ opacity: 1, scale: 1, y: 0 }}
                  viewport={{ once: true, margin: "0px 0px -10% 0px" }}
                  transition={{ type: "spring", stiffness: 260, damping: 16, delay: delay + 0.2 }}
                >
                  {index + 1}
                </motion.span>
                <Reveal delay={delay + 0.3} y={24}>
                  <h3 className="mt-5 text-2xl font-bold text-ink-900">{step.title}</h3>
                  <p className="mt-3 text-lg leading-relaxed text-ink-700">{step.description}</p>
                </Reveal>
              </li>
            );
          })}
        </ol>
      </Container>
    </section>
  );
}
