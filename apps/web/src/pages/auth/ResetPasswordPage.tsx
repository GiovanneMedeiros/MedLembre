import { useEffect, useState } from "react";
import { useForm } from "react-hook-form";
import { zodResolver } from "@hookform/resolvers/zod";
import { Link, useNavigate } from "react-router-dom";
import { Loader2 } from "lucide-react";
import { AuthLayout } from "../../components/auth/AuthLayout";
import { FormField } from "../../components/auth/FormField";
import { PasswordInput } from "../../components/auth/PasswordInput";
import { FormAlert } from "../../components/auth/FormAlert";
import { SubmitButton } from "../../components/auth/SubmitButton";
import { useAuth } from "../../contexts/AuthContext";
import { resetPasswordSchema, type ResetPasswordFormValues } from "../../lib/validation/auth";
import { translateAuthError } from "../../lib/authErrors";

export function ResetPasswordPage() {
  const { isPasswordRecovery, updatePassword, clearPasswordRecovery } = useAuth();
  const navigate = useNavigate();
  const [serverError, setServerError] = useState<string | null>(null);
  const [isCheckingLink, setIsCheckingLink] = useState(true);

  const {
    register,
    handleSubmit,
    formState: { errors, isSubmitting },
  } = useForm<ResetPasswordFormValues>({ resolver: zodResolver(resetPasswordSchema) });

  useEffect(() => {
    const timer = setTimeout(() => setIsCheckingLink(false), 1200);
    return () => clearTimeout(timer);
  }, []);

  useEffect(() => {
    if (isPasswordRecovery) {
      setIsCheckingLink(false);
    }
  }, [isPasswordRecovery]);

  async function onSubmit(values: ResetPasswordFormValues) {
    setServerError(null);
    try {
      await updatePassword(values.novaSenha);
      clearPasswordRecovery();
      navigate("/dashboard", { replace: true });
    } catch (error) {
      setServerError(translateAuthError(error));
    }
  }

  if (isCheckingLink) {
    return (
      <AuthLayout title="Verificando link...">
        <div className="flex justify-center py-6">
          <Loader2 className="h-6 w-6 animate-spin text-brand-500" aria-hidden="true" />
        </div>
      </AuthLayout>
    );
  }

  if (!isPasswordRecovery) {
    return (
      <AuthLayout
        title="Link inválido ou expirado"
        footer={
          <Link to="/esqueci-senha" className="font-semibold text-brand-600 hover:text-brand-700">
            Solicitar novo link
          </Link>
        }
      >
        <FormAlert variant="error">
          Este link de redefinição de senha é inválido ou já expirou. Solicite um novo link para continuar.
        </FormAlert>
      </AuthLayout>
    );
  }

  return (
    <AuthLayout title="Crie uma nova senha" subtitle="Escolha uma senha forte para proteger sua conta.">
      <form onSubmit={handleSubmit(onSubmit)} noValidate className="flex flex-col gap-4">
        {serverError && <FormAlert variant="error">{serverError}</FormAlert>}

        <FormField
          label="Nova senha"
          htmlFor="novaSenha"
          error={errors.novaSenha?.message}
          hint="Mínimo de 8 caracteres, com letra maiúscula, minúscula e número."
        >
          <PasswordInput
            id="novaSenha"
            autoComplete="new-password"
            placeholder="Crie uma nova senha"
            {...register("novaSenha")}
          />
        </FormField>

        <FormField label="Confirmar nova senha" htmlFor="confirmarSenha" error={errors.confirmarSenha?.message}>
          <PasswordInput
            id="confirmarSenha"
            autoComplete="new-password"
            placeholder="Repita a nova senha"
            {...register("confirmarSenha")}
          />
        </FormField>

        <SubmitButton isLoading={isSubmitting} loadingText="Salvando...">
          Salvar nova senha
        </SubmitButton>
      </form>
    </AuthLayout>
  );
}
