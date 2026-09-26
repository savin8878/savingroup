// app/api/revalidate/blog/route.ts
//
// On-demand refresh for the Supabase-backed blog. Point a Supabase Database
// Webhook (table blog_posts: insert/update/delete) at
//   POST https://<site>/api/revalidate/blog
// with header `x-revalidate-secret: <BLOG_REVALIDATE_SECRET>` and edits go
// live on the next request instead of after the ~6 minute cache window.

import { timingSafeEqual } from "node:crypto";
import { revalidatePath, revalidateTag } from "next/cache";
import { NextRequest, NextResponse } from "next/server";
import { BLOG_CACHE_TAG } from "@/lib/blogs";
import { NEWS_CACHE_TAG } from "@/lib/news";

export const dynamic = "force-dynamic";

function secretMatches(given: string | null): boolean {
  const expected = process.env.BLOG_REVALIDATE_SECRET;
  if (!expected || !given) return false;
  const a = Buffer.from(given);
  const b = Buffer.from(expected);
  return a.length === b.length && timingSafeEqual(a, b);
}

export async function POST(request: NextRequest) {
  if (!secretMatches(request.headers.get("x-revalidate-secret"))) {
    return NextResponse.json({ ok: false }, { status: 401 });
  }
  // One hook serves both content tables: the automation publisher calls it after
  // every blog post AND every newsroom story it writes.
  revalidateTag(BLOG_CACHE_TAG, { expire: 0 });
  revalidateTag(NEWS_CACHE_TAG, { expire: 0 });
  revalidatePath("/[country]/[locale]/blogs", "layout");
  revalidatePath("/[country]/[locale]/newsroom", "layout");
  revalidatePath("/[country]/sitemap.xml");
  revalidatePath("/sitemap-index.xml");
  return NextResponse.json({ ok: true, revalidated: [BLOG_CACHE_TAG, NEWS_CACHE_TAG] });
}
