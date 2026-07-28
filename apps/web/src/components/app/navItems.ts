import {
  CreditCard,
  History,
  LayoutDashboard,
  type LucideIcon,
  Pill,
  Settings,
  Users,
} from "lucide-react";

export interface NavItem {
  label: string;
  to: string;
  icon: LucideIcon;
  end?: boolean;
}

export const NAV_ITEMS: NavItem[] = [
  { label: "Dashboard", to: "/dashboard", icon: LayoutDashboard, end: true },
  { label: "Meus medicamentos", to: "/dashboard/medicamentos", icon: Pill },
  { label: "Histórico", to: "/dashboard/historico", icon: History },
  { label: "Família", to: "/dashboard/familia", icon: Users },
  { label: "Assinatura", to: "/dashboard/assinatura", icon: CreditCard },
  { label: "Configurações", to: "/dashboard/configuracoes", icon: Settings },
];
