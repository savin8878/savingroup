import type { CSSProperties, ReactNode } from "react";
import { Paper, Tick, at } from "./primitives";
import s from "./Scene.module.css";

const FOOT = ["EVERY NUMBER LINKS BACK TO THE EVENT THAT MOVED IT", "THE DRILL-DOWN READS THE SAME RECORDS AS THE TECHNICIAN'S TICKET", "COMPUTED FROM STOP INTERVALS WITH REASON CODES · NOTHING HAND-ENTERED", "SAMPLE FIGURES · THE MODEL USES YOUR RATES AND PART COSTS", "SAME DATA · SMALLER SCREEN · NOT A SEPARATE REPORT", "READ AT 07:31 · NOTHING NEEDS A PHONE CALL"];
const THIS_WEEK = "M0 52L48 40 96 46 144 30 192 26 240 20 288 14";
const LAST_WEEK = "M0 40L48 34 96 58 144 44 192 60 240 38 288 42";

function Tile({ x, label, children }: { x: number; label: string; children: ReactNode }) {
  return <g transform={`translate(${x} 34)`}><rect width="150" height="70" className={s.box} /><text x="10" y="15" className={s.tiny}>{label}</text>{children}</g>;
}

/** A browser-framed operations dashboard whose tiles tick, drill down and chart, plus a phone frame for the morning brief. */
export function DashboardScene({ step }: { step: number }) {
  return <Paper id="dashboard" step={step} title="OPERATIONS DASHBOARD / LINE 2 / 25 SEP" code="A. MEHTA · OWNER VIEW" foot={FOOT[step]}>
    {/* Browser frame */}
    <g transform="translate(40 52)" className={step >= 4 ? s.dim : undefined}>
      <rect width="500" height="318" className={s.boxPaper} />
      <rect width="500" height="22" className={s.box} />
      <circle cx="12" cy="11" r="3" className={s.mutedFill} /><circle cx="24" cy="11" r="3" className={s.mutedFill} /><circle cx="36" cy="11" r="3" className={s.mutedFill} />
      <rect x="50" y="5" width="200" height="12" className={s.boxSoft} /><text x="58" y="14" className={s.tiny}>ops.savin.app / line-2</text>
      <text x="490" y="14" textAnchor="end" className={s.tiny}>{step === 1 ? "LINE 2 › MACHINES" : step === 2 ? "LINE 2 › TREND · 7 D" : step === 3 ? "LINE 2 › P&L IMPACT" : "LINE 2 · LIVE 07:16"}</text>
      {/* Tiles */}
      <Tile x={12} label="OEE · SHIFT A">
        {step === 0 ? <>
          <text x="10" y="44" className={`${s.big} ${s.fadeOut}`} style={at(1.4)}>84.2 %</text>
          <text x="10" y="44" className={`${s.big} ${s.rise}`} style={at(1.6)}>83.6 %</text>
          <text x="140" y="44" textAnchor="end" className={`${s.tiny} ${s.accentText} ${s.rise}`} style={at(2)}>−0.6</text>
        </> : <><text x="10" y="44" className={s.big}>83.6 %</text><text x="140" y="44" textAnchor="end" className={`${s.tiny} ${s.accentText}`}>−0.6</text></>}
        <path d="M10 58L30 56 50 57 70 54 90 55 110 52 130 53 140 56" className={s.accent} strokeWidth="1" />
      </Tile>
      <Tile x={175} label="DOWNTIME · TODAY">
        <text x="10" y="44" className={s.big}>{step === 0 ? "14:10" : "14:10"}</text>
        <rect x="10" y="54" width="130" height="5" className={s.track} />
        <rect x="10" y="54" width="72" height="5" className={s.accentFill} />
        <rect x="82" y="54" width="26" height="5" className={`${s.accentFill} ${step === 0 ? s.growX : ""}`} style={at(1.2, 1.4)} />
        <text x="140" y="44" textAnchor="end" className={`${s.tiny} ${s.accentText}`}>+03:40</text>
      </Tile>
      <Tile x={338} label="ALERTS">
        <text x="10" y="44" className={s.big}>1</text>
        <text x="40" y="44" className={s.tiny}>TOOL WEAR · CNC-M2</text>
        <g transform="translate(128 26)"><circle r="7" className={`${s.accent} ${s.pulse}`} /><circle r="4" className={s.accentFill} /></g>
        <text x="10" y="58" className={s.tiny}>RC-14 · FIX PLANNED 14:30</text>
      </Tile>
      {/* Main panel */}
      <g transform="translate(12 116)">
        <rect width="476" height="190" className={s.box} />
        {step === 0 && <>
          <text x="10" y="15" className={s.tiny}>OEE BY LINE · SHIFT A</text>
          {[["LINE 1", .88, "88 %"], ["LINE 2", .836, "83.6 %"], ["LINE 3", .79, "79 %"]].map(([name, portion, label], i) => <g key={String(name)} transform={`translate(10 ${40 + i * 40})`}><text className={s.tiny}>{name}</text><rect y="8" width="380" height="8" className={s.track} /><rect y="8" width={380 * Number(portion)} height="8" className={`${i === 1 ? s.accentFill : s.mutedFill} ${s.growX}`} style={at(.3 + i * .3, 1.4)} /><text x="456" y="15" textAnchor="end" className={`${s.label} ${i === 1 ? s.accentText : ""}`}>{label}</text></g>)}
          <text x="10" y="176" className={s.tiny}>REFRESH EVERY 15 s · SOURCE TL-L2 · LAST EVENT EVT-M2-1187</text>
        </>}
        {step === 1 && <>
          <text x="10" y="15" className={`${s.tiny} ${s.accentText}`}>LINE 2 › MACHINES</text>
          {[["CNC-M1", "RUNNING", "88 %"], ["CNC-M2", "MINOR STOP 03:40 · RC-14 TOOL WEAR", "83.6 %"], ["CNC-M3", "RUNNING", "86 %"], ["CNC-M4", "CHANGEOVER", "79 %"]].map(([name, state, oee], i) => <g key={String(name)} transform={`translate(10 ${32 + i * 30})`}><g className={s.slideIn} style={at(.3 + i * .25)}>
            {i === 1 && <rect x="-4" y="-12" width="464" height="24" className={s.boxTint} />}
            <circle cx="6" cy="-3" r="3" className={i === 1 ? s.lampOn : s.lamp} />
            <text x="18" className={`${s.label} ${i === 1 ? s.accentText : ""}`}>{name}</text>
            <text x="90" className={s.tiny}>{state}</text>
            <text x="456" textAnchor="end" className={s.label}>{oee}</text>
          </g></g>)}
          <g transform="translate(10 160)"><g className={s.rise} style={at(1.8)}><rect y="-12" width="300" height="20" className={s.boxAccent} /><text x="8" y="1" className={`${s.tiny} ${s.accentText}`}>MT-0777 · REPLACE INSERT T07 · 14:30 · V. NAIK · ON TRACK</text></g></g>
        </>}
        {step === 2 && <>
          <text x="10" y="15" className={`${s.tiny} ${s.accentText}`}>DOWNTIME · THIS WEEK VS LAST WEEK</text>
          <g transform="translate(40 40)">
            <path d="M0 0V100M0 100H320" className={s.muted} />
            {["FRI", "SAT", "SUN", "MON", "TUE", "WED", "THU"].map((d, i) => <text key={d} x={i * 48} y="114" textAnchor="middle" className={s.tiny}>{d}</text>)}
            <g transform="translate(16 20)">
              <path d={LAST_WEEK} pathLength={1} className={`${s.drawMuted} ${s.dash}`} style={at(.4, 1.8)} />
              <path d={THIS_WEEK} pathLength={1} className={s.draw} style={at(.8, 2)} />
              <g transform="translate(288 14)"><g className={s.pop} style={at(2.8)}><circle r="4" className={s.accentFill} /><text x="10" y="3" className={`${s.tiny} ${s.accentText}`}>−40 %</text></g></g>
            </g>
          </g>
          <g transform="translate(380 50)"><path d="M0 0H14" className={s.accent} /><text x="20" y="3" className={s.tiny}>THIS WEEK 1 h 52 m</text><path d="M0 16H14" className={`${s.muted} ${s.dash}`} /><text x="20" y="19" className={s.tiny}>LAST WEEK 3 h 06 m</text><text y="44" className={s.tiny}>TOP REASON RC-14</text><text y="56" className={s.tiny}>THEN RC-03 MATERIAL</text></g>
        </>}
        {step === 3 && <>
          <text x="10" y="15" className={`${s.tiny} ${s.accentText}`}>DAILY P&L IMPACT · 25 SEP</text>
          {[["IF THE TOOL HAD FAILED MID-ORDER", 1, "₹42,000", false], ["ACTUAL · INSERT + TIME (OPTION C)", .043, "₹1,800", true]].map(([label, portion, amount, accent], i) => <g key={String(label)} transform={`translate(10 ${48 + i * 52})`}><text className={s.tiny}>{label}</text><rect y="8" width="340" height="14" className={s.track} /><rect y="8" width={Math.max(6, 340 * Number(portion))} height="14" className={`${accent ? s.accentFill : s.mutedFill} ${s.growX}`} style={at(.4 + i * .6, 1.6)} /><text x="456" y="20" textAnchor="end" className={`${s.value} ${accent ? s.accentText : ""}`}>{amount}</text></g>)}
          <g transform="translate(10 150)"><g className={s.rise} style={at(2.4)}><text className={s.big}>₹40,200 avoided</text><text x="200" y="0" className={s.tiny}>MARGIN IMPACT −0.2 % TODAY · WO-0318 DUE 27 SEP · ON TIME</text></g></g>
        </>}
        {step >= 4 && <>
          <text x="10" y="15" className={s.tiny}>DOWNTIME · THIS WEEK VS LAST WEEK</text>
          <g transform="translate(56 60)"><path d={LAST_WEEK} className={`${s.muted} ${s.dash}`} /><path d={THIS_WEEK} className={s.accent} /></g>
          <text x="10" y="176" className={s.tiny}>DESKTOP VIEW · SYNCED WITH MOBILE 07:29</text>
        </>}
      </g>
    </g>

    {/* Right column: source note or phone */}
    {step < 4 && <g transform="translate(600 60)"><g className={s.rise} style={at(.4)}>
      <text className={s.tiny}>SOURCE</text>
      <text y="22" className={s.label}>TL-L2 → tiles</text>
      <text y="36" className={s.tiny}>REFRESH 15 s</text>
      <text y="48" className={s.tiny}>EVT-M2-1187</text>
      <path d="M0 60H150" className={s.line} />
      <text y="80" className={s.tiny}>VIEWER</text>
      <text y="98" className={s.label}>A. Mehta</text>
      <text y="110" className={s.tiny}>OWNER · SSO</text>
      <path d="M0 122H150" className={s.line} />
      <text y="142" className={s.tiny}>{step === 0 ? "1 ALERT · 1 DECISION PENDING" : step === 1 ? "4 MACHINES · 1 STOPPED" : step === 2 ? "7 DAYS · 2 SERIES" : "SAMPLE COST MODEL"}</text>
    </g></g>}
    {step >= 4 && <g transform="translate(600 52)"><g className={step === 4 ? s.rise : undefined} style={at(.3)}>
      <rect width="150" height="318" rx="16" className={s.box} />
      <rect x="8" y="10" width="134" height="298" rx="10" className={s.boxSoft} />
      <rect x="55" y="15" width="40" height="5" rx="2.5" className={s.mutedFill} />
      <text x="16" y="36" className={s.label}>{step === 5 ? "07:30" : "07:29"}</text>
      <text x="134" y="36" textAnchor="end" className={s.tiny}>4G · 84 %</text>
      {step === 4 ? <>
        <text x="16" y="56" className={s.tiny}>LINE 2 · LIVE</text>
        {[["OEE", "83.6 %", "−0.6"], ["DOWNTIME", "14:10", "+03:40"], ["ALERTS", "1", "CNC-M2"]].map(([label, value, note], i) => <g key={String(label)} transform={`translate(16 ${66 + i * 56})`}><g className={s.rise} style={at(.8 + i * .4)}><rect width="118" height="46" className={s.box} /><text x="8" y="14" className={s.tiny}>{label}</text><text x="8" y="36" className={s.big}>{value}</text><text x="110" y="36" textAnchor="end" className={`${s.tiny} ${s.accentText}`}>{note}</text></g></g>)}
        <g transform="translate(16 238)"><g className={s.rise} style={at(2.2)}><text className={s.tiny}>7-DAY TREND</text><g transform="translate(0 12) scale(.41 .5)"><path d={LAST_WEEK} className={`${s.muted} ${s.dash}`} /><path d={THIS_WEEK} className={s.accent} /></g></g></g>
        <text x="75" y="300" textAnchor="middle" className={s.tiny}>SYNCED 07:29 · SAME DATA</text>
      </> : <>
        <g transform="translate(16 50)"><g className={s.rise} style={at(.6)}>
          <rect width="118" height="200" className={s.box} />
          <text x="8" y="16" className={`${s.tiny} ${s.accentText}`}>MORNING BRIEF · 25 SEP</text>
          <path d="M0 24H118" className={s.line} />
          {["Line 2 · 1 minor stop", "Fix planned 14:30 (MT-0777)", "WO-0318 · on time", "PO-0089 in transit", "PR-0242 raised · 20 inserts", "M. Deshmukh acknowledged", "1 decision needed →"].map((line, i) => <text key={line} x="8" y={40 + i * 18} className={`${s.tiny} ${i === 6 ? s.accentText : ""} ${s.slideIn}`} style={at(1 + i * .3)}>{line}</text>)}
          <path d="M0 176H118" className={s.line} />
          <text x="8" y="192" className={s.tiny}>NOTHING NEEDS A CALL</text>
        </g></g>
        <g transform="translate(16 264)"><g className={s.rise} style={at(3.6)}><text className={s.tiny}>READ</text><text y="14" className={s.label}>A. Mehta · 07:31</text><Tick x={104} y={6} r={7} delay={3.8} /></g></g>
      </>}
    </g></g>}
    {step === 5 && <g transform="translate(560 200)"><g className={s.pop} style={at(.2)}><path d="M-8 0h16m-6-6 6 6-6 6" className={s.accent} /></g></g>}
  </Paper>;
}
