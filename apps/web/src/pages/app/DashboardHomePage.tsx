import { useNavigate } from "react-router-dom";
import { AlarmClock, CalendarClock, CheckCircle2, ListTodo, Loader2, Pill, PlusCircle } from "lucide-react";
import { Container } from "../../components/ui/Container";
import { Button } from "../../components/ui/Button";
import { StatCard } from "../../components/app/StatCard";
import { AdherenceCard } from "../../components/app/AdherenceCard";
import { TimelineRow } from "../../components/medications/TimelineRow";
import { useAuth } from "../../contexts/AuthContext";
import { useDashboardSummary } from "../../hooks/useDashboardSummary";
import { useMarkDose, useSnoozeDose, useUnmarkDose } from "../../hooks/useMedications";
import { formatTimeBR } from "../../lib/date";

export function DashboardHomePage() {
  const { user } = useAuth();
  const navigate = useNavigate();
  const { data, isLoading, isError } = useDashboardSummary();
  const markDose = useMarkDose();
  const unmarkDose = useUnmarkDose();
  const snoozeDose = useSnoozeDose();

  const nome = (user?.user_metadata?.nome as string | undefined)?.split(" ")[0] ?? "";

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

  return (
    <div className="pb-16">
      <div className="border-b border-ink-900/[0.06] bg-white">
        <Container className="py-6 sm:py-8">
          <h1 className="text-2xl font-bold text-ink-900 sm:text-[28px]">Olá, {nome} 👋</h1>
          <p className="mt-1 text-sm text-ink-500">Veja como está sua rotina hoje.</p>
        </Container>
      </div>

      <Container className="pt-6 sm:pt-8">
        {isLoading && (
          <div className="flex items-center justify-center py-24 text-ink-300">
            <Loader2 className="h-6 w-6 animate-spin" />
          </div>
        )}

        {isError && (
          <div className="rounded-2xl border border-red-200 bg-red-50 p-5 text-sm text-red-700">
            Não foi possível carregar seu dashboard agora. Tente novamente em instantes.
          </div>
        )}

        {data && (
          <>
            <div className="grid gap-4 sm:grid-cols-2 lg:grid-cols-4">
              <StatCard label="Medicamentos cadastrados" value={String(data.medicamentosCadastrados)} icon={Pill} accent="brand" />
              <StatCard
                label="Próximo medicamento"
                value={data.proximoMedicamento ? `${formatTimeBR(data.proximoMedicamento.scheduledFor)} · ${data.proximoMedicamento.nome}` : "Nenhum"}
                icon={AlarmClock}
                accent="ink"
              />
              <StatCard label="Tomados hoje" value={String(data.medicamentosTomadosHoje)} icon={CheckCircle2} accent="emerald" />
              <StatCard label="Lembretes pendentes" value={String(data.lembretesPendentesHoje)} icon={ListTodo} accent="amber" />
            </div>

            <AdherenceCard adesaoSemanal={data.adesaoSemanal} />

            <div className="mt-8 rounded-2xl border border-ink-900/[0.06] bg-white p-5 shadow-soft sm:p-6">
              <div className="flex items-center justify-between">
                <div className="flex items-center gap-2">
                  <CalendarClock className="h-5 w-5 text-brand-600" aria-hidden="true" />
                  <h2 className="text-base font-bold text-ink-900">Timeline de hoje</h2>
                </div>
                <Button size="md" onClick={() => navigate("/dashboard/medicamentos")}>
                  <PlusCircle className="h-4 w-4" />
                  Adicionar medicamento
                </Button>
              </div>

              {data.timelineHoje.length === 0 ? (
                <div className="py-12 text-center">
                  <p className="text-sm text-ink-500">Nenhum medicamento programado para hoje.</p>
                </div>
              ) : (
                <ul className="mt-2 divide-y divide-ink-900/[0.06]">
                  {data.timelineHoje.map((item) => (
                    <TimelineRow
                      key={`${item.medicationId}-${item.scheduledFor}`}
                      item={item}
                      isLoading={isTogglingKey(item.medicationId, item.scheduledFor)}
                      onToggle={() => toggleDose(item.medicationId, item.scheduledFor, item.status === "tomado")}
                      onSnooze={() =>
                        snoozeDose.mutateAsync({ medicationId: item.medicationId, scheduledFor: item.scheduledFor })
                      }
                      isSnoozing={
                        snoozeDose.isPending &&
                        snoozeDose.variables?.medicationId === item.medicationId &&
                        snoozeDose.variables?.scheduledFor === item.scheduledFor
                      }
                    />
                  ))}
                </ul>
              )}
            </div>
          </>
        )}
      </Container>
    </div>
  );
}
