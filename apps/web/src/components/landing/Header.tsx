import { useEffect, useState } from "react";
import { Menu, X } from "lucide-react";
import { Logo } from "../ui/Logo";
import { Button } from "../ui/Button";
import { Container } from "../ui/Container";
import { cn } from "../../lib/cn";

const NAV_ITEMS = [
  { label: "Início", href: "#inicio" },
  { label: "Como funciona", href: "#como-funciona" },
  { label: "Benefícios", href: "#beneficios" },
  { label: "Planos", href: "#planos" },
  { label: "FAQ", href: "#faq" },
];

export function Header() {
  const [isScrolled, setIsScrolled] = useState(false);
  const [isMenuOpen, setIsMenuOpen] = useState(false);

  useEffect(() => {
    const onScroll = () => setIsScrolled(window.scrollY > 8);
    onScroll();
    window.addEventListener("scroll", onScroll, { passive: true });
    return () => window.removeEventListener("scroll", onScroll);
  }, []);

  useEffect(() => {
    document.body.style.overflow = isMenuOpen ? "hidden" : "";
    return () => {
      document.body.style.overflow = "";
    };
  }, [isMenuOpen]);

  return (
    <header
      className={cn(
        "fixed inset-x-0 top-0 z-50 transition-all duration-300",
        isScrolled ? "bg-cream/90 shadow-soft backdrop-blur-md" : "bg-transparent",
      )}
    >
      <Container>
        <div className="flex h-16 items-center justify-between sm:h-20">
          <a href="#inicio" className="shrink-0" aria-label="MedLembre — início">
            <Logo />
          </a>

          <nav className="hidden items-center gap-8 lg:flex" aria-label="Navegação principal">
            {NAV_ITEMS.map((item) => (
              <a
                key={item.href}
                href={item.href}
                className="text-sm font-medium text-ink-700 transition-colors hover:text-brand-600"
              >
                {item.label}
              </a>
            ))}
          </nav>

          <div className="hidden items-center gap-3 lg:flex">
            <Button as="link" to="/login" variant="ghost" size="md">
              Entrar
            </Button>
            <Button as="link" to="/cadastro" variant="primary" size="md">
              Começar agora
            </Button>
          </div>

          <button
            type="button"
            className="inline-flex h-10 w-10 items-center justify-center rounded-lg text-ink-900 lg:hidden"
            aria-label={isMenuOpen ? "Fechar menu" : "Abrir menu"}
            aria-expanded={isMenuOpen}
            onClick={() => setIsMenuOpen((open) => !open)}
          >
            {isMenuOpen ? <X className="h-6 w-6" /> : <Menu className="h-6 w-6" />}
          </button>
        </div>
      </Container>

      <div
        className={cn(
          "grid overflow-hidden bg-cream shadow-soft transition-all duration-300 ease-out lg:hidden",
          isMenuOpen ? "grid-rows-[1fr] opacity-100" : "grid-rows-[0fr] opacity-0",
        )}
      >
        <div className="overflow-hidden">
          <Container>
            <nav className="flex flex-col gap-1 py-4" aria-label="Navegação móvel">
              {NAV_ITEMS.map((item) => (
                <a
                  key={item.href}
                  href={item.href}
                  onClick={() => setIsMenuOpen(false)}
                  className="rounded-lg px-3 py-3 text-base font-medium text-ink-700 hover:bg-brand-50 hover:text-brand-600"
                >
                  {item.label}
                </a>
              ))}
              <div className="mt-2 flex flex-col gap-2 border-t border-ink-900/[0.06] pt-4">
                <Button as="link" to="/login" variant="secondary" size="md" onClick={() => setIsMenuOpen(false)}>
                  Entrar
                </Button>
                <Button as="link" to="/cadastro" variant="primary" size="md" onClick={() => setIsMenuOpen(false)}>
                  Começar agora
                </Button>
              </div>
            </nav>
          </Container>
        </div>
      </div>
    </header>
  );
}
