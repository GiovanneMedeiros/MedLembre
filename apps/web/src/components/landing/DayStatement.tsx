import { Fragment, useRef } from "react";
import { motion, useReducedMotion, useScroll, useTransform, type MotionValue } from "motion/react";
import { Container } from "../ui/Container";

/**
 * Seção "um dia inteiro": ao rolar, o céu vai da manhã à noite, o relógio avança
 * e a frase acende palavra por palavra. Baseado em "Scroll word reveal" (21st.dev / Motion).
 */

const TEXT =
  "Esquecer um remédio acontece com qualquer pessoa. O MedLembre lembra por você, do café da manhã até a hora de dormir.";
const WORDS = TEXT.split(" ");
const REST_OPACITY = 0.18;
const REVEAL_SPAN = 0.75;
const WORD_WINDOW = 0.12;

// estrelas em posições fixas (determinísticas) para não mudar a cada render
const STARS = Array.from({ length: 46 }, (_, i) => ({
  left: (i * 37.3) % 100,
  top: (i * 53.7) % 62,
  size: i % 5 === 0 ? 3 : 2,
  delay: (i % 7) * 0.45,
}));

function toClock(progress: number) {
  const minutes = 7 * 60 + Math.round((progress * 15 * 60) / 15) * 15; // 07:00 → 22:00, passos de 15 min
  const h = Math.floor(minutes / 60);
  const m = minutes % 60;
  return `${String(h).padStart(2, "0")}:${String(m).padStart(2, "0")}`;
}

export function DayStatement() {
  const reduce = useReducedMotion();
  return reduce ? <StaticNight /> : <ScrollDay />;
}

function ScrollDay() {
  const ref = useRef<HTMLElement>(null);
  const { scrollYProgress } = useScroll({ target: ref, offset: ["start start", "end end"] });

  const sky = useTransform(scrollYProgress, [0, 0.3, 0.55, 0.75, 1], ["#fdf3e3", "#fbe3cf", "#c98a8f", "#3b417c", "#1c2150"]);
  const ink = useTransform(scrollYProgress, [0.48, 0.58], ["#1c1412", "#ffffff"]);
  // sol se põe e sai da tela; lua nasce de fora da tela
  const sunY = useTransform(scrollYProgress, (v) => `${Math.min(v / 0.6, 1) * 105}vh`);
  const moonY = useTransform(scrollYProgress, (v) => `${(1 - Math.min(Math.max((v - 0.5) / 0.42, 0), 1)) * 105}vh`);
  const starsOpacity = useTransform(scrollYProgress, (v) => Math.min(Math.max((v - 0.62) / 0.28, 0), 1));
  const clock = useTransform(scrollYProgress, toClock);
  const bar = useTransform(scrollYProgress, [0, 0.9], [0, 1]);

  return (
    <section ref={ref} className="relative h-[280vh]">
      <p className="sr-only">{TEXT}</p>
      <motion.div style={{ backgroundColor: sky }} className="sticky top-0 flex h-lvh items-center overflow-hidden">
        <motion.div style={{ opacity: starsOpacity }} className="pointer-events-none absolute inset-0" aria-hidden="true">
          {STARS.map((s, i) => (
            <span
              key={i}
              className="animate-twinkle absolute rounded-full bg-white"
              style={{ left: `${s.left}%`, top: `${s.top}%`, width: s.size, height: s.size, animationDelay: `${s.delay}s` }}
            />
          ))}
        </motion.div>

        <motion.div
          style={{ y: sunY }}
          className="pointer-events-none absolute right-[8%] top-[70vh] h-24 w-24 sm:top-[10vh] sm:h-44 sm:w-44"
          aria-hidden="true"
        >
          <span className="animate-glow absolute -inset-8 rounded-full bg-manha/40 blur-2xl" />
          <span className="absolute inset-0 rounded-full bg-gradient-to-br from-[#ffd27a] to-manha" />
        </motion.div>

        <motion.div
          style={{ y: moonY }}
          className="pointer-events-none absolute right-[12%] top-[72vh] h-16 w-16 sm:top-[12vh] sm:h-32 sm:w-32"
          aria-hidden="true"
        >
          <span className="absolute -inset-6 rounded-full bg-white/10 blur-xl" />
          <span className="absolute inset-0 rounded-full bg-[#f3efe2] shadow-[inset_-14px_-6px_0_0_rgba(52,64,122,0.35)]" />
        </motion.div>

        <Container className="relative">
          <div className="flex gap-6 sm:gap-10" aria-hidden="true">
            <div className="hidden w-1 shrink-0 overflow-hidden rounded-full bg-white/25 sm:block">
              <motion.span style={{ scaleY: bar }} className="block h-full w-full origin-top rounded-full bg-brand-500" />
            </div>
            <div>
              <motion.p style={{ color: ink }} className="text-2xl font-extrabold tabular-nums sm:text-3xl">
                <motion.span>{clock}</motion.span>
              </motion.p>
              <motion.p
                style={{ color: ink }}
                className="mt-6 max-w-4xl text-[2rem] font-extrabold leading-[1.12] sm:text-6xl"
              >
                {WORDS.map((w, i) => (
                  <Fragment key={`${w}-${i}`}>
                    <Word progress={scrollYProgress} index={i}>
                      {w}
                    </Word>
                    {i < WORDS.length - 1 ? " " : null}
                  </Fragment>
                ))}
              </motion.p>
            </div>
          </div>
        </Container>
      </motion.div>
    </section>
  );
}

function Word({ children, progress, index }: { children: string; progress: MotionValue<number>; index: number }) {
  const start = (index / (WORDS.length - 1)) * REVEAL_SPAN;
  const end = Math.min(1, start + WORD_WINDOW);
  // forma de função (não acelerável) para o progresso seguir exatamente o scroll da seção
  const opacity = useTransform(progress, (v) => {
    if (v <= start) return REST_OPACITY;
    if (v >= end) return 1;
    return REST_OPACITY + (1 - REST_OPACITY) * ((v - start) / (end - start));
  });
  return <motion.span style={{ opacity }}>{children}</motion.span>;
}

function StaticNight() {
  return (
    <section className="bg-[#1c2150] py-24 sm:py-32">
      <Container>
        <p className="text-2xl font-extrabold text-white/80">22:00</p>
        <p className="mt-6 max-w-4xl text-[2rem] font-extrabold leading-[1.12] text-white sm:text-6xl">{TEXT}</p>
      </Container>
    </section>
  );
}
