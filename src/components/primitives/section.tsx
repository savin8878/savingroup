import { cn } from "@/lib/utils";
import type { ReactNode } from "react";

export function Section({
  id,
  className,
  children,
  noPadding = false,
}: {
  id?: string;
  className?: string;
  children: ReactNode;
  noPadding?: boolean;
}) {
  return (
    <section
      id={id}
      className={cn(
        "relative scroll-mt-24",
        !noPadding && "py-12 sm:py-16 lg:py-24",
        className
      )}
    >
      <div className={cn("relative mx-auto max-w-7xl", !noPadding && "container-px")}>{children}</div>
    </section>
  );
}

export function Eyebrow({
  children,
  variant = "default",
}: {
  children: ReactNode;
  variant?: "default" | "accent";
}) {
  return (
    <div
      className={cn(
        "inline-flex items-center gap-2 font-mono text-[11px] uppercase tracking-[0.2em] text-accent-strong",
        variant === "accent" && "rounded-full border border-accent/30 bg-accent-soft px-3 py-1.5"
      )}
    >
      <span className="h-1.5 w-1.5 rounded-full bg-accent-strong" />
      {children}
    </div>
  );
}

export function SectionHeader({
  eyebrow,
  title,
  subtitle,
  align = "left",
  className,
  meta,
}: {
  eyebrow?: string;
  title: ReactNode;
  subtitle?: string;
  align?: "left" | "center";
  className?: string;
  /** Optional small meta line shown above the title (e.g., section index) */
  meta?: string;
}) {
  return (
    <div
      className={cn(
        "max-w-3xl",
        align === "center" && "mx-auto text-center",
        className
      )}
    >
      <div
        className={cn(
          "flex flex-wrap items-center gap-3",
          align === "center" && "justify-center"
        )}
      >
        {eyebrow && <Eyebrow>{eyebrow}</Eyebrow>}
        {meta && (
          <span className="font-mono text-[11px] uppercase tracking-[0.2em] text-muted-foreground">
            {meta}
          </span>
        )}
      </div>
      <h2 className="text-balance mt-4 sm:mt-5 font-display text-[1.75rem] font-semibold leading-[1.12] tracking-tight text-foreground sm:text-[2.125rem] lg:text-[2.75rem]">
        {title}
      </h2>
      {subtitle && (
        <p className="text-pretty mt-4 sm:mt-5 text-base sm:text-[1.0625rem] leading-relaxed text-muted-foreground">
          {subtitle}
        </p>
      )}
    </div>
  );
}

/** Reusable section divider — a hairline with optional centered chip */
export function SectionDivider({ label }: { label?: string }) {
  return (
    <div className="container-px mx-auto max-w-7xl">
      <div className="relative flex items-center justify-center py-4">
        <div className="h-px w-full bg-gradient-to-r from-transparent via-border to-transparent" />
        {label && (
          <span className="absolute left-1/2 -translate-x-1/2 bg-background px-4 font-mono text-[11px] uppercase tracking-[0.24em] text-muted-foreground">
            {label}
          </span>
        )}
      </div>
    </div>
  );
}
