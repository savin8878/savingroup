import { cn } from "@/lib/utils";
import { ArrowUpRight } from "lucide-react";
import type { ReactNode } from "react";
import LocalizedLink from "../LocalizedLink";

interface ButtonLinkProps {
  href: string;
  children: ReactNode;
  variant?: "primary" | "secondary" | "ghost" | "outline";
  size?: "md" | "lg";
  className?: string;
  withArrow?: boolean;
}

export function ButtonLink({
  href,
  children,
  variant = "primary",
  size = "md",
  className,
  withArrow = true,
}: ButtonLinkProps) {
  const base =
    "group relative inline-flex items-center justify-center gap-2 rounded-full font-semibold transition-opacity duration-200";

  const sizes = {
    md: "px-6 py-3.5 text-sm",
    lg: "px-7 py-4 text-base",
  } as const;

  const styles = {
    primary:
      "bg-accent-strong text-accent-foreground hover:opacity-90",
    secondary:
      "border border-border bg-surface text-foreground hover:border-border-strong hover:bg-surface-2",
    outline:
      "border border-accent/40 bg-accent-soft text-accent-strong hover:border-accent/70",
    ghost: "text-foreground hover:bg-surface",
  } as const;

  return (
    <LocalizedLink
      href={href}
      className={cn(base, sizes[size], styles[variant], className)}
    >
      <span className="relative">{children}</span>
      {withArrow && (
        <ArrowUpRight
          size={size === "lg" ? 18 : 16}
          className="relative transition-transform duration-300 group-hover:translate-x-0.5 group-hover:-translate-y-0.5"
        />
      )}
    </LocalizedLink>
  );
}
