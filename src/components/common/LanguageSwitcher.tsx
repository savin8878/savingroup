"use client";

import { useEffect, useId, useRef, useState, type KeyboardEvent } from "react";
import { usePathname } from "next/navigation";
import { Check, ChevronDown, Globe2 } from "lucide-react";
import { LOCALES, LOCALE_CODES, type Locale } from "@/lib/i18n";
import { RESOLVABLE_COUNTRIES } from "@/lib/constants";
import { countryNamesByISO } from "@/lib/country";
import styles from "./LanguageSwitcher.module.css";

interface LanguageSwitcherProps {
  locale: Locale;
  country: string;
  variant?: "compact" | "full";
}

const labels: Record<Locale, { change: string; language: string; region: string }> = {
  en: { change: "Change language or region", language: "Language", region: "Region" },
  es: { change: "Cambiar idioma o región", language: "Idioma", region: "Región" },
  fr: { change: "Changer de langue ou de région", language: "Langue", region: "Région" },
  de: { change: "Sprache oder Region ändern", language: "Sprache", region: "Region" },
  ar: { change: "تغيير اللغة أو المنطقة", language: "اللغة", region: "المنطقة" },
  hi: { change: "भाषा या क्षेत्र बदलें", language: "भाषा", region: "क्षेत्र" },
  gu: { change: "ભાષા અથવા વિસ્તાર બદલો", language: "ભાષા", region: "વિસ્તાર" },
  zh: { change: "更改语言或地区", language: "语言", region: "地区" },
};

export default function LanguageSwitcher({ locale, country, variant = "compact" }: LanguageSwitcherProps) {
  const [open, setOpen] = useState(false);
  const root = useRef<HTMLDivElement>(null);
  const trigger = useRef<HTMLButtonElement>(null);
  const panel = useRef<HTMLDivElement>(null);
  const focusFirst = useRef(false);
  const panelId = useId();
  const pathname = usePathname();
  const copy = labels[locale];
  const currentCountry = country.toLowerCase();
  const segments = (pathname || "/" + currentCountry + "/" + locale).split("/").filter(Boolean);

  useEffect(() => {
    const closeOutside = (event: PointerEvent) => {
      if (!root.current?.contains(event.target as Node)) setOpen(false);
    };
    document.addEventListener("pointerdown", closeOutside);
    return () => document.removeEventListener("pointerdown", closeOutside);
  }, []);

  useEffect(() => { setOpen(false); }, [pathname]);
  useEffect(() => {
    if (open && focusFirst.current) {
      panel.current?.querySelector<HTMLAnchorElement>("a")?.focus();
      focusFirst.current = false;
    }
  }, [open]);

  function destination(index: 0 | 1, value: string) {
    const next = segments.length >= 2 ? [...segments] : [currentCountry, locale];
    next[index] = value;
    return "/" + next.join("/");
  }

  function onKeyDown(event: KeyboardEvent<HTMLDivElement>) {
    if (event.key === "Escape" && open) {
      event.preventDefault();
      event.stopPropagation();
      setOpen(false);
      trigger.current?.focus();
    }
    if (event.key === "ArrowDown" && event.target === trigger.current) {
      event.preventDefault();
      if (open) panel.current?.querySelector<HTMLAnchorElement>("a")?.focus();
      else { focusFirst.current = true; setOpen(true); }
    }
  }

  return (
    <div className={styles.root} ref={root} onKeyDown={onKeyDown} onBlur={(event) => {
      if (event.relatedTarget && !event.currentTarget.contains(event.relatedTarget as Node)) setOpen(false);
    }}>
      <button ref={trigger} type="button" onClick={() => setOpen((value) => !value)} className={styles.trigger + (variant === "full" ? " " + styles.full : "")} aria-label={copy.change} aria-expanded={open} aria-controls={panelId}>
        <Globe2 size={15} strokeWidth={1.5} aria-hidden="true" />
        <span dir="ltr">{locale.toUpperCase()} <span className={styles.divider}>/</span> {currentCountry.toUpperCase()}</span>
        <ChevronDown size={11} className={open ? styles.rotated : ""} aria-hidden="true" />
      </button>
      {/* Keep every region/locale URL in server HTML for crawlable navigation. */}
      <div className={styles.panel} id={panelId} ref={panel} hidden={!open}>
        <nav aria-label={copy.language}>
          <h2>{copy.language}<span>{LOCALE_CODES.length.toString().padStart(2, "0")}</span></h2>
          <ul>{LOCALE_CODES.map((code) => {
            const item = LOCALES[code];
            return <li key={code}><a href={destination(1, code)} lang={item.htmlLang} dir={item.dir} aria-current={code === locale ? "true" : undefined}>
              <span>{item.nativeName}</span>{code === locale ? <Check size={13} aria-hidden="true" /> : <small>{code.toUpperCase()}</small>}
            </a></li>;
          })}</ul>
        </nav>
        <nav aria-label={copy.region}>
          <h2>{copy.region}<span>{RESOLVABLE_COUNTRIES.length.toString().padStart(2, "0")}</span></h2>
          <ul>{RESOLVABLE_COUNTRIES.map((code) => <li key={code}><a href={destination(0, code)} aria-current={code === currentCountry ? "true" : undefined}>
            <span>{countryNamesByISO[code as keyof typeof countryNamesByISO] ?? code.toUpperCase()}</span>{code === currentCountry ? <Check size={13} aria-hidden="true" /> : <small>{code.toUpperCase()}</small>}
          </a></li>)}</ul>
        </nav>
      </div>
    </div>
  );
}
