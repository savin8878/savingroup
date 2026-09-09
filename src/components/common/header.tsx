"use client";

import { useEffect, useState } from "react";
import { usePathname } from "next/navigation";
import {
  AnimatePresence,
  motion,
  useReducedMotion,
  useScroll,
  useSpring,
} from "framer-motion";
import { ArrowUpRight, Menu, Sparkles, X } from "lucide-react";
import LocalizedLink from "../LocalizedLink";
import Logo from "../Logo/logo";
import LanguageSwitcher from "./LanguageSwitcher";
import { ThemeToggle } from "./ThemeToggle";
import {
  DesktopMegaNav,
  MobileMegaNav,
  type CityNavItem,
} from "./MegaMenu";
import type { Messages, Locale } from "@/lib/i18n";

interface HeaderProps {
  translations: Messages;
  locale: Locale;
  country: string;
  cities: CityNavItem[];
}

/**
 * Breakpoint at which the drawer is replaced by the desktop mega nav.
 * Kept in sync with the `lg:` variants below — if you move one, move both.
 */
const DESKTOP_QUERY = "(min-width: 1024px)";

export default function Header({
  translations,
  locale,
  country,
  cities,
}: HeaderProps) {
  const [open, setOpen] = useState(false);
  const [scrolled, setScrolled] = useState(false);
  const [rtl, setRtl] = useState(false);
  const pathname = usePathname();
  const reduceMotion = useReducedMotion();

  const { scrollYProgress } = useScroll();
  const scaleX = useSpring(scrollYProgress, {
    stiffness: 120,
    damping: 30,
    restDelta: 0.001,
  });

  // The drawer slides in from the inline-end edge, which flips for `ar`.
  useEffect(() => {
    setRtl(document.documentElement.dir === "rtl");
  }, [locale]);

  useEffect(() => {
    const onScroll = () => setScrolled(window.scrollY > 24);
    onScroll();
    window.addEventListener("scroll", onScroll, { passive: true });
    return () => window.removeEventListener("scroll", onScroll);
  }, []);

  // Route change closes the drawer — covers links that don't go through
  // `onNavigate` (anchor jumps, the language switcher, browser back).
  useEffect(() => {
    setOpen(false);
  }, [pathname]);

  // The drawer only exists below `lg`. If the viewport crosses that line
  // while it's open (rotation, split view, a resized window) close it, so
  // the scroll lock can never strand the page with no way to release it.
  useEffect(() => {
    if (!open) return;
    const mq = window.matchMedia(DESKTOP_QUERY);
    if (mq.matches) {
      setOpen(false);
      return;
    }
    const onChange = (e: MediaQueryListEvent) => {
      if (e.matches) setOpen(false);
    };
    mq.addEventListener("change", onChange);
    return () => mq.removeEventListener("change", onChange);
  }, [open]);

  useEffect(() => {
    if (!open) return;
    const onKey = (e: KeyboardEvent) => {
      if (e.key === "Escape") setOpen(false);
    };
    window.addEventListener("keydown", onKey);
    return () => window.removeEventListener("keydown", onKey);
  }, [open]);

  // Scroll lock. The padding compensation keeps the header from shifting
  // sideways on viewports that have a classic (space-taking) scrollbar.
  useEffect(() => {
    if (!open) return;
    const body = document.body;
    const prevOverflow = body.style.overflow;
    const prevPadding = body.style.paddingRight;
    const scrollbar = window.innerWidth - document.documentElement.clientWidth;
    body.style.overflow = "hidden";
    if (scrollbar > 0) body.style.paddingRight = `${scrollbar}px`;
    return () => {
      body.style.overflow = prevOverflow;
      body.style.paddingRight = prevPadding;
    };
  }, [open]);

  const ctaLabel = translations.nav.cta;

  return (
    <>
      {/* Announcement bar — hidden on phones, where vertical space is the
          scarcest resource on the page. Its `h-9` is mirrored by the
          header's `sm:top-9` offset below. */}
      <div className="relative z-[101] hidden h-9 border-b border-border/60 bg-surface/80 backdrop-blur-xl sm:block">
        <div className="container-px mx-auto flex h-full max-w-7xl items-center justify-between gap-4 text-[11px]">
          <div className="flex min-w-0 items-center gap-2 text-muted-foreground">
            <Sparkles size={11} className="shrink-0 text-accent" />
            <span className="truncate font-mono uppercase tracking-[0.22em]">
              Revenue Audits — 3 slots open this week
            </span>
          </div>
          <div className="hidden shrink-0 items-center gap-5 font-mono uppercase tracking-[0.22em] text-muted-foreground lg:flex">
            <span className="flex items-center gap-1.5">
              <span className="h-1.5 w-1.5 rounded-full bg-success pulse-dot" />
              All systems operational
            </span>
            <span className="hidden xl:inline">India · Serving global</span>
          </div>
        </div>
      </div>

      {/* NOTE: the blur lives on an inset child, not on <header> itself.
          A `backdrop-filter` on an ancestor makes it the containing block for
          `position: fixed` descendants, which would break the mega-menu panel.
          Keeping it off the header keeps those anchored to the viewport. */}
      <header
        className={`fixed inset-x-0 z-[100] transition-[top] duration-500 ${
          scrolled ? "top-0" : "top-0 sm:top-9"
        }`}
      >
        <div
          aria-hidden
          className={`absolute inset-0 -z-10 border-b bg-background/80 backdrop-blur-xl transition-opacity duration-500 ${
            scrolled
              ? "border-border/60 opacity-100"
              : "border-transparent opacity-0"
          }`}
        />

        <motion.div
          className="absolute inset-x-0 top-0 h-px origin-left bg-gradient-to-r from-transparent via-accent to-transparent"
          style={{ scaleX }}
        />

        <div className="container-px mx-auto flex h-[var(--header-h)] max-w-7xl items-center gap-2 sm:gap-4">
          <LocalizedLink href="/" className="group shrink-0">
            <Logo size="md" />
          </LocalizedLink>

          {/* Takes every pixel the logo and the actions don't need; the nav
              itself decides how many items fit into what it is given. */}
          <DesktopMegaNav translations={translations} cities={cities} />

          {/* Spacer for sub-lg layouts, where the nav above renders nothing. */}
          <div className="flex-1 lg:hidden" />

          <div className="flex shrink-0 items-center gap-1.5 sm:gap-2 xl:gap-3">
            <div className="hidden sm:block">
              <ThemeToggle />
            </div>
            <div className="hidden md:block">
              <LanguageSwitcher locale={locale} country={country} />
            </div>

            {/* Icon-only from md→xl so the pill never eats the nav's room; the
                label appears once there is width to spare. Locale-proof —
                no hardcoded short label to fall out of sync. */}
            <LocalizedLink
              href="/contact"
              aria-label={ctaLabel}
              title={ctaLabel}
              className="group relative hidden h-10 w-10 shrink-0 items-center justify-center gap-1.5 whitespace-nowrap rounded-full bg-accent text-sm font-semibold text-accent-foreground shadow-[0_8px_32px_-12px_oklch(0.78_0.165_70/0.6)] transition-all hover:shadow-[0_12px_36px_-10px_oklch(0.78_0.165_70/0.75)] md:inline-flex xl:h-auto xl:w-auto xl:px-5 xl:py-2.5"
            >
              <span
                aria-hidden
                className="pointer-events-none absolute inset-0 -z-10 rounded-full bg-gradient-to-r from-accent to-[oklch(0.7_0.18_55)] opacity-0 blur-md transition-opacity group-hover:opacity-80"
              />
              <span className="hidden xl:inline">{ctaLabel}</span>
              <ArrowUpRight
                size={15}
                className="shrink-0 transition-transform group-hover:translate-x-0.5 group-hover:-translate-y-0.5"
              />
            </LocalizedLink>

            <button
              className="flex h-10 w-10 items-center justify-center rounded-full border border-border bg-surface text-foreground transition-colors hover:bg-surface-2 sm:h-11 sm:w-11 lg:hidden"
              onClick={() => setOpen((v) => !v)}
              aria-label={open ? "Close menu" : "Open menu"}
              aria-expanded={open}
              aria-controls="mobile-nav"
            >
              {open ? <X size={20} /> : <Menu size={20} />}
            </button>
          </div>
        </div>
      </header>

      {/* Rendered as a sibling of <header> so it owns the full viewport
          regardless of the header's own height and offset — no
          `100vh - 72px` arithmetic to go stale, and correct on short
          landscape phones where `100vh` overshoots. */}
      <AnimatePresence>
        {open && (
          <>
            <motion.div
              key="scrim"
              initial={{ opacity: 0 }}
              animate={{ opacity: 1 }}
              exit={{ opacity: 0 }}
              transition={{ duration: 0.2 }}
              onClick={() => setOpen(false)}
              className="fixed inset-0 z-[130] bg-background/70 backdrop-blur-sm lg:hidden"
              aria-hidden
            />
            <motion.div
              key="drawer"
              id="mobile-nav"
              role="dialog"
              aria-modal="true"
              aria-label="Site navigation"
              initial={
                reduceMotion ? { opacity: 0 } : { x: rtl ? "-100%" : "100%" }
              }
              animate={reduceMotion ? { opacity: 1 } : { x: 0 }}
              exit={
                reduceMotion ? { opacity: 0 } : { x: rtl ? "-100%" : "100%" }
              }
              transition={{ duration: 0.28, ease: [0.22, 0.9, 0.32, 1] }}
              className="fixed inset-y-0 end-0 z-[140] flex h-[100dvh] w-full max-w-[26rem] flex-col border-border bg-background shadow-[0_0_60px_-12px_rgba(0,0,0,0.5)] ltr:border-l rtl:border-r sm:w-[85vw] lg:hidden"
            >
              <div className="flex h-[var(--header-h)] shrink-0 items-center justify-between gap-3 border-b border-border px-5">
                <LocalizedLink href="/" onClick={() => setOpen(false)}>
                  <Logo size="sm" />
                </LocalizedLink>
                <button
                  onClick={() => setOpen(false)}
                  aria-label="Close menu"
                  className="flex h-10 w-10 shrink-0 items-center justify-center rounded-full border border-border bg-surface text-foreground"
                >
                  <X size={20} />
                </button>
              </div>

              <div className="min-h-0 flex-1 overflow-y-auto overscroll-contain px-4 py-5">
                <MobileMegaNav
                  translations={translations}
                  cities={cities}
                  onNavigate={() => setOpen(false)}
                />
              </div>

              <div className="shrink-0 border-t border-border bg-surface/40 px-4 pb-[max(1rem,env(safe-area-inset-bottom))] pt-4">
                <LocalizedLink
                  href="/contact"
                  onClick={() => setOpen(false)}
                  className="inline-flex w-full items-center justify-center gap-2 rounded-full bg-accent px-6 py-3.5 text-base font-semibold text-accent-foreground"
                >
                  <span className="truncate">{ctaLabel}</span>
                  <ArrowUpRight size={18} className="shrink-0" />
                </LocalizedLink>
                <div className="mt-3 flex items-center justify-end gap-3">
                  <div className="me-auto hidden min-w-0 items-center gap-2 font-mono text-[10px] uppercase tracking-[0.22em] text-muted-foreground min-[400px]:flex">
                    <span className="h-1.5 w-1.5 shrink-0 rounded-full bg-success pulse-dot" />
                    <span className="truncate">All systems operational</span>
                  </div>
                  <div className="flex shrink-0 items-center gap-2">
                    <ThemeToggle />
                    <LanguageSwitcher locale={locale} country={country} />
                  </div>
                </div>
              </div>
            </motion.div>
          </>
        )}
      </AnimatePresence>
    </>
  );
}
