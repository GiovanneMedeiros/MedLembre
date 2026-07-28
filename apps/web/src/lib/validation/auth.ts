import { z } from "zod";
import { isValidBrazilianWhatsApp } from "../phone";

export const passwordSchema = z
  .string()
  .min(8, "A senha deve ter no mínimo 8 caracteres")
  .regex(/[a-z]/, "A senha deve ter ao menos uma letra minúscula")
  .regex(/[A-Z]/, "A senha deve ter ao menos uma letra maiúscula")
  .regex(/[0-9]/, "A senha deve ter ao menos um número");

export const registerSchema = z
  .object({
    nome: z
      .string()
      .trim()
      .min(2, "Informe seu nome completo")
      .max(100, "O nome deve ter no máximo 100 caracteres"),
    email: z.string().trim().min(1, "Informe seu e-mail").email("Digite um e-mail válido"),
    whatsapp: z
      .string()
      .trim()
      .min(1, "Informe seu WhatsApp")
      .refine(isValidBrazilianWhatsApp, "Digite um número de WhatsApp válido, com DDD"),
    senha: passwordSchema,
    confirmarSenha: z.string().min(1, "Confirme sua senha"),
  })
  .refine((data) => data.senha === data.confirmarSenha, {
    message: "As senhas não coincidem",
    path: ["confirmarSenha"],
  });

export type RegisterFormValues = z.infer<typeof registerSchema>;

export const loginSchema = z.object({
  email: z.string().trim().min(1, "Informe seu e-mail").email("Digite um e-mail válido"),
  senha: z.string().min(1, "Informe sua senha"),
});

export type LoginFormValues = z.infer<typeof loginSchema>;

export const forgotPasswordSchema = z.object({
  email: z.string().trim().min(1, "Informe seu e-mail").email("Digite um e-mail válido"),
});

export type ForgotPasswordFormValues = z.infer<typeof forgotPasswordSchema>;

export const resetPasswordSchema = z
  .object({
    novaSenha: passwordSchema,
    confirmarSenha: z.string().min(1, "Confirme sua nova senha"),
  })
  .refine((data) => data.novaSenha === data.confirmarSenha, {
    message: "As senhas não coincidem",
    path: ["confirmarSenha"],
  });

export type ResetPasswordFormValues = z.infer<typeof resetPasswordSchema>;

export const changePasswordSchema = z
  .object({
    senhaAtual: z.string().min(1, "Informe sua senha atual"),
    novaSenha: passwordSchema,
    confirmarSenha: z.string().min(1, "Confirme sua nova senha"),
  })
  .refine((data) => data.novaSenha === data.confirmarSenha, {
    message: "As senhas não coincidem",
    path: ["confirmarSenha"],
  })
  .refine((data) => data.novaSenha !== data.senhaAtual, {
    message: "A nova senha deve ser diferente da atual",
    path: ["novaSenha"],
  });

export type ChangePasswordFormValues = z.infer<typeof changePasswordSchema>;
