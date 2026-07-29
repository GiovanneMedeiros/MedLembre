import { History, Loader2, Sparkles } from "lucide-react";
import { useNavigate } from "react-router-dom";
import { Container } from "../../components/ui/Container";
import { Button } from "../../components/ui/Button";
import { PageHeader } from "../../components/app/PageHeader";
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

  return (
    <div className="pb-16">
      <PageHeader title="Histórico" description="Doses tomadas e perdidas dos últimos dias." />

      <Container className="pt-6 sm:pt-8">
        {isLoading && (
          <div className="flex items-center justify-center py-24 text-ink-300">
            <Loader2 className="h-6 w-6 animate-spin" />
          </div>
        )}

        {isError && (
          <div className="rounded-2xl border border-red-200 bg-red-50 p-5 text-sm text-red-700">
            Não foi possível carregar seu histórico agora. Tente novamente em instantes.
          </div>
        )}

        {data && (
          <>
            <div className="grid grid-cols-2 gap-4">
              <div className="rounded-2xl border border-ink-900/[0.06] bg-white p-5 shadow-soft">
                <p className="text-2xl font-bold text-emerald-600">{tomados}</p>
                <p className="text-sm text-ink-500">Tomados</p>
              </div>
              <div className="rounded-2xl border border-ink-900/[0.06] bg-white p-5 shadow-soft">
                <p className="text-2xl font-bold text-ink-500">{perdidos}</p>
                <p className="text-sm text-ink-500">Perdidos</p>
              </div>
            </div>

            {data.limiteDias && (
              <div className="mt-4 flex items-center justify-between gap-3 rounded-2xl border border-dashed border-brand-200 bg-brand-50 px-5 py-3">
                <p className="text-sm text-brand-700">
                  Seu plano mostra os últimos {data.limiteDias} dias. Faça upgrade para ver o histórico completo.
                </p>
                <Button
                  size="md"
                  variant="secondary"
                  className="h-9 shrink-0 px-4 text-xs"
                  onClick={() => navigate("/dashboard/assinatura")}
                >
                  <Sparkles className="h-3.5 w-3.5" />
                  Upgrade
                </Button>
              </div>
            )}

            {groups.length === 0 ? (
              <div className="mt-6 flex flex-col items-center rounded-2xl border border-dashed border-ink-900/15 bg-white py-16 text-center">
                <div className="flex h-14 w-14 items-center justify-center rounded-2xl bg-brand-50 text-brand-600">
                  <History className="h-7 w-7" aria-hidden="true" />
                </div>
                <h2 className="mt-4 text-lg font-bold text-ink-900">Nenhum registro ainda</h2>
                <p className="mt-1 max-w-sm text-sm text-ink-500">
                  Assim que houver doses tomadas ou perdidas, elas aparecem aqui.
                </p>
              </div>
            ) : (
              <div className="mt-6 flex flex-col gap-6">
                {groups.map(([dateOnly, items]) => (
                  <div
                    key={dateOnly}
                    className="rounded-2xl border border-ink-900/[0.06] bg-white p-5 shadow-soft sm:p-6"
                  >
                    <h2 className="text-sm font-bold text-ink-900">{dateLabel(dateOnly)}</h2>
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
                ))}
              </div>
            )}
          </>
        )}
      </Container>
    </div>
  );
}
