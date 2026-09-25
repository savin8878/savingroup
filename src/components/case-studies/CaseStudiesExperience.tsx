import Link from "next/link";
import {
  ArrowDown, ArrowRight, ArrowUpRight, Boxes, Building2, ChartNoAxesCombined, Check, ClipboardList,
  Factory, FileSpreadsheet, Globe, Layers3, LayoutList, Megaphone, MessageCircle, MessagesSquare,
  MonitorSmartphone, PanelsTopLeft, Plus, Quote, ReceiptText, Rotate3d, ScanLine, Search, ShieldCheck,
  ShoppingBag, ShoppingCart, Store, Truck, UserRoundX, Users, type LucideIcon,
} from "lucide-react";
import type { Messages } from "@/lib/i18n";
import { AUDIT } from "@/lib/offer";
import { INDIA_CITIES } from "@/lib/cities";
import { CaseStudiesMotion } from "./CaseStudiesMotion";
import type { CaseId, CaseStudiesCopy } from "./case-studies-copy";
import home from "../home/IndustrialHome.module.css";
import styles from "./CaseStudies.module.css";

type CaseStudy = Messages["caseStudies"]["items"][number];
type Metric = CaseStudy["metrics"][number];
type CaseArt = { mark: LucideIcon; hub: LucideIcon; before: LucideIcon[]; components: LucideIcon[] };

const CASE_ART: Record<CaseId, CaseArt> = {
  "d2c-skincare": { mark: ShoppingBag, hub: Store, before: [Megaphone, MonitorSmartphone, ShoppingCart], components: [Store, MessageCircle, Search] },
  "real-estate-developer": { mark: Building2, hub: Building2, before: [LayoutList, UserRoundX, Globe], components: [PanelsTopLeft, MessagesSquare, Rotate3d] },
  "manufacturing-erp": { mark: Factory, hub: Layers3, before: [FileSpreadsheet, MessageCircle, Users], components: [Boxes, ReceiptText, Truck] },
};
const FALLBACK_ART: CaseArt = { mark: Layers3, hub: Layers3, before: [], components: [] };
const readingIcons = [ScanLine, Layers3, ChartNoAxesCombined, Quote];
const methodIcons = [ClipboardList, ScanLine, Layers3, ChartNoAxesCombined];
/** Three loose inputs converge on the connected system; the column heights keep them aligned. */
const WIRES = ["M0 50C32 50 32 150 64 150", "M0 150H64", "M0 250C32 250 32 150 64 150"];

const pad = (n: number) => String(n).padStart(2, "0");

/** "₹30L → ₹68L" is a before/after pair; "+340%" is an after-only result. */
function splitMetric(value: string) {
  const parts = value.split("→").map((part) => part.trim());
  return parts.length === 2 ? { before: parts[0], after: parts[1] } : { before: null, after: value.trim() };
}

/** The single figure that summarises a metric: the change for a pair, the value otherwise. */
function headlineFigure(metric: Metric) {
  return metric.value.includes("→") ? metric.delta : metric.value;
}

/** Keeps "+127%" and "₹30L → ₹68L" in reading order on right-to-left pages; values written in an RTL script flow naturally. */
function Num({ children }: { children: string }) {
  return <span dir={/[֐-ࣿ]/.test(children) ? undefined : "ltr"}>{children}</span>;
}

function Chapter({ number, children }: { number: string; children: React.ReactNode }) {
  return <div className={`${home.chapter} ${styles.upper}`}><span>{number}</span><span>{children}</span></div>;
}

function PartLabel({ number, children }: { number: string; children: React.ReactNode }) {
  return <h3 className={styles.partLabel}><span>{number}</span>{children}</h3>;
}

export function CaseStudiesExperience({ copy: c, t, base, country }: { copy: CaseStudiesCopy; t: Messages; base: string; country: string }) {
  const items = t.caseStudies.items;
  const art = (id: string) => CASE_ART[id as CaseId] ?? FALLBACK_ART;

  return <CaseStudiesMotion labels={{ pause: c.pause, resume: c.resume, reduced: c.reduced }}>
    <section className={home.hero} aria-labelledby="case-studies-title" data-case-scene>
      <div className={home.container}>
        <div className={styles.eyebrow}><span className={home.signal} /><span>{t.brand.name} / {t.nav.work}</span><span>{c.legend.join(" / ")}</span></div>
        <div className={home.heroGrid}>
          <div className={home.heroCopy}>
            <h1 id="case-studies-title">{c.hero[0]}<br />{c.hero[1]}<br /><em>{c.hero[2]}</em></h1>
            <p>{c.lead}</p>
            <p className={home.heroDescription}>{c.intro}</p>
            <div className={home.heroActions}>
              <Link href={`${base}/contact`} className={home.primaryButton}>{t.nav.cta}<ArrowUpRight size={18} aria-hidden="true" /></Link>
              {items[0] && <a href={`#${items[0].id}`} className={home.textButton}>{c.explore}<ArrowDown size={16} aria-hidden="true" /></a>}
            </div>
            <div className={home.heroNote}><span />{c.heroNote}</div>
          </div>
          <figure className={`${home.heroVisual} ${styles.heroFigure}`}>
            <figcaption className={styles.figureIndex}><span>FIG. 01</span><span>{c.figure}</span><Plus size={15} aria-hidden="true" /></figcaption>
            <ol className={styles.register}>
              {items.map((item, i) => {
                const Mark = art(item.id).mark;
                const lead = item.metrics[0];
                return <li key={item.id}>
                  <a href={`#${item.id}`} className={styles.registerRow}>
                    <span className={styles.registerNumber}>{pad(i + 1)}</span>
                    <span className={styles.who}><strong><Mark size={15} strokeWidth={1.4} aria-hidden="true" />{item.industry}</strong><span>{item.location} · {item.duration}</span></span>
                    <span className={styles.track} aria-hidden="true"><i /><i /><i /><b /></span>
                    {lead && <span className={styles.result}><strong><Num>{headlineFigure(lead)}</Num></strong><span>{lead.label}</span></span>}
                  </a>
                </li>;
              })}
            </ol>
            <div className={`${home.sceneLegend} ${styles.legend}`}>{c.legend.map((label) => <span key={label}><i />{label}</span>)}</div>
          </figure>
        </div>
        <div className={home.heroBand}>
          <span className={styles.upper}>{c.readingLabel[0]}<br /><strong>{c.readingLabel[1]}</strong></span>
          {c.reading.map((label, i) => { const Icon = readingIcons[i]; return <div key={label}><Icon size={19} aria-hidden="true" />{label}</div>; })}
        </div>
      </div>
    </section>

    {items.map((item, index) => {
      const copy = c.cases[item.id as CaseId];
      const { hub: Hub, before: beforeIcons, components: componentIcons } = art(item.id);
      const [lead, second] = item.metrics;
      return <section key={item.id} id={item.id} className={`${styles.case} ${index % 2 ? styles.casePaper : ""}`} aria-labelledby={`${item.id}-title`} data-case-scene>
        <div className={home.container}>
          <div className={home.sectionHeading}>
            <div><Chapter number={pad(index + 1)}>{item.industry} / {item.location}</Chapter><h2 id={`${item.id}-title`}>{copy ? <>{copy.headline[0]}<br /><em>{copy.headline[1]}</em></> : item.title}</h2></div>
            {copy && <p>{item.title}</p>}
          </div>

          <div className={styles.caseGrid}>
            <div className={styles.story}>
              <PartLabel number="01">{c.reading[0]}</PartLabel>
              <p className={styles.summary}>{item.summary}</p>
              <dl className={styles.facts}>
                {[item.industry, item.location, item.duration, pad(item.metrics.length)].map((value, i) => <div key={c.facts[i]}><dt>{c.facts[i]}</dt><dd>{value}</dd></div>)}
              </dl>
            </div>
            {copy && <div className={styles.systemColumn}>
              <PartLabel number="02">{c.reading[1]}</PartLabel>
              <figure className={styles.systemFigure}>
                <figcaption className={styles.figureIndex}><span>FIG. {pad(index + 2)}</span><span>{item.industry}</span><Plus size={14} aria-hidden="true" /></figcaption>
                <div className={styles.system}>
                  <span className={styles.beforeLabel}>{c.before}</span>
                  <span className={styles.afterLabel}>{c.after}</span>
                  <ul className={styles.loose}>{copy.before.map((label, i) => { const Icon = beforeIcons[i] ?? ScanLine; return <li key={label}><Icon size={17} strokeWidth={1.35} aria-hidden="true" />{label}</li>; })}</ul>
                  <span className={styles.wireCell} aria-hidden="true"><svg className={styles.wires} viewBox="0 0 64 300" preserveAspectRatio="none" fill="none">
                    {WIRES.map((d, i) => <g key={d}><path className={styles.wireBase} d={d} /><path className={styles.wireFlow} d={d} pathLength={200} style={{ animationDelay: `${i * 0.45}s` }} /></g>)}
                  </svg></span>
                  <ArrowDown className={styles.mobileArrow} size={18} strokeWidth={1.4} aria-hidden="true" />
                  <div className={styles.hub}>
                    <div className={styles.hubHead}><Hub size={19} strokeWidth={1.3} aria-hidden="true" /><strong>{copy.system}</strong></div>
                    <ul>{copy.components.map((label, i) => { const Icon = componentIcons[i] ?? Check; return <li key={label}><Icon size={15} strokeWidth={1.4} aria-hidden="true" />{label}</li>; })}</ul>
                  </div>
                </div>
              </figure>
            </div>}
          </div>

          {lead && <div className={styles.outcome}>
            <PartLabel number={copy ? "03" : "02"}>{c.reading[2]}</PartLabel>
            <div className={styles.outcomeGrid}>
              <div className={styles.headlineMetric}>
                <strong><Num>{headlineFigure(lead)}</Num></strong><span>{lead.label}</span><small>{c.reported}</small>
                {second && <div><span>{second.label}</span><b><Num>{second.value}</Num></b></div>}
              </div>
              <table className={styles.metrics}>
                <caption className={styles.srOnly}>{c.reading[2]}: {item.industry}</caption>
                <thead><tr>{c.columns.map((column) => <th key={column} scope="col">{column}</th>)}</tr></thead>
                <tbody>{item.metrics.map((metric) => {
                  const { before, after } = splitMetric(metric.value);
                  return <tr key={metric.label}>
                    <th scope="row">{metric.label}</th>
                    <td data-label={c.columns[1]} className={styles.beforeValue}><Num>{before ?? "—"}</Num></td>
                    <td data-label={c.columns[2]} className={styles.afterValue}><Num>{after}</Num></td>
                    <td data-label={c.columns[3]} className={styles.change}><Num>{metric.delta}</Num></td>
                  </tr>;
                })}</tbody>
              </table>
            </div>
          </div>}

          <figure className={styles.quote}>
            <PartLabel number={copy ? "04" : "03"}>{c.reading[3]}</PartLabel>
            <blockquote><p>“{item.quote}”</p></blockquote>
            <figcaption>{item.author}</figcaption>
          </figure>
        </div>
      </section>;
    })}

    <section className={styles.method} aria-labelledby="case-method-title" data-case-scene>
      <div className={home.container}>
        <div className={home.sectionHeading}>
          <div><Chapter number={pad(items.length + 1)}>{c.methodChapter}</Chapter><h2 id="case-method-title">{c.methodTitle[0]}<br /><em>{c.methodTitle[1]}</em></h2></div>
          <p>{c.methodIntro}</p>
        </div>
        <div className={styles.methodRail} aria-hidden="true"><b /></div>
        <ol className={styles.steps}>{c.method.map((step, i) => {
          const Icon = methodIcons[i] ?? Check;
          return <li key={step.title}><span className={styles.stepNode}><Icon size={21} strokeWidth={1.25} aria-hidden="true" /></span><span className={styles.stepNumber}>{pad(i + 1)}</span><h3>{step.title}</h3><p>{step.body}</p></li>;
        })}</ol>
        <p className={styles.disclaimer}><ShieldCheck size={16} aria-hidden="true" />{c.disclaimer}</p>
      </div>
    </section>

    {country === "in" && <section className={styles.locationsSection} aria-label={c.locations}>
      <div className={home.container}>
        <details className={home.locations}><summary>{c.locations}<Plus size={15} aria-hidden="true" /></summary><div>{INDIA_CITIES.map((city) => <Link key={city.slug} href={`${base}/cities/${city.slug}/case-studies`}>{city.name}<ArrowUpRight size={12} aria-hidden="true" /></Link>)}</div></details>
      </div>
    </section>}

    <section className={home.finalSection} aria-labelledby="case-closing-title" data-case-scene>
      <div className={home.container}>
        <div className={`${home.finalEyebrow} ${styles.upper}`}><span className={home.signal} />{c.closingChapter}</div>
        <div className={home.finalGrid}>
          <div>
            <p>{c.closingLead}</p>
            <h2 id="case-closing-title" className={styles.closingTitle}>{c.closingTitle[0]}<br /><em>{c.closingTitle[1]}</em></h2>
            <div className={styles.closingActions}>
              <Link href={`${base}/contact`} className={home.primaryButton}>{t.nav.cta}<ArrowUpRight size={19} aria-hidden="true" /></Link>
              <Link href={`${base}/services`} className={home.textButton}>{c.servicesLink}<ArrowRight className={styles.flipRtl} size={16} aria-hidden="true" /></Link>
            </div>
            <span className={home.finalNote}><Check size={14} aria-hidden="true" />{c.audit.replace("{minutes}", String(AUDIT.minutes))}</span>
          </div>
          <div className={home.finalCircuit} aria-hidden="true"><svg viewBox="0 0 300 230" fill="none"><path d="M0 50H85V115H165M0 180H85V115M165 115H230V30H300M230 115V200H300" /><path className={home.circuitFlow} d="M0 50H85V115H230V30H300" /><circle cx="165" cy="115" r="32" /><path d="m150 115 10 10 21-23" /></svg><span className={styles.upper}>{c.nextCase.replace("{n}", pad(items.length + 1))}</span></div>
        </div>
        <div className={home.finalFooter}><span>{t.brand.name}</span><span>{t.brand.tagline}</span><a href="#case-studies-title">{c.backToTop}<ArrowUpRight size={13} aria-hidden="true" /></a></div>
      </div>
    </section>
  </CaseStudiesMotion>;
}
