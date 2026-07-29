import { Sparkles } from "lucide-react";
import { Button } from "../ui/Button";

export function TrialExpiredScreen() {
  return (
    <div className="flex min-h-[calc(100svh-4rem)] items-center justify-center px-4 py-16 lg:min-h-svh">
      <div className="flex w-full max-w-md flex-col items-center rounded-3xl border border-ink-900/[0.06] bg-white p-8 text-center shadow-lift sm:p-10">
        <div className="flex h-16 w-16 items-center justify-center rounded-2xl bg-gradient-to-b from-brand-500 to-brand-600 text-white shadow-soft">
          <Sparkles className="h-8 w-8" aria-hidden="true" />
        </div>
        <h1 className="mt-6 text-xl font-bold text-ink-900">Seu período grátis terminou</h1>
        <p className="mt-2 text-sm text-ink-500">
          As 48 horas de teste do MedLembre chegaram ao fim. Assine um plano para continuar recebendo seus
          lembretes de medicamentos sem interrupção.
        </p>
        <Button as="link" to="/dashboard/assinatura" size="lg" className="mt-8 w-full">
          Ver planos e assinar
        </Button>
      </div>
    </div>
  );
}
