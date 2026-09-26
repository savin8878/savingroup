/**
 * Blog data — long-form posts stored in Supabase. Each post is a rich, opinionated
 * piece of writing with structured sections so the detail page can render
 * headings, paragraphs, bullets, callouts and inline sketches cleanly.
 *
 * Post body (sections) is maintained in English and surfaces for every
 * locale. Title / subtitle / excerpt can be overridden per-locale via the
 * `translations` field — see `localizePost` below for the resolver.
 */

import { cache } from "react";
import { unstable_cache } from "next/cache";
import postgres from "postgres";
import type { Locale } from "@/lib/i18n";
import { SUPABASE_ROOT_CA } from "@/lib/supabase-ca";

export type BlogCategory =
  | "growth"
  | "automation"
  | "seo"
  | "case-study"
  | "ops";

export const BLOG_CATEGORIES: { key: BlogCategory | "all"; label: string }[] = [
  { key: "all",         label: "All posts"  },
  { key: "growth",      label: "Growth"     },
  { key: "automation",  label: "Automation" },
  { key: "seo",         label: "SEO"        },
  { key: "case-study",  label: "Case study" },
  { key: "ops",         label: "Ops"        },
];

export type BlogSketchKey =
  | "auditLens"
  | "leakyFunnel"
  | "whatsappFlow"
  | "layerStack"
  | "seoPeakGraph"
  | "procurementFlow";

export interface BlogSection {
  heading: string;
  /**
   * Each paragraph can contain inline markdown-style links that will be
   * parsed into real <a> tags at render time. Format: `[anchor text](/path)`.
   * Use relative paths (they'll be wrapped through LocalizedLink).
   */
  paragraphs: string[];
  bullets?: string[];
  callout?: { title: string; body: string };
  pullQuote?: string;
  /**
   * Interactive figure rendered after this section's text.
   * "procurement" = the animated requisition → goods-receipt walkthrough.
   */
  embed?: "procurement";
}

/**
 * SEO keyword metadata. `searchVolume` is an approximate monthly search
 * count (India-wide, from common keyword tools). `difficulty` is the
 * strategic difficulty to rank 1–10 within 6 months.
 */
export interface BlogKeywords {
  primary: string;
  secondary: string[];
  searchVolume: number;
  difficulty: "low" | "medium" | "high";
  intent: "informational" | "commercial" | "transactional";
}

export interface BlogFaq {
  question: string;
  answer: string;
}

/** Localized strings per post — title/subtitle/excerpt only. */
export interface BlogPostTranslation {
  title?: string;
  subtitle?: string;
  excerpt?: string;
}

export interface BlogPost {
  slug: string;
  title: string;
  subtitle: string;
  excerpt: string;
  category: BlogCategory;
  readTime: number;
  publishedAt: string;
  updatedAt?: string;
  author: { name: string; role: string; bio?: string };
  heroSketch: BlogSketchKey;
  keywords: BlogKeywords;
  takeaways: string[];
  sections: BlogSection[];
  tags: string[];
  /** Slugs of posts this article explicitly links to in the body. */
  relatedSlugs: string[];
  /** Contextual cross-page links (services, case-studies, contact, etc). */
  crossPageLinks?: { href: string; label: string; note: string }[];
  /** Short FAQ section appended to the post body and used for FAQPage JSON-LD. */
  faq?: BlogFaq[];
  /** Featured flag — surfaces in the hero carousel. */
  featured?: boolean;
  /** Estimated popularity (0-100) used for the "most read" strip ordering. */
  popularityScore?: number;
  /** Per-locale overrides for title/subtitle/excerpt. Missing entries fall back to English. */
  translations?: Partial<Record<Locale, BlogPostTranslation>>;
}

/**
 * Returns the post with title/subtitle/excerpt swapped for the locale
 * translation if one exists. Falls back to the English base strings.
 */
export function localizePost(post: BlogPost, locale: Locale): BlogPost {
  const tr = post.translations?.[locale];
  if (!tr) return post;
  return {
    ...post,
    title: tr.title ?? post.title,
    subtitle: tr.subtitle ?? post.subtitle,
    excerpt: tr.excerpt ?? post.excerpt,
  };
}

/** Topic clusters — hub-and-spoke structure for SEO internal linking. */
export const TOPIC_CLUSTERS: {
  key: string;
  title: string;
  description: string;
  slugs: string[];
  primaryKeyword: string;
}[] = [
  {
    key: "conversion",
    title: "Conversion & growth systems",
    description:
      "Everything from the 45-minute audit to the 7-second hero to the 2-hour form fix — the mechanics that take an SME from 1.9% CVR to 4%+ without touching the design.",
    slugs: [
      "revenue-audit-45-minutes",
      "why-websites-leak-leads",
      "7-second-hero-section",
      "d2c-catalog-conversion",
      "5-layer-revenue-stack",
    ],
    primaryKeyword: "revenue audit",
  },
  {
    key: "automation",
    title: "WhatsApp & sales automation",
    description:
      "Why WhatsApp is the cheapest closing channel in India, the three-tier bot→RM→human stack, the WhatsApp-as-CRM architecture, and per-industry automation playbooks.",
    slugs: [
      "whatsapp-sales-agent-in-7-days",
      "whatsapp-as-crm",
      "real-estate-lead-scoring",
      "clinic-reception-automation",
      "procurement-automation-requisition-to-receipt",
    ],
    primaryKeyword: "whatsapp sales automation",
  },
  {
    key: "seo",
    title: "SEO & organic growth",
    description:
      "Topical authority, the three signals Google trusts, Core Web Vitals for SMEs, and the paid + organic interplay that compounds over 6 months.",
    slugs: [
      "seo-that-actually-ranks",
      "core-web-vitals-90-minute-fix",
      "google-ads-that-pay",
      "ai-copywriting-india",
    ],
    primaryKeyword: "seo strategy india",
  },
];

// ---------------------------------------------------------------------------
// Data source — posts live in the Supabase `blog_posts` table
// (schema: supabase/schema.sql). The helpers below are pure and take the
// fetched array, so a page fetches once and derives everything from it.
// ---------------------------------------------------------------------------

/** Row shape of the `blog_posts` table (snake_case columns). */
interface BlogPostRow {
  slug: string;
  title: string;
  subtitle: string;
  excerpt: string;
  category: BlogCategory;
  read_time: number;
  published_at: string;
  updated_at: string | null;
  author: BlogPost["author"];
  hero_sketch: BlogSketchKey;
  keywords: BlogKeywords;
  takeaways: string[];
  sections: BlogSection[];
  tags: string[];
  related_slugs: string[];
  cross_page_links: BlogPost["crossPageLinks"] | null;
  faq: BlogFaq[] | null;
  featured: boolean;
  popularity_score: number | null;
  translations: BlogPost["translations"] | null;
}

const CATEGORY_KEYS: readonly BlogCategory[] = ["growth", "automation", "seo", "case-study", "ops"];
const SKETCH_KEYS: readonly BlogSketchKey[] = ["auditLens", "leakyFunnel", "whatsappFlow", "layerStack", "seoPeakGraph", "procurementFlow"];

const isObject = (v: unknown): v is Record<string, unknown> =>
  typeof v === "object" && v !== null && !Array.isArray(v);
const isString = (v: unknown): v is string => typeof v === "string";
const strings = (v: unknown): string[] => (Array.isArray(v) ? v.filter(isString) : []);

function toSection(v: unknown): BlogSection | null {
  if (!isObject(v) || !isString(v.heading)) return null;
  const section: BlogSection = { heading: v.heading, paragraphs: strings(v.paragraphs) };
  if (Array.isArray(v.bullets)) section.bullets = strings(v.bullets);
  if (isObject(v.callout) && isString(v.callout.title) && isString(v.callout.body)) {
    section.callout = { title: v.callout.title, body: v.callout.body };
  }
  if (isString(v.pullQuote)) section.pullQuote = v.pullQuote;
  if (v.embed === "procurement") section.embed = "procurement";
  return section;
}

/**
 * Rows are edited by hand in the Supabase dashboard, so the jsonb columns are
 * checked and normalized here. A row missing something the pages can't render
 * without is skipped (and logged) instead of crashing every blog page.
 */
function rowToPost(r: BlogPostRow): BlogPost | null {
  const author = r.author as unknown;
  const keywords = r.keywords as unknown;
  const problems: string[] = [];
  if (!isString(r.slug) || !r.slug) problems.push("slug");
  if (!isString(r.title) || !r.title) problems.push("title");
  if (!CATEGORY_KEYS.includes(r.category)) problems.push("category");
  if (!SKETCH_KEYS.includes(r.hero_sketch)) problems.push("hero_sketch");
  if (!isObject(author) || !isString(author.name)) problems.push("author.name");
  if (!isObject(keywords) || !isString(keywords.primary)) problems.push("keywords.primary");
  if (problems.length) {
    console.error(`[blogs] Skipping post "${r.slug}": invalid ${problems.join(", ")}`);
    return null;
  }
  const a = author as Record<string, unknown>;
  const k = keywords as Record<string, unknown>;
  const faq = Array.isArray(r.faq)
    ? (r.faq as unknown[]).filter(
        (f): f is BlogFaq => isObject(f) && isString(f.question) && isString(f.answer)
      )
    : undefined;
  const links = Array.isArray(r.cross_page_links)
    ? (r.cross_page_links as unknown[]).filter(
        (l): l is { href: string; label: string; note: string } =>
          isObject(l) && isString(l.href) && isString(l.label) && isString(l.note)
      )
    : undefined;

  return {
    slug: r.slug,
    title: r.title,
    subtitle: isString(r.subtitle) ? r.subtitle : "",
    excerpt: isString(r.excerpt) ? r.excerpt : "",
    category: r.category,
    readTime: Number.isFinite(r.read_time) && r.read_time > 0 ? r.read_time : 5,
    publishedAt: r.published_at,
    updatedAt: r.updated_at ?? undefined,
    author: {
      name: a.name as string,
      role: isString(a.role) ? a.role : "",
      ...(isString(a.bio) ? { bio: a.bio } : {}),
    },
    heroSketch: r.hero_sketch,
    keywords: {
      primary: k.primary as string,
      secondary: strings(k.secondary),
      searchVolume: typeof k.searchVolume === "number" ? k.searchVolume : 0,
      difficulty: (["low", "medium", "high"] as const).includes(k.difficulty as "low")
        ? (k.difficulty as BlogKeywords["difficulty"])
        : "medium",
      intent: (["informational", "commercial", "transactional"] as const).includes(k.intent as "commercial")
        ? (k.intent as BlogKeywords["intent"])
        : "informational",
    },
    takeaways: strings(r.takeaways),
    sections: Array.isArray(r.sections)
      ? (r.sections as unknown[]).map(toSection).filter((s): s is BlogSection => s !== null)
      : [],
    tags: strings(r.tags),
    relatedSlugs: strings(r.related_slugs),
    crossPageLinks: links,
    faq,
    featured: r.featured || undefined,
    popularityScore: r.popularity_score ?? undefined,
    translations: isObject(r.translations) ? r.translations : undefined,
  };
}

/**
 * Seconds a database read stays cached. Pages also regenerate on their own
 * `revalidate` (300 s), so an edit shows up within about 6 minutes — or
 * immediately via POST /api/revalidate/blog (see supabase/README.md).
 */
const BLOG_REVALIDATE_SECONDS = 60;

/** Cache tag for every blog read — revalidated by /api/revalidate/blog. */
export const BLOG_CACHE_TAG = "blogs";

/**
 * One shared Postgres client per server process (kept on globalThis so dev
 * hot-reloads don't open a new pool each time; rebuilt if DATABASE_URL
 * changes). DATABASE_URL points at the Supabase transaction pooler, which
 * doesn't support prepared statements, and should use the read-only
 * `blog_reader` role.
 */
const globalForDb = globalThis as unknown as {
  __blogDb?: { url: string; sql: postgres.Sql };
};

export function getDb(): postgres.Sql {
  const url = process.env.DATABASE_URL;
  if (!url) {
    throw new Error(
      "DATABASE_URL is not set — blog posts are loaded from Supabase. See supabase/README.md."
    );
  }
  if (globalForDb.__blogDb?.url !== url) {
    void globalForDb.__blogDb?.sql.end({ timeout: 5 });
    // `pgbouncer=true` is a Prisma-style flag; postgres.js would forward it
    // to the server as a startup parameter, so strip it.
    const u = new URL(url);
    u.searchParams.delete("pgbouncer");
    const sql = postgres(u.toString(), {
      prepare: false,
      ssl: { ca: SUPABASE_ROOT_CA, rejectUnauthorized: true },
      max: 3,
      idle_timeout: 20,
      connect_timeout: 15,
    });
    globalForDb.__blogDb = { url, sql };
  }
  return globalForDb.__blogDb.sql;
}

/** Query errors throw so a failed read is never cached as "no posts". */
const fetchPublishedPosts = unstable_cache(
  async (): Promise<BlogPost[]> => {
    const sql = getDb();
    const rows = await sql<BlogPostRow[]>`
      select slug, title, subtitle, excerpt, category, read_time,
             published_at::text as published_at,
             updated_at::text   as updated_at,
             author, hero_sketch, keywords, takeaways, sections, tags,
             related_slugs, cross_page_links, faq, featured,
             popularity_score, translations
      from public.blog_posts
      where published = true
      order by sort_order, slug
    `;
    return rows.map(rowToPost).filter((p): p is BlogPost => p !== null);
  },
  ["blog-posts"],
  { revalidate: BLOG_REVALIDATE_SECONDS, tags: [BLOG_CACHE_TAG] }
);

/**
 * All published posts in display order (`sort_order`). Deduplicated per
 * request via React `cache`, and cached across requests for
 * BLOG_REVALIDATE_SECONDS.
 *
 * Errors are deliberately NOT swallowed: an empty list would be cached as
 * 404 post pages and sitemaps without blog URLs. Thrown, a failed ISR
 * regeneration keeps serving the last good page, a cold render is an
 * uncached 500, and a build without DATABASE_URL fails loudly.
 */
export const getAllBlogPosts = cache(
  async (): Promise<BlogPost[]> => fetchPublishedPosts()
);

/** Posts sorted newest → oldest. */
export function getLatestPosts(posts: BlogPost[], count = 6): BlogPost[] {
  return [...posts]
    .sort((a, b) => (a.publishedAt < b.publishedAt ? 1 : -1))
    .slice(0, count);
}

/** Posts ranked by popularityScore descending. */
export function getMostReadPosts(posts: BlogPost[], count = 5): BlogPost[] {
  return [...posts]
    .sort((a, b) => (b.popularityScore ?? 0) - (a.popularityScore ?? 0))
    .slice(0, count);
}

/** Every post that has `featured: true`. */
export function getFeaturedPosts(posts: BlogPost[]): BlogPost[] {
  return posts.filter((p) => p.featured);
}

/** Posts grouped by category. */
export function getPostsByCategory(
  posts: BlogPost[],
  category: BlogCategory
): BlogPost[] {
  return posts.filter((p) => p.category === category);
}

/**
 * Parse markdown-style inline links in a paragraph. Returns an array of
 * text/link tokens that the blog detail page renders as JSX. The renderer
 * is intentionally tiny — it only handles `[anchor](/path)` pairs.
 */
export function parseInlineLinks(
  text: string
): Array<{ kind: "text"; value: string } | { kind: "link"; value: string; href: string }> {
  const tokens: Array<
    { kind: "text"; value: string } | { kind: "link"; value: string; href: string }
  > = [];
  const re = /\[([^\]]+)\]\(([^)]+)\)/g;
  let lastIndex = 0;
  let match: RegExpExecArray | null;
  while ((match = re.exec(text)) !== null) {
    if (match.index > lastIndex) {
      tokens.push({ kind: "text", value: text.slice(lastIndex, match.index) });
    }
    tokens.push({ kind: "link", value: match[1], href: match[2] });
    lastIndex = match.index + match[0].length;
  }
  if (lastIndex < text.length) {
    tokens.push({ kind: "text", value: text.slice(lastIndex) });
  }
  return tokens;
}

export function getBlogPost(
  posts: BlogPost[],
  slug: string
): BlogPost | undefined {
  return posts.find((p) => p.slug === slug);
}

/**
 * Return the 3 most relevant posts for the given slug. Explicit
 * `relatedSlugs` win, then tag overlap, then category match, and finally
 * anything else. This gives us a clean, curated hub-and-spoke structure.
 */
export function getRelatedPosts(
  posts: BlogPost[],
  slug: string,
  count = 3
): BlogPost[] {
  const current = getBlogPost(posts, slug);
  if (!current) return posts.slice(0, count);

  const explicit = current.relatedSlugs
    .map((s) => getBlogPost(posts, s))
    .filter((p): p is BlogPost => !!p && p.slug !== slug);

  if (explicit.length >= count) return explicit.slice(0, count);

  const tagMatch = posts.filter(
    (p) => p.slug !== slug && !explicit.find((e) => e.slug === p.slug)
  )
    .map((p) => ({
      p,
      score:
        p.tags.filter((t) => current.tags.includes(t)).length +
        (p.category === current.category ? 1.5 : 0),
    }))
    .sort((a, b) => b.score - a.score)
    .map((x) => x.p);

  return [...explicit, ...tagMatch].slice(0, count);
}

/** Ordered-list helpers for prev/next navigation on detail pages. */
export function getAdjacentPosts(
  posts: BlogPost[],
  slug: string
): {
  prev: BlogPost | null;
  next: BlogPost | null;
} {
  const idx = posts.findIndex((p) => p.slug === slug);
  if (idx < 0) return { prev: null, next: null };
  return {
    prev: idx > 0 ? posts[idx - 1] : null,
    next: idx < posts.length - 1 ? posts[idx + 1] : null,
  };
}

export function slugifyHeading(heading: string): string {
  return heading
    .toLowerCase()
    .replace(/[^a-z0-9\s-]/g, "")
    .trim()
    .replace(/\s+/g, "-");
}
