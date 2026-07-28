import { useNavigate } from "react-router-dom";
import { ChevronRight, KeyRound, Mail, MessageCircle, User } from "lucide-react";
import { Container } from "../../components/ui/Container";
import { PageHeader } from "../../components/app/PageHeader";
import { useAuth } from "../../contexts/AuthContext";

export function ConfiguracoesPage() {
  const { user } = useAuth();
  const navigate = useNavigate();

  const nome = (user?.user_metadata?.nome as string | undefined) ?? "—";
  const whatsapp = (user?.user_metadata?.whatsapp as string | undefined) ?? "—";

  const infoItems = [
    { label: "Nome", value: nome, icon: User },
    { label: "E-mail", value: user?.email ?? "—", icon: Mail },
    { label: "WhatsApp", value: whatsapp, icon: MessageCircle },
  ];

  return (
    <div className="pb-16">
      <PageHeader title="Configurações" description="Gerencie os dados da sua conta." />

      <Container className="max-w-2xl pt-6 sm:pt-8">
        <div className="rounded-2xl border border-ink-900/[0.06] bg-white shadow-soft">
          <div className="border-b border-ink-900/[0.06] px-5 py-4">
            <h2 className="text-sm font-bold text-ink-900">Meus dados</h2>
          </div>
          <div className="divide-y divide-ink-900/[0.06]">
            {infoItems.map((item) => (
              <div key={item.label} className="flex items-center gap-3 px-5 py-4">
                <item.icon className="h-4 w-4 text-brand-500" aria-hidden="true" />
                <span className="w-24 shrink-0 text-sm text-ink-500">{item.label}</span>
                <span className="truncate text-sm font-medium text-ink-900">{item.value}</span>
              </div>
            ))}
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
      </Container>
    </div>
  );
}
