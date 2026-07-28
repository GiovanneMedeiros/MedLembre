import { useNavigate } from "react-router-dom";
import { LogOut, ShieldCheck } from "lucide-react";
import { Logo } from "../components/ui/Logo";
import { Button } from "../components/ui/Button";
import { Container } from "../components/ui/Container";
import { useAuth } from "../contexts/AuthContext";

export function DashboardPage() {
  const { user, signOut } = useAuth();
  const navigate = useNavigate();

  const nome = (user?.user_metadata?.nome as string | undefined) ?? user?.email ?? "";

  async function handleSignOut() {
    await signOut();
    navigate("/login", { replace: true });
  }

  return (
    <div className="min-h-svh bg-cream">
      <header className="border-b border-ink-900/[0.06] bg-white">
        <Container className="flex h-16 items-center justify-between sm:h-20">
          <Logo />
          <Button variant="ghost" size="md" onClick={handleSignOut}>
            <LogOut className="h-4 w-4" />
            Sair
          </Button>
        </Container>
      </header>

      <main>
        <Container className="py-14">
          <div className="mx-auto max-w-xl rounded-3xl border border-ink-900/[0.06] bg-white p-8 text-center shadow-soft sm:p-10">
            <div className="mx-auto flex h-14 w-14 items-center justify-center rounded-2xl bg-brand-50 text-brand-600">
              <ShieldCheck className="h-7 w-7" aria-hidden="true" />
            </div>
            <h1 className="mt-5 text-2xl font-bold text-ink-900">Bem-vindo(a), {nome}!</h1>
            <p className="mt-2 text-ink-500">
              Sua conta está autenticada com sucesso. O gerenciamento de medicamentos e lembretes chega em
              breve nesta área.
            </p>

            <div className="mt-7 flex flex-col items-center gap-3 sm:flex-row sm:justify-center">
              <Button variant="secondary" size="md" onClick={() => navigate("/dashboard/alterar-senha")}>
                Alterar senha
              </Button>
              <Button variant="primary" size="md" onClick={handleSignOut}>
                <LogOut className="h-4 w-4" />
                Sair da conta
              </Button>
            </div>
          </div>
        </Container>
      </main>
    </div>
  );
}
