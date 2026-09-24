import Link from "next/link";
import { ArrowDown, ArrowRight, ArrowUpRight, BrainCircuit, Cable, CircleDot, Code2, Database, Factory, Plus, ShieldCheck, Users, Workflow } from "lucide-react";
import type { AboutCopy } from "./about-copy";
import { AUDIT } from "@/lib/offer";
import { TEAM } from "@/lib/team";
import { AboutMotion } from "./AboutMotion";
import { ArchitectureDrawing, ClarityDrawing, TeamDrawing, TransformationDrawing } from "./AboutDiagrams";
import { ProcessExplorer } from "./ProcessExplorer";
import home from "../home/IndustrialHome.module.css";
import styles from "./About.module.css";

const layerIcons = [BrainCircuit, Workflow, Database, Factory];
const roleIcons = [Users, Code2, Cable];

function Chapter({ number, children }: { number: string; children: React.ReactNode }) {
  return <div className={home.chapter}><span>{number}</span><span>{children}</span></div>;
}
function Heading({ text, id }: { text: [string, string]; id: string }) {
  return <h2 id={id}>{text[0]}<br /><em>{text[1]}</em></h2>;
}

export function AboutExperience({ copy: c, base, ctaLabel, aboutLabel }: { copy: AboutCopy; base: string; ctaLabel: string; aboutLabel: string }) {
  return <AboutMotion>
    <section className={styles.hero} aria-labelledby="about-title">
      <div className={home.container}>
        <div className={styles.eyebrow}><span className={home.signal} /><span>Sanat Dynamo / {aboutLabel}</span><span className={styles.edition}>{c.layers[0]} / {c.layers[2]}</span></div>
        <div className={styles.heroGrid}>
          <div className={styles.heroCopy}>
            <h1 id="about-title"><span>{c.hero[0]}</span><span>{c.hero[1]}</span><em>{c.hero[2]}</em></h1>
            <p>{c.intro}</p>
            <a href="#who-we-are" className={home.textButton}>{c.explore}<ArrowDown size={17} aria-hidden="true" /></a>
          </div>
          <figure className={styles.heroVisual}>
            <figcaption className={styles.figureCaption}><span>FIG. 01</span><span>{c.blueprint}</span><Plus size={15} aria-hidden="true" /></figcaption>
            <ArchitectureDrawing />
            <div className={styles.figureLegend}>{c.layers.map((layer, i) => <span key={layer}><i data-layer={i} />{layer}</span>)}</div>
          </figure>
        </div>
        <div className={styles.heroFoot}><span>{c.teamLabel}</span><span>{c.teamNote}</span><ArrowDownRightMark /></div>
      </div>
    </section>

    <section id="who-we-are" className={`${styles.section} ${styles.identity}`} aria-labelledby="identity-title">
      <div className={`${home.container} ${styles.identityGrid}`}>
        <div><Chapter number="01">{c.chapters[0]}</Chapter><Heading id="identity-title" text={c.identity} /><div className={styles.identityBody}>{c.identityBody.map((p) => <p key={p}>{p}</p>)}</div></div>
        <div className={styles.teamMap}><span className={styles.mono}>{c.teamLabel}</span><h3>{c.teamTitle}</h3><TeamDrawing /><div className={styles.roleList}>{c.roles.map((role, i) => { const Icon = roleIcons[i]; return <span key={role}><Icon size={17} strokeWidth={1.3} aria-hidden="true" />{role}</span>; })}</div></div>
        {TEAM.length > 0 && <div className={styles.teamMembers}>{TEAM.map((person) => <article key={person.name}><span className={styles.mono}>{person.role}</span><h3>{person.name}</h3><p>{person.bio}</p>{person.linkedin && <a href={person.linkedin} className={home.textButton}>LinkedIn <ArrowUpRight size={15} aria-hidden="true" /></a>}{person.email && <a href={`mailto:${person.email}`} className={home.textButton}>{person.email}</a>}</article>)}</div>}
      </div>
    </section>

    <section className={`${styles.section} ${styles.why}`} aria-labelledby="why-title">
      <div className={home.container}>
        <div className={styles.sectionHead}><div><Chapter number="02">{c.chapters[1]}</Chapter><Heading id="why-title" text={c.why} /></div><p>{c.whyBody}</p></div>
        <div className={styles.clarity}>
          <div className={styles.frictionLabels}>{c.friction.map((label, i) => <span key={label}><span>0{i + 1}</span>{label}</span>)}</div>
          <ClarityDrawing />
          <div className={styles.clarityResult}><strong>{c.clarity}</strong><p>{c.clarityNote}</p></div>
        </div>
      </div>
    </section>

    <section className={styles.section} aria-labelledby="principles-title">
      <div className={`${home.container} ${styles.principlesGrid}`}>
        <div><Chapter number="03">{c.chapters[2]}</Chapter><Heading id="principles-title" text={c.principlesTitle} /><p className={styles.lead}>{c.principlesIntro}</p><div className={styles.principleMark} aria-hidden="true"><span /><span /><span /><span /><Plus size={27} strokeWidth={1} /></div></div>
        <div className={styles.principles}>{c.principles.map((principle, i) => <details key={principle.title} open={i === 0}><summary><span>0{i + 1}</span><h3>{principle.title}</h3><Plus size={18} strokeWidth={1.5} aria-hidden="true" /></summary><p>{principle.body}</p></details>)}</div>
      </div>
    </section>

    <section className={`${styles.section} ${styles.processSection}`} aria-labelledby="process-title">
      <div className={home.container}><div className={styles.sectionHead}><div><Chapter number="04">{c.chapters[3]}</Chapter><Heading id="process-title" text={c.processTitle} /></div><p>{c.processIntro}</p></div><ProcessExplorer steps={c.steps} hint={c.processHint} output={c.output} /></div>
    </section>

    <section className={styles.section} aria-labelledby="technology-title">
      <div className={`${home.container} ${styles.techGrid}`}>
        <div><Chapter number="05">{c.chapters[4]}</Chapter><Heading id="technology-title" text={c.techTitle} /><p className={styles.lead}>{c.techIntro}</p><p className={styles.techNote}><ShieldCheck size={19} strokeWidth={1.3} aria-hidden="true" />{c.techNote}</p></div>
        <div className={styles.techStack}>{c.techLayers.map((layer, i) => { const Icon = layerIcons[i]; return <div key={layer.title} className={styles.techLayer}><div className={styles.layerSymbol}><Icon size={23} strokeWidth={1.25} aria-hidden="true" /></div><div className={styles.layerContent}><div><span className={styles.mono}>0{i + 1}</span><h3>{layer.title}</h3></div><p>{layer.purpose}</p><div className={styles.technologyTags}>{c.technologies[i].map((tech) => <span key={tech}>{tech}</span>)}</div></div><span className={styles.layerConnection} aria-hidden="true"><Plus size={12} /></span></div>; })}</div>
      </div>
    </section>

    <section className={`${styles.section} ${styles.transformationSection}`} aria-labelledby="transformation-title">
      <div className={home.container}>
        <div className={styles.sectionHead}><div><Chapter number="06">{c.chapters[5]}</Chapter><Heading id="transformation-title" text={c.transformationTitle} /></div><p>{c.transformationIntro}</p></div>
        <div className={styles.comparison}><div className={styles.before}><div className={styles.comparisonTitle}><span className={styles.mono}>A</span><h3>{c.before}</h3></div><TransformationDrawing /><ol>{c.beforeLabels.map((label, i) => <li key={label}><span>0{i + 1}</span>{label}</li>)}</ol></div><div className={styles.after}><div className={styles.comparisonTitle}><span className={styles.mono}>B</span><h3>{c.after}</h3></div><TransformationDrawing connected /><ol>{c.afterLabels.map((label) => <li key={label}><CircleDot size={13} aria-hidden="true" />{label}</li>)}</ol></div></div>
        <div className={styles.transformationFoot}><p>{c.transformationNote}</p><Link href={`${base}/case-studies`} className={home.textButton}>{c.workLink}<ArrowUpRight size={16} aria-hidden="true" /></Link></div>
      </div>
    </section>

    <section className={styles.closing} aria-labelledby="closing-title"><div className={home.container}>
      <Chapter number="07">{c.chapters[6]}</Chapter>
      <div className={styles.closingGrid}><div><Heading id="closing-title" text={c.cta} /><p>{c.ctaIntro}</p></div><div className={styles.closingActions}><Link href={`${base}/contact`} className={home.primaryButton}>{ctaLabel}<ArrowUpRight size={18} aria-hidden="true" /></Link><Link href={`${base}/services`} className={home.textButton}>{c.servicesLink}<ArrowRight size={16} aria-hidden="true" /></Link><p>{c.auditNote.replace("{minutes}", String(AUDIT.minutes))}</p></div></div>
      <div className={styles.closingRail} aria-hidden="true"><span /><i /><span /><i /><span /></div>
    </div></section>
  </AboutMotion>;
}

function ArrowDownRightMark() {
  return <svg width="23" height="23" viewBox="0 0 24 24" fill="none" aria-hidden="true"><path d="m4 4 15 15M5 19h14V5" stroke="currentColor" strokeWidth="1.3" /></svg>;
}
