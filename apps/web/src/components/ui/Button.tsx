import type { ButtonHTMLAttributes, AnchorHTMLAttributes, ReactNode } from "react";
import { Link, type LinkProps } from "react-router-dom";
import { cn } from "../../lib/cn";

type Variant = "primary" | "secondary" | "ghost";
type Size = "md" | "lg";

const base =
  "inline-flex items-center justify-center gap-2 rounded-full font-semibold transition-all duration-200 ease-out focus-visible:outline-2 focus-visible:outline-offset-2 focus-visible:outline-brand-500 disabled:pointer-events-none disabled:opacity-50";

const variants: Record<Variant, string> = {
  primary:
    "bg-gradient-to-b from-brand-500 to-brand-600 text-white shadow-soft hover:shadow-lift hover:-translate-y-0.5 active:translate-y-0",
  secondary:
    "bg-white text-ink-900 border border-brand-200/70 shadow-soft hover:border-brand-300 hover:-translate-y-0.5 active:translate-y-0",
  ghost: "text-ink-700 hover:text-brand-600 hover:bg-brand-50",
};

const sizes: Record<Size, string> = {
  md: "h-11 px-5 text-sm",
  lg: "h-12 px-7 text-base",
};

interface CommonProps {
  variant?: Variant;
  size?: Size;
  className?: string;
  children: ReactNode;
}

type ButtonProps = CommonProps &
  ButtonHTMLAttributes<HTMLButtonElement> & { as?: "button" };

type AnchorProps = CommonProps &
  AnchorHTMLAttributes<HTMLAnchorElement> & { as: "a"; href: string };

type RouterLinkProps = CommonProps & Omit<LinkProps, keyof CommonProps> & { as: "link" };

type Props = ButtonProps | AnchorProps | RouterLinkProps;

export function Button({ variant = "primary", size = "md", className, children, as, ...props }: Props) {
  const classes = cn(base, variants[variant], sizes[size], className);

  if (as === "a") {
    const { href, ...rest } = props as AnchorProps;
    return (
      <a href={href} className={classes} {...rest}>
        {children}
      </a>
    );
  }

  if (as === "link") {
    const { to, ...rest } = props as RouterLinkProps;
    return (
      <Link to={to} className={classes} {...rest}>
        {children}
      </Link>
    );
  }

  return (
    <button className={classes} {...(props as ButtonHTMLAttributes<HTMLButtonElement>)}>
      {children}
    </button>
  );
}
