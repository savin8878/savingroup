import type { CSSProperties } from "react";
import { Paper, Tick, at } from "./primitives";
import s from "./Scene.module.css";

const TAGS: [string, string][] = [["M2.State", "RUNNING"], ["M2.Vib", "4.8 mm/s"], ["M2.SpindleTemp", "61 °C"], ["T07.Wear", "92 %"]];
const BUFFER = ["2 %", "85 %", "0 %", "0 %", "0 %", "0 %"];
const FOOT = ["S7 / OPC UA · THE MACHINE DOES NOT NEED TO CHANGE", "STORE AND FORWARD · A BAD LINK DELAYS THE SIGNAL, IT DOES NOT DELETE IT", "REPLAY OLDEST FIRST · ORIGINAL TIMESTAMPS PRESERVED", "DEVICE CERTIFICATE EG-02 · VALID TO 2027 · REVOCABLE", "HEALTH USES THE SAME PIPE AS PRODUCTION DATA", "THREE TIMESTAMPS TRAVEL WITH THE MESSAGE"];

function Packet({ delay, duration = 2.4, tx, ty = 0, lock = false }: { delay: number; duration?: number; tx: number; ty?: number; lock?: boolean }) {
  return <g className={s.loopX} style={{ "--d": `${delay}s`, "--dur": `${duration}s`, "--tx": `${tx}px`, "--ty": `${ty}px` } as CSSProperties}>
    <rect x="-6" y="-4" width="12" height="8" className={lock ? s.boxAccent : s.accentFill} />
    {lock && <path d="M-2 0h4v3h-4Zm1 0v-1.5a1 1 0 0 1 2 0V0" className={s.accent} strokeWidth=".9" />}
  </g>;
}

/** PLC → edge gateway → cell link → cloud broker, with a buffer that fills during a dropout and drains when the link returns. */
export function IotScene({ step }: { step: number }) {
  const linkUp = step !== 1;
  return <Paper id="iot" step={step} dots title="EDGE / LINE 2 / EG-02 → CLOUD" code="EVT-M2-1187 · 537 MESSAGES" foot={FOOT[step]}>
    {/* PLC cabinet */}
    <g transform="translate(40 70)">
      <rect width="160" height="190" className={s.boxPaper} />
      <text x="10" y="15" className={s.small}>PLC · S7-1500 · CNC-M2</text>
      <path d="M0 22h160" className={s.line} />
      {TAGS.map(([tag, value], i) => <g key={tag} transform={`translate(0 ${44 + i * 24})`}>
        <circle cx="14" cy="-3" r="3" className={`${s.lampOn} ${s.wave}`} style={at(i * .25)} />
        <text x="24" className={s.tiny}>{tag}</text>
        <text x="150" textAnchor="end" className={s.label}>{value}</text>
      </g>)}
      <path d="M10 146h140" className={s.line} />
      <g transform="translate(10 160)"><rect width="140" height="20" className={s.boxAccent} /><text x="8" y="13" className={`${s.tiny} ${s.accentText}`}>EVT-M2-1187 · TOOL_WEAR_STOP</text></g>
      <text x="10" y="-8" className={s.tiny}>MACHINE CABINET · LINE 2</text>
    </g>

    {/* Poll link */}
    <g transform="translate(200 165)">
      <path d="M0 0H100" className={`${s.line} ${s.dash}`} />
      <text x="50" y="-8" textAnchor="middle" className={s.tiny}>POLL 250 ms</text>
      {[0, .8, 1.6].map((d) => <Packet key={d} delay={d} tx={100} />)}
    </g>

    {/* Edge gateway */}
    <g transform="translate(300 110)">
      <rect width="170" height="150" className={s.box} />
      <text x="10" y="15" className={s.small}>EDGE GATEWAY · EG-02</text>
      <path d="M0 22h170" className={s.line} />
      {/* Buffer gauge */}
      <text x="14" y="38" className={s.tiny}>BUFFER</text>
      <rect x="14" y="44" width="18" height="90" className={s.track} />
      {step === 1 && <rect x="14" y="57" width="18" height="77" className={`${s.accentFill} ${s.growY}`} style={{ "--dur": "4s" } as CSSProperties} />}
      {step === 2 && <rect x="14" y="57" width="18" height="77" className={`${s.accentFill} ${s.drain}`} style={{ "--to-scale": .03 } as CSSProperties} />}
      {(step === 0 || step > 2) && <rect x="14" y="131" width="18" height="3" className={s.accentFill} />}
      <text x="23" y="146" textAnchor="middle" className={`${s.tiny} ${s.accentText}`}>{BUFFER[step]}</text>
      {/* Status rows */}
      {[["LINK", linkUp ? (step === 0 || step === 1 ? "3G" : "4G · −71 dBm") : "LOST"], ["MQTT", "QoS 1"], ["TLS", step >= 3 ? "1.3 · CERT ✓" : "1.3"], ["HEARTBEAT", step >= 4 ? "07:15:30" : "30 s"]].map(([label, value], i) => <g key={label} transform={`translate(48 ${44 + i * 22})`}>
        <text className={s.tiny}>{label}</text>
        <text x="110" textAnchor="end" className={`${s.tiny} ${(!linkUp && i === 0) || (step === 3 && i === 2) || (step === 4 && i === 3) ? s.accentText : ""}`}>{value}</text>
        <path d="M0 6H110" className={s.line} strokeWidth=".6" />
      </g>)}
      <text x="48" y="140" className={s.tiny}>UPTIME 41 d 6 h · CPU 12 %</text>
      {/* Link lamp */}
      <g transform="translate(150 12)">
        <circle r="4.5" className={linkUp ? s.lampOn : s.lamp} />
        {step === 2 && <circle r="4.5" className={`${s.lampOn} ${s.blink}`} />}
        {!linkUp && <path d="M-3-3l6 6M3-3l-6 6" className={s.accent} strokeWidth="1.2" />}
      </g>
      {/* Antenna */}
      <path d="M150 0v-24" className={s.muted} /><circle cx="150" cy="-26" r="2.4" className={s.accentFill} />
    </g>

    {/* Radio arcs and uplink route */}
    <g transform="translate(450 84)">
      {[12, 20, 28].map((r, i) => <path key={r} d={`M${r * .7} ${-r * .7}A${r} ${r} 0 0 1 ${r * .7} ${r * .7}`} className={linkUp ? `${s.accent} ${s.wave}` : `${s.muted} ${s.dash} ${s.dim}`} style={at(i * .3)} />)}
      {!linkUp && <g transform="translate(40 0)"><path d="M-5-5l10 10M5-5l-10 10" className={`${s.accent} ${s.blink}`} strokeWidth="1.6" /><text x="12" y="4" className={`${s.tiny} ${s.accentText}`}>LINK LOST</text></g>}
      <path d="M32 0H150" className={`${s.line} ${s.dash}`} />
      {linkUp && step >= 2 && (step === 2 ? [0, .3, .6, .9, 1.2] : [0, 1.1]).map((d) => <g key={d} transform="translate(32 0)"><Packet delay={d} duration={step === 2 ? 1.4 : 2.6} tx={118} lock={step >= 3} /></g>)}
      {step === 0 && <g transform="translate(32 0)"><Packet delay={.4} duration={2.8} tx={118} /></g>}
      {step >= 3 && <g transform="translate(90 -14)"><g className={s.rise} style={at(.6)}><rect x="-22" y="-10" width="44" height="14" className={s.boxAccent} /><text textAnchor="middle" y="1" className={`${s.tiny} ${s.accentText}`}>TLS 1.3</text></g></g>}
    </g>

    {/* Cloud broker */}
    <g transform="translate(600 56)">
      <path d="M28 46a16 16 0 0 1 8-30 22 22 0 0 1 42-6 18 18 0 0 1 30 14 14 14 0 0 1-4 22Z" className={s.line} />
      <rect y="46" width="150" height="140" className={s.box} />
      <text x="10" y="61" className={s.small}>CLOUD BROKER</text>
      <text x="140" y="61" textAnchor="end" className={s.tiny}>MQTT 5</text>
      <path d="M0 68h150" className={s.line} />
      <text x="10" y="82" className={s.tiny}>plant/line2/m2/events</text>
      {step >= 2 ? ["msg 001 · 07:12:41.250", "msg 002 · 07:12:41.500", "… 537 · 07:15:06.000"].map((row, i) => <g key={row} transform={`translate(10 ${100 + i * 16})`}><g className={s.rise} style={at(step === 2 ? .8 + i * .5 : 0)}><rect width="130" height="12" className={s.boxSoft} /><text x="5" y="9" className={s.tiny}>{row}</text></g></g>)
        : ["awaiting messages", "", ""].map((row, i) => <g key={i} transform={`translate(10 ${100 + i * 16})`}><rect width="130" height="12" className={`${s.boxSoft} ${s.dim}`} /><text x="5" y="9" className={s.tiny}>{row}</text></g>)}
      {step === 5 && <g transform="translate(10 156)"><g className={s.stamp} style={at(1.2)}><rect width="130" height="22" className={s.boxAccent} /><text x="6" y="10" className={`${s.tiny} ${s.accentText}`}>EVT-M2-1187 · STORED</text><text x="6" y="19" className={s.tiny}>SHA-256 VERIFIED</text></g></g>}
      {step === 3 && <g transform="translate(10 156)"><g className={s.rise} style={at(1.4)}><text y="8" className={`${s.tiny} ${s.accentText}`}>PUBACK 07:15:06.104</text><text y="18" className={s.tiny}>QoS 1 · AT LEAST ONCE</text></g></g>}
      {step === 4 && <g transform="translate(10 156)"><g className={s.rise} style={at(1)}><text y="8" className={`${s.tiny} ${s.accentText}`}>REGISTRY · 14 DEVICES ONLINE</text><text y="18" className={s.tiny}>EG-02 HEALTHY · LAST HB 07:15:30</text></g></g>}
    </g>

    {/* Bottom status strip */}
    <g transform="translate(300 300)">
      {step === 0 && <g className={s.rise} style={at(.4)}><text className={s.tiny}>EDGE QUEUE</text><text y="24" className={s.big}>4 tags · 250 ms</text><text y="40" className={s.tiny}>EVT-M2-1187 RECEIVED AT EDGE 07:12:41.402 · 5 MESSAGES / s</text></g>}
      {step === 1 && <g className={s.rise} style={at(.4)}><text className={`${s.tiny} ${s.accentText}`}>LINK LOST 07:12:52</text><text y="24" className={s.big}>537 buffered</text><text y="40" className={s.tiny}>12.4 MB OF 512 MB · OLDEST 07:12:41.250 · DATA LOSS: NONE</text></g>}
      {step === 2 && <g className={s.rise} style={at(.4)}><text className={`${s.tiny} ${s.accentText}`}>LINK RESTORED 07:15:06 · OUTAGE 2 MIN 14 S</text><text y="24" className={s.big}>537 / 537 resent</text><text y="40" className={s.tiny}>OLDEST FIRST · 3.8 s · THEN LIVE STREAMING</text></g>}
      {step === 3 && <g className={s.rise} style={at(.4)}><text className={`${s.tiny} ${s.accentText}`}>SECURE PUBLISH</text><text y="24" className={s.big}>MQTT 5 · TLS 1.3 · QoS 1</text><text y="40" className={s.tiny}>DEVICE CERT EG-02 · PAYLOAD 412 B · TOPIC plant/line2/m2/events</text></g>}
      {step === 4 && <>
        <text className={`${s.tiny} ${s.accentText}`}>HEARTBEAT · EVERY 30 s</text>
        <path d="M0 30H60l6-14 8 28 8-22 5 8h40l6-14 8 28 8-22 5 8h40l6-14 8 28 8-22 5 8h40l6-14 8 28 8-22 5 8h120" pathLength={1} className={s.ecg} />
        <text y="52" className={s.tiny}>UPTIME 41 d 6 h · CPU 12 % · BOARD 48 °C · BUFFER 0 % · 4G −71 dBm</text>
      </>}
      {step === 5 && <g className={s.rise} style={at(.4)}>
        <text className={`${s.tiny} ${s.accentText}`}>THREE TIMESTAMPS · ONE MESSAGE</text>
        <path d="M0 26H440" className={s.line} />
        {[["MACHINE", "07:12:41.250", 0], ["EDGE", "07:12:41.402", 200], ["BROKER ACK", "07:15:06.104", 400]].map(([label, time, x], i) => <g key={String(label)} transform={`translate(${x} 26)`}><g className={s.pop} style={at(.6 + i * .5)}><circle r="4" className={i === 2 ? s.accentFill : s.mutedFill} /><text y="18" className={s.tiny}>{label}</text><text y="30" className={s.label}>{time}</text></g></g>)}
        <text x="440" y="18" textAnchor="end" className={s.tiny}>END-TO-END 2 MIN 25 S (OUTAGE)</text>
      </g>}
    </g>
    {step === 2 && <Tick x={287} y={165} delay={2.2} r={7} />}
  </Paper>;
}
