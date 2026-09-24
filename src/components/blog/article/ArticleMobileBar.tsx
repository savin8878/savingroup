"use client";

import { useEffect, useId, useRef, useState, type MouseEvent } from "react";
import { ChevronDown } from "lucide-react";
import { getArticleCopy } from "../copy/article-copy";
import { scrollToSection, useReadingState } from "./useReadingState";
import type { TocItem } from "./ArticleToc";
import s from "./Article.module.css";

const pad = (n: number) => String(n).padStart(2, "0");

/**
 * Below the desktop breakpoint the sidebar collapses into this slim bar that
 * sticks under the site header: current section + progress, expanding into
 * the table of contents.
 */
export function ArticleMobileBar({ items, title, locale }: { items: TocItem[]; title: string; locale: string }) {
  const copy = getArticleCopy(locale);
  const { active, progress } = useReadingState(items.map((item) => item.id));
  const [open, setOpen] = useState(false);
  const panelId = useId();
  const root = useRef<HTMLDivElement>(null);
  const button = useRef<HTMLButtonElement>(null);
  const current = Math.max(0, active);
  const currentLabel = active >= 0 ? items[current]?.label : title;

  useEffect(() => {
    if (!open) return;
    const onKey = (event: KeyboardEvent) => { if (event.key === "Escape") { setOpen(false); button.current?.focus(); } };
    const onPointer = (event: PointerEvent) => { if (!root.current?.contains(event.target as Node)) setOpen(false); };
    document.addEventListener("keydown", onKey);
    document.addEventListener("pointerdown", onPointer);
    return () => { document.removeEventListener("keydown", onKey); document.removeEventListener("pointerdown", onPointer); };
  }, [open]);

  const onClick = (event: MouseEvent<HTMLAnchorElement>, id: string) => {
    if (event.metaKey || event.ctrlKey || event.shiftKey || event.button !== 0) return;
    event.preventDefault();
    setOpen(false);
    scrollToSection(id);
  };

  return (
    <div ref={root} className={s.mobileBar} data-open={open || undefined}>
      <button ref={button} type="button" className={s.mobileBarButton} onClick={() => setOpen((value) => !value)} aria-expanded={open} aria-controls={panelId} aria-label={open ? copy.closeContents : copy.openContents}>
        <span className={s.mobileBarCount}>{pad(current + 1)}<i>/</i>{pad(items.length)}</span>
        <span className={s.mobileBarLabel}>{currentLabel}</span>
        <span className={s.mobileBarPercent}>{Math.round(progress * 100)}%</span>
        <ChevronDown size={16} aria-hidden="true" className={s.mobileBarChevron} />
      </button>
      <span className={s.mobileBarTrack} aria-hidden="true"><span style={{ transform: `scaleX(${progress})` }} /></span>
      <nav id={panelId} className={s.mobileBarPanel} aria-label={title} hidden={!open}>
        <ol>
          {items.map((item, index) => (
            <li key={item.id} data-state={index === current && active >= 0 ? "active" : index < current ? "done" : "todo"}>
              <a href={`#${item.id}`} onClick={(event) => onClick(event, item.id)} aria-current={index === current && active >= 0 ? "location" : undefined}>
                <span>{pad(index + 1)}</span><span>{item.label}</span>
              </a>
            </li>
          ))}
        </ol>
      </nav>
    </div>
  );
}
