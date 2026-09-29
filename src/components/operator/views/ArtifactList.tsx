"use client";

// components/operator/views/ArtifactList.tsx
//
// Renders the artifacts of one assistant message, in the order the Operator
// produced them. Two rules on top of "one view per artifact":
//
// - A current-state map immediately followed by a proposed one (or the
//   reverse) is ONE block with a Today / Connected toggle, like the home
//   page's TransformationToggle. It opens on Today — the visitor's own
//   process first — and remembers the visitor's choice per pair for the
//   session, so reopening the panel does not flip it back.
// - "sources" artifacts are skipped here; <SourceList> merges them into one
//   row under the message text.
//
// Each block renders inside a <ViewBoundary>, so an artifact that makes its
// view throw costs that one block, not the panel. The grouping itself
// (group-artifacts.ts) tolerates malformed restored artifacts, and the whole
// list sits in one more boundary besides: nothing a stored transcript holds
// may unmount the panel, because the layout has no error boundary and the
// store survives a reload, so one throw here would take the site down on
// every open of the launcher in that tab.

import { useCallback, useEffect, useMemo, useState } from "react";
import type { Locale } from "@/lib/i18n";
import type { Artifact } from "@/lib/operator/protocol";
import { AuditBrief } from "./AuditBrief";
import { BusinessXRay } from "./BusinessXRay";
import { ImpactCard } from "./ImpactCard";
import { SimulationTimeline } from "./SimulationTimeline";
import { ViewBoundary } from "./ViewBoundary";
import { WorkflowGraph } from "./WorkflowGraph";
import { groupArtifacts, itemKey, type ArtifactItem, type GraphArtifact } from "./group-artifacts";
import { getViewsCopy } from "./views-copy";
import s from "./Views.module.css";

function GraphPair({ today, connected, locale }: { today: GraphArtifact; connected: GraphArtifact; locale: Locale }) {
  const copy = getViewsCopy(locale).graph;
  const storageKey = `savin-operator:map-view:${today.id}:${connected.id}`;
  const [view, setView] = useState<"current" | "proposed">("current");

  // sessionStorage is a convenience only: private windows and blocked storage throw, and the toggle still works.
  useEffect(() => {
    try {
      if (window.sessionStorage.getItem(storageKey) === "proposed") setView("proposed");
    } catch {}
  }, [storageKey]);

  const choose = useCallback((next: "current" | "proposed") => {
    setView(next);
    try {
      window.sessionStorage.setItem(storageKey, next);
    } catch {}
  }, [storageKey]);

  const shown = view === "proposed" ? connected : today;
  const toggle = (
    <div className={s.toggle} role="group" aria-label={copy.compare}>
      <button type="button" aria-pressed={view === "current"} onClick={() => choose("current")}>{copy.today}</button>
      <button type="button" aria-pressed={view === "proposed"} data-accent="" onClick={() => choose("proposed")}>{copy.connected}</button>
    </div>
  );
  // Not keyed by artifact: the toggle must survive the switch so keyboard focus stays on it.
  return <WorkflowGraph graph={shown.graph} locale={locale} controls={toggle} />;
}

export interface ArtifactListProps {
  artifacts: Artifact[];
  locale: Locale;
  /** Route country — only number formatting uses it (en + IN → lakh grouping). */
  country: string;
}

function renderItem(item: ArtifactItem, locale: Locale, country: string) {
  if (item.kind === "pair") return <GraphPair today={item.today} connected={item.connected} locale={locale} />;
  const { artifact } = item;
  switch (artifact.type) {
    case "graph":
      return <WorkflowGraph graph={artifact.graph} locale={locale} />;
    case "simulation":
      return <SimulationTimeline simulation={artifact.simulation} locale={locale} />;
    case "impact":
      return <ImpactCard impact={artifact.impact} locale={locale} country={country} />;
    case "xray":
      return <BusinessXRay xray={artifact.xray} locale={locale} />;
    case "brief":
      return <AuditBrief brief={artifact.brief} locale={locale} />;
    default:
      return null;
  }
}

function ArtifactBlocks({ artifacts, locale, country }: ArtifactListProps) {
  const items = useMemo(() => groupArtifacts(Array.isArray(artifacts) ? artifacts : []), [artifacts]);
  if (!items.length) return null;
  return (
    <div className={s.list}>
      {items.map((item) => (
        <ViewBoundary key={itemKey(item)} locale={locale}>
          {renderItem(item, locale, country)}
        </ViewBoundary>
      ))}
    </div>
  );
}

export function ArtifactList(props: ArtifactListProps) {
  return (
    <ViewBoundary locale={props.locale}>
      <ArtifactBlocks {...props} />
    </ViewBoundary>
  );
}

export default ArtifactList;
