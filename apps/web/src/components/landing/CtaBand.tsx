import { ArrowRight } from "lucide-react";
import { Container } from "../ui/Container";
import { Button } from "../ui/Button";
import { ScrollReveal } from "../ui/ScrollReveal";

export function CtaBand() {
  return (
    <section className="py-20 sm:py-24">
      <Container>
        <ScrollReveal className="relative overflow-hidden rounded-3xl bg-gradient-to-br from-brand-600 to-brand-800 px-6 py-14 text-center shadow-glow sm:px-12 sm:py-16">
          <div
            className="pointer-events-none absolute -right-16 -top-16 h-64 w-64 rounded-full bg-white/10 blur-3xl"
            aria-hidden="true"
          />
          <h2 className="mx-auto max-w-xl text-3xl font-bold text-white sm:text-4xl">
            Pronto para nunca mais esquecer um remédio?
          </h2>
          <p className="mx-auto mt-4 max-w-md text-brand-50/90">
            Comece agora, gratuitamente, e organize a rotina de medicamentos da sua família em poucos
            minutos.
          </p>
          <div className="mt-8 flex justify-center">
            <Button as="a" href="#planos" variant="secondary" size="lg" className="border-0 bg-white text-brand-700">
              Começar agora
              <ArrowRight className="h-4 w-4" />
            </Button>
          </div>
        </ScrollReveal>
      </Container>
    </section>
  );
}
