import { buildSitemapIndex, loadSitemapContent } from "@/lib/sitemap";
import { renderSitemapIndex, xmlResponse } from "@/lib/sitemap-xml";

// Same caching and failure semantics as /[country]/sitemap.xml: prerendered,
// regenerated in the background at most once a minute or on
// /api/revalidate/blog, last good copy kept on error.
export const dynamic = "force-static";
export const revalidate = 86400;

export async function GET() {
  return xmlResponse(renderSitemapIndex(buildSitemapIndex(await loadSitemapContent())));
}
