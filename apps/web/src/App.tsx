import { useEffect, useRef } from "react";
import { BrowserRouter, Route, Routes, useLocation } from "react-router-dom";
import { QueryClient, QueryClientProvider } from "@tanstack/react-query";
import { Analytics } from "@vercel/analytics/react";
import { trackPageView } from "./lib/fbPixel";
import { trackPageview } from "./lib/analytics";
import { AuthProvider } from "./contexts/AuthContext";
import { ProtectedRoute } from "./components/routing/ProtectedRoute";
import { GuestOnlyRoute } from "./components/routing/GuestOnlyRoute";
import { AppLayout } from "./components/app/AppLayout";
import { LandingPage } from "./pages/LandingPage";
import { PlanosPage } from "./pages/PlanosPage";
import { RegisterPage } from "./pages/auth/RegisterPage";
import { LoginPage } from "./pages/auth/LoginPage";
import { ForgotPasswordPage } from "./pages/auth/ForgotPasswordPage";
import { ResetPasswordPage } from "./pages/auth/ResetPasswordPage";
import { ChangePasswordPage } from "./pages/auth/ChangePasswordPage";
import { DashboardHomePage } from "./pages/app/DashboardHomePage";
import { MedicationsListPage } from "./pages/app/MedicationsListPage";
import { HistoricoPage } from "./pages/app/HistoricoPage";
import { FamiliaPage } from "./pages/app/FamiliaPage";
import { AssinaturaPage } from "./pages/app/AssinaturaPage";
import { ConfiguracoesPage } from "./pages/app/ConfiguracoesPage";
import { AdminDashboardPage } from "./pages/admin/AdminDashboardPage";

const queryClient = new QueryClient({
  defaultOptions: {
    queries: {
      retry: 1,
      staleTime: 30_000,
    },
  },
});

// O index.html já dispara o primeiro PageView no carregamento inicial —
// esse componente cobre as trocas de rota seguintes, já que é uma SPA
// (o script do Pixel só roda uma vez por carregamento de página real).
function PixelRouteTracker() {
  const location = useLocation();
  const isFirstRender = useRef(true);

  useEffect(() => {
    if (isFirstRender.current) {
      isFirstRender.current = false;
      return;
    }
    trackPageView();
  }, [location.pathname]);

  return null;
}

// Pageview de primeira parte (alimenta o painel /adm) — dispara em toda
// troca de rota, incluindo o carregamento inicial (diferente do Pixel,
// aqui não existe um script estático cobrindo esse primeiro load).
function AnalyticsRouteTracker() {
  const location = useLocation();

  useEffect(() => {
    trackPageview(location.pathname);
  }, [location.pathname]);

  return null;
}

function App() {
  return (
    <QueryClientProvider client={queryClient}>
      <BrowserRouter>
        <AuthProvider>
          <PixelRouteTracker />
          <AnalyticsRouteTracker />
          <Routes>
            <Route path="/" element={<LandingPage />} />
            <Route path="/planos" element={<PlanosPage />} />
            <Route path="/redefinir-senha" element={<ResetPasswordPage />} />

            <Route element={<GuestOnlyRoute />}>
              <Route path="/cadastro" element={<RegisterPage />} />
              <Route path="/login" element={<LoginPage />} />
              <Route path="/esqueci-senha" element={<ForgotPasswordPage />} />
            </Route>

            <Route element={<ProtectedRoute />}>
              <Route path="/adm" element={<AdminDashboardPage />} />
              <Route path="/dashboard/alterar-senha" element={<ChangePasswordPage />} />

              <Route element={<AppLayout />}>
                <Route path="/dashboard" element={<DashboardHomePage />} />
                <Route path="/dashboard/medicamentos" element={<MedicationsListPage />} />
                <Route path="/dashboard/historico" element={<HistoricoPage />} />
                <Route path="/dashboard/familia" element={<FamiliaPage />} />
                <Route path="/dashboard/assinatura" element={<AssinaturaPage />} />
                <Route path="/dashboard/configuracoes" element={<ConfiguracoesPage />} />
              </Route>
            </Route>
          </Routes>
        </AuthProvider>
      </BrowserRouter>
      <Analytics />
    </QueryClientProvider>
  );
}

export default App;
