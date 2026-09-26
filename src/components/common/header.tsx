"use client";

import { useEffect, useRef, useState, type KeyboardEvent } from "react";
import { usePathname } from "next/navigation";
import { ArrowUpRight, Menu, X } from "lucide-react";
import LocalizedLink from "../LocalizedLink";
import Logo from "../Logo/logo";
import LanguageSwitcher from "./LanguageSwitcher";
import { ThemeToggle } from "./ThemeToggle";
import { DesktopNavigation, MobileNavigation } from "./SiteNavigation";
import type { CityNavItem } from "./MegaMenu";
import type { Messages, Locale } from "@/lib/i18n";
import { navigationCopy } from "./navigation-copy";
import styles from "./Header.module.css";

interface HeaderProps { translations: Messages; locale: Locale; country: string; cities: CityNavItem[] }
const DESKTOP_QUERY = "(min-width: 1100px)";

export default function Header({ translations: t, locale, country, cities }: HeaderProps) {
  const [open,setOpen]=useState(false);
  const [scrolled,setScrolled]=useState(false);
  const dialog=useRef<HTMLDialogElement>(null);
  const trigger=useRef<HTMLButtonElement>(null);
  const pathname=usePathname();
  const c=navigationCopy[locale];

  useEffect(()=>{
    const sync=()=>setScrolled(window.scrollY>24);
    sync();window.addEventListener("scroll",sync,{passive:true});
    return()=>window.removeEventListener("scroll",sync);
  },[]);
  useEffect(()=>{setOpen(false);},[pathname]);
  useEffect(()=>{
    if(!open)return;
    const element=dialog.current;
    if(!element)return;
    const media=matchMedia(DESKTOP_QUERY);
    if(media.matches){setOpen(false);return;}
    const resize=()=>{if(media.matches)setOpen(false);};
    media.addEventListener("change",resize);
    const previousOverflow=document.body.style.overflow;
    const previousPadding=document.body.style.paddingRight;
    const scrollbar=innerWidth-document.documentElement.clientWidth;
    element.showModal();
    document.body.style.overflow="hidden";
    if(scrollbar>0)document.body.style.paddingRight=`${scrollbar}px`;
    return()=>{
      media.removeEventListener("change",resize);
      element.close();
      document.body.style.overflow=previousOverflow;
      document.body.style.paddingRight=previousPadding;
      if(trigger.current?.getClientRects().length)trigger.current.focus({preventScroll:true});
    };
  },[open]);

  function containFocus(event: KeyboardEvent<HTMLDialogElement>) {
    if(event.key!=="Tab")return;
    const controls=Array.from(event.currentTarget.querySelectorAll<HTMLElement>('a[href],button:not(:disabled),[tabindex="0"]')).filter(node=>node.getClientRects().length>0);
    const first=controls[0],last=controls[controls.length-1];
    if(event.shiftKey&&document.activeElement===first){event.preventDefault();last?.focus();}
    else if(!event.shiftKey&&document.activeElement===last){event.preventDefault();first?.focus();}
  }

  return <div className={styles.root} data-site-header>
    <div className={styles.utilityBar}><div className={styles.container}><span><i aria-hidden="true"/>{c.tagline}</span><span>{c.global}<ArrowUpRight size={10} aria-hidden="true"/></span></div></div>
    <header className={styles.header} data-scrolled={scrolled}>
      <div className={`${styles.container} ${styles.bar}`}>
        <LocalizedLink href="/" className={styles.logoLink} aria-label={`${t.brand.name} — ${t.nav.home}`}><Logo size="md"/></LocalizedLink>
        <DesktopNavigation translations={t} cities={cities} locale={locale}/>
        <div className={styles.actions}>
          {!open&&<ThemeToggle className={styles.iconButton}/>}
          <div className={styles.desktopLanguage}><LanguageSwitcher locale={locale} country={country}/></div>
          <LocalizedLink href="/contact" className={styles.cta} aria-label={t.nav.cta}><span>{t.nav.cta}</span><ArrowUpRight size={16} aria-hidden="true"/></LocalizedLink>
          <button ref={trigger} type="button" className={`${styles.iconButton} ${styles.menuButton}`} aria-label={c.open} aria-expanded={open} aria-controls="mobile-nav" aria-haspopup="dialog" onClick={()=>setOpen(true)}><Menu size={21} strokeWidth={1.4} aria-hidden="true"/></button>
        </div>
      </div>
    </header>
    {open&&<dialog ref={dialog} id="mobile-nav" className={styles.mobileDialog} aria-label={c.navigation} onCancel={event=>{event.preventDefault();setOpen(false);}} onClick={event=>{if(event.target===event.currentTarget)setOpen(false);}} onKeyDown={containFocus}>
      <div className={styles.drawer}>
        <div className={styles.drawerHead}><LocalizedLink href="/" onClick={()=>setOpen(false)} aria-label={`${t.brand.name} — ${t.nav.home}`}><Logo size="md"/></LocalizedLink><button type="button" className={styles.iconButton} aria-label={c.close} autoFocus onClick={()=>setOpen(false)}><X size={21} strokeWidth={1.4} aria-hidden="true"/></button></div>
        <div className={styles.drawerBody}><MobileNavigation translations={t} cities={cities} locale={locale} onNavigate={()=>setOpen(false)}/></div>
        <div className={styles.drawerFoot}><LocalizedLink href="/contact" onClick={()=>setOpen(false)} className={styles.cta}><span>{t.nav.cta}</span><ArrowUpRight size={17} aria-hidden="true"/></LocalizedLink><div className={styles.drawerPreferences}><span>{c.theme}</span><ThemeToggle className={styles.iconButton}/><LanguageSwitcher locale={locale} country={country} placement="above"/></div></div>
      </div>
    </dialog>}
    <noscript><nav className={styles.noScript} aria-label={c.navigation}>{[["/services",t.nav.services],["/case-studies",t.nav.work],["/pricing",c.pricing],["/about",t.nav.about],["/industries",t.nav.industries],["/blogs",c.insights],["/newsroom",c.newsroom],["/cities",c.cities],["/contact",t.nav.contact]].map(([href,label])=><LocalizedLink href={href} key={href}>{label}</LocalizedLink>)}</nav></noscript>
  </div>;
}
