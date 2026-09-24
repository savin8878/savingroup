import { BrainCircuit, Cable, Code2, Database, Factory, Layers3, PanelsTopLeft, Workflow } from "lucide-react";
import type { CapabilityId } from "./services-copy";
import styles from "./Services.module.css";

export const capabilityIcons = { ai: BrainCircuit, automation: Workflow, erp: Layers3, industrial: Factory, software: Code2, integrations: Cable, data: Database, platforms: PanelsTopLeft };

export function SystemsBlueprint() {
  return <svg viewBox="0 0 1120 360" className={styles.heroDrawing} fill="none" aria-hidden="true">
    <defs><pattern id="services-blueprint-dots" width="23" height="23" patternUnits="userSpaceOnUse"><circle cx="1" cy="1" r=".65" fill="currentColor" opacity=".22" /></pattern></defs>
    <path d="M20 10h1080v328H20Z" fill="url(#services-blueprint-dots)" />
    <g className={styles.guide}><path d="M20 181h1080M560 15v320" strokeDasharray="3 7" /><path d="M28 25h16m-8-8v16m1036-8h16m-8-8v16M28 332h16m-8-8v16m1036-8h16m-8-8v16" /></g>
    <g className={styles.blueprintOutline}>
      <path className={styles.blueprintSide} d="m326 202 232-135 248 142v16L574 360 326 218Z" /><path className={styles.blueprintPaper} d="m326 202 232-135 248 142-232 135Z" /><path d="M574 344v16" />
      <path d="m373 202 186-108 201 115-186 108Zm47 27 186-108m-139 135 186-108m-138 136 186-108M420 175l201 115m-154-142 201 115m-154-142 201 115" className={styles.guide}/>
      <path className={styles.blueprintPaper} d="M401 36h313v142H401Z" /><path className={styles.blueprintSide} d="m714 36 8 6v142l-8-6Z" /><path d="M401 58h313m-250 0v120M414 47h3m8 0h3m8 0h3M416 76h31m-31 16h22m-22 16h30m-30 16h25m-25 16h31" />
      <path className={styles.blueprintSoft} d="M482 76h92v78h-92Zm109 0h105v35H591Zm0 47h105v31H591Z" /><path d="M493 138v-47m0 47h70m-62-9v-12m15 12V97m15 32v-22m15 22v-37m54-5h54m-54 10h76m-76 33h65m-65 11h44" />
      <path className={styles.blueprintSide} d="m522 179 59 34v22l-59-34Z" /><path className={styles.blueprintPaper} d="m498 218 59-34 82 47-59 35Z" />
      <path className={styles.engineTop} d="m486 231 64-37 76 44-64 37Z" /><path className={styles.engineSide} d="M486 231v43l76 44 64-37v-43l-64 37Z" /><path d="M562 275v43m-63-70 49 28m-49-17 34 20m46 5 33-19m-33 29 33-19" className={styles.engineTrace} /><path d="m510 233 38-22 53 30-38 22Zm13 0 25-14 40 23-25 14Z" className={styles.engineTrace} />
      <g className={styles.sourceStack}><path className={styles.blueprintSoft} d="M106 61h103v120H106Z" /><path className={styles.blueprintPaper} d="M121 48h103v120H121Z" /><path d="M134 64h56m-56 12h74m-74 18h76m-76 15h76m-76 15h76m-76 15h76m-50-45v45m25-45v45" /></g>
      <g><path className={styles.blueprintPaper} d="M92 245v-61l33 19v-32l38 23v-45h21v96Z" /><path className={styles.blueprintSide} d="m184 149 26 15v67l-26 14Z" /><path d="M105 223h14m15 0h14m16 0h9m-10-74 11-6 10 6" /></g>
      <g><path className={styles.blueprintPaper} d="M900 51h116v88H900Z" /><path d="M900 71h116m-102-10h3m7 0h3m7 0h3M914 87h45m-45 13h68m-68 13h55" /><path className={styles.accentLine} d="m976 91 7 7 16-17" /></g>
      <g><path className={styles.blueprintPaper} d="M883 206h139v97H883Z" /><path d="M896 229h31m-31 14h31m-31 14h31m-31 14h31m12-47v56h69" /><path className={styles.accentLine} d="m946 269 14-18 15 9 14-28 12 8" /></g>
    </g>
    <path d="M224 112h71v111h139M210 216h53v55h214M724 109h111v-14h65M626 266h192v-17h65" className={styles.blueprintRoute} />
    <path d="M224 112h71v111h139M210 216h53v55h214M724 109h111v-14h65M626 266h192v-17h65" className={styles.movingSignal} />
    <g className={styles.connectionPoints}><circle cx="295" cy="174" r="4"/><circle cx="263" cy="247" r="4"/><circle cx="835" cy="95" r="4"/><circle cx="818" cy="249" r="4"/></g>
  </svg>;
}

export function CapabilityDiagram({ id, flow, label }: { id: CapabilityId; flow: [string,string,string]; label: string }) {
  const Icon = capabilityIcons[id];
  return <figure className={styles.capabilityDiagram} aria-label={label}>
    <div className={styles.diagramEyebrow}><span>{label}</span><span aria-hidden="true">01 → 03</span></div>
    <div className={styles.diagramCanvas}>
      <svg viewBox="0 0 600 260" fill="none" className={styles.capabilityWires} aria-hidden="true"><g className={styles.guide}><path d="M10 130h580M300 14v232" strokeDasharray="3 7"/><circle cx="300" cy="130" r="106"/><circle cx="300" cy="130" r="85" strokeDasharray="2 7"/></g><path d="M88 130h424" className={styles.blueprintRoute}/><path d="M88 130h424" className={styles.movingSignal}/><g className={styles.blueprintOutline}><path className={styles.blueprintPaper} d="M57 97h62v66H57Z"/><path d="M69 112h37m-37 12h25m-25 12h37m-37 12h19"/><path className={styles.blueprintPaper} d="M481 97h62v66h-62Z"/><path className={styles.accentLine} d="m495 131 11 11 24-27"/></g><g className={styles.connectionPoints}><circle cx="191" cy="130" r="4"/><circle cx="409" cy="130" r="4"/></g></svg>
      <div className={styles.capabilityCore}><Icon size={36} strokeWidth={1.2} aria-hidden="true"/></div>
    </div>
    <figcaption className={styles.flowLabels}>{flow.map((text,i)=><span key={text}><i>0{i+1}</i>{text}</span>)}</figcaption>
  </figure>;
}
