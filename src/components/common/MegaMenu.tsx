"use client";

import { useCallback, useEffect, useMemo, useRef, useState } from "react";
import { motion, AnimatePresence } from "framer-motion";
import {
  ArrowRight,
  ArrowUpRight,
  BookOpen,
  Bot,
  Briefcase,
  Building2,
  ChevronDown,
  ChevronLeft,
  ChevronRight,
  Database,
  Factory,
  Globe2,
  GraduationCap,
  Handshake,
  LineChart,
  Mail,
  MapPin,
  MapPinned,
  MonitorSmartphone,
  MoreHorizontal,
  Search,
  ShoppingBag,
  Sparkles,
  Stethoscope,
  Tag,
  Users,
  type LucideIcon,
} from "lucide-react";
import LocalizedLink from "../LocalizedLink";
import type { Messages } from "@/lib/i18n";

export interface CityNavItem {
  slug: string;
  name: string;
  state: string;
  nickname?: string;
  themeColor?: string;
}

type PanelKey = "services" | "industries" | "work" | "cities";

interface NavItem {
  label: string;
  href: string;
  panel?: PanelKey;
  Icon: LucideIcon;
}

interface MegaMenuProps {
  translations: Messages;
  cities: CityNavItem[];
}

const INDUSTRY_ORDER = [
  "manufacturing",
  "real-estate",
  "healthcare",
  "ecommerce",
  "edtech",
] as const;

const INDUSTRY_ICON: Record<(typeof INDUSTRY_ORDER)[number], LucideIcon> = {
  manufacturing: Factory,
  "real-estate": Building2,
  healthcare: Stethoscope,
  ecommerce: ShoppingBag,
  edtech: GraduationCap,
};

const SERVICE_ICON: Record<string, LucideIcon> = {
  "revsite-pro": MonitorSmartphone,
  "autosell-engine": Bot,
  "localdom-seo": Search,
  "globalscale-suite": Globe2,
  "operate-os": Database,
  "growthos-retainer": Handshake,
};

/**
 * Shared by the real nav items and the hidden measuring row — the two have to
 * render identically or the overflow maths is wrong. Only colour and
 * background differ between states, never the box.
 */
const NAV_ITEM_CLASS =
  "group relative shrink-0 items-center gap-1.5 whitespace-nowrap rounded-full px-2.5 py-2 text-[13px] font-medium transition-all duration-200 xl:gap-2 xl:px-3.5 xl:text-sm";

/**
 * The display utility is deliberately kept out of the class above: Tailwind
 * emits `.inline-flex` after `.hidden`, so a base `hidden` appended to a class
 * that already carries `inline-flex` would silently lose.
 */
const NAV_ITEM_SHOWN = `inline-flex ${NAV_ITEM_CLASS}`;

/** Matches `gap-1` on the nav row. */
const NAV_GAP = 4;

/** Never collapse the bar down to nothing but a "More" button. */
const MIN_VISIBLE = 2;

/**
 * How many items the server-rendered markup shows before the client has
 * measured anything. This is what actually fits at every desktop width for
 * the longest locale, so the measuring pass only ever widens it — the bar
 * never has to visibly collapse after hydration.
 */
const SSR_VISIBLE = 4;

export function DesktopMegaNav({ translations: t, cities }: MegaMenuProps) {
  const [active, setActive] = useState<PanelKey | null>(null);
  const [panelBox, setPanelBox] = useState({ top: 120, maxHeight: 640 });
  /** `null` until the first client-side measurement. */
  const [visible, setVisible] = useState<number | null>(null);

  const shellRef = useRef<HTMLDivElement>(null);
  const navRef = useRef<HTMLElement>(null);
  const ghostRef = useRef<HTMLDivElement>(null);
  const moreGhostRef = useRef<HTMLDivElement>(null);
  const closeTimer = useRef<ReturnType<typeof setTimeout> | null>(null);

  /*
   * ORDER IS PRIORITY, NOT TAXONOMY.
   *
   * The bar fits about four items before the rest fall into "More", so this
   * list is really a ranking of what a buyer needs to reach in one click.
   * It used to run Services → Industries → Case Studies → Cities → Pricing,
   * which put PRICING — the single most-requested page on any agency site —
   * behind an overflow menu, while Cities, a directory of eleven SEO landing
   * pages, held a primary slot.
   *
   * Now: Services, Work, Pricing, About. Industries and Blog follow; Cities
   * drops to the end, because the footer already carries the full city
   * directory and every city page is linked from the homepage block. Contact
   * is last on purpose — the header's CTA button is the contact link, and
   * duplicating it here only crowds out something that has no other route.
   */
  const items: NavItem[] = useMemo(
    () => [
      { label: t.nav.services, href: "/services", panel: "services", Icon: Briefcase },
      { label: t.nav.work, href: "/case-studies", panel: "work", Icon: LineChart },
      // `pricing` is absent from every locale file except `en`.
      { label: t.nav.pricing ?? "Pricing", href: "/pricing", Icon: Tag },
      { label: t.nav.about, href: "/about", Icon: Users },
      { label: t.nav.industries, href: "/industries", panel: "industries", Icon: Factory },
      { label: "Blog", href: "/blogs", Icon: BookOpen },
      { label: "Cities", href: "/cities", panel: "cities", Icon: MapPin },
      { label: t.nav.contact, href: "/contact", Icon: Mail },
    ],
    [t]
  );

  /**
   * Fit as many items as the gap between the logo and the action cluster
   * allows; the rest go to the overflow menu. Widths come from a hidden
   * full-size copy of the row, so they never depend on what is currently
   * rendered — no measurement feedback loop — and they follow whatever the
   * active locale's labels happen to be.
   */
  const measure = useCallback(() => {
    const shell = shellRef.current;
    const ghost = ghostRef.current;
    if (!shell || !ghost) return;

    const available = shell.clientWidth;
    if (available <= 0) return; // below `lg` the shell is display:none

    const widths = Array.from(ghost.children).map(
      (el) => (el as HTMLElement).getBoundingClientRect().width
    );
    if (!widths.length) return;

    const totalAll =
      widths.reduce((sum, w) => sum + w, 0) + NAV_GAP * (widths.length - 1);
    if (totalAll <= available) {
      setVisible(widths.length);
      return;
    }

    const moreWidth =
      (moreGhostRef.current?.getBoundingClientRect().width ?? 96) + NAV_GAP;
    const budget = available - moreWidth;
    let used = 0;
    let count = 0;
    for (const w of widths) {
      const next = used + w + (count ? NAV_GAP : 0);
      if (next > budget) break;
      used = next;
      count += 1;
    }
    setVisible(Math.min(widths.length, Math.max(MIN_VISIBLE, count)));
  }, []);

  useEffect(() => {
    let live = true;
    measure();
    const shell = shellRef.current;
    if (!shell) return;
    const ro = new ResizeObserver(() => measure());
    ro.observe(shell);
    // Web fonts land after first paint and change every label's width.
    document.fonts?.ready.then(() => live && measure()).catch(() => {});
    return () => {
      live = false;
      ro.disconnect();
    };
  }, [measure, items]);

  // Keep the panel pinned under the bar, and never let it run past the
  // bottom of the viewport on a short laptop screen.
  useEffect(() => {
    if (!active) return;
    const update = () => {
      if (!navRef.current) return;
      const top = navRef.current.getBoundingClientRect().bottom + 8;
      setPanelBox({
        top,
        maxHeight: Math.max(240, window.innerHeight - top - 16),
      });
    };
    update();
    window.addEventListener("scroll", update, { passive: true });
    window.addEventListener("resize", update);
    return () => {
      window.removeEventListener("scroll", update);
      window.removeEventListener("resize", update);
    };
  }, [active]);

  const open = (panel: PanelKey | undefined) => {
    if (closeTimer.current) clearTimeout(closeTimer.current);
    setActive(panel ?? null);
  };
  const scheduleClose = () => {
    if (closeTimer.current) clearTimeout(closeTimer.current);
    closeTimer.current = setTimeout(() => setActive(null), 140);
  };
  const cancelClose = () => {
    if (closeTimer.current) clearTimeout(closeTimer.current);
  };

  useEffect(() => {
    const onKey = (e: KeyboardEvent) => {
      if (e.key === "Escape") setActive(null);
    };
    window.addEventListener("keydown", onKey);
    return () => window.removeEventListener("keydown", onKey);
  }, []);

  const cut = visible ?? SSR_VISIBLE;
  const shown = items.slice(0, cut);
  const overflow = items.slice(cut);

  return (
    <div
      ref={shellRef}
      className="relative hidden min-w-0 flex-1 justify-center lg:flex"
      onMouseLeave={scheduleClose}
    >
      {/* Hidden measuring copies. `w-max` so they always report natural
          widths, clipped by the wrapper so they can't push the page wide. */}
      <div
        aria-hidden
        className="pointer-events-none invisible absolute inset-0 overflow-hidden"
      >
        <div
          ref={ghostRef}
          className="absolute left-0 top-0 flex w-max items-center"
        >
          {items.map((item) => (
            <span key={item.href} className={NAV_ITEM_SHOWN}>
              <item.Icon size={13} strokeWidth={2} className="shrink-0" />
              <span>{item.label}</span>
            </span>
          ))}
        </div>
        <div
          ref={moreGhostRef}
          className="absolute left-0 top-0 flex w-max items-center"
        >
          <span className={NAV_ITEM_SHOWN}>
            <MoreHorizontal size={13} strokeWidth={2} className="shrink-0" />
            <span>More</span>
            <ChevronDown size={12} className="shrink-0" />
          </span>
        </div>
      </div>

      <nav
        ref={navRef}
        className="flex min-w-0 items-center gap-1"
        onMouseEnter={cancelClose}
      >
        {shown.map((item) => {
          const isActive = !!item.panel && active === item.panel;
          const { Icon } = item;
          return (
            <LocalizedLink
              key={item.href}
              href={item.href}
              className={`${NAV_ITEM_SHOWN} ${
                isActive
                  ? "bg-surface/70 text-foreground"
                  : "text-muted-foreground hover:bg-surface/60 hover:text-foreground"
              }`}
              onMouseEnter={() => open(item.panel)}
              onFocus={() => open(item.panel)}
              aria-haspopup={item.panel ? "true" : undefined}
              aria-expanded={item.panel ? isActive : undefined}
            >
              <Icon
                size={13}
                strokeWidth={2}
                className={`shrink-0 transition-all duration-300 ${
                  isActive
                    ? "text-accent scale-110"
                    : "text-muted-foreground/70 group-hover:text-accent group-hover:scale-110"
                }`}
              />
              <span>{item.label}</span>
              <span
                aria-hidden
                className={`pointer-events-none absolute inset-x-3 -bottom-0.5 h-[2px] origin-center rounded-full bg-gradient-to-r from-transparent via-accent to-transparent transition-transform duration-300 ${
                  isActive ? "scale-x-100" : "scale-x-0 group-hover:scale-x-100"
                }`}
              />
            </LocalizedLink>
          );
        })}

        <OverflowMenu items={overflow} onOpen={() => setActive(null)} />
      </nav>

      <AnimatePresence>
        {active && (
          <motion.div
            key={active}
            initial={{ opacity: 0, y: -6 }}
            animate={{ opacity: 1, y: 0 }}
            exit={{ opacity: 0, y: -4 }}
            transition={{ duration: 0.22, ease: [0.22, 0.9, 0.32, 1] }}
            className="fixed inset-x-0 z-[120] overflow-y-auto overflow-x-hidden overscroll-contain border-y border-border bg-background/95 shadow-[0_28px_72px_-32px_rgba(0,0,0,0.55)] backdrop-blur-xl"
            style={{ top: panelBox.top, maxHeight: panelBox.maxHeight }}
            onMouseEnter={cancelClose}
            onMouseLeave={scheduleClose}
            role="menu"
          >
            <div
              aria-hidden
              className="pointer-events-none absolute inset-x-0 top-0 h-px bg-gradient-to-r from-transparent via-accent/60 to-transparent"
            />
            {active === "services" && <ServicesPanel t={t} />}
            {active === "industries" && <IndustriesPanel t={t} />}
            {active === "work" && <WorkPanel t={t} />}
            {active === "cities" && <CitiesPanel cities={cities} />}
          </motion.div>
        )}
      </AnimatePresence>
    </div>
  );
}

/**
 * Holds whatever didn't fit on the bar.
 *
 * The panel stays mounted and is hidden with CSS rather than unmounted, so
 * every link it holds is in the server-rendered HTML — these are real pages
 * (pricing, about, blog) and the header is their main internal link.
 */
function OverflowMenu({
  items,
  onOpen,
}: {
  items: NavItem[];
  onOpen: () => void;
}) {
  const [open, setOpen] = useState(false);
  const ref = useRef<HTMLDivElement>(null);

  useEffect(() => {
    if (!open) return;
    const onPointer = (e: MouseEvent) => {
      if (!ref.current?.contains(e.target as Node)) setOpen(false);
    };
    const onKey = (e: KeyboardEvent) => {
      if (e.key === "Escape") setOpen(false);
    };
    document.addEventListener("mousedown", onPointer);
    document.addEventListener("keydown", onKey);
    return () => {
      document.removeEventListener("mousedown", onPointer);
      document.removeEventListener("keydown", onKey);
    };
  }, [open]);

  if (!items.length) return null;

  return (
    <div ref={ref} className="relative shrink-0">
      <button
        type="button"
        onClick={() => {
          onOpen();
          setOpen((v) => !v);
        }}
        aria-haspopup="true"
        aria-expanded={open}
        aria-label="More pages"
        className={`${NAV_ITEM_SHOWN} ${
          open
            ? "bg-surface/70 text-foreground"
            : "text-muted-foreground hover:bg-surface/60 hover:text-foreground"
        }`}
      >
        <MoreHorizontal size={13} strokeWidth={2} className="shrink-0" />
        <span>More</span>
        <ChevronDown
          size={12}
          className={`shrink-0 transition-transform ${open ? "rotate-180" : ""}`}
        />
      </button>

      <div
        role="menu"
        aria-hidden={!open}
        className={`absolute end-0 top-full z-[125] mt-2 w-56 origin-top overflow-hidden rounded-2xl border border-border bg-surface/95 p-1.5 shadow-2xl backdrop-blur-xl transition-all duration-200 ease-out ${
          open
            ? "visible translate-y-0 scale-100 opacity-100"
            : "invisible -translate-y-2 scale-[0.98] opacity-0"
        }`}
      >
        {items.map((item) => (
          <LocalizedLink
            key={item.href}
            href={item.href}
            onClick={() => setOpen(false)}
            role="menuitem"
            tabIndex={open ? undefined : -1}
            className="group flex items-center gap-2.5 rounded-xl px-3 py-2.5 text-sm text-muted-foreground transition-colors hover:bg-background/70 hover:text-foreground"
          >
            <item.Icon
              size={15}
              strokeWidth={1.8}
              className="shrink-0 text-muted-foreground/70 transition-colors group-hover:text-accent"
            />
            <span className="min-w-0 flex-1 truncate">{item.label}</span>
            <ArrowUpRight
              size={12}
              className="shrink-0 opacity-0 transition-opacity group-hover:opacity-100"
            />
          </LocalizedLink>
        ))}
      </div>
    </div>
  );
}

/* -------------------------------------------------------------------------- */
/*                                  Panels                                    */
/* -------------------------------------------------------------------------- */

function ServicesPanel({ t }: { t: Messages }) {
  return (
    <PanelShell>
      <ScrollRow>
        {t.services.items.map((s, i) => {
          const Icon = SERVICE_ICON[s.id] ?? Briefcase;
          return (
            <IconTile
              key={s.id}
              href={`/services#${s.id}`}
              label={s.name}
              Icon={Icon}
              index={String(i + 1).padStart(2, "0")}
              delayIndex={i}
            />
          );
        })}
      </ScrollRow>
      <Spotlight
        eyebrow={t.services.eyebrow}
        titleLead="Revenue"
        titleAccent="Systems"
        body={t.services.subtitle}
        cta={{ label: "View All", href: "/services" }}
        WatermarkIcon={Briefcase}
        primaryCta
      />
    </PanelShell>
  );
}

function IndustriesPanel({ t }: { t: Messages }) {
  const ordered = INDUSTRY_ORDER.flatMap((slug) => {
    const item = t.industries.items.find((it) => it.id === slug);
    return item ? [{ slug, item }] : [];
  });

  return (
    <PanelShell>
      <ScrollRow>
        {ordered.map(({ slug, item }, i) => {
          const Icon = INDUSTRY_ICON[slug];
          const isPrimary = slug === "manufacturing";
          return (
            <IconTile
              key={slug}
              href={`/industries/${slug}`}
              label={item.name}
              Icon={Icon}
              badge={isPrimary ? "Pivot" : undefined}
              highlight={isPrimary}
              delayIndex={i}
            />
          );
        })}
      </ScrollRow>
      <Spotlight
        eyebrow="Primary pivot · Ahmedabad"
        titleLead="Manufacturing"
        titleAccent="First"
        body="Tally → cloud ERP in 6 weeks. GST e-invoicing, daily P&L on phone, 80% less manual entry."
        cta={{ label: "Explore More", href: "/industries/manufacturing" }}
        WatermarkIcon={Factory}
      />
    </PanelShell>
  );
}

function WorkPanel({ t }: { t: Messages }) {
  const featured = t.caseStudies.items.slice(0, 8);
  return (
    <PanelShell>
      <ScrollRow>
        {featured.map((c, i) => {
          const headline = c.metrics?.[0];
          return (
            <IconTile
              key={c.id}
              href={`/case-studies#${c.id}`}
              label={c.industry}
              Icon={LineChart}
              caption={headline?.delta}
              delayIndex={i}
            />
          );
        })}
      </ScrollRow>
      <Spotlight
        eyebrow={t.caseStudies.eyebrow}
        titleLead="₹40Cr+"
        titleAccent="Impacted"
        body="Every case measured by one thing — did revenue go up."
        cta={{ label: "Explore More", href: "/case-studies" }}
        WatermarkIcon={LineChart}
        sparkle
      />
    </PanelShell>
  );
}

function CitiesPanel({ cities }: { cities: CityNavItem[] }) {
  return (
    <PanelShell>
      <ScrollRow>
        {cities.map((c, i) => (
          <IconTile
            key={c.slug}
            href={`/cities/${c.slug}`}
            label={c.name}
            Icon={MapPinned}
            accentColor={c.themeColor}
            delayIndex={i}
          />
        ))}
      </ScrollRow>
      <Spotlight
        eyebrow="Local everywhere"
        titleLead="11 Metros"
        titleAccent="One Playbook"
        body="From Mumbai BFSI to Hyderabad pharma — tailored to how each city actually buys."
        cta={{ label: "Explore More", href: "/cities" }}
        WatermarkIcon={MapPin}
      />
    </PanelShell>
  );
}

/* -------------------------------------------------------------------------- */
/*                       Tile + Spotlight building blocks                     */
/* -------------------------------------------------------------------------- */

function PanelShell({ children }: { children: React.ReactNode }) {
  return (
    <div className="container-px mx-auto grid w-full max-w-7xl gap-6 py-6 lg:grid-cols-[minmax(0,1fr)_minmax(0,280px)] lg:gap-8 lg:py-7 xl:grid-cols-[minmax(0,1fr)_minmax(0,340px)] xl:gap-10 xl:py-8">
      {children}
    </div>
  );
}

function ScrollRow({ children }: { children: React.ReactNode }) {
  const scrollRef = useRef<HTMLDivElement>(null);
  const [progress, setProgress] = useState(0);
  const [canLeft, setCanLeft] = useState(false);
  const [canRight, setCanRight] = useState(false);

  const updateState = () => {
    const el = scrollRef.current;
    if (!el) return;
    const max = el.scrollWidth - el.clientWidth;
    setProgress(max > 0 ? el.scrollLeft / max : 0);
    // `pl-2` on the scroller puts the snapped first tile at scrollLeft 8, so
    // the threshold has to clear the padding or the left arrow shows at rest.
    setCanLeft(el.scrollLeft > 12);
    setCanRight(el.scrollLeft < max - 12);
  };

  useEffect(() => {
    const el = scrollRef.current;
    if (!el) return;
    updateState();
    const onWheel = (e: WheelEvent) => {
      if (Math.abs(e.deltaY) <= Math.abs(e.deltaX)) return;
      e.preventDefault();
      el.scrollBy({ left: e.deltaY, behavior: "auto" });
    };
    const onResize = () => updateState();
    el.addEventListener("wheel", onWheel, { passive: false });
    el.addEventListener("scroll", updateState, { passive: true });
    window.addEventListener("resize", onResize);
    return () => {
      el.removeEventListener("wheel", onWheel);
      el.removeEventListener("scroll", updateState);
      window.removeEventListener("resize", onResize);
    };
  }, []);

  const scrollBy = (dx: number) => {
    scrollRef.current?.scrollBy({ left: dx, behavior: "smooth" });
  };

  return (
    <div className="relative flex h-full min-w-0 flex-col">
      <div className="relative flex-1">
        <div
          aria-hidden
          className={`pointer-events-none absolute inset-y-0 left-0 z-10 w-16 bg-gradient-to-r from-background via-background/80 to-transparent transition-opacity duration-300 ${
            canLeft ? "opacity-100" : "opacity-0"
          }`}
        />
        <div
          aria-hidden
          className={`pointer-events-none absolute inset-y-0 right-0 z-10 w-16 bg-gradient-to-l from-background via-background/80 to-transparent transition-opacity duration-300 ${
            canRight ? "opacity-100" : "opacity-0"
          }`}
        />

        <button
          type="button"
          aria-label="Scroll left"
          onClick={() => scrollBy(-320)}
          disabled={!canLeft}
          className={`absolute left-1 top-1/2 z-20 flex h-10 w-10 -translate-y-1/2 items-center justify-center rounded-full border border-border bg-background/95 text-foreground shadow-[0_8px_24px_-12px_rgba(0,0,0,0.4)] backdrop-blur transition-all duration-300 hover:scale-110 hover:border-accent hover:bg-accent-strong hover:text-accent-foreground ${
            canLeft ? "opacity-100" : "pointer-events-none opacity-0"
          }`}
        >
          <ChevronLeft size={18} />
        </button>
        <button
          type="button"
          aria-label="Scroll right"
          onClick={() => scrollBy(320)}
          disabled={!canRight}
          className={`absolute right-1 top-1/2 z-20 flex h-10 w-10 -translate-y-1/2 items-center justify-center rounded-full border border-border bg-background/95 text-foreground shadow-[0_8px_24px_-12px_rgba(0,0,0,0.4)] backdrop-blur transition-all duration-300 hover:scale-110 hover:border-accent hover:bg-accent-strong hover:text-accent-foreground ${
            canRight ? "opacity-100" : "pointer-events-none opacity-0"
          }`}
        >
          <ChevronRight size={18} />
        </button>

        <div
          ref={scrollRef}
          className="flex snap-x snap-mandatory gap-4 overflow-x-auto scroll-smooth py-1 pl-2 pr-2 [-ms-overflow-style:none] [scrollbar-width:none] [&::-webkit-scrollbar]:hidden"
        >
          {children}
        </div>
      </div>

      <div className="mt-4 flex items-center gap-3 px-2">
        <div className="relative h-[3px] flex-1 overflow-hidden rounded-full bg-border/40">
          <motion.div
            className="absolute inset-y-0 left-0 rounded-full bg-gradient-to-r from-accent via-accent to-accent/70"
            animate={{ width: `${Math.max(8, progress * 100)}%` }}
            transition={{ type: "spring", stiffness: 220, damping: 28 }}
          />
        </div>
        <span className="font-mono text-[10px] uppercase tracking-[0.22em] text-muted-foreground">
          Scroll
        </span>
      </div>
    </div>
  );
}

function IconTile({
  href,
  label,
  Icon,
  index,
  badge,
  caption,
  highlight,
  accentColor,
  delayIndex = 0,
}: {
  href: string;
  label: string;
  Icon: LucideIcon;
  index?: string;
  badge?: string;
  caption?: string;
  highlight?: boolean;
  accentColor?: string;
  delayIndex?: number;
}) {
  return (
    <motion.div
      initial={{ opacity: 0, y: 18, scale: 0.95 }}
      animate={{ opacity: 1, y: 0, scale: 1 }}
      transition={{
        delay: 0.05 + delayIndex * 0.045,
        duration: 0.4,
        ease: [0.22, 0.9, 0.32, 1],
      }}
      className="snap-start shrink-0"
    >
      <LocalizedLink
        href={href}
        className="group relative flex w-[122px] flex-col items-center gap-2 text-center xl:w-[148px] xl:gap-2.5"
      >
        <div
          className={`relative flex aspect-square w-full items-center justify-center rounded-2xl border bg-surface/60 transition-all duration-300 group-hover:-translate-y-1 group-hover:border-accent/50 group-hover:bg-surface group-hover:shadow-[0_18px_40px_-16px_rgba(0,0,0,0.4)] ${
            highlight ? "border-accent/40 bg-accent-soft/60" : "border-border/60"
          }`}
        >
          <span
            aria-hidden
            className="pointer-events-none absolute inset-0 rounded-2xl bg-gradient-to-br from-accent/0 via-accent/0 to-accent/0 opacity-0 transition-opacity duration-300 group-hover:from-accent/10 group-hover:to-accent/5 group-hover:opacity-100"
          />
          {index && (
            <span className="absolute left-2.5 top-2 font-mono text-[9px] uppercase tracking-[0.22em] text-muted-foreground/60">
              {index}
            </span>
          )}
          {badge && (
            <span className="absolute right-2 top-2 rounded-full bg-accent-strong px-1.5 py-0.5 font-mono text-[8px] uppercase tracking-[0.2em] text-accent-foreground">
              {badge}
            </span>
          )}
          {accentColor && (
            <span
              aria-hidden
              className="absolute right-2.5 top-2.5 h-1.5 w-1.5 rounded-full"
              style={{ background: accentColor }}
            />
          )}
          <Icon
            size={34}
            strokeWidth={1.4}
            className={`relative transition-all duration-300 group-hover:scale-110 ${
              highlight ? "text-accent" : "text-foreground/80 group-hover:text-accent"
            }`}
          />
          {caption && (
            <span className="absolute bottom-2 right-2 rounded-full bg-background/85 px-1.5 py-0.5 font-mono text-[9px] font-semibold text-accent-strong">
              {caption}
            </span>
          )}
        </div>
        <span className="line-clamp-1 w-full text-[12px] font-medium tracking-tight text-foreground xl:text-[13px]">
          {label}
        </span>
      </LocalizedLink>
    </motion.div>
  );
}

function Spotlight({
  eyebrow,
  titleLead,
  titleAccent,
  body,
  cta,
  WatermarkIcon,
  sparkle,
  primaryCta,
}: {
  eyebrow: string;
  titleLead: string;
  titleAccent: string;
  body: string;
  cta: { label: string; href: string };
  WatermarkIcon: LucideIcon;
  sparkle?: boolean;
  primaryCta?: boolean;
}) {
  return (
    <div className="relative flex h-full flex-col overflow-hidden rounded-2xl border border-border bg-gradient-to-br from-surface/60 via-surface/30 to-background p-5 xl:p-6">
      <WatermarkIcon
        aria-hidden
        size={220}
        strokeWidth={0.6}
        className="pointer-events-none absolute -bottom-12 -right-12 text-accent/10"
      />
      <div className="relative flex items-center gap-1.5 font-mono text-[10px] uppercase tracking-[0.22em] text-accent-strong">
        {sparkle && <Sparkles size={11} />}
        {eyebrow}
      </div>
      <div className="relative mt-3 font-display text-xl font-bold leading-[1.05] tracking-tight xl:text-2xl">
        <span className="text-foreground">{titleLead}</span>{" "}
        <span className="text-accent">{titleAccent}</span>
      </div>
      <p className="relative mt-3 text-xs leading-relaxed text-muted-foreground">
        {body}
      </p>
      <LocalizedLink
        href={cta.href}
        className={`group relative mt-auto inline-flex w-fit items-center gap-2 rounded-full px-4 py-2 text-xs font-semibold transition-all hover:-translate-y-0.5 ${
          primaryCta
            ? "bg-accent-strong text-accent-foreground shadow-[0_8px_24px_-12px_oklch(0.78_0.165_70/0.6)] hover:shadow-[0_12px_28px_-10px_oklch(0.78_0.165_70/0.75)]"
            : "border border-accent/40 bg-background/40 text-foreground hover:border-accent hover:bg-accent-soft"
        }`}
      >
        {cta.label}
        <ArrowRight
          size={13}
          className="transition-transform group-hover:translate-x-0.5"
        />
      </LocalizedLink>
    </div>
  );
}

/* -------------------------------------------------------------------------- */
/*                          Mobile expansion variant                          */
/* -------------------------------------------------------------------------- */

export function MobileMegaNav({
  translations: t,
  cities,
  onNavigate,
}: MegaMenuProps & { onNavigate: () => void }) {
  const [open, setOpen] = useState<PanelKey | null>(null);

  const toggle = (panel: PanelKey) =>
    setOpen((cur) => (cur === panel ? null : panel));

  return (
    <div className="flex flex-col gap-1">
      {/* Same priority order as the desktop bar — see the NavItem list. */}
      <MobileLinkRow
        label={t.nav.services}
        index="01"
        panel="services"
        active={open === "services"}
        onToggle={() => toggle("services")}
        href="/services"
        onNavigate={onNavigate}
      >
        {t.services.items.map((s) => (
          <MobileSubLink
            key={s.id}
            href={`/services#${s.id}`}
            primary={s.name}
            secondary={s.kicker}
            onNavigate={onNavigate}
          />
        ))}
      </MobileLinkRow>

      <MobileLinkRow
        label={t.nav.work}
        index="02"
        panel="work"
        active={open === "work"}
        onToggle={() => toggle("work")}
        href="/case-studies"
        onNavigate={onNavigate}
      >
        {t.caseStudies.items.slice(0, 4).map((c) => (
          <MobileSubLink
            key={c.id}
            href={`/case-studies#${c.id}`}
            primary={c.industry}
            secondary={c.location}
            onNavigate={onNavigate}
          />
        ))}
      </MobileLinkRow>

      <MobileFlatRow
        label={t.nav.pricing ?? "Pricing"}
        index="03"
        href="/pricing"
        onNavigate={onNavigate}
      />

      <MobileFlatRow
        label={t.nav.about}
        index="04"
        href="/about"
        onNavigate={onNavigate}
      />

      <MobileLinkRow
        label={t.nav.industries}
        index="05"
        panel="industries"
        active={open === "industries"}
        onToggle={() => toggle("industries")}
        href="/industries"
        onNavigate={onNavigate}
      >
        {INDUSTRY_ORDER.flatMap((slug) => {
          const item = t.industries.items.find((it) => it.id === slug);
          if (!item) return [];
          return [
            <MobileSubLink
              key={slug}
              href={`/industries/${slug}`}
              primary={item.name}
              secondary={item.tag}
              onNavigate={onNavigate}
            />,
          ];
        })}
      </MobileLinkRow>

      <MobileFlatRow
        label="Blog"
        index="06"
        href="/blogs"
        onNavigate={onNavigate}
      />

      <MobileLinkRow
        label="Cities"
        index="07"
        panel="cities"
        active={open === "cities"}
        onToggle={() => toggle("cities")}
        href="/cities"
        onNavigate={onNavigate}
      >
        {cities.map((c) => (
          <MobileSubLink
            key={c.slug}
            href={`/cities/${c.slug}`}
            primary={c.name}
            secondary={c.nickname ?? c.state}
            color={c.themeColor}
            onNavigate={onNavigate}
          />
        ))}
      </MobileLinkRow>

      <MobileFlatRow
        label={t.nav.contact}
        index="08"
        href="/contact"
        onNavigate={onNavigate}
      />
    </div>
  );
}

function MobileLinkRow({
  label,
  index,
  active,
  onToggle,
  href,
  children,
  onNavigate,
}: {
  label: string;
  index: string;
  panel: PanelKey;
  active: boolean;
  onToggle: () => void;
  href: string;
  children: React.ReactNode;
  onNavigate: () => void;
}) {
  return (
    <div className="rounded-2xl border border-border bg-surface/40">
      <div className="flex items-center justify-between gap-2 px-5 py-4">
        <LocalizedLink
          href={href}
          onClick={onNavigate}
          className="min-w-0 flex-1 truncate text-xl font-semibold tracking-tight text-foreground sm:text-2xl"
        >
          {label}
        </LocalizedLink>
        <button
          type="button"
          onClick={onToggle}
          aria-label={`${active ? "Hide" : "Show"} ${label} sub-menu`}
          aria-expanded={active}
          className={`flex h-9 w-9 items-center justify-center rounded-full border border-border bg-background font-mono text-xs transition-all ${
            active ? "bg-accent-strong text-accent-foreground" : "text-muted-foreground"
          }`}
        >
          {active ? "–" : "+"}
        </button>
      </div>
      <AnimatePresence initial={false}>
        {active && (
          <motion.div
            initial={{ opacity: 0, height: 0 }}
            animate={{ opacity: 1, height: "auto" }}
            exit={{ opacity: 0, height: 0 }}
            transition={{ duration: 0.2 }}
            className="overflow-hidden border-t border-border/60"
          >
            <div className="grid gap-1 p-3">
              <div className="px-3 pb-2 font-mono text-[9px] uppercase tracking-[0.22em] text-muted-foreground">
                §{index}
              </div>
              {children}
            </div>
          </motion.div>
        )}
      </AnimatePresence>
    </div>
  );
}

function MobileFlatRow({
  label,
  index,
  href,
  onNavigate,
}: {
  label: string;
  index: string;
  href: string;
  onNavigate: () => void;
}) {
  return (
    <LocalizedLink
      href={href}
      onClick={onNavigate}
      className="flex items-center justify-between gap-3 rounded-2xl border border-border bg-surface/40 px-5 py-4"
    >
      <span className="min-w-0 flex-1 truncate text-xl font-semibold tracking-tight text-foreground sm:text-2xl">
        {label}
      </span>
      <span className="shrink-0 font-mono text-xs text-muted-foreground">{index}</span>
    </LocalizedLink>
  );
}

function MobileSubLink({
  href,
  primary,
  secondary,
  color,
  onNavigate,
}: {
  href: string;
  primary: string;
  secondary?: string;
  color?: string;
  onNavigate: () => void;
}) {
  return (
    <LocalizedLink
      href={href}
      onClick={onNavigate}
      className="group flex items-center justify-between rounded-xl border border-transparent bg-background/60 px-3 py-2.5 transition-colors hover:border-accent/30"
    >
      <span className="flex items-center gap-2 min-w-0">
        {color && (
          <span
            aria-hidden
            className="h-2 w-2 shrink-0 rounded-full"
            style={{ background: color }}
          />
        )}
        <span className="min-w-0">
          <span className="block truncate text-sm font-semibold text-foreground">
            {primary}
          </span>
          {secondary && (
            <span className="mt-0.5 block truncate text-[11px] text-muted-foreground">
              {secondary}
            </span>
          )}
        </span>
      </span>
      <ArrowUpRight
        size={12}
        className="text-muted-foreground transition-transform group-hover:-translate-y-0.5 group-hover:translate-x-0.5"
      />
    </LocalizedLink>
  );
}
