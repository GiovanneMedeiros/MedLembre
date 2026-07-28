import { z } from "zod";
import { isValidBrazilianWhatsApp } from "../phone";

export const familyMemberSchema = z.object({
  nome: z.string().trim().min(2, "O nome deve ter no mínimo 2 caracteres").max(100),
  whatsapp: z.string().trim().refine((value) => isValidBrazilianWhatsApp(value), "Informe um WhatsApp válido, com DDD"),
  fotoUrl: z.union([z.string().trim().url("URL da foto inválida"), z.literal("")]).optional(),
});

export type FamilyMemberFormValues = z.infer<typeof familyMemberSchema>;
