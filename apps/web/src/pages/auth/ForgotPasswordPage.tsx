import { useState } from "react";
import { useForm } from "react-hook-form";
import { zodResolver } from "@hookform/resolvers/zod";
import { Link } from "react-router-dom";
import { AuthLayout } from "../../components/auth/AuthLayout";
import { FormField } from "../../components/auth/FormField";
import { FormAlert } from "../../components/auth/FormAlert";
import { SubmitButton } from "../../components/auth/SubmitButton";
import { inputClassName } from "../../components/auth/inputClassName";
import { useAuth } from "../../contexts/AuthContext";
import { forgotPasswordSchema, type ForgotPasswordFormValues } from "../../lib/validation/auth";
import { translateAuthError } from "../../lib/authErrors";

export function ForgotPasswordPage() {
  const { requestPasswordReset } = useAuth();
  const [serverError, setServerError] = useState<string | null>(null);
  const [successMessage, setSuccessMessage] = useState<string | null>(null);

  const {
    register,
    handleSubmit,
    formState: { errors, isSubmitting },
  } = useForm<ForgotPasswordFormValues>({ resolver: zodResolver(forgotPasswordSchema) });

  async function onSubmit(values: ForgotPasswordFormValues) {
    setServerError(null);
    setSuccessMessage(null);
    try {
      await requestPasswordReset(values.email);
      setSuccessMessage("Se este e-mail estiver cadastrado, você receberá um link para redefinir sua senha.");
    } catch (error) {
      setServerError(translateAuthError(error));
    }
  }

  return (
    <AuthLayout
      title="Esqueceu sua senha?"
      subtitle="Informe seu e-mail e enviaremos um link para redefinir sua senha."
      footer={
        <Link to="/login" className="font-semibold text-brand-600 hover:text-brand-700">
          Voltar para o login
        </Link>
      }
    >
      {successMessage ? (
        <FormAlert variant="success">{successMessage}</FormAlert>
      ) : (
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

          <SubmitButton isLoading={isSubmitting} loadingText="Enviando link...">
            Enviar link de recuperação
          </SubmitButton>
        </form>
      )}
    </AuthLayout>
  );
}
