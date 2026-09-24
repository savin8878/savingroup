"use client";

import { useEffect, useLayoutEffect, useRef, useState, type CSSProperties, type MouseEvent } from "react";
import { Check } from "lucide-react";
import { scrollToSection, useReadingState } from "./useReadingState";
import s from "./Article.module.css";

export interface TocItem { id: string; label: string }

const pad = (n: number) => String(n).padStart(2, "0");

/**
 * "On this page" list with an accent marker that slides to the section
 * being read, and keeps that section in view when the sidebar scrolls.
 * Server HTML is a complete, working list of anchor links.
 */
export function ArticleToc({ items, title }: { items: TocItem[]; title: string }) {
  const { active } = useReadingState(items.map((item) => item.id));
  const list = useRef<HTMLOListElement>(null);
  const [marker, setMarker] = useState<{ y: number; h: number } | null>(null);
  const current = Math.max(0, active);

  useLayoutEffect(() => {
    const item = list.current?.children[current] as HTMLElement | undefined;
    if (item) setMarker({ y: item.offsetTop, h: item.offsetHeight });
  }, [current, items.length]);

  // Keep the active entry visible inside the scrollable sidebar body —
  // scrolls that container only, never the page.
  useEffect(() => {
    const item = list.current?.children[current] as HTMLElement | undefined;
    const box = list.current?.closest<HTMLElement>("[data-sidebar-scroll]");
    if (!item || !box || box.scrollHeight <= box.clientHeight) return;
    const itemTop = item.getBoundingClientRect().top - box.getBoundingClientRect().top + box.scrollTop;
    const margin = 48;
    if (itemTop < box.scrollTop + margin || itemTop + item.offsetHeight > box.scrollTop + box.clientHeight - margin) {
      const reduce = window.matchMedia("(prefers-reduced-motion: reduce)").matches;
      box.scrollTo({ top: Math.max(0, itemTop - box.clientHeight / 3), behavior: reduce ? "auto" : "smooth" });
    }
  }, [current]);

  const onClick = (event: MouseEvent<HTMLAnchorElement>, id: string) => {
    if (event.metaKey || event.ctrlKey || event.shiftKey || event.button !== 0) return;
    event.preventDefault();
    scrollToSection(id);
  };

  return (
    <nav className={`${s.panel} ${s.tocPanel}`} aria-label={title}>
        <div className={s.panelHead}>
          <span>{title}</span>
          <span className={s.panelCount}>{pad(current + 1)}<i>/</i>{pad(items.length)}</span>
        </div>
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
  );
}
