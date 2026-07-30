import { useState } from "react";
import { Controller, useForm } from "react-hook-form";
import { zodResolver } from "@hookform/resolvers/zod";
import { Link, useNavigate } from "react-router-dom";
import { AuthLayout } from "../../components/auth/AuthLayout";
import { FormField } from "../../components/auth/FormField";
import { PasswordInput } from "../../components/auth/PasswordInput";
import { FormAlert } from "../../components/auth/FormAlert";
import { SubmitButton } from "../../components/auth/SubmitButton";
import { inputClassName } from "../../components/auth/inputClassName";
import { useAuth } from "../../contexts/AuthContext";
import { registerSchema, type RegisterFormValues } from "../../lib/validation/auth";
import { translateAuthError } from "../../lib/authErrors";
import { formatWhatsAppInput } from "../../lib/phone";
import { trackEvent } from "../../lib/fbPixel";

export function RegisterPage() {
  const { signUp } = useAuth();
  const navigate = useNavigate();
  const [serverError, setServerError] = useState<string | null>(null);
  const [successMessage, setSuccessMessage] = useState<string | null>(null);

  const {
    register,
    control,
    handleSubmit,
    formState: { errors, isSubmitting },
  } = useForm<RegisterFormValues>({
    resolver: zodResolver(registerSchema),
    defaultValues: { telefone: "" },
  });

  async function onSubmit(values: RegisterFormValues) {
    setServerError(null);
    setSuccessMessage(null);

    try {
      const { needsEmailConfirmation } = await signUp(values);
      trackEvent("CompleteRegistration");

      if (needsEmailConfirmation) {
        setSuccessMessage(
          "Cadastro realizado! Enviamos um link de confirmação para o seu e-mail — confirme para poder entrar.",
        );
        return;
      }

      navigate("/dashboard", { replace: true });
    } catch (error) {
      setServerError(translateAuthError(error));
    }
  }

  return (
    <AuthLayout
      title="Crie sua conta"
      subtitle="Comece a organizar seus lembretes de medicamentos."
      footer={
        <>
          Já tem uma conta?{" "}
          <Link to="/login" className="font-semibold text-brand-600 hover:text-brand-700">
            Entrar
          </Link>
        </>
      }
    >
      {successMessage ? (
        <FormAlert variant="success">{successMessage}</FormAlert>
      ) : (
        <form onSubmit={handleSubmit(onSubmit)} noValidate className="flex flex-col gap-4">
          {serverError && <FormAlert variant="error">{serverError}</FormAlert>}

          <FormField label="Nome completo" htmlFor="nome" error={errors.nome?.message}>
            <input
              id="nome"
              type="text"
              autoComplete="name"
              className={inputClassName}
              placeholder="Seu nome completo"
              {...register("nome")}
            />
          </FormField>

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

          <FormField
            label="Telefone (opcional)"
            htmlFor="telefone"
            error={errors.telefone?.message}
            hint="Só usamos como contato, os lembretes chegam por notificação no app."
          >
            <Controller
              control={control}
              name="telefone"
              render={({ field }) => (
                <input
                  id="telefone"
                  type="tel"
                  inputMode="numeric"
                  autoComplete="tel"
                  className={inputClassName}
                  placeholder="(11) 91234-5678"
                  value={field.value ?? ""}
                  onChange={(event) => field.onChange(formatWhatsAppInput(event.target.value))}
                  onBlur={field.onBlur}
                />
              )}
            />
          </FormField>

          <FormField
            label="Senha"
            htmlFor="senha"
            error={errors.senha?.message}
            hint="Mínimo de 8 caracteres, com letra maiúscula, minúscula e número."
          >
            <PasswordInput
              id="senha"
              autoComplete="new-password"
              placeholder="Crie uma senha segura"
              {...register("senha")}
            />
          </FormField>

          <FormField label="Confirmar senha" htmlFor="confirmarSenha" error={errors.confirmarSenha?.message}>
            <PasswordInput
              id="confirmarSenha"
              autoComplete="new-password"
              placeholder="Repita a senha"
              {...register("confirmarSenha")}
            />
          </FormField>

          <div className="mt-1">
            <SubmitButton isLoading={isSubmitting} loadingText="Criando conta...">
              Criar conta
            </SubmitButton>
          </div>
        </form>
      )}
    </AuthLayout>
  );
}
