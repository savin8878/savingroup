import type { CSSProperties } from "react";
import { Paper, Pivot, Tick, at } from "./primitives";
import s from "./Scene.module.css";

const STATE = ["RUNNING", "RUNNING", "WARNING", "STOPPED", "RUNNING · 80 %", "RUNNING"];
const VIB = ["2.1", "4.8", "4.8", "0.2", "3.9", "3.9"];
const TEMP = ["46", "61", "61", "58", "55", "54"];
const WEAR = ["78", "89", "92", "92", "92", "92"];
/** Needle angle for each stage, and the angle it sweeps from. 0 mm/s = −135°, 8 mm/s = +135°. */
const ANGLE = [-64, 27, 27, -128, -3, -3];
const FROM = [-135, -64, 27, 27, -128, -3];
const TREND = [0.2, 0.45, 0.6, 0.75, 0.9, 1];
const FOOT = ["CYCLE 412 · OP 20 FINISH BORE · ALL READINGS IN WINDOW", "READINGS TAGGED WITH CYCLE 412 AND WO-0318", "LIMIT 4.5 mm/s · WEAR LIMIT 90 % · 3 CONSECUTIVE SAMPLES", "STOP LOGGED ON THE PANEL WITH A REASON CODE", "COUNTERS UPDATE IN PLACE · OEE ATTRIBUTED TO RC-14", "THE EVENT LEAVES THE MACHINE FOR EDGE GATEWAY EG-02"];

/** Line 2, CNC-M2: a running spindle, a live vibration gauge, tag readouts, a stop-reason stamp and the emitted event. */
export function MachineScene({ step }: { step: number }) {
  const running = step !== 3;
  const shake = step === 1 ? 1.2 : step === 2 ? 2.2 : step >= 4 ? 0.6 : 0;
  return <Paper id="machine" step={step} title="LINE 2 / CNC-M2 / SPINDLE S1" code="WO-0318 · DRV-240 HOUSING" foot={FOOT[step]}>
    {/* Machine body */}
    <g transform="translate(48 120)">
      <rect width="280" height="200" className={s.boxPaper} />
      <rect width="280" height="22" className={s.boxSoft} />
      <text x="10" y="15" className={s.small}>CNC-M2 · VERTICAL MACHINING CENTRE</text>
      <text x="270" y="15" textAnchor="end" className={s.tiny}>S7-1500</text>
      <rect x="16" y="36" width="170" height="130" className={s.glass} />
      <path d="M16 166h170M30 176h142" className={s.line} />
      {/* Fixture and workpiece */}
      <rect x="34" y="150" width="134" height="7" className={s.boxSoft} />
      <rect x="46" y="128" width="110" height="22" className={s.boxPaper} />
      <text x="101" y="143" textAnchor="middle" className={s.tiny}>DRV-240 HOUSING</text>
      {/* Spindle head with rotor and tool */}
      <g transform="translate(70 40)"><g className={shake ? s.shake : undefined} style={{ "--amp": `${shake}px` } as CSSProperties}>
        <rect x="-18" y="0" width="36" height="34" className={s.boxSoft} />
        <path d="M-18 8h36M-18 26h36" className={s.line} />
        <g transform="translate(0 50)"><g className={running ? s.spin : undefined} style={{ "--dur": step >= 4 ? "2.4s" : "1.4s" } as CSSProperties}><circle r="15" className={s.muted} /><circle r="4" className={s.mutedFill} /><path d="M0-15V15M-15 0H15M-10.6-10.6l21.2 21.2M10.6-10.6l-21.2 21.2" className={s.muted} /></g></g>
        <rect x="-4" y="66" width="8" height="20" className={s.boxSoft} />
        <path d="M-4 86l4 6 4-6Z" className={s.accentFill} />
        {running && [0, .22, .44].map((d, i) => <g key={i} transform="translate(2 92)"><circle r="1.4" className={`${s.accentFill} ${s.chip}`} style={at(d)} /></g>)}
      </g></g>
      {/* Andon stack */}
      <g transform="translate(232 36)">
        <path d="M6 0v70" className={s.muted} />
        {[["STOP", step === 3], ["WARN", step === 2], ["RUN", running && step !== 2]].map(([label, lit], i) => <g key={String(label)} transform={`translate(0 ${6 + i * 20})`}><rect x="-1" width="14" height="14" className={lit ? s.lampOn : s.lamp} /><text x="20" y="10" className={s.tiny}>{label}</text></g>)}
        {step === 2 && <rect x="-1" y="26" width="14" height="14" className={`${s.lampOn} ${s.blink}`} />}
      </g>
      {/* Operator panel */}
      <g transform="translate(200 118)">
        <rect width="68" height="60" className={s.box} />
        <text x="6" y="12" className={s.tiny}>PANEL</text>
        <text x="6" y="26" className={s.tiny}>CYCLE 412</text>
        <text x="6" y="38" className={s.tiny}>FEED {step >= 4 ? "80 %" : "100 %"}</text>
        <text x="6" y="50" className={`${s.tiny} ${step >= 2 ? s.accentText : ""}`}>{step === 2 ? "WRN-M2-0071" : step === 3 ? "RC-14 TOOL WEAR" : step >= 4 ? "STP-M2-0219" : "T07 · OK"}</text>
      </g>
      {/* Feet and antenna */}
      <path d="M20 200v10h24v-10M236 200v10h24v-10" className={s.muted} />
      <path d="M262 0v-14" className={s.muted} /><circle cx="262" cy="-16" r="2.4" className={s.accentFill} />
      {step === 5 && [0, .6, 1.2].map((d) => <g key={d} transform="translate(262 -16)"><circle r="10" className={`${s.accent} ${s.pulse}`} style={at(d)} /></g>)}
    </g>

    {/* Tag readouts */}
    <g transform="translate(360 56)">
      <rect width="170" height="100" className={s.box} />
      <text x="10" y="15" className={s.small}>TAG READOUTS · 250 ms</text>
      <path d="M0 22h170" className={s.line} />
      {[["M2.STATE", STATE[step], step === 2 || step === 3 || step === 4], ["M2.VIB mm/s", VIB[step], step === 1 || step === 3 || step === 4], ["M2.TEMP °C", TEMP[step], step === 1], ["T07.WEAR %", WEAR[step], step === 1 || step === 2]].map(([label, value, changed], i) => <g key={String(label)} transform={`translate(0 ${38 + i * 18})`}>
        <text x="10" y="0" className={s.tiny}>{label}</text>
        <text x="160" y="0" textAnchor="end" className={`${s.label} ${changed ? s.accentText : ""} ${changed ? s.rise : ""}`} style={at(.3 + i * .15)}>{value}</text>
      </g>)}
    </g>

    {/* Gauge */}
    <g transform="translate(445 250)">
      <path d="M-43.8 43.8A62 62 0 1 1 43.8 43.8" className={s.line} />
      <path d="M18 -59.3A62 62 0 0 1 43.8 43.8" className={s.accentBand} />
      {[-135, -67.5, 0, 67.5, 135].map((a) => <path key={a} d="M0 -62V-56" className={s.muted} transform={`rotate(${a})`} />)}
      <path d="M0 -68V-50" className={`${s.accent} ${step === 2 ? s.blink : ""}`} transform="rotate(16.9)" />
      <text x="-46" y="58" className={s.tiny}>0</text><text x="46" y="58" textAnchor="end" className={s.tiny}>8</text>
      <text y="-74" textAnchor="middle" className={s.small}>VIBRATION S1</text>
      <g className={s.needle} style={{ "--from": `${FROM[step]}deg`, "--to": `${ANGLE[step]}deg` } as CSSProperties}><Pivot r={52} /><path d="M0 8V-50" className={s.needlePath} /><circle r="4" className={s.accentFill} /></g>
      <text y="30" textAnchor="middle" className={s.big}>{VIB[step]}</text>
      <text y="42" textAnchor="middle" className={s.tiny}>mm/s · limit 4.5</text>
      {step === 1 && <g transform="translate(78 -20)"><g className={s.rise} style={at(.8)}><text className={`${s.small} ${s.accentText}`}>TREND ↑</text><text y="12" className={s.tiny}>+2.7 in 3 min</text></g></g>}
    </g>

    {/* Shift counters */}
    <g transform="translate(560 56)">
      <rect width="190" height="100" className={s.box} />
      <text x="10" y="15" className={s.small}>SHIFT A · LINE 2 COUNTERS</text>
      <path d="M0 22h190" className={s.line} />
      <text x="10" y="40" className={s.tiny}>CYCLES</text><text x="10" y="58" className={s.value}>412</text>
      <text x="70" y="40" className={s.tiny}>DOWNTIME</text><text x="70" y="58" className={`${s.value} ${step >= 4 ? s.accentText : ""} ${step === 4 ? s.rise : ""}`} style={at(.6)}>{step >= 4 ? "14:10" : "10:30"}</text>
      <text x="135" y="40" className={s.tiny}>OEE</text><text x="135" y="58" className={`${s.value} ${step === 4 ? s.rise : ""}`} style={at(1)}>{step >= 4 ? "83.6 %" : "84.2 %"}</text>
      <rect x="10" y="72" width="170" height="4" className={s.track} />
      <rect x="10" y="72" width={170 * (step >= 4 ? .836 : .842)} height="4" className={`${s.accentFill} ${step === 4 ? s.barShift : ""}`} />
      {step === 4 && <g transform="translate(10 90)"><text className={`${s.tiny} ${s.accentText} ${s.rise}`} style={at(1.4)}>+03:40 DOWNTIME · ATTRIBUTED TO RC-14 · T07</text></g>}
    </g>

    {/* Trend strip */}
    <g transform="translate(560 190)">
      <text y="-8" className={s.tiny}>VIB TREND · LAST 6 MIN</text>
      <rect width="190" height="60" className={s.boxSoft} />
      <path d="M0 24.7H190" className={`${s.accent} ${s.dash}`} strokeWidth=".8" />
      <text x="186" y="21" textAnchor="end" className={s.tiny}>4.5</text>
      <path d="M0 48L20 47 40 48 56 40 72 30 86 22 98 16 114 13 122 13 128 48 142 48 154 33 171 30 190 30" pathLength={1} className={s.trend} style={{ "--offset": 1 - TREND[step], "--offset-from": 1 - (TREND[step - 1] ?? 0) } as CSSProperties} />
      {step === 2 && <g transform="translate(112 12)"><circle r="8" className={`${s.accent} ${s.pulse}`} /><circle r="2.5" className={s.accentFill} /></g>}
    </g>

    {/* Stage-specific overlays */}
    {step === 2 && <g transform="translate(150 244)"><g className={s.rise} style={at(.5)}>
      <path d="M-30 -36V-8H-6" className={s.accent} />
      <rect x="-6" y="-20" width="150" height="34" className={s.boxAccent} />
      <text x="4" y="-6" className={`${s.small} ${s.accentText}`}>TOOL WEAR ≥ 90 % · T07</text>
      <text x="4" y="7" className={s.tiny}>WRN-M2-0071 · 3 OF 3 SAMPLES</text>
    </g></g>}
    {step === 3 && <>
      <g transform="translate(150 220)"><g className={s.stamp} style={at(.6)}>
        <rect x="-82" y="-24" width="164" height="48" rx="2" transform="rotate(-6)" className={s.stampBox} />
        <text y="-4" textAnchor="middle" transform="rotate(-6)" className={`${s.label} ${s.accentText}`}>MINOR STOP · RC-14</text>
        <text y="11" textAnchor="middle" transform="rotate(-6)" className={`${s.tiny} ${s.accentText}`}>TOOL WEAR · LOGGED BY K. PATEL</text>
      </g></g>
      <g transform="translate(560 290)"><g className={s.rise} style={at(1.4)}>
        <text className={s.tiny}>STOP DURATION</text>
        <text y="26" className={s.big}>03:40</text>
        <text x="80" y="26" className={s.tiny}>INSPECTED · RESUMED AT 80 % FEED</text>
      </g></g>
    </>}
    {step === 4 && <g transform="translate(560 290)"><g className={s.rise} style={at(.4)}>
      <text className={s.tiny}>AVAILABILITY · PERFORMANCE · QUALITY</text>
      <text y="26" className={s.big}>96.3 · 91.4 · 95.0</text>
      <text y="42" className={s.tiny}>OEE 84.2 % → 83.6 % · FROM THE MACHINE'S OWN COUNTERS</text>
    </g></g>}
    {step === 5 && <g transform="translate(340 350)">
      <path d="M0 0H400" className={`${s.line} ${s.dash}`} />
      <path d="M0 0H400" pathLength={1} className={s.draw} style={at(.2, 3)} />
      <g className={s.travelX} style={{ "--tx": "300px", "--d": ".4s", "--dur": "3s" } as CSSProperties}><rect x="-2" y="-11" width="98" height="22" className={s.boxAccent} /><text x="47" y="4" textAnchor="middle" className={`${s.tiny} ${s.accentText}`}>EVT-M2-1187</text></g>
      <g transform="translate(400 0)"><g className={s.rise} style={at(3.2)}><text x="8" y="-6" className={s.small}>→ EDGE GATEWAY</text><text x="8" y="7" className={s.tiny}>EG-02 · RECEIVED 07:12:41.402</text></g></g>
      <Tick x={-14} y={0} delay={3.4} r={7} />
    </g>}
    {step === 0 && <g transform="translate(560 290)"><g className={s.rise} style={at(.4)}>
      <text className={s.tiny}>SPINDLE · FEED · PART</text>
      <text y="26" className={s.big}>6,200 rpm</text>
      <text y="42" className={s.tiny}>FEED 100 % · PART 12 OF 30 · WO-0318</text>
    </g></g>}
    {step === 1 && <g transform="translate(560 290)"><g className={s.rise} style={at(.4)}>
      <text className={s.tiny}>SPINDLE TEMP</text>
      <text y="26" className={s.big}>46 → 61 °C</text>
      <text y="42" className={s.tiny}>BEARING B1 · STILL WITHIN TOLERANCE</text>
    </g></g>}
  </Paper>;
}
