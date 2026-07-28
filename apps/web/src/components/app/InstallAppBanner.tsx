import { useEffect, useState } from "react";
import { Download, Share, SquarePlus, X } from "lucide-react";
import { Button } from "../ui/Button";
import { Modal } from "../ui/Modal";
import { useInstallPrompt } from "../../hooks/useInstallPrompt";
import { isIos, isStandalone } from "../../lib/platform";

const DISMISSED_KEY = "medlembre:install-banner-dismissed";

export function InstallAppBanner() {
  const { canInstall, promptInstall } = useInstallPrompt();
  const [dismissed, setDismissed] = useState(() => localStorage.getItem(DISMISSED_KEY) === "1");
  const [showIosGuide, setShowIosGuide] = useState(false);
  const [alreadyInstalled, setAlreadyInstalled] = useState(true);

  useEffect(() => {
    setAlreadyInstalled(isStandalone());
  }, []);

  if (dismissed || alreadyInstalled) return null;
  if (!canInstall && !isIos()) return null;

  function dismiss() {
    localStorage.setItem(DISMISSED_KEY, "1");
    setDismissed(true);
  }

  async function handleClick() {
    if (isIos()) {
      setShowIosGuide(true);
      return;
    }
    await promptInstall();
  }

  return (
    <>
      <div className="border-b border-brand-200/60 bg-brand-50">
        <div className="mx-auto flex max-w-6xl items-center gap-3 px-4 py-3 sm:px-6 lg:px-8">
          <div className="flex h-10 w-10 shrink-0 items-center justify-center rounded-xl bg-white text-brand-600 shadow-soft">
            <Download className="h-5 w-5" aria-hidden="true" />
          </div>
          <div className="min-w-0 flex-1">
            <p className="text-sm font-semibold text-ink-900">Instale o MedLembre no seu celular</p>
            <p className="text-xs text-ink-500">Fica mais fácil de usar e você não perde nenhum lembrete.</p>
          </div>
          <Button size="md" className="h-10 shrink-0 px-4 text-xs sm:text-sm" onClick={handleClick}>
            Instalar
          </Button>
          <button
            type="button"
            onClick={dismiss}
            aria-label="Fechar"
            className="flex h-9 w-9 shrink-0 items-center justify-center rounded-lg text-ink-300 hover:bg-ink-900/[0.04] hover:text-ink-900"
          >
            <X className="h-5 w-5" />
          </button>
        </div>
      </div>

      <Modal isOpen={showIosGuide} onClose={() => setShowIosGuide(false)} title="Como instalar no iPhone">
        <ol className="flex flex-col gap-5">
          <li className="flex items-start gap-4">
            <span className="flex h-9 w-9 shrink-0 items-center justify-center rounded-full bg-brand-100 text-sm font-bold text-brand-700">
              1
            </span>
            <div>
              <p className="text-sm font-medium text-ink-900">
                Toque no botão de compartilhar <Share className="inline h-4 w-4 -translate-y-0.5" aria-hidden="true" />
              </p>
              <p className="mt-0.5 text-sm text-ink-500">Fica na barra de baixo (ou de cima) do Safari.</p>
            </div>
          </li>
          <li className="flex items-start gap-4">
            <span className="flex h-9 w-9 shrink-0 items-center justify-center rounded-full bg-brand-100 text-sm font-bold text-brand-700">
              2
            </span>
            <div>
              <p className="text-sm font-medium text-ink-900">
                Escolha <span className="whitespace-nowrap">"Adicionar à Tela de Início" <SquarePlus className="inline h-4 w-4 -translate-y-0.5" aria-hidden="true" /></span>
              </p>
              <p className="mt-0.5 text-sm text-ink-500">Pode ser preciso rolar a lista de opções pra baixo.</p>
            </div>
          </li>
          <li className="flex items-start gap-4">
            <span className="flex h-9 w-9 shrink-0 items-center justify-center rounded-full bg-brand-100 text-sm font-bold text-brand-700">
              3
            </span>
            <div>
              <p className="text-sm font-medium text-ink-900">Toque em "Adicionar"</p>
              <p className="mt-0.5 text-sm text-ink-500">Pronto! O ícone do MedLembre aparece na tela inicial.</p>
            </div>
          </li>
        </ol>
      </Modal>
    </>
  );
}
