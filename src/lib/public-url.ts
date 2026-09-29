import { BASE_URL } from "@/lib/constants";

/**
 * The one place a public page URL is spelled out.
 *
 * Canonicals and hreflang alternates (`seo.ts`) and every sitemap `<loc>`
 * (`sitemap.ts`) are built here, so the URL a sitemap lists is byte-for-byte
 * the canonical the page itself declares.
 *
 * The origin is the production constant on purpose, not the request host:
 * local builds and preview deployments must still emit production canonicals,
 * and a sitemap that listed `http://localhost:3000/...` or a `*.vercel.app`
 * host would be rejected by Search Console.
 */
export const SITE_ORIGIN = new URL(BASE_URL).origin;

export interface LocalizedPathInput {
  country: string;
  locale: string;
  /** The part after `/{country}/{locale}` — `""`, `"services"`, `"/blogs/some-post/"`. */
  pathname?: string;
}

function encodeSegment(segment: string): string {
  let decoded = segment;
  try {
    decoded = decodeURIComponent(segment);
  } catch {
    // Malformed escape sequence: encode the raw text instead.
  }
  return encodeURIComponent(decoded);
}

/**
 * `/{country}/{locale}/{...pathname}` with lowercase market segments, no
 * trailing slash, no empty or dot segments, no query or fragment, and each
 * segment percent-encoded exactly once. Path segments keep their case because
 * slugs are matched case-sensitively by the routes that serve them.
 */
export function localizedPath({ country, locale, pathname = "" }: LocalizedPathInput): string {
  const c = country.trim().toLowerCase();
  const l = locale.trim().toLowerCase();
  const rest = pathname
    .split(/[?#]/, 1)[0]
    .split("/")
    .filter((s) => s !== "" && s !== "." && s !== "..");
  // A caller that passes the full path rather than the part after the market
  // prefix would otherwise produce /in/en/in/en/...
  if (rest[0]?.toLowerCase() === c && rest[1]?.toLowerCase() === l) rest.splice(0, 2);
  return "/" + [c, l, ...rest].map(encodeSegment).join("/");
}

/** Absolute production URL for a localized page. */
export function normalizePublicUrl(input: LocalizedPathInput): string {
  return `${SITE_ORIGIN}${localizedPath(input)}`;
}
