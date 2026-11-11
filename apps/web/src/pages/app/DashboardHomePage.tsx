import { CalendarClock, Pill, PlusCircle } from "lucide-react";
import { Container } from "../../components/ui/Container";
import { Button } from "../../components/ui/Button";
import { ScrollReveal } from "../../components/ui/ScrollReveal";
import { Lift } from "../../components/ui/Lift";
import { EstoqueAlertBanner } from "../../components/app/EstoqueAlertBanner";
import { TimelineRow } from "../../components/medications/TimelineRow";
import { DayDial, DayDialLegend } from "../../components/dashboard/DayDial";
import { DayTimeline } from "../../components/dashboard/DayTimeline";
import { NextDoseCard } from "../../components/dashboard/NextDoseCard";
import { DashboardSkeleton } from "../../components/dashboard/DashboardSkeleton";
import { StreakCard } from "../../components/dashboard/StreakCard";
import { AdherenceChart } from "../../components/dashboard/AdherenceChart";
import { MedicationAdherence } from "../../components/dashboard/MedicationAdherence";
import { WelcomeCard } from "../../components/dashboard/WelcomeCard";
import { useAuth } from "../../contexts/AuthContext";
import { useDashboardSummary } from "../../hooks/useDashboardSummary";
import { useAdherenceHistory } from "../../hooks/useAdherenceHistory";
import { useMarkDose, useSnoozeDose, useUnmarkDose } from "../../hooks/useMedications";
import { useNow } from "../../hooks/useNow";
import type { DashboardSummary, TimelineItem } from "../../types/dashboard";

const todayFormat = new Intl.DateTimeFormat("pt-BR", { weekday: "long", day: "numeric", month: "long" });

function greeting(now: Date) {
  const h = now.getHours();
  if (h < 5) return "Boa noite";
  if (h < 12) return "Bom dia";
  if (h < 18) return "Boa tarde";
  return "Boa noite";
}

function formatToday(now: Date) {
  const text = todayFormat.format(now);
  return text.charAt(0).toUpperCase() + text.slice(1);
}

/** Resumo do dia em uma frase, para quem só quer bater o olho. */
function daySentence(data: DashboardSummary) {
  const total = data.timelineHoje.length;
  if (total === 0) return "Você não tem doses programadas para hoje.";
  const taken = data.timelineHoje.filter((i) => i.status === "tomado").length;
  const late = data.timelineHoje.filter((i) => i.status === "atrasado").length;
  if (taken === total) return `Você tomou todas as ${total} doses de hoje.`;
  const base = `Você tomou ${taken} de ${total} doses hoje.`;
  if (late > 0) return `${base} ${late === 1 ? "Uma dose está atrasada." : `${late} doses estão atrasadas.`}`;
  const next = data.proximoMedicamento;
  return next ? `${base} A próxima é às ${next.horario}.` : base;
}

export function DashboardHomePage() {
  const { user } = useAuth();
  const now = useNow();
  const { data, isLoading, isError } = useDashboardSummary();
  const history = useAdherenceHistory();
  const markDose = useMarkDose();
  const unmarkDose = useUnmarkDose();
  const snoozeDose = useSnoozeDose();

  const nome = (user?.user_metadata?.nome as string | undefined)?.split(" ")[0] ?? "";

  const sameDose = (v: { medicationId: string; scheduledFor: string } | undefined, item: TimelineItem) =>
    v?.medicationId === item.medicationId && v?.scheduledFor === item.scheduledFor;

  function toggleDose(item: TimelineItem) {
    const vars = { medicationId: item.medicationId, scheduledFor: item.scheduledFor };
    if (item.status === "tomado") unmarkDose.mutate(vars);
    else markDose.mutate(vars);
  }

  const isToggling = (item: TimelineItem) =>
    (markDose.isPending && sameDose(markDose.variables, item)) ||
    (unmarkDose.isPending && sameDose(unmarkDose.variables, item));

  const isSnoozing = (item: TimelineItem) => snoozeDose.isPending && sameDose(snoozeDose.variables, item);

  const snooze = (item: TimelineItem) =>
    snoozeDose.mutateAsync({ medicationId: item.medicationId, scheduledFor: item.scheduledFor });

  const next = data?.proximoMedicamento ?? null;
  const stats = history.summary;
  const hasTakenDose =
    Boolean(stats?.days.some((d) => d.taken > 0)) || Boolean(data?.timelineHoje.some((i) => i.status === "tomado"));

  return (
    <div className="relative overflow-hidden pb-16">
      {/* Fundo vivo: manchas de cor se movendo devagar */}
      <div className="pointer-events-none absolute inset-x-0 top-0 h-[40rem]" aria-hidden="true">
        <div className="absolute -top-40 left-1/2 h-[28rem] w-[64rem] -translate-x-1/2 rounded-full bg-gradient-to-b from-brand-200/50 to-brand-100/0 blur-3xl" />
        <div className="absolute top-10 -left-24 h-80 w-80 animate-blob rounded-full bg-brand-200/40 blur-3xl" />
        <div
          className="absolute top-40 -right-20 h-96 w-96 animate-blob rounded-full bg-rose-200/40 blur-3xl"
          style={{ animationDelay: "-5s" }}
        />
        <div
          className="absolute top-[26rem] left-1/3 h-72 w-72 animate-blob rounded-full bg-emerald-100/50 blur-3xl"
          style={{ animationDelay: "-9s" }}
        />
      </div>

      <Container className="relative pt-8 sm:pt-10">
        <header className="animate-rise">
          <p className="text-sm font-medium text-ink-500">{formatToday(now)}</p>
          <h1 className="mt-1 font-heading text-3xl font-extrabold tracking-tight text-balance text-ink-900 sm:text-4xl">
            {greeting(now)}
            {nome && `, ${nome}`}{" "}
            <span className="inline-block origin-[70%_70%] animate-wave" aria-hidden="true">
              👋
            </span>
          </h1>
          {data && (
            <p className="mt-2 max-w-xl text-base text-pretty text-ink-700" aria-live="polite">
              {daySentence(data)}
            </p>
          )}
        </header>

        {isLoading && <DashboardSkeleton />}

        {isError && (
          <div className="mt-8 rounded-2xl border border-red-200 bg-red-50 p-5 text-sm text-red-700">
            Não foi possível carregar seu painel. Verifique sua conexão e recarregue a página.
          </div>
        )}

        {data && (
          <>
            {/* Agora: próxima dose + relógio do dia */}
            <div className="mt-8 grid items-center gap-8 lg:grid-cols-12 lg:gap-10">
              <div className="animate-rise lg:col-span-7" style={{ animationDelay: "0.08s" }}>
                {data.timelineHoje.length === 0 ? (
                  <WelcomeCard hasMedications={data.medicamentosCadastrados > 0} hasTakenDose={hasTakenDose} />
                ) : (
                <NextDoseCard
                  item={next}
                  totalHoje={data.timelineHoje.length}
                  now={now}
                  onTake={toggleDose}
                  onSnooze={snooze}
                  isTaking={next ? isToggling(next) : false}
                  isSnoozing={next ? isSnoozing(next) : false}
                />
                )}
              </div>
              <div className="lg:col-span-5">
                <DayDial items={data.timelineHoje} now={now} />
                <div className="mt-3 animate-rise" style={{ animationDelay: "0.9s" }}>
                  <DayDialLegend />
                </div>
              </div>
            </div>

            {/* Progresso: sequência + adesão por dia */}
            {stats && (
              <section className="mt-12" aria-labelledby="progresso-title">
                <h2 id="progresso-title" className="font-heading text-xl font-bold text-ink-900">
                  Seu progresso
                </h2>
                <div className="mt-4 grid gap-6 lg:grid-cols-3">
                  <ScrollReveal className="h-full">
                    <Lift>
                      <StreakCard streak={stats.streak} days={stats.days} />
                    </Lift>
                  </ScrollReveal>
                  <ScrollReveal className="h-full lg:col-span-2" delay={120}>
                    <Lift>
                      <AdherenceChart
                        days={stats.days}
                        weekPct={data.adesaoSemanal ?? stats.thisWeekPct}
                        lastWeekPct={stats.lastWeekPct}
                      />
                    </Lift>
                  </ScrollReveal>
                </div>
              </section>
            )}

            {/* Hoje: lista de doses + apoio */}
            <div className="mt-12 grid gap-6 lg:grid-cols-12">
              <ScrollReveal className="lg:col-span-8">
              <section
                className="h-full rounded-3xl border border-ink-900/[0.06] bg-white p-5 shadow-soft sm:p-7"
                aria-labelledby="doses-title"
              >
                <div className="flex flex-wrap items-center justify-between gap-3">
                  <div className="flex items-center gap-2">
                    <CalendarClock className="h-5 w-5 text-brand-600" aria-hidden="true" />
                    <h2 id="doses-title" className="font-heading text-xl font-bold text-ink-900">
                      Doses de hoje
                    </h2>
                  </div>
                  <Button as="link" to="/dashboard/medicamentos" variant="secondary" size="md">
                    <PlusCircle className="h-4 w-4" aria-hidden="true" />
                    Adicionar medicamento
                  </Button>
                </div>

                {data.timelineHoje.length === 0 ? (
                  <div className="flex flex-col items-center py-12 text-center">
                    <div className="relative">
                      <span className="absolute inset-0 animate-ping rounded-full bg-brand-200/60" aria-hidden="true" />
                      <span className="relative flex h-16 w-16 animate-float items-center justify-center rounded-full bg-brand-50 text-brand-600">
                        <Pill className="h-7 w-7 rotate-45" aria-hidden="true" />
                      </span>
                    </div>
                    <p className="mt-5 font-heading text-lg font-bold text-ink-900">Nenhuma dose para hoje</p>
                    <p className="mt-1 max-w-xs text-sm text-pretty text-ink-500">
                      Quando você cadastrar um medicamento, as doses do dia aparecem aqui, separadas por manhã, tarde e noite.
                    </p>
                  </div>
                ) : (
                  <div className="mt-5">
                    <DayTimeline
                      items={data.timelineHoje}
                      now={now}
                      renderRow={(item) => (
                        <TimelineRow
                          key={`${item.medicationId}-${item.scheduledFor}`}
                          item={item}
                          isLoading={isToggling(item)}
                          onToggle={() => toggleDose(item)}
                          onSnooze={() => snooze(item)}
                          isSnoozing={isSnoozing(item)}
                        />
                      )}
                    />
                  </div>
                )}
              </section>
              </ScrollReveal>

              <aside className="flex flex-col gap-6 lg:col-span-4">
                {data.alertasEstoque.length > 0 && (
                  <ScrollReveal delay={100}>
                    <Lift>
                      <EstoqueAlertBanner alertas={data.alertasEstoque} />
                    </Lift>
                  </ScrollReveal>
                )}
                <ScrollReveal delay={180}>
                  <Lift>
                    <MedicationAdherence
                      items={stats?.perMedication ?? []}
                      mostMissed={stats?.mostMissed ?? null}
                      totalCadastrados={data.medicamentosCadastrados}
                    />
                  </Lift>
                </ScrollReveal>
              </aside>
            </div>
          </>
        )}
      </Container>
    </div>
  );
}
