export function PushNotificationMockup() {
  return (
    <div className="relative mx-auto w-[280px] select-none sm:w-[300px]" aria-hidden="true">
      {/* halo suave atrás do aparelho */}
      <div className="animate-blob absolute inset-0 -z-10 scale-90 rounded-[3rem] bg-gradient-to-b from-brand-200/50 to-transparent blur-2xl" />

      <div className="animate-float rounded-[2.5rem] border-[8px] border-ink-900 bg-ink-900 shadow-lift">
        <div className="relative overflow-hidden rounded-[2rem] bg-gradient-to-b from-brand-500 to-brand-700">
          {/* notch */}
          <div className="absolute left-1/2 top-0 z-10 h-5 w-28 -translate-x-1/2 rounded-b-2xl bg-ink-900" />

          {/* tela de bloqueio */}
          <div className="flex min-h-[360px] flex-col px-3 pb-4 pt-10">
            <div className="text-center text-white">
              <p className="text-4xl font-bold tracking-tight">09:00</p>
              <p className="mt-1 text-xs text-white/70">Terça-feira, 28 de julho</p>
            </div>

            <div className="mt-8 flex flex-col gap-2.5">
              <NotificationCard
                time="agora"
                title="💊 Hora do seu medicamento!"
                body="Está na hora de tomar Losartana 50mg."
                delay={500}
                live
              />
              <NotificationCard
                time="9 min atrás"
                title="✅ Dose confirmada"
                body="Perfeito! Registramos que você tomou Vitamina D."
                delay={750}
              />
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}

function NotificationCard({
  time,
  title,
  body,
  delay,
  live,
}: {
  time: string;
  title: string;
  body: string;
  delay: number;
  live?: boolean;
}) {
  return (
    <div
      className="animate-fade-up flex items-start gap-2.5 rounded-2xl bg-white/95 px-3 py-2.5 opacity-0 shadow-lift"
      style={{ animationDelay: `${delay}ms` }}
    >
      <span className="relative mt-0.5 shrink-0">
        <img src="/icon-192.png" className="h-8 w-8 rounded-lg" alt="" />
        {live && (
          <span className="animate-pulse-soft absolute -right-0.5 -top-0.5 h-2.5 w-2.5 rounded-full bg-emerald-500 ring-2 ring-white" />
        )}
      </span>
      <div className="min-w-0 flex-1">
        <div className="flex items-center justify-between gap-2">
          <p className="text-xs font-bold text-ink-900">MedLembre</p>
          <span className="shrink-0 text-[10px] text-ink-300">{time}</span>
        </div>
        <p className="mt-0.5 text-[13px] font-semibold leading-snug text-ink-900">{title}</p>
        <p className="text-[12px] leading-snug text-ink-500">{body}</p>
      </div>
    </div>
  );
}
