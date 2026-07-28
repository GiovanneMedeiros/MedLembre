import type { ReactNode } from "react";
import { Link } from "react-router-dom";
import { Logo } from "../ui/Logo";

interface AuthLayoutProps {
  title: string;
  subtitle?: string;
  children: ReactNode;
  footer?: ReactNode;
}

export function AuthLayout({ title, subtitle, children, footer }: AuthLayoutProps) {
  return (
    <div className="relative flex min-h-svh items-center justify-center overflow-hidden bg-cream px-4 py-12">
      <div
        className="pointer-events-none absolute inset-x-0 -top-40 -z-10 h-[480px] bg-gradient-to-b from-brand-100/70 via-brand-50/40 to-transparent"
        aria-hidden="true"
      />

      <div className="w-full max-w-md">
        <Link to="/" className="mb-8 flex justify-center" aria-label="MedLembre — início">
          <Logo />
        </Link>

        <div className="rounded-3xl border border-ink-900/[0.06] bg-white p-7 shadow-lift sm:p-9">
          <div className="text-center">
            <h1 className="text-2xl font-bold text-ink-900">{title}</h1>
            {subtitle && <p className="mt-2 text-sm text-ink-500">{subtitle}</p>}
          </div>

          <div className="mt-7">{children}</div>
        </div>

        {footer && <div className="mt-6 text-center text-sm text-ink-500">{footer}</div>}
      </div>
    </div>
  );
}
