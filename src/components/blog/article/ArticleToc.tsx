"use client";

import { useLayoutEffect, useRef, useState, type CSSProperties, type MouseEvent } from "react";
import { Check } from "lucide-react";
import { getArticleCopy } from "../copy/article-copy";
import { scrollToSection, useReadingState } from "./useReadingState";
import s from "./Article.module.css";

export interface TocItem { id: string; label: string }

const pad = (n: number) => String(n).padStart(2, "0");

/**
 * Sidebar reading panel: progress (% read · minutes left) and the
 * "On this page" list with an accent marker that slides to the section
 * being read. Server HTML is a complete, working list of anchor links.
 */
export function ArticleToc({ items, title, locale, readTime }: { items: TocItem[]; title: string; locale: string; readTime: number }) {
  const copy = getArticleCopy(locale);
  const { active, progress } = useReadingState(items.map((item) => item.id));
  const list = useRef<HTMLOListElement>(null);
  const [marker, setMarker] = useState<{ y: number; h: number } | null>(null);
  const current = Math.max(0, active);
  const percent = Math.round(progress * 100);
  const minutesLeft = Math.max(0, Math.ceil(readTime * (1 - progress)));

  useLayoutEffect(() => {
    const item = list.current?.children[current] as HTMLElement | undefined;
    if (item) setMarker({ y: item.offsetTop, h: item.offsetHeight });
  }, [current, items.length]);

  const onClick = (event: MouseEvent<HTMLAnchorElement>, id: string) => {
    if (event.metaKey || event.ctrlKey || event.shiftKey || event.button !== 0) return;
    event.preventDefault();
    scrollToSection(id);
  };

  return (
    <div className={s.readingPanel}>
      <nav className={`${s.panel} ${s.tocPanel}`} aria-label={title}>
        <div className={s.panelHead}>
          <span>{title}</span>
          <span className={s.panelCount}>{pad(current + 1)}<i>/</i>{pad(items.length)}</span>
        </div>
        <div className={s.track} role="progressbar" aria-label={copy.progress} aria-valuemin={0} aria-valuemax={100} aria-valuenow={percent}><span style={{ transform: `scaleX(${progress})` }} /></div>
        <p className={s.progressLine}><span><b>{percent}%</b> {copy.read}</span><span>{progress >= 0.995 ? copy.finished : copy.minLeft(minutesLeft)}</span></p>
        <ol ref={list} className={s.toc} style={marker ? ({ "--marker-y": `${marker.y}px`, "--marker-h": `${marker.h}px` } as CSSProperties) : undefined} data-ready={marker ? "true" : undefined}>
          {items.map((item, index) => {
            const state = index === current && active >= 0 ? "active" : index < current ? "done" : "todo";
            return (
              <li key={item.id} data-state={state}>
                <a href={`#${item.id}`} onClick={(event) => onClick(event, item.id)} aria-current={state === "active" ? "location" : undefined}>
                  <span className={s.tocNum}>{state === "done" ? <Check size={11} strokeWidth={2} aria-hidden="true" /> : pad(index + 1)}</span>
                  <span className={s.tocLabel}>{item.label}</span>
                </a>
              </li>
            );
          })}
        </ol>
      </nav>
    </div>
  );
}
