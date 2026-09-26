"use client";

import { useCallback, useEffect, useLayoutEffect, useRef, useState, type RefObject } from "react";
import { FileText, Plane, Ship as ShipIcon, Truck as TruckIcon } from "lucide-react";
import { TRANSPORT, type TransportMode } from "./procurement-data";
import { Aircraft, Pallet, Ship, Truck, Warehouse } from "./ProcurementScene";
import { ROUTES, movingAt, routeAt, transitSteps } from "./transit-data";
import styles from "./TransitStory.module.css";

const MODES = ["road", "sea", "air"] as const;
const STEPS = 7;
const LEDGER_X = [33, 271, 509, 747];
const ICONS = { road: TruckIcon, sea: ShipIcon, air: Plane };

type SceneRefs = { vehicle: RefObject<SVGGElement | null>; beacon: RefObject<SVGGElement | null>; path: RefObject<SVGPathElement | null>; ledgerDot: RefObject<SVGGElement | null> };

function Note({ x, y, w = 200, title, text, on, accent = false }: { x: number; y: number; w?: number; title: string; text: string; on: boolean; accent?: boolean }) {
  return <g transform={`translate(${x} ${y})`}><g className={`${styles.state} ${styles.note}`} data-on={on} data-accent={accent}>
    <rect width={w} height="50" /><circle cx={w - 13} cy="14" r="2.5" className={styles.noteDot} />
    <text x="13" y="21" className={styles.noteTitle}>{title}</text><text x="13" y="38" className={styles.noteText}>{text}</text>
  </g></g>;
}

function TransitScene({ mode, step, refs, scene }: { mode: TransportMode; step: number; refs: SceneRefs; scene: string }) {
  const route = ROUTES[mode];
  const transport = TRANSPORT[mode];
  const [sx, sy] = route.start;
  const [cx, cy] = route.checkPoint;
  const [hx, hy] = route.holdPoint;
  const reached = [step >= 1, step >= 2, step >= 4, step >= 5];
  const ground = mode === "road" ? 293 : mode === "sea" ? 290 : 300;
  const destTop = mode === "road" ? 211 : mode === "sea" ? 188 : 230;
  const holdNote: [number, number] = mode === "air" ? [238, 196] : [hx - 95, 104];
  const clockAt: [number, number] = mode === "road" ? [456, 222] : mode === "sea" ? [448, 218] : [453, 95];
  const scanAt: [number, number] = [sx + 12, sy - (mode === "road" ? 83 : mode === "sea" ? 89 : 77)];
  const dockPallets = mode === "sea" ? [120, 152] : [44, 76];
  const beaconY = mode === "road" ? -25 : mode === "sea" ? -20 : -5;
  const checkNoteX = Math.min(566, Math.max(24, cx - 60));

  return <svg className={styles.svg} viewBox="0 0 780 410" fill="none" preserveAspectRatio="xMidYMid meet" aria-hidden="true" data-mode={mode}>
    <defs><pattern id="transit-paper" width="24" height="24" patternUnits="userSpaceOnUse"><circle cx="1" cy="1" r=".7" className={styles.dot} /></pattern></defs>
    <path d="M0 0h780v410H0Z" fill="url(#transit-paper)" />
    <text x="30" y="32" className={styles.annotation}>{scene}</text>
    <text x="750" y="32" textAnchor="end" className={styles.annotation}>PO-0089 · 24 UNITS · 2 PALLETS</text>

    {/* Journey ledger */}
    <path d="M33 59H747" className={styles.ledger} />
    <path d="M33 59H747" pathLength={1} className={styles.ledgerFill} />
    {LEDGER_X.map((x, i) => <g key={x}><circle cx={x} cy="59" r="3.5" className={styles.stop} data-reached={reached[i]} /><text x={x} y="79" textAnchor={i === 0 ? "start" : i === 3 ? "end" : "middle"} className={styles.stopLabel} data-reached={reached[i]}>{route.ledger[i]}</text></g>)}
    <g ref={refs.ledgerDot} transform="translate(33 59)"><circle r="4.5" className={styles.ledgerDot} /></g>

    {mode === "road" && <>
      <g className={styles.distant}><path d="M300 292v-52h50v52m-40-40h10v10h-10Zm22 0h10v10h-10ZM370 292v-74h58v74m-47-60h12v12h-12Zm22 0h12v12h-12ZM540 292v-40h40v40m-30-28h8v8h-8Z" /></g>
      <g className={styles.site} transform="translate(4 213) scale(.6)"><Warehouse x={0} y={0} name="SUPPLIER" /></g>
      <g className={styles.site} transform="translate(682 213) scale(.6)"><Warehouse x={0} y={0} name="YOUR PLANT" /></g>
      <path d="M0 293h780M0 348h780" className={styles.roadEdge} /><path d="M0 321h780" className={styles.lane} />
      <g transform={`translate(${cx} 293)`}><path d="M-14 0v-30h28v30M-14-30l14-8 14 8" className={styles.structure} /><text y="-13" textAnchor="middle" className={styles.boothSign}>EWB</text></g>
      <g transform={`translate(${hx} 293)`}><path d="M-22 0v-50M22 0v-50M-22-50h44v-8h-44Z" className={styles.structure} /><text y="-33" textAnchor="middle" className={styles.boothSign}>TOLL</text></g>
      <g transform="translate(668 293)"><path d="M0 0V-45" className={styles.gatePost} /><path d="M0-45H-52" className={styles.gateArm} /></g>
    </>}
    {mode === "sea" && <>
      <g className={styles.site} transform="translate(0 105) scale(.65)"><path d="M28 284h143v16H28M72 284V90h12v194M40 90h260v12H40ZM83 112l95 71M84 183l94-71M83 187l80 78M178 102v94m-18 0h36M44 284v-62h85v62M57 227v52m16-52v52m16-52v52m16-52v52" className={styles.structure} /></g>
      <g className={styles.site} transform="translate(285.25 105) scale(.65)"><path d="M590 280h165v20H590m58-20V128h10v152m-40-152h124v10H618m97 0v73" className={styles.structure} /></g>
      <path d="M0 300h780" className={styles.water} />
      <g transform={`translate(${cx} 300)`}><path d="M-5 0l5-16 5 16Zm-8 0h16" className={styles.structure} /></g>
      <g transform={`translate(${hx} 300)`}><path d="M-6 0v-14h12v14ZM0-14v-8m-5 4h10M-9 0h18" className={styles.structure} /></g>
    </>}
    {mode === "air" && <>
      <g className={styles.clouds}><path d="M70 98h90m-75-9h40M330 100h80m-62-9h30M580 96h96m-78-9h44" /></g>
      <g className={styles.site} transform="translate(0 122) scale(.6)"><path d="M21 297V184h113v113M12 184h132M40 202h20v26H40Zm35 0h20v26H75Zm34 0h13v26h-13ZM177 297V154m-19 0h38v-34h-38Zm-8-34 9-14h37l10 14" className={styles.structure} /></g>
      <g className={styles.site} transform="translate(327.2 126) scale(.6)"><path d="M603 290v-90l64-27 81 27v90m-130-70h116m-116 16h116" className={styles.structure} /></g>
      <path d="M0 300h780M0 332h780" className={styles.roadEdge} /><path d="M0 316h780" className={styles.lane} />
      <path d={route.path} className={styles.flight} />
      <g transform={`translate(${cx} 300)`}><path d="M-14 0v-24h28v24" className={styles.structure} /><text y="-9" textAnchor="middle" className={styles.boothSign}>EWB</text></g>
    </>}

    <path d={route.trail} pathLength={1} className={styles.routeDone} />
    <path ref={refs.path} d={route.path} stroke="none" fill="none" />

    {/* Pallets: at the dock before pickup, at the destination after receipt */}
    <g className={styles.pallets} data-on={step === 0}>{dockPallets.map((x) => <g key={x} transform={`translate(${x} ${ground}) scale(.45)`}><Pallet /></g>)}</g>
    <g className={styles.palletsIn} data-on={step === 6}>{[706, 738].map((x) => <g key={x} transform={`translate(${x} ${ground}) scale(.45)`}><Pallet /></g>)}</g>

    {/* The shipment: translated along the route by scroll progress */}
    <g ref={refs.vehicle} className={styles.vehicle} transform={`translate(${sx} ${sy})`}><g transform={`scale(${route.scale})`}>{mode === "road" ? <Truck /> : mode === "sea" ? <g className={styles.bob}><Ship /></g> : <Aircraft />}</g></g>
    <g ref={refs.beacon} className={styles.beacon} data-on={step === 3} transform={`translate(${sx} ${sy})`}><circle cy={beaconY} r="34" /><circle cy={beaconY} r="34" /></g>
    {mode === "sea" && <g className={styles.waves}><path d="M-80 316q20-8 40 0t40 0t40 0t40 0t40 0t40 0t40 0t40 0t40 0t40 0t40 0t40 0t40 0t40 0t40 0t40 0t40 0t40 0t40 0t40 0t40 0t40 0M-60 334q20-7 40 0t40 0t40 0t40 0t40 0t40 0t40 0t40 0t40 0t40 0t40 0t40 0t40 0t40 0t40 0t40 0t40 0t40 0t40 0t40 0t40 0" /></g>}

    {/* Step events */}
    <Note x={24} y={104} title="SHP-0089 PLANNED" text={`2 pallets · ${transport.booking} booked`} on={step === 0} />
    <Note x={24} y={104} title="PICKUP SCAN · DN-0089" text="2 / 2 pallets · dispatched 09:12" on={step === 1} accent />
    <g transform={`translate(${scanAt[0]} ${scanAt[1]})`}><g className={styles.state} data-on={step === 1}><g className={styles.scan}><rect x="-11" y="-11" width="22" height="22" /><path d="M-6-6h5v5h-5Zm7 0h5v5h-5Zm-7 7h5v5h-5Zm8 1h4m-4 3h4" /></g><path d="M-16 0h32" className={styles.scanLine} /></g></g>
    <Note x={checkNoteX} y={104} title="E-WAY BILL VERIFIED" text="EWB-3312 · stamped on SHP-0089" on={step === 2} accent />
    <g transform={`translate(${cx} ${cy - 75})`}><g className={styles.state} data-on={step >= 2}><circle r="13" className={styles.stamp} /><path d="m-6 0 4 4 8-9" className={styles.stamp} /><text y="24" textAnchor="middle" className={styles.stampText}>EWB-3312</text></g></g>
    <Note x={300} y={104} title="IN TRANSIT · ETA 14:40" text="Milestone 2 of 4 · ETA shared live" on={step === 3} accent />
    <g className={styles.state} data-on={step === 3}><path d={`M500 129H740V${destTop - 6}`} className={styles.wire} /><text x="600" y="123" className={styles.wireTag}>SAME RECORD → RECEIVING</text></g>
    <Note x={holdNote[0]} y={holdNote[1]} title={`HOLD 40 MIN · ${route.hold.toUpperCase()}`} text="ETA 14:40 → 15:20 · auto-notified" on={step === 4} accent />
    <g className={styles.state} data-on={step === 4}><path d={`M${holdNote[0] + 200} ${holdNote[1] + 25}H740V${destTop - 6}`} className={styles.wire} /><text x="600" y={holdNote[1] + 19} className={styles.wireTag}>NOTIFIED AUTOMATICALLY</text>{mode === "air" && <ellipse cx={hx} cy={hy} rx="96" ry="42" className={styles.orbit} />}</g>
    <g transform={`translate(${clockAt[0]} ${clockAt[1]})`}><g className={styles.state} data-on={step === 4}><g className={styles.clock}><circle r="11" /><path d="M0 0h5" /><path d="M0 0V-7" /></g></g></g>
    <Note x={560} y={104} title="GATE SCAN · GATE-0713" text="GRN-0058 prepared from PO-0089" on={step === 5} accent />
    <g className={styles.state} data-on={step === 5}><path d={`M${mode === "road" ? 660 : 690} ${ground - 30}H${mode === "road" ? 600 : 640}`} className={styles.gateBeam} /></g>
    <Note x={560} y={104} title="GRN-0058 POSTED" text="24 / 24 accepted · stock 6 → 30" on={step === 6} accent />

    <path d="M24 366h732" className={styles.hairline} />
    <text x="32" y="388" className={styles.annotation}>{route.ends[0]}</text>
    <text x="390" y="388" textAnchor="middle" className={step === 6 ? styles.trail : styles.annotation}>{step === 6 ? "PR-0241 → PO-0089 → GRN-0058 · TRAIL COMPLETE" : transport.milestone.toUpperCase()}</text>
    <text x="748" y="388" textAnchor="end" className={styles.annotation}>{route.ends[1]}</text>
  </svg>;
}

/** Scroll-driven transit story: one shipment moves from the supplier's dock to the plant gate as the visitor scrolls. */
export function TransitStory() {
  const root = useRef<HTMLDivElement>(null);
  const stage = useRef<HTMLDivElement>(null);
  const stepsList = useRef<HTMLOListElement>(null);
  const vehicle = useRef<SVGGElement>(null);
  const beacon = useRef<SVGGElement>(null);
  const path = useRef<SVGPathElement>(null);
  const ledgerDot = useRef<SVGGElement>(null);
  const modeRef = useRef<TransportMode>("road");
  const stepRef = useRef(0);
  const [mode, setMode] = useState<TransportMode>("road");
  const [step, setStep] = useState(0);
  const steps = transitSteps(mode);

  const update = useCallback(() => {
    const story = root.current, scene = stage.current, list = stepsList.current, track = path.current;
    const first = list?.firstElementChild, last = list?.lastElementChild;
    if (!story || !scene || !track || !first || !last) return;
    const sceneRect = scene.getBoundingClientRect();
    const stacked = sceneRect.width > story.clientWidth * 0.9;
    const trigger = stacked ? sceneRect.bottom + 28 : sceneRect.top + sceneRect.height * 0.62;
    const top = first.getBoundingClientRect().top, bottom = last.getBoundingClientRect().bottom;
    const progress = Math.min(1, Math.max(0, (trigger - top) / Math.max(1, bottom - top)));
    const s = progress * STEPS;
    const current = Math.min(STEPS - 1, Math.floor(s));
    const spec = ROUTES[modeRef.current];
    const [check, hold] = spec.checkpoints;
    const r = routeAt(s, spec.checkpoints);
    const ledger = (r <= check ? r / check : r <= hold ? 1 + (r - check) / (hold - check) : 2 + (r - hold) / (1 - hold)) / 3;

    story.style.setProperty("--progress", progress.toFixed(4));
    story.style.setProperty("--route", r.toFixed(4));
    story.style.setProperty("--ledger", ledger.toFixed(4));
    story.style.setProperty("--step", String(current));
    story.dataset.moving = String(movingAt(s, spec.checkpoints));

    const length = track.getTotalLength();
    const at = r * length;
    const point = track.getPointAtLength(at);
    let angle = 0;
    if (modeRef.current === "air") {
      const a = track.getPointAtLength(Math.max(0, at - length * 0.04));
      const b = track.getPointAtLength(Math.min(length, at + length * 0.04));
      angle = (Math.atan2(b.y - a.y, b.x - a.x) * 180) / Math.PI * 0.6;
    }
    const position = `translate(${point.x.toFixed(1)} ${point.y.toFixed(1)})`;
    vehicle.current?.setAttribute("transform", `${position} rotate(${angle.toFixed(1)})`);
    beacon.current?.setAttribute("transform", position);
    ledgerDot.current?.setAttribute("transform", `translate(${(33 + ledger * 714).toFixed(1)} 59)`);
    if (current !== stepRef.current) { stepRef.current = current; setStep(current); }
  }, []);

  useEffect(() => {
    let frame = 0;
    const schedule = () => { if (!frame) frame = requestAnimationFrame(() => { frame = 0; update(); }); };
    schedule();
    window.addEventListener("scroll", schedule, { passive: true });
    window.addEventListener("resize", schedule);
    // Content above the section can change height after it loads; that moves the story without a scroll event.
    const observer = typeof ResizeObserver === "undefined" ? null : new ResizeObserver(schedule);
    observer?.observe(document.documentElement);
    return () => { window.removeEventListener("scroll", schedule); window.removeEventListener("resize", schedule); observer?.disconnect(); if (frame) cancelAnimationFrame(frame); };
  }, [update]);

  useLayoutEffect(() => { modeRef.current = mode; update(); }, [mode, update]);

  return <div ref={root} className={styles.story} data-gate={step >= 5 ? "open" : "closed"} data-moving="false">
    <div className={styles.sceneColumn}>
      <div ref={stage} className={styles.stage}>
        <div className={styles.bar}>
          <span className={styles.live}><i />FIG. 03 · IN TRANSIT <b>· STAGE {step + 1} OF {STEPS}</b></span>
          <div className={styles.modes} role="group" aria-label="Transport mode">{MODES.map((option) => { const Icon = ICONS[option]; return <button key={option} type="button" aria-pressed={mode === option} onClick={() => setMode(option)}><Icon aria-hidden="true" /><span>{TRANSPORT[option].label}</span></button>; })}</div>
        </div>
        <div className={styles.scene}><TransitScene mode={mode} step={step} scene={steps[step].scene} refs={{ vehicle, beacon, path, ledgerDot }} /></div>
        <div className={styles.rail}>
          <div className={styles.railMeta}><span>{TRANSPORT[mode].route.toUpperCase()}</span><span>STAGE {step + 1} OF {STEPS} · {steps[step].label.toUpperCase()}</span></div>
          <div className={styles.railTrack} role="img" aria-label={`Stage ${step + 1} of ${STEPS}: ${steps[step].label}`}><span /></div>
        </div>
      </div>
    </div>
    <ol ref={stepsList} className={styles.steps}>
      {steps.map((item, index) => <li key={item.label} className={styles.step} data-active={index === step}>
        <span>0{index + 1} / {item.label.toUpperCase()}</span>
        <h3>{item.title}</h3>
        <p>{item.detail}</p>
        <div className={styles.record}>
          <div className={styles.recordHead}><FileText size={15} strokeWidth={1.3} aria-hidden="true" /><span>{item.document}</span><span>{item.code}</span></div>
          <div className={styles.recordStatus}><i />{item.status}</div>
          <dl>{item.fields.map(([name, value]) => <div key={name}><dt>{name}</dt><dd>{value}</dd></div>)}</dl>
        </div>
      </li>)}
    </ol>
  </div>;
}
