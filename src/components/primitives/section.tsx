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
        !noPadding && "py-8 sm:py-14 lg:py-24",
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
        "inline-flex items-center gap-2 rounded-full border px-3 py-1.5 font-mono text-[10px] uppercase tracking-[0.22em]",
        variant === "default"
          ? "border-border bg-surface text-accent"
          : "border-accent/40 bg-accent/10 text-accent"
      )}
    >
      <span className="relative flex h-1.5 w-1.5">
        <span className="absolute inline-flex h-full w-full animate-ping rounded-full bg-accent opacity-60" />
        <span className="relative inline-flex h-1.5 w-1.5 rounded-full bg-accent" />
      </span>
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
          <span className="font-mono text-[10px] uppercase tracking-[0.22em] text-muted-foreground">
            {meta}
          </span>
        )}
      </div>
      <h2 className="text-balance mt-4 sm:mt-5 font-display text-2xl font-semibold leading-[1.08] tracking-tight text-foreground sm:text-4xl lg:text-[3.5rem]">
        {title}
      </h2>
      {subtitle && (
        <p className="text-pretty mt-4 sm:mt-6 text-base sm:text-lg leading-relaxed text-muted-foreground">
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
          <span className="absolute left-1/2 -translate-x-1/2 bg-background px-4 font-mono text-[9px] uppercase tracking-[0.28em] text-muted-foreground">
            {label}
          </span>
        )}
      </div>
    </div>
  );
}
