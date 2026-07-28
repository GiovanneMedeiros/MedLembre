import type { LucideIcon } from "lucide-react";
import { CalendarCheck, HeartHandshake, History, MessageSquare, Smile, Sparkles } from "lucide-react";

export interface Benefit {
  title: string;
  description: string;
  icon: LucideIcon;
}

export const BENEFITS: Benefit[] = [
  {
    title: "Lembretes pelo WhatsApp",
    description: "Sem baixar outro aplicativo: os avisos chegam no WhatsApp que você já usa todos os dias.",
    icon: MessageSquare,
  },
  {
    title: "Organização dos medicamentos",
    description: "Todos os remédios, dosagens e horários organizados em um só lugar, sempre à mão.",
    icon: CalendarCheck,
  },
  {
    title: "Cuidado com familiares",
    description: "Acompanhe a rotina de medicamentos de quem você ama, mesmo à distância.",
    icon: HeartHandshake,
  },
  {
    title: "Histórico da rotina",
    description: "Veja o que foi tomado e o que ficou pendente, com um histórico simples de consultar.",
    icon: History,
  },
  {
    title: "Mais tranquilidade",
    description: "Menos preocupação com esquecimentos, mais confiança na sua rotina de cuidados.",
    icon: Smile,
  },
  {
    title: "Fácil de usar",
    description: "Interface simples, pensada para pessoas de todas as idades cadastrarem em minutos.",
    icon: Sparkles,
  },
];
