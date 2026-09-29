import {
  SITEMAP_COUNTRIES,
  buildCountrySitemap,
  isSitemapCountry,
  loadSitemapContent,
} from "@/lib/sitemap";
import { renderUrlset, xmlResponse } from "@/lib/sitemap-xml";

// Prerendered at build for every indexable country. The 60 s blog/news data
// cache (blogs.ts, news.ts) caps `revalidate` below, so a request more than a
// minute after the last regeneration gets the cached sitemap and triggers one
// background rebuild; /api/revalidate/blog refreshes it at once through the
// `blogs`/`news` cache tags. Nothing here reads the request, so the response
// is identical for every crawler, cookie and geo.
//
// A failed database read throws instead of answering 5xx: during a build that
// fails the deploy, and during regeneration Next keeps serving the last good
// sitemap. Reading request headers here would make the route dynamic again,
// with no cached copy to fall back on.
export const dynamic = "force-static";
export const revalidate = 86400;

export function generateStaticParams() {
  return SITEMAP_COUNTRIES.map((country) => ({ country }));
}

export async function GET(
  _request: Request,
  { params }: { params: Promise<{ country: string }> },
) {
  const { country } = await params;
  // Unknown and non-indexable countries must be answered here. With
  // `dynamicParams = false` they would fall through to /[country]/[locale]
  // (locale "sitemap.xml") and render the homepage as a 200.
  if (!isSitemapCountry(country)) {
    return new Response("Not Found", {
      status: 404,
      headers: { "Content-Type": "text/plain; charset=utf-8" },
    });
  }
  const urls = buildCountrySitemap(country, await loadSitemapContent());
  return xmlResponse(renderUrlset(urls));
}
