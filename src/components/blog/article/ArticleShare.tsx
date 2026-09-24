"use client";

import { useEffect, useRef, useState } from "react";
import { Check, Link2, Linkedin, MessageCircle, Twitter } from "lucide-react";
import { getArticleCopy } from "../copy/article-copy";
import s from "./Article.module.css";

/** Copy link (with live "copied" feedback) + WhatsApp, LinkedIn, X. */
export function ArticleShare({ url, title, locale, label }: { url: string; title: string; locale: string; label: string }) {
  const copy = getArticleCopy(locale);
  const [copied, setCopied] = useState(false);
  const timer = useRef<number | undefined>(undefined);
  useEffect(() => () => window.clearTimeout(timer.current), []);

  const encodedUrl = encodeURIComponent(url);
  const encodedTitle = encodeURIComponent(title);
  const networks = [
    { name: "WhatsApp", href: `https://wa.me/?text=${encodedTitle}%20${encodedUrl}`, Icon: MessageCircle },
    { name: "LinkedIn", href: `https://www.linkedin.com/sharing/share-offsite/?url=${encodedUrl}`, Icon: Linkedin },
    { name: "X", href: `https://twitter.com/intent/tweet?url=${encodedUrl}&text=${encodedTitle}`, Icon: Twitter },
  ];

  async function copyLink() {
    try {
      await navigator.clipboard.writeText(url);
    } catch {
      const field = document.createElement("textarea");
      field.value = url;
      field.setAttribute("readonly", "");
      field.style.position = "fixed";
      field.style.opacity = "0";
      document.body.appendChild(field);
      field.select();
      document.execCommand("copy");
      field.remove();
    }
    setCopied(true);
    window.clearTimeout(timer.current);
    timer.current = window.setTimeout(() => setCopied(false), 2200);
  }

  return (
    <div className={s.share} role="group" aria-label={label}>
      <button type="button" className={s.shareButton} onClick={copyLink} data-copied={copied || undefined} aria-label={copy.copyLink}>
        {copied ? <Check size={15} aria-hidden="true" /> : <Link2 size={15} aria-hidden="true" />}
        <span>{copied ? copy.copied : copy.copyLink}</span>
      </button>
      {networks.map(({ name, href, Icon }) => (
        <a key={name} className={s.shareIcon} href={href} target="_blank" rel="noopener noreferrer" aria-label={copy.shareOn(name)} title={copy.shareOn(name)}>
          <Icon size={15} aria-hidden="true" />
        </a>
      ))}
      <span className={s.srOnly} aria-live="polite">{copied ? copy.copied : ""}</span>
    </div>
  );
}
