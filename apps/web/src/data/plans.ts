export interface Plan {
  id: string;
  name: string;
  description: string;
  monthlyPrice: number;
  annualPrice: number | null;
  highlighted?: boolean;
  features: string[];
}

export const PLANS: Plan[] = [
  {
    id: "gratis",
    name: "Grátis",
    description: "Teste grátis de 48 horas, sem compromisso.",
    monthlyPrice: 0,
    annualPrice: null,
    features: ["1 medicamento cadastrado", "Lembretes por notificação push", "1 perfil", "Histórico dos últimos 7 dias"],
  },
  {
    id: "essencial",
    name: "Essencial",
    description: "Ideal para organizar sua própria rotina de medicamentos.",
    monthlyPrice: 39.9,
    annualPrice: 359,
    highlighted: true,
    features: [
      "Até 5 medicamentos",
      "Lembretes ilimitados por notificação push",
      "1 perfil",
      "Histórico de 30 dias",
      "Exportar histórico em CSV",
      "Suporte por e-mail",
    ],
  },
  {
    id: "familia",
    name: "Família",
    description: "Para cuidar da sua rotina e da de quem você ama.",
    monthlyPrice: 59.9,
    annualPrice: 539,
    features: [
      "Medicamentos ilimitados",
      "Lembretes ilimitados por notificação push",
      "Até 5 perfis familiares",
      "Histórico de 90 dias",
      "Exportar histórico em CSV",
      "Suporte prioritário",
    ],
  },
  {
    id: "premium",
    name: "Premium",
    description: "Máximo de recursos para famílias com rotinas mais complexas.",
    monthlyPrice: 79.9,
    annualPrice: 719,
    features: [
      "Tudo do plano Família",
      "Perfis familiares ilimitados",
      "Histórico completo",
      "Suporte prioritário por e-mail",
    ],
  },
];

export const ANNUAL_DISCOUNT_LABEL = "Economize 25%";
