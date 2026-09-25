import type { CSSProperties } from "react";
import type { TransportMode } from "./procurement-data";
import styles from "./Procurement.module.css";

function Document({ x = 0, y = 0, kind = "PR", accent = false }: { x?: number; y?: number; kind?: string; accent?: boolean }) {
  return <g transform={`translate(${x} ${y})`} className={accent ? styles.documentAccent : styles.documentGlyph}><path d="M-19-27H8l11 11v43h-38Z" /><path d="M8-27v12h11M-11 9h22m-22 7h15" /><text x="0" y="1" textAnchor="middle">{kind}</text></g>;
}

function Envelope() {
  return <g className={styles.envelope}><rect x="-13" y="-9" width="26" height="18" rx="2" /><path d="m-12-8 12 9 12-9" /></g>;
}

export function Warehouse({ x, y, name = "WAREHOUSE" }: { x: number; y: number; name?: string }) {
  return <g transform={`translate(${x} ${y})`} className={styles.warehouse}><path d="M0 30 75 0l75 30v104H0Z" /><path d="M-8 30 75-4l83 34M13 41h124M24 66h74v68H24m0-54h74m-74 12h74m-74 12h74m-74 12h74m14-50h20v27h-20Z" /><path d="M26 68h70v65H26Z" className={styles.door} /><path d="M28 77h66m-66 10h66m-66 10h66m-66 10h66m-66 10h66" /><text x="75" y="54" textAnchor="middle">{name}</text></g>;
}

export function Pallet({ x = 0, y = 0 }: { x?: number; y?: number }) {
  return <g transform={`translate(${x} ${y})`} className={styles.pallet}><path d="M-22-30h44v30h-44Zm0 0 8-6h44l-8 6m0 0 8-6v30L22 0M0-30V0m-22-15h44" /><path d="M-26 2h54v5h-54Zm5 5v5m19-5v5m19-5v5" /></g>;
}

export function Truck() {
  return <g className={styles.truck}><path d="M-125-85H25v75h-150Z" className={styles.cargoBox} /><path d="M25-61h47l29 32v25H25Zm9 8v28h56L68-53Z" /><path d="M-132-9H105v9h-237Zm167-9h13m-160-62v65m13-65v65m13-65v65m13-65v65m13-65v65m13-65v65m13-65v65m13-65v65m13-65v65m13-65v65" /><path d="M89-15h11m-229 0h8" className={styles.vehicleLights} />{[-91,-61,70].map(x=><g key={x} transform={`translate(${x} 0)`}><circle r="14" className={styles.tyre} /><g className={styles.wheel}><circle r="7" /><path d="M-7 0H7M0-7V7" /></g></g>)}<text x="-49" y="-39" textAnchor="middle">SG / LOGISTICS</text></g>;
}

export function Ship() {
  return <g className={styles.ship}><path d="M-152-12h321l-38 48h-226l-41-21Z" className={styles.hull} /><path d="M-118-12v-52h41v52m-32-52v-22h18v22m-24 14h31m-31 12h31m-23-48v-16m-6 0h15" /><path d="M-125 9h259m-248 12H121" />{[-65,-8,49].map((x,i)=><g key={x}><rect x={x} y="-49" width="52" height="36" className={i===1?styles.containerAccent:styles.containerBox} /><path d={`M${x+9}-44v26m9-26v26m9-26v26m9-26v26m9-26v26`} />{i<2&&<><rect x={x} y="-85" width="52" height="36" className={styles.containerBox}/><path d={`M${x+9}-80v26m9-26v26m9-26v26m9-26v26m9-26v26`} /></>}</g>)}<path d="M-92 30h26m168-57v-69m-8 7h16" /><text x="28" y="6" textAnchor="middle">SAVIN / CARGO</text></g>;
}

export function Aircraft() {
  return <g className={styles.aircraft}><path d="M-137-7-164-57h19l51 47 105-6L-15-92H5l68 73 54 4c36 3 58 12 58 18 0 9-38 15-62 16l-57 1-69 65h-20l29-68-106-6-43 22h-18l23-32Z" /><path d="m131-12 12 14 31 1m-48-13-5 14M-87-1H116m-60 18-8 39h18l20-40m-58-34L9-54h20l24 36" /><path d="M-75-4h110" strokeDasharray="4 7" /><circle cx="-148" cy="-49" r="3" className={styles.vehicleLights} /><text x="-30" y="11" textAnchor="middle">SG AIR CARGO</text></g>;
}

function OfficeNetwork({ step }: { step: number }) {
  const names = ["REQUISITION", "APPROVAL", "RFQ", "QUOTATIONS", "PURCHASE ORDER"];
  const codes = ["PR", "OK", "RFQ", "BID", "PO"];
  return <svg className={styles.sceneSvg} viewBox="0 0 780 410" fill="none" aria-hidden="true">
    <defs><pattern id={`procurement-grid-${step}`} width="24" height="24" patternUnits="userSpaceOnUse"><path d="M24 0H0V24" className={styles.gridLine} /></pattern></defs>
    <path d="M0 0h780v410H0Z" fill={`url(#procurement-grid-${step})`} />
    <text x="32" y="32" className={styles.annotation}>PURCHASING / INFORMATION FLOW</text><text x="747" y="32" textAnchor="end" className={styles.annotation}>PR-0241 → PO-0089</text>
    <path d="M78 176H702" className={styles.routeBase} />
    <path d={`M78 176H${78+step*156}`} className={styles.routeActive} />
    {names.map((name,i)=><g key={name} transform={`translate(${78+i*156} 176)`} className={i===step?styles.currentStation: i<step?styles.completedStation:styles.station}>
      <rect x="-49" y="-61" width="98" height="116" rx="2" /><Document kind={codes[i]} accent={i===step} /><text y="78" textAnchor="middle">{name}</text><text y="-77" textAnchor="middle" className={styles.stationIndex}>0{i+1}</text>
      {i<step&&<g transform="translate(40 -53)"><circle r="10" className={styles.checkCircle}/><path d="m-4 0 3 3 6-7" /></g>}
    </g>)}
    {step>0&&<g transform={`translate(${78+(step-1)*156} 176)`}><g className={styles.movingMessage}><Envelope /></g></g>}
    {step===0&&<g className={styles.stockSignal}><path d="M78 296v-43" className={styles.routeActive}/><rect x="32" y="300" width="170" height="67" className={styles.noteBox}/><text x="48" y="326" className={styles.noteTitle}>LOW STOCK / DRV-240</text><text x="48" y="350" className={styles.noteText}>6 available · 30 required</text><circle cx="185" cy="314" r="3" className={styles.accentDot}/></g>}
    {(step===2||step===3)&&<g>
      {[270,390,510].map((x,i)=><g key={x}><path d={`M${step===2?390:546} 239V278H${x}V315`} className={styles.supplierWire}/><g transform={`translate(${x} 340)`}><rect x="-47" y="-24" width="94" height="48" className={i===0&&step===3?styles.selectedQuote:styles.noteBox}/><text textAnchor="middle" y="-3" className={styles.noteTitle}>SUPPLIER {String.fromCharCode(65+i)}</text><text textAnchor="middle" y="15" className={styles.noteText}>{step===2?"RFQ RECEIVED":["₹6,500 / UNIT","₹6,750 / UNIT","₹6,900 / UNIT"][i]}</text></g><g className={step===2?styles.supplierOutgoing:styles.supplierIncoming} style={{"--branch":`${x-390}px`,"--delay":`${i*.3}s`} as CSSProperties}><Envelope /></g></g>)}
    </g>}
    {step===1&&<g className={styles.approvalStamp}><circle cx="390" cy="330" r="25" /><path d="m377 330 9 9 17-20" /><text x="430" y="327" className={styles.noteTitle}>BUDGET + REQUIREMENT</text><text x="430" y="349" className={styles.noteText}>Reviewed by department lead</text></g>}
    {step===4&&<g className={styles.orderHandoff}><path d="M702 239v56H460" className={styles.routeActive}/><Document x={425} y={328} kind="PO" accent/><text x="476" y="331" className={styles.noteTitle}>SUPPLIER ACKNOWLEDGED</text><text x="476" y="352" className={styles.noteText}>24 units · ₹1,56,000 subtotal</text></g>}
    <path d="M24 390h732" className={styles.gridLine}/><text x="32" y="380" className={styles.annotation}>EVERY HANDOFF KEEPS THE SAME CONTEXT</text>
  </svg>;
}

function LogisticsScene({ mode, planning, receipt }: { mode: TransportMode; planning: boolean; receipt: boolean }) {
  return <svg className={styles.sceneSvg} viewBox="0 0 780 410" fill="none" aria-hidden="true" data-transport={mode} data-planning={planning} data-receipt={receipt}>
    <defs><pattern id="procurement-logistics-grid" width="24" height="24" patternUnits="userSpaceOnUse"><circle cx="1" cy="1" r=".7" className={styles.gridDot}/></pattern></defs>
    <path d="M0 0h780v410H0Z" fill="url(#procurement-logistics-grid)"/>
    <text x="30" y="32" className={styles.annotation}>{receipt?"RECEIVING / INVENTORY UPDATE":planning?"LOGISTICS / LOAD & ROUTE PLANNING":"LOGISTICS / SHIPMENT IN MOTION"}</text><text x="750" y="32" textAnchor="end" className={styles.annotation}>SHP-0089</text>
    {(mode==="road"||receipt)&&<>
      <g className={styles.distantBuildings}><path d="M220 227v-70h63v70m-52-56h13v13h-13Zm27 0h13v13h-13ZM302 227v-100h74v100m-62-81h15v15h-15Zm27 0h15v15h-15ZM396 227v-49h49v49m25 0v-85h52v85m-44-68h13v12h-13Z" /></g>
      <Warehouse x={24} y={139} name="SUPPLIER" /><Warehouse x={603} y={139} name="YOUR PLANT" />
      <path d="M0 293h780M0 348h780" className={styles.roadEdge}/><path d="M0 321h780" strokeDasharray="24 18" className={styles.roadLane}/>
      <g className={receipt?styles.receiptTruck:planning?styles.plannedTruck:styles.movingTruck}><g transform="translate(0 299) scale(.76)"><Truck /></g></g>
      {planning&&<g className={styles.loadingPallet}><Pallet /></g>}
      {receipt&&<><g className={styles.unloadingPallet}><Pallet /></g><g className={styles.receiptSignal}><path d="M669 158v-58H538" className={styles.routeActive}/><rect x="371" y="74" width="167" height="53" className={styles.selectedQuote}/><text x="455" y="96" textAnchor="middle" className={styles.noteTitle}>INVENTORY UPDATED</text><text x="455" y="115" textAnchor="middle" className={styles.noteText}>6 + 24 = 30 units</text></g></>}
      <text x="35" y="376" className={styles.annotation}>PICKUP SCAN</text><text x="745" y="376" textAnchor="end" className={styles.annotation}>RECEIVING GATE</text>
    </>}
    {mode==="sea"&&!receipt&&<>
      <g className={styles.port}><path d="M28 284h143v16H28M72 284V90h12v194M40 90h260v12H40ZM83 112l95 71M84 183l94-71M83 187l80 78M178 102v94m-18 0h36M44 284v-62h85v62M57 227v52m16-52v52m16-52v52m16-52v52" /><path d="M590 280h165v20H590m58-20V128h10v152m-40-152h124v10H618m97 0v73" /></g>
      <path d="M0 306h780" className={styles.waterLine}/><g className={styles.waves}><path d="M-80 327q20-10 40 0t40 0t40 0t40 0t40 0t40 0t40 0t40 0t40 0t40 0t40 0t40 0t40 0t40 0t40 0t40 0t40 0t40 0t40 0t40 0t40 0t40 0M-60 351q20-8 40 0t40 0t40 0t40 0t40 0t40 0t40 0t40 0t40 0t40 0t40 0t40 0t40 0t40 0t40 0t40 0t40 0t40 0t40 0t40 0t40 0" /></g>
      <g className={planning?styles.plannedShip:styles.movingShip}><g transform="translate(0 278) scale(.8)"><g className={styles.shipBob}><Ship /></g></g></g>
      {planning&&<g className={styles.craneLoad}><path d="M260-110V-38m-25 0h50" className={styles.craneCable}/><g transform="translate(260 0)"><Pallet /></g></g>}
      <text x="35" y="383" className={styles.annotation}>ORIGIN PORT</text><text x="745" y="383" textAnchor="end" className={styles.annotation}>DESTINATION PORT</text>
    </>}
    {mode==="air"&&!receipt&&<>
      <g className={styles.airport}><path d="M21 297V184h113v113M12 184h132M40 202h20v26H40Zm35 0h20v26H75Zm34 0h13v26h-13ZM177 297V154m-19 0h38v-34h-38Zm-8-34 9-14h37l10 14M603 290v-90l64-27 81 27v90m-130-70h116m-116 16h116" /></g>
      <path d="M0 318h780M0 351h780" className={styles.roadEdge}/><path d="M0 335h780" strokeDasharray="27 16" className={styles.roadLane}/>
      <g className={styles.clouds}><path d="M65 85h100m-85-10h44M390 122h88m-67-10h29M599 77h100m-77-10h40" /></g>
      <path d="M130 294Q340 92 650 113" className={styles.flightRoute}/>
      <g className={planning?styles.plannedAircraft:styles.movingAircraft}><g transform="scale(.7)"><Aircraft /></g></g>
      {planning&&<g className={styles.airPallet}><Pallet /></g>}
      <text x="35" y="384" className={styles.annotation}>CARGO TERMINAL</text><text x="745" y="384" textAnchor="end" className={styles.annotation}>ARRIVAL TERMINAL</text>
    </>}
    <g className={styles.routeMarkers}><circle cx="33" cy="59" r="3"/><path d="M43 59H729" strokeDasharray="3 7"/><circle cx="741" cy="59" r="3"/></g>
  </svg>;
}

export function ProcurementScene({ step, mode }: { step: number; mode: TransportMode }) {
  return step < 5 ? <OfficeNetwork step={step} /> : <LogisticsScene mode={mode} planning={step===5} receipt={step===7} />;
}
