import { SectionHeading } from "../ui/SectionHeading";
import { Container } from "../ui/Container";
import { ScrollReveal } from "../ui/ScrollReveal";
import { STEPS } from "../../data/steps";

export function HowItWorks() {
  return (
    <section id="como-funciona" className="py-20 sm:py-28">
      <Container>
        <SectionHeading
          eyebrow="Simples assim"
          title="Como funciona"
          description="Três passos para deixar o esquecimento de lado."
        />

        <div className="relative mt-16 grid gap-8 sm:grid-cols-3">
          <div
            className="absolute left-0 right-0 top-9 hidden h-px bg-gradient-to-r from-transparent via-brand-200 to-transparent sm:block"
            aria-hidden="true"
          />

          {STEPS.map((step, index) => (
            <ScrollReveal key={step.number} delay={index * 120} className="relative text-center">
              <div className="relative mx-auto flex h-16 w-16 items-center justify-center rounded-2xl bg-white shadow-soft">
                <step.icon className="h-7 w-7 text-brand-600" strokeWidth={1.75} aria-hidden="true" />
                <span className="absolute -top-3 -right-2 flex h-7 w-7 items-center justify-center rounded-full bg-gradient-to-b from-brand-500 to-brand-600 text-xs font-bold text-white shadow-soft">
                  {step.number}
                </span>
              </div>
              <h3 className="mt-5 text-lg font-semibold text-ink-900">{step.title}</h3>
              <p className="mt-2 text-sm leading-relaxed text-ink-500">{step.description}</p>
            </ScrollReveal>
          ))}
        </div>
      </Container>
    </section>
  );
}
