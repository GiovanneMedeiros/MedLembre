import { SectionHeading } from "../ui/SectionHeading";
import { Container } from "../ui/Container";
import { ScrollReveal } from "../ui/ScrollReveal";
import { BENEFITS } from "../../data/benefits";

export function Benefits() {
  return (
    <section id="beneficios" className="bg-white py-20 sm:py-28">
      <Container>
        <SectionHeading
          eyebrow="Por que MedLembre"
          title="Benefícios pensados para a sua rotina"
          description="Tudo o que você precisa para nunca mais perder a hora de um medicamento."
        />

        <div className="mt-16 grid gap-5 sm:grid-cols-2 lg:grid-cols-3">
          {BENEFITS.map((benefit, index) => (
            <ScrollReveal
              key={benefit.title}
              delay={index * 80}
              className="group rounded-2xl border border-ink-900/[0.06] bg-cream p-6 transition-all duration-300 hover:-translate-y-1 hover:border-brand-200 hover:shadow-lift"
            >
              <div className="flex h-11 w-11 items-center justify-center rounded-xl bg-brand-50 text-brand-600 transition-colors group-hover:bg-brand-600 group-hover:text-white">
                <benefit.icon className="h-5 w-5" strokeWidth={1.75} aria-hidden="true" />
              </div>
              <h3 className="mt-4 text-base font-semibold text-ink-900">{benefit.title}</h3>
              <p className="mt-2 text-sm leading-relaxed text-ink-500">{benefit.description}</p>
            </ScrollReveal>
          ))}
        </div>
      </Container>
    </section>
  );
}
