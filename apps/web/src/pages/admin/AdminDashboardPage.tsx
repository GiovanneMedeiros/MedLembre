import { Link } from "react-router-dom";
import {
  ArrowLeft,
  CircleDollarSign,
  Eye,
  Loader2,
  ShieldAlert,
  Sparkles,
  UserPlus,
  Users,
  Wifi,
} from "lucide-react";
import { Logo } from "../../components/ui/Logo";
import { Container } from "../../components/ui/Container";
import { StatCard } from "../../components/app/StatCard";
import { useAdminStats, useAdminUsers } from "../../hooks/useAdmin";
import { ApiError } from "../../lib/api";
import { formatCurrency } from "../../lib/format";
import { cn } from "../../lib/cn";

const PLAN_LABELS: Record<string, string> = {
  GRATIS: "Grátis",
  ESSENCIAL: "Essencial",
  FAMILIA: "Família",
  PREMIUM: "Premium",
};

const PLAN_BADGE_CLASS: Record<string, string> = {
  GRATIS: "bg-ink-900/[0.06] text-ink-500",
  ESSENCIAL: "bg-brand-50 text-brand-600",
  FAMILIA: "bg-amber-50 text-amber-600",
  PREMIUM: "bg-emerald-50 text-emerald-600",
};

function formatDateTimeBR(iso: string): string {
  return new Date(iso).toLocaleString("pt-BR", {
    day: "2-digit",
    month: "2-digit",
    year: "2-digit",
    hour: "2-digit",
    minute: "2-digit",
  });
}

function AccessDenied() {
  return (
    <div className="flex min-h-svh flex-col items-center justify-center bg-cream px-4 text-center">
      <div className="flex h-14 w-14 items-center justify-center rounded-2xl bg-red-50 text-red-600">
        <ShieldAlert className="h-7 w-7" aria-hidden="true" />
      </div>
      <h1 className="mt-4 text-xl font-bold text-ink-900">Acesso restrito</h1>
      <p className="mt-1.5 max-w-sm text-sm text-ink-500">
        Essa área é exclusiva da administração do MedLembre.
      </p>
      <Link to="/dashboard" className="mt-6 text-sm font-semibold text-brand-600 hover:text-brand-700">
        Voltar ao painel
      </Link>
    </div>
  );
}

export function AdminDashboardPage() {
  const { data: stats, isLoading: statsLoading, isError: statsError, error: statsErrorObj } = useAdminStats();
  const { data: users, isLoading: usersLoading } = useAdminUsers();

  if (statsError && statsErrorObj instanceof ApiError && statsErrorObj.status === 403) {
    return <AccessDenied />;
  }

  const maxCadastrosPorDia = Math.max(1, ...(stats?.cadastrosPorDia.map((d) => d.total) ?? [1]));

  return (
    <div className="min-h-svh bg-cream pb-20">
      <div className="border-b border-ink-900/[0.06] bg-white">
        <Container className="flex items-center justify-between py-5">
          <div className="flex items-center gap-3">
            <Logo />
            <span className="rounded-full bg-brand-50 px-2.5 py-1 text-[10px] font-bold uppercase tracking-wide text-brand-600">
              Admin
            </span>
          </div>
          <Link
            to="/dashboard"
            className="flex items-center gap-1.5 text-sm font-medium text-ink-500 hover:text-brand-600"
          >
            <ArrowLeft className="h-4 w-4" aria-hidden="true" />
            Voltar ao painel
          </Link>
        </Container>
      </div>

      <Container className="pt-6 sm:pt-8">
        {statsLoading && (
          <div className="flex items-center justify-center py-24 text-ink-300">
            <Loader2 className="h-6 w-6 animate-spin" />
          </div>
        )}

        {statsError && !(statsErrorObj instanceof ApiError && statsErrorObj.status === 403) && (
          <div className="rounded-2xl border border-red-200 bg-red-50 p-5 text-sm text-red-700">
            Não foi possível carregar as estatísticas agora. Tente novamente em instantes.
          </div>
        )}

        {stats && (
          <>
            <div className="grid gap-4 sm:grid-cols-2 lg:grid-cols-4">
              <StatCard label="Usuários cadastrados" value={String(stats.totalUsuarios)} icon={Users} accent="brand" />
              <StatCard label="Online agora" value={String(stats.onlineAgora)} icon={Wifi} accent="emerald" />
              <StatCard
                label="Assinaturas ativas"
                value={String(stats.assinaturasAtivas)}
                icon={Sparkles}
                accent="amber"
              />
              <StatCard
                label="Receita mensal estimada"
                value={formatCurrency(stats.receitaMensalEstimada)}
                icon={CircleDollarSign}
                accent="ink"
              />
              <StatCard label="Cadastros hoje" value={String(stats.cadastrosHoje)} icon={UserPlus} accent="brand" />
              <StatCard
                label="Cadastros (7 dias)"
                value={String(stats.cadastros7dias)}
                icon={UserPlus}
                accent="brand"
              />
              <StatCard
                label="Pageviews hoje"
                value={String(stats.pageviews.hoje)}
                icon={Eye}
                accent="ink"
              />
              <StatCard
                label="Visitantes únicos hoje"
                value={String(stats.visitantesUnicos.hoje)}
                icon={Eye}
                accent="ink"
              />
            </div>
            <p className="mt-3 text-xs text-ink-300">
              "Online agora" conta usuários logados com atividade nos últimos 5 minutos. Receita é uma
              estimativa com base no plano atual de cada assinatura ativa, não o valor real recebido pela Cakto.
            </p>

            <div className="mt-8 grid gap-6 lg:grid-cols-[1.3fr_1fr]">
              <div className="rounded-2xl border border-ink-900/[0.06] bg-white p-5 shadow-soft sm:p-6">
                <h2 className="text-sm font-bold text-ink-900">Cadastros — últimos 14 dias</h2>
                <div className="mt-5 flex h-32 items-end gap-1.5">
                  {stats.cadastrosPorDia.map((day) => (
                    <div key={day.data} className="flex flex-1 flex-col items-center gap-1.5">
                      <div
                        className={cn(
                          "w-full rounded-t-md transition-all",
                          day.total > 0 ? "bg-brand-500" : "bg-ink-900/[0.06]",
                        )}
                        style={{
                          height: `${Math.max(4, (day.total / maxCadastrosPorDia) * 100)}%`,
                        }}
                        title={`${day.data}: ${day.total}`}
                      />
                    </div>
                  ))}
                </div>
                <div className="mt-2 flex justify-between text-[10px] text-ink-300">
                  <span>{stats.cadastrosPorDia[0]?.data.slice(5)}</span>
                  <span>{stats.cadastrosPorDia[stats.cadastrosPorDia.length - 1]?.data.slice(5)}</span>
                </div>
              </div>

              <div className="rounded-2xl border border-ink-900/[0.06] bg-white p-5 shadow-soft sm:p-6">
                <h2 className="text-sm font-bold text-ink-900">Distribuição por plano</h2>
                <div className="mt-4 flex flex-col gap-3">
                  {(["GRATIS", "ESSENCIAL", "FAMILIA", "PREMIUM"] as const).map((plano) => {
                    const count = stats.porPlano[plano];
                    const pct = stats.totalUsuarios > 0 ? (count / stats.totalUsuarios) * 100 : 0;
                    return (
                      <div key={plano}>
                        <div className="flex items-center justify-between text-xs">
                          <span className="font-semibold text-ink-700">{PLAN_LABELS[plano]}</span>
                          <span className="text-ink-400">{count}</span>
                        </div>
                        <div className="mt-1 h-1.5 overflow-hidden rounded-full bg-ink-900/[0.06]">
                          <div className="h-full rounded-full bg-brand-500" style={{ width: `${pct}%` }} />
                        </div>
                      </div>
                    );
                  })}
                </div>
              </div>
            </div>
          </>
        )}

        <div className="mt-8 overflow-hidden rounded-2xl border border-ink-900/[0.06] bg-white shadow-soft">
          <div className="border-b border-ink-900/[0.06] px-5 py-4">
            <h2 className="text-sm font-bold text-ink-900">Usuários</h2>
          </div>

          {usersLoading && (
            <div className="flex items-center justify-center py-16 text-ink-300">
              <Loader2 className="h-5 w-5 animate-spin" />
            </div>
          )}

          {users && users.length > 0 && (
            <div className="overflow-x-auto">
              <table className="w-full min-w-[720px] text-left text-sm">
                <thead>
                  <tr className="border-b border-ink-900/[0.06] text-xs uppercase tracking-wide text-ink-300">
                    <th className="px-5 py-3 font-semibold">Usuário</th>
                    <th className="px-3 py-3 font-semibold">Plano</th>
                    <th className="px-3 py-3 font-semibold">Cadastro</th>
                    <th className="px-3 py-3 font-semibold">Medicamentos</th>
                    <th className="px-3 py-3 font-semibold">Familiares</th>
                    <th className="px-3 py-3 font-semibold">Último acesso</th>
                  </tr>
                </thead>
                <tbody className="divide-y divide-ink-900/[0.06]">
                  {users.map((user) => (
                    <tr key={user.id}>
                      <td className="px-5 py-3">
                        <p className="font-medium text-ink-900">{user.nome || "—"}</p>
                        <p className="text-xs text-ink-400">{user.email}</p>
                      </td>
                      <td className="px-3 py-3">
                        <span
                          className={cn(
                            "rounded-full px-2.5 py-1 text-xs font-bold",
                            PLAN_BADGE_CLASS[user.plano] ?? PLAN_BADGE_CLASS.GRATIS,
                          )}
                        >
                          {PLAN_LABELS[user.plano] ?? user.plano}
                        </span>
                      </td>
                      <td className="px-3 py-3 text-ink-500">{formatDateTimeBR(user.criadoEm)}</td>
                      <td className="px-3 py-3 text-ink-500">{user.medicamentos}</td>
                      <td className="px-3 py-3 text-ink-500">{user.familiares}</td>
                      <td className="px-3 py-3 text-ink-500">
                        {user.ultimoAcesso ? formatDateTimeBR(user.ultimoAcesso) : "—"}
                      </td>
                    </tr>
                  ))}
                </tbody>
              </table>
            </div>
          )}
        </div>
      </Container>
    </div>
  );
}
