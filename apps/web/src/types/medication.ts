export type MedicationStatus = "ATIVO" | "PAUSADO";

export interface Medication {
  id: string;
  userId: string;
  nome: string;
  dosagem: string;
  observacao: string | null;
  horarios: string[];
  diasSemana: number[];
  dataInicio: string;
  dataFim: string | null;
  status: MedicationStatus;
  createdAt: string;
  updatedAt: string;
}

export interface MedicationInput {
  nome: string;
  dosagem: string;
  observacao?: string;
  horarios: string[];
  diasSemana: number[];
  dataInicio: string;
  dataFim?: string;
}
