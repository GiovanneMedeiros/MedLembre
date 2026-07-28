import { SectionHeading } from "../ui/SectionHeading";
import { Container } from "../ui/Container";
import { Accordion } from "../ui/Accordion";
import { FAQ_ITEMS } from "../../data/faq";

export function Faq() {
  return (
    <section id="faq" className="bg-white py-20 sm:py-28">
      <Container className="max-w-3xl">
        <SectionHeading
          eyebrow="Dúvidas frequentes"
          title="Perguntas frequentes"
          description="Não encontrou o que procurava? Fale com a nossa equipe."
        />

        <div className="mt-12">
          <Accordion items={FAQ_ITEMS} />
        </div>
      </Container>
    </section>
  );
}
