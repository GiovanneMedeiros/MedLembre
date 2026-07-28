import type { ReactNode } from "react";
import { Container } from "../ui/Container";

interface PageHeaderProps {
  title: string;
  description?: string;
  action?: ReactNode;
}

export function PageHeader({ title, description, action }: PageHeaderProps) {
  return (
    <div className="border-b border-ink-900/[0.06] bg-white">
      <Container className="py-6 sm:py-8">
        <div className="flex flex-col gap-4 sm:flex-row sm:items-center sm:justify-between">
          <div>
            <h1 className="text-2xl font-bold text-ink-900 sm:text-[28px]">{title}</h1>
            {description && <p className="mt-1 text-sm text-ink-500">{description}</p>}
          </div>
          {action}
        </div>
      </Container>
    </div>
  );
}
