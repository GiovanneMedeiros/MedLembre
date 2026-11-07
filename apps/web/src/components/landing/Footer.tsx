import { Logo } from "../ui/Logo";
import { Container } from "../ui/Container";

const CONTACT_EMAIL = "contatomedlembre@gmail.com";

const COLUMNS = [
  {
    title: "Produto",
    links: [
      { label: "Como funciona", href: "#como-funciona" },
      { label: "Para quem cuida", href: "#beneficios" },
      { label: "Planos", href: "#planos" },
      { label: "Dúvidas", href: "#faq" },
    ],
  },
  {
    title: "Empresa",
    links: [
      { label: "Sobre", href: "#" },
      { label: "Contato", href: `mailto:${CONTACT_EMAIL}` },
      { label: "Privacidade", href: "#" },
      { label: "Termos de uso", href: "#" },
    ],
  },
];

export function Footer() {
  return (
    <footer className="bg-white pt-16">
      <Container>
        <div className="grid gap-12 pb-12 sm:grid-cols-2 lg:grid-cols-[1.4fr_1fr_1fr]">
          <div>
            <Logo />
            <p className="mt-5 max-w-xs text-base leading-relaxed text-ink-700">
              Lembretes de remédio no seu celular, para você e para quem você cuida.
            </p>
            <a
              href={`mailto:${CONTACT_EMAIL}`}
              className="mt-4 inline-block text-base font-bold text-brand-700 underline underline-offset-4 hover:text-brand-800"
            >
              {CONTACT_EMAIL}
            </a>
          </div>

          {COLUMNS.map((column) => (
            <div key={column.title}>
              <h3 className="text-base font-bold text-ink-900">{column.title}</h3>
              <ul className="mt-4 space-y-3">
                {column.links.map((link) => (
                  <li key={link.label}>
                    <a href={link.href} className="text-base text-ink-700 transition-colors hover:text-brand-700">
                      {link.label}
                    </a>
                  </li>
                ))}
              </ul>
            </div>
          ))}
        </div>

        <div className="flex flex-col gap-4 border-t-2 border-ink-900/[0.07] py-8 text-base text-ink-500 lg:flex-row lg:justify-between">
          <p className="max-w-2xl">
            O MedLembre é uma ferramenta de organização e lembrete. Não substitui orientação médica ou de um
            profissional de saúde.
          </p>
          <p className="shrink-0">&copy; {new Date().getFullYear()} MedLembre</p>
        </div>
      </Container>
    </footer>
  );
}
