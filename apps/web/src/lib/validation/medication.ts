import { z } from "zod";

const TIME_PATTERN = /^([01]\d|2[0-3]):[0-5]\d$/;

export const medicationSchema = z
  .object({
    nome: z.string().trim().min(2, "O nome deve ter no mínimo 2 caracteres").max(100),
    dosagem: z.string().trim().min(1, "Informe a dosagem").max(50),
    observacao: z.string().trim().max(500, "Máximo de 500 caracteres").optional(),
    cor: z.string(),
    fotoUrl: z.string().optional(),
    estoqueQuantidade: z
      .string()
      .optional()
      .refine((v) => !v || /^\d+$/.test(v), "Deve ser um número inteiro (0 ou mais)"),
    estoqueAlertaLimiar: z
      .string()
      .optional()
      .refine((v) => !v || /^\d+$/.test(v), "Deve ser um número inteiro (mínimo 1)")
      .refine((v) => !v || Number(v) >= 1, "Deve ser no mínimo 1"),
    horarios: z
      .array(z.string().regex(TIME_PATTERN, "Horário inválido"))
      .min(1, "Adicione ao menos um horário"),
    diasSemana: z.array(z.number().int().min(0).max(6)).min(1, "Selecione ao menos um dia da semana"),
    dataInicio: z.string().min(1, "Informe a data de início"),
    dataFim: z.string().optional(),
  })
  .refine((data) => !data.dataFim || data.dataFim >= data.dataInicio, {
    message: "A data de término não pode ser anterior à data de início",
    path: ["dataFim"],
  });

export type MedicationFormValues = z.infer<typeof medicationSchema>;
