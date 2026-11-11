import type { ReactNode } from "react";
import type { LucideIcon } from "lucide-react";
import { Container } from "../ui/Container";
import { PageBackdrop } from "./PageBackdrop";

interface PageHeaderProps {
  title: string;
  description?: string;
  action?: ReactNode;
  icon?: LucideIcon;
}

export function PageHeader({ title, description, action, icon: Icon }: PageHeaderProps) {
  return (
    <header className="relative">
      <PageBackdrop />
      <Container className="pt-8 sm:pt-10">
        <div className="flex flex-col gap-5 sm:flex-row sm:items-end sm:justify-between">
          <div className="flex animate-rise items-center gap-4">
            {Icon && (
              <span className="hidden h-14 w-14 shrink-0 animate-dose-pop items-center justify-center rounded-2xl bg-gradient-to-br from-brand-500 to-brand-700 text-white shadow-lift sm:flex">
                <Icon className="h-6 w-6" aria-hidden="true" />
              </span>
            )}
            <div className="min-w-0">
              <h1 className="font-heading text-3xl font-extrabold tracking-tight text-balance text-ink-900 sm:text-4xl">
                {title}
              </h1>
              {description && <p className="mt-1.5 text-base text-pretty text-ink-500">{description}</p>}
            </div>
          </div>
          {action && (
            <div className="shrink-0 animate-rise" style={{ animationDelay: "0.12s" }}>
              {action}
            </div>
          )}
        </div>
      </Container>
    </header>
  );
}
