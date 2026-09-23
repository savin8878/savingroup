import { ChevronRight } from "lucide-react";
import { Eyebrow } from "../primitives/section";
import LocalizedLink from "../LocalizedLink";

/**
 * Page header for every internal page.
 *
 * SIZING. The h1 used to be `clamp(2rem, 7vw, 5rem)` with a hard
 * `lg:text-[5rem]` floor — an 80px headline that, together with the top
 * margin and the subtitle, filled most of the first screen on a laptop before
 * the page had said anything. It is now `clamp(1.875rem, 4.2vw, 3rem)`: 48px
 * at the top end, inside the 32–44px band the rest of the page uses, with a
 * little headroom because this is the page's one h1.
 *
 * `compact` goes further, for pages where the job is below the header rather
 * than in it — /contact above all, where the form is the point.
 */
export function PageHero({
  eyebrow,
  title,
  subtitle,
  breadcrumb,
  compact = false,
}: {
  eyebrow: string;
  title: React.ReactNode;
  subtitle?: string;
  breadcrumb?: string;
  compact?: boolean;
}) {
  return (
    <section
      className={
        compact
          ? "relative isolate overflow-hidden mt-16 sm:mt-20 lg:mt-24"
          : "relative isolate overflow-hidden mt-20 sm:mt-28 lg:mt-32"
      }
    >
      <div className="container-px relative z-10 mx-auto max-w-7xl">
        {/* Breadcrumb */}
        <nav
          aria-label="Breadcrumb"
          className="mb-4 flex flex-wrap items-center gap-1.5 font-mono text-[11px] uppercase tracking-[0.2em] text-muted-foreground sm:mb-5"
        >
          <LocalizedLink
            href="/"
            className="transition-colors hover:text-foreground"
          >
            Home
          </LocalizedLink>
          <ChevronRight size={11} />
          <span className="line-clamp-1 text-foreground">{breadcrumb ?? eyebrow}</span>
        </nav>

        <Eyebrow>{eyebrow}</Eyebrow>
        <h1
          className={
            compact
              ? "text-balance mt-4 max-w-3xl font-display text-[clamp(1.75rem,3.6vw,2.5rem)] font-semibold leading-[1.1] tracking-tight text-foreground"
              : "text-balance mt-4 max-w-4xl font-display text-[clamp(1.875rem,4.2vw,3rem)] font-semibold leading-[1.08] tracking-tight text-foreground sm:mt-5"
          }
        >
          {title}
        </h1>
        {subtitle && (
          <p className="text-pretty mt-4 max-w-2xl text-base leading-relaxed text-muted-foreground sm:text-[1.0625rem]">
            {subtitle}
          </p>
        )}
      </div>
    </section>
  );
}
