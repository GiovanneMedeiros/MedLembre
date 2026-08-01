export interface AdminStats {
  totalUsuarios: number;
  porPlano: { GRATIS: number; ESSENCIAL: number; FAMILIA: number; PREMIUM: number };
  assinaturasAtivas: number;
  receitaMensalEstimada: number;
  onlineAgora: number;
  cadastrosHoje: number;
  cadastros7dias: number;
  cadastros30dias: number;
  cadastrosPorDia: { data: string; total: number }[];
  pageviews: { hoje: number; ultimos7dias: number; ultimos30dias: number; total: number };
  visitantesUnicos: { hoje: number; ultimos7dias: number; ultimos30dias: number };
}

export interface AdminUser {
  id: string;
  email: string | null;
  nome: string | null;
  criadoEm: string;
  emailConfirmado: boolean;
  plano: string;
  status: string;
  medicamentos: number;
  familiares: number;
  ultimoAcesso: string | null;
}
