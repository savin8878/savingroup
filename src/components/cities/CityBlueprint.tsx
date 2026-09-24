import { ArrowUpRight, MousePointer2, Plus } from "lucide-react";
import type { CSSProperties } from "react";
import type { CityContent } from "@/lib/cities";
import type { CityCopy } from "./city-copy";
import { ProcurementTrigger } from "./CityMotion";
import styles from "./Cities.module.css";

/** Architectural shorthand, intentionally schematic rather than a literal city map. */
function Landmark({ slug }: { slug: string }) {
  if (["mumbai", "delhi", "pune", "indore"].includes(slug)) return <g><path d="M216 152V82h14V67h12v15h67V67h12v15h14v70M209 152h133M225 91h101M234 152v-40h22v40m33 0v-40h22v40M263 152v-37q12-24 25 0v37M215 82h122M219 67h27m59 0h21"/><path d="M219 58h23m65 0h16M239 101h10m45 0h10"/></g>;
  if (slug === "kolkata" || slug === "ahmedabad") return <g><path d="M202 151h156M207 135h146M230 151V68h7v83m85 0V68h7v83M237 75l85 59m0-59-85 59M211 135l23-62 91 0 24 62M248 83v52m14-42v42m15-32v32m15-32v32m15-43v43"/><path d="M205 160q20-7 40 0t40 0 40 0 35 0"/></g>;
  if (slug === "jaipur") return <g><path d="M220 153V114h9V95h13V76h19V59h34v17h19v19h13v19h9v39Z"/>{[0,1,2].map(row=><g key={row}>{Array.from({length:row+3},(_,i)=><path key={i} d={`M${257-row*12+i*17} ${91+row*23}v-10q5-10 10 0v10Z`}/>)}</g>)}<path d="M214 154h129M221 117h113M230 96h96M244 76h68"/></g>;
  return <g><path d="M214 152h130M222 151v-46h29V89h58v16h27v46M250 89q0-35 29-38 30 3 30 38M279 52V40M220 106V73h14v33m86 0V73h14v33M218 73q9-17 18 0m82 0q9-17 18 0M267 151v-35q12-16 24 0v35M240 121v16m-9-16v16m87-16v16m9-16v16M247 98h66"/></g>;
}

function Building({ x, y, kind }: { x: number; y: number; kind: "office" | "factory" | "warehouse" }) {
  return <g transform={`translate(${x} ${y})`}>
    <path d="m-9 17 77-43 72 41-77 44Z" className={styles.buildingBase}/>
    {kind === "office" ? <><path d="M22 3v-89l45-26 44 26V3L67 29Z" className={styles.buildingFace}/><path d="m22-86 45 27 44-27M67-59v88m-45-52 45 27 44-27m-89-28 45 27 44-27m-89-28 45 27 44-27"/>{[0,1,2].map(i=><path key={i} d={`M${32+i*12} ${-68+i*7}v58m${45} ${-67+i*-14}v58`}/>)}</> : kind === "factory" ? <><path d="M9 13v-56l30 4V-62l30 4v-23l53 30v64L69 43Z" className={styles.buildingFace}/><path d="M9-43 69-8l53-31M69-8v51m22-67v-45l13-7 12 7v31M91-69l13 7 12-7m-12 7v17M21-25v19l12 7v-19m12 6V7l12 7V-5"/><path d="M83 31V7l25-15v25"/></> : <><path d="m9-22 38-40 76 42v43L70 52 9 17Z" className={styles.buildingFace}/><path d="m9-22 61 34 53-32M70 12l-23-74M70 12v40M21 14v-24l35 20v24m-35-16 35 20m-35-30 35 20m30-15V8l22-12v22"/></>}
  </g>;
}

export function CityBlueprint({ city, copy: c, nickname }: { city: CityContent; copy: CityCopy; nickname?: string }) {
  const routes = ["M124 330L290 234", "M500 338L342 248", "M480 137L335 220"];
  return <figure className={styles.blueprint} data-city-scene>
    <figcaption className={styles.diagramCaption}><span>FIG. 01 / {city.stateCode}</span><span>{c.schematic}</span><Plus size={13} aria-hidden="true"/></figcaption>
    <div className={styles.blueprintCanvas} dir="ltr">
      <svg viewBox="0 0 640 470" fill="none" aria-hidden="true" className={styles.cityDrawing}>
        <g stroke="var(--home-line)" strokeWidth=".7">{[0,1,2,3,4,5,6,7].map(i=><g key={i}><path d={`M${10+i*60} 450L${330+i*60} 265`}/><path d={`M${60+i*65} 220L${380+i*65} 405`}/></g>)}<path d="m22 309 296-171 303 174-297 172Z" strokeDasharray="3 5"/></g>
        <g stroke="var(--home-muted)" strokeWidth="1.15" opacity=".8"><Landmark slug={city.slug}/><path d="M205 166h143m-85 4h34M279 176v21" strokeDasharray="3 4"/></g>
        <g stroke="var(--home-muted)" strokeWidth="1.1" strokeLinejoin="round"><Building x={402} y={137} kind="office"/><Building x={50} y={331} kind="warehouse"/><Building x={444} y={328} kind="factory"/></g>
        <g stroke="var(--home-line)" strokeWidth="10">{routes.map(d=><path key={d} d={d}/>)}</g>
        <g stroke="var(--home-accent)" strokeWidth="1" strokeDasharray="4 5">{routes.map(d=><path key={d} d={d}/>)}</g>
        {routes.map((d,i)=><g key={d} className={styles.packet} style={{offsetPath:`path('${d}')`,animationDelay:`${i*-1.7}s`} as CSSProperties}><rect x="-6" y="-4" width="12" height="8" fill="var(--home-surface)" stroke="var(--home-accent)"/><path d="m-6-4 6 5 6-5" stroke="var(--home-accent)"/></g>)}
        <g stroke="var(--home-accent)" strokeWidth="1.2"><path d="m233 223 84-49 88 49v33l-88 51-84-51Z" className={styles.coreFace}/><path d="m233 223 84 50 88-50m-88 50v34m-76-67 68 39m26-1 66-39"/><path d="m245 216 72-41 75 43" strokeDasharray="2 4"/></g>
        <g stroke="var(--home-muted)" strokeWidth="1"><path d="M33 191h20m-10-10v20M572 412h20m-10-10v20M365 66h14m-7-7v14"/><circle cx="317" cy="372" r="6"/><path d="m304 377 13 8 14-8m-14-17v-19" strokeDasharray="2 4"/></g>
        <g fill="var(--home-muted)" fontSize="9" fontFamily="var(--font-mono),monospace"><text x="113" y="410" textAnchor="middle">SUPPLY</text><text x="516" y="412" textAnchor="middle">OPERATIONS</text><text x="477" y="210" textAnchor="middle">CUSTOMERS</text><text x="315" y="414" textAnchor="middle">CONNECTED DATA</text></g>
      </svg>
      <ProcurementTrigger className={styles.heroErp} label={c.erp}><span>ERP</span><ArrowUpRight size={15} aria-hidden="true"/></ProcurementTrigger>
      <span className={styles.cityStamp}>{nickname ?? city.name}</span>
    </div>
    <div className={styles.blueprintFoot}><MousePointer2 size={13} aria-hidden="true"/><span>{c.nodeHint}</span><span className={styles.coordinates}>{Number(city.geo.lat).toFixed(4)}° N / {Number(city.geo.lng).toFixed(4)}° E</span></div>
  </figure>;
}
