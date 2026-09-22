"use client";

import { useEffect, useRef, useState } from "react";
import { usePathname } from "next/navigation";
import { Check, Globe, ChevronDown } from "lucide-react";
import { LOCALES, LOCALE_CODES, type Locale } from "@/lib/i18n";
import { RESOLVABLE_COUNTRIES } from "@/lib/constants";
import { countryNamesByISO } from "@/lib/country";

interface LanguageSwitcherProps {
  locale: Locale;
  country: string;
  variant?: "compact" | "full";
}

/** Regional-indicator flag emoji from an ISO 3166-1 alpha-2 code. */
function flagOf(code: string): string {
  return code
    .toUpperCase()
    .replace(/./g, (c) => String.fromCodePoint(127397 + c.charCodeAt(0)));
}

export default function LanguageSwitcher({
  locale,
  country,
  variant = "compact",
}: LanguageSwitcherProps) {
  const [open, setOpen] = useState(false);
  const ref = useRef<HTMLDivElement>(null);
  const pathname = usePathname();

  // Close on outside click
  useEffect(() => {
    function onClick(e: MouseEvent) {
      if (!ref.current?.contains(e.target as Node)) setOpen(false);
    }
    document.addEventListener("mousedown", onClick);
    return () => document.removeEventListener("mousedown", onClick);
  }, []);

  // Close on Escape
  useEffect(() => {
    function onKey(e: KeyboardEvent) {
      if (e.key === "Escape") setOpen(false);
    }
    document.addEventListener("keydown", onKey);
    return () => document.removeEventListener("keydown", onKey);
  }, []);

  const current = LOCALES[locale];
  const currentCountry = country.toLowerCase();

  const segments = (pathname || `/${country}/${locale}`).split("/").filter(Boolean);

  /** Swap the locale segment, preserving country and the rest of the path. */
  function localeHref(target: Locale): string {
    if (segments.length >= 2) {
      const next = [...segments];
      next[1] = target;
      return "/" + next.join("/");
    }
    return `/${currentCountry}/${target}`;
  }

  /** Swap the country segment, preserving locale and the rest of the path. */
  function countryHref(target: string): string {
    if (segments.length >= 2) {
      const next = [...segments];
      next[0] = target;
      return "/" + next.join("/");
    }
    return `/${target}/${locale}`;
  }

  return (
    <div ref={ref} className="relative">
      <button
        type="button"
        onClick={() => setOpen((v) => !v)}
        className={`group inline-flex items-center gap-2 rounded-full border border-border bg-surface/60 backdrop-blur-sm transition-all hover:border-border-strong hover:bg-surface ${
          variant === "compact" ? "h-9 px-3" : "h-11 px-4"
        }`}
        aria-label="Change language or region"
        aria-expanded={open}
      >
        <Globe size={14} className="text-accent" />
        <span className="font-mono text-[10px] uppercase tracking-[0.22em] text-muted-foreground group-hover:text-foreground">
          {current.code}-{currentCountry.toUpperCase()}
        </span>
        <span className="text-xs text-foreground">{flagOf(currentCountry)}</span>
        <ChevronDown
          size={12}
          className={`text-muted-foreground transition-transform ${open ? "rotate-180" : ""}`}
        />
      </button>

      {/*
        The panel is ALWAYS mounted and hidden with CSS rather than being
        conditionally rendered. Every country × locale combination is
        indexable (constants.ts), but nothing else on the site links across
        those axes — so if these anchors only existed after a click, the 95
        non-current trees would have zero internal links and would be
        discoverable only via the sitemap. Crawlers read `href`s from the
        served HTML; they do not click. Keep this mounted.
      */}
      <div
        className={`absolute right-0 top-full z-[110] mt-2 max-h-[70vh] w-72 overflow-y-auto rounded-2xl border border-border bg-surface/95 shadow-2xl backdrop-blur-xl transition-all duration-200 ${
          open
            ? "visible translate-y-0 opacity-100"
            : "invisible -translate-y-2 opacity-0"
        }`}
        role="listbox"
        aria-hidden={!open}
      >
        <div className="border-b border-border bg-background/40 px-4 py-3">
          <div className="flex items-center gap-2 font-mono text-[10px] uppercase tracking-[0.22em] text-accent">
            <Globe size={11} />
            Language
          </div>
          <div className="mt-1 text-xs text-muted-foreground">
            {LOCALE_CODES.length} languages
          </div>
        </div>

        <ul className="py-2">
          {LOCALE_CODES.map((code) => {
            const item = LOCALES[code];
            const active = code === locale;
            return (
              <li key={code}>
                <a
                  href={localeHref(code)}
                  className={`flex items-center gap-3 px-4 py-2.5 text-sm transition-colors ${
                    active
                      ? "bg-accent/10 text-foreground"
                      : "text-muted-foreground hover:bg-surface-2 hover:text-foreground"
                  }`}
                  role="option"
                  aria-selected={active}
                  lang={item.htmlLang}
                  dir={item.dir}
                  tabIndex={open ? 0 : -1}
                >
                  <span className="text-base">{item.flag}</span>
                  <span className="flex-1">
                    <span className="font-semibold text-foreground">
                      {item.nativeName}
                    </span>
                    <span className="ml-2 font-mono text-[10px] uppercase tracking-[0.18em] text-muted-foreground">
                      {item.code}
                    </span>
                  </span>
                  {active && <Check size={14} className="text-accent" />}
                </a>
              </li>
            );
          })}
        </ul>

        <div className="border-y border-border bg-background/40 px-4 py-3">
          <div className="flex items-center gap-2 font-mono text-[10px] uppercase tracking-[0.22em] text-accent">
            <Globe size={11} />
            Region
          </div>
          <div className="mt-1 text-xs text-muted-foreground">
            {RESOLVABLE_COUNTRIES.length} markets
          </div>
        </div>

        <ul className="py-2">
          {RESOLVABLE_COUNTRIES.map((code) => {
            const active = code === currentCountry;
            return (
              <li key={code}>
                <a
                  href={countryHref(code)}
                  className={`flex items-center gap-3 px-4 py-2.5 text-sm transition-colors ${
                    active
                      ? "bg-accent/10 text-foreground"
                      : "text-muted-foreground hover:bg-surface-2 hover:text-foreground"
                  }`}
                  role="option"
                  aria-selected={active}
                  tabIndex={open ? 0 : -1}
                >
                  <span className="text-base">{flagOf(code)}</span>
                  <span className="flex-1">
                    <span className="font-semibold text-foreground">
                      {countryNamesByISO[code as keyof typeof countryNamesByISO] ??
                        code.toUpperCase()}
                    </span>
                    <span className="ml-2 font-mono text-[10px] uppercase tracking-[0.18em] text-muted-foreground">
                      {code}
                    </span>
                  </span>
                  {active && <Check size={14} className="text-accent" />}
                </a>
              </li>
            );
          })}
        </ul>
      </div>
    </div>
  );
}
