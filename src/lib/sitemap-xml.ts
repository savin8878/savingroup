/**
 * Sitemap XML serialization (https://www.sitemaps.org/protocol.html).
 *
 * Only `<loc>` and `<lastmod>` are written. `<changefreq>` and `<priority>`
 * are ignored by Google, so they are left out rather than invented.
 */

export const SITEMAP_NS = "http://www.sitemaps.org/schemas/sitemap/0.9";

/** Protocol limits for a single sitemap or sitemap index file. */
export const MAX_URLS_PER_SITEMAP = 50_000;
export const MAX_SITEMAP_BYTES = 50 * 1024 * 1024;

export interface SitemapEntry {
  loc: string;
  /** W3C date or datetime. Omitted when there is no reliable source. */
  lastmod?: string;
}

const XML_ENTITIES: Record<string, string> = {
  "&": "&amp;",
  "<": "&lt;",
  ">": "&gt;",
  '"': "&quot;",
  "'": "&apos;",
};

export function escapeXml(value: string): string {
  return value.replace(/[&<>"']/g, (ch) => XML_ENTITIES[ch]);
}

const W3C_DATETIME =
  /^\d{4}-(0[1-9]|1[0-2])-(0[1-9]|[12]\d|3[01])(T([01]\d|2[0-3]):[0-5]\d(:[0-5]\d(\.\d+)?)?(Z|[+-]([01]\d|2[0-3]):[0-5]\d))?$/;

export function isW3cDatetime(value: string): boolean {
  return W3C_DATETIME.test(value);
}

function renderEntry(tag: "url" | "sitemap", { loc, lastmod }: SitemapEntry): string {
  const lastmodXml = lastmod && isW3cDatetime(lastmod) ? `\n    <lastmod>${lastmod}</lastmod>` : "";
  return `  <${tag}>\n    <loc>${escapeXml(loc)}</loc>${lastmodXml}\n  </${tag}>`;
}

function render(root: "urlset" | "sitemapindex", tag: "url" | "sitemap", entries: readonly SitemapEntry[]): string {
  if (entries.length > MAX_URLS_PER_SITEMAP) {
    throw new Error(
      `Sitemap has ${entries.length} entries; the protocol limit is ${MAX_URLS_PER_SITEMAP}. Split it into child sitemaps.`,
    );
  }
  const xml =
    `<?xml version="1.0" encoding="UTF-8"?>\n<${root} xmlns="${SITEMAP_NS}">\n` +
    entries.map((e) => renderEntry(tag, e)).join("\n") +
    `\n</${root}>\n`;
  const bytes = new TextEncoder().encode(xml).byteLength;
  if (bytes > MAX_SITEMAP_BYTES) {
    throw new Error(`Sitemap is ${bytes} bytes; the protocol limit is ${MAX_SITEMAP_BYTES}. Split it into child sitemaps.`);
  }
  return xml;
}

export function renderUrlset(urls: readonly SitemapEntry[]): string {
  return render("urlset", "url", urls);
}

export function renderSitemapIndex(sitemaps: readonly SitemapEntry[]): string {
  return render("sitemapindex", "sitemap", sitemaps);
}

export function xmlResponse(xml: string): Response {
  return new Response(xml, {
    headers: { "Content-Type": "application/xml; charset=utf-8" },
  });
}
