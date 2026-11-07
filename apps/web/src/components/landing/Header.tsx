import { useEffect, useState } from "react";
import { Menu, X } from "lucide-react";
import { motion, useScroll } from "motion/react";
import { Logo } from "../ui/Logo";
import { Button } from "../ui/Button";
import { Container } from "../ui/Container";
import { cn } from "../../lib/cn";

const NAV_ITEMS = [
  { label: "Como funciona", href: "#como-funciona" },
  { label: "Para quem cuida", href: "#beneficios" },
  { label: "Planos", href: "#planos" },
  { label: "Dúvidas", href: "#faq" },
];

export function Header() {
  const [isScrolled, setIsScrolled] = useState(false);
  const [isMenuOpen, setIsMenuOpen] = useState(false);
  const { scrollYProgress } = useScroll();

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
        "fixed inset-x-0 top-0 z-50 border-b-2 transition-colors duration-200",
        isScrolled || isMenuOpen ? "border-ink-900/[0.07] bg-white" : "border-transparent bg-white/0",
      )}
    >
      <Container>
        <div className="flex h-18 items-center justify-between sm:h-20">
          <a href="#inicio" className="shrink-0" aria-label="MedLembre, início">
            <Logo />
          </a>

          <nav className="hidden items-center gap-8 lg:flex" aria-label="Navegação principal">
            {NAV_ITEMS.map((item) => (
              <a
                key={item.href}
                href={item.href}
                className="text-base font-medium text-ink-700 underline-offset-8 transition-colors hover:text-brand-700 hover:underline"
              >
                {item.label}
              </a>
            ))}
          </nav>

          <div className="hidden items-center gap-2 lg:flex">
            <Button as="link" to="/login" variant="ghost" size="lg">
              Entrar
            </Button>
            <Button as="link" to="/cadastro" variant="solid" size="lg">
              Criar conta
            </Button>
          </div>

          <button
            type="button"
            className="inline-flex h-12 w-12 items-center justify-center rounded-full text-ink-900 hover:bg-cha lg:hidden"
            aria-label={isMenuOpen ? "Fechar menu" : "Abrir menu"}
            aria-expanded={isMenuOpen}
            onClick={() => setIsMenuOpen((open) => !open)}
          >
            {isMenuOpen ? <X className="h-6 w-6" /> : <Menu className="h-6 w-6" />}
          </button>
        </div>
      </Container>

      {/* barra de progresso da leitura */}
      <motion.div
        aria-hidden="true"
        style={{ scaleX: scrollYProgress }}
        className="absolute inset-x-0 -bottom-0.5 h-[3px] origin-left bg-brand-600"
      />

      <div
        className={cn(
          "grid overflow-hidden bg-white transition-all duration-300 ease-out lg:hidden",
          isMenuOpen ? "grid-rows-[1fr] border-t-2 border-ink-900/[0.07]" : "grid-rows-[0fr]",
        )}
      >
        <div className="overflow-hidden">
          <Container>
            <nav className="flex flex-col py-4" aria-label="Navegação móvel">
              {NAV_ITEMS.map((item) => (
                <a
                  key={item.href}
                  href={item.href}
                  onClick={() => setIsMenuOpen(false)}
                  className="rounded-xl px-3 py-3.5 text-lg font-medium text-ink-900 hover:bg-cha"
                >
                  {item.label}
                </a>
              ))}
              <div className="mt-3 flex flex-col gap-3 border-t-2 border-ink-900/[0.07] pt-5">
                <Button as="link" to="/cadastro" variant="solid" size="xl" onClick={() => setIsMenuOpen(false)}>
                  Criar conta
                </Button>
                <Button as="link" to="/login" variant="outline" size="xl" onClick={() => setIsMenuOpen(false)}>
                  Entrar
                </Button>
              </div>
            </nav>
          </Container>
        </div>
      </div>
    </header>
  );
}
