"use client";

import {
  ArrowUpRight,
  Briefcase,
  GitBranch,
  Mail,
  MapPin,
  Newspaper,
  Sparkles,
  Star,
  type LucideIcon,
} from "lucide-react";
import LocalizedLink from "../LocalizedLink";

/**
 * Sub-page navigation chip strip shown at the top of every /cities/[city]/*
 * page. Lets the user jump between Overview / Services / Process / Case studies
 * / About / Blog / Contact for the same city without going back to the hub.
 *
 * Mobile: horizontally scrollable snap chips. sm+: wrap.
 */

const PAGES: { slug: string; label: string; Icon: LucideIcon }[] = [
  { slug: "", label: "Overview", Icon: MapPin },
  { slug: "services", label: "Services", Icon: Briefcase },
  { slug: "process", label: "Process", Icon: GitBranch },
  { slug: "case-studies", label: "Case studies", Icon: Star },
  { slug: "about", label: "About", Icon: Sparkles },
  { slug: "blog", label: "Blog", Icon: Newspaper },
  { slug: "contact", label: "Contact", Icon: Mail },
];

export function CityPageNav({
  citySlug,
  cityName,
  themeColor,
  active,
}: {
  citySlug: string;
  cityName: string;
  themeColor?: string;
  /** Slug of the active sub-page; empty string = Overview */
  active: string;
}) {
  const accent = themeColor ?? "oklch(0.78 0.165 70)";

  return (
    <nav
      aria-label={`${cityName} page navigation`}
      className="sticky top-[var(--header-h)] z-30 -mx-4 border-y border-border bg-background/85 backdrop-blur-xl sm:mx-0 sm:rounded-2xl sm:border"
    >
      <div className="flex snap-x snap-mandatory items-center gap-1.5 overflow-x-auto px-4 py-2.5 [scrollbar-width:none] [&::-webkit-scrollbar]:hidden sm:flex-wrap sm:gap-2 sm:px-3">
        <span
          className="hidden flex-shrink-0 items-center gap-1.5 rounded-full border px-2.5 py-1 font-mono text-[9px] uppercase tracking-[0.22em] sm:inline-flex"
          style={{
            borderColor: accent.replace(")", " / 0.4)"),
            background: accent.replace(")", " / 0.06)"),
            color: accent,
          }}
        >
          <MapPin size={9} />
          {cityName}
        </span>
        {PAGES.map(({ slug, label, Icon }) => {
          const isActive = active === slug;
          const href =
            slug === ""
              ? `/cities/${citySlug}`
              : `/cities/${citySlug}/${slug}`;
          return (
            <LocalizedLink
              key={slug || "overview"}
              href={href}
              aria-current={isActive ? "page" : undefined}
              className={`group inline-flex flex-shrink-0 snap-start items-center gap-1.5 rounded-full border px-3 py-1.5 font-mono text-[10px] font-semibold uppercase tracking-[0.18em] transition-all ${
                isActive
                  ? "border-foreground bg-foreground text-background"
                  : "border-border bg-surface/40 text-muted-foreground hover:border-accent/50 hover:text-foreground"
              }`}
              style={
                isActive
                  ? {
                      borderColor: accent,
                      background: accent,
                      color: "var(--background)",
                    }
                  : undefined
              }
            >
              <Icon size={11} strokeWidth={2} />
              {label}
              {!isActive && (
                <ArrowUpRight
                  size={10}
                  className="opacity-0 transition-opacity group-hover:opacity-100"
                />
              )}
            </LocalizedLink>
          );
        })}
      </div>
    </nav>
  );
}
