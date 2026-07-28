import type { LucideIcon } from "lucide-react";
import { ClipboardList, Clock, MessageCircleHeart } from "lucide-react";

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
    title: "Receba o lembrete pelo WhatsApp",
    description: "No horário certo, você recebe uma mensagem no WhatsApp lembrando de tomar o remédio.",
    icon: MessageCircleHeart,
  },
];
