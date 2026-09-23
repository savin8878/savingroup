"use client";

import { useParams } from "next/navigation";
import { ArrowUpRight, Github, Instagram, Linkedin, Mail, MessageCircle, Phone, Twitter, Youtube } from "lucide-react";
import LocalizedLink from "../LocalizedLink";
import Logo from "../Logo/logo";
import type { Locale, Messages } from "@/lib/i18n";
import { BRAND, SOCIAL_PROFILES } from "@/lib/constants";
import { AUDIT, CTA_LABEL } from "@/lib/offer";
import { FOOTER_COPY } from "./footer-copy";
import styles from "./Footer.module.css";

interface FooterProps { translations: Messages; }

const SOCIAL_ICONS = {
  linkedin: { Icon: Linkedin, label: "LinkedIn" },
  x: { Icon: Twitter, label: "X" },
  github: { Icon: Github, label: "GitHub" },
  instagram: { Icon: Instagram, label: "Instagram" },
  youtube: { Icon: Youtube, label: "YouTube" },
} as const;

// A short route index keeps the city pages discoverable without shipping the
// complete city-content database in this site-wide client component.
const FEATURED_CITIES = [
  { slug: "mumbai", name: "Mumbai", hi: "मुंबई" },
  { slug: "delhi", name: "Delhi NCR", hi: "दिल्ली NCR" },
  { slug: "bengaluru", name: "Bengaluru", hi: "बेंगलुरु" },
  { slug: "pune", name: "Pune", hi: "पुणे" },
  { slug: "ahmedabad", name: "Ahmedabad", hi: "अहमदाबाद" },
] as const;

export default function Footer({ translations: t }: FooterProps) {
  const params = useParams();
  const requestedLocale = typeof params?.locale === "string" ? params.locale : "en";
  const locale = requestedLocale in FOOTER_COPY ? requestedLocale as Locale : "en";
  const copy = FOOTER_COPY[locale];
  const year = new Date().getFullYear();
  const email = t.contact.details.email;
  const phone = t.contact.details.phone;
  const phoneDigits = phone.replace(/\D/g, "");
  const companyLinks = t.footer.columns.company.links.filter((link) => link.href !== "/privacy" && link.href !== "/terms");
  const policyLabel = (href: string, fallback: string) => t.footer.columns.company.links.find((link) => link.href === href)?.label ?? fallback;
  const columns = [
    t.footer.columns.services,
    t.footer.columns.industries,
    { ...t.footer.columns.company, links: [...companyLinks, { label: copy.journal, href: "/blogs" }] },
  ];

  return <footer className={styles.footer}>
    <div className={styles.inner}>
      <div className={styles.auditStrip}>
        <div className={styles.auditIntro}><span className={styles.sectionNumber} aria-hidden="true">↗</span><div><p>{copy.start}</p><span>{copy.auditNote.replace("{minutes}", String(AUDIT.minutes))}</span></div></div>
        <LocalizedLink href="/contact" className={styles.auditLink}>{locale === "en" ? CTA_LABEL : copy.audit}<ArrowUpRight size={18} aria-hidden="true" /></LocalizedLink>
      </div>

      <div className={styles.main}>
        <div className={styles.brand}>
          <LocalizedLink href="/" className={styles.brandLink} aria-label={`${BRAND.name} — ${t.nav.home}`}><Logo size="lg" className={styles.logo} /></LocalizedLink>
          <p className={styles.mission}>{copy.mission}</p>
          <div className={styles.brandCircuit} aria-hidden="true"><svg viewBox="0 0 240 32" fill="none"><path d="M6 16H55L69 4H108L125 28H159L174 16H233" /><circle cx="6" cy="16" r="3" /><circle cx="108" cy="4" r="3" /><circle cx="174" cy="16" r="3" /><circle cx="233" cy="16" r="3" /></svg></div>
          <address className={styles.contact}>
            <a href={`mailto:${email}`} className={styles.email}><Mail size={15} aria-hidden="true" /><span dir="ltr">{email}</span><ArrowUpRight size={13} aria-hidden="true" /></a>
            <div className={styles.phoneRow}><a href={`tel:+${phoneDigits}`} aria-label={`${copy.call}: ${phone}`}><Phone size={13} aria-hidden="true" /><span dir="ltr">{phone}</span></a><a href={`https://wa.me/${phoneDigits}`} aria-label={`${t.contact.details.phoneLabel}: ${phone}`}><MessageCircle size={14} aria-hidden="true" /><span>{t.contact.details.phoneLabel}</span><ArrowUpRight size={11} aria-hidden="true" /></a></div>
          </address>
          {SOCIAL_PROFILES.length > 0 && <div className={styles.socials}>{SOCIAL_PROFILES.map(({ platform, url }) => { const { Icon, label } = SOCIAL_ICONS[platform]; return <a key={platform} href={url} target="_blank" rel="noopener noreferrer" aria-label={label}><Icon size={17} aria-hidden="true" /></a>; })}</div>}
        </div>

        {columns.map((column, index) => <nav className={styles.column} aria-label={column.title} key={column.title}><h2><span className={styles.columnNumber} aria-hidden="true">0{index + 1}</span>{column.title}</h2><ul>{column.links.map((link) => <li key={link.href}><LocalizedLink href={link.href}>{link.label}<ArrowUpRight size={12} aria-hidden="true" /></LocalizedLink></li>)}</ul></nav>)}
      </div>

      <nav className={styles.cityRow} aria-label={copy.cities}><span className={styles.cityLabel}>{copy.cities}</span><ul>{FEATURED_CITIES.map((city) => <li key={city.slug}><LocalizedLink href={`/cities/${city.slug}`}>{locale === "hi" ? city.hi : city.name}</LocalizedLink></li>)}</ul><LocalizedLink href="/cities" className={styles.allCities}>{copy.allCities}<ArrowUpRight size={13} aria-hidden="true" /></LocalizedLink></nav>

      <div className={styles.bottom}>
        <p><span>© {year} {BRAND.name}</span><span className={styles.domain} dir="ltr">{BRAND.domain}</span><span>{t.footer.rights}</span></p>
        <nav aria-label={copy.legal} className={styles.policies}><LocalizedLink href="/privacy">{policyLabel("/privacy", copy.privacy)}</LocalizedLink><LocalizedLink href="/terms">{policyLabel("/terms", copy.terms)}</LocalizedLink></nav>
      </div>
    </div>
  </footer>;
}
