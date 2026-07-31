export type DoseStatus =
  'tomado' | 'pendente' | 'atrasado' | 'proximo' | 'perdido';

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

export interface EstoqueAlerta {
  medicationId: string;
  nome: string;
  estoqueQuantidade: number;
}

export interface DashboardSummary {
  medicamentosCadastrados: number;
  medicamentosTomadosHoje: number;
  lembretesPendentesHoje: number;
  proximoMedicamento: TimelineItem | null;
  timelineHoje: TimelineItem[];
  // Percentual de doses tomadas nos últimos 7 dias (só considerando doses
  // cujo horário já passou). null quando não há doses suficientes ainda
  // pra calcular (conta nova, por exemplo).
  adesaoSemanal: number | null;
  // Medicamentos com estoque igual ou abaixo do limiar configurado
  // (recurso pago). Sempre [] em planos sem controle de estoque.
  alertasEstoque: EstoqueAlerta[];
}

export interface HistoricoResult {
  items: TimelineItem[];
  totalDias: number;
  limiteDias: number | null;
}
