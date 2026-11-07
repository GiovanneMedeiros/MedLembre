import { useEffect, useRef } from "react";
import { motion, useScroll, useTransform } from "motion/react";
import { Container } from "../ui/Container";
import { Button } from "../ui/Button";
import { MaskedText } from "../motion/MaskedText";
import { Reveal } from "../motion/Reveal";
import { PillOrganizer } from "./PillOrganizer";

export function Hero() {
  const ref = useRef<HTMLElement>(null);
  const { scrollYProgress } = useScroll({ target: ref, offset: ["start start", "end start"] });
  const videoY = useTransform(scrollYProgress, [0, 1], [0, 80]);
  const videoScale = useTransform(scrollYProgress, [0, 1], [1, 1.08]);
  const boxY = useTransform(scrollYProgress, [0, 1], [0, -70]);
  const cardY = useTransform(scrollYProgress, [0, 1], [0, -170]);
  const cardRotate = useTransform(scrollYProgress, [0, 1], [0, -4]);

  return (
    <section
      ref={ref}
      id="inicio"
      className="relative isolate overflow-hidden bg-white pb-20 pt-32 sm:pb-28 sm:pt-40 lg:flex lg:min-h-[44rem] lg:items-center lg:pt-32"
    >
      {/* Mobile/tablet: fundo original com manchas coloridas */}
      <HeroBackground />

      {/* Vídeo de fundo.
          Celular: atrás do título, com opacidade baixa e esmaecendo para baixo.
          Desktop: ocupa a seção inteira, texto fica no espaço vazio à esquerda. */}
      <motion.div
        style={{ y: videoY, scale: videoScale }}
        className="pointer-events-none absolute inset-x-0 top-0 -z-10 h-[34rem] opacity-20 [mask-image:linear-gradient(to_bottom,black_55%,transparent)] sm:h-[40rem] lg:inset-0 lg:h-auto lg:opacity-100 lg:[mask-image:none]"
        aria-hidden="true"
      >
        <HeroVideo className="h-full w-full object-cover object-[72%_center]" />
        {/* desktop: reforça o contraste do texto à esquerda e emenda com a próxima seção */}
        <div className="absolute inset-0 hidden bg-gradient-to-r from-white/70 via-white/20 to-transparent lg:block" />
        <div className="absolute inset-x-0 top-0 hidden h-32 bg-gradient-to-b from-white/70 to-transparent lg:block" />
        <div className="absolute inset-x-0 bottom-0 hidden h-40 bg-gradient-to-b from-transparent to-white lg:block" />
      </motion.div>

      <Container>
        <div className="grid items-center gap-16 lg:block">
          <div className="max-w-xl">
            <MaskedText
              as="h1"
              onLoad
              delay={0.1}
              stagger={0.07}
              text="Seu medicamento na hora certa. Sem esquecer."
              className="text-[2.5rem] font-extrabold leading-[1.05] text-ink-900 sm:text-6xl"
            />

            <Reveal onLoad delay={0.55} y={20}>
              <p className="mt-6 max-w-lg text-xl leading-relaxed text-ink-700">
                O MedLembre avisa no seu celular quando é hora de tomar cada remédio. E, se você cuida de
                alguém, avisa você também.
              </p>
            </Reveal>

            <Reveal onLoad delay={0.7} y={20} className="mt-10 flex flex-col gap-3 sm:flex-row">
              <Button as="link" to="/cadastro" variant="solid" size="xl">
                Criar minha conta
              </Button>
              <Button as="a" href="#como-funciona" variant="outline" size="xl">
                Ver como funciona
              </Button>
            </Reveal>

            <Reveal onLoad delay={0.85} y={12}>
              <p className="mt-5 text-base text-ink-500">Teste grátis por 48 horas.</p>
            </Reveal>
          </div>

          {/* Mobile/tablet: ilustração original (porta-comprimidos + notificação) */}
          <Reveal
            onLoad
            delay={0.25}
            y={40}
            scale={0.96}
            className="relative mx-auto w-full max-w-[34rem] pb-44 sm:pb-28 lg:hidden"
          >
            <motion.div style={{ y: boxY }}>
              <PillOrganizer />
            </motion.div>
            <motion.div
              style={{ y: cardY, rotate: cardRotate }}
              className="absolute bottom-0 right-0 w-[min(20rem,92%)] sm:-right-6"
            >
              <NotificationCard />
            </motion.div>
          </Reveal>
        </div>
      </Container>
    </section>
  );
}

function HeroVideo({ className }: { className?: string }) {
  const videoRef = useRef<HTMLVideoElement>(null);

  // Respeita "reduzir movimento": mostra só o quadro estático (poster).
  useEffect(() => {
    const video = videoRef.current;
    if (!video) return;
    const query = window.matchMedia("(prefers-reduced-motion: reduce)");
    const apply = () => {
      if (query.matches) video.pause();
      else void video.play().catch(() => {});
    };
    apply();
    query.addEventListener("change", apply);
    return () => query.removeEventListener("change", apply);
  }, []);

  return (
    <video
      ref={videoRef}
      className={className}
      src="/videos/hero.mp4"
      poster="/videos/hero-poster.jpg"
      autoPlay
      muted
      loop
      playsInline
      preload="metadata"
      disablePictureInPicture
    />
  );
}

function HeroBackground() {
  return (
    <div className="pointer-events-none absolute inset-0 -z-10 lg:hidden" aria-hidden="true">
      <div className="animate-blob absolute -left-32 -top-24 h-[28rem] w-[28rem] rounded-full bg-manha-soft/80 blur-3xl" />
      <div
        className="animate-blob absolute right-[-10rem] top-10 h-[32rem] w-[32rem] rounded-full bg-brand-100/80 blur-3xl"
        style={{ animationDelay: "-5s" }}
      />
      <div
        className="animate-blob absolute bottom-[-12rem] left-1/3 h-[26rem] w-[26rem] rounded-full bg-noite-soft/70 blur-3xl"
        style={{ animationDelay: "-9s" }}
      />
      {/* esmaece o fundo na base para emendar com a próxima seção */}
      <div className="absolute inset-x-0 bottom-0 h-40 bg-gradient-to-b from-transparent to-white" />
    </div>
  );
}

function NotificationCard() {
  return (
    <div
      aria-hidden="true"
      className="animate-arrive select-none rounded-3xl border-2 border-ink-900/10 bg-white p-4 shadow-[0_24px_48px_-20px_rgba(43,26,23,0.4)]"
    >
      <div className="flex items-center gap-2.5">
        <img src="/icon-192.png" alt="" className="h-8 w-8 rounded-lg" />
        <p className="flex-1 text-sm font-bold text-ink-900">MedLembre</p>
        <span className="text-sm text-ink-500">agora</span>
      </div>
      <p className="mt-3 text-lg font-bold leading-snug text-ink-900">Hora dos remédios da manhã</p>
      <p className="text-base text-ink-700">Losartana 50 mg e Vitamina D</p>
      <span className="relative mt-3 flex h-11 items-center justify-center overflow-hidden rounded-full bg-brand-600 text-base font-bold text-white">
        <span className="animate-pulse-soft absolute inset-0 rounded-full bg-white/15" />
        <span className="relative">Já tomei</span>
      </span>
    </div>
  );
}
