/**
 * Newsroom data — short, sourced industry stories stored in Supabase
 * (table public.news_posts, schema: supabase/news-schema.sql). Written daily by
 * the Savin Group publisher (the automation project's lib/sanat pipeline) and
 * read here through the same read-only `blog_reader` connection the blog uses.
 *
 * Story bodies are English; title / dek / excerpt can be overridden per locale
 * through `translations`, exactly like blog posts.
 */

import { cache } from "react";
import { unstable_cache } from "next/cache";
import type { Locale } from "@/lib/i18n";
import { getDb, type BlogFaq, type BlogSection, type BlogSketchKey } from "@/lib/blogs";

export type NewsCategory = "ai" | "automation" | "manufacturing" | "software" | "markets" | "policy";

export const NEWS_CATEGORY_KEYS: readonly NewsCategory[] = ["ai", "automation", "manufacturing", "software", "markets", "policy"];

/** Desk labels — the newsroom's equivalent of blog categories. */
export const NEWS_CATEGORIES: { key: NewsCategory | "all"; label: string; short: string }[] = [
  { key: "all",           label: "All stories",            short: "All" },
  { key: "ai",            label: "AI & agents",            short: "AI" },
  { key: "automation",    label: "Automation & robotics",  short: "Automation" },
  { key: "manufacturing", label: "Manufacturing & IoT",    short: "Manufacturing" },
  { key: "software",      label: "Software & ERP",         short: "Software" },
  { key: "markets",       label: "Business & markets",     short: "Markets" },
  { key: "policy",        label: "Policy & regulation",    short: "Policy" },
];

/** Line drawing that stands for each desk (cards, category hero, directory). */
export const NEWS_CATEGORY_SKETCH: Record<NewsCategory, BlogSketchKey> = {
  ai: "layerStack",
  automation: "procurementFlow",
  manufacturing: "auditLens",
  software: "whatsappFlow",
  markets: "seoPeakGraph",
  policy: "leakyFunnel",
};

export interface NewsSource {
  url: string;
  title: string;
  publisher: string;
}

export interface NewsKeywords {
  primary: string;
  secondary: string[];
  intent: "informational" | "commercial" | "transactional";
}

export interface NewsPostTranslation {
  title?: string;
  dek?: string;
  excerpt?: string;
}

export interface NewsPost {
  slug: string;
  title: string;
  /** Standfirst under the headline. */
  dek: string;
  excerpt: string;
  category: NewsCategory;
  readTime: number;
  /** ISO timestamp. */
  publishedAt: string;
  updatedAt?: string;
  author: { name: string; role: string; bio?: string };
  heroSketch: BlogSketchKey;
  keywords: NewsKeywords;
  takeaways: string[];
  sections: BlogSection[];
  sources: NewsSource[];
  tags: string[];
  relatedSlugs: string[];
  faq?: BlogFaq[];
  featured?: boolean;
  /** Editorial weight 0-100. */
  priority: number;
  translations?: Partial<Record<Locale, NewsPostTranslation>>;
}

export function localizeNewsPost(post: NewsPost, locale: Locale): NewsPost {
  const tr = post.translations?.[locale];
  if (!tr) return post;
  return { ...post, title: tr.title ?? post.title, dek: tr.dek ?? post.dek, excerpt: tr.excerpt ?? post.excerpt };
}

// ---------------------------------------------------------------------------
// Data source
// ---------------------------------------------------------------------------

interface NewsPostRow {
  slug: string;
  title: string;
  dek: string;
  excerpt: string;
  category: string;
  read_time: number;
  published_at: string;
  updated_at: string | null;
  author: unknown;
  hero_sketch: string;
  keywords: unknown;
  takeaways: unknown;
  sections: unknown;
  sources: unknown;
  tags: unknown;
  related_slugs: unknown;
  faq: unknown;
  featured: boolean;
  priority: number;
  translations: unknown;
}

const SKETCH_KEYS: readonly BlogSketchKey[] = ["auditLens", "leakyFunnel", "whatsappFlow", "layerStack", "seoPeakGraph", "procurementFlow"];

const isObject = (v: unknown): v is Record<string, unknown> => typeof v === "object" && v !== null && !Array.isArray(v);
const isString = (v: unknown): v is string => typeof v === "string";
const strings = (v: unknown): string[] => (Array.isArray(v) ? v.filter(isString) : []);

function toSection(v: unknown): BlogSection | null {
  if (!isObject(v) || !isString(v.heading)) return null;
  const section: BlogSection = { heading: v.heading, paragraphs: strings(v.paragraphs) };
  if (Array.isArray(v.bullets)) section.bullets = strings(v.bullets);
  if (isObject(v.callout) && isString(v.callout.title) && isString(v.callout.body)) section.callout = { title: v.callout.title, body: v.callout.body };
  if (isString(v.pullQuote)) section.pullQuote = v.pullQuote;
  return section;
}

function rowToPost(r: NewsPostRow): NewsPost | null {
  const problems: string[] = [];
  const author = r.author;
  const keywords = r.keywords;
  if (!isString(r.slug) || !r.slug) problems.push("slug");
  if (!isString(r.title) || !r.title) problems.push("title");
  if (!(NEWS_CATEGORY_KEYS as readonly string[]).includes(r.category)) problems.push("category");
  if (!isObject(author) || !isString(author.name)) problems.push("author.name");
  if (problems.length) {
    console.error(`[news] Skipping story "${r.slug}": invalid ${problems.join(", ")}`);
    return null;
  }
  const a = author as Record<string, unknown>;
  const k = isObject(keywords) ? keywords : {};
  const intent = k.intent;
  return {
    slug: r.slug,
    title: r.title,
    dek: isString(r.dek) ? r.dek : "",
    excerpt: isString(r.excerpt) ? r.excerpt : "",
    category: r.category as NewsCategory,
    readTime: Number.isFinite(r.read_time) && r.read_time > 0 ? r.read_time : 3,
    publishedAt: r.published_at,
    updatedAt: r.updated_at ?? undefined,
    author: { name: a.name as string, role: isString(a.role) ? a.role : "", ...(isString(a.bio) ? { bio: a.bio } : {}) },
    heroSketch: (SKETCH_KEYS as readonly string[]).includes(r.hero_sketch) ? (r.hero_sketch as BlogSketchKey) : NEWS_CATEGORY_SKETCH[r.category as NewsCategory],
    keywords: {
      primary: isString(k.primary) ? k.primary : "",
      secondary: strings(k.secondary),
      intent: intent === "commercial" || intent === "transactional" ? intent : "informational",
    },
    takeaways: strings(r.takeaways),
    sections: Array.isArray(r.sections) ? (r.sections as unknown[]).map(toSection).filter((s): s is BlogSection => s !== null) : [],
    sources: Array.isArray(r.sources)
      ? (r.sources as unknown[]).filter((s): s is NewsSource => isObject(s) && isString(s.url) && isString(s.title)).map((s) => ({ url: s.url, title: s.title, publisher: isString(s.publisher) ? s.publisher : "" }))
      : [],
    tags: strings(r.tags),
    relatedSlugs: strings(r.related_slugs),
    faq: Array.isArray(r.faq) ? (r.faq as unknown[]).filter((f): f is BlogFaq => isObject(f) && isString(f.question) && isString(f.answer)) : undefined,
    featured: r.featured || undefined,
    priority: Number.isFinite(r.priority) ? r.priority : 50,
    translations: isObject(r.translations) ? (r.translations as NewsPost["translations"]) : undefined,
  };
}

const NEWS_REVALIDATE_SECONDS = 60;

/** Cache tag for every newsroom read — revalidated by /api/revalidate/blog. */
export const NEWS_CACHE_TAG = "news";

/**
 * Query errors throw (a failed read must never be cached as "no stories"),
 * with one exception: a project where the news table has not been created yet
 * renders an empty newsroom instead of failing every build.
 */
const fetchPublishedNews = unstable_cache(
  async (): Promise<NewsPost[]> => {
    const sql = getDb();
    try {
      const rows = await sql<NewsPostRow[]>`
        select slug, title, dek, excerpt, category, read_time,
               to_char(published_at at time zone 'UTC', 'YYYY-MM-DD"T"HH24:MI:SS"Z"') as published_at,
               to_char(updated_at   at time zone 'UTC', 'YYYY-MM-DD"T"HH24:MI:SS"Z"') as updated_at,
               author, hero_sketch, keywords, takeaways, sections, sources, tags,
               related_slugs, faq, featured, priority, translations
        from public.news_posts
        where published = true
        order by published_at desc, slug
      `;
      return rows.map(rowToPost).filter((p): p is NewsPost => p !== null);
    } catch (error) {
      const code = (error as { code?: string } | null)?.code;
      if (code === "42P01") {
        console.warn("[news] public.news_posts does not exist yet — run supabase/news-schema.sql");
        return [];
      }
      throw error;
    }
  },
  ["news-posts"],
  { revalidate: NEWS_REVALIDATE_SECONDS, tags: [NEWS_CACHE_TAG] }
);

/** All published stories, newest first. Deduplicated per request. */
export const getAllNewsPosts = cache(async (): Promise<NewsPost[]> => fetchPublishedNews());

export function getLatestNews(posts: NewsPost[], count = 8): NewsPost[] {
  return posts.slice(0, count);
}

/** The lead story: the newest featured one, else the newest high-priority one. */
export function getLeadStory(posts: NewsPost[]): NewsPost | undefined {
  return posts.find((p) => p.featured) ?? [...posts].sort((a, b) => b.priority - a.priority || (a.publishedAt < b.publishedAt ? 1 : -1))[0];
}

/** Stories ranked by editorial weight, newest breaking ties. */
export function getTopStories(posts: NewsPost[], count = 5): NewsPost[] {
  return [...posts].sort((a, b) => b.priority - a.priority || (a.publishedAt < b.publishedAt ? 1 : -1)).slice(0, count);
}

export function getNewsByCategory(posts: NewsPost[], category: NewsCategory): NewsPost[] {
  return posts.filter((p) => p.category === category);
}

export function getNewsPost(posts: NewsPost[], slug: string): NewsPost | undefined {
  return posts.find((p) => p.slug === slug);
}

export function getRelatedNews(posts: NewsPost[], slug: string, count = 3): NewsPost[] {
  const current = getNewsPost(posts, slug);
  if (!current) return posts.slice(0, count);
  const explicit = current.relatedSlugs.map((s) => getNewsPost(posts, s)).filter((p): p is NewsPost => !!p && p.slug !== slug);
  if (explicit.length >= count) return explicit.slice(0, count);
  const rest = posts
    .filter((p) => p.slug !== slug && !explicit.some((e) => e.slug === p.slug))
    .map((p) => ({ p, score: p.tags.filter((t) => current.tags.includes(t)).length + (p.category === current.category ? 1.5 : 0) }))
    .sort((a, b) => b.score - a.score)
    .map((x) => x.p);
  return [...explicit, ...rest].slice(0, count);
}

export function getAdjacentNews(posts: NewsPost[], slug: string): { prev: NewsPost | null; next: NewsPost | null } {
  const idx = posts.findIndex((p) => p.slug === slug);
  if (idx < 0) return { prev: null, next: null };
  // posts are newest-first: "prev" is the newer story, "next" the older one.
  return { prev: idx > 0 ? posts[idx - 1] : null, next: idx < posts.length - 1 ? posts[idx + 1] : null };
}

/** Distinct publishers cited across the stories (for the "sources" stat). */
export function countPublishers(posts: NewsPost[]): number {
  return new Set(posts.flatMap((p) => p.sources.map((s) => s.publisher.toLowerCase()).filter(Boolean))).size;
}
