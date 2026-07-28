import { useState } from "react";
import { useForm } from "react-hook-form";
import { zodResolver } from "@hookform/resolvers/zod";
import { Link } from "react-router-dom";
import { ArrowLeft, KeyRound } from "lucide-react";
import { Logo } from "../../components/ui/Logo";
import { Container } from "../../components/ui/Container";
import { FormField } from "../../components/auth/FormField";
import { PasswordInput } from "../../components/auth/PasswordInput";
import { FormAlert } from "../../components/auth/FormAlert";
import { SubmitButton } from "../../components/auth/SubmitButton";
import { useAuth } from "../../contexts/AuthContext";
import { changePasswordSchema, type ChangePasswordFormValues } from "../../lib/validation/auth";
import { translateAuthError } from "../../lib/authErrors";

export function ChangePasswordPage() {
  const { user, signIn, updatePassword } = useAuth();
  const [serverError, setServerError] = useState<string | null>(null);
  const [successMessage, setSuccessMessage] = useState<string | null>(null);

  const {
    register,
    handleSubmit,
    formState: { errors, isSubmitting },
  } = useForm<ChangePasswordFormValues>({ resolver: zodResolver(changePasswordSchema) });

  async function onSubmit(values: ChangePasswordFormValues) {
    setServerError(null);
    setSuccessMessage(null);

    if (!user?.email) {
      setServerError("Não foi possível identificar seu e-mail. Faça login novamente.");
      return;
    }

    try {
      await signIn(user.email, values.senhaAtual);
    } catch {
      setServerError("Senha atual incorreta.");
      return;
    }

    try {
      await updatePassword(values.novaSenha);
      setSuccessMessage("Senha alterada com sucesso!");
    } catch (error) {
      setServerError(translateAuthError(error));
    }
  }

  return (
    <div className="min-h-svh bg-cream">
      <header className="border-b border-ink-900/[0.06] bg-white">
        <Container className="flex h-16 items-center justify-between sm:h-20">
          <Logo />
        </Container>
      </header>

      <main>
        <Container className="py-14">
          <div className="mx-auto max-w-md">
            <Link
              to="/dashboard"
              className="mb-6 inline-flex items-center gap-1.5 text-sm font-medium text-ink-500 hover:text-brand-600"
            >
              <ArrowLeft className="h-4 w-4" />
              Voltar
            </Link>

            <div className="rounded-3xl border border-ink-900/[0.06] bg-white p-7 shadow-soft sm:p-9">
              <div className="text-center">
                <div className="mx-auto flex h-12 w-12 items-center justify-center rounded-2xl bg-brand-50 text-brand-600">
                  <KeyRound className="h-6 w-6" aria-hidden="true" />
                </div>
                <h1 className="mt-4 text-2xl font-bold text-ink-900">Alterar senha</h1>
                <p className="mt-2 text-sm text-ink-500">Confirme sua senha atual para definir uma nova.</p>
              </div>

              <div className="mt-7">
                {successMessage ? (
                  <FormAlert variant="success">{successMessage}</FormAlert>
                ) : (
                  <form onSubmit={handleSubmit(onSubmit)} noValidate className="flex flex-col gap-4">
                    {serverError && <FormAlert variant="error">{serverError}</FormAlert>}

                    <FormField label="Senha atual" htmlFor="senhaAtual" error={errors.senhaAtual?.message}>
                      <PasswordInput
                        id="senhaAtual"
                        autoComplete="current-password"
                        placeholder="Sua senha atual"
                        {...register("senhaAtual")}
                      />
                    </FormField>

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

                    <FormField
                      label="Confirmar nova senha"
                      htmlFor="confirmarSenha"
                      error={errors.confirmarSenha?.message}
                    >
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
                )}
              </div>
            </div>

            {successMessage && (
              <div className="mt-6 text-center">
                <Link to="/dashboard" className="text-sm font-semibold text-brand-600 hover:text-brand-700">
                  Voltar para o dashboard
                </Link>
              </div>
            )}
          </div>
        </Container>
      </main>
    </div>
  );
}
