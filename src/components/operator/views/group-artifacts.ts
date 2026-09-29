// components/operator/views/group-artifacts.ts
//
// How <ArtifactList> turns one message's artifacts into blocks: sources are
// dropped (<SourceList> shows them under the message text), and a current
// map next to a proposed one becomes a single Today / Connected pair. Pure,
// so node --test covers it.
//
// It runs on transcripts restored from sessionStorage, which are only
// envelope-checked (type + id, ndjson.ts#isArtifactEnvelope): a shape from an
// older deploy, or a hand-edited store, can reach it. So it never reads past
// a missing payload. A graph artifact without a graph object stays a single
// block, and that view's own ViewBoundary shows the fallback note instead.

import type { Artifact } from "@/lib/operator/protocol";

export type GraphArtifact = Extract<Artifact, { type: "graph" }>;
export type ArtifactItem =
  | { kind: "single"; artifact: Exclude<Artifact, { type: "sources" }> }
  | { kind: "pair"; today: GraphArtifact; connected: GraphArtifact };

/** The map's view, or undefined when the payload is not the expected object. */
function viewOf(artifact: GraphArtifact): unknown {
  const graph: unknown = artifact.graph;
  return typeof graph === "object" && graph !== null ? (graph as { view?: unknown }).view : undefined;
}

/** Drop sources, then fold each adjacent current + proposed map into a pair. */
export function groupArtifacts(artifacts: readonly Artifact[]): ArtifactItem[] {
  const visible = artifacts.filter((artifact): artifact is Exclude<Artifact, { type: "sources" }> => !!artifact && artifact.type !== "sources");
  const items: ArtifactItem[] = [];
  for (let i = 0; i < visible.length; i++) {
    const artifact = visible[i];
    const next = visible[i + 1];
    if (artifact.type === "graph" && next?.type === "graph") {
      const a = viewOf(artifact);
      const b = viewOf(next);
      // Exactly one current and one proposed: anything else (two of a kind, a missing or unknown view) stays single.
      if ((a === "current" && b === "proposed") || (a === "proposed" && b === "current")) {
        const [today, connected] = a === "current" ? [artifact, next] : [next, artifact];
        items.push({ kind: "pair", today, connected });
        i += 1;
        continue;
      }
    }
    items.push({ kind: "single", artifact });
  }
  return items;
}

/** Stable React key of a block. */
export function itemKey(item: ArtifactItem): string {
  return item.kind === "pair" ? `${item.today.id}+${item.connected.id}` : item.artifact.id;
}
