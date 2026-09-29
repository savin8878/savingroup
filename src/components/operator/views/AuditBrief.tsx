"use client";

// components/operator/views/AuditBrief.tsx
//
// The lead handoff, and the one place the Operator could overclaim. The site
// has no lead backend (the contact form's submit is a timer), so NOTHING is
// sent from here: the card says so first, then offers the visitor ways to
// send it themselves — a wa.me link, a mailto: link, copy, download — each
// showing exactly where it goes. The destinations come from the server's
// `channels` (the site's published contact details), never from the model.
//
// Also exports <ExportActions> (copy + Markdown download with an announced
// "Copied" state), shared with <BusinessXRay>.

import { useCallback, useEffect, useId, useMemo, useRef, useState } from "react";
import { Check, Copy, Download, Mail, MessageCircle, ShieldCheck } from "lucide-react";
import type { Locale } from "@/lib/i18n";
import type { AuditBrief as AuditBriefData } from "@/lib/operator/protocol";
import {
  MAILTO_BODY_MAX,
  WHATSAPP_TEXT_MAX,
  briefEntries,
  briefSubject,
  briefToMarkdown,
  briefToPlainText,
  buildMailtoUrl,
  buildWhatsAppUrl,
  fileSlug,
  formatWhatsAppNumber,
  mailtoLength,
  whatsAppLength,
} from "./brief-format";
import { getViewsCopy } from "./views-copy";
import s from "./Views.module.css";

/** Clipboard API first; the hidden-textarea fallback covers non-secure contexts and older WebViews. */
async function copyText(text: string): Promise<boolean> {
  try {
    if (navigator.clipboard && window.isSecureContext) {
      await navigator.clipboard.writeText(text);
      return true;
    }
  } catch {}
  try {
    const area = document.createElement("textarea");
    area.value = text;
    area.setAttribute("readonly", "");
    area.style.position = "fixed";
    area.style.opacity = "0";
    area.style.insetBlockStart = "0";
    document.body.appendChild(area);
    area.select();
    const ok = document.execCommand("copy");
    area.remove();
    return ok;
  } catch {
    return false;
  }
}

/** Save `text` as a file via a temporary object URL, revoked right after the click is dispatched. */
function downloadText(filename: string, text: string) {
  const url = URL.createObjectURL(new Blob([text], { type: "text/markdown;charset=utf-8" }));
  const link = document.createElement("a");
  link.href = url;
  link.download = filename;
  link.rel = "noopener";
  document.body.appendChild(link);
  link.click();
  link.remove();
  window.setTimeout(() => URL.revokeObjectURL(url), 0);
}

export interface ExportActionsProps {
  locale: Locale;
  /** Built on demand, so a long brief is only serialised when asked for. */
  getText: () => string;
  getMarkdown: () => string;
  filename: string;
  /** "copy" for the brief, "copyText" for the X-Ray. */
  copyLabel?: "copy" | "copyText";
}

export function ExportActions({ locale, getText, getMarkdown, filename, copyLabel = "copy" }: ExportActionsProps) {
  const copy = getViewsCopy(locale).actions;
  const [status, setStatus] = useState<"idle" | "copied" | "failed">("idle");
  const timer = useRef(0);
  useEffect(() => () => window.clearTimeout(timer.current), []);

  const onCopy = useCallback(async () => {
    const ok = await copyText(getText());
    setStatus(ok ? "copied" : "failed");
    window.clearTimeout(timer.current);
    timer.current = window.setTimeout(() => setStatus("idle"), ok ? 2400 : 6000);
  }, [getText]);

  return (
    <div className={s.actions}>
      <button type="button" className={s.action} onClick={onCopy} data-done={status === "copied" ? "" : undefined}>
        {status === "copied" ? <Check size={14} strokeWidth={2} aria-hidden="true" /> : <Copy size={14} strokeWidth={1.6} aria-hidden="true" />}
        {status === "copied" ? copy.copied : copy[copyLabel]}
      </button>
      <button type="button" className={s.action} onClick={() => downloadText(filename, getMarkdown())}>
        <Download size={14} strokeWidth={1.6} aria-hidden="true" />
        {copy.download}
      </button>
      <span className={s.actionStatus} role="status" aria-live="polite">
        {status === "copied" ? copy.copied : status === "failed" ? copy.copyFailed : ""}
      </span>
    </div>
  );
}

const DIGITS = /^\d{6,15}$/;
const EMAIL = /^[^\s@<>()[\]\\,;:"?&#]+@[^\s@<>()[\]\\,;:"?&#]+\.[a-z]{2,}$/i;

export interface AuditBriefProps {
  brief: AuditBriefData;
  locale: Locale;
}

export function AuditBrief({ brief, locale }: AuditBriefProps) {
  const copy = getViewsCopy(locale);
  const b = copy.brief;
  const uid = useId().replace(/[^a-zA-Z0-9_-]/g, "");
  const titleId = `op-${uid}-title`;
  const noticeId = `op-${uid}-notice`;

  const digits = brief.channels.whatsappDigits.replace(/\D/g, "");
  const email = brief.channels.email.trim();
  const hasWhatsApp = DIGITS.test(digits);
  const hasEmail = EMAIL.test(email);
  const whatsAppDisplay = hasWhatsApp ? formatWhatsAppNumber(digits) : "";

  const entries = useMemo(() => briefEntries(brief, b), [brief, b]);
  const links = useMemo(() => {
    const subject = briefSubject(brief, b);
    return {
      whatsapp: hasWhatsApp ? buildWhatsAppUrl(digits, briefToPlainText(brief, b, WHATSAPP_TEXT_MAX, whatsAppLength)) : null,
      email: hasEmail ? buildMailtoUrl(email, subject, briefToPlainText(brief, b, MAILTO_BODY_MAX, mailtoLength)) : null,
    };
  }, [brief, b, digits, email, hasWhatsApp, hasEmail]);

  const getText = useCallback(() => briefToPlainText(brief, b, Number.POSITIVE_INFINITY), [brief, b]);
  const getMarkdown = useCallback(
    () => briefToMarkdown(brief, b, { email: hasEmail ? email : undefined, whatsapp: hasWhatsApp ? `WhatsApp ${whatsAppDisplay}` : undefined }),
    [brief, b, email, hasEmail, hasWhatsApp, whatsAppDisplay],
  );
  // ASCII on purpose: a Devanagari or Arabic file name breaks on some mail and chat attachments.
  const filename = `${[fileSlug(brief.company ?? "", ""), "audit-brief"].filter(Boolean).join("-")}.md`;

  const contact = brief.contact;
  const contactParts = contact
    ? ([
        [b.contact.name, contact.name, false],
        [b.contact.role, contact.role, false],
        [b.contact.email, contact.email, true],
        [b.contact.phone, contact.phone, true],
      ] as const).filter(([, value]) => typeof value === "string" && value.trim() !== "")
    : [];

  return (
    <article className={s.view} aria-labelledby={titleId} aria-describedby={noticeId}>
      <header className={s.head}>
        <div className={s.headTop}>
          <span className={s.eyebrow}>{copy.eyebrows.brief}</span>
        </div>
        <h3 id={titleId} className={s.title} dir="auto">{briefSubject(brief, b)}</h3>
      </header>

      <p className={s.notice} id={noticeId} role="note">
        <ShieldCheck size={16} strokeWidth={1.6} aria-hidden="true" />
        <span>{b.notice}</span>
      </p>

      <dl className={s.fields}>
        {entries.map((entry) => (
          <div key={entry.field}>
            <dt className={s.micro}>{entry.label}</dt>
            {/* Capability names are our localized labels, so they follow the page direction; everything else is conversation text. */}
            <dd dir={entry.field === "relevantCapabilities" ? undefined : "auto"}>
              {entry.field === "relevantCapabilities" && Array.isArray(entry.value) ? (
                <span className={s.chips}>{entry.value.map((name) => <span key={name} className={s.chip}>{name}</span>)}</span>
              ) : entry.field === "contact" ? (
                <span className={s.contact}>
                  {contactParts.map(([label, value, ltr]) => (
                    <span key={label}>
                      <span className={s.srOnly}>{label}: </span>
                      {ltr ? <span dir="ltr" className={s.ltr}>{value}</span> : value}
                    </span>
                  ))}
                </span>
              ) : Array.isArray(entry.value) ? (
                entry.field === "currentSystems" ? (
                  entry.value.join(", ")
                ) : (
                  <ul>{entry.value.map((item, index) => <li key={index}>{item}</li>)}</ul>
                )
              ) : (
                entry.value
              )}
            </dd>
          </div>
        ))}
      </dl>

      {(links.whatsapp || links.email) && (
        <div className={s.send}>
          {links.whatsapp && (
            <div className={s.sendItem}>
              <a className={s.sendLink} href={links.whatsapp} target="_blank" rel="noopener noreferrer">
                <MessageCircle size={15} strokeWidth={1.6} aria-hidden="true" />
                {b.whatsapp}
                <span className={s.srOnly}> ({b.newTab})</span>
              </a>
              <span className={s.dest}><span>{b.to}</span><span dir="ltr" className={s.ltr}>{whatsAppDisplay}</span></span>
            </div>
          )}
          {links.email && (
            <div className={s.sendItem}>
              {/* No target: a mailto: opened in a new tab leaves an empty tab behind in most browsers. */}
              <a className={s.sendLink} href={links.email} data-secondary="">
                <Mail size={15} strokeWidth={1.6} aria-hidden="true" />
                {b.email}
              </a>
              <span className={s.dest}><span>{b.to}</span><span dir="ltr" className={s.ltr}>{email}</span></span>
            </div>
          )}
        </div>
      )}

      <ExportActions locale={locale} getText={getText} getMarkdown={getMarkdown} filename={filename} />
    </article>
  );
}

export default AuditBrief;
