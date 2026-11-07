import type { ReactNode } from "react";
import { Link } from "react-router-dom";
import { Logo } from "../ui/Logo";
import { PillOrganizer } from "../landing/PillOrganizer";

interface AuthLayoutProps {
  title: string;
  subtitle?: string;
  children: ReactNode;
  footer?: ReactNode;
}

/** Campos maiores nas telas de entrada; somar ao `inputClassName`. */
export const authInputSize = "h-14 rounded-2xl pl-5 text-base";

export function AuthLayout({ title, subtitle, children, footer }: AuthLayoutProps) {
  return (
    <div className="font-hyper min-h-svh bg-white text-ink-900 lg:grid lg:grid-cols-[minmax(0,5fr)_minmax(0,6fr)]">
      <aside className="hidden flex-col justify-between bg-cha p-12 lg:flex xl:p-16">
        <Link to="/" aria-label="MedLembre, voltar ao início" className="self-start">
          <Logo />
        </Link>

        <div>
          <p className="max-w-md text-4xl font-extrabold leading-tight text-ink-900">
            Cada remédio no seu horário, todos os dias.
          </p>
          <PillOrganizer size="sm" className="mt-10 max-w-md" />
        </div>

        <p className="max-w-sm text-sm leading-relaxed text-ink-500">
          O MedLembre é uma ferramenta de organização e lembrete. Não substitui orientação médica.
        </p>
      </aside>

      <main className="flex min-h-svh items-center justify-center px-5 py-12 sm:px-8 lg:min-h-0">
        <div className="w-full max-w-md">
          <Link to="/" aria-label="MedLembre, voltar ao início" className="mb-12 inline-block lg:hidden">
            <Logo />
          </Link>

          <h1 className="text-4xl font-extrabold leading-tight text-ink-900">{title}</h1>
          {subtitle && <p className="mt-3 text-lg leading-relaxed text-ink-700">{subtitle}</p>}

          <div className="mt-9 [&_label]:text-base">{children}</div>

          {footer && (
            <div className="mt-9 border-t-2 border-ink-900/[0.07] pt-6 text-lg text-ink-700">{footer}</div>
          )}
        </div>
      </main>
    </div>
  );
}
