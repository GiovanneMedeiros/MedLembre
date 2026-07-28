import { useState } from "react";
import { useForm } from "react-hook-form";
import { zodResolver } from "@hookform/resolvers/zod";
import { Link, useLocation, useNavigate } from "react-router-dom";
import { AuthLayout } from "../../components/auth/AuthLayout";
import { FormField } from "../../components/auth/FormField";
import { PasswordInput } from "../../components/auth/PasswordInput";
import { FormAlert } from "../../components/auth/FormAlert";
import { SubmitButton } from "../../components/auth/SubmitButton";
import { inputClassName } from "../../components/auth/inputClassName";
import { useAuth } from "../../contexts/AuthContext";
import { loginSchema, type LoginFormValues } from "../../lib/validation/auth";
import { translateAuthError } from "../../lib/authErrors";

export function LoginPage() {
  const { signIn } = useAuth();
  const navigate = useNavigate();
  const location = useLocation();
  const [serverError, setServerError] = useState<string | null>(null);

  const {
    register,
    handleSubmit,
    formState: { errors, isSubmitting },
  } = useForm<LoginFormValues>({ resolver: zodResolver(loginSchema) });

  const redirectTo = (location.state as { from?: string } | null)?.from ?? "/dashboard";

  async function onSubmit(values: LoginFormValues) {
    setServerError(null);
    try {
      await signIn(values.email, values.senha);
      navigate(redirectTo, { replace: true });
    } catch (error) {
      setServerError(translateAuthError(error));
    }
  }

  return (
    <AuthLayout
      title="Entrar"
      subtitle="Acesse sua conta para gerenciar seus lembretes."
      footer={
        <>
          Ainda não tem conta?{" "}
          <Link to="/cadastro" className="font-semibold text-brand-600 hover:text-brand-700">
            Criar conta
          </Link>
        </>
      }
    >
      <form onSubmit={handleSubmit(onSubmit)} noValidate className="flex flex-col gap-4">
        {serverError && <FormAlert variant="error">{serverError}</FormAlert>}

        <FormField label="E-mail" htmlFor="email" error={errors.email?.message}>
          <input
            id="email"
            type="email"
            autoComplete="email"
            className={inputClassName}
            placeholder="voce@email.com"
            {...register("email")}
          />
        </FormField>

        <FormField label="Senha" htmlFor="senha" error={errors.senha?.message}>
          <PasswordInput
            id="senha"
            autoComplete="current-password"
            placeholder="Sua senha"
            {...register("senha")}
          />
        </FormField>

        <div className="-mt-1 text-right">
          <Link to="/esqueci-senha" className="text-sm font-medium text-brand-600 hover:text-brand-700">
            Esqueceu a senha?
          </Link>
        </div>

        <SubmitButton isLoading={isSubmitting} loadingText="Entrando...">
          Entrar
        </SubmitButton>
      </form>
    </AuthLayout>
  );
}
