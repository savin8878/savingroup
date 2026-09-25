import type { CSSProperties } from "react";
import styles from "./About.module.css";
import s from "./AboutSketch.module.css";

/** Sequence one stroke: drawn `t` seconds after its drawing is seen, over `d` seconds.
 *  On scroll-linked drawings, `st`/`sd` give the same stroke its start and span as fractions of the scroll travel. */
const at = (t: number, d: number, st?: number, sd?: number) =>
  ({ "--t": `${t}s`, "--d": `${d}s`, ...(st === undefined ? {} : { "--st": String(st), "--sd": String(sd) }) }) as CSSProperties;
const cx = (...names: Array<string | false | undefined>) => names.filter(Boolean).join(" ");

/** Static pencil wobble for main outlines: one noise texture displaces the group by a fraction of a pixel. Nothing in it animates. */
function SketchFilter({ id }: { id: string }) {
  return <filter id={id} colorInterpolationFilters="sRGB">
    <feTurbulence type="fractalNoise" baseFrequency=".03" numOctaves="1" seed="5" result="grain" />
    <feDisplacementMap in="SourceGraphic" in2="grain" scale="1.6" xChannelSelector="R" yChannelSelector="G" />
  </filter>;
}

const CIRCUIT = "m160 257 82-47 55 31 52-30 78 45-133 76-54-31-52 30";
const LOWER_SIGNAL = "m134 365 30 17 41-24 30 17 51-29m-117 51 44 25 60-34 33 18 91-52";
const PROCESSOR_TOP = "m247 239 43-25 44 25-43 25Z";
const PROCESSOR_SIDE = "M247 239v29l44 25 43-25v-29l-43 25Z";
const TEAM_LINKS = "M240 41v114m99 57-99-57m-99 57 99-57";
const CLARITY_BRANCHES = ["M484 90h210c65 0 65-60 135-60h251", "M484 90h596", "M484 90h210c65 0 65 60 135 60h251"];

/** Exploded system architecture: people, connected technology, then outcomes.
 *  Sketch order: guides, lower plane, middle plane and processor, upper plane and people, accent circuits, measures, markers; ~3.3 s. */
export function ArchitectureDrawing() {
  return <svg viewBox="0 0 580 530" fill="none" className={cx(styles.architecture, s.arch)} aria-hidden="true" data-about-diagram>
    <defs><pattern id="about-dots" width="22" height="22" patternUnits="userSpaceOnUse"><circle cx="1" cy="1" r=".7" fill="currentColor" opacity=".2" /></pattern><SketchFilter id="about-sketch-a" /></defs>
    <path fill="url(#about-dots)" d="M28 20h524v490H28z" className={s.fade} style={at(0, .7)} />
    <g className={styles.drawingGuides}>
      <path d="M290 12v497M22 265h536M67 88l446 256M67 225l446 257M67 344 513 88M67 481l446-256" strokeDasharray="3 8" className={s.sweep} style={at(.05, .7)} />
      <path d="M24 23h16m-8-8v16m508-8h16m-8-8v16M24 507h16m-8-8v16m508-8h16m-8-8v16" pathLength="1" className={s.draw} style={at(.2, .35)} />
    </g>
    <g className={styles.lowerPlane} filter="url(#about-sketch-a)">
      <path d="m76 362 213-121 215 123-213 122Z" pathLength="1" className={s.shape} style={at(.4, .55)} />
      <path d="M76 362v14l215 123 213-122v-13M291 486v13" pathLength="1" className={s.shape} style={at(.75, .3)} />
      <path d="m111 362 178-101 179 103-177 102Z" className={cx(styles.planeInset, s.draw)} pathLength="1" style={at(.8, .4)} />
      <path d={LOWER_SIGNAL} className={cx(styles.signalPath, s.draw)} pathLength="1" style={at(2.35, .5)} />
      <path d="m297 410 23 13 17-10v-30l-23-13-17 10ZM320 423v-30l17-10m-40-3 23 13" pathLength="1" className={s.shape} style={at(.9, .35)} />
      <path d="m342 385 23 13 17-10v-44l-23-13-17 10ZM365 398v-44l17-10m-40-3 23 13" pathLength="1" className={s.shape} style={at(1, .35)} />
      <path d="m387 360 23 13 17-10v-61l-23-13-17 10Z" className={cx(styles.orangeFill, s.shape)} pathLength="1" style={at(1.1, .35)} /><path d="M410 373v-61l17-10m-40-3 23 13" stroke="var(--home-paper)" pathLength="1" className={s.shape} style={at(1.3, .25)} />
    </g>
    <path d={LOWER_SIGNAL} pathLength="1" className={s.packets} style={{ "--loop": "11s", "--stagger": "4s" } as CSSProperties} />
    <g className={cx(styles.verticalLinks, s.sweepDown)} strokeDasharray="4 6" style={at(1.15, .45)}><path d="M119 148v210M462 148v210M290 246v185M290 51v190" className={s.dashFlow} style={{ "--flow-to": "-100" } as CSSProperties} /></g>
    <g className={styles.middlePlane} filter="url(#about-sketch-a)">
      <path d="m76 252 213-121 215 123-213 122Z" pathLength="1" className={s.shape} style={at(1.05, .55)} />
      <path d="M76 252v13l215 123 213-122v-12M291 376v12" pathLength="1" className={s.shape} style={at(1.4, .3)} />
      <path d={CIRCUIT} className={cx(styles.middleCircuit, s.draw)} pathLength="1" style={at(1.95, .6)} />
      {[{x:145,y:232},{x:269,y:160},{x:396,y:234},{x:270,y:306}].map(({x,y},i)=><g key={x+"-"+y} transform={`translate(${x} ${y})`}><path d="m0 0 20-12L40 0 20 12Z" pathLength="1" className={s.shape} style={at(1.35 + i * .08, .3)} /><path d="M0 0v14l20 12 20-12V0M20 12v14" pathLength="1" className={s.shape} style={at(1.5 + i * .08, .25)} /></g>)}
      <path d={PROCESSOR_TOP} className={cx(styles.processorTop, s.shape)} pathLength="1" style={at(1.6, .35)} /><path d={PROCESSOR_SIDE} className={cx(styles.processorSide, s.shape)} pathLength="1" style={at(1.7, .35)} /><path d="M291 264v29m-33-42 21 12m-21-4 21 12m24-8 20-12m-20 20 20-12" stroke="#f5ddd0" pathLength="1" className={s.shape} style={at(1.9, .3)} />
      <path d="m272 239 18-10 19 10-18 11Z" stroke="#fff0e5" pathLength="1" className={s.shape} style={at(1.95, .25)} />
    </g>
    <path d={CIRCUIT} pathLength="1" className={s.packets} style={{ "--loop": "9s" } as CSSProperties} />
    <path d={PROCESSOR_SIDE} className={s.pulse} />
    <g className={styles.upperPlane} filter="url(#about-sketch-a)">
      <path d="m76 143 213-122 215 124-213 122Z" pathLength="1" className={s.shape} style={at(1.55, .55)} />
      <path d="M76 143v12l215 123 213-122v-11M291 267v11" pathLength="1" className={s.shape} style={at(1.9, .3)} />
      <path d="m139 144 150-86 152 88-150 86Z" className={cx(styles.planeInset, s.draw)} pathLength="1" style={at(1.95, .4)} />
      <ellipse cx="290" cy="142" rx="53" ry="29" pathLength="1" className={s.shape} style={at(2.05, .45)} /><ellipse cx="290" cy="142" rx="37" ry="20" pathLength="1" className={s.shape} style={at(2.15, .4)} />
      <path d="m276 142 10 6 19-14" className={cx(styles.signalPath, s.draw)} pathLength="1" style={at(2.55, .25)} />
      {[{x:196,y:130},{x:289,y:76},{x:387,y:131},{x:290,y:190}].map(({x,y},i)=><g key={i} transform={`translate(${x} ${y})`} className={styles.person}><ellipse cx="0" cy="14" rx="14" ry="8" pathLength="1" className={s.shape} style={at(2.1 + i * .08, .3)} /><path d="M-8 10V-2c0-11 16-11 16 0v12M-4 14v-6m8 6V8" pathLength="1" className={s.shape} style={at(2.2 + i * .08, .3)} /><circle cy="-17" r="7" pathLength="1" className={s.shape} style={at(2.35 + i * .08, .2)} /></g>)}
      <path d="m216 138 21 3m106 0 23-2m-76-37v9m1 60v10" className={cx(styles.signalPath, s.draw)} pathLength="1" style={at(2.6, .3)} />
    </g>
    <g className={styles.drawingMeasures}><path d="M59 143v220m-5-220h10m-10 110h10m-10 110h10M522 145v217m-5-217h10m-10 110h10m-10 107h10" pathLength="1" className={s.draw} style={at(2.5, .5)} /></g>
    <g className={styles.drawingMarkers}>{[143, 253, 363].map((y, i) => <circle key={y} cx="59" cy={y} r="3" className={s.pop} style={at(2.85 + i * .1, .3)} />)}</g>
  </svg>;
}

/** Sketch order: axes and rings, triangle, nodes, connections, the core, the dimension line; ~2.9 s. Then the core breathes and the links carry a signal. */
export function TeamDrawing() {
  return <svg viewBox="0 0 480 310" fill="none" aria-hidden="true" className={cx(styles.teamDrawing, s.team)} data-about-diagram>
    <defs><SketchFilter id="about-sketch-t" /></defs>
    <g className={styles.drawingGuides}><path d="M25 155h430M240 12v285" strokeDasharray="3 7" className={s.sweep} style={at(0, .6)} /><circle cx="240" cy="155" r="114" pathLength="1" className={s.draw} style={at(.15, .7)} /><circle cx="240" cy="155" r="86" strokeDasharray="2 7" className={s.fade} style={at(.55, .45)} /></g>
    <g filter="url(#about-sketch-t)">
      <path d="m240 41 99 171H141Z" className={cx(styles.teamTriangle, s.draw)} pathLength="1" style={at(.5, .8)} />
      <path d={TEAM_LINKS} className={cx(styles.teamConnections, s.draw)} pathLength="1" style={at(1.55, .6)} />
    </g>
    <path d={TEAM_LINKS} pathLength="1" className={s.packets} style={{ "--loop": "12s" } as CSSProperties} />
    <g filter="url(#about-sketch-t)">
      {[{x:240,y:41},{x:339,y:212},{x:141,y:212}].map(({x,y},i)=><g key={i}><rect x={x-20} y={y-20} width="40" height="40" rx="1" pathLength="1" className={cx(styles.teamNode, s.shape)} style={at(1.05 + i * .12, .4)} /><path d={`M${x-7} ${y}h14m-7-7v14`} pathLength="1" className={s.draw} style={at(1.4 + i * .12, .25)} /></g>)}
    </g>
    <g className={s.breathe}><circle cx="240" cy="155" r="34" className={cx(styles.teamCore, s.shape)} pathLength="1" style={at(1.9, .5)} /><circle cx="240" cy="148" r="7" pathLength="1" className={s.draw} style={at(2.25, .3)} /><path d="M225 168v-3c0-15 30-15 30 0v3m-9-33 4 4m-20-4-4 4" pathLength="1" className={s.draw} style={at(2.35, .35)} /></g>
    <path d="M96 284h288m-278-5-10 5 10 5m268-10 10 5-10 5" className={cx(styles.drawingGuides, s.draw)} pathLength="1" style={at(2.4, .5)} />
    <circle cx="240" cy="155" r="34" className={s.halo} />
  </svg>;
}

/** Friction lines sweep in when seen; the three clarity branches and their end nodes resolve with scroll (or over ~1.7 s when the page cannot scroll). */
export function ClarityDrawing() {
  return <svg viewBox="0 0 1080 180" fill="none" preserveAspectRatio="none" className={cx(styles.clarityDrawing, s.clarity)} aria-hidden="true" data-about-diagram data-about-scrub>
    <defs><SketchFilter id="about-sketch-c" /></defs>
    <g stroke="#65776b" strokeWidth="1"><path d="M0 30h110v27h74m20 0h108v33h172M0 90h65v35h152v-35h267M0 150h139v-29h32m20 0h84v-31h209" strokeDasharray="5 5" className={s.sweep} style={at(0, .9)} /></g>
    <g filter="url(#about-sketch-c)">{CLARITY_BRANCHES.map((d, i) => <path key={d} d={d} className={cx(styles.clarityPaths, s.draw, s.scrub)} pathLength="1" style={at(.25 + i * .1, .85, i * .06, .78)} />)}</g>
    <g className={s.pop} style={at(.15, .4)}><circle cx="520" cy="90" r="11" fill="#1a2420" stroke="#f39c70" /><circle cx="520" cy="90" r="4" fill="#f39c70" /></g>
    <g fill="#1a2420" stroke="#f39c70">{[30, 90, 150].map((y, i) => <circle key={y} cx="1050" cy={y} r="4" className={cx(s.pop, s.scrub)} style={at(1.15 + i * .1, .3, .84 + i * .05, .14)} />)}</g>
    {CLARITY_BRANCHES.map((d, i) => <path key={d} d={d} pathLength="1" className={s.packets} style={{ "--loop": `${12 + i}s`, "--stagger": `${i * 3}s` } as CSSProperties} />)}
  </svg>;
}

/** Nodes draw when seen; the path between them, the checks and the feedback loop progress with scroll (or over ~2.5 s). The connected drawing then moves data between nodes. */
export function TransformationDrawing({ connected = false }: { connected?: boolean }) {
  const filterId = connected ? "about-sketch-x2" : "about-sketch-x1";
  return <svg viewBox="0 0 480 190" fill="none" className={cx(styles.transformationDrawing, s.tx)} aria-hidden="true" data-about-diagram data-about-scrub>
    <defs><SketchFilter id={filterId} /></defs>
    <g filter={`url(#${filterId})`}>
      <path d={connected ? "M65 97h350" : "M65 97h49v-31h32m18 0h28v67h36m19 0h37V85h30m18 0h34v12h49"} className={cx(connected ? styles.connectedPath : styles.manualPath, s.draw, s.scrub)} pathLength="1" style={at(1, .8, .04, .7)} />
    </g>
    {connected && <path d="M65 97h350" pathLength="1" className={s.packets} style={{ "--loop": "8s" } as CSSProperties} />}
    <g filter={`url(#${filterId})`}>
      {[65,240,415].map((x,i)=><g key={x} className={styles.transformNode}>
        <rect x={x-29} y="68" width="58" height="58" rx="1" pathLength="1" className={s.shape} style={at(i * .15, .45)} />
        {i===0?<><path d={`M${x-10} 83h15l6 6v23h-21Zm15 0v7h6m-16 6h11m-11 6h11`} pathLength="1" className={s.draw} style={at(.4 + i * .15, .35)} /></>:i===1?<><path d={`M${x-12} 88h9v9h-9Zm15 12h9v9h-9Zm-6-7h10v7`} pathLength="1" className={s.draw} style={at(.4 + i * .15, .35)} /></>:<><path d={`M${x-12} 106V86m0 20h26m-20-5v-6m7 6V85m7 16V91`} pathLength="1" className={s.draw} style={at(.4 + i * .15, .35)} /></>}
        {connected?<g className={cx(styles.transformCheck, s.pop, s.scrub)} style={at(1.7 + i * .15, .3, .74 + i * .07, .14)}><circle cx={x+27} cy="68" r="10" /><path d={`m${x+23} 68 3 3 5-6`} /></g>:<path d={`M${x} 138v8m-4 4 4-4 4 4`} className={cx(styles.manualPath, s.fade, s.scrub)} style={{ ...at(1.7 + i * .15, .3, .74 + i * .07, .14), "--fade-to": ".7" } as CSSProperties} />}
      </g>)}
    </g>
    {connected && <g className={cx(s.sweep, s.scrub)} style={at(2, .5, .9, .1)}><path d="M65 48V30h350v18" className={cx(styles.feedbackPath, s.dashFlow)} style={{ "--flow-to": "-80" } as CSSProperties} /></g>}
  </svg>;
}
