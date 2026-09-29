"use client";

// components/operator/views/ViewBoundary.tsx
//
// Contains a view that throws while rendering. Artifacts streamed by the
// server are validated there, but a transcript restored from sessionStorage
// is only envelope-checked (ndjson.ts#isArtifactEnvelope), so a stale shape
// from an older deploy, or a hand-edited store, could reach a view. Without
// this, one bad artifact would unmount the whole panel and, through the
// layout, replace the page with its error boundary on every open.

import { Component, type ErrorInfo, type ReactNode } from "react";
import type { Locale } from "@/lib/i18n";
import { getViewsCopy } from "./views-copy";
import s from "./Views.module.css";

interface ViewBoundaryProps {
  locale: Locale;
  children: ReactNode;
  /** Render nothing instead of the note (secondary rows such as sources). */
  quiet?: boolean;
}

export class ViewBoundary extends Component<ViewBoundaryProps, { failed: boolean }> {
  state = { failed: false };

  static getDerivedStateFromError(): { failed: boolean } {
    return { failed: true };
  }

  componentDidCatch(error: Error, info: ErrorInfo) {
    console.error("Operator view failed to render:", error, info.componentStack);
  }

  render() {
    if (!this.state.failed) return this.props.children;
    if (this.props.quiet) return null;
    return <p className={s.failed} role="note">{getViewsCopy(this.props.locale).fallback.unavailable}</p>;
  }
}

export default ViewBoundary;
