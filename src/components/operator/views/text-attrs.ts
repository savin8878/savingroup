// components/operator/views/text-attrs.ts
//
// dir and lang for model-written text in the artifact views: node labels,
// step labels, X-Ray lines, brief fields, source titles. The model writes in
// the visitor's language, not the page's, and mixes scripts freely, so each
// run of its text gets a direction from its own letters (../text-dir).
//
// Why not dir="auto" (or unicode-bidi: plaintext, or FSI): all three take
// the direction of the FIRST strong character, and Arabic business text
// routinely opens with a Latin product name ("Tally و Excel…", "WhatsApp
// مجموعة الإنتاج"). First-strong lays that label out left-to-right, with its
// full stop and its words in the wrong order. Note that plaintext also
// OVERRIDES an explicit dir, so the views' CSS must not set it on anything
// that carries these attributes.
//
// Why lang too: screen readers switch voice on it (WCAG 3.1.2), and the
// :lang() rules that drop tracking and capitals for non-Latin scripts apply.
//
// Pure (type-only imports aside from ../text-dir): loaded by
// scripts/operator-views.test.mjs under Node's type stripping.

import { localeDir, scriptLang, textDir, type TextDirection } from "../text-dir";

export interface TextAttrs {
  dir: TextDirection;
  /** Undefined when the page's language already fits; React then omits it. */
  lang: string | undefined;
}

/**
 * Attributes for one run of model text on a `locale` page. `fallback` is the
 * direction when the text has no letters at all ("1,200", "—"): the page's
 * unless the caller knows better (record values, mostly codes and
 * quantities, pass "ltr").
 */
export function textAttrs(text: string, locale: string, fallback: TextDirection = localeDir(locale)): TextAttrs {
  return { dir: textDir(text, fallback), lang: scriptLang(text, locale) };
}

/** What a list item adds to its list's attributes: only the parts that differ. */
export interface ItemAttrs {
  dir?: TextDirection;
  lang?: string;
}

/**
 * Attributes for a bulleted list of model text and for each of its items.
 * The list's own direction (from all items together) places the markers and
 * the indent; an item then carries a dir or lang only where it differs, so
 * an English bullet in an Arabic list still reads left-to-right. An item
 * back in the page's language under a list tagged with another one gets
 * the page locale explicitly, because lang inherits.
 */
export function listAttrs(items: readonly string[], locale: string): { list: TextAttrs; items: ItemAttrs[] } {
  const list = textAttrs(items.join("\n"), locale);
  return {
    list,
    items: items.map((item) => {
      const own = textAttrs(item, locale, list.dir);
      return {
        dir: own.dir === list.dir ? undefined : own.dir,
        lang: own.lang === list.lang ? undefined : (own.lang ?? locale),
      };
    }),
  };
}

/**
 * A multi-line model text (the X-Ray's connected architecture) as paragraphs
 * of lines: blank lines separate paragraphs, single newlines separate lines,
 * blank and whitespace-only lines are dropped. Each line then gets its own
 * direction — a paragraph-wide one would lay an English line of an Arabic
 * answer out right-to-left.
 */
export function proseBlocks(text: string): string[][] {
  return text
    .split(/\r?\n[ \t]*\r?\n/)
    .map((block) => block.split(/\r?\n/).map((line) => line.trim()).filter(Boolean))
    .filter((lines) => lines.length > 0);
}
