export type DoseStatus = "tomado" | "pendente" | "atrasado" | "proximo";

export interface TimelineItem {
  medicationId: string;
  nome: string;
  dosagem: string;
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
}
