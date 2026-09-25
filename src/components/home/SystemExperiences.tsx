"use client";

import { useEffect, useId, useRef, useState, type ReactNode, type RefObject } from "react";
import dynamic from "next/dynamic";
import { EXPERIENCE_DIALOGS, isExperienceKey, type ExperienceKey } from "./experiences";
import styles from "./SystemExperiences.module.css";

const ProcurementExperience = dynamic(() => import("./ProcurementExperience"), { ssr: false });

/** Which walkthrough a node or capability opens: the ERP procurement story, or one of the seven node experiences. */
type OpenExperience = "erp" | ExperienceKey | null;
function experienceFor(glyph: string): OpenExperience { return glyph === "erp" ? "erp" : isExperienceKey(glyph) ? glyph : null; }

function ExperienceDialog({ open, onClose }: { open: OpenExperience; onClose: () => void }) {
  if (!open) return null;
  if (open === "erp") return <ProcurementExperience onClose={onClose} />;
  const Dialog = EXPERIENCE_DIALOGS[open];
  return <Dialog key={open} onClose={onClose} />;
}

type GlyphName = "machine" | "iot" | "data" | "erp" | "ai" | "automation" | "dashboard" | "decision" | "code" | "integration";

function Glyph({ name, className }: { name: GlyphName; className?: string }) {
  const paths: Record<GlyphName, ReactNode> = {
    machine: <><path d="M5 27V13l8 4v-7l8 5V6h5v21H5Z" /><path d="M9 22h3m4 0h3m4 0h3M23 6V3" /></>,
    iot: <><rect x="11" y="16" width="10" height="12" rx="1" /><path d="M16 12v4M9 11a10 10 0 0 1 14 0M5 7a16 16 0 0 1 22 0m-13 17h4" /><circle cx="16" cy="21" r="1" /></>,
    data: <><ellipse cx="16" cy="7" rx="11" ry="4" /><path d="M5 7v9c0 5 22 5 22 0V7M5 16v9c0 5 22 5 22 0v-9" /></>,
    erp: <><rect x="4" y="4" width="24" height="24" rx="1" /><path d="M4 11h24M12 11v17M16 16h7m-7 5h7M7 7h1m3 0h1" /></>,
    ai: <><path d="m16 3 3 9 10 4-10 4-3 9-3-9-10-4 10-4 3-9Z" /><path d="m26 3 1 3 3 1-3 1-1 3-1-3-3-1 3-1 1-3Z" /></>,
    automation: <><path d="M7 11a10 10 0 0 1 18-2l3 4M25 21a10 10 0 0 1-18 2l-3-4M28 6v7h-7M4 26v-7h7" /><path d="m18 10-6 7h5l-3 6" /></>,
    dashboard: <><rect x="3" y="5" width="26" height="20" rx="1" /><path d="M11 29h10m-5-4v4M8 20v-5m5 5V9m6 11v-8m5 8v-4" /></>,
    decision: <><path d="M16 28V14m0 0-9-8m9 8 9-8M3 6h8M7 2v8M21 6h8m-4-4v8" /><circle cx="16" cy="26" r="3" fill="currentColor" stroke="none" /></>,
    code: <><path d="m10 8-8 8 8 8m12-16 8 8-8 8M19 4l-6 24" /></>,
    integration: <><path d="m13 10 4-4a7 7 0 0 1 10 10l-4 4M19 22l-4 4A7 7 0 0 1 5 16l4-4m2 9 10-10" /></>,
  };
  return <svg className={className} width="32" height="32" viewBox="0 0 32 32" fill="none" stroke="currentColor" strokeWidth="1.4" strokeLinecap="round" strokeLinejoin="round" aria-hidden="true">{paths[name]}</svg>;
}

function useMotionState(ref: RefObject<HTMLDivElement | null>) {
  const [motion, setMotion] = useState({ reduced: false, paused: false });
  useEffect(() => {
    const query = window.matchMedia("(prefers-reduced-motion: reduce)");
    const container = ref.current?.closest("[data-motion]") ?? document.documentElement;
    const update = () => setMotion({ reduced: query.matches, paused: container.getAttribute("data-motion") === "paused" });
    update();
    query.addEventListener("change", update);
    const observer = new MutationObserver(update);
    observer.observe(container, { attributes: true, attributeFilter: ["data-motion"] });
    return () => { query.removeEventListener("change", update); observer.disconnect(); };
  }, [ref]);
  return motion;
}

const journey = [
  { title: "Machine", label: "The physical world", glyph: "machine", detail: "Start where the work happens.", copy: "Capture production signals, equipment status, and operating conditions at the source.", output: "A machine event" },
  { title: "IoT", label: "Capture the signal", glyph: "iot", detail: "Give equipment a voice.", copy: "Connect sensors, controllers, and devices so operational signals can move beyond the shop floor.", output: "A connected signal" },
  { title: "Data", label: "Make it usable", glyph: "data", detail: "Turn signals into context.", copy: "Organize and validate incoming data so every downstream system can work from the same information.", output: "Structured information" },
  { title: "ERP", label: "Connect the business", glyph: "erp", detail: "Connect operations to the business.", copy: "Bring production, inventory, purchasing, and orders into a shared operational picture.", output: "Business context" },
  { title: "AI", label: "Understand the next step", glyph: "ai", detail: "Find the next useful action.", copy: "Give an AI agent relevant context to interpret a request, surface an issue, or prepare a recommendation.", output: "A considered recommendation" },
  { title: "Automation", label: "Put a workflow in motion", glyph: "automation", detail: "Move work forward with rules.", copy: "Route information and trigger defined workflows, with human approval wherever the process needs it.", output: "A coordinated workflow" },
  { title: "Dashboard", label: "See what matters", glyph: "dashboard", detail: "Make the whole picture visible.", copy: "Bring operational signals, workflow status, and business context into a clear view for your team.", output: "Operational visibility" },
  { title: "Decision", label: "Act with context", glyph: "decision", detail: "Help people make the call.", copy: "Give the right person timely, connected information to decide what happens next.", output: "An informed next step" },
] as const;

const journeyPaths = ["M125 99H375", "M375 99H625", "M625 99H875", "M875 99V329", "M875 329H625", "M625 329H375", "M375 329H125"];

export function ConnectedJourney() {
  const [open, setOpen] = useState<OpenExperience>(null);
  const ref = useRef<HTMLDivElement>(null);
  const detailId = useId();
  const { reduced, paused } = useMotionState(ref);
  const [active, setActive] = useState(0);
  const [chosen, setChosen] = useState<number | null>(null);
  const selected = chosen ?? active;

  useEffect(() => {
    if (reduced) { setActive(7); return; }
    if (paused) return;
    const element = ref.current;
    if (!element) return;
    let frame = 0;
    let visible = false;
    const update = () => {
      frame = 0;
      if (!visible) return;
      const rect = element.getBoundingClientRect();
      const travel = Math.min(window.innerHeight * 0.72, rect.height * 0.9);
      const progress = Math.min(1, Math.max(0, (window.innerHeight * 0.78 - rect.top) / Math.max(1, travel)));
      setActive(Math.min(7, Math.floor(progress * 8)));
    };
    const onScroll = () => { if (visible && !frame) frame = window.requestAnimationFrame(update); };
    const observer = new IntersectionObserver(([entry]) => { visible = entry.isIntersecting; if (visible) onScroll(); }, { threshold: 0 });
    observer.observe(element);
    window.addEventListener("scroll", onScroll, { passive: true });
    window.addEventListener("resize", onScroll, { passive: true });
    return () => { observer.disconnect(); window.removeEventListener("scroll", onScroll); window.removeEventListener("resize", onScroll); window.cancelAnimationFrame(frame); };
  }, [reduced, paused]);

  return <div className={styles.journey} ref={ref}>
    <div className={styles.diagramMeta}><span><i className={styles.signalDot} />From a signal to a decision</span><span>Select any stage to open its walkthrough</span></div>
    <div className={styles.journeyTrack}>
      <svg className={styles.journeyWires} viewBox="0 0 1000 428" preserveAspectRatio="none" aria-hidden="true">
        {journeyPaths.map((path, index) => <g key={path}><path className={styles.wireBase} d={path} /><path className={`${styles.wireActive} ${index < active ? styles.wireOn : ""}`} d={path} pathLength="1" /></g>)}
      </svg>
      <div className={styles.journeyGrid}>
        {journey.map((stage, index) => <button key={stage.title} className={`${styles.journeyNode} ${index <= active ? styles.nodeConnected : ""} ${index === selected ? styles.nodeSelected : ""}`} style={{ gridArea: `stage${index + 1}` }} type="button" aria-pressed={selected === index} aria-controls={detailId} aria-haspopup="dialog" onClick={() => { setChosen(index); setOpen(experienceFor(stage.glyph)); }}>
          <span className={styles.nodeTop}><span className={styles.nodeNumber}>0{index + 1}</span><span className={styles.nodeIndicator} /><span className={styles.nodeArrow} aria-hidden="true">↗</span></span>
          <Glyph name={stage.glyph} className={styles.journeyIcon} />
          <span className={styles.nodeTitle}>{stage.title}</span><span className={styles.nodeLabel}>{stage.label}</span>
          <span className={styles.nodeOpen} aria-hidden="true">Open walkthrough</span>
        </button>)}
      </div>
    </div>
    <div className={styles.journeyDetail} id={detailId}>
      <div className={styles.detailHeading}><span className={styles.eyebrow}>0{selected + 1} / {journey[selected].title}</span><h3>{journey[selected].detail}</h3></div>
      <p>{journey[selected].copy}</p>
      <div className={styles.output}><span className={styles.eyebrow}>Output</span><span>{journey[selected].output}<span aria-hidden="true">↗</span></span></div>
    </div>
    <p className={styles.diagramFootnote}>An illustrative system architecture. Built around your equipment, your software, and your way of working.</p>
    <ExperienceDialog open={open} onClose={() => setOpen(null)} />
  </div>;
}

const capabilities = [
  { title: "IoT", glyph: "iot", position: 1, point: [100, 80], benefit: "Make your operations visible.", copy: "Connect devices, sensors, and equipment to the software your team already uses.", example: "Bring machine status into an operations dashboard.", tag: "Physical → digital" },
  { title: "Automation", glyph: "automation", position: 2, point: [300, 80], benefit: "Let a defined process do the repetitive work.", copy: "Connect routine tasks across departments with clear triggers, rules, and approval steps.", example: "Route a low-stock alert to the right purchasing workflow.", tag: "Trigger → action" },
  { title: "AI agents", glyph: "ai", position: 3, point: [500, 80], benefit: "Give your team an agent with useful context.", copy: "Build assistants that work with approved information and tools, within your business rules.", example: "Ask an agent to check inventory and prepare a reorder draft.", tag: "Context → assistance" },
  { title: "ERP", glyph: "erp", position: 9, point: [500, 400], benefit: "Bring the business into one connected view.", copy: "Connect inventory, production, sales, purchasing, and finance around how your business operates.", example: "Link a sales order to stock availability and production planning.", tag: "Departments → shared context" },
  { title: "Custom software", glyph: "code", position: 6, point: [500, 240], benefit: "Build around the way your team works.", copy: "Create the portals, applications, and internal tools that off-the-shelf products cannot quite cover.", example: "Give your service team a purpose-built job and maintenance portal.", tag: "Your process → your software" },
  { title: "Data", glyph: "data", position: 8, point: [300, 400], benefit: "Make information ready to use.", copy: "Bring scattered data together, define consistent structures, and make it accessible to the right systems.", example: "Combine production events with inventory data for reporting.", tag: "Scattered → structured" },
  { title: "Integrations", glyph: "integration", position: 7, point: [100, 400], benefit: "Help your existing systems work together.", copy: "Create dependable connections between applications, APIs, and the tools your business relies on.", example: "Connect your customer portal, ERP, and dispatch software.", tag: "System → system" },
  { title: "Industrial systems", glyph: "machine", position: 4, point: [100, 240], benefit: "Connect the shop floor to the bigger picture.", copy: "Bridge industrial equipment and business applications with the operational context each side needs.", example: "Connect equipment events to maintenance and production records.", tag: "Shop floor → business" },
] as const;

export function CapabilityExplorer() {
  const [open, setOpen] = useState<OpenExperience>(null);
  const [selected, setSelected] = useState(0);
  const panelId = useId();
  const capability = capabilities[selected];
  return <div className={styles.capabilityExplorer}>
    <div className={styles.ecosystem}>
      <svg className={styles.ecosystemWires} viewBox="0 0 600 480" preserveAspectRatio="none" aria-hidden="true">
        <circle cx="300" cy="240" r="170" className={styles.orbit} />
        {capabilities.map((item, index) => <path key={item.title} d={`M300 240L${item.point[0]} ${item.point[1]}`} className={index === selected ? styles.ecosystemWireSelected : styles.ecosystemWire} />)}
      </svg>
      <div className={styles.ecosystemGrid}>
        <div className={styles.ecosystemHub}><span className={styles.hubMark} aria-hidden="true"><i /><i /><i /></span><span>One connected <br />business</span></div>
        {capabilities.map((item, index) => <button key={item.title} type="button" className={`${styles.capabilityNode} ${index === selected ? styles.capabilitySelected : ""}`} style={{ gridColumn: ((item.position - 1) % 3) + 1, gridRow: Math.floor((item.position - 1) / 3) + 1 }} aria-pressed={index === selected} aria-controls={panelId} aria-haspopup={experienceFor(item.glyph) ? "dialog" : undefined} onClick={() => { setSelected(index); setOpen(experienceFor(item.glyph)); }}><Glyph name={item.glyph} /><span>{item.title}</span><span className={styles.capabilityNodeArrow} aria-hidden="true">↗</span></button>)}
      </div>
      <p className={styles.ecosystemHint}>Explore a capability. See how it connects.</p>
    </div>
    <div className={styles.capabilityPanel} id={panelId} aria-live="polite" aria-atomic="true">
      <div className={styles.capabilityPanelTop}><span className={styles.eyebrow}>Connected capability</span><span className={styles.capabilityCount}>0{selected + 1} / 08</span></div>
      <div className={styles.capabilityTitle}><Glyph name={capability.glyph} /><h3>{capability.title}</h3></div>
      <h4>{capability.benefit}</h4><p>{capability.copy}</p>
      <div className={styles.useCase}><span className={styles.eyebrow}>In practice</span><p>{capability.example}</p></div>
      <span className={styles.capabilityTag}>{capability.tag}</span>
    </div>
    <ExperienceDialog open={open} onClose={() => setOpen(null)} />
  </div>;
}

const workflowSteps = [
  { name: "Request", glyph: "decision", description: "Understand the request" },
  { name: "Agent", glyph: "ai", description: "Plan a bounded task" },
  { name: "Tools / APIs", glyph: "integration", description: "Use permitted tools" },
  { name: "ERP", glyph: "erp", description: "Check example stock" },
  { name: "Review", glyph: "dashboard", description: "Ask for approval" },
  { name: "Result", glyph: "automation", description: "Prepare the handoff" },
] as const;

const workflowMessages = [
  "Reading the request and identifying the stock information needed.",
  "Planning the check within the agent’s permitted tools and rules.",
  "Calling a simulated inventory tool through the API / MCP layer.",
  "Comparing example stock with the configured reorder rule.",
  "A draft is ready. A person reviews it before any real submission.",
  "Example review complete. The draft is approved for a controlled handoff.",
];

export function AgentWorkflow() {
  const ref = useRef<HTMLDivElement>(null);
  const { reduced, paused } = useMotionState(ref);
  const [phase, setPhase] = useState<"idle" | "running" | "review" | "finishing" | "complete">("idle");
  const [step, setStep] = useState(0);
  const statusId = useId();

  useEffect(() => {
    if (phase !== "running" && phase !== "finishing") return;
    if (reduced) { setStep(phase === "running" ? 4 : 5); setPhase(phase === "running" ? "review" : "complete"); return; }
    if (paused) return;
    const timer = window.setTimeout(() => {
      if (phase === "finishing") { setStep(5); setPhase("complete"); }
      else if (step >= 3) { setStep(4); setPhase("review"); }
      else setStep(step + 1);
    }, 850);
    return () => window.clearTimeout(timer);
  }, [phase, step, reduced, paused]);

  const run = () => { setStep(0); setPhase("running"); };
  const inProgress = phase === "running" || phase === "finishing";

  return <div ref={ref} className={styles.agentWorkflow}>
    <div className={styles.workflowHeader}><span className={styles.eyebrow}><i className={styles.signalDot} />Interactive example</span><span className={styles.modelLabel}>OpenAI · Claude · Grok / xAI — via APIs</span></div>
    <div className={styles.workflowRequest}><div><span className={styles.eyebrow}>The human request</span><p>“Check stock and prepare a reorder.”</p></div><button className={styles.runButton} type="button" onClick={run} disabled={inProgress || phase === "review"} aria-describedby={statusId}>{inProgress ? (paused ? "Example paused" : "Running example") : phase === "review" ? "Awaiting review" : phase === "complete" ? "Replay example" : "Run example"}<span aria-hidden="true">{inProgress ? "···" : "↗"}</span></button></div>
    <ol className={styles.workflowTrack} aria-label="Example agent workflow">
      {workflowSteps.map((item, index) => <li key={item.name} className={`${styles.workflowStep} ${phase !== "idle" && index <= step ? styles.workflowStepActive : ""} ${phase !== "idle" && index === step ? styles.workflowStepCurrent : ""}`} aria-current={phase !== "idle" && index === step ? "step" : undefined}><div className={styles.workflowIcon}><Glyph name={item.glyph} /><span className={styles.workflowStepNumber}>0{index + 1}</span></div><span className={styles.workflowStepName}>{item.name}</span><span className={styles.workflowStepDescription}>{item.description}</span></li>)}
    </ol>
    <div className={styles.workflowConsole}>
      <div className={styles.workflowStatus} id={statusId} role="status" aria-live="polite" aria-atomic="true"><span className={styles.eyebrow}>{phase === "idle" ? "Ready when you are" : phase === "review" ? "Human approval required" : phase === "complete" ? "Example complete" : paused ? "Paused" : `Step 0${step + 1} / 06`}</span><p>{phase === "idle" ? "Run the example to follow a request from intent to a reviewed draft." : workflowMessages[step]}</p><span className={styles.toolLabel}>MCP tools + business rules + scoped permissions</span></div>
      <div className={`${styles.draftPreview} ${step >= 4 && phase !== "idle" ? styles.draftReady : ""}`}>
        <div className={styles.draftHeader}><span>Purchase order</span><span className={styles.draftBadge}>{phase === "complete" ? "Reviewed draft" : "Draft only"}</span></div>
        <dl><div><dt>Example item</dt><dd>Machine bearing</dd></div><div><dt>Reorder rule</dt><dd>Below minimum stock</dd></div><div><dt>Next step</dt><dd>{phase === "complete" ? "Ready for handoff" : step >= 4 && phase !== "idle" ? "Review draft" : "Run stock check"}</dd></div></dl>
        {phase === "review" && <button type="button" onClick={() => setPhase("finishing")} className={styles.approveButton}>Approve example draft<span aria-hidden="true">↗</span></button>}
        {phase === "complete" && <span className={styles.approvalNote}><span aria-hidden="true">✓</span> Human review recorded in this example.</span>}
      </div>
    </div>
    <p className={styles.workflowDisclaimer}>A simulated workflow, with no live system connection. No purchase order is submitted.</p>
  </div>;
}

const transformationRows = [
  { label: "Production signals", before: "Updates collected by hand", after: "Equipment events flow into your systems", glyph: "machine" },
  { label: "Stock & purchasing", before: "Rekeying across separate tools", after: "Shared context with defined approval steps", glyph: "erp" },
  { label: "Team coordination", before: "Chasing updates and handoffs", after: "Work moves through connected workflows", glyph: "integration" },
  { label: "Reporting", before: "Spreadsheets assembled after the fact", after: "Operational information in one clear view", glyph: "dashboard" },
  { label: "The next action", before: "Decisions wait for missing information", after: "People act with the context they need", glyph: "decision" },
] as const;

export function TransformationToggle() {
  const [connected, setConnected] = useState(false);
  const panelId = useId();
  return <div className={`${styles.transformation} ${connected ? styles.transformationConnected : ""}`}>
    <div className={styles.transformationTop}><div><span className={styles.eyebrow}>A different way to operate</span><p>{connected ? "The same business. Working together." : "The work between the work."}</p></div><div className={styles.toggle} role="group" aria-label="Compare operations"><button type="button" aria-pressed={!connected} aria-controls={panelId} onClick={() => setConnected(false)}>Before</button><button type="button" aria-pressed={connected} aria-controls={panelId} onClick={() => setConnected(true)}>Connected<span aria-hidden="true">↗</span></button></div></div>
    <div className={styles.transformationBody} id={panelId}>
      <div className={styles.transformationDiagram} aria-hidden="true"><span className={styles.eyebrow}>{connected ? "Connected operations" : "Isolated operations"}</span><div className={styles.miniNetwork}>{transformationRows.map((item, index) => <div className={styles.miniNetworkNode} key={item.label}><Glyph name={item.glyph} /><span>0{index + 1}</span></div>)}</div><div className={styles.miniNetworkOutcome}><span className={styles.signalDot} /><span>{connected ? "A clear path from information to action" : "The gaps become your team’s work"}</span></div></div>
      <div className={styles.transformationRows} aria-live="polite" aria-atomic="true">{transformationRows.map((item) => <div className={styles.transformationRow} key={item.label}><span className={styles.transformationRowLabel}>{item.label}</span><span className={styles.transformationRowValue}><span className={styles.rowState} aria-hidden="true">{connected ? "↗" : "–"}</span>{connected ? item.after : item.before}</span></div>)}</div>
    </div>
  </div>;
}
