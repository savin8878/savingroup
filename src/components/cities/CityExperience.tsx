import Link from "next/link";
import { ArrowDown, ArrowRight, ArrowUpRight, Building2, CircleDot, MapPin, Plus } from "lucide-react";
import { INDIA_CITIES, type CityContent } from "@/lib/cities";
import type { CityIdentity } from "@/lib/city-identity";
import type { CityOrganization } from "@/lib/city-organization";
import type { CityExtras } from "@/lib/city-extras";
import type { Messages } from "@/lib/i18n";
import { CityMotion, ProcurementTrigger } from "./CityMotion";
import { CityBlueprint } from "./CityBlueprint";
import { CitySystems } from "./CitySystems";
import { getCityCopy } from "./city-copy";
import home from "../home/IndustrialHome.module.css";
import styles from "./Cities.module.css";

function Chapter({ number, children }: { number: string; children: React.ReactNode }) { return <div className={home.chapter}><span>{number}</span><span>{children}</span></div>; }
function Heading({ lines, id }: { lines: string[]; id?: string }) { return <h2 id={id}>{lines[0]}<br/><em>{lines[1]}</em></h2>; }
const pageSlugs = ["", "services", "process", "case-studies", "about", "blog", "contact"];

export function CityExperience({ city, identity, org, extras, t, country, locale }: { city: CityContent; identity?: CityIdentity; org?: CityOrganization; extras?: CityExtras; t: Messages; country: string; locale: string }) {
  const c = getCityCopy(locale);
  const base = `/${country}/${locale}`;
  const cityBase = `${base}/cities/${city.slug}`;
  const related = city.relatedCities.map(slug => INDIA_CITIES.find(item => item.slug === slug)).filter((item): item is CityContent => Boolean(item));
  const contentLang = locale === "hi" && city.translations?.hi ? "hi" : "en";
  return <CityMotion labels={{pause:c.pause,resume:c.resume,reduced:c.reduced}}><div lang={locale === "hi" ? "hi" : "en"} dir="ltr">
    <section className={styles.hero} aria-labelledby="city-title"><div className={home.container}>
      <div className={styles.eyebrow}><span className={home.signal}/><span>{t.brand.name} / {city.name}, {city.state}</span><span>{c.eyebrow}</span></div>
      <div className={styles.heroGrid}><div className={styles.heroCopy}>
        <div className={styles.location}><MapPin size={13} aria-hidden="true"/>{city.name} / IN-{city.stateCode}</div>
        <h1 id="city-title">{locale === "hi" ? <>{city.nameHindi}<br/><span>{c.heroStart}।</span></> : <>{c.heroStart}<br/><span>{city.name}.</span></>}</h1><p className={styles.heroStatement}>{c.heroEnd}</p><p className={styles.heroIntro}>{c.intro}</p>
        <div className={styles.heroActions}><Link href={`${cityBase}/contact`} className={home.primaryButton}>{c.contact}<ArrowUpRight size={16} aria-hidden="true"/></Link><a href="#connected-business" className={home.textButton}>{c.explore}<ArrowDown size={15} aria-hidden="true"/></a></div>
      </div><CityBlueprint city={city} copy={c} nickname={identity?.nickname}/></div>
      <nav className={styles.cityNav} aria-label={`${city.name} ${c.nav[0]}`}><span><MapPin size={12} aria-hidden="true"/>{city.name}</span>{pageSlugs.map((slug,i) => <Link key={slug} href={`${cityBase}${slug ? `/${slug}` : ""}`} aria-current={i === 0 ? "page" : undefined}>{c.nav[i]}{i === 6 && <ArrowUpRight size={13} aria-hidden="true"/>}</Link>)}</nav>
    </div></section>

    <section id="context" className={`${styles.section} ${styles.localSection}`} aria-labelledby="city-local-title"><div className={home.container}>
      <div className={styles.sectionHead}><div><Chapter number="01">{c.chapters[0]}</Chapter><Heading id="city-local-title" lines={c.localTitle}/></div><p lang={contentLang}>{city.heroSubheadline}</p></div>
      <div className={styles.localGrid}><div className={styles.localStory} lang={contentLang}><p className={styles.lead}>{city.localContext[0]}</p><details className={styles.contextDetails}><summary><span>{c.localRead}</span><Plus size={17} aria-hidden="true"/></summary>{city.localContext.slice(1).map(paragraph => <p key={paragraph}>{paragraph}</p>)}</details>
        {extras && <aside id="hidden-gem" className={styles.localOpportunity} lang="en"><span className={styles.mono}>{c.localFocus}</span><h3>{extras.hiddenGem.title}</h3><p>{extras.hiddenGem.body}</p></aside>}
      </div><div className={styles.marketSheet} lang="en"><div className={styles.sheetTitle}><span>{c.industryLabel}</span><Building2 size={17} strokeWidth={1.1} aria-hidden="true"/></div>{identity?.economy.slice(0,4).map((industry,i) => <details key={industry.cluster} className={styles.industryRow}><summary><span className={styles.mono}>0{i+1}</span><h3>{industry.cluster}</h3><Plus size={15} aria-hidden="true"/></summary><p>{industry.body}</p></details>)}<p id="industries-angle" className={styles.industryNote} lang={contentLang}>{city.industriesAngle}</p></div></div>
      <div id="neighborhoods" className={styles.coverage}><div><MapPin size={18} strokeWidth={1.2} aria-hidden="true"/><h3>{c.areas}</h3><span>{city.name} / {city.state}</span></div><ul>{city.neighborhoods.map(name => <li key={name}><span aria-hidden="true"/>{name}</li>)}</ul></div>
    </div></section>

    <section id="connected-business" className={`${styles.section} ${styles.systemSection}`} data-city-scene aria-labelledby="city-system-title"><div className={home.container}>
      <div className={styles.sectionHead}><div><Chapter number="02">{c.chapters[1]}</Chapter><Heading id="city-system-title" lines={c.systemTitle}/></div><p>{c.systemIntro}</p></div>
      <div id="procurement-story"><CitySystems copy={c} cityName={city.name}/></div>
    </div></section>

    <section id="why-hire" className={styles.section} aria-labelledby="city-capabilities-title"><div className={home.container}>
      <div className={styles.sectionHead}><div><Chapter number="03">{c.chapters[2]}</Chapter><Heading id="city-capabilities-title" lines={c.servicesTitle}/></div><Link href={`${cityBase}/services`} className={home.textButton}>{c.servicesLink}<ArrowUpRight size={17} aria-hidden="true"/></Link></div>
      <div className={styles.reasons} lang={contentLang}>{city.whyHire.map((reason,i) => <article key={reason.title}><span className={styles.mono}>0{i+1} / {city.name}</span><h3>{reason.title}</h3><p>{reason.body}</p></article>)}</div>
      <div className={styles.serviceIndex}>{t.services.items.map((service,i) => <Link key={service.id} href={`${base}/services#${service.id}`} lang={locale}><span className={styles.mono}>0{i+1}</span><span><strong>{service.name}</strong><small>{service.kicker}</small></span><ArrowUpRight size={18} strokeWidth={1.2} aria-hidden="true"/></Link>)}</div>
    </div></section>

    {org && <section id="operating-model" className={`${styles.section} ${styles.deliverySection}`} aria-labelledby="city-delivery-title"><div className={home.container}>
      <div className={styles.sectionHead}><div><Chapter number="04">{c.chapters[3]}</Chapter><Heading id="city-delivery-title" lines={c.approachTitle}/></div><p>{c.approachIntro}</p></div>
      <div className={styles.deliveryGrid}><aside className={styles.deliveryNote} lang="en"><CircleDot size={30} strokeWidth={1} aria-hidden="true"/><span className={styles.mono}>{c.operating}</span><h3>{city.name}</h3><p>{org.presenceTagline}</p><dl><div><dt>{c.localDelivery}</dt><dd>{org.onSiteCadence}</dd></div><div><dt>{org.leadRole}</dt><dd>{org.languages.join(" / ")}</dd></div></dl><Link className={home.textButton} href={`${cityBase}/process`}>{c.nav[2]}<ArrowUpRight size={16} aria-hidden="true"/></Link></aside>
      <div id="engagement" className={styles.engagement} lang="en">{org.engagement.map((phase,i) => <details key={phase.name} open={i === 0} className={styles.phase}><summary><span className={styles.phaseNumber}>0{i+1}</span><span><small>{phase.duration}</small><strong>{phase.name}</strong></span><Plus size={18} aria-hidden="true"/></summary><div><p>{phase.mission}</p><p className={styles.phaseCity}>{phase.cityNote}</p><span className={styles.mono}>{c.artefacts}</span><ul>{phase.artefacts.map(item => <li key={item}>{item}</li>)}</ul></div></details>)}</div></div>
      <details id="stack" className={styles.stackDetails}><summary><span>{c.stack}</span><span className={styles.mono}>{city.name} / {String(org.stack.length).padStart(2,"0")}</span><Plus size={17} aria-hidden="true"/></summary><div className={styles.stackGrid} lang="en">{org.stack.map(layer => <article key={layer.category}><h3>{layer.category}</h3><p>{layer.cityNote}</p><ul>{layer.tools.map(tool => <li key={tool}>{tool}</li>)}</ul></article>)}</div></details>
      <details id="cadence" className={styles.stackDetails}><summary><span>{c.cadence}</span><Plus size={17} aria-hidden="true"/></summary><ul className={styles.cadence} lang="en">{org.cadence.map(beat => <li key={beat.day}><span className={styles.mono}>{beat.day}</span><strong>{beat.ritual}</strong><span>{beat.channel}</span></li>)}</ul></details>
    </div></section>}

    <section id="places-heritage" className={styles.section} aria-labelledby="city-character-title"><div className={home.container}>
      <Chapter number="05">{c.chapters[4]}</Chapter>
      {identity && <div className={styles.heritageGrid}><div><span className={styles.mono}>{c.heritage}</span><h2 id="city-character-title">{city.name}.<br/><em lang="en">{identity.nickname}.</em></h2><p className={styles.lead} lang="en">{identity.tagline}</p><Link className={home.textButton} href={`${cityBase}/about`}>{c.heritageLink}<ArrowUpRight size={16} aria-hidden="true"/></Link></div><div className={styles.heritageRecord} lang="en"><span className={styles.mono}>{identity.nicknameRegional ?? city.name}</span><p>{identity.nicknameOrigin}</p><details><summary>{c.landmarks}<Plus size={17} aria-hidden="true"/></summary><ul>{identity.landmarks.map(landmark => <li key={landmark.name}><strong>{landmark.name}</strong><span>{landmark.meaning}</span></li>)}</ul></details></div></div>}
      <div id="case-study" className={styles.caseStudy}><div><span className={styles.mono}>{c.results} / {city.name}</span><p lang={contentLang}>{city.caseStudyCallout}</p><Link href={`${cityBase}/case-studies`} className={home.textButton}>{c.caseLink}<ArrowUpRight size={16} aria-hidden="true"/></Link></div><div id="testimonials" className={styles.voices}><span className={styles.mono}>{c.voices}</span>{city.testimonials.map(item => <figure key={item.quote} lang={contentLang}><blockquote>“{item.quote}”</blockquote><figcaption>{item.author}<span>{item.role}</span></figcaption></figure>)}</div></div>
    </div></section>

    <section id="faq" className={`${styles.section} ${styles.faqSection}`} aria-labelledby="city-faq-title"><div className={`${home.container} ${styles.faqGrid}`}><div><Chapter number="06">{c.chapters[5]}</Chapter><Heading id="city-faq-title" lines={c.faqTitle}/></div><div className={styles.faqList} lang={contentLang}>{city.faq.map((item,i) => <details key={item.q} open={i === 0}><summary><span>{item.q}</span><Plus size={17} aria-hidden="true"/></summary><p>{item.a}</p></details>)}</div></div></section>

    <section className={styles.closing} aria-labelledby="city-cta-title"><div className={home.container}><Chapter number="07">{c.chapters[6]}</Chapter><div className={styles.closingGrid}><div><Heading id="city-cta-title" lines={c.cta}/><p>{c.ctaBody}</p></div><div><Link className={home.primaryButton} href={`${cityBase}/contact`}>{c.contact}<ArrowUpRight size={17} aria-hidden="true"/></Link><ProcurementTrigger className={home.textButton} label={c.erp}>{c.procurement}<ArrowRight size={16} aria-hidden="true"/></ProcurementTrigger></div></div>
      <nav id="related-cities" className={styles.related} aria-label={c.related}><span>{c.related}</span><div>{related.map(item => <Link key={item.slug} href={`${base}/cities/${item.slug}`}>{item.name}<ArrowUpRight size={12} aria-hidden="true"/></Link>)}<Link href={`${base}/cities`}>{c.allCities}<ArrowRight size={12} aria-hidden="true"/></Link></div></nav>
    </div></section>
  </div></CityMotion>;
}
