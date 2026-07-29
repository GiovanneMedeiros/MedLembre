import { Clock } from "lucide-react";
import { Button } from "../ui/Button";

function formatRemaining(trialExpiresAt: string): string {
  const msLeft = new Date(trialExpiresAt).getTime() - Date.now();
  const hours = Math.max(0, Math.floor(msLeft / (1000 * 60 * 60)));
  const minutes = Math.max(0, Math.floor((msLeft % (1000 * 60 * 60)) / (1000 * 60)));

  if (hours >= 1) return `${hours}h${minutes > 0 ? ` ${minutes}min` : ""}`;
  return `${minutes}min`;
}

interface TrialBannerProps {
  trialExpiresAt: string;
}

export function TrialBanner({ trialExpiresAt }: TrialBannerProps) {
  return (
    <div className="border-b border-brand-200/60 bg-brand-50">
      <div className="mx-auto flex max-w-6xl items-center gap-3 px-4 py-3 sm:px-6 lg:px-8">
        <div className="flex h-10 w-10 shrink-0 items-center justify-center rounded-xl bg-white text-brand-600 shadow-soft">
          <Clock className="h-5 w-5" aria-hidden="true" />
        </div>
        <div className="min-w-0 flex-1">
          <p className="text-sm font-semibold text-ink-900">
            Seu teste grátis termina em {formatRemaining(trialExpiresAt)}
          </p>
          <p className="text-xs text-ink-500">Assine um plano para continuar usando o MedLembre sem interrupções.</p>
        </div>
        <Button as="link" to="/dashboard/assinatura" size="md" className="h-10 shrink-0 px-4 text-xs sm:text-sm">
          Fazer upgrade
        </Button>
      </div>
    </div>
  );
}
