import { NavLink } from "react-router-dom";
import { NAV_ITEMS } from "./navItems";
import { cn } from "../../lib/cn";

export function SidebarNav({ onNavigate }: { onNavigate?: () => void }) {
  return (
    <nav className="flex flex-col gap-1">
      {NAV_ITEMS.map((item) => (
        <NavLink
          key={item.to}
          to={item.to}
          end={item.end}
          onClick={onNavigate}
          className={({ isActive }) =>
            cn(
              "flex items-center gap-3 rounded-xl px-3.5 py-2.5 text-sm font-medium transition-colors",
              isActive
                ? "bg-brand-50 text-brand-700"
                : "text-ink-500 hover:bg-ink-900/[0.03] hover:text-ink-900",
            )
          }
        >
          <item.icon className="h-[18px] w-[18px] shrink-0" aria-hidden="true" />
          {item.label}
        </NavLink>
      ))}
    </nav>
  );
}
