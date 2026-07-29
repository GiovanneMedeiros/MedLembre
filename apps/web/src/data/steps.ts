import type { LucideIcon } from "lucide-react";
import { BellRing, ClipboardList, Clock } from "lucide-react";

export interface Step {
  number: string;
  title: string;
  description: string;
  icon: LucideIcon;
}

export const STEPS: Step[] = [
  {
    number: "01",
    title: "Cadastre seus medicamentos",
    description: "Adicione nome, dosagem e observações de cada medicamento em poucos minutos.",
    icon: ClipboardList,
  },
  {
    number: "02",
    title: "Defina os horários",
    description: "Configure a frequência e os horários certos para cada remédio da sua rotina.",
    icon: Clock,
  },
  {
    number: "03",
    title: "Instale e receba o lembrete",
    description: "Adicione o MedLembre à tela do seu celular e receba uma notificação no horário certo.",
    icon: BellRing,
  },
];
