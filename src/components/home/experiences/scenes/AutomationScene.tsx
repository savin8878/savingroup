import type { CSSProperties } from "react";
import { Paper, Person, Pivot, Tick, at } from "./primitives";
import s from "./Scene.module.css";

const RULES: [string, string][] = [["R-12", "IF tool_wear_stop → maintenance ticket"], ["R-18", "IF stock < min → purchase requisition"], ["R-22", "IF severity ≥ 2 → notify supervisor"]];
/** Routes from the rule board to the ticket, the requisition and the phone: a start point plus a path relative to it. */
const ROUTES: { start: [number, number]; d: string }[] = [{ start: [270, 152], d: "M0 0H30V-42H60" }, { start: [270, 192], d: "M0 0H30V58H60" }, { start: [270, 232], d: "M0 0H30V78H320V-32H340" }];
const FOOT = ["THE TRIGGER CARRIES ITS CONTEXT · NO STEP LOOKS IT UP AGAIN", "RULES v7 · THE RUN RECORDS WHICH VERSION DECIDED", "ONE TICKET WITH THE WHOLE STORY ATTACHED", "SAME REQUISITION PATH AS PR-0241 · RAISED BY A RULE", "ONE MESSAGE WITH CONTEXT INSTEAD OF THREE PHONE CALLS", "ESCALATION IS A RULE TOO · NOBODY HAS TO CHASE", "RUN-0931 FINISHED · SLA MET · RESULT POSTED TO THE TIMELINE"];

function Packet({ delay, path }: { delay: number; path: string }) {
  return <circle r="3.5" className={`${s.accentFill} ${s.motion}`} style={{ offsetPath: `path("${path}")`, "--d": `${delay}s` } as CSSProperties} />;
}

/** A rule board that receives a trigger, evaluates three rules and branches into a ticket, a requisition and a WhatsApp message, with an SLA ring and a completion. */
export function AutomationScene({ step }: { step: number }) {
  const routeOn = [step >= 2, step >= 3, step >= 4];
  return <Paper id="automation" step={step} dots title="WORKFLOW / WF-14 TOOL-WEAR RESPONSE / RUN-0931" code="DEC-0412 → MT-0777 · PR-0242" foot={FOOT[step]}>
    {/* Rule board */}
    <g transform="translate(40 70)">
      <rect width="230" height="200" className={s.box} />
      <text x="10" y="15" className={s.small}>RULE BOARD · rules v7</text>
      <text x="220" y="15" textAnchor="end" className={s.tiny}>{step === 6 ? "RUN-0931 · DONE" : "RUN-0931"}</text>
      <path d="M0 22h230" className={s.line} />
      <rect x="10" y="34" width="210" height="26" className={step === 0 ? s.boxTint : s.boxPaper} strokeDasharray={step === 0 ? "4 3" : undefined} />
      <text x="18" y="44" className={s.tiny}>TRIGGER · decision.approved</text>
      <g transform="translate(18 56)"><g className={step === 0 ? s.dropIn : undefined} style={at(.5)}><rect x="0" y="-11" width="66" height="14" className={s.boxAccent} /><text x="33" y="-1" textAnchor="middle" className={`${s.tiny} ${s.accentText}`}>DEC-0412</text></g></g>
      {step === 0 && <text x="212" y="52" textAnchor="end" className={`${s.tiny} ${s.accentText} ${s.rise}`} style={at(1.4)}>07:26:12</text>}
      {RULES.map(([code, text], i) => <g key={code} transform={`translate(10 ${86 + i * 40})`}>
        <circle cx="8" cy="-4" r="3.5" className={step >= 1 ? `${s.lampOn} ${step === 1 ? s.wave : ""}` : s.lamp} style={at(i * .4)} />
        <text x="20" className={`${s.tiny} ${routeOn[i] ? s.accentText : s.inkFill}`}>{code}</text>
        <text x="20" y="13" className={s.tiny}>{text}</text>
        {step >= 1 && <Tick x={200} y={2} r={6} delay={step === 1 ? .8 + i * .5 : 0} />}
        {step === 1 && <text x="176" y="15" textAnchor="end" className={`${s.tiny} ${s.accentText} ${s.fade}`} style={at(1 + i * .5)}>TRUE</text>}
      </g>)}
    </g>

    {/* Routes */}
    {ROUTES.map(({ start, d }, i) => <g key={d} transform={`translate(${start[0]} ${start[1]})`}>
      <path d={d} className={`${s.line} ${step >= 1 ? "" : s.dim}`} />
      {step === 1 && <path d={d} pathLength={1} className={s.drawMuted} style={at(1.2 + i * .4, 1)} />}
      {routeOn[i] && <path d={d} pathLength={1} className={s.draw} style={at(step === i + 2 ? .2 : 0, 1.2)} />}
      {step === i + 2 && [0.3, 1.4].map((delay) => <Packet key={delay} delay={delay} path={d} />)}
    </g>)}

    {/* Ticket card */}
    <g transform="translate(330 60)">
      <rect width="250" height="100" className={step >= 2 ? s.box : `${s.boxPaper} ${s.dim}`} strokeDasharray={step >= 2 ? undefined : "4 3"} />
      <text x="10" y="15" className={s.small}>MAINTENANCE TICKET</text>
      <text x="240" y="15" textAnchor="end" className={`${s.tiny} ${step >= 2 ? s.accentText : ""}`}>{step >= 2 ? "MT-0777" : "AWAITING RULE R-12"}</text>
      <path d="M0 22h250" className={s.line} />
      {step >= 2 && <g className={step === 2 ? s.rise : undefined} style={at(1.2)}>
        <text x="10" y="40" className={s.label}>Replace insert T07 · CNC-M2</text>
        <text x="10" y="54" className={s.tiny}>14:30 CHANGEOVER · PRIORITY 2 · PLANNED</text>
        <Person x={20} y={80} accent />
        <text x="36" y="76" className={s.label}>V. Naik</text><text x="36" y="88" className={s.tiny}>Technician · shift A</text>
        <g transform="translate(150 66)"><g className={s.stamp} style={at(step === 2 ? 2.2 : 0)}><rect x="0" y="-9" width="88" height="18" className={step === 6 ? s.stampBox : s.boxAccent} /><text x="44" y="3" textAnchor="middle" className={`${s.tiny} ${s.accentText}`}>{step === 6 ? "DONE 14:36" : "ASSIGNED"}</text></g></g>
      </g>}
      {step >= 5 && <g transform="translate(214 46)">
        <circle r="14" className={s.line} />
        <g className={s.ring} style={{ "--offset": step === 6 ? 0 : .88, "--offset-from": 1 } as CSSProperties}><Pivot r={14} /><circle r="14" /></g>
        <text y="2" textAnchor="middle" className={`${s.tiny} ${s.accentText}`}>{step === 6 ? "✓" : "SLA"}</text>
      </g>}
    </g>

    {/* Requisition card */}
    <g transform="translate(330 210)">
      <rect width="250" height="80" className={step >= 3 ? s.box : `${s.boxPaper} ${s.dim}`} strokeDasharray={step >= 3 ? undefined : "4 3"} />
      <text x="10" y="15" className={s.small}>PURCHASE REQUISITION</text>
      <text x="240" y="15" textAnchor="end" className={`${s.tiny} ${step >= 3 ? s.accentText : ""}`}>{step >= 3 ? "PR-0242" : "AWAITING RULE R-18"}</text>
      <path d="M0 22h250" className={s.line} />
      {step >= 3 && <g className={step === 3 ? s.rise : undefined} style={at(1.2)}>
        <text x="10" y="40" className={s.label}>20 × carbide insert CNMG-12</text>
        <text x="10" y="54" className={s.tiny}>ON HAND 4 · MINIMUM 12 · REASON MT-0777</text>
        <text x="10" y="68" className={s.tiny}>→ PURCHASING · SAME PATH AS PR-0241</text>
        <g transform="translate(150 50)"><g className={s.stamp} style={at(step === 3 ? 2.2 : 0)}><rect x="0" y="-9" width="88" height="18" className={s.boxAccent} /><text x="44" y="3" textAnchor="middle" className={`${s.tiny} ${s.accentText}`}>SUBMITTED</text></g></g>
      </g>}
    </g>

    {/* Phone */}
    <g transform="translate(610 60)">
      <rect width="130" height="290" rx="14" className={step >= 4 ? s.box : `${s.boxPaper} ${s.dim}`} />
      <rect x="8" y="10" width="114" height="270" rx="8" className={s.boxSoft} />
      <rect x="45" y="14" width="40" height="5" rx="2.5" className={s.mutedFill} />
      <text x="16" y="36" className={s.small}>M. Deshmukh</text>
      <text x="16" y="47" className={s.tiny}>Shift supervisor · WhatsApp</text>
      <path d="M8 54H122" className={s.line} />
      {step >= 4 ? <g transform="translate(14 66)"><g className={step === 4 ? s.rise : undefined} style={at(1)}>
        <rect width="102" height="96" rx="6" className={s.boxTint} />
        {["CNC-M2 · tool wear stop", "Fix planned 14:30", "Ticket MT-0777 · V. Naik", "PR-0242 raised · 20 inserts", "→ open ticket"].map((line, i) => <text key={line} x="8" y={16 + i * 14} className={`${s.tiny} ${i === 4 ? s.accentText : ""}`}>{line}</text>)}
        <text x="96" y="90" textAnchor="end" className={`${s.tiny} ${s.accentText}`}>07:27 ✓✓</text>
      </g>
        {step >= 4 && <g transform="translate(60 118)"><g className={s.rise} style={at(step === 4 ? 3.4 : 0)}><rect width="42" height="18" rx="6" className={s.box} /><text x="21" y="12" textAnchor="middle" className={s.tiny}>👍 07:28</text></g></g>}
      </g> : <text x="65" y="160" textAnchor="middle" className={s.tiny}>AWAITING RULE R-22</text>}
      {step >= 4 && <text x="65" y="268" textAnchor="middle" className={s.tiny}>DELIVERED 07:27 · READ 07:28</text>}
    </g>

    {/* Bottom strip */}
    <g transform="translate(40 300)">
      {step === 0 && <g className={s.rise} style={at(1.8)}><text className={s.tiny}>CONTEXT ATTACHED TO THE TRIGGER</text><text y="24" className={s.big}>EVT-M2-1187 · CNC-M2 · WO-0318</text><text y="40" className={s.tiny}>3 RULES TO EVALUATE · MODE: AUTOMATIC, WITH APPROVALS</text></g>}
      {step === 1 && <g className={s.rise} style={at(2.6)}><text className={s.tiny}>EVALUATION</text><text y="24" className={s.big}>3 of 3 true · 31 ms</text><text y="40" className={s.tiny}>THREE ROUTES OPENED · 0 SKIPPED</text></g>}
      {step === 2 && <g className={s.rise} style={at(2.6)}><text className={s.tiny}>TICKET</text><text y="24" className={s.big}>MT-0777 · 14:30</text><text y="40" className={s.tiny}>PARTS: 1 × CNMG-12 FROM STOCK · LINKED DEC-0412 · EVT-M2-1187</text></g>}
      {step === 3 && <g className={s.rise} style={at(2.6)}><text className={s.tiny}>REQUISITION</text><text y="24" className={s.big}>PR-0242 · 20 units</text><text y="40" className={s.tiny}>APPROVAL: PURCHASING LEAD · RELATED PR-0241 (DRV-240, IN PROGRESS)</text></g>}
      {step === 4 && <g className={s.rise} style={at(2.6)}><text className={s.tiny}>NOTIFICATION MSG-0931-01</text><text y="24" className={s.big}>sent 07:27:04 · read 07:28:11</text><text y="40" className={s.tiny}>WHATSAPP BUSINESS API · ONE MESSAGE, FULL CONTEXT</text></g>}
      {step === 5 && <g className={s.rise} style={at(.6)}><text className={s.tiny}>SERVICE LEVEL · MT-0777</text><text y="24" className={s.big}>7 h 17 m remaining</text><text y="40" className={s.tiny}>TARGET 14:45 · ESCALATE IF NOT STARTED BY 14:20 → R. IYER · CHECK EVERY 60 s</text></g>}
      {step === 6 && <g className={s.rise} style={at(.6)}><text className={s.tiny}>COMPLETION</text><text y="24" className={s.big}>14:36 · 11 min · SLA met</text><text y="40" className={s.tiny}>CNC-M2 VIBRATION 1.9 mm/s · STOCK NOW 3 · POSTED TO TL-L2</text></g>}
    </g>
    {step === 6 && <path d="M455 160V190" pathLength={1} className={s.draw} style={at(1.6, .8)} />}
  </Paper>;
}
