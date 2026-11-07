import { Container } from "../ui/Container";
import { Button } from "../ui/Button";
import { MaskedText } from "../motion/MaskedText";
import { Reveal } from "../motion/Reveal";

// cápsulas que sobem devagar pelo fundo (posição, tamanho, duração e atraso fixos)
const CAPSULES = [
  { left: 4, w: 56, dur: 19, delay: -2 },
  { left: 14, w: 40, dur: 24, delay: -14 },
  { left: 27, w: 64, dur: 21, delay: -7 },
  { left: 41, w: 44, dur: 26, delay: -19 },
  { left: 55, w: 52, dur: 20, delay: -11 },
  { left: 68, w: 36, dur: 23, delay: -4 },
  { left: 79, w: 60, dur: 18, delay: -16 },
  { left: 91, w: 42, dur: 25, delay: -9 },
];

export function CtaBand() {
  return (
    <section className="relative isolate overflow-hidden bg-brand-900 py-20 sm:py-28">
      <div className="pointer-events-none absolute inset-0 -z-10" aria-hidden="true">
        <div className="animate-blob absolute -left-24 -top-32 h-96 w-96 rounded-full bg-brand-600/50 blur-3xl" />
        <div
          className="animate-blob absolute -bottom-40 right-0 h-[28rem] w-[28rem] rounded-full bg-brand-700/60 blur-3xl"
          style={{ animationDelay: "-6s" }}
        />
        {CAPSULES.map((c, i) => (
          <span
            key={i}
            className="animate-drift absolute bottom-0 rounded-full opacity-25"
            style={{
              left: `${c.left}%`,
              width: c.w,
              height: c.w * 0.42,
              animationDuration: `${c.dur}s`,
              animationDelay: `${c.delay}s`,
              background: "linear-gradient(90deg, #ffffff 50%, var(--color-brand-400) 50%)",
            }}
          />
        ))}
      </div>

      <Container>
        <div className="flex flex-col gap-10 lg:flex-row lg:items-end lg:justify-between">
          <div>
            <MaskedText
              text="Comece hoje. Amanhã cedo, o celular já te avisa."
              className="max-w-2xl text-4xl font-extrabold leading-tight text-white sm:text-5xl"
            />
            <Reveal delay={0.4} y={16}>
              <p className="mt-5 text-xl text-white/80">Teste grátis por 48 horas.</p>
            </Reveal>
          </div>
          <Reveal delay={0.55} y={20} scale={0.9} className="self-start lg:self-auto">
            <Button as="link" to="/cadastro" variant="light" size="xl">
              Criar minha conta
            </Button>
          </Reveal>
        </div>
      </Container>
    </section>
  );
}
