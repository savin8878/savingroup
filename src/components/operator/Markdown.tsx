"use client";

// components/operator/Markdown.tsx
//
// Renders the AST from ./markdown-ast as React elements. There is deliberately no
// dangerouslySetInnerHTML on this path: model text only ever becomes a React
// text child, and every href has already passed markdown-ast.ts#safeHref.
//
// Each block carries dir="auto" so an English sentence inside an Arabic reply
// (or the reverse) lays out in its own direction. Code stays LTR.

import { memo, useMemo, type ReactNode } from "react";
import Link from "next/link";
// The parser is markdown-ast.ts, not markdown.ts: a name differing from this
// file only in case lets an extensionless "./markdown" resolve back to this
// file on case-insensitive filesystems (Windows, macOS).
import { parseMarkdown } from "./markdown-ast";
import type { Block, Inline } from "./markdown-ast";

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
      <span aria-hidden="true">{" ↗"}</span>
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

function renderBlock(block: Block, i: number): ReactNode {
  switch (block.type) {
    case "heading": {
      // The dialog title is the h2; reply headings sit below it and stay
      // small, whatever level the model chose.
      const Tag = block.level <= 2 ? "h3" : "h4";
      return (
        <Tag key={i} dir="auto">
          {renderInline(block.children)}
        </Tag>
      );
    }
    case "paragraph":
      return (
        <p key={i} dir="auto">
          {renderInline(block.children)}
        </p>
      );
    case "quote":
      return (
        <blockquote key={i} dir="auto">
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
      const items = block.items.map((item, n) => <li key={n}>{renderInline(item)}</li>);
      return block.ordered ? (
        <ol key={i} dir="auto" start={block.start === 1 ? undefined : block.start}>
          {items}
        </ol>
      ) : (
        <ul key={i} dir="auto">
          {items}
        </ul>
      );
    }
  }
}

/**
 * Memoised on `source`: while a reply streams, only the last text part
 * changes, so earlier parts of the same message never re-parse.
 */
export const Markdown = memo(function Markdown({ source, className }: { source: string; className?: string }) {
  const blocks = useMemo(() => parseMarkdown(source), [source]);
  return <div className={className}>{blocks.map(renderBlock)}</div>;
});
