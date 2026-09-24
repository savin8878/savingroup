import Link from "next/link";
import { ArrowDown, ArrowRight, ArrowUpRight, BrainCircuit, Cable, CheckCheck, CircleDot, FileText, Plus, ShieldCheck, Workflow } from "lucide-react";
import type { Messages } from "@/lib/i18n";
import { AUDIT } from "@/lib/offer";
import { IndustrialScene } from "../home/TechnicalVisuals";
import { ServicesMotion } from "./ServicesMotion";
import { SystemsBlueprint } from "./ServiceDiagrams";
import { ServiceExplorer } from "./ServiceExplorer";
import { ServiceCatalog } from "./ServiceCatalog";
import type { ServicesCopy } from "./services-copy";
import home from "../home/IndustrialHome.module.css";
import styles from "./Services.module.css";

function Chapter({ number, children }: { number: string; children: React.ReactNode }) { return <div className={home.chapter}><span>{number}</span><span>{children}</span></div>; }
function Heading({ id, lines }: { id: string; lines: [string,string] }) { return <h2 id={id}>{lines[0]}<br/><em>{lines[1]}</em></h2>; }
const agentIcons = [FileText, BrainCircuit, Cable, ShieldCheck, CheckCheck];

export function ServicesExperience({ copy: c, t, base }: { copy: ServicesCopy; t: Messages; base: string }) {
  return <ServicesMotion labels={{pause:c.pause,resume:c.resume,reduced:c.reduced}}>
    <section className={styles.hero} aria-labelledby="services-title" data-services-scene><div className={home.container}>
      <div className={styles.eyebrow}><span className={home.signal}/><span>{t.brand.name} / {t.nav.services}</span><span>{c.heroNote}</span></div>
      <div className={styles.heroHeading}><h1 id="services-title">{c.hero[0]}<br/><em>{c.hero[1]}</em></h1><div><p>{c.intro}</p><a className={home.textButton} href="#service-ecosystem">{c.explore}<ArrowDown size={16} aria-hidden="true"/></a></div></div>
      <figure className={styles.heroFigure}><figcaption><span>FIG. 01</span><span>{c.heroNote}</span><Plus size={14} aria-hidden="true"/></figcaption><SystemsBlueprint/></figure>
      <ol className={styles.storyRail}>{c.story.map((step,i)=><li key={step}><span>0{i+1}</span><strong>{step}</strong>{i<c.story.length-1&&<ArrowRight size={15} strokeWidth={1.3} aria-hidden="true"/>}</li>)}</ol>
    </div></section>

    <section id="service-ecosystem" className={`${styles.section} ${styles.ecosystem}`} aria-labelledby="ecosystem-title" data-services-scene><div className={home.container}>
      <div className={styles.sectionHead}><div><Chapter number="01">{c.chapters[0]}</Chapter><Heading id="ecosystem-title" lines={c.ecosystem}/></div><p>{c.ecosystemIntro}</p></div>
      <ServiceExplorer copy={{capabilities:c.capabilities,selectHint:c.selectHint,detailLabels:c.detailLabels,diagramLabel:c.diagramLabel}}/>
    </div></section>

    <section className={`${styles.section} ${styles.aiSection}`} aria-labelledby="ai-services-title" data-services-scene><div className={home.container}>
      <div className={styles.sectionHead}><div><Chapter number="02">{c.chapters[1]}</Chapter><Heading id="ai-services-title" lines={c.aiTitle}/></div><p>{c.aiIntro}</p></div>
      <div className={styles.aiArchitecture}><div className={styles.providerLine}><span className={styles.mono}>{c.modelNote}</span><span aria-hidden="true">↘</span></div><ol className={styles.aiFlow}>{c.aiLabels.map((label,i)=>{const Icon=agentIcons[i];return <li key={label}><div className={styles.aiNode}><span>0{i+1}</span><Icon size={29} strokeWidth={1.15} aria-hidden="true"/></div><h3>{label}</h3><p>{c.aiNotes[i]}</p></li>;})}</ol><div className={styles.contextBus}><span>ERP</span><span>IoT</span><span>CRM</span><span>MCP</span><span>APIs</span><span>BI</span></div><p className={styles.aiFoot}><ShieldCheck size={17} strokeWidth={1.2} aria-hidden="true"/>{c.aiFoot}</p></div>
    </div></section>

    <section className={`${styles.section} ${styles.industrialSection}`} aria-labelledby="industrial-services-title" data-services-scene><div className={home.container}>
      <div className={styles.industrialGrid}><div className={styles.industrialVisual} aria-hidden="true" dir="ltr"><IndustrialScene/></div><div><Chapter number="03">{c.chapters[2]}</Chapter><Heading id="industrial-services-title" lines={c.industrialTitle}/><p className={styles.lead}>{c.industrialIntro}</p><p className={styles.industrialFoot}>{c.industrialFoot}</p></div></div>
      <ol className={styles.industrialRail}>{c.industrialSteps.map((step,i)=><li key={step}><span>{String(i+1).padStart(2,"0")}</span>{step}{i<6&&<ArrowRight size={13} aria-hidden="true"/>}</li>)}</ol>
      <div className={styles.industrialNotes}>{c.industrialNotes.map((note,i)=><div key={note.title}><span className={styles.mono}>0{i+1}</span><h3>{note.title}</h3><p>{note.body}</p></div>)}</div>
    </div></section>

    <section className={`${styles.section} ${styles.catalogSection}`} aria-labelledby="catalog-title"><div className={home.container}>
      <div className={styles.sectionHead}><div><Chapter number="04">{c.chapters[3]}</Chapter><Heading id="catalog-title" lines={c.catalogTitle}/></div><p>{c.catalogIntro}</p></div>
      <ServiceCatalog items={t.services.items} base={base} labels={{deliverables:c.deliverables,investment:c.investment,discuss:c.discuss}}/>
    </div></section>

    <section className={styles.section} aria-labelledby="system-path-title" data-services-scene><div className={home.container}>
      <div className={styles.sectionHead}><div><Chapter number="05">{c.chapters[4]}</Chapter><Heading id="system-path-title" lines={c.pathTitle}/></div><p>{c.pathIntro}</p></div>
      <ol className={styles.deliveryPath}>{c.path.map((stage,i)=><li key={stage}><div>{i===0?<CircleDot size={22} strokeWidth={1.25} aria-hidden="true"/>:i===6?<Workflow size={22} strokeWidth={1.25} aria-hidden="true"/>:<span>{String(i).padStart(2,"0")}</span>}</div><h3>{stage}</h3></li>)}</ol>
    </div></section>

    <section className={styles.closing} aria-labelledby="services-cta-title"><div className={home.container}><Chapter number="06">{c.chapters[5]}</Chapter><div className={styles.closingGrid}><div><Heading id="services-cta-title" lines={c.cta}/><p>{c.ctaIntro}</p></div><div className={styles.closingActions}><Link className={home.primaryButton} href={`${base}/contact`}>{t.nav.cta}<ArrowUpRight size={18} aria-hidden="true"/></Link><Link className={home.textButton} href={`${base}/about`}>{c.aboutLink}<ArrowRight size={16} aria-hidden="true"/></Link><p>{c.audit.replace("{minutes}",String(AUDIT.minutes))}</p></div></div></div></section>
  </ServicesMotion>;
}
