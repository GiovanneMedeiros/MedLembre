import { useEffect, useState } from "react";
import { useNavigate } from "react-router-dom";
import {
  Bell,
  BellOff,
  ChevronRight,
  Download,
  KeyRound,
  Mail,
  Phone,
  ShieldAlert,
  Trash2,
  Type,
  User,
} from "lucide-react";
import { Container } from "../../components/ui/Container";
import { Button } from "../../components/ui/Button";
import { ConfirmDialog } from "../../components/ui/ConfirmDialog";
import { PageHeader } from "../../components/app/PageHeader";
import { inputClassName } from "../../components/auth/inputClassName";
import { useAuth } from "../../contexts/AuthContext";
import { useSubscription } from "../../hooks/useSubscription";
import { useHistorico } from "../../hooks/useHistorico";
import {
  useCreateEmergencyContact,
  useDeleteEmergencyContact,
  useEmergencyContacts,
} from "../../hooks/useEmergencyContacts";
import { api, ApiError } from "../../lib/api";
import { formatWhatsAppInput, isValidBrazilianWhatsApp, normalizePhoneDigits } from "../../lib/phone";
import { formatDateBR } from "../../lib/date";
import {
  disablePushNotifications,
  enablePushNotifications,
  getExistingSubscription,
  isPushSupported,
} from "../../lib/push";
import { isLargeTextEnabled, setLargeText } from "../../lib/fontScale";

const SUPPORT_EMAIL = "contatomedlembre@gmail.com";
const PRIORITY_SUPPORT_PLANS = ["FAMILIA", "PREMIUM"];

export function ConfiguracoesPage() {
  const { user, signOut, updateProfile } = useAuth();
  const navigate = useNavigate();
  const { data: subscription } = useSubscription();
  const { data: historico } = useHistorico();

  const [pushEnabled, setPushEnabled] = useState(false);
  const [pushLoading, setPushLoading] = useState(false);
  const [pushError, setPushError] = useState<string | null>(null);

  const [isEditingProfile, setIsEditingProfile] = useState(false);
  const [nomeInput, setNomeInput] = useState("");
  const [telefoneInput, setTelefoneInput] = useState("");
  const [profileError, setProfileError] = useState<string | null>(null);
  const [profileSaving, setProfileSaving] = useState(false);

  const [showDeleteDialog, setShowDeleteDialog] = useState(false);
  const [deleteError, setDeleteError] = useState<string | null>(null);
  const [isDeleting, setIsDeleting] = useState(false);

  const { data: emergencyContacts } = useEmergencyContacts();
  const createEmergencyContact = useCreateEmergencyContact();
  const deleteEmergencyContact = useDeleteEmergencyContact();
  const [isAddingContact, setIsAddingContact] = useState(false);
  const [contactNome, setContactNome] = useState("");
  const [contactWhatsapp, setContactWhatsapp] = useState("");
  const [contactError, setContactError] = useState<string | null>(null);

  const [largeText, setLargeTextState] = useState(false);
  useEffect(() => {
    setLargeTextState(isLargeTextEnabled());
  }, []);

  function handleToggleLargeText() {
    const next = !largeText;
    setLargeText(next);
    setLargeTextState(next);
  }

  useEffect(() => {
    if (!isPushSupported()) return;
    getExistingSubscription().then((sub) => setPushEnabled(Boolean(sub)));
  }, []);

  async function handleTogglePush() {
    setPushError(null);
    setPushLoading(true);
    try {
      if (pushEnabled) {
        await disablePushNotifications();
        setPushEnabled(false);
      } else {
        await enablePushNotifications();
        setPushEnabled(true);
      }
    } catch (error) {
      setPushError(error instanceof Error ? error.message : "Não foi possível atualizar as notificações.");
    } finally {
      setPushLoading(false);
    }
  }

  const nome = (user?.user_metadata?.nome as string | undefined) ?? "";
  const whatsapp = (user?.user_metadata?.whatsapp as string | undefined) ?? "";

  function startEditingProfile() {
    setProfileError(null);
    setNomeInput(nome);
    setTelefoneInput(whatsapp ? formatWhatsAppInput(whatsapp) : "");
    setIsEditingProfile(true);
  }

  async function handleSaveProfile() {
    if (nomeInput.trim().length < 2) {
      setProfileError("O nome deve ter no mínimo 2 caracteres.");
      return;
    }
    setProfileError(null);
    setProfileSaving(true);
    try {
      await updateProfile({ nome: nomeInput.trim(), telefone: telefoneInput });
      setIsEditingProfile(false);
    } catch (error) {
      setProfileError(error instanceof Error ? error.message : "Não foi possível salvar seus dados.");
    } finally {
      setProfileSaving(false);
    }
  }

  const infoItems = [
    { label: "Nome", value: nome || "—", icon: User },
    { label: "E-mail", value: user?.email ?? "—", icon: Mail },
    { label: "Telefone", value: whatsapp ? formatWhatsAppInput(whatsapp) : "—", icon: Phone },
  ];

  const hasPrioritySupport = subscription ? PRIORITY_SUPPORT_PLANS.includes(subscription.plano) : false;
  const canExportHistory = subscription ? subscription.plano !== "GRATIS" : false;
  const maxEmergencyContacts = subscription?.capabilities.maxEmergencyContacts ?? 0;
  const canAddMoreContacts = (emergencyContacts?.length ?? 0) < maxEmergencyContacts;

  async function handleAddContact() {
    if (contactNome.trim().length < 2) {
      setContactError("O nome deve ter no mínimo 2 caracteres.");
      return;
    }
    if (!isValidBrazilianWhatsApp(contactWhatsapp)) {
      setContactError("Informe um número de WhatsApp válido, com DDD.");
      return;
    }
    setContactError(null);
    try {
      await createEmergencyContact.mutateAsync({
        nome: contactNome.trim(),
        whatsapp: normalizePhoneDigits(contactWhatsapp),
      });
      setContactNome("");
      setContactWhatsapp("");
      setIsAddingContact(false);
    } catch (error) {
      setContactError(error instanceof ApiError ? error.message : "Não foi possível salvar o contato.");
    }
  }

  function handleExportHistory() {
    if (!historico) return;

    const header = "Medicamento;Dosagem;Horário;Data;Status\n";
    const rows = historico.items
      .map((item) => {
        const [dateOnly] = item.scheduledFor.split("T");
        const statusLabel =
          item.status === "tomado" ? "Tomado" : item.status === "perdido" ? "Perdido" : item.status;
        return [item.nome, item.dosagem, item.horario, formatDateBR(dateOnly), statusLabel].join(";");
      })
      .join("\n");

    const blob = new Blob([`﻿${header}${rows}`], { type: "text/csv;charset=utf-8;" });
    const url = URL.createObjectURL(blob);
    const link = document.createElement("a");
    link.href = url;
    link.download = "historico-medlembre.csv";
    link.click();
    URL.revokeObjectURL(url);
  }

  async function handleDeleteAccount() {
    setDeleteError(null);
    setIsDeleting(true);
    try {
      await api.delete("/auth/me");
      await signOut();
      navigate("/", { replace: true });
    } catch (error) {
      setDeleteError(error instanceof ApiError ? error.message : "Não foi possível excluir sua conta agora.");
      setIsDeleting(false);
    }
  }

  return (
    <div className="pb-16">
      <PageHeader title="Configurações" description="Gerencie os dados da sua conta." />

      <Container className="max-w-2xl pt-6 sm:pt-8">
        <div className="rounded-2xl border border-ink-900/[0.06] bg-white shadow-soft">
          <div className="flex items-center justify-between border-b border-ink-900/[0.06] px-5 py-4">
            <h2 className="text-sm font-bold text-ink-900">Meus dados</h2>
            {!isEditingProfile && (
              <button
                type="button"
                onClick={startEditingProfile}
                className="text-xs font-semibold text-brand-600 hover:text-brand-700"
              >
                Editar
              </button>
            )}
          </div>

          {isEditingProfile ? (
            <div className="flex flex-col gap-4 px-5 py-4">
              {profileError && <p className="text-sm text-red-600">{profileError}</p>}
              <div>
                <label htmlFor="config-nome" className="mb-1.5 block text-sm font-medium text-ink-700">
                  Nome completo
                </label>
                <input
                  id="config-nome"
                  className={inputClassName}
                  value={nomeInput}
                  onChange={(e) => setNomeInput(e.target.value)}
                />
              </div>
              <div>
                <label htmlFor="config-telefone" className="mb-1.5 block text-sm font-medium text-ink-700">
                  Telefone (opcional)
                </label>
                <input
                  id="config-telefone"
                  className={inputClassName}
                  value={telefoneInput}
                  onChange={(e) => setTelefoneInput(formatWhatsAppInput(e.target.value))}
                  placeholder="(11) 91234-5678"
                />
              </div>
              <div className="flex justify-end gap-3">
                <Button variant="secondary" size="md" onClick={() => setIsEditingProfile(false)} disabled={profileSaving}>
                  Cancelar
                </Button>
                <Button variant="primary" size="md" onClick={handleSaveProfile} disabled={profileSaving}>
                  {profileSaving ? "Salvando..." : "Salvar"}
                </Button>
              </div>
            </div>
          ) : (
            <div className="divide-y divide-ink-900/[0.06]">
              {infoItems.map((item) => (
                <div key={item.label} className="flex items-center gap-3 px-5 py-4">
                  <item.icon className="h-4 w-4 text-brand-500" aria-hidden="true" />
                  <span className="w-24 shrink-0 text-sm text-ink-500">{item.label}</span>
                  <span className="truncate text-sm font-medium text-ink-900">{item.value}</span>
                </div>
              ))}
            </div>
          )}
        </div>

        {isPushSupported() && (
          <div className="mt-6 rounded-2xl border border-ink-900/[0.06] bg-white shadow-soft">
            <div className="border-b border-ink-900/[0.06] px-5 py-4">
              <h2 className="text-sm font-bold text-ink-900">Notificações</h2>
            </div>
            <div className="flex items-center gap-3 px-5 py-4">
              {pushEnabled ? (
                <Bell className="h-4 w-4 text-brand-500" aria-hidden="true" />
              ) : (
                <BellOff className="h-4 w-4 text-ink-300" aria-hidden="true" />
              )}
              <div className="flex-1">
                <p className="text-sm font-medium text-ink-900">Lembretes neste navegador</p>
                <p className="text-xs text-ink-500">Gratuito e funciona direto no navegador.</p>
                {pushError && <p className="mt-1 text-xs text-red-600">{pushError}</p>}
              </div>
              <Button
                type="button"
                variant={pushEnabled ? "secondary" : "primary"}
                size="md"
                className="h-9 px-4 text-xs"
                disabled={pushLoading}
                onClick={handleTogglePush}
              >
                {pushLoading ? "Aguarde..." : pushEnabled ? "Desativar" : "Ativar"}
              </Button>
            </div>
          </div>
        )}

        <div className="mt-6 rounded-2xl border border-ink-900/[0.06] bg-white shadow-soft">
          <div className="border-b border-ink-900/[0.06] px-5 py-4">
            <h2 className="text-sm font-bold text-ink-900">Acessibilidade</h2>
          </div>
          <div className="flex items-center gap-3 px-5 py-4">
            <Type className="h-4 w-4 text-brand-500" aria-hidden="true" />
            <div className="flex-1">
              <p className="text-sm font-medium text-ink-900">Aumentar tamanho da fonte</p>
              <p className="text-xs text-ink-500">Deixa o texto do app maior em todas as telas.</p>
            </div>
            <Button
              type="button"
              variant={largeText ? "secondary" : "primary"}
              size="md"
              className="h-9 shrink-0 px-4 text-xs"
              onClick={handleToggleLargeText}
            >
              {largeText ? "Desativar" : "Ativar"}
            </Button>
          </div>
        </div>

        <div className="mt-6 rounded-2xl border border-ink-900/[0.06] bg-white shadow-soft">
          <div className="flex items-center justify-between border-b border-ink-900/[0.06] px-5 py-4">
            <h2 className="text-sm font-bold text-ink-900">Exportar histórico</h2>
            {!canExportHistory && (
              <span className="rounded-full bg-brand-50 px-2.5 py-1 text-[10px] font-bold uppercase tracking-wide text-brand-600">
                Planos pagos
              </span>
            )}
          </div>
          <div className="flex items-center gap-3 px-5 py-4">
            <Download className="h-4 w-4 text-brand-500" aria-hidden="true" />
            <div className="flex-1">
              <p className="text-sm font-medium text-ink-900">Baixar histórico em CSV</p>
              <p className="text-xs text-ink-500">
                {canExportHistory
                  ? "Exporte suas doses tomadas e perdidas para levar ao médico ou guardar."
                  : "Disponível a partir do plano Essencial."}
              </p>
            </div>
            {canExportHistory ? (
              <Button size="md" className="h-9 shrink-0 px-4 text-xs" onClick={handleExportHistory}>
                Baixar
              </Button>
            ) : (
              <Button as="link" to="/dashboard/assinatura" variant="secondary" size="md" className="h-9 shrink-0 px-4 text-xs">
                Fazer upgrade
              </Button>
            )}
          </div>
        </div>

        <div className="mt-6 rounded-2xl border border-ink-900/[0.06] bg-white shadow-soft">
          <div className="flex items-center justify-between border-b border-ink-900/[0.06] px-5 py-4">
            <h2 className="text-sm font-bold text-ink-900">Contato de emergência</h2>
            {maxEmergencyContacts === 0 && (
              <span className="rounded-full bg-brand-50 px-2.5 py-1 text-[10px] font-bold uppercase tracking-wide text-brand-600">
                Família e Premium
              </span>
            )}
          </div>

          {maxEmergencyContacts === 0 ? (
            <div className="flex items-center gap-3 px-5 py-4">
              <ShieldAlert className="h-4 w-4 text-brand-500" aria-hidden="true" />
              <div className="flex-1">
                <p className="text-sm font-medium text-ink-900">Avise alguém se uma dose não for confirmada</p>
                <p className="text-xs text-ink-500">
                  Se o lembrete ficar 30 min sem resposta, avisamos automaticamente por WhatsApp.
                </p>
              </div>
              <Button as="link" to="/dashboard/assinatura" variant="secondary" size="md" className="h-9 shrink-0 px-4 text-xs">
                Fazer upgrade
              </Button>
            </div>
          ) : (
            <div className="px-5 py-4">
              <p className="mb-3 text-xs text-ink-500">
                Se um lembrete ficar 30 minutos sem confirmação, avisamos essa pessoa por WhatsApp.
              </p>

              {emergencyContacts && emergencyContacts.length > 0 && (
                <ul className="mb-3 divide-y divide-ink-900/[0.06]">
                  {emergencyContacts.map((contact) => (
                    <li key={contact.id} className="flex items-center gap-3 py-2.5">
                      <ShieldAlert className="h-4 w-4 shrink-0 text-brand-500" aria-hidden="true" />
                      <div className="min-w-0 flex-1">
                        <p className="truncate text-sm font-medium text-ink-900">{contact.nome}</p>
                        <p className="text-xs text-ink-500">{formatWhatsAppInput(contact.whatsapp)}</p>
                      </div>
                      <button
                        type="button"
                        onClick={() => deleteEmergencyContact.mutate(contact.id)}
                        className="shrink-0 text-xs font-semibold text-red-600 hover:text-red-700"
                      >
                        Remover
                      </button>
                    </li>
                  ))}
                </ul>
              )}

              {isAddingContact ? (
                <div className="flex flex-col gap-3 rounded-xl bg-ink-900/[0.02] p-3">
                  {contactError && <p className="text-xs text-red-600">{contactError}</p>}
                  <input
                    className={inputClassName}
                    placeholder="Nome do contato"
                    value={contactNome}
                    onChange={(e) => setContactNome(e.target.value)}
                  />
                  <input
                    className={inputClassName}
                    placeholder="(11) 91234-5678"
                    value={contactWhatsapp}
                    onChange={(e) => setContactWhatsapp(formatWhatsAppInput(e.target.value))}
                  />
                  <div className="flex justify-end gap-2">
                    <Button
                      variant="secondary"
                      size="md"
                      className="h-9 px-4 text-xs"
                      onClick={() => {
                        setIsAddingContact(false);
                        setContactError(null);
                      }}
                      disabled={createEmergencyContact.isPending}
                    >
                      Cancelar
                    </Button>
                    <Button
                      size="md"
                      className="h-9 px-4 text-xs"
                      onClick={handleAddContact}
                      disabled={createEmergencyContact.isPending}
                    >
                      {createEmergencyContact.isPending ? "Salvando..." : "Salvar contato"}
                    </Button>
                  </div>
                </div>
              ) : canAddMoreContacts ? (
                <Button variant="secondary" size="md" className="h-9 px-4 text-xs" onClick={() => setIsAddingContact(true)}>
                  Adicionar contato
                </Button>
              ) : (
                <p className="text-xs text-ink-500">
                  Seu plano permite até {maxEmergencyContacts} contato{maxEmergencyContacts === 1 ? "" : "s"} de emergência.
                </p>
              )}
            </div>
          )}
        </div>

        <div className="mt-6 rounded-2xl border border-ink-900/[0.06] bg-white shadow-soft">
          <div className="border-b border-ink-900/[0.06] px-5 py-4">
            <h2 className="text-sm font-bold text-ink-900">Suporte</h2>
          </div>
          <div className="px-5 py-4">
            <p className="text-sm text-ink-900">
              Precisa de ajuda? Fale com a gente em{" "}
              <a href={`mailto:${SUPPORT_EMAIL}`} className="font-medium text-brand-600 hover:text-brand-700">
                {SUPPORT_EMAIL}
              </a>
              .
            </p>
            {hasPrioritySupport && (
              <p className="mt-1.5 text-xs font-semibold text-brand-600">
                Seu plano tem suporte prioritário — respondemos com preferência.
              </p>
            )}
          </div>
        </div>

        <div className="mt-6 rounded-2xl border border-ink-900/[0.06] bg-white shadow-soft">
          <button
            type="button"
            onClick={() => navigate("/dashboard/alterar-senha")}
            className="flex w-full items-center gap-3 px-5 py-4 text-left hover:bg-ink-900/[0.02]"
          >
            <KeyRound className="h-4 w-4 text-brand-500" aria-hidden="true" />
            <span className="flex-1 text-sm font-medium text-ink-900">Alterar senha</span>
            <ChevronRight className="h-4 w-4 text-ink-300" aria-hidden="true" />
          </button>
        </div>

        <div className="mt-6 rounded-2xl border border-red-200 bg-white shadow-soft">
          <div className="border-b border-red-100 px-5 py-4">
            <h2 className="text-sm font-bold text-red-700">Zona de risco</h2>
          </div>
          <div className="flex items-center gap-3 px-5 py-4">
            <Trash2 className="h-4 w-4 text-red-500" aria-hidden="true" />
            <div className="flex-1">
              <p className="text-sm font-medium text-ink-900">Excluir minha conta</p>
              <p className="text-xs text-ink-500">
                Remove permanentemente seus dados, medicamentos e histórico. Não pode ser desfeito.
              </p>
              {deleteError && <p className="mt-1 text-xs text-red-600">{deleteError}</p>}
            </div>
            <Button
              variant="secondary"
              size="md"
              className="h-9 shrink-0 border-red-200 px-4 text-xs text-red-700 hover:border-red-300"
              onClick={() => setShowDeleteDialog(true)}
            >
              Excluir conta
            </Button>
          </div>
        </div>
      </Container>

      <ConfirmDialog
        isOpen={showDeleteDialog}
        title="Excluir sua conta"
        description="Isso remove permanentemente seus medicamentos, histórico, familiares e assinatura. Essa ação não pode ser desfeita."
        confirmLabel="Excluir conta"
        loadingLabel="Excluindo..."
        isLoading={isDeleting}
        onConfirm={handleDeleteAccount}
        onCancel={() => setShowDeleteDialog(false)}
      />
    </div>
  );
}
