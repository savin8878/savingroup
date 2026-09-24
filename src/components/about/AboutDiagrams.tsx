import styles from "./About.module.css";

/** Exploded system architecture: people, connected technology, then outcomes. */
export function ArchitectureDrawing() {
  return <svg viewBox="0 0 580 530" fill="none" className={styles.architecture} aria-hidden="true" data-about-diagram>
    <defs><pattern id="about-dots" width="22" height="22" patternUnits="userSpaceOnUse"><circle cx="1" cy="1" r=".7" fill="currentColor" opacity=".2" /></pattern></defs>
    <path fill="url(#about-dots)" d="M28 20h524v490H28z" />
    <g className={styles.drawingGuides}><path d="M290 12v497M22 265h536M67 88l446 256M67 225l446 257M67 344 513 88M67 481l446-256" strokeDasharray="3 8" /><path d="M24 23h16m-8-8v16m508-8h16m-8-8v16M24 507h16m-8-8v16m508-8h16m-8-8v16" /></g>
    <g className={styles.lowerPlane}>
      <path d="m76 362 213-121 215 123-213 122Z" /><path d="M76 362v14l215 123 213-122v-13M291 486v13" />
      <path d="m111 362 178-101 179 103-177 102Z" className={styles.planeInset} />
      <path d="m134 365 30 17 41-24 30 17 51-29m-117 51 44 25 60-34 33 18 91-52" className={styles.signalPath} pathLength="1" />
      <path d="m297 410 23 13 17-10v-30l-23-13-17 10ZM320 423v-30l17-10m-40-3 23 13" />
      <path d="m342 385 23 13 17-10v-44l-23-13-17 10ZM365 398v-44l17-10m-40-3 23 13" />
      <path d="m387 360 23 13 17-10v-61l-23-13-17 10Z" className={styles.orangeFill} /><path d="M410 373v-61l17-10m-40-3 23 13" stroke="var(--home-paper)" />
    </g>
    <g className={styles.verticalLinks} strokeDasharray="4 6"><path d="M119 148v210M462 148v210M290 246v185M290 51v190" /></g>
    <g className={styles.middlePlane}>
      <path d="m76 252 213-121 215 123-213 122Z" /><path d="M76 252v13l215 123 213-122v-12M291 376v12" />
      <path d="m160 257 82-47 55 31 52-30 78 45-133 76-54-31-52 30" className={styles.middleCircuit} pathLength="1" />
      {[{x:145,y:232},{x:269,y:160},{x:396,y:234},{x:270,y:306}].map(({x,y})=><g key={x+"-"+y} transform={`translate(${x} ${y})`}><path d="m0 0 20-12L40 0 20 12Z" /><path d="M0 0v14l20 12 20-12V0M20 12v14" /></g>)}
      <path d="m247 239 43-25 44 25-43 25Z" className={styles.processorTop} /><path d="M247 239v29l44 25 43-25v-29l-43 25Z" className={styles.processorSide} /><path d="M291 264v29m-33-42 21 12m-21-4 21 12m24-8 20-12m-20 20 20-12" stroke="#f5ddd0" />
      <path d="m272 239 18-10 19 10-18 11Z" stroke="#fff0e5" />
    </g>
    <g className={styles.upperPlane}>
      <path d="m76 143 213-122 215 124-213 122Z" /><path d="M76 143v12l215 123 213-122v-11M291 267v11" />
      <path d="m139 144 150-86 152 88-150 86Z" className={styles.planeInset} />
      <ellipse cx="290" cy="142" rx="53" ry="29" /><ellipse cx="290" cy="142" rx="37" ry="20" />
      <path d="m276 142 10 6 19-14" className={styles.signalPath} />
      {[{x:196,y:130},{x:289,y:76},{x:387,y:131},{x:290,y:190}].map(({x,y},i)=><g key={i} transform={`translate(${x} ${y})`} className={styles.person}><ellipse cx="0" cy="14" rx="14" ry="8" /><path d="M-8 10V-2c0-11 16-11 16 0v12M-4 14v-6m8 6V8" /><circle cy="-17" r="7" /></g>)}
      <path d="m216 138 21 3m106 0 23-2m-76-37v9m1 60v10" className={styles.signalPath} />
    </g>
    <g className={styles.drawingMeasures}><path d="M59 143v220m-5-220h10m-10 110h10m-10 110h10M522 145v217m-5-217h10m-10 110h10m-10 107h10" /></g>
    <g className={styles.drawingMarkers}><circle cx="59" cy="143" r="3" /><circle cx="59" cy="253" r="3" /><circle cx="59" cy="363" r="3" /></g>
  </svg>;
}

export function TeamDrawing() {
  return <svg viewBox="0 0 480 310" fill="none" aria-hidden="true" className={styles.teamDrawing} data-about-diagram>
    <g className={styles.drawingGuides}><path d="M25 155h430M240 12v285" strokeDasharray="3 7" /><circle cx="240" cy="155" r="114" /><circle cx="240" cy="155" r="86" strokeDasharray="2 7" /></g>
    <path d="m240 41 99 171H141Z" className={styles.teamTriangle} pathLength="1" />
    <path d="M240 41v114m99 57-99-57m-99 57 99-57" className={styles.teamConnections} />
    {[{x:240,y:41},{x:339,y:212},{x:141,y:212}].map(({x,y},i)=><g key={i}><rect x={x-20} y={y-20} width="40" height="40" rx="1" className={styles.teamNode} /><path d={`M${x-7} ${y}h14m-7-7v14`} /></g>)}
    <circle cx="240" cy="155" r="34" className={styles.teamCore} /><circle cx="240" cy="148" r="7" /><path d="M225 168v-3c0-15 30-15 30 0v3m-9-33 4 4m-20-4-4 4" />
    <path d="M96 284h288m-278-5-10 5 10 5m268-10 10 5-10 5" className={styles.drawingGuides} />
  </svg>;
}

export function ClarityDrawing() {
  return <svg viewBox="0 0 1080 180" fill="none" preserveAspectRatio="none" className={styles.clarityDrawing} aria-hidden="true" data-about-diagram>
    <g stroke="#65776b" strokeWidth="1"><path d="M0 30h110v27h74m20 0h108v33h172M0 90h65v35h152v-35h267M0 150h139v-29h32m20 0h84v-31h209" strokeDasharray="5 5" /></g>
    <path d="M484 90h210c65 0 65-60 135-60h251M484 90h596M484 90h210c65 0 65 60 135 60h251" className={styles.clarityPaths} pathLength="1" />
    <circle cx="520" cy="90" r="11" fill="#1a2420" stroke="#f39c70" /><circle cx="520" cy="90" r="4" fill="#f39c70" />
    <g fill="#1a2420" stroke="#f39c70"><circle cx="1050" cy="30" r="4" /><circle cx="1050" cy="90" r="4" /><circle cx="1050" cy="150" r="4" /></g>
  </svg>;
}

export function TransformationDrawing({ connected = false }: { connected?: boolean }) {
  return <svg viewBox="0 0 480 190" fill="none" className={styles.transformationDrawing} aria-hidden="true" data-about-diagram>
    <path d={connected ? "M65 97h350" : "M65 97h49v-31h32m18 0h28v67h36m19 0h37V85h30m18 0h34v12h49"} className={connected ? styles.connectedPath : styles.manualPath} pathLength="1" />
    {[65,240,415].map((x,i)=><g key={x} className={styles.transformNode}>
      <rect x={x-29} y="68" width="58" height="58" rx="1" />
      {i===0?<><path d={`M${x-10} 83h15l6 6v23h-21Zm15 0v7h6m-16 6h11m-11 6h11`} /></>:i===1?<><path d={`M${x-12} 88h9v9h-9Zm15 12h9v9h-9Zm-6-7h10v7`} /></>:<><path d={`M${x-12} 106V86m0 20h26m-20-5v-6m7 6V85m7 16V91`} /></>}
      {connected?<g className={styles.transformCheck}><circle cx={x+27} cy="68" r="10" /><path d={`m${x+23} 68 3 3 5-6`} /></g>:<path d={`M${x} 138v8m-4 4 4-4 4 4`} className={styles.manualPath} />}
    </g>)}
    {connected && <path d="M65 48V30h350v18" className={styles.feedbackPath} />}
  </svg>;
}
