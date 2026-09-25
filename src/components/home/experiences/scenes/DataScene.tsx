import type { CSSProperties } from "react";
import { Card, Paper, Tick, at } from "./primitives";
import s from "./Scene.module.css";

const STATIONS = ["INGEST", "VALIDATE", "DEDUPE", "JOIN", "TIMELINE", "API"];
const COUNTS = ["537 ROWS", "536 VALID · 1 QUARANTINED", "512 UNIQUE", "512 JOINED", "APPENDED", "200 OK"];
const FOOT = ["RAW ROWS ARE KEPT AS RECEIVED, SO ANY STEP CAN BE REPLAYED", "QUARANTINE KEEPS BAD ROWS VISIBLE INSTEAD OF DROPPING THEM", "IDEMPOTENT UPSERT · A REPLAY NEVER DOUBLES A DOWNTIME FIGURE", "JOINS REUSE THE ERP MASTERS · ONE DEFINITION OF A MACHINE", "APPEND-ONLY · THE AUDIT TRAIL FOR EVERYTHING THAT FOLLOWS", "ONE API · NOBODY RE-KEYS, NOBODY EXPORTS"];
const X = (i: number) => 90 + i * 124;

function Row({ delay, tx, duration = 2.2 }: { delay: number; tx: number; duration?: number }) {
  return <g className={s.loopX} style={{ "--d": `${delay}s`, "--dur": `${duration}s`, "--tx": `${tx}px` } as CSSProperties}><rect x="-13" y="-4" width="26" height="8" rx="1" className={s.accentFill} /></g>;
}

/** A six-station pipeline with rows moving through it, a quarantine bin, master-data joins, a timeline and an API fan-out. */
export function DataScene({ step }: { step: number }) {
  return <Paper id="data" step={step} title="PIPELINE / plant.line2.events / m2-events v3" code={COUNTS[step]} foot={FOOT[step]}>
    <path d="M46 150H754" className={s.line} />
    <path d={`M46 150H${X(step)}`} pathLength={1} className={s.draw} style={at(0, 1)} />
    {STATIONS.map((name, i) => <g key={name} transform={`translate(${X(i)} 150)`}>
      <rect x="-44" y="-26" width="88" height="52" className={i === step ? s.boxAccent : i < step ? s.box : s.boxPaper} />
      <text y="4" textAnchor="middle" className={`${s.label} ${i === step ? s.accentText : ""}`}>{name}</text>
      <text y="-38" textAnchor="middle" className={s.tiny}>0{i + 1}</text>
      {i < step && <Tick x={36} y={-20} r={7} />}
    </g>)}
    {/* Rows entering the current station */}
    <g transform={`translate(${step === 0 ? 10 : X(step - 1) + 44} 150)`}>{[0, .7, 1.4].map((d) => <Row key={d} delay={d} tx={step === 0 ? 36 : 36} />)}</g>

    {step === 0 && <>
      <Card x={46} y={220} w={250} h={120} title="RAW PAYLOAD · 412 B · JSON">
        {["{ \"machine\": \"CNC-M2\", \"line\": 2,", "  \"vib\": 4.8, \"temp\": 61, \"wear\": 92,", "  \"ts\": \"2026-09-25T07:12:41.250Z\",", "  \"type\": \"TOOL_WEAR_STOP\",", "  \"msg_id\": \"eg02-000001187\" }"].map((line, i) => <text key={line} x="10" y={38 + i * 14} className={`${s.tiny} ${s.slideIn}`} style={at(.3 + i * .25)}>{line}</text>)}
      </Card>
      <g transform="translate(330 250)"><g className={s.rise} style={at(1.2)}><text className={s.tiny}>INGEST BATCH ING-0925-0712</text><text y="24" className={s.big}>537 rows</text><text y="40" className={s.tiny}>WINDOW 07:12:41 – 07:15:06 · SOURCE EG-02 · TRUST: UNVALIDATED</text></g></g>
    </>}

    {step === 1 && <>
      <Card x={120} y={215} w={200} h={90} title="CHECKS · VAL-0712">
        {[["SCHEMA", "m2-events v3"], ["UNITS", "mm/s · °C · %"], ["TIMESTAMPS", "UTC ± 2 s"]].map(([label, value], i) => <g key={label} transform={`translate(10 ${40 + i * 16})`}><text className={s.tiny}>{label}</text><text x="70" className={s.tiny}>{value}</text><Tick x={172} y={-3} r={5} delay={.5 + i * .4} /></g>)}
      </Card>
      <g transform="translate(380 250)">
        <rect width="150" height="70" className={`${s.boxTint}`} strokeDasharray="4 4" />
        <text x="10" y="18" className={`${s.tiny} ${s.accentText}`}>QUARANTINE · Q-0712</text>
        <g className={s.rise} style={at(2.2)}><text x="10" y="40" className={s.label}>ROW 218</text><text x="10" y="54" className={s.tiny}>ts skew 41 min · for data steward</text></g>
      </g>
      <g transform="translate(214 176)"><g className={s.dropRow} style={{ "--tx": "290px", "--ty": "126px", "--d": ".4s" } as CSSProperties}><rect x="-13" y="-4" width="26" height="8" rx="1" className={s.accentFill} /></g></g>
      <g transform="translate(560 250)"><g className={s.rise} style={at(1)}><text className={s.tiny}>RESULT</text><text y="24" className={s.big}>536 / 537</text><text y="40" className={s.tiny}>PASSED · 0 REJECTED · 1 HELD</text></g></g>
    </>}

    {step === 2 && <>
      <g transform="translate(260 250)">
        <text x="-4" y="-16" className={s.tiny}>message_id + ts</text>
        <rect x="0" y="-6" width="60" height="14" rx="1" className={s.boxAccent} /><text x="30" y="4" textAnchor="middle" className={`${s.tiny} ${s.accentText}`}>eg02-001187</text>
        {[[68, .4], [136, .9], [204, 1.4]].map(([x, d]) => <g key={x} transform={`translate(${x} 0)`}><g className={s.merge} style={{ "--tx": `${-x}px`, "--d": `${d}s` } as CSSProperties}><rect y="-6" width="60" height="14" rx="1" className={s.boxSoft} /><text x="30" y="4" textAnchor="middle" className={s.tiny}>duplicate</text></g></g>)}
        <text x="0" y="30" className={s.tiny}>RESEND OVERLAP · 24 EXACT COPIES · IDEMPOTENT UPSERT</text>
      </g>
      <g transform="translate(560 250)"><g className={s.rise} style={at(1.8)}><text className={s.tiny}>UNIQUE ROWS</text><text y="24" className={s.big}>536 → 512</text><text y="40" className={s.tiny}>EVT-M2-1187 · EXACTLY ONE COPY</text></g></g>
      <Tick x={338} y={124} delay={2.4} r={8} />
    </>}

    {step === 3 && <>
      <path d="M462 176V210H340V236" pathLength={1} className={s.draw} style={at(.2, 1)} />
      <path d="M462 176V210H600V236" pathLength={1} className={s.draw} style={at(.2, 1)} />
      <text x="462" y="202" textAnchor="middle" className={`${s.tiny} ${s.accentText}`}>JOIN ON asset_id · wo_id</text>
      <Card x={250} y={236} w={180} h={84} title="WORK ORDER MASTER" className={s.rise} style={at(1)}>
        <text x="10" y="40" className={s.label}>WO-0318 · DRV-240 housing</text>
        <text x="10" y="54" className={s.tiny}>30 UNITS · DUE 27 SEP · SO-1142</text>
        <text x="10" y="68" className={s.tiny}>PURCHASE PR-0241 → PO-0089</text>
      </Card>
      <Card x={510} y={236} w={180} h={84} title="ASSET MASTER" className={s.rise} style={at(1.3)}>
        <text x="10" y="40" className={s.label}>CNC-M2 · Line 2 · S7-1500</text>
        <text x="10" y="54" className={s.tiny}>TOOL T07 · CNMG-12 · INSTALLED 14 SEP</text>
        <text x="10" y="68" className={s.tiny}>GATEWAY EG-02 · SHIFT A</text>
      </Card>
      <g transform="translate(46 250)"><g className={s.rise} style={at(2)}><text className={s.tiny}>ENRICHED</text><text y="24" className={s.big}>512 joined</text><text y="40" className={s.tiny}>PART · ORDER · CUSTOMER</text></g></g>
    </>}

    {step === 4 && <>
      <g transform="translate(46 262)">
        <text y="-22" className={s.tiny}>LINE 2 TIMELINE · TL-L2-0925 · APPEND-ONLY</text>
        <path d="M0 0H708" className={s.muted} />
        {Array.from({ length: 36 }, (_, i) => <path key={i} d={`M${i * 19.5} -4V4`} className={s.line} />)}
        <g transform="translate(400 0)"><g className={s.growX} style={{ "--dur": "1.6s", "--d": ".4s" } as CSSProperties}><rect x="0" y="-8" width="60" height="16" className={s.boxTint} /></g><text x="30" y="26" textAnchor="middle" className={`${s.tiny} ${s.accentText}`}>STOP 03:40 · RC-14</text></g>
        <g transform="translate(380 0)"><g className={s.pop} style={at(1.2)}><path d="M0 -22V-6" className={s.accent} /><circle cy="-24" r="3" className={s.accentFill} /><text y="-30" textAnchor="middle" className={s.tiny}>WRN-M2-0071</text></g></g>
        <g transform="translate(400 0)"><g className={s.pop} style={at(2)}><circle r="4" className={s.accentFill} /><text y="-14" textAnchor="middle" className={`${s.tiny} ${s.accentText}`}>EVT-M2-1187</text></g></g>
        <text x="0" y="44" className={s.tiny}>07:09</text><text x="708" y="44" textAnchor="end" className={s.tiny}>07:16</text>
        <text x="354" y="60" textAnchor="middle" className={s.tiny}>510 READINGS · 1 WARNING · 1 STOP INTERVAL · 1 EVENT · RETENTION 5 YEARS</text>
      </g>
    </>}

    {step === 5 && <>
      <path d="M710 176V214H690V226M710 214H690" className={s.line} />
      {[["ERP", "PR-0242 · stock", 0], ["AI AGENT", "context CTX-0412", 1], ["DASHBOARD", "tiles · 07:16", 2]].map(([name, use, i]) => <g key={String(name)} transform={`translate(560 ${226 + Number(i) * 46})`}>
        <path d={`M130 -${12 + Number(i) * 46}V12`} className={s.line} />
        <g className={s.rise} style={at(.6 + Number(i) * .5)}><rect width="180" height="36" className={s.box} /><text x="10" y="15" className={s.label}>{name}</text><text x="10" y="28" className={s.tiny}>{use}</text><Tick x={164} y={18} r={6} delay={1 + Number(i) * .5} /></g>
      </g>)}
      <g transform="translate(710 176)">{[0, 1, 2].map((i) => <circle key={i} r="3.5" className={`${s.accentFill} ${s.motion}`} style={{ offsetPath: `path("M0 0V38H-20V${226 + i * 46 + 6 - 176}H-30")`, "--d": `${i * .8}s`, "--dur": "2.4s" } as CSSProperties} />)}</g>
      <g transform="translate(46 236)"><g className={s.rise} style={at(.3)}>
        <text className={s.tiny}>REQUEST</text>
        <text y="22" className={s.value}>GET /v1/events/EVT-M2-1187</text>
        <text y="36" className={s.tiny}>Authorization: Bearer … · scope events:read</text>
        <text y="64" className={`${s.tiny} ${s.accentText}`}>RESPONSE</text>
        <text y="86" className={s.big}>200 OK · 38 ms</text>
        <text y="102" className={s.tiny}>event + asset + work order · ETag 30 s · p95 61 ms</text>
      </g></g>
    </>}
  </Paper>;
}
