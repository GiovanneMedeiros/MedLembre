import { useState } from "react";
import { useNavigate } from "react-router-dom";
import { Loader2, Sparkles, UserPlus, Users } from "lucide-react";
import { Container } from "../../components/ui/Container";
import { Button } from "../../components/ui/Button";
import { ConfirmDialog } from "../../components/ui/ConfirmDialog";
import { PageHeader } from "../../components/app/PageHeader";
import { FamilyMemberCard } from "../../components/family/FamilyMemberCard";
import { FamilyMemberFormModal } from "../../components/family/FamilyMemberFormModal";
import { useDeleteFamilyMember, useFamilyMembers } from "../../hooks/useFamilyMembers";
import { useSubscription } from "../../hooks/useSubscription";
import type { FamilyMember } from "../../types/familyMember";

export function FamiliaPage() {
  const navigate = useNavigate();
  const { data: subscription, isLoading: isLoadingSubscription } = useSubscription();
  const { data: familyMembers, isLoading, isError } = useFamilyMembers();
  const deleteFamilyMember = useDeleteFamilyMember();

  const [formState, setFormState] = useState<{ open: boolean; familyMember: FamilyMember | null }>({
    open: false,
    familyMember: null,
  });
  const [memberToDelete, setMemberToDelete] = useState<FamilyMember | null>(null);

  function openCreateForm() {
    setFormState({ open: true, familyMember: null });
  }

  function openEditForm(familyMember: FamilyMember) {
    setFormState({ open: true, familyMember });
  }

  async function confirmDelete() {
    if (!memberToDelete) return;
    await deleteFamilyMember.mutateAsync(memberToDelete.id);
    setMemberToDelete(null);
  }

  if (isLoadingSubscription) {
    return (
      <div className="flex items-center justify-center py-24 text-ink-300">
        <Loader2 className="h-6 w-6 animate-spin" />
      </div>
    );
  }

  if (subscription && !subscription.hasFamilyAccess) {
    return (
      <div className="pb-16">
        <PageHeader title="Família" description="Acompanhe a rotina de medicamentos de quem você cuida." />
        <Container className="pt-6 sm:pt-8">
          <div className="flex flex-col items-center rounded-2xl border border-dashed border-ink-900/15 bg-white py-16 text-center">
            <div className="flex h-14 w-14 items-center justify-center rounded-2xl bg-brand-50 text-brand-600">
              <Sparkles className="h-7 w-7" aria-hidden="true" />
            </div>
            <h2 className="mt-4 text-lg font-bold text-ink-900">Disponível nos planos Família e Premium</h2>
            <p className="mt-1 max-w-sm text-sm text-ink-500">
              Faça upgrade para cadastrar familiares e acompanhar os medicamentos de quem você cuida.
            </p>
            <Button className="mt-6" onClick={() => navigate("/dashboard/assinatura")}>
              Ver planos
            </Button>
          </div>
        </Container>
      </div>
    );
  }

  return (
    <div className="pb-16">
      <PageHeader
        title="Família"
        description="Acompanhe a rotina de medicamentos de quem você cuida."
        action={
          <Button onClick={openCreateForm}>
            <UserPlus className="h-4 w-4" />
            Adicionar familiar
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
            Não foi possível carregar seus familiares agora. Tente novamente em instantes.
          </div>
        )}

        {familyMembers && familyMembers.length === 0 && (
          <div className="flex flex-col items-center rounded-2xl border border-dashed border-ink-900/15 bg-white py-16 text-center">
            <div className="flex h-14 w-14 items-center justify-center rounded-2xl bg-brand-50 text-brand-600">
              <Users className="h-7 w-7" aria-hidden="true" />
            </div>
            <h2 className="mt-4 text-lg font-bold text-ink-900">Nenhum familiar cadastrado</h2>
            <p className="mt-1 max-w-sm text-sm text-ink-500">
              Adicione um familiar para começar a acompanhar os medicamentos dele.
            </p>
            <Button className="mt-6" onClick={openCreateForm}>
              <UserPlus className="h-4 w-4" />
              Adicionar familiar
            </Button>
          </div>
        )}

        {familyMembers && familyMembers.length > 0 && (
          <div className="grid gap-4 sm:grid-cols-2 lg:grid-cols-3">
            {familyMembers.map((familyMember) => (
              <FamilyMemberCard
                key={familyMember.id}
                familyMember={familyMember}
                onEdit={() => openEditForm(familyMember)}
                onDelete={() => setMemberToDelete(familyMember)}
              />
            ))}
          </div>
        )}
      </Container>

      <FamilyMemberFormModal
        isOpen={formState.open}
        familyMember={formState.familyMember}
        onClose={() => setFormState({ open: false, familyMember: null })}
      />

      <ConfirmDialog
        isOpen={Boolean(memberToDelete)}
        title="Excluir familiar"
        description={`Tem certeza que deseja excluir "${memberToDelete?.nome}"? Os medicamentos associados a esse familiar também serão excluídos.`}
        confirmLabel="Excluir"
        isLoading={deleteFamilyMember.isPending}
        onConfirm={confirmDelete}
        onCancel={() => setMemberToDelete(null)}
      />
    </div>
  );
}
