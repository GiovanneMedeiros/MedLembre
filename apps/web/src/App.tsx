import { BrowserRouter, Route, Routes } from "react-router-dom";
import { QueryClient, QueryClientProvider } from "@tanstack/react-query";
import { AuthProvider } from "./contexts/AuthContext";
import { ProtectedRoute } from "./components/routing/ProtectedRoute";
import { GuestOnlyRoute } from "./components/routing/GuestOnlyRoute";
import { AppLayout } from "./components/app/AppLayout";
import { LandingPage } from "./pages/LandingPage";
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

const queryClient = new QueryClient({
  defaultOptions: {
    queries: {
      retry: 1,
      staleTime: 30_000,
    },
  },
});

function App() {
  return (
    <QueryClientProvider client={queryClient}>
      <BrowserRouter>
        <AuthProvider>
          <Routes>
            <Route path="/" element={<LandingPage />} />
            <Route path="/redefinir-senha" element={<ResetPasswordPage />} />

            <Route element={<GuestOnlyRoute />}>
              <Route path="/cadastro" element={<RegisterPage />} />
              <Route path="/login" element={<LoginPage />} />
              <Route path="/esqueci-senha" element={<ForgotPasswordPage />} />
            </Route>

            <Route element={<ProtectedRoute />}>
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
    </QueryClientProvider>
  );
}

export default App;
