import { useState } from "react";
import { useNavigate } from "react-router-dom";
import { Sparkles, UserPlus, Users } from "lucide-react";
import { Container } from "../../components/ui/Container";
import { Button } from "../../components/ui/Button";
import { ConfirmDialog } from "../../components/ui/ConfirmDialog";
import { PageHeader } from "../../components/app/PageHeader";
import { EmptyState } from "../../components/ui/EmptyState";
import { Lift } from "../../components/ui/Lift";
import { CardsSkeleton } from "../../components/ui/CardsSkeleton";
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
      <div className="pb-16">
        <PageHeader title="Família" icon={Users} description="Acompanhe a rotina de medicamentos de quem você cuida." />
        <Container className="pt-6 sm:pt-8">
          <CardsSkeleton count={3} itemClassName="h-24" />
        </Container>
      </div>
    );
  }

  if (subscription && !subscription.hasFamilyAccess) {
    return (
      <div className="pb-16">
        <PageHeader title="Família" icon={Users} description="Acompanhe a rotina de medicamentos de quem você cuida." />
        <Container className="pt-6 sm:pt-8">
          <EmptyState
            icon={Sparkles}
            title="Disponível nos planos Família e Premium"
            description="Faça upgrade para cadastrar familiares e acompanhar os medicamentos de quem você cuida."
            action={
              <Button size="lg" onClick={() => navigate("/dashboard/assinatura")}>
                <Sparkles className="h-5 w-5" aria-hidden="true" />
                Ver planos
              </Button>
            }
          >
            {/* Avatares de exemplo pulando */}
            <div className="relative mt-6 flex -space-x-3" aria-hidden="true">
              {[
                ["MA", "from-brand-400 to-brand-600"],
                ["JO", "from-sky-400 to-blue-600"],
                ["VÓ", "from-emerald-400 to-teal-600"],
                ["PA", "from-amber-400 to-orange-600"],
              ].map(([label, gradient], i) => (
                <span
                  key={label}
                  className={`flex h-12 w-12 animate-float items-center justify-center rounded-full bg-gradient-to-br text-sm font-bold text-white ring-4 ring-white ${gradient}`}
                  style={{ animationDelay: `${i * 0.35}s` }}
                >
                  {label}
                </span>
              ))}
            </div>
          </EmptyState>
        </Container>
      </div>
    );
  }

  return (
    <div className="pb-16">
      <PageHeader
        title="Família"
        icon={Users}
        description="Acompanhe a rotina de medicamentos de quem você cuida."
        action={
          <Button onClick={openCreateForm} size="lg">
            <UserPlus className="h-5 w-5" aria-hidden="true" />
            Adicionar familiar
          </Button>
        }
      />

      <Container className="pt-6 sm:pt-8">
        {isLoading && <CardsSkeleton count={3} itemClassName="h-24" />}

        {isError && (
          <div className="rounded-2xl border border-red-200 bg-red-50 p-5 text-sm text-red-700">
            Não foi possível carregar seus familiares agora. Tente novamente em instantes.
          </div>
        )}

        {familyMembers && familyMembers.length === 0 && (
          <EmptyState
            icon={Users}
            title="Nenhum familiar cadastrado"
            description="Adicione um familiar para acompanhar os medicamentos dele e receber avisos quando uma dose for esquecida."
            action={
              <Button size="lg" onClick={openCreateForm}>
                <UserPlus className="h-5 w-5" aria-hidden="true" />
                Adicionar familiar
              </Button>
            }
          />
        )}

        {familyMembers && familyMembers.length > 0 && (
          <div className="grid gap-5 sm:grid-cols-2 lg:grid-cols-3">
            {familyMembers.map((familyMember, i) => (
              <div
                key={familyMember.id}
                className="animate-rise"
                style={{ animationDelay: `${0.08 + i * 0.06}s`, animationFillMode: "backwards" }}
              >
                <Lift>
                  <FamilyMemberCard
                    familyMember={familyMember}
                    onEdit={() => openEditForm(familyMember)}
                    onDelete={() => setMemberToDelete(familyMember)}
                  />
                </Lift>
              </div>
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
