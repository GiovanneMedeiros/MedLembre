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
              "group relative flex items-center gap-3 rounded-xl px-3.5 py-2.5 text-sm font-medium transition-colors duration-200",
              isActive
                ? "bg-gradient-to-r from-brand-50 to-brand-50/40 text-brand-700"
                : "text-ink-500 hover:bg-ink-900/[0.03] hover:text-ink-900",
            )
          }
        >
          {({ isActive }) => (
            <>
              {isActive && (
                <span
                  className="absolute top-2 bottom-2 left-0 w-1 animate-dose-pop rounded-full bg-brand-600"
                  aria-hidden="true"
                />
              )}
              <item.icon
                className={cn(
                  "h-[18px] w-[18px] shrink-0 transition-transform duration-300 ease-out group-hover:scale-110",
                  isActive && "text-brand-600",
                )}
                aria-hidden="true"
              />
              {item.label}
            </>
          )}
        </NavLink>
      ))}
    </nav>
  );
}
