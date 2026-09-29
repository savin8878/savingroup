"use client";

// components/operator/OperatorPanel.tsx
//
// The Savin Operator conversation: a native modal <dialog> sliding in from
// the inline end, loaded on first open by <OperatorRoot> (next/dynamic,
// ssr:false) and then kept mounted, so closing the panel mid-reply neither
// loses the conversation nor aborts the stream.
//
// Dialog behaviour mirrors the header's mobile drawer (common/header.tsx):
// showModal(), Tab containment, Escape through onCancel, backdrop click, and
// a page scroll lock (on <html>, see the open effect). Focus returns to the
// launcher from <OperatorRoot>, which owns it.
//
// Accessibility: the message list is role="log" but not a live region.
// Streaming would otherwise be read token by token on screen readers that
// ignore aria-busy; instead one visually hidden role="status" announces the
// few discrete progress phases ("Mapping the workflow"), each completed reply
// once, and errors. Whenever a pressed control disappears or goes inert,
// focus is moved first, so it never falls to <body>.
//
// Visitor and model text get an explicit dir and, when its script is not the
// page's, a lang, from its own letters (./text-dir), never dir="auto".

import { memo, useCallback, useEffect, useId, useLayoutEffect, useMemo, useRef, useState } from "react";
import type { FormEvent, KeyboardEvent, MouseEvent, PointerEvent } from "react";
import Link from "next/link";
import { usePathname } from "next/navigation";
import { ArrowUp, ArrowUpRight, Mail, Maximize2, MessageCircle, Minimize2, RotateCcw, Square, SquarePen, X } from "lucide-react";
import type { Locale } from "@/lib/i18n";
import { OPERATOR_LIMITS } from "@/lib/operator/protocol";
import type { Artifact } from "@/lib/operator/protocol";
import { describePage } from "@/lib/operator/page-context";
import { ArtifactList } from "./views/ArtifactList";
import { SourceList } from "./views/SourceList";
import { ViewBoundary } from "./views/ViewBoundary";
import { ConversationBoundary } from "./ConversationBoundary";
import { Markdown } from "./Markdown";
import { markdownToPlainText, type AllowedChannels } from "./markdown-ast";
import { getOperatorCopy, openerKey, type OperatorCopy } from "./operator-copy";
import { hasContent, messageArtifacts, messageText, type UIMessage, type UIPart } from "./transcript";
import { localeDir, scriptLang, textDir } from "./text-dir";
import { useOperatorChat, type OperatorChatError } from "./useOperatorChat";
// Launcher.module.css: the --op-* tokens (.theme), .micro and .srOnly, shared
// with the launcher and already on the page. Operator.module.css: the panel
// only, so it arrives with this lazy chunk instead of blocking every page.
import base from "./Launcher.module.css";
import styles from "./Operator.module.css";

export interface OperatorPanelProps {
  /** DOM id of the dialog; the launcher's aria-controls points at it. */
  id: string;
  open: boolean;
  locale: Locale;
  country: string;
  /** Published contact details (t.contact.details), for the error fallbacks. */
  contact: { email: string; phone: string };
  onClose: () => void;
  /** The panel's chunk has loaded and mounted. */
  onReady?: () => void;
  /** A reply (or an error) arrived while the panel was closed. */
  onReply?: () => void;
  /** Only used by OperatorRoot's load-failure fallback. */
  onLoadError?: () => void;
}

/** Longest stretch of a reply read out by the completion announcement. */
const ANNOUNCE_CHARS = 600;
/**
 * A progress phase is announced only once it has lasted this long: a reply
 * whose text starts streaming right away needs no "Thinking" first, while a
 * 40-second tool run must not be silent (WCAG 4.1.3).
 */
const STATUS_ANNOUNCE_MS = 1000;
const CLEAR_CONFIRM_MS = 4000;
const FOCUSABLE = 'a[href],button:not(:disabled),textarea:not(:disabled),input:not(:disabled),select:not(:disabled),[tabindex="0"]';

type Section = { kind: "text"; text: string } | { kind: "artifacts"; artifacts: Artifact[] };

/** What the polite live region says; a reply in another script than the page's carries its own lang. */
interface Announcement {
  text: string;
  reply?: string;
  replyLang?: string;
}
const SILENT: Announcement = { text: "" };

const sameArtifacts = (a: Artifact[], b: Artifact[]) => a === b || (a.length === b.length && a.every((artifact, i) => artifact === b[i]));

/**
 * Props equal, with `artifacts` compared item by item. While a reply
 * streams, every frame rebuilds its message (and so every artifacts array),
 * but the artifact objects themselves only change when a same-id artifact
 * event replaces one. Comparing items lets the views skip those frames.
 */
function sameViewProps<P extends { artifacts: Artifact[] }>(prev: Readonly<P>, next: Readonly<P>): boolean {
  const keys = Object.keys(next) as (keyof P)[];
  if (keys.length !== Object.keys(prev).length) return false;
  return keys.every((key) => (key === "artifacts" ? sameArtifacts(prev.artifacts, next.artifacts) : Object.is(prev[key], next[key])));
}

// The views are plain components that re-render with their parent: without
// this, each streamed frame of closing text would reconcile every graph,
// simulation and X-Ray above it.
const StableArtifactList = memo(ArtifactList, sameViewProps);
const StableSourceList = memo(SourceList, sameViewProps);

/**
 * Text parts become Markdown; consecutive artifacts become one run for
 * <ArtifactList>, which is what lets it pair a "current" graph with the
 * "proposed" one that follows it. "sources" artifacts are skipped here (they
 * render once, merged, at the end of the message), so a sources artifact
 * between two graphs cannot split the pair.
 */
function sections(parts: UIPart[]): Section[] {
  const out: Section[] = [];
  for (const part of parts) {
    if (part.kind === "text") {
      if (part.text.trim()) out.push({ kind: "text", text: part.text });
      continue;
    }
    if (part.artifact.type === "sources") continue;
    const last = out[out.length - 1];
    if (last?.kind === "artifacts") last.artifacts.push(part.artifact);
    else out.push({ kind: "artifacts", artifacts: [part.artifact] });
  }
  return out;
}

function waitNote(copy: OperatorCopy, seconds: number | undefined): string | null {
  if (!seconds) return null;
  return seconds >= 90 ? copy.retryInMinutes(Math.ceil(seconds / 60)) : copy.retryInSeconds(seconds);
}

/** Memoised: while a reply streams, only the last message re-renders. */
const AssistantMessage = memo(function AssistantMessage({
  message,
  copy,
  locale,
  country,
  allowed,
}: {
  message: UIMessage;
  copy: OperatorCopy;
  locale: Locale;
  country: string;
  allowed: AllowedChannels;
}) {
  const blocks = useMemo(() => sections(message.parts), [message.parts]);
  const artifacts = useMemo(() => messageArtifacts(message), [message]);
  if (message.refused) {
    // Only the marker: whatever streamed before the decline is gone (see
    // useOperatorChat#finish), and the refusal error below explains it.
    return (
      <article className={styles.assistant}>
        <span className={`${base.micro} ${styles.label}`}>{copy.operator}</span>
        <p className={styles.marker}>{copy.declined}</p>
      </article>
    );
  }
  return (
    <article className={styles.assistant}>
      <span className={`${base.micro} ${styles.label}`}>{copy.operator}</span>
      {blocks.map((block, i) =>
        block.kind === "text" ? (
          <Markdown key={i} source={block.text} locale={locale} allowed={allowed} className={styles.prose} />
        ) : (
          <div key={i} className={styles.run}>
            <StableArtifactList artifacts={block.artifacts} locale={locale} country={country} />
          </div>
        ),
      )}
      <ViewBoundary locale={locale} quiet>
        <StableSourceList artifacts={artifacts} locale={locale} />
      </ViewBoundary>
      {/* Not for `interrupted` (a reload cut it off): the visitor stopped nothing. */}
      {message.stopped && <p className={styles.marker}>{copy.stopped}</p>}
    </article>
  );
});

/**
 * Memoised so the per-frame renders of a streaming reply do not re-measure
 * every earlier message. The "You:" prefix sits outside the bubble: inside,
 * it would be the text the bubble's direction and language are judged by
 * (with dir="auto", "أنت: " made every bubble on /ar right-to-left).
 */
const UserMessage = memo(function UserMessage({ message, copy, locale }: { message: UIMessage; copy: OperatorCopy; locale: Locale }) {
  const text = message.parts.map((part) => (part.kind === "text" ? part.text : "")).join("");
  return (
    <div className={styles.user}>
      <span className={base.srOnly}>{`${copy.you}: `}</span>
      <p className={styles.userBubble} dir={textDir(text, localeDir(locale))} lang={scriptLang(text, locale)}>
        {text}
      </p>
    </div>
  );
});

type Contact = { email: string; phone: string };

/**
 * Savin's published channels, as plain links the visitor chooses to open;
 * nothing is sent on their behalf. Renders nothing when neither is known.
 */
function ContactLinks({ copy, contact }: { copy: OperatorCopy; contact: Contact }) {
  const digits = contact.phone.replace(/\D/g, "");
  if (!digits && !contact.email) return null;
  return (
    <>
      <p className={styles.errorNote}>{copy.reachDirectly}</p>
      <div className={styles.actions}>
        {digits && (
          <a className={styles.action} href={`https://wa.me/${digits}`} target="_blank" rel="noopener noreferrer">
            <MessageCircle size={14} strokeWidth={1.6} aria-hidden="true" />
            {copy.whatsapp}
            <ArrowUpRight size={12} strokeWidth={1.6} aria-hidden="true" />
          </a>
        )}
        {contact.email && (
          <a className={styles.action} href={`mailto:${contact.email}`} aria-label={`${copy.email}: ${contact.email}`}>
            <Mail size={14} strokeWidth={1.6} aria-hidden="true" />
            <span dir="ltr">{contact.email}</span>
          </a>
        )}
      </div>
    </>
  );
}

/**
 * <ConversationBoundary>'s last resort, after the conversation crashed twice.
 * Static on purpose: copy and the published channels only, nothing from the
 * chat state that may be what keeps crashing.
 */
function ConversationUnavailable({ copy, contact }: { copy: OperatorCopy; contact: Contact }) {
  return (
    <div className={styles.column}>
      <div className={styles.error}>
        <p className={styles.errorText}>{copy.conversationBroken}</p>
        <ContactLinks copy={copy} contact={contact} />
      </div>
    </div>
  );
}

function ErrorBlock({
  error,
  copy,
  contact,
  onRetry,
  onReset,
}: {
  error: OperatorChatError;
  copy: OperatorCopy;
  contact: Contact;
  onRetry: () => void;
  onReset: () => void;
}) {
  // When the Operator itself is down or throttled, the visitor still has a
  // way to reach Savin.
  const offerContact = error.code === "unavailable" || error.code === "rate_limited";
  const wait = waitNote(copy, error.retryAfter);
  return (
    <div className={styles.error}>
      <p className={styles.errorText}>{copy.errors[error.code]}</p>
      {wait && <p className={styles.errorNote}>{wait}</p>}
      <div className={styles.actions}>
        <button type="button" className={styles.action} onClick={onRetry}>
          <RotateCcw size={14} strokeWidth={1.6} aria-hidden="true" />
          {copy.retry}
        </button>
        {error.code === "too_large" && (
          <button type="button" className={styles.action} onClick={onReset}>
            <SquarePen size={14} strokeWidth={1.6} aria-hidden="true" />
            {copy.startOver}
          </button>
        )}
      </div>
      {offerContact && <ContactLinks copy={copy} contact={contact} />}
    </div>
  );
}

export default function OperatorPanel({ id, open, locale, country, contact, onClose, onReady, onReply }: OperatorPanelProps) {
  const copy = useMemo(() => getOperatorCopy(locale), [locale]);
  const pathname = usePathname();
  const chat = useOperatorChat({ locale, country });
  const { messages, streaming, status, error, send, stop, retry, reset } = chat;

  const dialogRef = useRef<HTMLDialogElement>(null);
  const logRef = useRef<HTMLDivElement>(null);
  const inputRef = useRef<HTMLTextAreaElement>(null);
  const titleRef = useRef<HTMLHeadingElement>(null);
  /** Follow new content only while the visitor is at (or near) the bottom. */
  const stickRef = useRef(true);
  const pointerOnBackdrop = useRef(false);
  const wasStreaming = useRef(streaming);

  const titleId = useId();
  const subtitleId = useId();
  const inputId = useId();
  const counterId = useId();

  const [expanded, setExpanded] = useState(false);
  const [armed, setArmed] = useState(false);
  const [draft, setDraft] = useState("");
  const [announcement, setAnnouncement] = useState<Announcement>(SILENT);
  /** Progress phases already announced during the current reply. */
  const spokenPhases = useRef(new Set<string>());

  const pageDir = localeDir(locale);
  // The only WhatsApp / email targets a reply may link to (markdown-ast.ts#safeHref).
  // Memoised on the strings: <Markdown> and the messages are memoised on it.
  const allowed = useMemo<AllowedChannels>(
    () => ({ whatsappDigits: contact.phone.replace(/\D/g, ""), email: contact.email.trim() }),
    [contact.phone, contact.email],
  );

  useEffect(() => {
    onReady?.();
  }, [onReady]);

  /** Grow the composer with its content, from one line up to six. */
  const autosize = useCallback(() => {
    const field = inputRef.current;
    if (!field) return;
    field.style.height = "auto";
    const css = getComputedStyle(field);
    const borders = parseFloat(css.borderTopWidth) + parseFloat(css.borderBottomWidth);
    const padding = parseFloat(css.paddingTop) + parseFloat(css.paddingBottom);
    const max = (parseFloat(css.lineHeight) || 22) * 6 + padding + borders;
    const needed = field.scrollHeight + borders;
    field.style.height = `${Math.min(needed, max)}px`;
    field.style.overflowY = needed > max ? "auto" : "hidden";
  }, []);

  useLayoutEffect(autosize, [draft, autosize]);

  /**
   * Where focus rests: the composer where a keyboard is at hand; on touch
   * screens the title, so the on-screen keyboard does not cover the thread.
   * Used on open and whenever the focused control disappears (a starter
   * that was just sent, the clear button once the thread is empty).
   */
  const focusHome = useCallback(() => {
    if (window.matchMedia("(pointer: fine)").matches) inputRef.current?.focus({ preventScroll: true });
    else titleRef.current?.focus({ preventScroll: true });
  }, []);

  useEffect(() => {
    if (!open) return;
    const dialog = dialogRef.current;
    if (!dialog) return;
    // Lock the element that actually scrolls. globals.css gives <html>
    // overflow-x: hidden, so html's overflow, not body's, is the viewport's:
    // overflow: hidden on <body> neither stopped the page scrolling behind
    // the backdrop nor hid its scrollbar, and it turned body into a scroll
    // container, which breaks every position: sticky on the site.
    const root = document.documentElement;
    const previous = {
      overflow: root.style.overflow,
      gutter: root.style.getPropertyValue("scrollbar-gutter"),
      padding: root.style.paddingInlineEnd,
    };
    const scrollbar = window.innerWidth - root.clientWidth;
    if (!dialog.open) {
      try {
        dialog.showModal();
      } catch {
        dialog.setAttribute("open", "");
      }
    }
    root.style.overflow = "hidden";
    if (scrollbar > 0) {
      // Keep the space the vanished scrollbar leaves, so the page (fixed
      // header included) does not jump sideways on open and close. Padding
      // is the fallback; the scrollbar sits at the inline end (left in RTL
      // in Chromium and Firefox), so it goes on that side.
      if (typeof CSS !== "undefined" && CSS.supports?.("scrollbar-gutter", "stable")) root.style.setProperty("scrollbar-gutter", "stable");
      else root.style.paddingInlineEnd = `${scrollbar}px`;
    }
    autosize();
    focusHome();
    stickRef.current = true;
    if (logRef.current) logRef.current.scrollTop = logRef.current.scrollHeight;
    return () => {
      if (dialog.open) dialog.close();
      root.style.overflow = previous.overflow;
      root.style.setProperty("scrollbar-gutter", previous.gutter);
      root.style.paddingInlineEnd = previous.padding;
    };
  }, [open, autosize, focusHome]);

  useLayoutEffect(() => {
    const log = logRef.current;
    if (log && stickRef.current) log.scrollTop = log.scrollHeight;
  }, [messages, streaming, status, error]);

  // One announcement per completed reply, never per token.
  useEffect(() => {
    if (streaming) {
      if (!wasStreaming.current) {
        // A new reply: empty the region, so whatever it says next is a DOM
        // change and gets spoken, even an error word for word the same as
        // the one before this retry.
        spokenPhases.current.clear();
        setAnnouncement(SILENT);
      }
      wasStreaming.current = true;
      return;
    }
    if (!wasStreaming.current) return;
    wasStreaming.current = false;
    const last = messages[messages.length - 1];
    if (last?.role === "assistant" && hasContent(last)) {
      const text = markdownToPlainText(messageText(last)).replace(/\s+/g, " ").trim();
      const spoken = text.length > ANNOUNCE_CHARS ? `${text.slice(0, ANNOUNCE_CHARS)}…` : text;
      setAnnouncement({
        text: last.stopped ? `${copy.replyStopped}.` : `${copy.replied}:`,
        reply: spoken,
        replyLang: scriptLang(spoken, locale),
      });
    } else if (last?.stopped) {
      setAnnouncement({ text: copy.replyStopped });
    }
    if (!open) onReply?.();
  }, [streaming, messages, copy, locale, open, onReply]);

  // Progress, for screen readers too: each phase once per reply, and only
  // when it lasts (the timer is dropped as soon as text streams or the phase
  // changes). Status events are few and discrete; text deltas never speak.
  useEffect(() => {
    if (!streaming || !status || spokenPhases.current.has(status)) return;
    const phase = status;
    const timer = setTimeout(() => {
      spokenPhases.current.add(phase);
      setAnnouncement({ text: copy.status[phase] });
    }, STATUS_ANNOUNCE_MS);
    return () => clearTimeout(timer);
  }, [streaming, status, copy]);

  // Declared after the reply effect so an error wins the same commit.
  useEffect(() => {
    if (error) setAnnouncement({ text: copy.errors[error.code] });
  }, [error, copy]);

  useEffect(() => {
    if (!armed) return;
    setAnnouncement({ text: copy.confirmClear });
    const timer = setTimeout(() => setArmed(false), CLEAR_CONFIRM_MS);
    return () => clearTimeout(timer);
  }, [armed, copy]);

  function containFocus(event: KeyboardEvent<HTMLDialogElement>) {
    if (event.key !== "Tab") return;
    const controls = Array.from(event.currentTarget.querySelectorAll<HTMLElement>(FOCUSABLE)).filter((node) => node.getClientRects().length > 0);
    const first = controls[0];
    const last = controls[controls.length - 1];
    if (!first || !last) return;
    const active = document.activeElement;
    if (event.shiftKey && (active === first || active === titleRef.current)) {
      event.preventDefault();
      last.focus();
    } else if (!event.shiftKey && active === last) {
      event.preventDefault();
      first.focus();
    }
  }

  /**
   * A click that lands on the <dialog> itself is a click on its ::backdrop.
   * The press must have started there too, or selecting reply text and
   * releasing over the page would close the panel.
   */
  function onDialogPointerDown(event: PointerEvent<HTMLDialogElement>) {
    pointerOnBackdrop.current = event.target === event.currentTarget;
  }
  function onDialogClick(event: MouseEvent<HTMLDialogElement>) {
    if (event.target === event.currentTarget && pointerOnBackdrop.current) onClose();
    pointerOnBackdrop.current = false;
  }

  /** A site link inside the conversation: close so the page is visible. */
  function onLogClick(event: MouseEvent<HTMLDivElement>) {
    if (event.button !== 0 || event.metaKey || event.ctrlKey || event.shiftKey || event.altKey) return;
    const anchor = (event.target as Element).closest?.("a[href]");
    if (!anchor || anchor.getAttribute("target") === "_blank") return;
    const href = anchor.getAttribute("href") ?? "";
    if (href.startsWith("/") && !href.startsWith("//")) onClose();
  }

  function onLogScroll() {
    const log = logRef.current;
    if (log) stickRef.current = log.scrollHeight - log.scrollTop - log.clientHeight < 80;
  }

  function submit(text: string) {
    if (!text.trim() || streaming) return;
    stickRef.current = true;
    send(text);
  }

  function sendStarter(text: string) {
    submit(text);
    focusHome();
  }

  function sendDraft() {
    if (streaming || !draft.trim()) return;
    submit(draft);
    setDraft("");
  }

  /** The one button is Send, or Stop while a reply streams. */
  function onSubmit(event: FormEvent<HTMLFormElement>) {
    event.preventDefault();
    if (!streaming) {
      sendDraft();
      return;
    }
    stop();
    // The button turns back into Send, inert with an empty draft: focus goes
    // home, where the next message is written.
    focusHome();
  }

  function onInputKeyDown(event: KeyboardEvent<HTMLTextAreaElement>) {
    // keyCode 229: Safari reports the Enter that confirms an IME candidate
    // with isComposing already false.
    if (event.key !== "Enter" || event.shiftKey || event.nativeEvent.isComposing || event.keyCode === 229) return;
    // Enter sends, and never doubles as Stop: typing ahead while a reply
    // streams must not cut it off.
    event.preventDefault();
    sendDraft();
  }

  function onClear() {
    if (!armed) {
      setArmed(true);
      return;
    }
    setArmed(false);
    reset();
    setAnnouncement(SILENT);
    focusHome();
  }

  // The opener follows the page the conversation started on, so it does not
  // change above an existing thread when the visitor moves around the site.
  const openerPath = messages.find((m) => m.role === "user" && m.page)?.page?.pathname ?? pathname ?? "/";
  const topic = openerKey(describePage(openerPath));
  const last = messages[messages.length - 1];
  const lastPart = last?.role === "assistant" ? last.parts[last.parts.length - 1] : undefined;
  const showStatus = streaming && (status !== null || lastPart?.kind !== "text");
  const maxChars = OPERATOR_LIMITS.maxUserChars;
  const showCounter = draft.length > maxChars * 0.8;
  const canClear = messages.length > 0 || streaming || error !== null;
  // Send with nothing to send. aria-disabled, not disabled: a disabled button
  // drops keyboard focus to <body> (Send clicked, then the reply ends and
  // the emptied draft disables it). sendDraft already ignores an empty draft.
  const sendInert = !streaming && !draft.trim();
  const draftDir = useMemo(() => textDir(draft, pageDir), [draft, pageDir]);
  const retryFromError = () => {
    // Before retry(): it unmounts this error block, Retry button included.
    focusHome();
    retry();
  };

  return (
    <dialog
      ref={dialogRef}
      id={id}
      className={`${base.theme} ${styles.dialog}`}
      data-expanded={expanded}
      aria-labelledby={titleId}
      aria-describedby={subtitleId}
      onCancel={(event) => {
        event.preventDefault();
        onClose();
      }}
      onKeyDown={containFocus}
      onPointerDown={onDialogPointerDown}
      onClick={onDialogClick}
    >
      <div className={styles.shell}>
        <header className={styles.head}>
          <div className={styles.heading}>
            <h2 id={titleId} ref={titleRef} tabIndex={-1} className={styles.title}>
              {copy.title}
            </h2>
            <p id={subtitleId} className={styles.subtitle}>
              {copy.subtitle}
            </p>
          </div>
          <div className={styles.headActions}>
            <button
              type="button"
              className={`${styles.iconButton} ${styles.clearButton}`}
              data-armed={armed}
              aria-label={armed ? copy.confirmClear : copy.newChat}
              title={armed ? undefined : copy.newChat}
              disabled={!canClear}
              onClick={onClear}
              onBlur={() => setArmed(false)}
            >
              <SquarePen size={17} strokeWidth={1.4} aria-hidden="true" />
              {armed && (
                <span className={styles.clearText} aria-hidden="true">
                  {copy.confirmClear}
                </span>
              )}
            </button>
            <button
              type="button"
              className={`${styles.iconButton} ${styles.expandButton}`}
              aria-label={expanded ? copy.collapse : copy.expand}
              title={expanded ? copy.collapse : copy.expand}
              onClick={() => setExpanded((value) => !value)}
            >
              {expanded ? <Minimize2 size={17} strokeWidth={1.4} aria-hidden="true" /> : <Maximize2 size={17} strokeWidth={1.4} aria-hidden="true" />}
            </button>
            <button type="button" className={styles.iconButton} aria-label={copy.close} title={copy.close} onClick={onClose}>
              <X size={19} strokeWidth={1.4} aria-hidden="true" />
            </button>
          </div>
        </header>

        <div
          ref={logRef}
          className={styles.log}
          role="log"
          aria-live="off"
          aria-busy={streaming}
          aria-label={copy.conversation}
          onScroll={onLogScroll}
          onClick={onLogClick}
        >
          <div className={styles.column}>
            {/* UI only: never sent as a turn. */}
            <section className={styles.opener}>
              {/* Our own copy, in the page's language: it inherits the page's direction. */}
              <span className={`${base.micro} ${styles.label}`}>{copy.operator}</span>
              <p className={styles.openerText}>{copy.openers[topic]}</p>
              {messages.length === 0 && !streaming && (
                <div className={styles.starters}>
                  <span className={`${base.micro} ${styles.startersLabel}`}>{copy.startersLabel}</span>
                  {copy.starters[topic].map((starter) => (
                    <button key={starter} type="button" className={styles.starter} onClick={() => sendStarter(starter)}>
                      <span>{starter}</span>
                      <ArrowUpRight size={15} strokeWidth={1.4} aria-hidden="true" />
                    </button>
                  ))}
                </div>
              )}
            </section>

            {messages.map((message) =>
              message.role === "user" ? (
                <UserMessage key={message.id} message={message} copy={copy} locale={locale} />
              ) : (
                <AssistantMessage key={message.id} message={message} copy={copy} locale={locale} country={country} allowed={allowed} />
              ),
            )}

            {showStatus && (
              <div className={styles.status}>
                <span className={styles.pulse} aria-hidden="true" />
                <span>{copy.status[status ?? "thinking"]}</span>
              </div>
            )}

            {error && !streaming && (
              <ErrorBlock
                error={error}
                copy={copy}
                contact={contact}
                onRetry={retryFromError}
                onReset={() => {
                  reset();
                  focusHome();
                }}
              />
            )}
          </div>
        </div>

        <p className={base.srOnly} role="status" aria-live="polite" aria-atomic="true">
          {announcement.text}
          {announcement.reply && (
            <>
              {" "}
              <span lang={announcement.replyLang}>{announcement.reply}</span>
            </>
          )}
        </p>

        <form className={styles.composer} onSubmit={onSubmit}>
          <div className={styles.field}>
            <label className={base.srOnly} htmlFor={inputId}>
              {copy.inputLabel}
            </label>
            <textarea
              id={inputId}
              ref={inputRef}
              className={styles.textarea}
              rows={1}
              value={draft}
              maxLength={maxChars}
              placeholder={copy.placeholder}
              dir={draftDir}
              enterKeyHint="send"
              autoComplete="off"
              aria-describedby={showCounter ? counterId : undefined}
              onChange={(event) => setDraft(event.target.value)}
              onKeyDown={onInputKeyDown}
            />
            <button
              type="submit"
              className={styles.send}
              data-mode={streaming ? "stop" : "send"}
              aria-disabled={sendInert || undefined}
              aria-label={streaming ? copy.stop : copy.send}
            >
              {streaming ? (
                <Square size={13} strokeWidth={1.6} fill="currentColor" aria-hidden="true" />
              ) : (
                <ArrowUp size={16} strokeWidth={1.6} aria-hidden="true" />
              )}
              <span className={styles.sendLabel}>{streaming ? copy.stop : copy.send}</span>
            </button>
          </div>
          <div className={styles.meta}>
            <p className={styles.disclosure}>
              {copy.disclosure}{" "}
              <Link href={`/${country}/${locale}/privacy`} prefetch={false}>
                {copy.privacy}
              </Link>
            </p>
            {showCounter && (
              <span id={counterId} className={styles.counter} data-level={draft.length >= maxChars * 0.95 ? "high" : undefined}>
                {copy.charCount(draft.length, maxChars)}
              </span>
            )}
          </div>
        </form>
      </div>
    </dialog>
  );
}
