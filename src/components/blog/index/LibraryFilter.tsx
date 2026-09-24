"use client";

import { useEffect, useMemo, useRef, useState, useSyncExternalStore, type ReactNode } from "react";
import { Search } from "lucide-react";
import home from "@/components/home/IndustrialHome.module.css";
import blog from "../Blog.module.css";
import s from "./BlogIndex.module.css";

export interface LibraryOption { key: string; label: string; count: number }
/** One searchable entry per post; `text` is already lower-cased. */
export interface LibraryEntry { slug: string; category: string; text: string }
export interface LibraryLabels {
  filter: string;
  search: string;
  placeholder: string;
  /** "{n}" and "{total}" are replaced. */
  results: string;
  empty: string;
  clear: string;
}

const subscribe = () => () => {};
const pad = (n: number) => String(n).padStart(2, "0");

/**
 * Progressive enhancement for the grouped library. The server renders every
 * group (`[data-library-group]`) and post (`[data-library-item]`); without JS the
 * chips are plain jump links to `#cat-<key>`. Once hydrated they become
 * aria-pressed toggle buttons and a search field appears; matching only
 * toggles `hidden` on the server-rendered nodes.
 */
export function LibraryFilter({ options, entries, labels, children }: {
  options: LibraryOption[];
  entries: LibraryEntry[];
  labels: LibraryLabels;
  children: ReactNode;
}) {
  const enhanced = useSyncExternalStore(subscribe, () => true, () => false);
  const root = useRef<HTMLDivElement>(null);
  const [active, setActive] = useState("all");
  const [query, setQuery] = useState("");
  const words = useMemo(() => query.trim().toLowerCase().split(/\s+/).filter(Boolean), [query]);

  const visible = useMemo(
    () => new Set(entries.filter((e) => (active === "all" || e.category === active) && words.every((w) => e.text.includes(w))).map((e) => e.slug)),
    [entries, active, words],
  );
  const filtered = active !== "all" || words.length > 0;

  useEffect(() => {
    const element = root.current;
    if (!element) return;
    element.querySelectorAll<HTMLElement>("[data-library-group]").forEach((group) => {
      let any = false;
      group.querySelectorAll<HTMLElement>("[data-library-item]").forEach((item) => {
        const show = visible.has(item.dataset.libraryItem ?? "");
        item.hidden = !show;
        if (show) any = true;
      });
      group.hidden = !any;
    });
  }, [visible]);

  const reset = () => { setActive("all"); setQuery(""); };
  const status = labels.results.replace("{n}", String(visible.size)).replace("{total}", String(entries.length));

  return (
    <div ref={root} className={s.library}>
      <div className={s.controls}>
        <div className={s.chipsWrap} role="group" aria-label={labels.filter}>
          <span className={s.controlsLabel} aria-hidden="true">{labels.filter}</span>
          <ul className={s.chips}>
            {options.map((option) => (
              <li key={option.key}>
                {enhanced ? (
                  <button type="button" className={`${blog.chip} ${s.chipButton}`} aria-pressed={active === option.key} onClick={() => setActive(option.key)}>
                    {option.label}<small>{pad(option.count)}</small>
                  </button>
                ) : (
                  <a className={blog.chip} href={option.key === "all" ? "#library" : `#cat-${option.key}`}>
                    {option.label}<small>{pad(option.count)}</small>
                  </a>
                )}
              </li>
            ))}
          </ul>
        </div>
        {enhanced && (
          <label className={s.search}>
            <span className={blog.srOnly}>{labels.search}</span>
            <Search size={14} aria-hidden="true" />
            <input type="search" className={s.searchInput} value={query} onChange={(event) => setQuery(event.target.value)} placeholder={labels.placeholder} autoComplete="off" spellCheck={false} />
          </label>
        )}
      </div>
      <p className={s.status} role="status">{enhanced && filtered ? status : ""}</p>
      {enhanced && visible.size === 0 && (
        <div className={s.empty}>
          <p>{labels.empty}</p>
          <button type="button" className={home.textButton} onClick={reset}>{labels.clear}</button>
        </div>
      )}
      {children}
    </div>
  );
}
