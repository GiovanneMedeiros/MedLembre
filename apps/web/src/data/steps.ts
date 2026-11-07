export interface Step {
  title: string;
  description: string;
}

export const STEPS: Step[] = [
  {
    title: "Cadastre seus remédios",
    description:
      "Coloque o nome, a dose e, se quiser, uma observação, como “tomar em jejum”. Dá para copiar direto da caixinha ou da receita.",
  },
  {
    title: "Escolha os horários",
    description: "Diga em que horários e em quais dias da semana cada remédio deve ser tomado.",
  },
  {
    title: "Coloque na tela do celular",
    description:
      "Adicione o MedLembre à tela inicial, como um aplicativo, e permita as notificações. Na hora certa, o celular avisa.",
  },
];
