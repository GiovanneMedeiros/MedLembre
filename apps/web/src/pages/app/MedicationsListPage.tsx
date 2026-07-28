import { useState } from "react";
import { Loader2, Pill, PlusCircle } from "lucide-react";
import { Container } from "../../components/ui/Container";
import { Button } from "../../components/ui/Button";
import { ConfirmDialog } from "../../components/ui/ConfirmDialog";
import { PageHeader } from "../../components/app/PageHeader";
import { MedicationCard } from "../../components/medications/MedicationCard";
import { MedicationFormModal } from "../../components/medications/MedicationFormModal";
import {
  useDeleteMedication,
  useMedications,
  useUpdateMedicationStatus,
} from "../../hooks/useMedications";
import type { Medication } from "../../types/medication";

export function MedicationsListPage() {
  const { data: medications, isLoading, isError } = useMedications();
  const updateStatus = useUpdateMedicationStatus();
  const deleteMedication = useDeleteMedication();

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
        description="Cadastre, edite e acompanhe todos os seus medicamentos."
        action={
          <Button onClick={openCreateForm}>
            <PlusCircle className="h-4 w-4" />
            Adicionar medicamento
          </Button>
        }
      />

      <Container className="pt-6 sm:pt-8">
        {isLoading && (
          <div className="flex items-center justify-center py-24 text-ink-300">
            <Loader2 className="h-6 w-6 animate-spin" />
          </div>
        )}

        {isError && (
          <div className="rounded-2xl border border-red-200 bg-red-50 p-5 text-sm text-red-700">
            Não foi possível carregar seus medicamentos agora. Tente novamente em instantes.
          </div>
        )}

        {medications && medications.length === 0 && (
          <div className="flex flex-col items-center rounded-2xl border border-dashed border-ink-900/15 bg-white py-16 text-center">
            <div className="flex h-14 w-14 items-center justify-center rounded-2xl bg-brand-50 text-brand-600">
              <Pill className="h-7 w-7" aria-hidden="true" />
            </div>
            <h2 className="mt-4 text-lg font-bold text-ink-900">Nenhum medicamento cadastrado</h2>
            <p className="mt-1 max-w-sm text-sm text-ink-500">
              Adicione seu primeiro medicamento para começar a receber lembretes.
            </p>
            <Button className="mt-6" onClick={openCreateForm}>
              <PlusCircle className="h-4 w-4" />
              Adicionar medicamento
            </Button>
          </div>
        )}

        {medications && medications.length > 0 && (
          <div className="grid gap-4 sm:grid-cols-2 lg:grid-cols-3">
            {medications.map((medication) => (
              <MedicationCard
                key={medication.id}
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
