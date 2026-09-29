// components/operator/markdown-ast.ts
//
// A deliberately small Markdown subset for Operator replies, parsed to an AST
// that <Markdown> renders as React elements (never as an HTML string).
//
// Why hand-rolled: no Markdown library is installed, the model only needs a
// handful of constructs, and the parser has to behave while a reply is still
// streaming in. Half-written "**bo" or "`code" must render as the literal
// characters instead of swallowing the rest of the reply, and every frame
// re-parses the whole message, so nothing here may go quadratic on
// unbalanced input.
//
// Supported: # to #### headings (##### and ###### fold into level 4),
// paragraphs with hard line breaks, "-" / "*" / "+" and "1." / "1)" lists
// (nested items are flattened into their parent item), ``` and ~~~ fences
// (an unclosed fence runs to the end, which is what streaming looks like),
// "> " quotes, **strong** / __strong__, *em* / _em_, `code`, [text](href),
// and bare allowed URLs / email addresses. Not supported: tables (the pipes
// stay text), raw HTML (stays text), images (the alt text stays text).
//
// Links are an allow-list (see safeHref): root-relative site paths,
// https://www.savingroup.in, and WhatsApp / mailto links ONLY to Savin's own
// published number and address (passed in as `allowed`; without it no wa.me
// or mailto link is produced at all). Anything else, such as javascript:,
// data:, "//host", another domain, another WhatsApp number or another email
// recipient, renders as its text only, so neither the model nor text it
// quotes (a pasted supplier email, say) can put a clickable off-site, script
// or look-alike "contact Savin" destination in front of a visitor. A link
// whose label reads as a URL, email or phone number must also name the same
// target as its href, so the label cannot disguise where it goes.
//
// Pure: loaded by scripts/operator-client.test.mjs under type stripping.

export type Inline =
  | { type: "text"; text: string }
  | { type: "strong"; children: Inline[] }
  | { type: "em"; children: Inline[] }
  | { type: "code"; text: string }
  | { type: "link"; href: string; children: Inline[] }
  | { type: "br" };

export type HeadingLevel = 1 | 2 | 3 | 4;

export type Block =
  | { type: "heading"; level: HeadingLevel; children: Inline[] }
  | { type: "paragraph"; children: Inline[] }
  | { type: "list"; ordered: boolean; start: number; items: Inline[][] }
  | { type: "code"; text: string; lang?: string }
  | { type: "quote"; children: Inline[] };

/* -------------------------------------------------------------------------- */
/*                                    Links                                   */
/* -------------------------------------------------------------------------- */

/**
 * Savin's own published channels (t.contact.details), the only WhatsApp and
 * email destinations a reply may link to. The model never needs to write
 * such links (the brief card and the error fallback build theirs from server
 * data), so anything else here is a typo or an injected look-alike.
 */
export interface AllowedChannels {
  /** The published phone number's digits, country code included ("918305838352"). */
  whatsappDigits: string;
  email: string;
}

/** wa.me/<digits>, optionally with a prefilled ?text= and nothing else. */
const WA_ME = /^https:\/\/wa\.me\/(\d{6,15})\/?(?:\?text=[^#&]*)?$/i;

/**
 * The href to render, or null when the target is not allowed.
 *
 * Whitespace, control characters and backslashes are refused outright:
 * browsers strip tabs/newlines from URLs and treat "\" like "/", so
 * "/\evil.com" or "/\t/evil.com" would otherwise become the protocol-relative
 * "//evil.com" after passing a naive prefix check.
 *
 * wa.me and mailto: fail closed: without `allowed`, or for any other number,
 * recipient, extra recipient or header (?cc=, ?bcc=, ?subject=), null.
 */
export function safeHref(raw: string, allowed?: AllowedChannels): string | null {
  const href = raw.trim();
  if (!href || href.length > 2048) return null;
  if (/[\s\\<>"'`\u0000-\u001f\u007f]/.test(href)) return null;
  if (href.startsWith("/")) return href.startsWith("//") ? null : href;
  const lower = href.toLowerCase();
  if (lower === "https://www.savingroup.in" || lower.startsWith("https://www.savingroup.in/")) return href;
  if (lower.startsWith("https://wa.me/")) {
    const digits = WA_ME.exec(href)?.[1];
    return digits && allowed?.whatsappDigits && digits === allowed.whatsappDigits ? href : null;
  }
  if (lower.startsWith("mailto:")) {
    const address = href.slice("mailto:".length);
    return address && isAllowedEmail(address, allowed) ? href : null;
  }
  return null;
}

function isAllowedEmail(address: string, allowed: AllowedChannels | undefined): boolean {
  const own = allowed?.email.trim().toLowerCase();
  return Boolean(own) && !address.includes("?") && address.toLowerCase() === own;
}

const LABEL_EMAIL = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;
const LABEL_URL = /^(?:[a-z][a-z0-9+.-]*:\/\/|www\.)/i;
const LABEL_PHONE = /^\+?[\d\s().-]+$/;

/** Scheme, "www." and trailing slashes aside, the same address. */
function sameUrl(label: string, href: string): boolean {
  const norm = (url: string) => url.toLowerCase().replace(/^https?:\/\//, "").replace(/^www\./, "").replace(/\/+$/, "");
  const target = href.startsWith("/") ? `savingroup.in${href}` : href;
  return norm(label) === norm(target);
}

/**
 * A label that itself reads as a destination (a URL, an email, a phone
 * number) must name the href's own target; any other label is free text.
 * Stops "[+91 83058 38352](https://wa.me/<someone else>)" style disguises
 * even between allowed targets.
 */
function labelFits(label: string, href: string): boolean {
  const text = label.trim();
  if (LABEL_EMAIL.test(text)) return href.toLowerCase() === `mailto:${text.toLowerCase()}`;
  if (LABEL_URL.test(text)) return sameUrl(text, href);
  const digits = text.replace(/\D/g, "");
  if (LABEL_PHONE.test(text) && digits.length >= 7) return WA_ME.exec(href)?.[1] === digits;
  return true;
}

/* -------------------------------------------------------------------------- */
/*                                   Inline                                   */
/* -------------------------------------------------------------------------- */

/** Nesting ceiling for strong/em/link recursion; deeper markup stays literal. */
const MAX_DEPTH = 6;
const ESCAPABLE = /[!-\/:-@\[-`{-~]/;
const WHITESPACE = /\s/;
// Built from strings because the compile target (ES2017) predates Unicode
// property escapes in regex literals; every browser the site supports has them.
const ALNUM = new RegExp("[\\p{L}\\p{N}]", "u");
/** Characters that may not sit right before a bare URL or email. */
const WORDISH = new RegExp("[\\p{L}\\p{N}_/:.@+%-]", "u");
const URL_START = /https:\/\/[^\s<>"'`]+/iy;
const URL_TRAILING = /[.,;:!?*_)\]}]+$/;
const EMAIL = /[A-Za-z0-9._%+-]+@[A-Za-z0-9-]+(?:\.[A-Za-z0-9-]+)*\.[A-Za-z]{2,}/y;

function pushText(out: Inline[], text: string) {
  if (!text) return;
  const last = out[out.length - 1];
  if (last?.type === "text") last.text += text;
  else out.push({ type: "text", text });
}

function pushAll(out: Inline[], nodes: Inline[]) {
  for (const node of nodes) {
    if (node.type === "text") pushText(out, node.text);
    else out.push(node);
  }
}

function runLength(src: string, at: number, ch: string): number {
  let n = 0;
  while (src[at + n] === ch) n++;
  return n;
}

/** Index of the matching run of exactly `n` backticks after `from`, or -1. */
function findCodeClose(src: string, from: number, n: number): number {
  for (let j = src.indexOf("`", from); j !== -1; ) {
    const m = runLength(src, j, "`");
    if (m === n) return j;
    j = src.indexOf("`", j + m);
  }
  return -1;
}

/**
 * Start of a valid closing delimiter for `want` (1 = em, 2 = strong) after
 * `from`, or -1. A closer must follow a non-space character, and "_" must not
 * be followed by a letter or digit (so snake_case never turns italic). For
 * strong, a longer closing run closes with its LAST two characters, which is
 * what makes "***both***" come out as strong(em(both)).
 */
function findCloser(src: string, from: number, ch: string, want: 1 | 2): number {
  for (let j = src.indexOf(ch, from); j !== -1; ) {
    const m = runLength(src, j, ch);
    const prev = src[j - 1];
    const next = src[j + m];
    const valid = prev !== undefined && !WHITESPACE.test(prev) && (ch !== "_" || next === undefined || !ALNUM.test(next));
    if (valid) {
      if (want === 2 && m >= 2 && j + m - 2 > from) return j + m - 2;
      if (want === 1 && m === 1 && j > from) return j;
    }
    j = src.indexOf(ch, j + m);
  }
  return -1;
}

interface LinkMatch {
  label: string;
  href: string;
  end: number;
}

/** `[label](href "optional title")` starting at `at` (the "["), bounded so a
 *  stray "[" cannot trigger a scan of the whole message. */
function matchLink(src: string, at: number): LinkMatch | null {
  let depth = 0;
  let j = at + 1;
  for (; j < src.length && j - at < 500; j++) {
    const c = src[j];
    if (c === "\\") j++;
    else if (c === "[") depth++;
    else if (c === "]") {
      if (depth === 0) break;
      depth--;
    }
  }
  if (src[j] !== "]" || src[j + 1] !== "(") return null;
  let k = j + 2;
  let parens = 0;
  for (; k < src.length && k - j < 2100; k++) {
    const c = src[k];
    if (c === "\\") k++;
    else if (c === "\n") return null;
    else if (c === "(") parens++;
    else if (c === ")") {
      if (parens === 0) break;
      parens--;
    }
  }
  if (src[k] !== ")") return null;
  let target = src.slice(j + 2, k).trim();
  const titled = /^(\S+)\s+(?:"[^"]*"|'[^']*'|\([^)]*\))$/.exec(target);
  if (titled) target = titled[1];
  if (target.startsWith("<") && target.endsWith(">")) target = target.slice(1, -1);
  return { label: src.slice(at + 1, j), href: target, end: k + 1 };
}

/**
 * Parse one block's worth of inline markup. `links` is false inside a link
 * label so a label can never contain a second (nested) link.
 */
function inline(src: string, depth: number, links: boolean, allowed: AllowedChannels | undefined): Inline[] {
  const out: Inline[] = [];
  let text = "";
  const flush = () => {
    pushText(out, text);
    text = "";
  };
  // Delimiters proven to have no closer anywhere after the current position.
  // Closer validity never depends on where the opener is, so a miss stays a
  // miss for every later opener: this is what keeps unbalanced input linear.
  const noCloser = new Set<string>();
  // Emails are only tried before the last "@": one lookup instead of a scan
  // per word.
  const lastAt = links ? src.lastIndexOf("@") : -1;
  let i = 0;

  while (i < src.length) {
    const ch = src[i];

    if (ch === "\\") {
      const next = src[i + 1];
      if (next === "\n") {
        flush();
        out.push({ type: "br" });
        i += 2;
        continue;
      }
      if (next !== undefined && ESCAPABLE.test(next)) {
        text += next;
        i += 2;
        continue;
      }
    }

    if (ch === "\n") {
      text = text.replace(/[ \t]+$/, "");
      flush();
      out.push({ type: "br" });
      i++;
      while (src[i] === " " || src[i] === "\t") i++;
      continue;
    }

    if (ch === "`") {
      const n = runLength(src, i, "`");
      const key = "`" + n;
      const close = noCloser.has(key) ? -1 : findCodeClose(src, i + n, n);
      if (close === -1) {
        noCloser.add(key);
        text += src.slice(i, i + n);
        i += n;
        continue;
      }
      flush();
      let code = src.slice(i + n, close).replace(/\n/g, " ");
      if (code.length > 2 && code.startsWith(" ") && code.endsWith(" ") && code.trim()) code = code.slice(1, -1);
      out.push({ type: "code", text: code });
      i = close + n;
      continue;
    }

    // Images are not rendered: keep the alt text, drop the source.
    if (ch === "!" && src[i + 1] === "[") {
      const image = matchLink(src, i + 1);
      if (image) {
        text += image.label;
        i = image.end;
        continue;
      }
    }

    if (ch === "[" && links && depth < MAX_DEPTH) {
      const link = matchLink(src, i);
      if (link) {
        flush();
        const children = inline(link.label, depth + 1, false, allowed);
        const href = safeHref(link.href, allowed);
        if (href && children.length && labelFits(inlineText(children), href)) out.push({ type: "link", href, children });
        else pushAll(out, children);
        i = link.end;
        continue;
      }
    }

    if ((ch === "*" || ch === "_") && depth < MAX_DEPTH) {
      const n = runLength(src, i, ch);
      const after = src[i + n];
      const before = src[i - 1];
      // An opener must be followed by a non-space; "_" must also not start
      // inside a word (snake_case, file_names).
      const canOpen = after !== undefined && !WHITESPACE.test(after) && (ch !== "_" || before === undefined || !ALNUM.test(before));
      const want: 1 | 2 = n >= 2 ? 2 : 1;
      const key = ch + want;
      if (canOpen && !noCloser.has(key)) {
        const from = i + want;
        const close = findCloser(src, from, ch, want);
        if (close === -1) noCloser.add(key);
        else {
          const children = inline(src.slice(from, close), depth + 1, links, allowed);
          if (children.length) {
            flush();
            out.push(want === 2 ? { type: "strong", children } : { type: "em", children });
            i = close + want;
            continue;
          }
        }
      }
      text += src.slice(i, i + n);
      i += n;
      continue;
    }

    const wordStart = links && (i === 0 || !WORDISH.test(src[i - 1]));

    if (wordStart && (ch === "h" || ch === "H")) {
      URL_START.lastIndex = i;
      const match = URL_START.exec(src);
      if (match) {
        const url = match[0].replace(URL_TRAILING, "");
        const href = safeHref(url, allowed);
        if (href) {
          flush();
          out.push({ type: "link", href, children: [{ type: "text", text: url }] });
          i += url.length;
          continue;
        }
      }
    }

    if (wordStart && i < lastAt) {
      EMAIL.lastIndex = i;
      const match = EMAIL.exec(src);
      if (match) {
        // Only Savin's own address becomes a link; any other address (a
        // supplier's, or a look-alike injected into pasted text) stays text.
        if (isAllowedEmail(match[0], allowed)) {
          flush();
          out.push({ type: "link", href: `mailto:${match[0]}`, children: [{ type: "text", text: match[0] }] });
        } else {
          text += match[0];
        }
        i += match[0].length;
        continue;
      }
    }

    text += ch;
    i++;
  }

  flush();
  // Drop a trailing break (a reply that ends mid-line while streaming).
  while (out[out.length - 1]?.type === "br") out.pop();
  return out;
}

/** `allowed`: Savin's published channels; without it, no wa.me or mailto link survives. */
export function parseInline(src: string, allowed?: AllowedChannels): Inline[] {
  return inline(src, 0, true, allowed);
}

/* -------------------------------------------------------------------------- */
/*                                   Blocks                                   */
/* -------------------------------------------------------------------------- */

const FENCE = /^ {0,3}(`{3,}|~{3,})(.*)$/;
const FENCE_LANG = /^[ \t]*([\w+#.-]+)/;
const HEADING = /^ {0,3}(#{1,6})(?:[ \t]+(.*?))?(?:[ \t]+#+)?[ \t]*$/;
const RULE = /^ {0,3}([-*_])(?:[ \t]*\1){2,}[ \t]*$/;
const QUOTE = /^ {0,3}>[ \t]?(.*)$/;
const BULLET = /^( *)([-*+])[ \t]+(.*)$/;
const ORDERED = /^( *)(\d{1,9})[.)][ \t]+(.*)$/;

interface ListItem {
  indent: number;
  ordered: boolean;
  number: number;
  text: string;
}

function listItem(line: string): ListItem | null {
  const expanded = line.replace(/\t/g, "    ");
  const ordered = ORDERED.exec(expanded);
  if (ordered) return { indent: ordered[1].length, ordered: true, number: Number(ordered[2]), text: ordered[3] };
  const bullet = BULLET.exec(expanded);
  if (bullet) return { indent: bullet[1].length, ordered: false, number: 0, text: bullet[3] };
  return null;
}

/** An opening fence, or null. A backtick fence whose info string contains a
 *  backtick is inline code on one line ("```x```"), not a fence. */
function openFence(line: string): { marker: string; lang?: string } | null {
  const match = FENCE.exec(line);
  if (!match) return null;
  const [, marker, rest] = match;
  if (marker[0] === "`" && rest.includes("`")) return null;
  const lang = FENCE_LANG.exec(rest)?.[1];
  return lang ? { marker, lang } : { marker };
}

function isFenceClose(line: string, marker: string): boolean {
  const trimmed = line.trim();
  return trimmed.length >= marker.length && trimmed[0] === marker[0] && /^(?:`+|~+)$/.test(trimmed);
}

/** Lines that end a paragraph or a list item's lazy continuation. */
function startsBlock(line: string): boolean {
  return openFence(line) !== null || HEADING.test(line) || QUOTE.test(line) || RULE.test(line);
}

/** Parse a list starting at `lines[at]`; returns the index after it. */
function parseList(lines: string[], at: number, blocks: Block[], allowed: AllowedChannels | undefined): number {
  const first = listItem(lines[at]) as ListItem;
  const items: string[][] = [];
  let current = [first.text];
  let blank = false;
  let i = at + 1;

  for (; i < lines.length; i++) {
    const line = lines[i];
    if (!line.trim()) {
      blank = true;
      continue;
    }
    const item = listItem(line);
    if (item && item.indent <= first.indent + 1) {
      if (item.ordered !== first.ordered) break;
      items.push(current);
      current = [item.text];
      blank = false;
      continue;
    }
    if (item) {
      // Nested item: flattened into the current one, keeping its marker so
      // the structure still reads.
      current.push(`${item.ordered ? `${item.number}.` : "–"} ${item.text}`);
      blank = false;
      continue;
    }
    const indent = line.length - line.trimStart().length;
    if (blank && indent < 2) break;
    if (!blank && startsBlock(line)) break;
    if (blank) current.push("");
    current.push(line.trim());
    blank = false;
  }

  items.push(current);
  blocks.push({
    type: "list",
    ordered: first.ordered,
    start: first.ordered ? first.number : 1,
    items: items.map((lines) => parseInline(lines.join("\n"), allowed)),
  });
  return i;
}

/** `allowed`: Savin's published channels; without it, no wa.me or mailto link survives. */
export function parseMarkdown(source: string, allowed?: AllowedChannels): Block[] {
  const lines = source.replace(/\r\n?/g, "\n").split("\n");
  const blocks: Block[] = [];
  let paragraph: string[] = [];

  const flushParagraph = () => {
    if (!paragraph.length) return;
    const children = parseInline(paragraph.join("\n"), allowed);
    if (children.length) blocks.push({ type: "paragraph", children });
    paragraph = [];
  };

  let i = 0;
  while (i < lines.length) {
    const line = lines[i];

    if (!line.trim()) {
      flushParagraph();
      i++;
      continue;
    }

    const fence = openFence(line);
    if (fence) {
      flushParagraph();
      const body: string[] = [];
      i++;
      while (i < lines.length && !isFenceClose(lines[i], fence.marker)) body.push(lines[i++]);
      i++;
      const text = body.join("\n");
      blocks.push(fence.lang ? { type: "code", text, lang: fence.lang } : { type: "code", text });
      continue;
    }

    const heading = HEADING.exec(line);
    if (heading) {
      flushParagraph();
      const children = parseInline((heading[2] ?? "").trim(), allowed);
      const level = Math.min(heading[1].length, 4) as HeadingLevel;
      if (children.length) blocks.push({ type: "heading", level, children });
      i++;
      continue;
    }

    // Before lists: "* * *" is a rule, not a bullet.
    if (RULE.test(line)) {
      flushParagraph();
      i++;
      continue;
    }

    if (QUOTE.test(line)) {
      flushParagraph();
      const body: string[] = [];
      while (i < lines.length) {
        const quoted = QUOTE.exec(lines[i]);
        if (!quoted) break;
        body.push(quoted[1]);
        i++;
      }
      const children = parseInline(body.join("\n").trim(), allowed);
      if (children.length) blocks.push({ type: "quote", children });
      continue;
    }

    const item = listItem(line);
    if (item && item.indent < 4) {
      flushParagraph();
      i = parseList(lines, i, blocks, allowed);
      continue;
    }

    paragraph.push(line);
    i++;
  }

  flushParagraph();
  return blocks;
}

/* -------------------------------------------------------------------------- */
/*                                 Plain text                                 */
/* -------------------------------------------------------------------------- */

/**
 * The visible text of inline nodes. `code: false` leaves code spans out,
 * which is what <Markdown> wants when judging a block's language: an ERP
 * field name in backticks says nothing about the sentence around it.
 */
export function inlineText(nodes: Inline[], { code = true }: { code?: boolean } = {}): string {
  let out = "";
  for (const node of nodes) {
    if (node.type === "text") out += node.text;
    else if (node.type === "code") out += code ? node.text : " ";
    else if (node.type === "br") out += "\n";
    else out += inlineText(node.children, { code });
  }
  return out;
}

/** The reply as plain text, for the screen-reader announcement. */
export function markdownToPlainText(source: string): string {
  return parseMarkdown(source)
    .map((block) => {
      switch (block.type) {
        case "code":
          return block.text;
        case "list":
          return block.items.map((item, n) => `${block.ordered ? `${block.start + n}.` : "-"} ${inlineText(item)}`).join("\n");
        default:
          return inlineText(block.children);
      }
    })
    .join("\n");
}
