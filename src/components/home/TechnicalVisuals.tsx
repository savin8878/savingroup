import { useId } from 'react';
import styles from './TechnicalVisuals.module.css';

type SceneProps = { className?: string };

/** A static-first engineering illustration: motion only indicates data direction. */
export function OperationsScene({ className = '' }: SceneProps) {
  const id = useId();

  return (
    <svg
      className={`${styles.scene} ${className}`}
      viewBox="0 0 650 510"
      role="img"
      aria-labelledby={`${id}-title ${id}-description`}
    >
      <title id={`${id}-title`}>Connected business operations</title>
      <desc id={`${id}-description`}>
        An illustrative isometric factory. Production machines, a robot arm,
        sensors and business software exchange data through a central AI and
        automation hub.
      </desc>

      {/* Registration marks give the composition the feel of an engineering plate. */}
      <g className={styles.hairline}>
        <path d="M27 47h18M36 38v18M606 47h18M615 38v18M27 463h18M36 454v18M606 463h18M615 454v18" />
        <path d="M60 93h526M60 434h526" strokeDasharray="2 8" />
        <path d="M323 60v403" strokeDasharray="2 8" />
      </g>
      <text className={styles.micro} x="59" y="49">CONNECTED OPERATIONS / SYSTEM VIEW</text>
      <g transform="translate(532 40)">
        <circle className={styles.accent} cx="0" cy="5" r="2.5" />
        <text className={styles.micro} x="10" y="8">ENGINEERED</text>
      </g>

      {/* Floor: shallow, precisely layered isometric planes. */}
      <path fill="#e7e8df" d="M64 323 325 177 607 329 339 478Z" />
      <g className={styles.outline}>
        <path className={styles.side} d="M49 305 324 152 607 306v17L330 477 49 322Z" />
        <path className={styles.paper} d="M49 305 324 152 607 306 330 460Z" />
        <path d="M330 460v17" />
      </g>
      <g className={styles.hairline}>
        <path d="m96 278 283 155m-229-184 282 155m-230-184 283 155m-229-184 282 155m-230-184 283 155" />
        <path d="M103 335 376 181M158 365 431 212M212 395 486 242M267 425 541 272" />
      </g>

      {/* The physical and digital paths remain readable without animation. */}
      <g>
        <path className={styles.route} d="M176 271 235 303 348 239 466 305 502 285M244 372 294 344 350 375 443 323M354 222 426 182 481 210" />
        <path className={styles.flow} d="M176 271 235 303 348 239 466 305 502 285" />
        <path className={`${styles.flow} ${styles.flowReverse}`} d="M244 372 294 344 350 375 443 323" />
        <path className={styles.flow} d="M354 222 426 182 481 210" />
      </g>

      {/* CNC enclosure, with inspection window, spindle and operator console. */}
      <g className={styles.outline}>
        <path className={styles.side} d="m91 184 81-45 84 47v97l-82 47-83-47Z" />
        <path className={styles.paper} d="m91 184 83 47 82-45-84-47Z" />
        <path className={styles.paper} d="M91 184v99l83 47v-99Z" />
        <path d="M174 231v99M101 278l62 35M102 285v12m57 20v12m29-8v11m55-42v11" />
        <path className={styles.glass} d="m101 202 60 34v61l-60-34Z" />
        <path d="M110 260v-42l16 9v28l26 15m-26-26 14 8v-17M110 252l42 24m-25-47v-13m5 3v19" />
        <path className={styles.side} d="m115 257 20-11 21 12-20 11Z" />
        <path d="m136 269 0 10m-21-22v9l21 13 20-12v-9" />
        <path d="m182 239 17-10v54l-17 10Z" />
        <path className={styles.dark} d="m204 226 36-20v32l-36 20Z" />
        <path className={styles.whiteLine} d="m211 232 12-7m-12 12 21-12m-21 18 7-4" />
        <path d="m209 266 29-16m-29 22 19-11m-43 28 0-12" />
        <path className={styles.accent} d="m153 160 16-9 26 14-16 9Z" />
        <path className={styles.accentLine} d="M171 151v-18" />
        <circle className={styles.accent} cx="171" cy="130" r="3" stroke="none" />
      </g>
      <path className={styles.hairline} d="M107 178 82 164H61" />
      <text className={styles.micro} x="59" y="156">PRODUCTION</text>

      {/* Back-right business application screen and its physical stand. */}
      <g className={styles.outline}>
        <path className={styles.side} d="m449 239 38-21 34 19-38 21Z" />
        <path className={styles.paper} d="m478 204 12 7v29l-12-7Z" />
        <path className={styles.side} d="m412 110 116 64v88l-116-65-5-6v-80Z" />
        <path className={styles.paper} d="m412 106 121 67v84l-121-67Z" />
        <path d="m412 121 121 67" />
        <circle cx="420" cy="118" r="1" />
        <circle cx="426" cy="121" r="1" />
        <circle cx="432" cy="124" r="1" />
        <path className={styles.glass} d="m421 133 29 16v36l-29-16Z" />
        <path className={styles.accentLight} d="m458 153 66 36v15l-66-36Z" />
        <path d="m459 181 63 35m-63-25 63 35m-63-25 36 20" />
        <path className={styles.accentLine} d="m426 161 4-5 5 5 5-9 5 3" />
      </g>
      <path className={styles.hairline} d="M528 163h53v-25" />
      <text className={styles.micro} x="548" y="130">BUSINESS</text>
      <text className={styles.micro} x="548" y="142">SYSTEMS</text>

      {/* Central intelligence: warm, solid, intentionally the visual focal point. */}
      <g className={styles.outline}>
        <path className={styles.side} d="m289 270 66-37 81 45-67 38Z" />
        <path className={styles.paper} d="m289 270 80 45v12l-80-45Z" />
        <path className={styles.side} d="m369 315 67-37v12l-67 37Z" />
        <path fill="#dc7040" d="m297 224 57-32 73 40-58 33Z" />
        <path className={styles.accent} d="m297 224 72 41v47l-72-40Z" />
        <path fill="#a94420" d="m369 265 58-33v46l-58 34Z" />
        <path className={styles.whiteLine} d="m333 222 20-11 30 17-20 11Zm-8-5 5-3m-2 16 5-3m6 9 5-3m-3-24 5-3m27 24 5-3m-11 12 5-3m-15-29 5-3m7 10 5-3" />
        <path className={styles.whiteLine} d="m310 246 8 4m-8 3 8 4m-8 3 8 4" />
        <path className={styles.whiteLine} d="m388 270 22-12m-22 19 22-12m-22 19 13-7" />
        <circle fill="#ffe7bc" cx="356" cy="287" r="2.5" stroke="none" />
      </g>
      <text className={styles.whiteLabel} x="312" y="261" transform="rotate(29 312 261)">AI ENGINE</text>
      <path className={styles.accentLine} d="m354 190 0-53" strokeDasharray="2 4" />
      <rect className={styles.paper} x="306" y="110" width="99" height="26" rx="3" />
      <text className={styles.surfaceLabel} x="355" y="127" textAnchor="middle">INTELLIGENCE</text>

      {/* Robotic cell: orange joints, articulated links and a small gripper. */}
      <g className={styles.outline}>
        <path className={styles.side} d="m148 358 60-33 65 36-60 34Z" />
        <path className={styles.paper} d="m148 351 60-34 65 37-60 34Z" />
        <path d="M148 351v7m65 30v7m60-41v7" />
        <path className={styles.side} d="m180 342 26-15 28 15v21l-27 15-27-15Z" />
        <path className={styles.paper} d="m180 342 26-15 28 15-27 16Z" />
        <path className={styles.side} d="m198 333-15-47 12-6 18 49Z" />
        <path className={styles.paper} d="m206 334-17-43-11 0 19 49Z" />
        <path className={styles.paper} d="m185 283 32-43 12 5-31 48Z" />
        <path className={styles.side} d="m198 293 31-48 5 9-28 43Z" />
        <path className={styles.paper} d="m219 246 36 20 5-10-32-23Z" />
        <path className={styles.side} d="m255 266 5-10 8 6-5 12Z" />
        <circle className={styles.accent} cx="203" cy="336" r="9" />
        <circle className={styles.accent} cx="188" cy="289" r="9" />
        <circle className={styles.accent} cx="223" cy="243" r="8" />
        <circle className={styles.paper} cx="203" cy="336" r="3" />
        <circle className={styles.paper} cx="188" cy="289" r="3" />
        <circle className={styles.paper} cx="223" cy="243" r="2.5" />
        <path d="m262 270 6 4-1 13-7 3m3-16-9 7v9l5 3" />
        <path d="m179 304-9-19 36-54 13-3" />
      </g>

      {/* Conveyor and products, downstream from the automation cell. */}
      <g className={styles.outline}>
        <path className={styles.side} d="m365 370 88-49 77 43v13l-86 48-79-43Z" />
        <path className={styles.paper} d="m365 370 88-49 77 43-86 48Z" />
        <path d="M444 412v13m-66-36v14m132-16v14m-63 27v12" />
        {[0, 1, 2, 3, 4, 5].map((index) => (
          <path key={index} d={`m${376 + index * 13} ${368 - index * 7.2} 65 36`} />
        ))}
        <path className={styles.paper} d="m414 343 23-13 29 16v23l-23 13-29-16Z" />
        <path className={styles.side} d="m443 359 23-13v23l-23 13Z" />
        <path d="m414 343 29 16m-15-23 29 16" />
        <path className={styles.accentLight} d="m427 336 6-3 29 16-6 4Z" />
        <path className={styles.paper} d="m457 367 17-10 22 12v18l-17 10-22-12Z" />
        <path className={styles.side} d="m479 379 17-10v18l-17 10Z" />
        <path d="m457 367 22 12" />
      </g>
      <path className={styles.hairline} d="m501 394 49 27h35" />
      <text className={styles.micro} x="534" y="436">ACTION</text>

      {/* Small gateway and sensing points keep the composition physically grounded. */}
      <g className={styles.outline}>
        <path className={styles.paper} d="m518 298 19-11 25 14v26l-19 11-25-14Z" />
        <path className={styles.side} d="m543 312 19-11v26l-19 11Z" />
        <path d="m518 298 25 14m-18-2 11 6m-11 0 11 6" />
        <path className={styles.accentLine} d="M542 300v-20" />
        <circle className={styles.accent} cx="542" cy="277" r="2.5" stroke="none" />
      </g>
      <g className={styles.accentLine}>
        <circle className={styles.paper} cx="293" cy="344" r="4" />
        <circle className={styles.paper} cx="351" cy="375" r="4" />
        <circle className={styles.paper} cx="466" cy="305" r="4" />
      </g>
      <path className={styles.hairline} d="M59 487h526" />
      <text className={styles.micro} x="59" y="503">PHYSICAL SYSTEMS. DIGITAL INTELLIGENCE.</text>
      <text className={styles.micro} x="586" y="503" textAnchor="end">ILLUSTRATIVE SYSTEM</text>
    </svg>
  );
}

/** A physical-to-digital assembly line, rendered entirely as vector geometry. */
export function IndustrialScene({ className = '' }: SceneProps) {
  const id = useId();

  return (
    <svg
      className={`${styles.scene} ${className}`}
      viewBox="0 0 720 380"
      role="img"
      aria-labelledby={`${id}-title ${id}-description`}
    >
      <title id={`${id}-title`}>From machine signals to informed action</title>
      <desc id={`${id}-description`}>
        An illustrative production machine sends sensor signals to an edge
        gateway, connected software and an operator action. Orange paths show
        data moving between the physical and digital systems.
      </desc>

      <g className={styles.hairline}>
        <path d="M30 49h660M30 300h660" strokeDasharray="2 7" />
        <path d="M38 41v16m-8-8h16M682 41v16m-8-8h16" />
        <path d="m49 251 104-60 173 99-105 60ZM293 233l73-42 75 43-73 43ZM450 228l118-69 124 72-118 68Z" />
      </g>
      <text className={styles.micro} x="30" y="24">THE FACTORY FLOOR, CONNECTED.</text>
      <text className={styles.micro} x="690" y="24" textAnchor="end">ILLUSTRATIVE SYSTEM</text>

      {/* Machine assembly: enclosure, motor, belt, guards and inspection port. */}
      <g className={styles.outline}>
        <path className={styles.side} d="m49 234 78-44 125 71v18l-78 44-125-71Z" />
        <path className={styles.paper} d="m49 234 78-44 125 71-78 44Z" />
        <path d="M174 305v18M62 261v17m171 11v17m-62 18v14" />
        <path className={styles.paper} d="M73 123 136 87l89 51v112l-63 36-89-51Z" />
        <path className={styles.side} d="m162 174 63-36v112l-63 36Z" />
        <path className={styles.paper} d="m73 123 63-36 89 51-63 36Z" />
        <path className={styles.glass} d="m85 148 62 35v71l-62-35Z" />
        <path d="m91 211 50 29m-40-25v-46l12 7v46m6-30 19 11m-19-8 19 11m-8-28v34" />
        <path className={styles.side} d="m95 217 21-12 27 16-21 12Z" />
        <path d="m95 217 0 9 27 15 21-12v-8m-21 12v8" />
        <path d="m84 132 67 38m23 12 40-23" />
        <path className={styles.dark} d="m180 180 32-18v31l-32 18Z" />
        <path className={styles.whiteLine} d="m186 185 18-10m-18 18 10-6" />
        <path d="m181 224 29-17m-29 23 20-12m-19 24 28-16" />
        <path className={styles.accentLight} d="m111 105 25-14 30 17-25 14Z" />
        <path className={styles.accent} d="m125 104 11-6 15 8-11 7Z" />
      </g>

      {/* A small conveyor makes the production context immediately legible. */}
      <g className={styles.outline}>
        <path className={styles.side} d="m189 273 58-33 63 37v11l-58 33-63-36Z" />
        <path className={styles.paper} d="m189 273 58-33 63 37-58 32Z" />
        {[0, 1, 2, 3].map((index) => (
          <path key={index} d={`m${199 + index * 13} ${272 - index * 7.2} 52 30`} />
        ))}
        <path d="M252 309v12m-50-27v15m94-14v15m-43 13v13" />
        <path className={styles.paper} d="m236 263 19-11 24 14v21l-19 11-24-14Z" />
        <path className={styles.side} d="m260 277 19-11v21l-19 11Z" />
        <path d="m236 263 24 14" />
      </g>

      {/* Sensors are attached to equipment; their signals feed the gateway. */}
      <g className={styles.accentLine}>
        <path d="M214 142v-33h79v76h42M138 105V75h155v34" strokeDasharray="3 5" />
        <circle className={styles.paper} cx="214" cy="142" r="5" />
        <circle className={styles.paper} cx="138" cy="105" r="5" />
      </g>
      <path className={styles.flow} d="M138 105V75h155v110h42" />
      <text className={styles.micro} x="226" y="97">SIGNALS</text>

      {/* Edge gateway with discrete ports and a radio link. */}
      <g className={styles.outline}>
        <path className={styles.side} d="m327 166 30-17 42 24v72l-30 17-42-24Z" />
        <path className={styles.paper} d="m327 166 42 24v72l-42-24Z" />
        <path className={styles.paper} d="m327 166 30-17 42 24-30 17Z" />
        <path d="m337 186 22 12m-22-6 22 12m-22-6 22 12m-22-6 22 12" />
        <path className={styles.dark} d="m338 219 8 4v8l-8-4Zm14 8 8 4v8l-8-4Z" />
        <path d="m379 196 11-6m-11 14 11-6m-11 14 11-6" />
        <path className={styles.accentLine} d="M359 156v-31m-5 1 5-5 5 5m-10-9 5-5 5 5" />
        <circle className={styles.accent} cx="348" cy="180" r="2.5" stroke="none" />
      </g>
      <path className={styles.route} d="M399 209h51v-77h48M399 229h37v49h87" />
      <path className={styles.flow} d="M399 209h51v-77h48" />
      <path className={`${styles.flow} ${styles.flowReverse}`} d="M399 229h37v49h87" />
      <text className={styles.micro} x="457" y="120">CONTEXT</text>

      {/* Connected operations platform: one coherent, minimal software surface. */}
      <g className={styles.outline}>
        <path className={styles.side} d="m502 83 147 28v129l-147-28-5-6V89Z" />
        <path className={styles.paper} d="m502 78 153 29v128l-153-29Z" />
        <path d="m502 97 153 29m-107-21v110" />
        <circle cx="512" cy="90" r="1.4" />
        <circle cx="519" cy="91" r="1.4" />
        <circle cx="526" cy="92" r="1.4" />
        <path d="m513 117 24 4m-24 8 18 3m-18 9 22 4m-22 9 18 3m-18 9 24 5" />
        <path className={styles.glass} d="m558 118 84 16v47l-84-16Z" />
        <path className={styles.accentLine} d="m565 153 12-10 13 8 12-13 12 10 20-1" />
        <path d="m558 181 35 7m-35 1 35 7m16-12 34 6m-34 2 34 6m-85 2 66 13" />
        <path className={styles.side} d="m553 216 35 7v24l-35-7Z" />
        <path className={styles.paper} d="m531 248 36-20 54 30-36 21Z" />
      </g>

      {/* An actionable work item, rather than an invented metric. */}
      <g className={styles.outline}>
        <path className={styles.paper} d="m523 267 123 23v45l-123-23Z" />
        <path className={styles.accent} d="m523 267 6 1v45l-6-1Z" stroke="none" />
        <path className={styles.accentLine} d="m540 292 5 6 9-10" />
        <path d="m564 288 66 13m-66-5 41 8" />
      </g>
      <text className={styles.micro} x="598" y="270">ACTION</text>

      <g className={styles.label}>
        <text x="111" y="363" textAnchor="middle">Machine + sensors</text>
        <text x="360" y="363" textAnchor="middle">Edge + connectivity</text>
        <text x="587" y="363" textAnchor="middle">Software + decisions</text>
      </g>
      <g className={styles.hairline}>
        <path d="M197 359h81m160 0h64" />
        <path d="m274 356 4 3-4 3m224-6 4 3-4 3" />
      </g>
    </svg>
  );
}
