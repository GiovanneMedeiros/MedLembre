import { useState } from "react";
import { Check, Star } from "lucide-react";
import { SectionHeading } from "../ui/SectionHeading";
import { Container } from "../ui/Container";
import { Button } from "../ui/Button";
import { ScrollReveal } from "../ui/ScrollReveal";
import { SegmentedToggle } from "../ui/SegmentedToggle";
import { ANNUAL_DISCOUNT_LABEL, PLANS } from "../../data/plans";
import { formatCurrency } from "../../lib/format";
import { cn } from "../../lib/cn";

type Cycle = "monthly" | "annual";

export function Pricing() {
  const [cycle, setCycle] = useState<Cycle>("monthly");

  return (
    <section id="planos" className="py-20 sm:py-28">
      <Container>
        <ScrollReveal>
          <SectionHeading
            eyebrow="Planos"
            title="Escolha o plano ideal para você"
            description="Comece grátis e evolua conforme a sua rotina de cuidados crescer."
          />
        </ScrollReveal>

        <div className="mt-8 flex justify-center">
          <SegmentedToggle
            value={cycle}
            onChange={(value) => setCycle(value as Cycle)}
            options={[
              { value: "monthly", label: "Mensal" },
              {
                value: "annual",
                label: (
                  <span className="inline-flex items-center gap-1.5">
                    Anual
                    <span className="rounded-full bg-emerald-500/15 px-1.5 py-0.5 text-[10px] font-bold text-emerald-600">
                      -25%
                    </span>
                  </span>
                ),
              },
            ]}
          />
        </div>

        <div className="mt-12 grid gap-6 md:grid-cols-2 lg:grid-cols-4">
          {PLANS.map((plan, index) => {
            const isAnnual = cycle === "annual" && plan.annualPrice !== null;
            const displayPrice = isAnnual ? plan.annualPrice! / 12 : plan.monthlyPrice;

            return (
              <ScrollReveal
                key={plan.id}
                delay={index * 90}
                className={cn(
                  "relative flex h-full flex-col rounded-2xl border bg-white p-6 transition-all duration-300 hover:-translate-y-1.5",
                  plan.highlighted
                    ? "border-brand-300 shadow-glow ring-1 ring-brand-200 hover:shadow-glow"
                    : "border-ink-900/[0.06] shadow-soft hover:border-brand-200 hover:shadow-lift",
                )}
              >
                {plan.highlighted && (
                  <span className="absolute -top-3 left-1/2 inline-flex -translate-x-1/2 items-center gap-1 rounded-full bg-gradient-to-b from-brand-500 to-brand-600 px-3 py-1 text-[11px] font-bold text-white shadow-soft">
                    <Star className="h-3 w-3 fill-current" />
                    Mais popular
                  </span>
                )}

                <h3 className="text-base font-semibold text-ink-900">{plan.name}</h3>
                <p className="mt-1.5 text-sm text-ink-500">{plan.description}</p>

                <div className="mt-5 flex items-baseline gap-1">
                  <span className="text-3xl font-bold text-ink-900">{formatCurrency(displayPrice)}</span>
                  {plan.monthlyPrice > 0 && <span className="text-sm text-ink-500">/mês</span>}
                </div>

                {plan.monthlyPrice === 0 && <p className="mt-1 text-xs text-ink-300">Grátis por 48 horas.</p>}

                {isAnnual && plan.annualPrice !== null && (
                  <p className="mt-1 text-xs text-ink-300">
                    {formatCurrency(plan.annualPrice)} cobrado por ano · {ANNUAL_DISCOUNT_LABEL}
                  </p>
                )}
                {!isAnnual && plan.annualPrice !== null && cycle === "monthly" && (
                  <p className="mt-1 text-xs text-ink-300">ou {formatCurrency(plan.annualPrice)}/ano</p>
                )}

                <ul className="mt-6 flex flex-1 flex-col gap-2.5">
                  {plan.features.map((feature) => (
                    <li key={feature} className="flex items-start gap-2 text-sm text-ink-700">
                      <Check className="mt-0.5 h-4 w-4 shrink-0 text-brand-600" aria-hidden="true" />
                      {feature}
                    </li>
                  ))}
                </ul>

                <Button
                  as="link"
                  to="/cadastro"
                  variant={plan.highlighted ? "primary" : "secondary"}
                  size="md"
                  className="mt-7 w-full"
                >
                  {plan.monthlyPrice === 0 ? "Começar grátis" : "Assinar plano"}
                </Button>
              </ScrollReveal>
            );
          })}
        </div>
      </Container>
    </section>
  );
}
