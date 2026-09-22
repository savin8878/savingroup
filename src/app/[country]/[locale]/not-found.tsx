import type { Metadata } from "next";
import LocalizedLink from "@/components/LocalizedLink";
import { ArrowUpRight, Home, Search } from "lucide-react";

/**
 * Without this, the 404 inherits the locale layout's metadata: an
 * `index, follow` robots tag, the homepage `<title>`, and a canonical
 * pointing at the country/locale root. Next.js then adds its own `noindex`,
 * so the response shipped two contradictory robots tags and told Google the
 * homepage was the canonical URL for an arbitrary missing page.
 *
 * `alternates: { canonical: null }` suppresses the inherited canonical —
 * a 404 should not claim to be the canonical version of anything.
 */
export const metadata: Metadata = {
  title: "Page not found",
  robots: { index: false, follow: true },
  alternates: { canonical: null },
};

export default function NotFound() {
  return (
    <section className="relative flex min-h-[70vh] flex-col items-center justify-center overflow-hidden px-6 py-24">
      <div className="bg-mesh absolute inset-0 -z-20" />
      <div className="bg-grid bg-grid-fade absolute inset-0 -z-10 opacity-40" />

      <div className="relative text-center">
        {/* 404 number */}
        <div className="font-display text-[clamp(6rem,20vw,12rem)] font-semibold leading-none tracking-tighter text-accent/20">
          404
        </div>

        <h1 className="mt-2 font-display text-3xl font-semibold tracking-tight text-foreground sm:text-4xl">
          Page not found
        </h1>

        <p className="mx-auto mt-4 max-w-md text-base leading-relaxed text-muted-foreground">
          The page you&apos;re looking for doesn&apos;t exist or has been moved.
          Let&apos;s get you back on track.
        </p>

        <div className="mt-8 flex flex-col items-center justify-center gap-3 sm:flex-row">
          <LocalizedLink
            href="/"
            className="group inline-flex items-center gap-2 rounded-full bg-accent px-6 py-3 text-sm font-semibold text-accent-foreground shadow-lg transition-all hover:-translate-y-0.5"
          >
            <Home size={16} />
            Go to homepage
          </LocalizedLink>
          <LocalizedLink
            href="/contact"
            className="group inline-flex items-center gap-2 rounded-full border border-border bg-surface/60 px-6 py-3 text-sm font-semibold text-foreground backdrop-blur-sm transition-all hover:border-accent/40"
          >
            Contact us
            <ArrowUpRight
              size={14}
              className="transition-transform group-hover:translate-x-0.5 group-hover:-translate-y-0.5"
            />
          </LocalizedLink>
        </div>

        <div className="mt-10 flex items-center justify-center gap-2 font-mono text-xs uppercase tracking-[0.2em] text-muted-foreground">
          <Search size={12} />
          Looking for a specific service? Try our{" "}
          <LocalizedLink href="/services" className="text-accent underline underline-offset-4">
            services page
          </LocalizedLink>
        </div>
      </div>
    </section>
  );
}
