import { useState } from "react";
import { Check } from "lucide-react";
import { Container } from "../ui/Container";
import { Button } from "../ui/Button";
import { SegmentedToggle } from "../ui/SegmentedToggle";
import { ANNUAL_DISCOUNT_LABEL, PLANS } from "../../data/plans";
import { formatCurrency } from "../../lib/format";
import { cn } from "../../lib/cn";
import { MaskedText } from "../motion/MaskedText";
import { Reveal } from "../motion/Reveal";

type Cycle = "monthly" | "annual";

export function Pricing() {
  const [cycle, setCycle] = useState<Cycle>("monthly");

  return (
    <section id="planos" className="scroll-mt-20 bg-cha py-20 sm:py-28">
      <Container>
        <div className="flex flex-col gap-8 lg:flex-row lg:items-end lg:justify-between">
          <div>
            <MaskedText text="Planos" className="text-4xl font-extrabold leading-tight text-ink-900 sm:text-5xl" />
            <p className="mt-5 max-w-xl text-xl leading-relaxed text-ink-700">
              Comece com 48 horas grátis. Depois, escolha o plano do tamanho da sua rotina.
            </p>
          </div>

          <SegmentedToggle
            value={cycle}
            onChange={(value) => setCycle(value as Cycle)}
            className="self-start border-2 border-ink-900/10 p-1.5 shadow-none lg:self-auto [&_button]:px-5 [&_button]:py-2.5 [&_button]:text-base"
            options={[
              { value: "monthly", label: "Mensal" },
              {
                value: "annual",
                label: (
                  <span className="inline-flex items-center gap-2">
                    Anual
                    <span className="rounded-full bg-emerald-100 px-2 py-0.5 text-sm font-bold text-emerald-800">
                      -25%
                    </span>
                  </span>
                ),
              },
            ]}
          />
        </div>

        <div className="mt-12 grid gap-5 md:grid-cols-2 lg:grid-cols-4">
          {PLANS.map((plan, index) => {
            const isAnnual = cycle === "annual" && plan.annualPrice !== null;
            const displayPrice = isAnnual ? plan.annualPrice! / 12 : plan.monthlyPrice;
            const isFree = plan.monthlyPrice === 0;

            return (
              <Reveal
                key={plan.id}
                y={48}
                delay={index * 0.1}
                className={cn(
                  "flex h-full flex-col rounded-[1.75rem] bg-white p-7",
                  plan.highlighted ? "border-[3px] border-brand-600" : "border-2 border-ink-900/10",
                )}
              >
                <p className={cn("mb-3 h-7 text-base font-bold", plan.highlighted ? "text-brand-700" : "invisible hidden lg:block")}>
                  {plan.highlighted ? "Mais escolhido" : " "}
                </p>
                <h3 className="text-2xl font-bold text-ink-900">{plan.name}</h3>
                <p className="mt-2 text-base leading-relaxed text-ink-700">{plan.description}</p>

                <div className="mt-6 flex items-baseline gap-1">
                  <span className="text-4xl font-extrabold text-ink-900">{formatCurrency(displayPrice)}</span>
                  {!isFree && <span className="text-lg text-ink-500">/mês</span>}
                </div>

                <p className="mt-1 min-h-6 text-base text-ink-500">
                  {isFree && "Por 48 horas."}
                  {isAnnual && plan.annualPrice !== null && (
                    <>
                      {formatCurrency(plan.annualPrice)} por ano. {ANNUAL_DISCOUNT_LABEL}.
                    </>
                  )}
                  {!isFree && !isAnnual && plan.annualPrice !== null && (
                    <>ou {formatCurrency(plan.annualPrice)} por ano</>
                  )}
                </p>

                <ul className="mt-6 flex flex-1 flex-col gap-3 border-t-2 border-ink-900/[0.07] pt-6">
                  {plan.features.map((feature) => (
                    <li key={feature} className="flex items-start gap-3 text-base leading-snug text-ink-700">
                      <Check className="mt-0.5 h-5 w-5 shrink-0 text-brand-600" strokeWidth={2.5} aria-hidden="true" />
                      {feature}
                    </li>
                  ))}
                </ul>

                <Button
                  as="link"
                  to="/cadastro"
                  variant={plan.highlighted ? "solid" : "outline"}
                  size="lg"
                  className="mt-8 w-full text-lg font-bold"
                >
                  {isFree ? "Testar grátis" : "Escolher plano"}
                </Button>
              </Reveal>
            );
          })}
        </div>
      </Container>
    </section>
  );
}
