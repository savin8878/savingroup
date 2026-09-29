"use client";

// components/operator/OperatorRoot.tsx
//
// Site-wide mount point of the Savin Operator, rendered by the locale layout
// after <Footer>.
//
// Server-renders only the launcher, in its visible resting state (its
// entrance is a CSS `from` keyframe, so no-JS and reduced-motion visitors
// still see it), styled by Launcher.module.css alone. Everything else, the
// panel, its stylesheet (Operator.module.css), its copy table, the chat hook,
// the Markdown parser and the artifact views, is one client chunk (so this
// file imports launcher-copy.ts, never operator-copy.ts): prefetched once the
// page is idle after load and again on the first sign of intent (pointer
// over or focus on the launcher), mounted on the first open, then kept
// mounted so the conversation and any reply still streaming survive the
// panel being closed.

import dynamic from "next/dynamic";
import { useCallback, useEffect, useMemo, useRef, useState, type ComponentType } from "react";
import { usePathname } from "next/navigation";
import { Waypoints } from "lucide-react";
import type { Locale } from "@/lib/i18n";
import { getLauncherCopy } from "./launcher-copy";
import type { OperatorPanelProps } from "./OperatorPanel";
import styles from "./Launcher.module.css";

const PANEL_ID = "savin-operator";
/** Failed loads in a row after which the launcher gives up for this page view. */
const MAX_LOAD_FAILURES = 3;
/** One quiet second attempt inside a load covers a momentary network drop. */
const RETRY_DELAY_MS = 800;
/** Idle prefetch waits at most this long for the main thread to go quiet. */
const IDLE_TIMEOUT_MS = 8000;

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

const wait = (ms: number) => new Promise<void>((resolve) => setTimeout(resolve, ms));

/**
 * A fresh next/dynamic panel component. dynamic() wraps its loader in
 * React.lazy, which keeps the first result for good, the PanelUnavailable
 * stand-in included; so after a failure the root makes a new one, or a
 * single dropped connection would remove the Operator until a full reload.
 */
function makePanel(): ComponentType<OperatorPanelProps> {
  return dynamic<OperatorPanelProps>(
    () =>
      import("./OperatorPanel")
        .catch(() => wait(RETRY_DELAY_MS).then(() => import("./OperatorPanel")))
        .catch(() => ({ default: PanelUnavailable })),
    { ssr: false },
  );
}

const FIRST_PANEL = makePanel();

let prefetched = false;

/** Warm the panel chunk; the bundler dedupes this with dynamic()'s import. */
function prefetchPanel() {
  if (prefetched) return;
  prefetched = true;
  import("./OperatorPanel").catch(() => {
    prefetched = false;
  });
}

/** Data Saver on, or a 2G-class link: leave the download to an actual intent to open. */
function constrainedNetwork(): boolean {
  const connection = (navigator as Navigator & { connection?: { saveData?: boolean; effectiveType?: string } }).connection;
  return Boolean(connection?.saveData) || /(^|-)2g$/.test(connection?.effectiveType ?? "");
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
  /** Failed loads in a row; reset by a successful one. */
  const [failures, setFailures] = useState(0);
  // In state, not a module constant, so a failed load can swap in a fresh
  // loader (the functional form: a component is itself a function).
  const [Panel, setPanel] = useState<ComponentType<OperatorPanelProps>>(() => FIRST_PANEL);

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

  // Take the chunk download off the tap-to-open path: on touch screens
  // pointerenter fires in the same tap as the click, so the intent prefetch
  // below cannot get ahead of it there. Idle time after load only, and never
  // on a constrained connection.
  useEffect(() => {
    if (constrainedNetwork()) return;
    let idle: number | undefined;
    let timer: ReturnType<typeof setTimeout> | undefined;
    const schedule = () => {
      if (typeof window.requestIdleCallback === "function") idle = window.requestIdleCallback(prefetchPanel, { timeout: IDLE_TIMEOUT_MS });
      else timer = setTimeout(prefetchPanel, 3000);
    };
    if (document.readyState === "complete") schedule();
    else window.addEventListener("load", schedule, { once: true });
    return () => {
      window.removeEventListener("load", schedule);
      if (idle !== undefined) window.cancelIdleCallback?.(idle);
      if (timer !== undefined) clearTimeout(timer);
    };
  }, []);

  const onClose = useCallback(() => setOpen(false), []);
  const onReady = useCallback(() => {
    setReady(true);
    setFailures(0);
  }, []);
  const onReply = useCallback(() => setUnread(true), []);
  const onLoadError = useCallback(() => {
    setOpen(false);
    setMounted(false);
    setReady(false);
    setFailures((count) => count + 1);
    // The next press really goes back to the network.
    setPanel(() => makePanel());
  }, []);

  function openPanel() {
    prefetchPanel();
    setMounted(true);
    setUnread(false);
    setOpen(true);
  }

  // Failing again and again (offline for good, or a deploy replaced the
  // chunk under this tab): a launcher that cannot open anything is worse
  // than none.
  if (failures >= MAX_LOAD_FAILURES) return null;

  const state = open ? (ready ? "open" : "loading") : failures > 0 ? "retry" : "idle";
  const action = state === "loading" ? copy.launcherLoading : state === "retry" ? copy.launcherRetry : copy.launcherAction;
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
        <Panel
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
