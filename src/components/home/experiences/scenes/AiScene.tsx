import type { CSSProperties } from "react";
import { Card, Paper, Person, Tick, at } from "./primitives";
import s from "./Scene.module.css";

const LINES: string[][] = [
  ["> event EVT-M2-1187 · TOOL_WEAR_STOP · CNC-M2", "  reading context …", "  ✓ maintenance.history   T07 changed 14 Sep (11 d ago)", "  ✓ stock.summary         4 inserts · min 12", "  ✓ work.order            WO-0318 · 30 units · due 27 Sep", "  ✓ calendar              Line 2 changeover 14:30", "  4 sources · CTX-0412 ready"],
  ["> plan", "  1. stock.check(T07 insert)        permitted", "  2. calendar.read(line2)           permitted", "  3. ticket.draft(maintenance)      permitted", "  ✕ purchase.submit                 denied by policy", "  ✕ machine.write                   denied by policy", "  budget ≤ 6 tool calls · policy ops-agent v2"],
  ["> call stock.check(T07 insert)", "  ← 4 on hand · min 12 · ERP inventory · 210 ms", "> call calendar.read(line2)", "  ← next changeover 14:30 · production calendar · 95 ms", "  2 / 2 succeeded · 0 errors · TC-0412-01/02 logged"],
  ["> draft REC-0412", "  1. replace T07 at 14:30 changeover", "  2. reorder 20 inserts (purchase requisition)", "  why: wear 92 % · 2.5 h to changeover · WO-0318 on time", "  risk: low · reduced feed until changeover", "  confidence 0.86 · not checked: supplier lead time", "  → review queue · nothing changed in the plant yet"],
  ["> await approval", "  boundary: maintenance + spend → human", "  reviewer: R. Iyer · maintenance lead", "  read 1 m 40 s · edits: none", "  ✓ approved 07:26 · APR-0412"],
  ["> log DEC-0412", "  recommendation REC-0412 · approval APR-0412", "  evidence CTX-0412 · TC-0412-01 · TC-0412-02", "  linked EVT-M2-1187 · WO-0318", "  model / policy: ops-agent v2", "  → automation trigger WF-14"],
];
const TOOLS: [string, string][] = [["stock.check", "ERP"], ["calendar.read", "CAL"], ["ticket.draft", "CMMS"], ["purchase.submit", "DENIED"]];
const FOOT = ["THE AGENT SEES ONLY THE RECORDS ITS ROLE MAY READ", "PERMISSIONS ARE ENFORCED BY THE TOOL GATEWAY, NOT THE PROMPT", "EVERY TOOL CALL IS LOGGED WITH INPUTS AND OUTPUTS", "A DRAFT IS A PROPOSAL · NOTHING HAS CHANGED IN THE PLANT", "THE APPROVAL BOUNDARY IS A RULE OF THE WORKFLOW", "REASONING TRAVELS WITH THE DECISION"];

/** An agent console typing its steps, a tool gateway with permissions, and the human approval boundary. */
export function AiScene({ step }: { step: number }) {
  return <Paper id="ai" step={step} title="AGENT / AG-OPS / ops-agent v2" code="EVT-M2-1187 → REC-0412" foot={FOOT[step]}>
    {/* Console */}
    <g transform="translate(40 56)">
      <rect width="360" height="300" className={s.boxSoft} />
      <rect width="360" height="22" className={s.box} />
      <circle cx="12" cy="11" r="3" className={s.accentFill} /><circle cx="24" cy="11" r="3" className={s.mutedFill} /><circle cx="36" cy="11" r="3" className={s.mutedFill} />
      <text x="50" y="15" className={s.small}>AGENT CONSOLE · AG-OPS</text>
      <text x="350" y="15" textAnchor="end" className={s.tiny}>STEP 0{step + 1} / 06</text>
      {LINES[step].map((line, i) => <text key={line} x="12" y={44 + i * 16} className={`${s.tiny} ${line.startsWith(">") ? s.accentText : line.includes("✕") ? s.mutedText : ""} ${s.slideIn}`} style={at(.2 + i * .35)}>{line}</text>)}
      <g transform={`translate(12 ${52 + LINES[step].length * 16})`}><rect width="5" height="9" className={`${s.accentFill} ${s.blink}`} /></g>
    </g>

    {/* Tool gateway */}
    <Card x={430} y={56} w={320} h={124} title="TOOL GATEWAY (MCP) · PERMISSIONS · ops-agent v2">
      {TOOLS.map(([tool, system], i) => {
        const denied = i === 3;
        const active = step === 1 ? i < 3 : step === 2 ? i < 2 : false;
        return <g key={tool} transform={`translate(10 ${40 + i * 20})`}>
          <circle cx="4" cy="-3" r="3" className={denied ? s.lamp : active ? `${s.lampOn} ${s.wave}` : s.lamp} style={at(i * .3)} />
          <text x="14" className={`${s.tiny} ${denied ? s.mutedText : s.inkFill}`}>{tool}</text>
          {denied && <path d="M14 -3H92" className={s.muted} strokeWidth=".8" />}
          <text x="140" className={`${s.tiny} ${denied ? s.accentText : ""}`}>{denied ? "✕ DENIED" : system}</text>
          {step === 2 && i < 2 && <text x="300" textAnchor="end" className={`${s.tiny} ${s.accentText} ${s.slideIn}`} style={at(1 + i * 1.2)}>{i === 0 ? "← 4 on hand · 210 ms" : "← 14:30 · 95 ms"}</text>}
          {step === 1 && !denied && <Tick x={292} y={-3} r={5} delay={.6 + i * .3} />}
        </g>;
      })}
    </Card>
    {step === 2 && [0, 1.2].map((d, i) => <g key={d} transform={`translate(400 ${96 + i * 20})`}><g className={s.loopX} style={{ "--d": `${d}s`, "--dur": "1.4s", "--tx": "30px" } as CSSProperties}><path d="M0 0h8m-3-3 3 3-3 3" className={s.accent} /></g></g>)}

    {/* Lower-right panel */}
    {step === 0 && <Card x={430} y={200} w={320} h={156} title="CONTEXT · CTX-0412 · 4 SOURCES">
      {[["EVENT", "TOOL_WEAR_STOP · T07 · 92 %"], ["MAINTENANCE", "T07 changed 14 Sep · 11 d ago"], ["STOCK", "4 inserts · minimum 12"], ["WORK ORDER", "WO-0318 · 30 units · due 27 Sep"], ["CALENDAR", "changeover 14:30 today"]].map(([label, value], i) => <g key={label} transform={`translate(10 ${42 + i * 22})`}><g className={s.rise} style={at(.6 + i * .45)}><rect y="-11" width="300" height="17" className={i === 0 ? s.boxAccent : s.boxPaper} /><text x="8" className={`${s.tiny} ${i === 0 ? s.accentText : ""}`}>{label}</text><text x="292" textAnchor="end" className={s.tiny}>{value}</text></g></g>)}
    </Card>}
    {step === 1 && <Card x={430} y={200} w={320} h={156} title="PLAN · PLN-0412 · WITHIN POLICY">
      {["stock.check(T07 insert)", "calendar.read(line2)", "ticket.draft(maintenance)"].map((line, i) => <g key={line} transform={`translate(10 ${44 + i * 20})`}><g className={s.slideIn} style={at(.5 + i * .4)}><text className={s.tiny}>0{i + 1}</text><text x="20" className={s.label}>{line}</text></g></g>)}
      <g transform="translate(10 118)"><g className={s.rise} style={at(2)}><rect y="-11" width="300" height="30" className={s.boxTint} /><text x="8" className={`${s.tiny} ${s.accentText}`}>BOUNDARY</text><text x="8" y="12" className={s.tiny}>purchase.submit · machine.write → not permitted · budget ≤ 6 calls</text></g></g>
    </Card>}
    {step === 2 && <Card x={430} y={200} w={320} h={156} title="TOOL CALLS · TC-0412">
      {[["stock.check", "T07 insert → 4 on hand · min 12", "ERP inventory · 07:19:02", 210], ["calendar.read", "line2 → changeover 14:30", "production calendar · 07:19:03", 95]].map(([tool, result, source, ms], i) => <g key={String(tool)} transform={`translate(10 ${44 + i * 46})`}><g className={s.rise} style={at(.8 + i * 1.2)}>
        <text className={`${s.label} ${s.accentText}`}>{tool}</text><text x="300" textAnchor="end" className={s.tiny}>{ms} ms</text>
        <text y="14" className={s.tiny}>{result}</text><text y="26" className={s.tiny}>{source}</text>
        <rect y="30" width="300" height="3" className={s.track} /><rect y="30" width={Number(ms) * 1.2} height="3" className={`${s.accentFill} ${s.growX}`} style={at(1 + i * 1.2)} />
      </g></g>)}
      <text x="10" y="146" className={s.tiny}>2 / 2 SUCCEEDED · 0 ERRORS</text>
    </Card>}
    {step === 3 && <Card x={430} y={200} w={320} h={156} title="RECOMMENDATION · REC-0412 · DRAFT" accent className={s.rise} style={at(.4)}>
      <text x="10" y="42" className={s.label}>1 · Replace insert T07 at 14:30 changeover</text>
      <text x="10" y="58" className={s.label}>2 · Reorder 20 inserts (requisition)</text>
      <text x="10" y="76" className={s.tiny}>WHY · wear 92 % · 2.5 h to changeover · WO-0318 stays on time</text>
      <text x="10" y="88" className={s.tiny}>RISK · low · reduced feed until changeover</text>
      <text x="10" y="112" className={s.tiny}>CONFIDENCE</text>
      <rect x="80" y="108" width="180" height="4" className={s.track} /><rect x="80" y="108" width={180 * .86} height="4" className={`${s.accentFill} ${s.growX}`} style={at(1.2, 1.6)} />
      <text x="310" y="112" textAnchor="end" className={`${s.label} ${s.accentText}`}>0.86</text>
      <text x="10" y="134" className={s.tiny}>NOT CHECKED · supplier lead time</text>
      <g transform="translate(240 40)"><g className={s.stamp} style={at(2.6)}><rect x="-10" y="-10" width="70" height="16" className={s.boxTint} /><text x="25" y="1" textAnchor="middle" className={`${s.tiny} ${s.accentText}`}>TO REVIEW</text></g></g>
    </Card>}
    {step === 4 && <g transform="translate(430 200)">
      <rect width="320" height="156" className={s.box} />
      <text x="10" y="15" className={s.small}>APPROVAL BOUNDARY · APR-0412</text><path d="M0 22H320" className={s.line} />
      <path d="M160 30V148" className={`${s.accent} ${s.dash}`} />
      <text x="20" y="44" className={s.tiny}>AGENT SIDE</text>
      <g transform="translate(20 60)"><rect width="120" height="60" className={s.boxTint} /><text x="8" y="14" className={`${s.tiny} ${s.accentText}`}>REC-0412</text><text x="8" y="28" className={s.tiny}>replace at 14:30</text><text x="8" y="40" className={s.tiny}>reorder 20 inserts</text><text x="8" y="52" className={s.tiny}>confidence 0.86</text></g>
      <g transform="translate(160 90)">{[0, .8].map((d) => <g key={d} className={s.loopX} style={{ "--d": `${d}s`, "--dur": "1.8s", "--tx": "18px" } as CSSProperties}><path d="M-8 0h8m-3-3 3 3-3 3" className={s.accent} /></g>)}</g>
      <text x="190" y="44" className={s.tiny}>HUMAN SIDE</text>
      <Person x={205} y={78} accent />
      <text x="222" y="72" className={s.label}>R. Iyer</text><text x="222" y="84" className={s.tiny}>Maintenance lead</text>
      <text x="190" y="108" className={s.tiny}>read 1 m 40 s · edits: none</text>
      <g transform="translate(250 128)"><g className={s.stamp} style={at(2.4)}><rect x="-50" y="-11" width="100" height="22" transform="rotate(-4)" className={s.stampBox} /><text y="4" textAnchor="middle" transform="rotate(-4)" className={`${s.small} ${s.accentText}`}>APPROVED 07:26</text></g></g>
    </g>}
    {step === 5 && <Card x={430} y={200} w={320} h={156} title="DECISION LOG · DEC-0412" accent className={s.rise} style={at(.3)}>
      {[["Recommendation", "REC-0412"], ["Approved by", "R. Iyer · 07:26 · APR-0412"], ["Evidence", "CTX-0412 · TC-0412-01 · TC-0412-02"], ["Linked", "EVT-M2-1187 · WO-0318"], ["Policy", "ops-agent v2 · 4 tool calls"]].map(([label, value], i) => <g key={label} transform={`translate(10 ${42 + i * 17})`}><g className={s.slideIn} style={at(.6 + i * .3)}><text className={s.tiny}>{label}</text><text x="300" textAnchor="end" className={s.tiny}>{value}</text><path d="M0 5H300" className={s.line} strokeWidth=".5" /></g></g>)}
      <g transform="translate(10 140)"><g className={s.rise} style={at(2.4)}><text className={`${s.tiny} ${s.accentText}`}>→ WORKFLOW WF-14 · TRIGGER ACCEPTED 07:26:12</text></g></g>
      <Tick x={296} y={12} r={7} delay={2} />
    </Card>}
  </Paper>;
}
