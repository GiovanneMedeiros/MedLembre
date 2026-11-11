import { CheckCircle2, History, Sparkles, XCircle } from "lucide-react";
import { useNavigate } from "react-router-dom";
import { Container } from "../../components/ui/Container";
import { Button } from "../../components/ui/Button";
import { PageHeader } from "../../components/app/PageHeader";
import { EmptyState } from "../../components/ui/EmptyState";
import { CardsSkeleton } from "../../components/ui/CardsSkeleton";
import { ScrollReveal } from "../../components/ui/ScrollReveal";
import { StatPill } from "../../components/ui/StatPill";
import { RingStat } from "../../components/ui/RingStat";
import { TimelineRow } from "../../components/medications/TimelineRow";
import { useHistorico } from "../../hooks/useHistorico";
import { useMarkDose, useUnmarkDose } from "../../hooks/useMedications";
import { formatDateBR, toLocalDateString, todayLocalDateString, weekdayLabel } from "../../lib/date";
import type { TimelineItem } from "../../types/dashboard";

function dateLabel(dateOnly: string): string {
  const today = todayLocalDateString();
  if (dateOnly === today) return "Hoje";

  const yesterday = new Date();
  yesterday.setDate(yesterday.getDate() - 1);
  const yesterdayOnly = toLocalDateString(yesterday);
  if (dateOnly === yesterdayOnly) return "Ontem";

  const dayOfWeek = new Date(`${dateOnly}T00:00:00`).getDay();
  return `${weekdayLabel(dayOfWeek, true)} · ${formatDateBR(dateOnly)}`;
}

function groupByDate(items: TimelineItem[]): Array<[string, TimelineItem[]]> {
  const groups = new Map<string, TimelineItem[]>();
  for (const item of items) {
    const dateOnly = item.scheduledFor.slice(0, 10);
    const group = groups.get(dateOnly) ?? [];
    group.push(item);
    groups.set(dateOnly, group);
  }
  return [...groups.entries()];
}

export function HistoricoPage() {
  const navigate = useNavigate();
  const { data, isLoading, isError } = useHistorico();
  const markDose = useMarkDose();
  const unmarkDose = useUnmarkDose();

  function toggleDose(medicationId: string, scheduledFor: string, isTaken: boolean) {
    if (isTaken) {
      unmarkDose.mutate({ medicationId, scheduledFor });
    } else {
      markDose.mutate({ medicationId, scheduledFor });
    }
  }

  const isTogglingKey = (medicationId: string, scheduledFor: string) =>
    (markDose.isPending &&
      markDose.variables?.medicationId === medicationId &&
      markDose.variables?.scheduledFor === scheduledFor) ||
    (unmarkDose.isPending &&
      unmarkDose.variables?.medicationId === medicationId &&
      unmarkDose.variables?.scheduledFor === scheduledFor);

  const groups = data ? groupByDate(data.items) : [];
  const tomados = data?.items.filter((item) => item.status === "tomado").length ?? 0;
  const perdidos = data?.items.filter((item) => item.status === "perdido").length ?? 0;
  const adesao = tomados + perdidos > 0 ? Math.round((tomados / (tomados + perdidos)) * 100) : null;

  return (
    <div className="pb-16">
      <PageHeader title="Histórico" icon={History} description="Doses tomadas e perdidas dos últimos dias." />

      <Container className="pt-6 sm:pt-8">
        {isLoading && <CardsSkeleton count={3} className="sm:grid-cols-1 lg:grid-cols-1" itemClassName="h-40" />}

        {isError && (
          <div className="rounded-2xl border border-red-200 bg-red-50 p-5 text-sm text-red-700">
            Não foi possível carregar seu histórico agora. Tente novamente em instantes.
          </div>
        )}

        {data && (
          <>
            <div className="grid grid-cols-1 gap-3 sm:grid-cols-3">
              <StatPill icon={CheckCircle2} value={tomados} label={tomados === 1 ? "dose tomada" : "doses tomadas"} tone="emerald" />
              <StatPill icon={XCircle} value={perdidos} label={perdidos === 1 ? "dose perdida" : "doses perdidas"} tone="ink" delay={0.06} />
              <RingStat pct={adesao} label="de adesão no período" delay={0.12} />
            </div>

            {data.limiteDias && (
              <div
                className="mt-4 flex animate-rise flex-wrap items-center justify-between gap-3 rounded-2xl border border-dashed border-brand-200 bg-brand-50/80 px-5 py-3"
                style={{ animationDelay: "0.18s" }}
              >
                <p className="text-sm text-brand-700">
                  Seu plano mostra os últimos {data.limiteDias} dias. Faça upgrade para ver o histórico completo.
                </p>
                <Button
                  size="md"
                  variant="secondary"
                  className="h-9 shrink-0 px-4 text-xs"
                  onClick={() => navigate("/dashboard/assinatura")}
                >
                  <Sparkles className="h-3.5 w-3.5 animate-pulse-soft" aria-hidden="true" />
                  Upgrade
                </Button>
              </div>
            )}

            {groups.length === 0 ? (
              <div className="mt-6">
                <EmptyState
                  icon={History}
                  title="Nenhum registro ainda"
                  description="Assim que houver doses tomadas ou perdidas, elas aparecem aqui, organizadas por dia."
                />
              </div>
            ) : (
              <div className="mt-6 flex flex-col gap-6">
                {groups.map(([dateOnly, items], gi) => {
                  const dayTaken = items.filter((item) => item.status === "tomado").length;
                  const dayPct = Math.round((dayTaken / items.length) * 100);
                  const complete = dayTaken === items.length;
                  return (
                  <ScrollReveal key={dateOnly} delay={Math.min(gi, 4) * 60}>
                  <div className="rounded-3xl border border-ink-900/[0.06] bg-white p-5 shadow-soft transition-shadow duration-300 hover:shadow-lift sm:p-6">
                    <div className="flex flex-wrap items-center justify-between gap-3">
                      <h2 className="font-heading text-base font-bold text-ink-900">{dateLabel(dateOnly)}</h2>
                      <span
                        className={
                          complete
                            ? "rounded-full bg-emerald-50 px-2.5 py-1 text-xs font-semibold text-emerald-700 tabular-nums"
                            : "rounded-full bg-ink-900/[0.05] px-2.5 py-1 text-xs font-semibold text-ink-500 tabular-nums"
                        }
                      >
                        {complete ? "Dia completo" : `${dayTaken} de ${items.length} tomadas`}
                      </span>
                    </div>
                    <div className="mt-3 h-1.5 overflow-hidden rounded-full bg-ink-900/[0.06]" aria-hidden="true">
                      <div
                        className={complete ? "h-full rounded-full bg-emerald-500" : "h-full rounded-full bg-amber-400"}
                        style={{ width: `${Math.max(dayPct, 3)}%`, animation: "grow-x 1s cubic-bezier(0.16,1,0.3,1) both", transformOrigin: "left" }}
                      />
                    </div>
                    <ul className="mt-1 divide-y divide-ink-900/[0.06]">
                      {items.map((item) => (
                        <TimelineRow
                          key={`${item.medicationId}-${item.scheduledFor}`}
                          item={item}
                          isLoading={isTogglingKey(item.medicationId, item.scheduledFor)}
                          onToggle={() =>
                            toggleDose(item.medicationId, item.scheduledFor, item.status === "tomado")
                          }
                        />
                      ))}
                    </ul>
                  </div>
                  </ScrollReveal>
                  );
                })}
              </div>
            )}
          </>
        )}
      </Container>
    </div>
  );
}
