"use client";

// components/operator/OperatorRoot.tsx
//
// Site-wide mount point of the Savin Operator, rendered by the locale layout
// after <Footer>.
//
// Server-renders only the launcher, in its visible resting state (its
// entrance is a CSS `from` keyframe, so no-JS and reduced-motion visitors
// still see it). Everything else, the panel, its copy table, the chat hook,
// the Markdown parser and the artifact views, is one client chunk (so this
// file imports launcher-copy.ts, never operator-copy.ts): prefetched on the
// first sign of intent (pointer over or focus on the launcher), mounted on
// the first open, then kept mounted so the conversation and any reply still
// streaming survive the panel being closed.

import dynamic from "next/dynamic";
import { useCallback, useEffect, useMemo, useRef, useState } from "react";
import { usePathname } from "next/navigation";
import { Waypoints } from "lucide-react";
import type { Locale } from "@/lib/i18n";
import { getLauncherCopy } from "./launcher-copy";
import type { OperatorPanelProps } from "./OperatorPanel";
import styles from "./Operator.module.css";

const PANEL_ID = "savin-operator";

/**
 * Stand-in when the panel chunk cannot load (offline, or a deploy replaced
 * the chunk under an open tab). Without it the rejected import would reach
 * the layout's error boundary and take the whole page down with it.
 */
function PanelUnavailable({ onLoadError }: OperatorPanelProps) {
  useEffect(() => {
    onLoadError?.();
  }, [onLoadError]);
  return null;
}

const OperatorPanel = dynamic<OperatorPanelProps>(
  () => import("./OperatorPanel").catch(() => ({ default: PanelUnavailable })),
  { ssr: false },
);

let prefetched = false;

/** Warm the panel chunk; the bundler dedupes this with dynamic()'s import. */
function prefetchPanel() {
  if (prefetched) return;
  prefetched = true;
  import("./OperatorPanel").catch(() => {
    prefetched = false;
  });
}

export interface OperatorRootProps {
  locale: Locale;
  country: string;
  /** Published channels (t.contact.details); offered when the Operator is down. */
  contact: { email: string; phone: string };
}

export default function OperatorRoot({ locale, country, contact }: OperatorRootProps) {
  const copy = useMemo(() => getLauncherCopy(locale), [locale]);
  const pathname = usePathname();
  const launcherRef = useRef<HTMLButtonElement>(null);
  const wasOpen = useRef(false);

  const [open, setOpen] = useState(false);
  /** The panel has been requested once; from then on it stays mounted. */
  const [mounted, setMounted] = useState(false);
  /** The panel chunk has loaded and rendered. */
  const [ready, setReady] = useState(false);
  const [unread, setUnread] = useState(false);
  const [failed, setFailed] = useState(false);

  // Any navigation (a site link in a reply, the back button) closes the
  // panel so the new page is what the visitor sees. The thread is kept.
  useEffect(() => {
    setOpen(false);
  }, [pathname]);

  // Hand focus back to the launcher on close, as the header drawer does with
  // its trigger. The launcher is visible again by the time this runs.
  useEffect(() => {
    if (open) {
      wasOpen.current = true;
      return;
    }
    if (!wasOpen.current) return;
    wasOpen.current = false;
    const launcher = launcherRef.current;
    if (launcher?.getClientRects().length) launcher.focus({ preventScroll: true });
  }, [open]);

  const onClose = useCallback(() => setOpen(false), []);
  const onReady = useCallback(() => setReady(true), []);
  const onReply = useCallback(() => setUnread(true), []);
  const onLoadError = useCallback(() => {
    setOpen(false);
    setFailed(true);
  }, []);

  function openPanel() {
    prefetchPanel();
    setMounted(true);
    setUnread(false);
    setOpen(true);
  }

  // A launcher that can no longer open anything is worse than none.
  if (failed) return null;

  const state = open ? (ready ? "open" : "loading") : "idle";
  const action = state === "loading" ? copy.launcherLoading : copy.launcherAction;
  const label = `${copy.launcherLabel}: ${action}${unread ? ` (${copy.unread})` : ""}`;

  return (
    <>
      <button
        ref={launcherRef}
        type="button"
        className={`${styles.theme} ${styles.launcher}`}
        data-state={state}
        aria-label={label}
        aria-haspopup="dialog"
        aria-expanded={state === "open"}
        aria-controls={mounted ? PANEL_ID : undefined}
        aria-busy={state === "loading" || undefined}
        onClick={openPanel}
        onPointerEnter={prefetchPanel}
        onFocus={prefetchPanel}
      >
        <span className={styles.launcherMark} aria-hidden="true" />
        <span className={styles.launcherText}>
          <span className={`${styles.micro} ${styles.launcherLabel}`}>{copy.launcherLabel}</span>
          <span className={styles.launcherAction}>{action}</span>
        </span>
        <span className={styles.launcherIcon}>
          <Waypoints size={18} strokeWidth={1.4} aria-hidden="true" />
        </span>
        {unread && <span className={styles.unreadDot} aria-hidden="true" />}
      </button>
      {mounted && (
        <OperatorPanel
          id={PANEL_ID}
          open={open}
          locale={locale}
          country={country}
          contact={contact}
          onClose={onClose}
          onReady={onReady}
          onReply={onReply}
          onLoadError={onLoadError}
        />
      )}
    </>
  );
}
