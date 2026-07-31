export type MedicationStatus = "ATIVO" | "PAUSADO";

export interface Medication {
  id: string;
  userId: string;
  familyMemberId: string | null;
  nome: string;
  dosagem: string;
  observacao: string | null;
  cor: string;
  fotoUrl: string | null;
  horarios: string[];
  diasSemana: number[];
  dataInicio: string;
  dataFim: string | null;
  status: MedicationStatus;
  createdAt: string;
  updatedAt: string;
}

export interface MedicationInput {
  familyMemberId?: string;
  nome: string;
  dosagem: string;
  observacao?: string;
  cor?: string;
  fotoUrl?: string;
  horarios: string[];
  diasSemana: number[];
  dataInicio: string;
  dataFim?: string;
}
