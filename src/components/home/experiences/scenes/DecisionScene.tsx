import type { CSSProperties } from "react";
import { Paper, Person, Tick, at } from "./primitives";
import s from "./Scene.module.css";

const OPTIONS = [
  { id: "A", name: "RUN TO FAILURE", cost: "₹0 now", stop: "0 min now", risk: "HIGH", costBar: .02, riskBar: 1, order: "AT RISK" },
  { id: "B", name: "REPLACE NOW", cost: "₹9,500", stop: "25 min", risk: "LOW", costBar: .23, riskBar: .1, order: "ON TIME" },
  { id: "C", name: "REPLACE AT 14:30", cost: "₹1,800", stop: "0 min", risk: "LOW", costBar: .043, riskBar: .1, order: "ON TIME" },
];
const FOOT = ["THE DECISION-MAKER NEVER HAS TO GO LOOKING FOR THE FACTS", "SAME COST MODEL AS THE P&L TILE · PLANT RATES", "A WRITTEN REASON CAN BE REVIEWED, LEARNED FROM AND DEFENDED", "DISPATCH IS THE AUTOMATION STAGE, SEEN FROM THE DECISION'S SIDE", "OUTCOMES CLOSE THE LOOP BETWEEN DECIDED AND HAPPENED", "A MACHINE SIGNAL HAS BECOME A RULE THE BUSINESS RUNS ON"];

/** An alert with context, three priced options, a decision stamp, dispatch, an outcome tracker and the rule that closes the loop. */
export function DecisionScene({ step }: { step: number }) {
  return <Paper id="decision" step={step} dots title="DECISION / ALT-0412 / CNC-M2 TOOL WEAR" code="DEC-0412 · R. IYER" foot={FOOT[step]}>
    {/* Alert card */}
    <g transform="translate(40 56)">
      <rect width="300" height="100" className={step === 0 ? s.boxAccent : s.box} />
      <g transform="translate(12 13)"><circle r="3.5" className={s.accentFill} />{step === 0 && <circle r="6" className={`${s.accent} ${s.pulse}`} />}</g>
      <text x="22" y="16" className={s.small}>ALERT · ALT-0412 · {step >= 2 ? "DECIDED" : "NEEDS A DECISION"}</text>
      <path d="M0 24H300" className={s.line} />
      {[["WEAR", "92 % (limit 90)"], ["STOCK", "4 inserts / min 12"], ["WO-0318", "30 units · due 27 Sep"], ["CHANGEOVER", "14:30 today"], ["AGENT", "REC-0412 → option C"], ["STOP", "03:40 · RC-14"]].map(([label, value], i) => <g key={label} transform={`translate(${10 + (i % 2) * 148} ${42 + Math.floor(i / 2) * 20})`}><g className={step === 0 ? s.rise : undefined} style={at(.4 + i * .3)}><rect y="-11" width="136" height="16" className={i === 4 ? s.boxTint : s.boxPaper} /><text x="6" className={s.tiny}>{label}</text><text x="130" textAnchor="end" className={`${s.tiny} ${i === 4 ? s.accentText : ""}`}>{value}</text></g></g>)}
    </g>

    {/* Option cards */}
    {OPTIONS.map((option, i) => {
      const chosen = option.id === "C";
      const shown = step >= 1;
      const emphasis = step >= 2 ? (chosen ? s.boxAccent : s.box) : step === 1 && chosen ? s.boxAccent : s.box;
      return <g key={option.id} transform={`translate(${40 + i * 175} 176)`}><g className={step === 1 ? s.rise : undefined} style={at(.3 + i * .5)}>
        <rect width="160" height="136" className={shown ? emphasis : `${s.boxPaper} ${s.dim}`} strokeDasharray={shown ? undefined : "4 3"} />
        <text x="10" y="16" className={`${s.label} ${chosen && step >= 1 ? s.accentText : ""}`}>{option.id} · {option.name}</text>
        <path d="M0 24H160" className={s.line} />
        {shown && <>
          <text x="10" y="40" className={s.tiny}>COST</text><text x="150" y="40" textAnchor="end" className={s.label}>{option.cost}</text>
          <rect x="10" y="45" width="140" height="4" className={s.track} /><rect x="10" y="45" width={Math.max(3, 140 * option.costBar)} height="4" className={`${s.accentFill} ${step === 1 ? s.growX : ""}`} style={at(1 + i * .5, 1.2)} />
          <text x="10" y="64" className={s.tiny}>RISK TO WO-0318</text><text x="150" y="64" textAnchor="end" className={`${s.label} ${option.risk === "HIGH" ? s.accentText : ""}`}>{option.risk}</text>
          <rect x="10" y="69" width="140" height="4" className={s.track} /><rect x="10" y="69" width={Math.max(3, 140 * option.riskBar)} height="4" className={`${option.risk === "HIGH" ? s.accentFill : s.mutedFill} ${step === 1 ? s.growX : ""}`} style={at(1.3 + i * .5, 1.2)} />
          <text x="10" y="88" className={s.tiny}>STOP {option.stop}</text><text x="150" y="88" textAnchor="end" className={s.tiny}>{option.id === "A" ? "RISK ₹42,000" : "ORDER " + option.order}</text>
          <text x="10" y="104" className={s.tiny}>{option.id === "A" ? "SCRAP + UNPLANNED STOP" : option.id === "B" ? "AVOIDABLE STOP NOW" : "NO STOP · INSERT FROM STOCK"}</text>
          {chosen && step === 1 && <g transform="translate(10 122)"><g className={s.rise} style={at(3)}><rect y="-10" width="140" height="14" className={s.boxTint} /><text x="70" y="1" textAnchor="middle" className={`${s.tiny} ${s.accentText}`}>RECOMMENDED · REC-0412</text></g></g>}
          {chosen && step >= 2 && <g transform="translate(80 120)"><g className={step === 2 ? s.stamp : undefined} style={at(.8)}><rect x="-60" y="-11" width="120" height="22" rx="2" transform="rotate(-5)" className={s.stampBox} /><text y="4" textAnchor="middle" transform="rotate(-5)" className={`${s.small} ${s.accentText}`}>DECIDED · C · 07:26</text></g></g>}
          {!chosen && step >= 2 && <path d="M10 122h140" className={s.muted} strokeDasharray="2 3" />}
        </>}
        {!shown && <text x="80" y="80" textAnchor="middle" className={s.tiny}>OPTION {option.id}</text>}
      </g></g>;
    })}

    {/* Decision owner and reasoning */}
    {step >= 2 && <g transform="translate(40 330)"><g className={step === 2 ? s.rise : undefined} style={at(2)}>
      <Person x={10} y={16} accent />
      <text x="26" y="12" className={s.label}>R. Iyer · Maintenance lead · 07:26</text>
      <text x="26" y="26" className={s.tiny}>REASON · STABLE AT 80 % FEED · 2.5 H TO CHANGEOVER · WO-0318 ON TIME</text>
      <text x="26" y="38" className={s.tiny}>INFORMED · S. RAO, PLANT HEAD · REJECTED A (RISK) · B (AVOIDABLE STOP)</text>
    </g></g>}
    {step === 1 && <g transform="translate(40 340)"><g className={s.rise} style={at(2.2)}><text className={s.tiny}>PLANT COST MODEL · INSERT ₹1,800 · LINE 2 ₹380 / MIN · SCRAP DRV-240 ₹27,000 · SAMPLE RATES</text></g></g>}

    {/* Right column */}
    {step === 0 && <g transform="translate(580 56)"><g className={s.rise} style={at(1.6)}>
      <rect width="170" height="100" className={s.boxPaper} />
      <text x="10" y="16" className={s.tiny}>ATTACHED SOURCES</text>
      {["EVT-M2-1187 · machine event", "CTX-0412 · agent context", "REC-0412 · recommendation", "CMP-0412 · cost comparison"].map((line, i) => <text key={line} x="10" y={34 + i * 16} className={`${s.tiny} ${s.slideIn}`} style={at(2 + i * .3)}>{line}</text>)}
    </g></g>}
    {step === 3 && <>
      {[["MT-0777", "V. Naik · 14:30", 190], ["PR-0242", "20 inserts → purchasing", 250], ["WHATSAPP", "M. Deshmukh · 07:27", 310]].map(([code, detail, y], i) => <g key={String(code)}>
        <path d={`M550 244H570V${Number(y) + 16}H580`} pathLength={1} className={s.draw} style={at(.3 + i * .4, 1)} />
        <g transform="translate(550 244)"><circle r="3.5" className={`${s.accentFill} ${s.motion}`} style={{ offsetPath: `path("M0 0H20V${Number(y) + 16 - 244}H30")`, "--d": `${.6 + i * .5}s`, "--dur": "2s" } as CSSProperties} /></g>
        <g transform={`translate(580 ${y})`}><g className={s.rise} style={at(1 + i * .4)}><rect width="170" height="34" className={s.box} /><text x="10" y="14" className={`${s.label} ${s.accentText}`}>{code}</text><text x="10" y="27" className={s.tiny}>{detail}</text><Tick x={154} y={17} r={6} delay={1.6 + i * .4} /></g></g>
      </g>)}
      <text x="580" y="176" className={s.tiny}>DISPATCHED 07:26:12 · WF-14 · RUN-0931</text>
    </>}
    {step === 4 && <g transform="translate(580 176)"><g className={s.rise} style={at(.3)}>
      <rect width="170" height="156" className={s.boxAccent} />
      <text x="10" y="16" className={`${s.tiny} ${s.accentText}`}>OUTCOME · DEC-0412</text>
      <path d="M0 24H170" className={s.line} />
      {["No unplanned stop", "Replaced 14:36 · V. Naik", "Vibration 1.9 mm/s", "Spend ₹1,800", "WO-0318 shipped 27 Sep"].map((line, i) => <g key={line} transform={`translate(10 ${42 + i * 18})`}><Tick x={6} y={-3} r={5} delay={.8 + i * .4} /><text x="18" className={s.tiny}>{line}</text></g>)}
      <text x="10" y="148" className={`${s.label} ${s.accentText}`}>₹40,200 avoided vs A</text>
    </g></g>}
    {step === 5 && <>
      <g transform="translate(580 56)"><g className={s.rise} style={at(1.6)}>
        <rect width="170" height="100" className={s.boxAccent} />
        <text x="10" y="16" className={`${s.tiny} ${s.accentText}`}>RULE R-23 · v8 · S. RAO</text>
        <path d="M0 24H170" className={s.line} />
        <text x="10" y="40" className={s.tiny}>IF wear ≥ 90 %</text>
        <text x="10" y="52" className={s.tiny}>AND changeover ≤ 4 h</text>
        <text x="10" y="66" className={`${s.tiny} ${s.accentText}`}>→ schedule replacement</text>
        <text x="10" y="78" className={s.tiny}>APPROVAL: PURCHASES ONLY</text>
        <text x="10" y="92" className={s.tiny}>ACTIVE FROM TOMORROW</text>
      </g></g>
      <g transform="translate(580 176)">
        <rect width="170" height="70" className={s.box} />
        <text x="10" y="16" className={s.tiny}>OUTCOME · ACHIEVED</text>
        <text x="10" y="34" className={s.label}>No unplanned stop</text>
        <text x="10" y="48" className={s.tiny}>₹1,800 · WO-0318 ON TIME</text>
        <Tick x={154} y={17} r={6} />
      </g>
      <path d="M750 200C780 200 780 106 750 106" pathLength={1} className={s.draw} style={at(.3, 1.4)} />
      <path d="M754 110l-4-4-4 4" className={s.accent} />
      <g transform="translate(580 270)"><g className={s.rise} style={at(2.2)}><text className={s.tiny}>NEXT TIME</text><text y="22" className={s.big}>Automatic</text><text y="38" className={s.tiny}>DECISION TIME 14 MIN → 0 · SAME BOUNDARY FOR SPEND</text></g></g>
      <path d="M340 106H380V80H580" pathLength={1} className={s.draw} style={at(2.4, 1.2)} />
    </>}
  </Paper>;
}
