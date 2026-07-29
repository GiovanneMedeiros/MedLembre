import { Logo } from "../ui/Logo";
import { Container } from "../ui/Container";

const COLUMNS = [
  {
    title: "Produto",
    links: [
      { label: "Como funciona", href: "#como-funciona" },
      { label: "Benefícios", href: "#beneficios" },
      { label: "Planos", href: "#planos" },
      { label: "FAQ", href: "#faq" },
    ],
  },
  {
    title: "Empresa",
    links: [
      { label: "Sobre", href: "#" },
      { label: "Contato", href: "#" },
      { label: "Privacidade", href: "#" },
      { label: "Termos de uso", href: "#" },
    ],
  },
];

export function Footer() {
  return (
    <footer className="border-t border-ink-900/[0.06] bg-white pt-16">
      <Container>
        <div className="grid gap-10 pb-12 sm:grid-cols-2 lg:grid-cols-[1.3fr_1fr_1fr]">
          <div>
            <Logo />
            <p className="mt-4 max-w-xs text-sm leading-relaxed text-ink-500">
              Lembretes de medicamentos direto no seu celular, para você e para quem você ama.
            </p>
          </div>

          {COLUMNS.map((column) => (
            <div key={column.title}>
              <h3 className="text-sm font-semibold text-ink-900">{column.title}</h3>
              <ul className="mt-4 space-y-3">
                {column.links.map((link) => (
                  <li key={link.label}>
                    <a href={link.href} className="text-sm text-ink-500 transition-colors hover:text-brand-600">
                      {link.label}
                    </a>
                  </li>
                ))}
              </ul>
            </div>
          ))}
        </div>

        <div className="border-t border-ink-900/[0.06] py-6">
          <p className="mx-auto max-w-3xl text-center text-xs leading-relaxed text-ink-300">
            O MedLembre é uma ferramenta de organização e lembrete. Não substitui orientação médica ou
            profissional de saúde.
          </p>
        </div>

        <div className="flex flex-col items-center justify-between gap-3 border-t border-ink-900/[0.06] py-6 text-xs text-ink-300 sm:flex-row">
          <p>&copy; {new Date().getFullYear()} MedLembre. Todos os direitos reservados.</p>
          <p>Feito com cuidado para a sua rotina de saúde.</p>
        </div>
      </Container>
    </footer>
  );
}
