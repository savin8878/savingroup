"use client";

// components/operator/ConversationBoundary.tsx
//
// Contains a render crash anywhere in the conversation: a reply's Markdown, a
// message or artifact restored from sessionStorage in a shape an older deploy
// wrote, anything a view's own ViewBoundary does not cover. Uncaught, it would
// unmount the panel and, through the locale layout, replace the page with its
// error boundary; and because the stored transcript comes back on every load,
// it would do that again on every page for the rest of the tab's life.
//
// First crash: `onRecover` (the panel forgets the stored transcript, resets
// the chat and shows a notice), then the children render again over the now
// empty thread. A second crash in the same panel means the cause was not the
// thread: `fallback` stays for the rest of the page view and `onGiveUp` lets
// the panel retire its composer. Recovery is spent once, so a crash that
// survives a reset can never loop through reset after reset.
//
// The panel chrome (header, close, focus handling) lives outside this
// boundary and keeps working either way.

import { Component, type ErrorInfo, type ReactNode } from "react";

interface ConversationBoundaryProps {
  children: ReactNode;
  /** Shown after a second crash. Must not read conversation state. */
  fallback: ReactNode;
  /** First crash: clear the stored transcript and the chat state. */
  onRecover: () => void;
  /** Second crash: `fallback` is final. */
  onGiveUp: () => void;
}

interface ConversationBoundaryState {
  failed: boolean;
  /** `onRecover` has been spent. */
  recovered: boolean;
}

export class ConversationBoundary extends Component<ConversationBoundaryProps, ConversationBoundaryState> {
  state: ConversationBoundaryState = { failed: false, recovered: false };

  static getDerivedStateFromError(): Partial<ConversationBoundaryState> {
    return { failed: true };
  }

  componentDidCatch(error: Error, info: ErrorInfo) {
    console.error("Operator conversation failed to render:", error, info.componentStack);
    if (this.state.recovered) {
      this.props.onGiveUp();
      return;
    }
    // Both updates are scheduled from the commit phase and land in the same
    // synchronous render, before paint: the children come back already
    // holding the panel's emptied thread, never the one that crashed, and
    // the fallback committed in between is never seen.
    this.props.onRecover();
    this.setState({ failed: false, recovered: true });
  }

  render() {
    return this.state.failed ? this.props.fallback : this.props.children;
  }
}

export default ConversationBoundary;
