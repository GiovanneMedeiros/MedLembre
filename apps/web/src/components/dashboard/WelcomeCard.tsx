import { useEffect, useState } from "react";
import { Link } from "react-router-dom";
import { Bell, Check, Loader2, Pill, PlusCircle, Sparkles } from "lucide-react";
import { cn } from "../../lib/cn";
import { enablePushNotifications, isPushSupported } from "../../lib/push";

interface WelcomeCardProps {
  hasMedications: boolean;
  hasTakenDose: boolean;
}

function notificationsGranted() {
  return typeof Notification !== "undefined" && Notification.permission === "granted";
}

/** Primeiros passos para quem ainda não tem doses hoje. */
export function WelcomeCard({ hasMedications, hasTakenDose }: WelcomeCardProps) {
  const [pushOn, setPushOn] = useState(notificationsGranted);
  const [enabling, setEnabling] = useState(false);
  const [filled, setFilled] = useState(false);

  useEffect(() => {
    const id = requestAnimationFrame(() => setFilled(true));
    return () => cancelAnimationFrame(id);
  }, []);

  async function handleEnablePush() {
    setEnabling(true);
    try {
      await enablePushNotifications();
    } catch {
      // O banner de notificações já explica bloqueios; aqui só refletimos o estado.
    } finally {
      setPushOn(notificationsGranted());
      setEnabling(false);
    }
  }

  const steps = [
    {
      title: "Cadastre seu primeiro medicamento",
      text: "Nome, dosagem e os horários em que você toma.",
      done: hasMedications,
      action: (
        <Link
          to="/dashboard/medicamentos"
          className="text-sm font-semibold text-white underline decoration-white/40 underline-offset-4 hover:decoration-white"
        >
          Cadastrar
        </Link>
      ),
    },
    {
      title: "Ative as notificações",
      text: "Assim o celular avisa na hora de cada dose.",
      done: pushOn,
      action: isPushSupported() ? (
        <button
          type="button"
          onClick={handleEnablePush}
          disabled={enabling}
          className="inline-flex items-center gap-1.5 text-sm font-semibold text-white underline decoration-white/40 underline-offset-4 hover:decoration-white disabled:opacity-60"
        >
          {enabling && <Loader2 className="h-3.5 w-3.5 animate-spin" aria-hidden="true" />}
          Ativar
        </button>
      ) : null,
    },
    {
      title: "Marque sua primeira dose",
      text: "Toque no círculo da dose quando tomar o remédio.",
      done: hasTakenDose,
      action: null,
    },
  ];

  const doneCount = steps.filter((s) => s.done).length;
  const nextIndex = steps.findIndex((s) => !s.done);

  return (
    <div className="relative overflow-hidden rounded-3xl bg-gradient-to-br from-brand-500 via-brand-600 to-brand-800 p-6 text-white shadow-lift sm:p-8">
      {/* Comprimidos flutuando ao fundo */}
      <div className="pointer-events-none absolute inset-0" aria-hidden="true">
        <Pill className="absolute top-6 right-8 h-14 w-14 rotate-45 animate-float text-white/15" />
        <Pill
          className="absolute right-28 bottom-10 h-9 w-9 -rotate-12 animate-float text-white/10"
          style={{ animationDelay: "1.2s" }}
        />
        <Sparkles className="absolute top-24 right-36 h-6 w-6 animate-pulse-soft text-white/25" />
        <div className="absolute -right-16 -bottom-20 h-56 w-56 rounded-full border-[20px] border-white/[0.07]" />
      </div>

      <div className="relative">
        <p className="text-sm font-medium text-white/75">Primeiros passos</p>
        <h2 className="mt-1 font-heading text-2xl font-extrabold tracking-tight text-balance sm:text-3xl">
          Vamos montar sua rotina
        </h2>

        <div className="mt-4 flex items-center gap-3">
          <div
            className="h-2 flex-1 overflow-hidden rounded-full bg-white/15"
            role="progressbar"
            aria-label="Primeiros passos concluídos"
            aria-valuenow={doneCount}
            aria-valuemin={0}
            aria-valuemax={steps.length}
          >
            <div
              className="h-full rounded-full bg-white transition-[width] duration-1000 ease-out"
              style={{ width: filled ? `${Math.max((doneCount / steps.length) * 100, 4)}%` : "0%" }}
            />
          </div>
          <span className="shrink-0 text-xs font-semibold text-white/80 tabular-nums">
            {doneCount} de {steps.length}
          </span>
        </div>

        <ol className="mt-5 space-y-3">
          {steps.map((step, i) => {
            const isNext = i === nextIndex;
            return (
              <li
                key={step.title}
                className={cn(
                  "flex animate-rise items-start gap-3 rounded-2xl p-3 transition-colors",
                  isNext ? "bg-white/[0.12] ring-1 ring-white/20" : "bg-transparent",
                )}
                style={{ animationDelay: `${0.3 + i * 0.12}s` }}
              >
                <span
                  className={cn(
                    "flex h-8 w-8 shrink-0 items-center justify-center rounded-full text-sm font-bold",
                    step.done ? "animate-check-pop bg-white text-emerald-600" : "border-2 border-white/40 text-white",
                  )}
                  aria-hidden="true"
                >
                  {step.done ? <Check className="h-4 w-4" strokeWidth={3} /> : i + 1}
                </span>
                <div className="min-w-0 flex-1">
                  <p className={cn("text-sm font-semibold", step.done && "text-white/60 line-through decoration-white/40")}>
                    <span className="sr-only">{step.done ? "Concluído: " : "Pendente: "}</span>
                    {step.title}
                  </p>
                  {!step.done && <p className="mt-0.5 text-xs text-white/70">{step.text}</p>}
                </div>
                {!step.done && isNext && step.action && <div className="shrink-0 self-center">{step.action}</div>}
              </li>
            );
          })}
        </ol>

        {!hasMedications && (
          <Link
            to="/dashboard/medicamentos"
            className="group relative mt-6 inline-flex h-12 touch-manipulation items-center gap-2 overflow-hidden rounded-full bg-white px-6 text-base font-semibold text-brand-700 shadow-soft transition-transform duration-200 hover:-translate-y-0.5 active:translate-y-0"
          >
            {/* Brilho passando pelo botão */}
            <span
              className="pointer-events-none absolute inset-y-0 left-0 w-1/3 animate-shine bg-gradient-to-r from-transparent via-brand-100/80 to-transparent"
              aria-hidden="true"
            />
            <PlusCircle className="relative h-5 w-5" aria-hidden="true" />
            <span className="relative">Adicionar primeiro medicamento</span>
          </Link>
        )}
        {hasMedications && (
          <p className="mt-5 flex items-center gap-2 text-sm text-white/80">
            <Bell className="h-4 w-4" aria-hidden="true" />
            Nenhuma dose programada para hoje.
          </p>
        )}
      </div>
    </div>
  );
}
