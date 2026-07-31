import { useEffect, useState } from "react";
import { Bell, X } from "lucide-react";
import { Button } from "../ui/Button";
import { enablePushNotifications, getExistingSubscription, isPushSupported } from "../../lib/push";

const DISMISSED_KEY = "medlembre:push-banner-dismissed";

export function PushNotificationBanner() {
  const [status, setStatus] = useState<"checking" | "hidden" | "visible">("checking");
  const [isEnabling, setIsEnabling] = useState(false);
  const [error, setError] = useState<string | null>(null);

  useEffect(() => {
    if (!isPushSupported() || Notification.permission === "denied" || sessionStorage.getItem(DISMISSED_KEY)) {
      setStatus("hidden");
      return;
    }

    getExistingSubscription().then((subscription) => {
      setStatus(subscription ? "hidden" : "visible");
    });
  }, []);

  if (status !== "visible") return null;

  function dismiss() {
    sessionStorage.setItem(DISMISSED_KEY, "1");
    setStatus("hidden");
  }

  async function handleEnable() {
    setError(null);
    setIsEnabling(true);
    try {
      await enablePushNotifications();
      setStatus("hidden");
    } catch (err) {
      setError(err instanceof Error ? err.message : "Não foi possível ativar as notificações.");
    } finally {
      setIsEnabling(false);
    }
  }

  return (
    <div className="border-b border-brand-200/60 bg-brand-50">
      <div className="mx-auto flex max-w-6xl flex-wrap items-center gap-3 px-4 py-3 sm:px-6 lg:px-8">
        <div className="flex h-10 w-10 shrink-0 items-center justify-center rounded-xl bg-white text-brand-600 shadow-soft">
          <Bell className="h-5 w-5" aria-hidden="true" />
        </div>
        <div className="min-w-0 flex-1">
          <p className="text-sm font-semibold text-ink-900">Ative as notificações</p>
          <p className="text-xs text-ink-500">
            {error ?? "Assim você recebe o aviso na hora certa de tomar cada medicamento."}
          </p>
        </div>
        <Button
          size="md"
          className="h-10 shrink-0 px-4 text-xs sm:text-sm"
          onClick={handleEnable}
          disabled={isEnabling}
        >
          {isEnabling ? "Ativando..." : "Ativar notificações"}
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
  );
}
