import { SectionHeading } from "../ui/SectionHeading";
import { Container } from "../ui/Container";
import { Accordion } from "../ui/Accordion";
import { ScrollReveal } from "../ui/ScrollReveal";
import { FAQ_ITEMS } from "../../data/faq";

export function Faq() {
  return (
    <section id="faq" className="bg-white py-20 sm:py-28">
      <Container className="max-w-3xl">
        <ScrollReveal>
          <SectionHeading
            eyebrow="Dúvidas frequentes"
            title="Perguntas frequentes"
            description="Não encontrou o que procurava? Fale com a nossa equipe."
          />
        </ScrollReveal>

        <ScrollReveal delay={120} className="mt-12">
          <Accordion items={FAQ_ITEMS} />
        </ScrollReveal>
      </Container>
    </section>
  );
}
