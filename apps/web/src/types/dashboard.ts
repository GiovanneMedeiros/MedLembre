export type DoseStatus = "tomado" | "pendente" | "atrasado" | "proximo" | "perdido";

export interface TimelineItem {
  medicationId: string;
  nome: string;
  dosagem: string;
  cor: string;
  fotoUrl: string | null;
  horario: string;
  scheduledFor: string;
  status: DoseStatus;
}

export interface DashboardSummary {
  medicamentosCadastrados: number;
  medicamentosTomadosHoje: number;
  lembretesPendentesHoje: number;
  proximoMedicamento: TimelineItem | null;
  timelineHoje: TimelineItem[];
  adesaoSemanal: number | null;
}

export interface HistoricoResult {
  items: TimelineItem[];
  totalDias: number;
  limiteDias: number | null;
}
