import { Container } from "../ui/Container";
import { Accordion } from "../ui/Accordion";
import { MaskedText } from "../motion/MaskedText";
import { Reveal } from "../motion/Reveal";
import { FAQ_ITEMS } from "../../data/faq";

const CONTACT_EMAIL = "contatomedlembre@gmail.com";

export function Faq() {
  return (
    <section id="faq" className="scroll-mt-20 bg-white py-20 sm:py-28">
      <Container>
        <div className="grid gap-12 lg:grid-cols-[minmax(0,1fr)_minmax(0,1.8fr)] lg:gap-16">
          <div className="lg:sticky lg:top-28 lg:self-start">
            <MaskedText text="Dúvidas comuns" className="text-4xl font-extrabold leading-tight text-ink-900 sm:text-5xl" />
            <Reveal delay={0.2} y={20}>
              <p className="mt-5 text-xl leading-relaxed text-ink-700">Não achou o que procurava? Escreva para a gente:</p>
              <a
                href={`mailto:${CONTACT_EMAIL}`}
                className="mt-2 inline-block text-lg font-bold text-brand-700 underline underline-offset-4 [overflow-wrap:anywhere] hover:text-brand-800"
              >
                {CONTACT_EMAIL}
              </a>
            </Reveal>
          </div>

          <Reveal delay={0.15} y={40}>
            <Accordion items={FAQ_ITEMS} />
          </Reveal>
        </div>
      </Container>
    </section>
  );
}
