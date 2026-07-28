import type { LucideIcon } from "lucide-react";
import { Container } from "../ui/Container";
import { PageHeader } from "./PageHeader";

interface ComingSoonPageProps {
  title: string;
  description: string;
  icon: LucideIcon;
}

export function ComingSoonPage({ title, description, icon: Icon }: ComingSoonPageProps) {
  return (
    <div className="pb-16">
      <PageHeader title={title} />
      <Container className="pt-6 sm:pt-8">
        <div className="flex flex-col items-center rounded-2xl border border-dashed border-ink-900/15 bg-white py-16 text-center">
          <div className="flex h-14 w-14 items-center justify-center rounded-2xl bg-brand-50 text-brand-600">
            <Icon className="h-7 w-7" aria-hidden="true" />
          </div>
          <h2 className="mt-4 text-lg font-bold text-ink-900">Em breve</h2>
          <p className="mt-1 max-w-sm text-sm text-ink-500">{description}</p>
        </div>
      </Container>
    </div>
  );
}
