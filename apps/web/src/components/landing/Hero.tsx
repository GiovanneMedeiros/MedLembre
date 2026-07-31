import { ArrowRight, PlayCircle, ShieldCheck } from "lucide-react";
import { Container } from "../ui/Container";
import { Button } from "../ui/Button";
import { PushNotificationMockup } from "./PushNotificationMockup";

export function Hero() {
  return (
    <section id="inicio" className="relative overflow-hidden pt-28 pb-20 sm:pt-36 sm:pb-28">
      <div
        className="pointer-events-none absolute inset-x-0 -top-32 -z-10 h-[560px] bg-gradient-to-b from-brand-100/70 via-brand-50/40 to-transparent"
        aria-hidden="true"
      />
      <div
        className="animate-blob pointer-events-none absolute -left-24 top-10 -z-10 h-72 w-72 rounded-full bg-brand-200/40 blur-3xl"
        aria-hidden="true"
      />
      <div
        className="animate-blob pointer-events-none absolute -right-20 top-40 -z-10 h-80 w-80 rounded-full bg-brand-300/30 blur-3xl"
        style={{ animationDelay: "-7s" }}
        aria-hidden="true"
      />

      <Container>
        <div className="grid items-center gap-14 lg:grid-cols-2 lg:gap-10">
          <div className="text-center lg:text-left">
            <span className="animate-fade-up inline-flex items-center gap-2 rounded-full border border-brand-200 bg-white px-3.5 py-1.5 text-xs font-semibold text-brand-600 shadow-soft">
              <ShieldCheck className="h-3.5 w-3.5" />
              Lembretes direto no seu celular
            </span>

            <h1
              className="animate-fade-up mt-6 text-4xl font-bold leading-[1.1] text-ink-900 opacity-0 sm:text-5xl lg:text-[3.25rem]"
              style={{ animationDelay: "100ms" }}
            >
              Seu medicamento na hora certa.{" "}
              <span className="bg-gradient-to-r from-brand-500 to-brand-700 bg-clip-text text-transparent">
                Sem esquecer.
              </span>
            </h1>

            <p
              className="animate-fade-up mx-auto mt-6 max-w-lg text-lg text-ink-500 opacity-0 lg:mx-0"
              style={{ animationDelay: "200ms" }}
            >
              Instale o MedLembre como um app e receba notificações no horário certo para cuidar da sua
              rotina de medicamentos com mais tranquilidade.
            </p>

            <div
              className="animate-fade-up mt-9 flex flex-col items-center gap-3 opacity-0 sm:flex-row sm:justify-center lg:justify-start"
              style={{ animationDelay: "300ms" }}
            >
              <Button as="link" to="/cadastro" size="lg">
                Começar agora
                <ArrowRight className="h-4 w-4" />
              </Button>
              <Button as="a" href="#como-funciona" variant="secondary" size="lg">
                <PlayCircle className="h-4 w-4" />
                Como funciona
              </Button>
            </div>

            <p
              className="animate-fade-up mx-auto mt-6 max-w-md text-xs leading-relaxed text-ink-300 opacity-0 lg:mx-0"
              style={{ animationDelay: "400ms" }}
            >
              O MedLembre é uma ferramenta de organização e lembrete. Não substitui orientação médica ou
              profissional de saúde.
            </p>
          </div>

          <div className="animate-fade-up" style={{ animationDelay: "150ms" }}>
            <PushNotificationMockup />
          </div>
        </div>
      </Container>
    </section>
  );
}
