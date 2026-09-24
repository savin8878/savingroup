"use client";

import { getArticleCopy } from "../copy/article-copy";
import { useReadingState } from "./useReadingState";
import s from "./Article.module.css";

/** Pinned head of the sticky sidebar: "Reading progress · 42% read", bar, minutes left. */
export function ArticleProgress({ locale, readTime }: { locale: string; readTime: number }) {
  const copy = getArticleCopy(locale);
  const { progress } = useReadingState([]);
  const percent = Math.round(progress * 100);
  const minutesLeft = Math.max(0, Math.ceil(readTime * (1 - progress)));

  return (
    <div className={s.progressPanel}>
      <div className={s.panelHead}>
        <span>{copy.progress}</span>
        <span className={s.panelCount}><b>{percent}%</b> {copy.read}</span>
      </div>
      <div className={s.track} role="progressbar" aria-label={copy.progress} aria-valuemin={0} aria-valuemax={100} aria-valuenow={percent}>
        <span style={{ transform: `scaleX(${progress})` }} />
      </div>
      <p className={s.progressNote}>{progress >= 0.995 ? copy.finished : copy.minLeft(minutesLeft)}</p>
    </div>
  );
}
