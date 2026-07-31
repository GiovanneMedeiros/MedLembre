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
    description: "Organize sua rotina com lembretes por WhatsApp e controle de estoque.",
    monthlyPrice: 39.9,
    annualPrice: 359,
    highlighted: true,
    features: [
      "Até 5 medicamentos",
      "Lembretes ilimitados por notificação push",
      "Lembretes também por WhatsApp/SMS",
      "Controle de estoque com alerta de reposição",
      "Alerta de horários muito próximos",
      "1 perfil",
      "Histórico de 30 dias",
      "Exportar histórico em CSV",
      "Suporte por e-mail",
    ],
  },
  {
    id: "familia",
    name: "Família",
    description: "Cuide de quem você ama, com aviso automático se uma dose passar batido.",
    monthlyPrice: 59.9,
    annualPrice: 539,
    features: [
      "Medicamentos ilimitados",
      "Lembretes ilimitados por notificação push",
      "Lembretes também por WhatsApp/SMS",
      "Controle de estoque com alerta de reposição",
      "Alerta de horários muito próximos",
      "Até 5 perfis familiares",
      "1 contato de emergência avisado se a dose não for confirmada",
      "Relatório semanal de adesão por e-mail",
      "Histórico de 90 dias",
      "Exportar histórico em CSV",
      "Suporte prioritário",
    ],
  },
  {
    id: "premium",
    name: "Premium",
    description: "Tudo do Família, sem limites — para rotinas mais complexas.",
    monthlyPrice: 79.9,
    annualPrice: 719,
    features: [
      "Tudo do plano Família",
      "Perfis familiares ilimitados",
      "Até 3 contatos de emergência",
      "Histórico completo",
      "Suporte prioritário por e-mail",
    ],
  },
];

export const ANNUAL_DISCOUNT_LABEL = "Economize 25%";
