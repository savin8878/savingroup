import { BASE_URL, COUNTRIES } from "@/lib/constants";
import { getAllBlogPosts } from "@/lib/blogs";
import {
  STATIC_PAGE_LASTMOD,
  CITY_LASTMOD,
  INDUSTRY_LASTMOD,
} from "@/lib/sitemap-lastmod";
import { NextResponse } from "next/server";

// Revalidate at most once per day — same rationale as the per-country sitemap.
export const revalidate = 86400;

/**
 * Resolve the public base URL from the incoming request.
 *
 * Uses the `Host` header (forwarded by Vercel/proxies) + protocol detection
 * so that:
 *   - localhost:3000 requests return http://localhost:3000 URLs
 *   - www.savingroup.in requests return https://www.savingroup.in URLs
 *   - Falls back to BASE_URL constant if headers are unavailable
 *
 * This matters for SEO: Google rejects sitemaps where the <loc> URLs don't
 * match the host the sitemap was served from (cross-submission restriction).
 */
function resolveBaseUrl(request: Request): string {
  const host =
    request.headers.get("x-forwarded-host") ??
    request.headers.get("host");
  if (!host) return BASE_URL;

  const proto =
    request.headers.get("x-forwarded-proto") ??
    (host.startsWith("localhost") || host.startsWith("127.0.0.1")
      ? "http"
      : "https");

  return `${proto}://${host}`;
}

export async function GET(request: Request) {
  const base = resolveBaseUrl(request);
  let BLOG_POSTS;
  try {
    BLOG_POSTS = await getAllBlogPosts();
  } catch (err) {
    // Never publish a sitemap that silently drops every blog URL — tell
    // crawlers to come back instead, and keep this response out of caches.
    console.error("[sitemap] blog posts unavailable:", err instanceof Error ? err.message : err);
    return new NextResponse("Sitemap temporarily unavailable", {
      status: 503,
      headers: { "Cache-Control": "no-store", "Retry-After": "600" },
    });
  }

  // Real freshness signal, taken across EVERY content type the child sitemap
  // emits — not just blog posts. It previously used only the newest
  // BLOG_POSTS date, which understated the child by about four weeks: the 79
  // most recently touched URLs (every city page) carry CITY_LASTMOD and were
  // invisible at the index level, so Google was told the whole country
  // sitemap was staler than it is.
  //
  // Still a fixed set of dates rather than `new Date()` — a lastmod that
  // moves on every render is a freshness signal Google learns to discount.
  const latestContentDate =
    [
      ...BLOG_POSTS.map((p) => p.updatedAt ?? p.publishedAt),
      CITY_LASTMOD,
      INDUSTRY_LASTMOD,
      ...Object.values(STATIC_PAGE_LASTMOD),
    ]
      .filter(Boolean)
      .sort()
      .pop() ?? "2026-01-01";

  const sitemaps = COUNTRIES.map((country: string) => ({
    loc: `${base}/${country}/sitemap.xml`,
    lastmod: latestContentDate,
  }));

  const xml = `<?xml version="1.0" encoding="UTF-8"?>
<sitemapindex xmlns="http://www.sitemaps.org/schemas/sitemap/0.9">
${sitemaps
  .map(
    (s) => `  <sitemap>
    <loc>${s.loc}</loc>
    <lastmod>${s.lastmod}</lastmod>
  </sitemap>`
  )
  .join("\n")}
</sitemapindex>`;

  return new NextResponse(xml, {
    headers: {
      "Content-Type": "application/xml; charset=utf-8",
      "Cache-Control": "public, s-maxage=86400, stale-while-revalidate=43200",
    },
  });
}
