import type { Metadata } from "next";
import {
  ArrowUpRight,
  BookOpen,
  Calendar,
  ChevronRight,
  Clock,
  Flame,
  Mail,
  Search,
  Sparkles,
  Tag,
  TrendingUp,
} from "lucide-react";
import { PageHero } from "@/components/sections/PageHero";
import { Section, SectionHeader } from "@/components/primitives/section";
import LocalizedLink from "@/components/LocalizedLink";
import { KnowMore } from "@/components/sections/KnowMore";
import { Cta } from "@/components/sections/Cta";
import { IndiaGeoFooter } from "@/components/sections/IndiaGeoFooter";
import { getTranslation, type Locale } from "@/lib/i18n";
import {
  BASE_URL,
  isIndexable,
} from "@/lib/constants";
import { buildAlternates } from "@/lib/seo";
import {
  BLOG_CATEGORIES,
  BLOG_POSTS,
  TOPIC_CLUSTERS,
  getBlogPost,
  getFeaturedPosts,
  getLatestPosts,
  getMostReadPosts,
  getPostsByCategory,
  localizePost,
  type BlogCategory,
  type BlogPost,
} from "@/lib/blogs";
import { getBlogUi } from "@/lib/blog-i18n";
import { BlogSketch } from "@/components/illustrations";

// ---------------------------------------------------------------------------
// Metadata
// ---------------------------------------------------------------------------

const BLOG_PRIMARY_KEYWORDS = [
  "revenue audit",
  "website conversion rate optimization",
  "whatsapp sales automation",
  "whatsapp crm",
  "real estate lead scoring",
  "clinic appointment automation",
  "d2c product listing page optimization",
  "hero section conversion",
  "ai copywriting tools",
  "google ads for small business india",
  "core web vitals optimization",
  "sme revenue stack",
  "seo strategy india",
];

export async function generateMetadata({
  params,
}: {
  params: Promise<{ country: string; locale: string }>;
}): Promise<Metadata> {
  const { country, locale } = await params;
  const alternates = buildAlternates({ country, locale, subPath: "blogs" });
  const canonical = `${BASE_URL}${alternates.canonical}`;

  return {
    title:
      "Blog · Revenue Systems, WhatsApp Automation, SEO & CRO for Indian SMEs",
    description:
      "Field notes from the Savin Group team — revenue audits, conversion rate optimization, WhatsApp sales automation, real estate lead scoring, clinic automation, D2C catalog optimization, Google Ads for SMEs, Core Web Vitals and SEO that actually ranks.",
    keywords: BLOG_PRIMARY_KEYWORDS,
    authors: [
      { name: "Kanha Singh", url: `${BASE_URL}/${country}/${locale}/about` },
    ],
    alternates,
    openGraph: {
      title: "Savin Group · Blog",
      description:
        "Revenue audits, CRO, WhatsApp automation, D2C catalog optimization, SEO — 13+ long-form field notes for SME founders.",
      url: canonical,
      siteName: "Savin Group",
      type: "website",
      locale: `${locale}_${country.toUpperCase()}`,
      images: [
        {
          url: `${BASE_URL}/og.png`,
          width: 1200,
          height: 630,
          alt: "Savin Group Blog",
        },
      ],
    },
    twitter: {
      card: "summary_large_image",
      title: "Savin Group · Blog",
      description:
        "Opinionated long-form writing on revenue systems, conversion, WhatsApp automation, and SEO.",
      images: [`${BASE_URL}/og.png`],
    },
    robots: isIndexable(country, locale)
      ? {
          index: true,
          follow: true,
          googleBot: {
            index: true,
            follow: true,
            "max-snippet": -1,
            "max-image-preview": "large",
            "max-video-preview": -1,
          },
        }
      : {
          index: false,
          follow: true,
          googleBot: { index: false, follow: true },
        },
  };
}

// ---------------------------------------------------------------------------
// Helpers
// ---------------------------------------------------------------------------

function formatDate(iso: string, locale: string) {
  const d = new Date(iso);
  return d.toLocaleDateString(locale === "hi" ? "hi-IN" : "en-US", {
    month: "short",
    day: "numeric",
    year: "numeric",
  });
}

function categoryLabel(key: BlogCategory) {
  return BLOG_CATEGORIES.find((c) => c.key === key)?.label ?? key;
}

// ---------------------------------------------------------------------------
// Page
// ---------------------------------------------------------------------------

export default async function BlogsIndexPage({
  params,
}: {
  params: Promise<{ country: string; locale: string }>;
}) {
  const { country, locale } = await params;
  const loc = locale as Locale;
  const t = getTranslation(loc);
  const ui = getBlogUi(loc);
  const prefix = `/${country.toLowerCase()}/${locale.toLowerCase()}`;

  // ---- Localized post collections ----
  const postsLocalized = BLOG_POSTS.map((p) => localizePost(p, loc));
  const featuredPosts = getFeaturedPosts().map((p) => localizePost(p, loc));
  const latestPosts = getLatestPosts(6).map((p) => localizePost(p, loc));
  const mostRead = getMostReadPosts(5).map((p) => localizePost(p, loc));
  const totalSearchVolume = BLOG_POSTS.reduce(
    (sum, p) => sum + p.keywords.searchVolume,
    0
  );

  // ---- JSON-LD ----
  const blogLd = {
    "@context": "https://schema.org",
    "@type": "Blog",
    "@id": `${BASE_URL}${prefix}/blogs`,
    name: "Savin Group Blog",
    description:
      "Long-form writing on revenue systems, conversion rate optimization, WhatsApp sales automation, the 5-layer revenue stack, Core Web Vitals, Google Ads and SEO.",
    url: `${BASE_URL}${prefix}/blogs`,
    inLanguage: locale,
    publisher: {
      "@type": "Organization",
      name: "Savin Group",
      url: BASE_URL,
      logo: { "@type": "ImageObject", url: `${BASE_URL}/og.png` },
    },
    blogPost: BLOG_POSTS.map((p) => ({
      "@type": "BlogPosting",
      headline: p.title,
      description: p.excerpt,
      datePublished: p.publishedAt,
      dateModified: p.updatedAt ?? p.publishedAt,
      url: `${BASE_URL}${prefix}/blogs/${p.slug}`,
      author: { "@type": "Person", name: p.author.name },
      keywords: [p.keywords.primary, ...p.keywords.secondary].join(", "),
      wordCount: p.sections.reduce(
        (sum, s) => sum + s.paragraphs.join(" ").split(" ").length,
        0
      ),
      articleSection: categoryLabel(p.category),
    })),
  };

  const breadcrumbLd = {
    "@context": "https://schema.org",
    "@type": "BreadcrumbList",
    itemListElement: [
      {
        "@type": "ListItem",
        position: 1,
        name: "Home",
        item: `${BASE_URL}${prefix}`,
      },
      {
        "@type": "ListItem",
        position: 2,
        name: ui.breadcrumb,
        item: `${BASE_URL}${prefix}/blogs`,
      },
    ],
  };

  const faqLd = {
    "@context": "https://schema.org",
    "@type": "FAQPage",
    mainEntity: ui.listFaqs.map((f) => ({
      "@type": "Question",
      name: f.question,
      acceptedAnswer: { "@type": "Answer", text: f.answer },
    })),
  };

  // ---- Sub-components inline ----
  const PostCard = ({ post }: { post: BlogPost }) => (
    <LocalizedLink
      href={`/blogs/${post.slug}`}
      className="group flex h-full flex-col rounded-2xl border border-border bg-surface/40 p-5 transition hover:-translate-y-0.5 hover:border-accent/40 hover:bg-surface"
    >
      <div className="mb-5 overflow-hidden rounded-xl border border-border bg-background/60 p-3">
        <BlogSketch sketchKey={post.heroSketch} className="h-auto w-full" />
      </div>
      <div className="flex flex-wrap items-center gap-2 font-mono text-[9px] uppercase tracking-[0.22em] text-muted-foreground">
        <span className="rounded-full border border-accent/30 bg-accent/10 px-2 py-0.5 text-accent">
          {categoryLabel(post.category)}
        </span>
        <span className="flex items-center gap-1">
          <Clock size={9} />
          {post.readTime} {ui.minRead}
        </span>
      </div>
      <h3 className="mt-4 font-display text-xl font-semibold leading-tight tracking-tight text-foreground">
        {post.title}
      </h3>
      <p className="mt-3 flex-1 text-sm leading-relaxed text-muted-foreground">
        {post.excerpt}
      </p>
      <div className="mt-5 flex flex-wrap gap-1.5">
        {post.tags.slice(0, 3).map((tag) => (
          <span
            key={tag}
            className="font-mono text-[9px] uppercase tracking-[0.18em] text-muted-foreground"
          >
            #{tag}
          </span>
        ))}
      </div>
      <div className="mt-5 flex items-center justify-between border-t border-border pt-4 text-xs text-muted-foreground">
        <time dateTime={post.publishedAt} className="font-mono uppercase tracking-[0.18em]">
          {formatDate(post.publishedAt, locale)}
        </time>
        <span className="inline-flex items-center gap-1 text-accent">
          read
          <ArrowUpRight
            size={12}
            className="transition-transform group-hover:translate-x-0.5 group-hover:-translate-y-0.5"
          />
        </span>
      </div>
    </LocalizedLink>
  );

  const CompactPost = ({ post, rank }: { post: BlogPost; rank: number }) => (
    <LocalizedLink
      href={`/blogs/${post.slug}`}
      className="group flex items-start gap-4 rounded-xl border border-border/60 bg-surface/30 p-4 transition hover:border-accent/40 hover:bg-surface/60"
    >
      <span className="flex h-9 w-9 flex-shrink-0 items-center justify-center rounded-full border border-accent/40 bg-accent/10 font-mono text-[11px] font-semibold tracking-[0.05em] text-accent-strong">
        {String(rank).padStart(2, "0")}
      </span>
      <div className="min-w-0 flex-1">
        <div className="font-mono text-[9px] uppercase tracking-[0.22em] text-muted-foreground">
          {categoryLabel(post.category)} · {post.readTime} {ui.minRead}
        </div>
        <div className="mt-1 font-display text-sm font-semibold leading-snug text-foreground transition group-hover:text-accent-strong">
          {post.title}
        </div>
      </div>
      <ArrowUpRight
        size={14}
        className="mt-1 flex-shrink-0 text-muted-foreground transition group-hover:-translate-y-0.5 group-hover:translate-x-0.5 group-hover:text-accent"
      />
    </LocalizedLink>
  );

  return (
    <>
      <script
        type="application/ld+json"
        dangerouslySetInnerHTML={{ __html: JSON.stringify(blogLd) }}
      />
      <script
        type="application/ld+json"
        dangerouslySetInnerHTML={{ __html: JSON.stringify(breadcrumbLd) }}
      />
      <script
        type="application/ld+json"
        dangerouslySetInnerHTML={{ __html: JSON.stringify(faqLd) }}
      />

      <PageHero
        eyebrow={ui.blogEyebrow}
        title={
          <>
            {ui.blogTitleLead}{" "}
            <span className="text-accent">{ui.blogTitleAccent}</span>
          </>
        }
        subtitle={ui.blogSubtitle}
        breadcrumb={ui.breadcrumb}
      />

      {/* ================================================================ */}
      {/* FEATURED CAROUSEL — 3 cards in a big grid                         */}
      {/* ================================================================ */}
      <Section className="pt-6 pb-0">
        <div className="mb-6 flex flex-col items-start gap-3 border-b border-border pb-5 sm:mb-8 sm:flex-row sm:items-end sm:justify-between sm:gap-4 sm:pb-6">
          <div>
            <div className="flex items-center gap-2 font-mono text-[10px] uppercase tracking-[0.22em] text-accent-strong">
              <Sparkles size={11} />
              {ui.featuredEyebrow}
            </div>
            <h2 className="mt-3 font-display text-2xl font-semibold leading-[1.1] tracking-tight text-foreground sm:text-3xl lg:text-4xl">
              {ui.featuredTitle}{" "}
              <span className="text-accent">{ui.featuredTitleAccent}</span>
            </h2>
          </div>
          <div className="flex items-center gap-2 font-mono text-[10px] uppercase tracking-[0.22em] text-muted-foreground">
            <span>{featuredPosts.length} featured</span>
            <span className="h-1 w-1 rounded-full bg-accent" />
            <span>editor's pick</span>
          </div>
        </div>

        <div className="grid gap-5 sm:gap-6 md:grid-cols-2 lg:grid-cols-3">
          {featuredPosts.map((post, i) => (
            <LocalizedLink
              key={post.slug}
              href={`/blogs/${post.slug}`}
              className="group relative flex flex-col overflow-hidden rounded-3xl border border-border bg-surface/40 p-6 transition hover:-translate-y-1 hover:border-accent/50 hover:bg-surface hover:shadow-[0_20px_60px_-20px_oklch(0.65_0.19_55_/_0.25)]"
            >
              <div className="absolute right-5 top-5 flex h-8 w-8 items-center justify-center rounded-full border border-accent/50 bg-background/80 font-mono text-[11px] font-semibold text-accent-strong backdrop-blur-sm">
                {String(i + 1).padStart(2, "0")}
              </div>
              <div className="mb-6 overflow-hidden rounded-2xl border border-border bg-background/60 p-3">
                <BlogSketch
                  sketchKey={post.heroSketch}
                  className="h-auto w-full"
                />
              </div>
              <div className="flex flex-wrap items-center gap-2 font-mono text-[9px] uppercase tracking-[0.22em] text-muted-foreground">
                <span className="rounded-full border border-accent/40 bg-accent/10 px-2.5 py-1 text-accent">
                  {categoryLabel(post.category)}
                </span>
                <span className="flex items-center gap-1">
                  <Clock size={10} />
                  {post.readTime} {ui.minRead}
                </span>
              </div>
              <h3 className="mt-4 font-display text-xl font-semibold leading-tight tracking-tight text-foreground sm:text-2xl">
                {post.title}
              </h3>
              <p className="mt-3 flex-1 text-sm leading-relaxed text-muted-foreground">
                {post.excerpt}
              </p>
              <div className="mt-6 flex items-center justify-between border-t border-border pt-5">
                <time
                  dateTime={post.publishedAt}
                  className="font-mono text-[10px] uppercase tracking-[0.18em] text-muted-foreground"
                >
                  {formatDate(post.publishedAt, locale)}
                </time>
                <span className="inline-flex items-center gap-1.5 font-mono text-[10px] uppercase tracking-[0.18em] text-accent-strong">
                  {ui.featuredReadMore}
                  <ArrowUpRight
                    size={12}
                    className="transition-transform group-hover:translate-x-0.5 group-hover:-translate-y-0.5"
                  />
                </span>
              </div>
            </LocalizedLink>
          ))}
        </div>
      </Section>

      {/* ================================================================ */}
      {/* LATEST + MOST READ (side-by-side)                                 */}
      {/* ================================================================ */}
      <Section className="pt-10 pb-0">
        <div className="grid gap-8 lg:grid-cols-[1fr_340px] lg:gap-10">
          <div>
            <div className="mb-5 flex items-center gap-2 font-mono text-[10px] uppercase tracking-[0.22em] text-accent-strong sm:mb-6">
              <Flame size={11} />
              {ui.latestEyebrow}
            </div>
            <h2 className="font-display text-2xl font-semibold leading-[1.1] tracking-tight text-foreground sm:text-3xl lg:text-4xl">
              {ui.latestTitle}{" "}
              <span className="text-accent">{ui.latestTitleAccent}</span>
            </h2>
            <div className="mt-6 grid gap-4 sm:mt-8 sm:gap-5 md:grid-cols-2">
              {latestPosts.slice(0, 4).map((post) => (
                <PostCard key={post.slug} post={post} />
              ))}
            </div>
          </div>

          <aside className="rounded-2xl border border-border bg-surface/40 p-5 sm:p-6">
            <div className="flex items-center gap-2 font-mono text-[10px] uppercase tracking-[0.22em] text-accent-strong">
              <TrendingUp size={11} />
              {ui.mostReadEyebrow}
            </div>
            <p className="mt-2 text-xs text-muted-foreground">{ui.mostReadTitle}</p>
            <div className="mt-5 space-y-3">
              {mostRead.map((post, i) => (
                <CompactPost key={post.slug} post={post} rank={i + 1} />
              ))}
            </div>

            <div className="mt-6 border-t border-border pt-5">
              <div className="font-mono text-[10px] uppercase tracking-[0.22em] text-muted-foreground">
                {ui.statsLongForm}
              </div>
              <div className="mt-1 font-display text-3xl font-semibold text-foreground">
                {BLOG_POSTS.length}+
              </div>
              <div className="mt-5 font-mono text-[10px] uppercase tracking-[0.22em] text-muted-foreground">
                {ui.statsMonthlySearches}
              </div>
              <div className="mt-1 font-display text-3xl font-semibold text-accent">
                {totalSearchVolume.toLocaleString()}
              </div>
            </div>
          </aside>
        </div>
      </Section>

      {/* ================================================================ */}
      {/* WHY WE WRITE                                                      */}
      {/* ================================================================ */}
      <Section className="pt-12 pb-0">
        <div className="rounded-3xl border border-border bg-surface/40 p-6 sm:p-10 lg:p-12">
          <div className="grid gap-8 lg:grid-cols-[1fr_340px] lg:gap-10">
            <div>
              <div className="flex items-center gap-2 font-mono text-[10px] uppercase tracking-[0.22em] text-accent-strong">
                <BookOpen size={11} />
                {ui.whyWeWriteEyebrow}
              </div>
              <h2 className="mt-4 font-display text-3xl font-semibold leading-[1.15] tracking-tight text-foreground sm:text-4xl">
                {ui.whyWeWriteTitle}{" "}
                <span className="text-accent">{ui.whyWeWriteAccent}</span>
              </h2>
              <div className="mt-6 space-y-4 text-base leading-[1.75] text-muted-foreground sm:text-lg">
                <p>{ui.whyWeWriteBody1}</p>
                <p>{ui.whyWeWriteBody2}</p>
              </div>
              <div className="mt-8 flex flex-wrap items-center gap-3 text-sm">
                <span className="font-mono text-[11px] uppercase tracking-[0.18em] text-foreground">
                  Kanha Singh · Founder
                </span>
                <LocalizedLink
                  href="/about"
                  className="inline-flex items-center gap-1 font-mono text-[11px] uppercase tracking-[0.18em] text-accent-strong hover:underline"
                >
                  more on the team
                  <ArrowUpRight size={12} />
                </LocalizedLink>
              </div>
            </div>

            <div className="rounded-2xl border border-border bg-background/40 p-6">
              <div className="flex items-center gap-2 font-mono text-[10px] uppercase tracking-[0.22em] text-accent-strong">
                <TrendingUp size={11} />
                The blog, by the numbers
              </div>
              <dl className="mt-6 space-y-5">
                <div className="flex items-baseline justify-between border-b border-border pb-4">
                  <dt className="font-mono text-[10px] uppercase tracking-[0.18em] text-muted-foreground">
                    {ui.statsLongForm}
                  </dt>
                  <dd className="font-display text-2xl font-semibold text-foreground">
                    {BLOG_POSTS.length}
                  </dd>
                </div>
                <div className="flex items-baseline justify-between border-b border-border pb-4">
                  <dt className="font-mono text-[10px] uppercase tracking-[0.18em] text-muted-foreground">
                    {ui.statsAvgRead}
                  </dt>
                  <dd className="font-display text-2xl font-semibold text-foreground">
                    {Math.round(
                      BLOG_POSTS.reduce((s, p) => s + p.readTime, 0) /
                        BLOG_POSTS.length
                    )}{" "}
                    min
                  </dd>
                </div>
                <div className="flex items-baseline justify-between border-b border-border pb-4">
                  <dt className="font-mono text-[10px] uppercase tracking-[0.18em] text-muted-foreground">
                    {ui.statsTopics}
                  </dt>
                  <dd className="font-display text-2xl font-semibold text-foreground">
                    {TOPIC_CLUSTERS.length}
                  </dd>
                </div>
                <div className="flex items-baseline justify-between">
                  <dt className="font-mono text-[10px] uppercase tracking-[0.18em] text-muted-foreground">
                    {ui.statsMonthlySearches}
                  </dt>
                  <dd className="font-display text-2xl font-semibold text-accent">
                    {totalSearchVolume.toLocaleString()}
                  </dd>
                </div>
              </dl>
            </div>
          </div>
        </div>
      </Section>

      {/* ================================================================ */}
      {/* FILTER BAR                                                        */}
      {/* ================================================================ */}
      <Section className="pt-10 pb-0">
        <div className="rounded-2xl border border-border bg-surface/40 p-4 sm:p-5">
          <div className="flex flex-col gap-4 lg:flex-row lg:items-center lg:justify-between">
            <div className="flex flex-wrap items-center gap-2">
              <span className="font-mono text-[10px] uppercase tracking-[0.22em] text-muted-foreground">
                {ui.filterLabel} ·
              </span>
              {BLOG_CATEGORIES.map((c) => (
                <a
                  key={c.key}
                  href={`#cat-${c.key}`}
                  className="cursor-pointer rounded-full border border-border bg-background/60 px-3 py-1.5 font-mono text-[10px] uppercase tracking-[0.22em] text-muted-foreground transition hover:border-accent/50 hover:text-accent-strong"
                >
                  {c.label}
                </a>
              ))}
            </div>
            <div className="flex items-center gap-2 rounded-full border border-border bg-background/80 px-4 py-2 font-mono text-[10px] uppercase tracking-[0.2em] text-muted-foreground">
              <Search size={11} className="text-accent" />
              <span>{ui.searchPlaceholder}</span>
            </div>
          </div>
        </div>
      </Section>

      {/* ================================================================ */}
      {/* TOPIC CLUSTERS                                                    */}
      {/* ================================================================ */}
      <Section className="pt-12">
        <SectionHeader
          eyebrow={ui.topicClustersEyebrow}
          title={
            <>
              {ui.topicClustersTitle}{" "}
              <span className="text-accent">
                {ui.topicClustersTitleAccent}
              </span>
            </>
          }
          subtitle={ui.topicClustersSubtitle}
          align="left"
        />
        <div className="mt-10 grid gap-6 md:grid-cols-3">
          {TOPIC_CLUSTERS.map((cluster) => (
            <div
              key={cluster.key}
              className="group flex h-full flex-col rounded-2xl border border-border bg-surface/40 p-6 transition hover:-translate-y-0.5 hover:border-accent/40"
            >
              <div className="flex items-center gap-2 font-mono text-[10px] uppercase tracking-[0.22em] text-accent-strong">
                <Sparkles size={11} />
                Cluster · {cluster.primaryKeyword}
              </div>
              <h3 className="mt-4 font-display text-xl font-semibold leading-tight tracking-tight text-foreground">
                {cluster.title}
              </h3>
              <p className="mt-3 flex-1 text-sm leading-relaxed text-muted-foreground">
                {cluster.description}
              </p>
              <ul className="mt-6 space-y-3 border-t border-border pt-5">
                {cluster.slugs.map((slug) => {
                  const post = getBlogPost(slug);
                  if (!post) return null;
                  const localized = localizePost(post, loc);
                  return (
                    <li key={slug}>
                      <LocalizedLink
                        href={`/blogs/${slug}`}
                        className="group/link flex items-start gap-2 text-sm leading-snug text-muted-foreground transition hover:text-foreground"
                      >
                        <ChevronRight
                          size={12}
                          className="mt-1 flex-shrink-0 text-accent transition-transform group-hover/link:translate-x-0.5"
                        />
                        <span>{localized.title}</span>
                      </LocalizedLink>
                    </li>
                  );
                })}
              </ul>
            </div>
          ))}
        </div>
      </Section>

      {/* ================================================================ */}
      {/* BY CATEGORY — grouped sections, each anchored                     */}
      {/* ================================================================ */}
      <Section className="pt-4">
        <SectionHeader
          eyebrow={ui.byCategoryEyebrow}
          title={
            <>
              {ui.byCategoryTitle}{" "}
              <span className="text-accent">{ui.byCategoryAccent}</span>
            </>
          }
          align="left"
        />

        <div className="mt-10 space-y-16">
          {(["growth", "automation", "seo", "ops"] as const).map((cat) => {
            const posts = getPostsByCategory(cat).map((p) =>
              localizePost(p, loc)
            );
            if (posts.length === 0) return null;
            return (
              <div key={cat} id={`cat-${cat}`} className="scroll-mt-28">
                <div className="mb-6 flex items-center justify-between border-b border-border pb-4">
                  <div className="flex items-center gap-3">
                    <span className="font-mono text-[10px] uppercase tracking-[0.28em] text-accent-strong">
                      ·
                    </span>
                    <h3 className="font-display text-2xl font-semibold tracking-tight text-foreground">
                      {categoryLabel(cat)}
                    </h3>
                    <span className="font-mono text-[10px] uppercase tracking-[0.22em] text-muted-foreground">
                      {posts.length} posts
                    </span>
                  </div>
                </div>
                <div className="grid gap-6 md:grid-cols-2 xl:grid-cols-3">
                  {posts.map((post) => (
                    <PostCard key={post.slug} post={post} />
                  ))}
                </div>
              </div>
            );
          })}
        </div>
      </Section>

      {/* ================================================================ */}
      {/* AUTHOR SPOTLIGHT                                                  */}
      {/* ================================================================ */}
      <Section className="pt-4">
        <div className="rounded-3xl border border-border bg-surface/40 p-6 sm:p-8 lg:p-10">
          <div className="grid gap-6 sm:gap-8 lg:grid-cols-[240px_1fr]">
            <div className="flex flex-col items-start gap-4">
              <div className="flex h-20 w-20 items-center justify-center rounded-full border border-accent/40 bg-accent/10 font-display text-3xl font-semibold text-accent">
                KS
              </div>
              <div>
                <div className="font-display text-xl font-semibold text-foreground">
                  Kanha Singh
                </div>
                <div className="font-mono text-[10px] uppercase tracking-[0.22em] text-muted-foreground">
                  Founder · Savin Group
                </div>
              </div>
            </div>
            <div>
              <div className="font-mono text-[10px] uppercase tracking-[0.22em] text-accent-strong">
                {ui.authorEyebrow}
              </div>
              <p className="mt-4 text-base leading-relaxed text-muted-foreground sm:text-lg">
                Kanha runs Savin Group. He writes this blog the way he writes
                internal retro notes — specific, opinionated, and mostly drawn
                from whichever client project shipped last week. Before
                building revenue systems for SMEs full-time he spent years in
                D2C, real estate tech, and automation consulting.
              </p>
              <div className="mt-6 flex flex-wrap gap-3">
                <LocalizedLink
                  href="/about"
                  className="inline-flex items-center gap-2 rounded-full border border-border bg-background/60 px-4 py-2 font-mono text-[10px] uppercase tracking-[0.22em] text-muted-foreground transition hover:border-accent/50 hover:text-accent-strong"
                >
                  {ui.authorReadStory}
                  <ArrowUpRight size={11} />
                </LocalizedLink>
                <LocalizedLink
                  href="/contact"
                  className="inline-flex items-center gap-2 rounded-full bg-accent-strong px-4 py-2 font-mono text-[10px] uppercase tracking-[0.22em] text-accent-foreground transition hover:-translate-y-0.5"
                >
                  {ui.authorBookAudit}
                  <ArrowUpRight size={11} />
                </LocalizedLink>
              </div>
            </div>
          </div>
        </div>
      </Section>

      {/* ================================================================ */}
      {/* NEWSLETTER                                                        */}
      {/* ================================================================ */}
      <Section className="pt-0">
        <div className="rounded-3xl border border-accent/40 bg-accent/5 p-6 sm:p-10 lg:p-12">
          <div className="grid gap-6 lg:grid-cols-[1fr_380px] lg:items-center lg:gap-8">
            <div>
              <div className="flex items-center gap-2 font-mono text-[10px] uppercase tracking-[0.22em] text-accent-strong">
                <Mail size={11} />
                {ui.newsletterEyebrow}
              </div>
              <h2 className="mt-4 font-display text-3xl font-semibold leading-[1.15] tracking-tight text-foreground sm:text-4xl">
                {ui.newsletterTitle}{" "}
                <span className="text-accent">{ui.newsletterTitleAccent}</span>
              </h2>
              <p className="mt-4 text-base leading-relaxed text-muted-foreground sm:text-lg">
                {ui.newsletterBody}
              </p>
            </div>
            <form
              className="flex flex-col gap-3"
              action={`${prefix}/contact`}
              method="get"
            >
              <label
                htmlFor="newsletter-email"
                className="font-mono text-[10px] uppercase tracking-[0.22em] text-muted-foreground"
              >
                {ui.newsletterEmailLabel}
              </label>
              <input
                id="newsletter-email"
                name="email"
                type="email"
                required
                placeholder={ui.newsletterEmailPlaceholder}
                className="form-input"
              />
              <button
                type="submit"
                className="inline-flex items-center justify-center gap-2 rounded-full bg-accent-strong px-5 py-3 font-mono text-[11px] uppercase tracking-[0.22em] text-accent-foreground transition hover:-translate-y-0.5"
              >
                {ui.newsletterSubmit}
                <ArrowUpRight size={12} />
              </button>
              <p className="font-mono text-[9px] uppercase tracking-[0.18em] text-muted-foreground">
                {ui.newsletterPrivacy}
              </p>
            </form>
          </div>
        </div>
      </Section>

      {/* ================================================================ */}
      {/* FAQ                                                               */}
      {/* ================================================================ */}
      <Section className="pt-4">
        <SectionHeader
          eyebrow={ui.faqEyebrow}
          title={
            <>
              {ui.faqTitle}{" "}
              <span className="text-accent">{ui.faqTitleAccent}</span>
            </>
          }
          align="left"
        />
        <div className="mt-10 space-y-4">
          {ui.listFaqs.map((f, i) => (
            <details
              key={i}
              className="group rounded-2xl border border-border bg-surface/40 p-5 transition hover:border-border-strong"
            >
              <summary className="flex cursor-pointer items-start justify-between gap-4">
                <span className="font-display text-lg font-semibold text-foreground">
                  {f.question}
                </span>
                <ChevronRight
                  size={18}
                  className="mt-1 flex-shrink-0 text-accent transition-transform group-open:rotate-90"
                />
              </summary>
              <p className="mt-4 text-base leading-relaxed text-muted-foreground">
                {f.answer}
              </p>
            </details>
          ))}
        </div>
      </Section>

      {/* ================================================================ */}
      {/* TAG CLOUD                                                         */}
      {/* ================================================================ */}
      <Section className="pt-0">
        <div className="rounded-2xl border border-border bg-surface/40 p-6 sm:p-8">
          <div className="flex items-center gap-2 font-mono text-[10px] uppercase tracking-[0.22em] text-muted-foreground">
            <Tag size={11} className="text-accent" />
            {ui.tagCloudLabel}
          </div>
          <div className="mt-5 flex flex-wrap gap-2">
            {Array.from(new Set(postsLocalized.flatMap((p) => p.tags))).map(
              (tag) => (
                <span
                  key={tag}
                  className="rounded-full border border-border bg-background/60 px-3 py-1.5 font-mono text-[10px] uppercase tracking-[0.18em] text-muted-foreground"
                >
                  #{tag}
                </span>
              )
            )}
          </div>
        </div>
      </Section>

      <KnowMore t={t} pageKey="home" pageLabel={ui.breadcrumb} />
      <IndiaGeoFooter country={country} locale={locale} pageKey="blogs" />
      <Cta t={t} />
    </>
  );
}
