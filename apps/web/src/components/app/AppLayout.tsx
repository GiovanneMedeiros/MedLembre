import { useEffect, useState } from "react";
import { Outlet, useLocation, useNavigate } from "react-router-dom";
import { LogOut, Menu, X } from "lucide-react";
import { Logo } from "../ui/Logo";
import { SidebarNav } from "./SidebarNav";
import { InstallAppBanner } from "./InstallAppBanner";
import { PushNotificationBanner } from "./PushNotificationBanner";
import { TrialBanner } from "./TrialBanner";
import { TrialExpiredScreen } from "./TrialExpiredScreen";
import { FamilyScopeSwitcher } from "./FamilyScopeSwitcher";
import { FamilyScopeProvider } from "../../contexts/FamilyScopeContext";
import { useAuth } from "../../contexts/AuthContext";
import { useSubscription } from "../../hooks/useSubscription";
import { NAV_ITEMS } from "./navItems";

export function AppLayout() {
  const { user, signOut } = useAuth();
  const navigate = useNavigate();
  const location = useLocation();
  const [isMobileNavOpen, setIsMobileNavOpen] = useState(false);
  const { data: subscription } = useSubscription();

  const isAssinaturaPage = location.pathname === "/dashboard/assinatura";
  const trialExpired = Boolean(subscription?.trialExpired) && !isAssinaturaPage;

  const nome = (user?.user_metadata?.nome as string | undefined) ?? user?.email ?? "";
  const currentLabel = NAV_ITEMS.find((item) =>
    item.end ? location.pathname === item.to : location.pathname.startsWith(item.to),
  )?.label;

  useEffect(() => {
    setIsMobileNavOpen(false);
  }, [location.pathname]);

  async function handleSignOut() {
    await signOut();
    navigate("/login", { replace: true });
  }

  return (
    <FamilyScopeProvider>
    <div className="min-h-svh bg-cream lg:flex">
      {/* Sidebar desktop */}
      <aside className="hidden w-64 shrink-0 border-r border-ink-900/[0.06] bg-white lg:flex lg:flex-col">
        <div className="px-5 py-6">
          <Logo />
        </div>
        <FamilyScopeSwitcher />
        <div className="flex-1 overflow-y-auto px-3">
          <SidebarNav />
        </div>
        <div className="border-t border-ink-900/[0.06] p-3">
          <div className="flex items-center gap-3 rounded-xl px-2 py-2">
            <div className="flex h-9 w-9 shrink-0 items-center justify-center rounded-full bg-brand-100 text-sm font-semibold text-brand-700">
              {nome.charAt(0).toUpperCase()}
            </div>
            <div className="min-w-0 flex-1">
              <p className="truncate text-sm font-medium text-ink-900">{nome}</p>
            </div>
            <button
              type="button"
              onClick={handleSignOut}
              aria-label="Sair"
              className="flex h-8 w-8 shrink-0 items-center justify-center rounded-lg text-ink-300 transition-colors hover:bg-red-50 hover:text-red-600"
            >
              <LogOut className="h-4 w-4" />
            </button>
          </div>
        </div>
      </aside>

      {/* Topbar mobile */}
      <header className="flex h-16 items-center justify-between border-b border-ink-900/[0.06] bg-white px-4 lg:hidden">
        <Logo />
        <div className="flex items-center gap-2">
          {currentLabel && <span className="text-sm font-medium text-ink-500">{currentLabel}</span>}
          <button
            type="button"
            onClick={() => setIsMobileNavOpen(true)}
            aria-label="Abrir menu"
            className="flex h-10 w-10 items-center justify-center rounded-lg text-ink-900"
          >
            <Menu className="h-5 w-5" />
          </button>
        </div>
      </header>

      {/* Drawer mobile */}
      {isMobileNavOpen && (
        <div className="fixed inset-0 z-50 lg:hidden">
          <div
            className="absolute inset-0 bg-ink-900/40"
            onClick={() => setIsMobileNavOpen(false)}
            aria-hidden="true"
          />
          <div className="absolute inset-y-0 left-0 flex w-72 max-w-[80%] flex-col bg-white shadow-lift">
            <div className="flex items-center justify-between px-5 py-6">
              <Logo />
              <button
                type="button"
                onClick={() => setIsMobileNavOpen(false)}
                aria-label="Fechar menu"
                className="flex h-9 w-9 items-center justify-center rounded-lg text-ink-900"
              >
                <X className="h-5 w-5" />
              </button>
            </div>
            <FamilyScopeSwitcher />
            <div className="flex-1 overflow-y-auto px-3">
              <SidebarNav onNavigate={() => setIsMobileNavOpen(false)} />
            </div>
            <div className="border-t border-ink-900/[0.06] p-3">
              <div className="flex items-center gap-3 rounded-xl px-2 py-2">
                <div className="flex h-9 w-9 shrink-0 items-center justify-center rounded-full bg-brand-100 text-sm font-semibold text-brand-700">
                  {nome.charAt(0).toUpperCase()}
                </div>
                <p className="min-w-0 flex-1 truncate text-sm font-medium text-ink-900">{nome}</p>
                <button
                  type="button"
                  onClick={handleSignOut}
                  aria-label="Sair"
                  className="flex h-8 w-8 shrink-0 items-center justify-center rounded-lg text-ink-300 hover:bg-red-50 hover:text-red-600"
                >
                  <LogOut className="h-4 w-4" />
                </button>
              </div>
            </div>
          </div>
        </div>
      )}

      <main className="min-w-0 flex-1">
        <InstallAppBanner />
        <PushNotificationBanner />
        {subscription?.plano === "GRATIS" && !subscription.trialExpired && subscription.trialExpiresAt && (
          <TrialBanner trialExpiresAt={subscription.trialExpiresAt} />
        )}
        {trialExpired ? <TrialExpiredScreen /> : <Outlet />}
      </main>
    </div>
    </FamilyScopeProvider>
  );
}
