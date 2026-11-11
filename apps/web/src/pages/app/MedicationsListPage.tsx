import { useMemo, useState } from "react";
import { AlarmClock, Pause, Pill, PlusCircle } from "lucide-react";
import { Container } from "../../components/ui/Container";
import { Button } from "../../components/ui/Button";
import { ConfirmDialog } from "../../components/ui/ConfirmDialog";
import { PageHeader } from "../../components/app/PageHeader";
import { EmptyState } from "../../components/ui/EmptyState";
import { Lift } from "../../components/ui/Lift";
import { CardsSkeleton } from "../../components/ui/CardsSkeleton";
import { StatPill } from "../../components/ui/StatPill";
import { MedicationCard } from "../../components/medications/MedicationCard";
import { MedicationFormModal } from "../../components/medications/MedicationFormModal";
import { ScheduleConflictBanner } from "../../components/medications/ScheduleConflictBanner";
import {
  useDeleteMedication,
  useMedications,
  useUpdateMedicationStatus,
} from "../../hooks/useMedications";
import { useSubscription } from "../../hooks/useSubscription";
import { findScheduleConflicts } from "../../lib/scheduleConflicts";
import type { Medication } from "../../types/medication";

export function MedicationsListPage() {
  const { data: medications, isLoading, isError } = useMedications();
  const { data: subscription } = useSubscription();
  const updateStatus = useUpdateMedicationStatus();
  const deleteMedication = useDeleteMedication();

  const conflictAlertEnabled = subscription?.capabilities.conflictAlertEnabled ?? false;
  const conflicts = useMemo(
    () => (conflictAlertEnabled && medications ? findScheduleConflicts(medications) : []),
    [conflictAlertEnabled, medications],
  );

  const ativos = medications?.filter((m) => m.status === "ATIVO") ?? [];
  const pausados = (medications?.length ?? 0) - ativos.length;
  const dosesPorDia = ativos.reduce((acc, m) => acc + m.horarios.length, 0);

  const [formState, setFormState] = useState<{ open: boolean; medication: Medication | null }>({
    open: false,
    medication: null,
  });
  const [medicationToDelete, setMedicationToDelete] = useState<Medication | null>(null);

  function openCreateForm() {
    setFormState({ open: true, medication: null });
  }

  function openEditForm(medication: Medication) {
    setFormState({ open: true, medication });
  }

  async function confirmDelete() {
    if (!medicationToDelete) return;
    await deleteMedication.mutateAsync(medicationToDelete.id);
    setMedicationToDelete(null);
  }

  return (
    <div className="pb-16">
      <PageHeader
        title="Meus medicamentos"
        icon={Pill}
        description="Cadastre, edite e acompanhe todos os seus medicamentos."
        action={
          <Button onClick={openCreateForm} size="lg">
            <PlusCircle className="h-5 w-5" aria-hidden="true" />
            Adicionar medicamento
          </Button>
        }
      />

      <Container className="pt-6 sm:pt-8">
        {isLoading && <CardsSkeleton />}

        {isError && (
          <div className="rounded-2xl border border-red-200 bg-red-50 p-5 text-sm text-red-700">
            Não foi possível carregar seus medicamentos agora. Tente novamente em instantes.
          </div>
        )}

        {medications && medications.length === 0 && (
          <EmptyState
            icon={Pill}
            title="Nenhum medicamento cadastrado"
            description="Adicione seu primeiro medicamento com os horários em que você toma. O MedLembre avisa na hora certa."
            action={
              <Button onClick={openCreateForm} size="lg">
                <PlusCircle className="h-5 w-5" aria-hidden="true" />
                Adicionar medicamento
              </Button>
            }
          >
            {/* Horários de exemplo flutuando */}
            <div className="relative mt-6 flex gap-2" aria-hidden="true">
              {["08:00", "14:00", "20:00"].map((h, i) => (
                <span
                  key={h}
                  className="animate-float rounded-full bg-brand-50 px-3 py-1.5 text-sm font-semibold text-brand-700 tabular-nums"
                  style={{ animationDelay: `${i * 0.6}s` }}
                >
                  {h}
                </span>
              ))}
            </div>
          </EmptyState>
        )}

        <ScheduleConflictBanner conflicts={conflicts} />

        {medications && medications.length > 0 && (
          <div className="mb-6 grid grid-cols-1 gap-3 sm:grid-cols-3">
            <StatPill icon={Pill} value={ativos.length} label={ativos.length === 1 ? "medicamento ativo" : "medicamentos ativos"} />
            <StatPill icon={AlarmClock} value={dosesPorDia} label="doses programadas por dia" tone="emerald" delay={0.06} />
            <StatPill icon={Pause} value={pausados} label={pausados === 1 ? "pausado" : "pausados"} tone="ink" delay={0.12} />
          </div>
        )}

        {medications && medications.length > 0 && (
          <div className="grid gap-5 sm:grid-cols-2 lg:grid-cols-3">
            {medications.map((medication, i) => (
              <div key={medication.id} className="animate-rise" style={{ animationDelay: `${0.1 + i * 0.06}s`, animationFillMode: "backwards" }}>
              <Lift>
              <MedicationCard
                medication={medication}
                onEdit={() => openEditForm(medication)}
                onDelete={() => setMedicationToDelete(medication)}
                isTogglingStatus={updateStatus.isPending && updateStatus.variables?.id === medication.id}
                onToggleStatus={() =>
                  updateStatus.mutate({
                    id: medication.id,
                    status: medication.status === "ATIVO" ? "PAUSADO" : "ATIVO",
                  })
                }
              />
              </Lift>
              </div>
            ))}
          </div>
        )}
      </Container>

      <MedicationFormModal
        isOpen={formState.open}
        medication={formState.medication}
        onClose={() => setFormState({ open: false, medication: null })}
      />

      <ConfirmDialog
        isOpen={Boolean(medicationToDelete)}
        title="Excluir medicamento"
        description={`Tem certeza que deseja excluir "${medicationToDelete?.nome}"? Essa ação não pode ser desfeita.`}
        confirmLabel="Excluir"
        isLoading={deleteMedication.isPending}
        onConfirm={confirmDelete}
        onCancel={() => setMedicationToDelete(null)}
      />
    </div>
  );
}
