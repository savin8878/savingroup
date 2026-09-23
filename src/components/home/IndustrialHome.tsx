import Link from "next/link";
import {
  ArrowDown, ArrowDownRight, ArrowRight, ArrowUpRight, Check,
  CircleDot, ClipboardList, Code2, Database, Factory, FileSpreadsheet,
  Layers3, Network, Plus, Radar, ShieldCheck, Workflow,
} from "lucide-react";
import type { Messages } from "@/lib/i18n";
import { AUDIT, CTA_LABEL } from "@/lib/offer";
import { INDIA_CITIES } from "@/lib/cities";
import { HomeMotion } from "./HomeMotion";
import { OperationsScene, IndustrialScene } from "./TechnicalVisuals";
import { ConnectedJourney, CapabilityExplorer, AgentWorkflow, TransformationToggle } from "./SystemExperiences";
import styles from "./IndustrialHome.module.css";

type FaqItem = { q: string; a: string };

function Chapter({ number, children }: { number: string; children: React.ReactNode }) {
  return <div className={styles.chapter}><span>{number}</span><span>{children}</span></div>;
}

function FrictionMap() {
  const systems = [
    { Icon: FileSpreadsheet, name: "Spreadsheets", note: "Another version. Another error.", className: styles.frictionSheet },
    { Icon: Factory, name: "Production", note: "Updates arrive after the delay.", className: styles.frictionFactory },
    { Icon: ClipboardList, name: "Your team", note: "Copy. Paste. Follow up. Repeat.", className: styles.frictionTeam },
    { Icon: Database, name: "Business data", note: "Every system tells a different story.", className: styles.frictionData },
  ];
  return (
    <div className={styles.frictionMap} aria-label="Disconnected spreadsheets, production, people and business data create manual handoffs">
      <div className={styles.diagramTopline}><span>THE EVERYDAY WORKAROUND</span><span>01 / DISCONNECTED</span></div>
      <svg className={styles.frictionLines} viewBox="0 0 600 340" fill="none" aria-hidden="true">
        <path d="M150 102H245V170H285 M315 170H355V100H460 M155 265H238V202H285 M315 202H365V263H460" />
        <path d="m292 162 16 16m0-16-16 16m0 24 16 16m0-16-16 16" className={styles.brokenLink} />
      </svg>
      {systems.map(({ Icon, name, note, className }) => <div className={`${styles.frictionNode} ${className}`} key={name}>
        <Icon size={23} strokeWidth={1.35} aria-hidden="true" />
        <strong>{name}</strong><span>{note}</span>
      </div>)}
      <span className={styles.frictionCenter}>Manual<br />handoffs</span>
    </div>
  );
}

/** The new English homepage is isolated from shared sections and locale copy. */
export function IndustrialHome({ t, country, faqItems }: { t: Messages; country: string; faqItems: FaqItem[] }) {
  const base = `/${country}/en`;
  const manufacturing = t.caseStudies.items.find((item) => item.id === "manufacturing-erp");
  const otherProjects = t.caseStudies.items.filter((item) => item.id !== "manufacturing-erp").slice(0, 2);

  return (
    <HomeMotion>
      <section className={styles.hero} aria-labelledby="home-title" data-home-scene>
        <div className={styles.container}>
          <div className={styles.heroEyebrow}><span className={styles.signal} /><span>THE FUTURE OF BUSINESS OPERATIONS</span><span className={styles.heroEdition}>SANAT DYNAMO / SYSTEMS ENGINEERING</span></div>
          <div className={styles.heroGrid}>
            <div className={styles.heroCopy}>
              <h1 id="home-title">Your operations.<br />Intelligently<br /><em>connected.</em></h1>
              <p>Less manual work. More business in motion.</p>
              <p className={styles.heroDescription}>We connect software, AI and industrial systems so manufacturers and growing businesses can operate with clarity, speed and control.</p>
              <div className={styles.heroActions}>
                <Link href={`${base}/contact`} className={styles.primaryButton}>{CTA_LABEL}<ArrowUpRight size={18} aria-hidden="true" /></Link>
                <a href="#connected-business" className={styles.textButton}>Explore the system<ArrowDown size={16} aria-hidden="true" /></a>
              </div>
              <div className={styles.heroNote}><span />Your process. Your systems. Engineered together.</div>
            </div>
            <div className={styles.heroVisual}>
              <div className={styles.visualIndex}><span>FIG. 01</span><span>THE CONNECTED OPERATION</span><Plus size={15} aria-hidden="true" /></div>
              <OperationsScene />
              <div className={styles.sceneLegend}><span><i />Physical systems</span><span><i />Intelligence layer</span><span><i />Business outcomes</span></div>
            </div>
          </div>
          <div className={styles.heroBand}>
            <span>FROM THE SHOP FLOOR<br /><strong>TO THE DECISION MAKER.</strong></span>
            <div><Factory size={19} aria-hidden="true" />Industrial & IoT</div>
            <div><Workflow size={19} aria-hidden="true" />AI & automation</div>
            <div><Layers3 size={19} aria-hidden="true" />ERP & software</div>
            <div><Network size={19} aria-hidden="true" />Data & integrations</div>
          </div>
        </div>
      </section>

      <section id="operations-story" className={styles.problemSection} aria-labelledby="problem-title" data-home-scene>
        <div className={styles.container}>
          <div className={styles.split}>
            <div>
              <Chapter number="01">THE FRICTION</Chapter>
              <h2 id="problem-title">Your people shouldn’t<br />be the <em>integration.</em></h2>
              <p className={styles.lead}>When systems don’t talk, people fill the gaps.</p>
              <ul className={styles.frictionList}>
                <li><span>01</span>Same data. Entered three times.</li>
                <li><span>02</span>Production waiting on a spreadsheet.</li>
                <li><span>03</span>Decisions made without the full picture.</li>
              </ul>
              <p className={styles.problemFoot}>More workarounds won’t make a growing business scale.</p>
            </div>
            <FrictionMap />
          </div>
          <div className={styles.bridge}><span>What if these systems could work together?</span><ArrowDownRight size={35} strokeWidth={1.3} aria-hidden="true" /></div>
        </div>
      </section>

      <section id="connected-business" className={styles.connectedSection} aria-labelledby="connected-title" data-home-scene>
        <div className={styles.container}>
          <div className={styles.sectionHeading}>
            <div><Chapter number="02">THE CONNECTION</Chapter><h2 id="connected-title">One flow.<br /><em>A smarter business.</em></h2></div>
            <p>From a signal on the shop floor to a decision in the boardroom. Every handoff connected. Every action traceable.</p>
          </div>
          <ConnectedJourney />
        </div>
      </section>

      <section id="capabilities" className={styles.ecosystemSection} aria-labelledby="capabilities-title" data-home-scene>
        <div className={styles.container}>
          <div className={styles.sectionHeading}>
            <div><Chapter number="03">THE SYSTEM</Chapter><h2 id="capabilities-title">Different capabilities.<br /><em>One working system.</em></h2></div>
            <p>Custom software, connected equipment and intelligent workflows, designed around the way your business actually runs.</p>
          </div>
          <CapabilityExplorer />
          <div className={styles.sectionBottom}><span>Start with one process. Connect the next when you’re ready.</span><Link href={`${base}/services`}>Explore our services<ArrowUpRight size={16} aria-hidden="true" /></Link></div>
        </div>
      </section>

      <section className={styles.agentSection} aria-labelledby="agent-title" data-home-scene>
        <div className={styles.container}>
          <div className={styles.sectionHeading}>
            <div><Chapter number="04">INTELLIGENCE THAT ACTS</Chapter><h2 id="agent-title">Beyond answers.<br /><em>Into action.</em></h2></div>
            <p>AI agents that read business data, use tools and move work forward—with defined permissions and people in control.</p>
          </div>
          <AgentWorkflow />
          <div className={styles.agentPrinciples}><span><ShieldCheck size={16} aria-hidden="true" />Rules before actions</span><span><CircleDot size={16} aria-hidden="true" />Human approval where it matters</span><span><ClipboardList size={16} aria-hidden="true" />A record of every step</span></div>
        </div>
      </section>

      <section className={styles.industrialSection} aria-labelledby="industrial-title" data-home-scene>
        <div className={styles.container}>
          <div className={styles.industrialGrid}>
            <div className={styles.industrialCopy}><Chapter number="05">THE PHYSICAL WORLD, CONNECTED</Chapter><h2 id="industrial-title">Your machines<br />have a story.<br /><em>Put it to work.</em></h2>
              <p className={styles.lead}>Turn equipment signals into useful decisions.</p>
              <p className={styles.bodyCopy}>Connect sensors and industrial systems to inventory, analytics and workflows. Give your team a clearer view of what’s happening—and what needs attention.</p>
              <div className={styles.industrialNote}><Radar size={18} aria-hidden="true" /><span>Industrial automation · IoT · Manufacturing technology</span></div>
            </div>
            <div className={styles.industrialVisual}><IndustrialScene /><div className={styles.industrialCaption}><span>OBSERVE → UNDERSTAND → ACT</span><span>Illustrative architecture</span></div></div>
          </div>
          <div className={styles.industrialSteps}>
            <div><span>01 / CAPTURE</span><strong>Signals from the floor</strong><p>Sensors, machines and production events.</p></div>
            <div><span>02 / INTERPRET</span><strong>Context from your business</strong><p>Orders, stock, thresholds and operating rules.</p></div>
            <div><span>03 / RESPOND</span><strong>Action with accountability</strong><p>Alerts, work orders and approved workflows.</p></div>
          </div>
        </div>
      </section>

      <section className={styles.transformationSection} aria-labelledby="transformation-title" data-home-scene>
        <div className={styles.container}>
          <div className={styles.sectionHeading}><div><Chapter number="06">THE DIFFERENCE YOU FEEL</Chapter><h2 id="transformation-title">Same business.<br /><em>New operating rhythm.</em></h2></div><p>Less chasing. Less re-keying. More time for the work that moves your business forward.</p></div>
          <TransformationToggle />
        </div>
      </section>

      <section className={styles.engineeringSection} aria-labelledby="engineering-title">
        <div className={styles.container}>
          <div className={styles.engineeringGrid}>
            <div><Chapter number="07">UNDER THE SURFACE</Chapter><h2 id="engineering-title">Deep engineering.<br /><em>Clear purpose.</em></h2><p className={styles.bodyCopy}>The right technology for the job. Built to integrate with your operation, grow with demand and remain maintainable.</p></div>
            <div className={styles.engineeringLayers}>
              <div><span>01</span><Code2 size={21} aria-hidden="true" /><div><strong>Intelligence & orchestration</strong><p>AI agents · MCP · APIs · Computer automation</p></div><span>ACT</span></div>
              <div><span>02</span><Layers3 size={21} aria-hidden="true" /><div><strong>Business & application systems</strong><p>Custom software · ERP · Workflow automation</p></div><span>OPERATE</span></div>
              <div><span>03</span><Database size={21} aria-hidden="true" /><div><strong>Data & infrastructure</strong><p>Cloud · Databases · Integrations · Business intelligence</p></div><span>UNDERSTAND</span></div>
              <div><span>04</span><Factory size={21} aria-hidden="true" /><div><strong>The connected industrial edge</strong><p>IoT · Sensors · Machines · Robotics interfaces</p></div><span>CONNECT</span></div>
            </div>
          </div>
        </div>
      </section>

      <section id="selected-work" className={styles.proofSection} aria-labelledby="proof-title">
        <div className={styles.container}>
          <div className={styles.sectionHeading}><div><Chapter number="08">SYSTEMS IN PRACTICE</Chapter><h2 id="proof-title">The work is technical.<br /><em>The impact is human.</em></h2></div><Link href={`${base}/case-studies`} className={styles.textButton}>View case studies<ArrowUpRight size={17} aria-hidden="true" /></Link></div>
          {manufacturing && <Link href={`${base}/case-studies#${manufacturing.id}`} className={styles.featuredCase}>
            <div className={styles.caseDiagram} aria-hidden="true"><div className={styles.sheetStack}><FileSpreadsheet /><FileSpreadsheet /><FileSpreadsheet /></div><div className={styles.caseConnection}><span /><ArrowRight size={20} /></div><div className={styles.erpBlock}><Layers3 size={36} strokeWidth={1.2} /><strong>ONE ERP</strong><span>Inventory / Orders / Finance</span></div></div>
            <div className={styles.caseBody}><div className={styles.caseMeta}>{manufacturing.industry} <span> / </span> {manufacturing.location}</div><h3>From five spreadsheets<br />to one source of truth.</h3><p>{manufacturing.summary}</p><span className={styles.caseLink}>Explore the project<ArrowUpRight size={17} aria-hidden="true" /></span></div>
            <div className={styles.caseMetric}><strong>{manufacturing.metrics[0].value}</strong><span>{manufacturing.metrics[0].label}</span><small>Reported project outcome</small><div><span>Order-to-delivery cycle</span><b>{manufacturing.metrics[1].value}</b></div></div>
          </Link>}
          <div className={styles.otherProjects}>{otherProjects.map((project) => <Link key={project.id} href={`${base}/case-studies#${project.id}`}><span className={styles.caseMeta}>{project.industry} / {project.location}</span><h3>{project.title}</h3><span>View project<ArrowUpRight size={17} aria-hidden="true" /></span></Link>)}</div>
          <p className={styles.proofNote}>Selected anonymized projects from our case studies. Results describe those engagements, not a forecast for every business.</p>
        </div>
      </section>

      <section className={styles.faqSection} aria-labelledby="home-faq-title">
        <div className={styles.container}>
          <div className={styles.faqGrid}><div><Chapter number="09">A CLEAR START</Chapter><h2 id="home-faq-title">Good questions.<br /><em>Straight answers.</em></h2><p className={styles.bodyCopy}>Start with a conversation about your process. Leave with a clearer view of what comes next.</p><Link href={`${base}/contact`} className={styles.textButton}>Talk through your process<ArrowUpRight size={17} aria-hidden="true" /></Link></div><div className={styles.faqList}>{faqItems.map((item) => <details key={item.q}><summary>{item.q}<Plus size={18} aria-hidden="true" /></summary><p>{item.a}</p></details>)}</div></div>
          {country === "in" && <details className={styles.locations}><summary>Engineering systems for businesses across India<Plus size={15} aria-hidden="true" /></summary><div>{INDIA_CITIES.map((city) => <Link key={city.slug} href={`${base}/cities/${city.slug}`}>{city.name}<ArrowUpRight size={12} aria-hidden="true" /></Link>)}</div></details>}
        </div>
      </section>

      <section className={styles.finalSection} aria-labelledby="final-title" data-home-scene>
        <div className={styles.container}>
          <div className={styles.finalEyebrow}><span className={styles.signal} /> THE NEXT CONNECTION STARTS WITH A CONVERSATION</div>
          <div className={styles.finalGrid}><div><p>Have a business process that shouldn’t be manual?</p><h2 id="final-title">Let’s <em>engineer it.</em></h2><Link href={`${base}/contact`} className={styles.primaryButton}>{CTA_LABEL}<ArrowUpRight size={19} aria-hidden="true" /></Link><span className={styles.finalNote}><Check size={14} aria-hidden="true" />Free {AUDIT.duration} audit. A written diagnosis. A clear next step.</span></div><div className={styles.finalCircuit} aria-hidden="true"><svg viewBox="0 0 300 230" fill="none"><path d="M0 50H85V115H165M0 180H85V115M165 115H230V30H300M230 115V200H300" /><path className={styles.circuitFlow} d="M0 50H85V115H230V30H300" /><circle cx="165" cy="115" r="32" /><path d="m150 115 10 10 21-23" /></svg><span>YOUR NEXT CHAPTER</span></div></div>
          <div className={styles.finalFooter}><span>SANAT DYNAMO</span><span>Systems. Automation. Scale.</span><a href="#home-title">Back to top<ArrowUpRight size={13} aria-hidden="true" /></a></div>
        </div>
      </section>
    </HomeMotion>
  );
}
