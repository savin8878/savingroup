"use client";

import {
  useCallback,
  useEffect,
  useId,
  useMemo,
  useRef,
  useState,
  type CSSProperties,
  type FocusEvent,
  type KeyboardEvent,
  type MouseEvent,
  type RefObject,
} from "react";
import { ArrowLeft, ArrowRight, Check, CornerDownRight, FileText, Pause, Play, RotateCcw } from "lucide-react";
import type { IndustryKey } from "@/lib/country-content";
import { IndustryArt } from "./IndustryFigures";
import { INDUSTRY_WORKFLOWS, type WorkflowStage } from "./workflows";
import { getKitCopy } from "./copy/kit-copy";
import s from "./WorkflowSimulator.module.css";

const pad = (n: number) => String(n).padStart(2, "0");
/** Share of a stage's time after which its record "ticks" from Updating to done. */
const TICK = 0.56;

export interface WorkflowSimulatorProps {
  industry: IndustryKey;
  /** Caption prefix, e.g. "FIG. 03". */
  figure?: string;
  /** Route locale — picks the UI copy (buttons, labels, hints). */
  locale: string;
  /** Start playing once at least a third of it is on screen (default true). Never under reduced motion. */
  autoplay?: boolean;
  className?: string;
  id?: string;
}

/** Page motion (closest `[data-motion]` from <BlogMotion>/<HomeMotion>), device preference, tab visibility. */
export function useMotionPreference(ref: RefObject<HTMLElement | null>) {
  const [motion, setMotion] = useState({ reduced: false, paused: false });
  useEffect(() => {
    const element = ref.current;
    if (!element) return;
    const preference = window.matchMedia("(prefers-reduced-motion: reduce)");
    const container = element.closest("[data-motion]");
    const sync = () => setMotion({ reduced: preference.matches, paused: document.hidden || container?.getAttribute("data-motion") === "paused" });
    sync();
    preference.addEventListener("change", sync);
    document.addEventListener("visibilitychange", sync);
    const observer = new MutationObserver(sync);
    if (container) observer.observe(container, { attributes: true, attributeFilter: ["data-motion"] });
    return () => {
      observer.disconnect();
      preference.removeEventListener("change", sync);
      document.removeEventListener("visibilitychange", sync);
    };
  }, [ref]);
  return motion;
}

/** Most recent earlier stage whose record differs — what this record is linked to. */
function linkedCode(stages: WorkflowStage[], index: number) {
  for (let i = index - 1; i >= 0; i--) if (stages[i].record.code !== stages[index].record.code) return stages[i].record.code;
  return null;
}

/**
 * "See it run" — one sample transaction walks through an industry workflow,
 * stage by stage, next to that industry's line drawing. The drawing wrapper
 * carries `data-active-stage="<stage id>"` so <IndustryArt> can highlight the
 * matching `<g data-stage>` region.
 *
 * - Server HTML: stage 1 complete (title, detail, record, event), controls disabled until hydrated.
 * - Autoplay only while ≥ ⅓ on screen (or half the viewport) and page motion runs; never under reduced motion.
 * - Selecting a stage (tab, drawing region, prev/next) or keyboard focus on a tab pauses autoplay.
 * - Tabs: roving tabindex; ←/→ (mirrored in RTL), Home/End move focus; Enter/Space select.
 * - Every stage's copy is rendered and stacked in one grid cell, so switching stages never shifts the layout.
 */
export function WorkflowSimulator({ industry, figure, locale, autoplay = true, className = "", id }: WorkflowSimulatorProps) {
  const workflow = INDUSTRY_WORKFLOWS[industry] ?? INDUSTRY_WORKFLOWS.manufacturing;
  const { stages } = workflow;
  const total = stages.length;
  const copy = getKitCopy(locale).sim;

  const root = useRef<HTMLElement>(null);
  const tabs = useRef<(HTMLButtonElement | null)[]>([]);
  const elapsed = useRef(0);
  const tickedRef = useRef(true);
  const timerState = useRef<"idle" | "live">("idle");
  const uid = useId();
  const titleId = `${uid}-title`;
  const panelId = `${uid}-panel`;
  const tabId = (index: number) => `${uid}-tab-${index}`;

  const [mounted, setMounted] = useState(false);
  const [step, setStep] = useState(0);
  const [playing, setPlaying] = useState(false);
  const [complete, setComplete] = useState(false);
  const [ticked, setTicked] = useState(true);
  const [inView, setInView] = useState(false);
  const [animate, setAnimate] = useState(false);
  const [direction, setDirection] = useState<1 | -1>(1);
  const [replay, setReplay] = useState(0);
  const [tabFocus, setTabFocus] = useState<number | null>(null);
  const [announcement, setAnnouncement] = useState("");
  const motion = useMotionPreference(root);

  const stage = stages[step];
  const canPlay = !motion.reduced && !motion.paused;
  const running = mounted && playing && inView && canPlay && !complete;

  const trail = useMemo(() => {
    const out: { code: string; first: number }[] = [];
    stages.forEach((item, index) => { if (!out.some((entry) => entry.code === item.record.code)) out.push({ code: item.record.code, first: index }); });
    return out;
  }, [stages]);
  const currentChip = trail.findIndex((entry) => entry.code === stage.record.code);
  const sampleCode = workflow.sample.split(" · ")[0];

  useEffect(() => { setMounted(true); setPlaying(autoplay); }, [autoplay]);

  /** Progress of the current stage (0–1), written straight to the DOM — no re-render per frame. */
  const setProgress = useCallback((value: number, live: boolean) => {
    const element = root.current;
    if (!element) return;
    element.querySelectorAll<HTMLElement>("[data-progress-host]").forEach((node) => node.style.setProperty("--progress", value.toFixed(4)));
    const next = live ? "live" : "idle";
    if (timerState.current !== next) { timerState.current = next; element.setAttribute("data-timer", next); }
  }, []);

  // Play only while a meaningful part is visible: a third of it, or half the viewport for very tall layouts.
  useEffect(() => {
    const element = root.current;
    if (!element || !("IntersectionObserver" in window)) { setInView(true); return; }
    const observer = new IntersectionObserver(([entry]) => {
      const needed = Math.min(entry.boundingClientRect.height / 3, window.innerHeight * 0.5);
      setInView(entry.isIntersecting && entry.intersectionRect.height >= needed - 1);
    }, { threshold: [0, 0.1, 0.2, 0.25, 0.3, 0.34, 0.4, 0.5, 0.6, 0.75, 0.9, 1] });
    observer.observe(element);
    return () => observer.disconnect();
  }, []);

  // A stage that stops mid-way (paused, scrolled away) shows its finished record rather than "Updating…".
  useEffect(() => {
    if (!running && !tickedRef.current) { tickedRef.current = true; setTicked(true); }
  }, [running]);

  // The walkthrough clock.
  useEffect(() => {
    if (!running) return;
    const duration = stages[step].durationMs;
    if (elapsed.current === 0) { tickedRef.current = false; setTicked(false); setAnimate(true); }
    setProgress(elapsed.current / duration, true);
    let frame = 0;
    let previous = performance.now();
    const tick = (now: number) => {
      elapsed.current += Math.min(now - previous, 100);
      previous = now;
      const portion = Math.min(1, elapsed.current / duration);
      setProgress(portion, true);
      if (!tickedRef.current && portion >= TICK) { tickedRef.current = true; setTicked(true); }
      if (portion < 1) { frame = requestAnimationFrame(tick); return; }
      elapsed.current = 0;
      if (step >= total - 1) {
        setProgress(1, false);
        setComplete(true);
        setPlaying(false);
      } else {
        setProgress(0, true);
        setDirection(1);
        setStep(step + 1);
      }
    };
    frame = requestAnimationFrame(tick);
    return () => cancelAnimationFrame(frame);
  }, [running, step, stages, total, replay, setProgress]);

  const announceStage = useCallback((index: number) => {
    setAnnouncement(`${copy.stageOf(index + 1, total)}: ${stages[index].label}. ${stages[index].event}.`);
  }, [copy, stages, total]);

  /** User-driven navigation: jump, show the finished record, pause autoplay. */
  const select = useCallback((index: number) => {
    const next = Math.max(0, Math.min(total - 1, index));
    elapsed.current = 0;
    setProgress(0, false);
    tickedRef.current = true;
    setTicked(true);
    setPlaying(false);
    setComplete(false);
    setAnimate(true);
    setDirection(next >= step ? 1 : -1);
    setStep(next);
    announceStage(next);
  }, [announceStage, setProgress, step, total]);

  const restart = useCallback(() => {
    elapsed.current = 0;
    setProgress(0, false);
    tickedRef.current = true;
    setTicked(true);
    setComplete(false);
    setAnimate(true);
    setDirection(-1);
    setStep(0);
    setReplay((value) => value + 1);
    setPlaying(canPlay);
    announceStage(0);
  }, [announceStage, canPlay, setProgress]);

  const togglePlay = () => {
    if (complete) { restart(); return; }
    setPlaying((value) => !value);
  };

  const onTabKey = (event: KeyboardEvent<HTMLButtonElement>, index: number) => {
    const rtl = getComputedStyle(event.currentTarget).direction === "rtl";
    let next = index;
    if (event.key === "ArrowRight") next = (index + (rtl ? total - 1 : 1)) % total;
    else if (event.key === "ArrowLeft") next = (index + (rtl ? 1 : total - 1)) % total;
    else if (event.key === "Home") next = 0;
    else if (event.key === "End") next = total - 1;
    else return;
    event.preventDefault();
    tabs.current[next]?.focus();
  };
  const onTabFocus = (event: FocusEvent<HTMLButtonElement>, index: number) => {
    setTabFocus(index);
    // Keyboard exploration holds the walkthrough still (WAI carousel pattern).
    if (event.currentTarget.matches(":focus-visible")) setPlaying(false);
  };
  const onTablistBlur = (event: FocusEvent<HTMLDivElement>) => {
    if (!event.currentTarget.contains(event.relatedTarget as Node | null)) setTabFocus(null);
  };
  const onArtClick = (event: MouseEvent<HTMLDivElement>) => {
    const region = (event.target as Element).closest?.("[data-stage]");
    const index = region ? stages.findIndex((item) => item.id === region.getAttribute("data-stage")) : -1;
    if (index >= 0) select(index);
  };

  const rovingIndex = tabFocus ?? step;
  const stateOf = (index: number) => (complete || index < step ? "done" : index === step ? "current" : "pending");
  const playLabel = motion.reduced ? copy.autoplayOff : motion.paused ? copy.motionPaused : complete ? copy.replay : playing ? copy.pause : copy.play;
  const PlayIcon = complete && canPlay ? RotateCcw : playing && canPlay ? Pause : Play;
  const hint = motion.reduced ? copy.reducedHint : motion.paused && mounted ? copy.pausedHint : copy.drawingHint;
  const syncedCount = complete ? total : step + (ticked ? 1 : 0);

  return (
    <section
      ref={root}
      id={id}
      className={`${s.sim} ${className}`}
      aria-labelledby={titleId}
      data-embed=""
      data-industry={industry}
      data-running={running}
      data-reduced={motion.reduced}
      data-animate={animate && !motion.reduced}
      data-complete={complete}
      style={{ "--count": total, "--dir": direction } as CSSProperties}
    >
      <div className={s.frame}>
        <header className={s.head}>
          <div className={s.headCopy}>
            <span className={s.eyebrow}><i aria-hidden="true" />{figure ? `${figure} / ` : ""}{workflow.eyebrow}</span>
            <h3 id={titleId} className={s.title}>{workflow.title}</h3>
            <p className={s.description}>{workflow.description}</p>
          </div>
          <div className={s.sample}>
            <span>{copy.sampleLabel}</span>
            <strong>{workflow.sample}</strong>
          </div>
        </header>

        <div className={s.timeline} role="tablist" aria-label={copy.stagesLabel} data-progress-host="" onBlur={onTablistBlur}>
          {stages.map((item, index) => {
            const state = stateOf(index);
            return (
              <button
                key={item.id}
                ref={(node) => { tabs.current[index] = node; }}
                id={tabId(index)}
                type="button"
                role="tab"
                className={s.tab}
                aria-selected={index === step}
                aria-controls={panelId}
                tabIndex={index === rovingIndex ? 0 : -1}
                data-state={state}
                onClick={() => select(index)}
                onKeyDown={(event) => onTabKey(event, index)}
                onFocus={(event) => onTabFocus(event, index)}
              >
                <span className={s.tabNum} aria-hidden="true">{state === "done" ? <Check size={11} strokeWidth={2} /> : null}{pad(index + 1)}</span>
                <span className={s.tabLabel}>{item.label}</span>
                <i className={s.tabBar} aria-hidden="true" />
              </button>
            );
          })}
        </div>

        <div id={panelId} className={s.panel} role="tabpanel" aria-labelledby={tabId(step)} tabIndex={0}>
          <div className={s.stack}>
            {stages.map((item, index) => (
              <div key={item.id} className={`${s.layer} ${s.intro}`} data-active={index === step} aria-hidden={index === step ? undefined : true}>
                <div>
                  <span className={s.kicker}>{pad(index + 1)} / {item.label}</span>
                  <h4 className={s.stageTitle}>{item.title}</h4>
                </div>
                <p>{item.detail}</p>
              </div>
            ))}
          </div>

          <div className={s.workspace}>
            <div className={s.scene}>
              <div className={s.sceneBar}>
                <span><i aria-hidden="true" data-live={running} />{copy.liveView} · {pad(step + 1)} {stage.label}</span>
                <span>{sampleCode}</span>
              </div>
              <div className={s.art} data-active-stage={stage.id} data-stage-state={ticked ? "done" : "working"} onClick={onArtClick}>
                <IndustryArt industry={industry} />
              </div>
              <div className={s.sceneFoot}>
                <div className={s.handoff}>
                  <span>{copy.handoff}</span>
                  <strong>{stage.owner}</strong>
                </div>
                <div className={s.trail} aria-label={copy.trail} role="group">
                  <span className={s.trailLabel}>{copy.trail}</span>
                  <ol>
                    {trail.map((entry, index) => {
                      const state = entry.code === stage.record.code ? (complete ? "done" : "current") : complete || entry.first < step ? "done" : "pending";
                      return <li key={entry.code} data-state={state} data-recent={index === currentChip - 1 || undefined}>{entry.code}</li>;
                    })}
                  </ol>
                </div>
              </div>
            </div>

            <div className={`${s.stack} ${s.doc}`}>
              {stages.map((item, index) => {
                const active = index === step;
                const phase = active && !ticked ? "working" : "done";
                const link = linkedCode(stages, index);
                return (
                  <article key={item.id} className={`${s.layer} ${s.record}`} data-active={active} data-phase={phase} aria-hidden={active ? undefined : true} aria-label={`${item.record.doc} ${item.record.code}`}>
                    <div className={s.docHead}>
                      <FileText size={16} strokeWidth={1.4} aria-hidden="true" />
                      <span>{item.record.doc}</span>
                      <code>{item.record.code}</code>
                    </div>
                    <div className={s.status}>
                      <span className={s.pill} data-state={phase}>
                        {phase === "working" ? <i aria-hidden="true" /> : <Check size={12} strokeWidth={2.2} aria-hidden="true" />}
                        <span>{phase === "working" ? copy.updating : item.record.status}</span>
                      </span>
                      <span className={s.statusStep}>{pad(index + 1)} / {pad(total)}</span>
                    </div>
                    <dl className={s.fields}>
                      {item.record.fields.map(([label, value], k) => (
                        <div key={label} style={{ "--i": k } as CSSProperties}>
                          <dt>{label}</dt>
                          <dd>{value}</dd>
                        </div>
                      ))}
                    </dl>
                    <div className={s.docFoot}>
                      <CornerDownRight size={14} aria-hidden="true" />
                      <span>{link ? copy.linkedTo(link) : copy.origin}</span>
                    </div>
                  </article>
                );
              })}
            </div>
          </div>

          <div className={s.event} data-phase={ticked || complete ? "done" : "working"}>
            <span className={s.eventIcon} aria-hidden="true">{ticked || complete ? <Check size={13} strokeWidth={2.2} /> : <i />}</span>
            <span className={s.stack}>
              {stages.map((item, index) => (
                <span key={item.id} className={`${s.layer} ${s.eventText}`} data-active={index === step} aria-hidden={index === step ? undefined : true}>{item.event}</span>
              ))}
            </span>
            <span className={s.eventTag}>{complete ? copy.complete : copy.synced(syncedCount, total)}</span>
          </div>
          <p className={s.srOnly} role="status" aria-live="polite" aria-atomic="true">{announcement}</p>
        </div>

        <div className={s.controls}>
          <div className={s.playback}>
            <button
              type="button"
              className={s.play}
              onClick={togglePlay}
              disabled={!mounted || !canPlay}
              aria-label={complete ? copy.replayAria : playing && canPlay ? copy.pauseAria : copy.playAria}
            >
              <PlayIcon size={15} aria-hidden="true" /><span>{playLabel}</span>
            </button>
            <button type="button" className={s.restart} onClick={restart} disabled={!mounted} aria-label={copy.restartAria} title={copy.restartAria}>
              <RotateCcw size={15} aria-hidden="true" />
            </button>
          </div>
          <div className={s.progress}>
            <div className={s.track} data-progress-host="" aria-hidden="true">
              {stages.map((item, index) => <span key={item.id} data-state={stateOf(index)} />)}
            </div>
            <span>{complete ? copy.complete : copy.stageOf(step + 1, total)}</span>
          </div>
          <div className={s.steps}>
            <button type="button" disabled={!mounted || step === 0} onClick={() => select(step - 1)} aria-label={copy.prevAria}>
              <ArrowLeft size={16} className={s.dirIcon} aria-hidden="true" />
            </button>
            <button type="button" disabled={!mounted || step === total - 1} onClick={() => select(step + 1)} aria-label={copy.nextAria}>
              <span>{copy.next}</span><ArrowRight size={16} className={s.dirIcon} aria-hidden="true" />
            </button>
          </div>
        </div>
        <p className={s.foot}>
          <span>{copy.disclaimer}</span>
          <span className={s.hint} data-kind={motion.reduced ? "reduced" : motion.paused && mounted ? "paused" : "tip"}>{hint}</span>
        </p>
      </div>
    </section>
  );
}

export default WorkflowSimulator;
