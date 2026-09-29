"use client";

// components/operator/views/SourceList.tsx
//
// One compact "Sources" row under an assistant message: every knowledge
// record the Operator looked up for it, merged across its "sources"
// artifacts and de-duplicated by record id, each linking to the site page it
// came from. Published price ranges and reported client outcomes show their
// caveat as visible text — a tooltip would let the number travel without it.
//
// Links navigate client-side (next/link, no prefetch), like site links in the
// reply text: a full page load would cut off a reply that is still streaming.
// The panel closes itself on the click so the page is what the visitor sees.

import { useId, useMemo } from "react";
import Link from "next/link";
import { CornerDownRight } from "lucide-react";
import type { Locale } from "@/lib/i18n";
import type { Artifact, KnowledgeSource } from "@/lib/operator/protocol";
import { getViewsCopy } from "./views-copy";
import s from "./Views.module.css";

/** Root-relative site paths only: the transcript is client-held, so an href is never trusted to be one. */
const isSitePath = (href: unknown): href is string =>
  typeof href === "string" && href.startsWith("/") && !href.startsWith("//") && !href.startsWith("/\\");

function mergeSources(artifacts: Artifact[]): KnowledgeSource[] {
  const seen = new Map<string, KnowledgeSource>();
  for (const artifact of artifacts) {
    // Restored transcripts are only envelope-checked (ndjson.ts), so the list itself is not trusted to exist.
    if (artifact.type !== "sources" || !Array.isArray(artifact.sources)) continue;
    for (const source of artifact.sources) {
      if (source && typeof source.id === "string" && typeof source.title === "string" && !seen.has(source.id)) {
        seen.set(source.id, source);
      }
    }
  }
  return [...seen.values()];
}

export interface SourceListProps {
  artifacts: Artifact[];
  locale: Locale;
}

export function SourceList({ artifacts, locale }: SourceListProps) {
  const sources = useMemo(() => mergeSources(artifacts), [artifacts]);
  const labelId = `op-${useId().replace(/[^a-zA-Z0-9_-]/g, "")}-sources`;
  if (!sources.length) return null;
  const copy = getViewsCopy(locale);
  return (
    <div className={s.sources}>
      <span className={s.micro} id={labelId}>{copy.sources.label}</span>
      <ul aria-labelledby={labelId}>
        {sources.map((source) => {
          const caveat = source.confidence !== "canonical" && source.caveat ? source.caveat : null;
          return (
            <li key={source.id}>
              {isSitePath(source.href) ? (
                <Link href={source.href} prefetch={false}>
                  <CornerDownRight size={12} strokeWidth={1.6} className={s.dirIcon} aria-hidden="true" />
                  <span dir="auto">{source.title}</span>
                </Link>
              ) : (
                <span dir="auto">{source.title}</span>
              )}
              {caveat && <span className={s.caveat} dir="auto">{caveat}</span>}
            </li>
          );
        })}
      </ul>
    </div>
  );
}

export default SourceList;
