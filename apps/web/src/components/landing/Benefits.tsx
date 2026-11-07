import { Check } from "lucide-react";
import { Container } from "../ui/Container";
import { cn } from "../../lib/cn";
import { MaskedText } from "../motion/MaskedText";
import { Reveal } from "../motion/Reveal";

const AUDIENCES = [
  {
    title: "Para quem toma o remédio",
    tone: "bg-white border-2 border-ink-900/10",
    points: [
      "O celular avisa na hora de cada dose, como uma mensagem.",
      "Um toque em “tomei” e a dose fica registrada.",
      "Telas simples e opção de letras maiores, fáceis em qualquer idade.",
      "Aviso quando o remédio está acabando, antes de faltar.",
    ],
  },
  {
    title: "Para quem cuida de alguém",
    tone: "bg-brand-900 text-white",
    points: [
      "Cadastre os remédios do seu pai, da sua mãe ou de quem você cuida.",
      "Os lembretes chegam para você, que ajuda a lembrar.",
      "Veja no histórico o que foi tomado e o que ficou para trás.",
      "Receba um resumo semanal por e-mail.",
    ],
  },
];

export function Benefits() {
  return (
    <section id="beneficios" className="scroll-mt-20 bg-white py-20 sm:py-28">
      <Container>
        <MaskedText
          text="Feito para quem toma e para quem cuida"
          className="max-w-3xl text-4xl font-extrabold leading-tight text-ink-900 sm:text-5xl"
        />

        <div className="mt-14 grid gap-6 lg:grid-cols-2">
          {AUDIENCES.map((audience, index) => {
            const isDark = index === 1;
            return (
              <Reveal
                key={audience.title}
                x={isDark ? 60 : -60}
                y={0}
                delay={index * 0.12}
                className={cn("rounded-[2rem] p-8 sm:p-10", audience.tone)}
              >
                <h3 className={cn("text-2xl font-bold sm:text-3xl", isDark ? "text-white" : "text-ink-900")}>
                  {audience.title}
                </h3>
                <ul className="mt-8 flex flex-col gap-5">
                  {audience.points.map((point, pointIndex) => (
                    <Reveal
                      as="li"
                      key={point}
                      y={16}
                      delay={0.35 + index * 0.12 + pointIndex * 0.09}
                      className="flex items-start gap-4"
                    >
                      <span
                        className={cn(
                          "mt-0.5 flex h-7 w-7 shrink-0 items-center justify-center rounded-full",
                          isDark ? "bg-white/15 text-white" : "bg-brand-50 text-brand-700",
                        )}
                      >
                        <Check className="h-4 w-4" strokeWidth={3} aria-hidden="true" />
                      </span>
                      <span className={cn("text-lg leading-relaxed", isDark ? "text-white/90" : "text-ink-700")}>
                        {point}
                      </span>
                    </Reveal>
                  ))}
                </ul>
              </Reveal>
            );
          })}
        </div>

        <p className="mt-6 text-base text-ink-500">
          O aviso de estoque está disponível a partir do plano Essencial. Perfis familiares e resumo
          semanal fazem parte dos planos Família e Premium.
        </p>
      </Container>
    </section>
  );
}
