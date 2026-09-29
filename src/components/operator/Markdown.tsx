"use client";

// components/operator/Markdown.tsx
//
// Renders the AST from ./markdown-ast as React elements. There is deliberately no
// dangerouslySetInnerHTML on this path: model text only ever becomes a React
// text child, and every href has already passed markdown-ast.ts#safeHref
// (with Savin's own channels as the only wa.me / mailto targets).
//
// Each block gets an explicit dir and, when its script is not the page's, a
// lang, both from its own letters (./text-dir). Not dir="auto": that follows
// the first strong character, so an Arabic sentence or bullet that opens
// with "Excel" or "Tally" would lay out left-to-right. Each list item is
// judged on its own, so an English item in an Arabic list still reads LTR.
// Code stays LTR.

import { memo, useMemo, type ReactNode } from "react";
import Link from "next/link";
// The parser is markdown-ast.ts, not markdown.ts: a name differing from this
// file only in case lets an extensionless "./markdown" resolve back to this
// file on case-insensitive filesystems (Windows, macOS).
import { inlineText, parseMarkdown } from "./markdown-ast";
import type { AllowedChannels, Block, Inline } from "./markdown-ast";
import { localeDir, scriptLang, textDir, type TextDirection } from "./text-dir";

function InlineLink({ href, children }: { href: string; children: ReactNode }) {
  // Site paths navigate client-side, so the layout (and this panel's state)
  // survives the click. Prefetch is off: a reply can hold many links and
  // none of them should cost a request until chosen.
  if (href.startsWith("/")) {
    return (
      <Link href={href} prefetch={false}>
        {children}
      </Link>
    );
  }
  if (href.toLowerCase().startsWith("mailto:")) return <a href={href}>{children}</a>;
  return (
    <a href={href} target="_blank" rel="noopener noreferrer">
      {children}
      <span aria-hidden="true">{" ↗"}</span>
    </a>
  );
}

function renderInline(nodes: Inline[]): ReactNode[] {
  return nodes.map((node, i) => {
    switch (node.type) {
      case "text":
        return node.text;
      case "br":
        return <br key={i} />;
      case "code":
        return (
          <code key={i} dir="ltr">
            {node.text}
          </code>
        );
      case "strong":
        return <strong key={i}>{renderInline(node.children)}</strong>;
      case "em":
        return <em key={i}>{renderInline(node.children)}</em>;
      case "link":
        return (
          <InlineLink key={i} href={node.href}>
            {renderInline(node.children)}
          </InlineLink>
        );
    }
  });
}

interface Page {
  locale: string;
  dir: TextDirection;
}

/** dir and lang for a block of `text`, relative to the page. */
function blockAttrs(text: string, page: Page): { dir: TextDirection; lang: string | undefined } {
  return { dir: textDir(text, page.dir), lang: scriptLang(text, page.locale) };
}

function renderBlock(block: Block, i: number, page: Page): ReactNode {
  switch (block.type) {
    case "heading": {
      // The dialog title is the h2; reply headings sit below it and stay
      // small, whatever level the model chose.
      const Tag = block.level <= 2 ? "h3" : "h4";
      return (
        <Tag key={i} {...blockAttrs(inlineText(block.children, { code: false }), page)}>
          {renderInline(block.children)}
        </Tag>
      );
    }
    case "paragraph":
      return (
        <p key={i} {...blockAttrs(inlineText(block.children, { code: false }), page)}>
          {renderInline(block.children)}
        </p>
      );
    case "quote":
      return (
        <blockquote key={i} {...blockAttrs(inlineText(block.children, { code: false }), page)}>
          {renderInline(block.children)}
        </blockquote>
      );
    case "code":
      return (
        <pre key={i} dir="ltr">
          <code>{block.text}</code>
        </pre>
      );
    case "list": {
      const texts = block.items.map((item) => inlineText(item, { code: false }));
      // The list's own direction places its markers and indent; each item
      // then lays out its text by its own letters, falling back to the list.
      const list = blockAttrs(texts.join("\n"), page);
      const items = block.items.map((item, n) => {
        const dir = textDir(texts[n], list.dir);
        const lang = scriptLang(texts[n], page.locale);
        return (
          <li key={n} dir={dir === list.dir ? undefined : dir} lang={lang === list.lang ? undefined : (lang ?? page.locale)}>
            {renderInline(item)}
          </li>
        );
      });
      return block.ordered ? (
        <ol key={i} {...list} start={block.start === 1 ? undefined : block.start}>
          {items}
        </ol>
      ) : (
        <ul key={i} {...list}>
          {items}
        </ul>
      );
    }
  }
}

export interface MarkdownProps {
  source: string;
  /** Page locale: the direction and language a block without letters of its own inherits. */
  locale: string;
  /** Savin's published channels, the only wa.me / mailto targets linked; keep the object stable. */
  allowed?: AllowedChannels;
  className?: string;
}

/**
 * Memoised on its props: while a reply streams, only the last text part
 * changes, so earlier parts of the same message never re-parse.
 */
export const Markdown = memo(function Markdown({ source, locale, allowed, className }: MarkdownProps) {
  const blocks = useMemo(() => parseMarkdown(source, allowed), [source, allowed]);
  const page = useMemo<Page>(() => ({ locale, dir: localeDir(locale) }), [locale]);
  return <div className={className}>{blocks.map((block, i) => renderBlock(block, i, page))}</div>;
});
