import type { CSSProperties, ReactNode } from "react";
import s from "./Scene.module.css";

/** Engineering-paper frame shared by every scene: 780×410, grid, mono annotations, bottom rule. */
export function Paper({ id, step, dots = false, title, code, foot, children }: { id: string; step: number; dots?: boolean; title: string; code: string; foot?: string; children: ReactNode }) {
  const pattern = `exp-${id}-grid`;
  return <svg className={s.svg} viewBox="0 0 780 410" fill="none" aria-hidden="true" data-step={step}>
    <defs><pattern id={pattern} width="24" height="24" patternUnits="userSpaceOnUse">{dots ? <circle cx="1" cy="1" r=".7" className={s.gridDot} /> : <path d="M24 0H0V24" className={s.gridLine} />}</pattern></defs>
    <path d="M0 0h780v410H0Z" fill={`url(#${pattern})`} />
    <text x="32" y="32" className={s.note}>{title}</text>
    <text x="748" y="32" textAnchor="end" className={s.note}>{code}</text>
    {children}
    <path d="M24 390h732" className={s.gridLine} />
    {foot && <text x="32" y="380" className={s.note}>{foot}</text>}
  </svg>;
}

/** Animation delay / duration as CSS custom properties. */
export const at = (delay: number, duration?: number): CSSProperties => ({ "--d": `${delay}s`, ...(duration ? { "--dur": `${duration}s` } : {}) } as CSSProperties);

/** An invisible square that makes a group's fill-box symmetric around its local origin, so CSS rotate / scale pivot on (0,0). */
export function Pivot({ r = 40 }: { r?: number }) {
  return <rect x={-r} y={-r} width={r * 2} height={r * 2} fill="none" stroke="none" />;
}

/** A small check mark in a circle, drawn with a stamp animation. */
export function Tick({ x, y, delay = 0, r = 9 }: { x: number; y: number; delay?: number; r?: number }) {
  return <g transform={`translate(${x} ${y})`}><g className={s.stamp} style={at(delay)}><circle r={r} className={s.tickCircle} /><path d={`m${-r * .4} 0 ${r * .3} ${r * .3} ${r * .55} -${r * .65}`} className={s.accent} /></g></g>;
}

/** A card: rectangle with an optional title row. Children are positioned from the card's top-left. */
export function Card({ x, y, w, h, title, accent = false, soft = false, className, style, children }: { x: number; y: number; w: number; h: number; title?: string; accent?: boolean; soft?: boolean; className?: string; style?: CSSProperties; children?: ReactNode }) {
  return <g transform={`translate(${x} ${y})`}><g className={className} style={style}>
    <rect width={w} height={h} className={accent ? s.boxAccent : soft ? s.boxSoft : s.box} />
    {title && <><text x="10" y="15" className={s.small}>{title}</text><path d={`M0 22H${w}`} className={s.line} /></>}
    {children}
  </g></g>;
}

/** A person glyph (head + shoulders) for owners and approvers. */
export function Person({ x, y, accent = false }: { x: number; y: number; accent?: boolean }) {
  return <g transform={`translate(${x} ${y})`} className={accent ? s.accent : s.muted}><circle r="5" cy="-7" /><path d="M-9 9c0-6 4-9 9-9s9 3 9 9" /></g>;
}

/** A tiny document glyph with a code, like the ERP scene's records. */
export function Doc({ x, y, code, accent = false }: { x: number; y: number; code: string; accent?: boolean }) {
  return <g transform={`translate(${x} ${y})`} className={accent ? s.docAccent : s.doc}><path d="M-13-18h18l8 8v28h-26Z" /><path d="M5-18v8h8M-7 4h14M-7 10h9" /><text y="-4" textAnchor="middle" className={s.tiny}>{code}</text></g>;
}
