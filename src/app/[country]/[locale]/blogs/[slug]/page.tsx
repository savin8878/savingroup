import type { Metadata } from "next";
import { notFound } from "next/navigation";
import {
  ArrowLeft,
  ArrowRight,
  ArrowUpRight,
  BookOpen,
  Bookmark,
  Calendar,
  ChevronRight,
  Clock,
  ExternalLink,
  Linkedin,
  Quote,
  RefreshCw,
  Sparkles,
  Tag,
  Target,
  Twitter,
  Zap,
} from "lucide-react";
import { PageHero } from "@/components/sections/PageHero";
import { Section } from "@/components/primitives/section";
import LocalizedLink from "@/components/LocalizedLink";
import { Cta } from "@/components/sections/Cta";
import { getTranslation, type Locale } from "@/lib/i18n";
import {
  BASE_URL,
  isIndexable,
} from "@/lib/constants";
import { buildAlternates } from "@/lib/seo";
import {
  BLOG_CATEGORIES,
  BLOG_POSTS,
  getAdjacentPosts,
  getBlogPost,
  getRelatedPosts,
  localizePost,
  parseInlineLinks,
  slugifyHeading,
  type BlogCategory,
} from "@/lib/blogs";
import { getBlogUi } from "@/lib/blog-i18n";
import { BlogSketch } from "@/components/illustrations";

// ---------------------------------------------------------------------------
// Static params & metadata
// ---------------------------------------------------------------------------

export async function generateStaticParams() {
  return BLOG_POSTS.map((p) => ({ slug: p.slug }));
}

export async function generateMetadata({
  params,
}: {
  params: Promise<{ country: string; locale: string; slug: string }>;
}): Promise<Metadata> {
  const { country, locale, slug } = await params;
  const base = getBlogPost(slug);
  if (!base) return { title: "Post not found" };
  const post = localizePost(base, locale as Locale);

  const alternates = buildAlternates({
    country,
    locale,
    subPath: `blogs/${slug}`,
  });
  const canonical = `${BASE_URL}${alternates.canonical}`;
  const description = post.excerpt;

  return {
    title: `${post.title}`,
    description,
    keywords: [post.keywords.primary, ...post.keywords.secondary, ...post.tags],
    authors: [{ name: post.author.name, url: `${BASE_URL}/${country}/${locale}/about` }],
    alternates,
    openGraph: {
      title: post.title,
      description,
      url: canonical,
      siteName: "Sanat Dynamo",
      type: "article",
      publishedTime: post.publishedAt,
      modifiedTime: post.updatedAt ?? post.publishedAt,
      authors: [post.author.name],
      tags: [post.keywords.primary, ...post.keywords.secondary, ...post.tags],
      locale: `${locale}_${country.toUpperCase()}`,
      images: [
        {
          url: `${BASE_URL}/og.png`,
          width: 1200,
          height: 630,
          alt: post.title,
        },
      ],
    },
    twitter: {
      card: "summary_large_image",
      title: post.title,
      description,
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
    other: {
      "article:published_time": post.publishedAt,
      "article:modified_time": post.updatedAt ?? post.publishedAt,
      "article:author": post.author.name,
      "article:section": post.category,
      "article:tag": [post.keywords.primary, ...post.keywords.secondary].join(","),
    },
  };
}

// ---------------------------------------------------------------------------
// Helpers
// ---------------------------------------------------------------------------

function formatDate(iso: string, locale: string) {
  return new Date(iso).toLocaleDateString(locale === "hi" ? "hi-IN" : "en-US", {
    month: "short",
    day: "numeric",
    year: "numeric",
  });
}

function categoryLabel(key: BlogCategory) {
  return BLOG_CATEGORIES.find((c) => c.key === key)?.label ?? key;
}

/**
 * Server-component renderer for a paragraph that may contain
 * `[anchor](/path)` style inline links. Relative paths are routed
 * through LocalizedLink, absolute URLs render as external <a>.
 */
function ParagraphWithLinks({
  text,
  dropCap = false,
}: {
  text: string;
  dropCap?: boolean;
}) {
  const tokens = parseInlineLinks(text);
  return (
    <p
      className={[
        "text-[17px] leading-[1.8] text-muted-foreground sm:text-[18px]",
        dropCap
          ? "first-letter:float-left first-letter:mr-3 first-letter:mt-1.5 first-letter:font-display first-letter:text-[64px] first-letter:font-semibold first-letter:leading-[0.85] first-letter:text-accent sm:first-letter:text-[78px]"
          : "",
      ].join(" ")}
    >
      {tokens.map((tok, i) => {
        if (tok.kind === "text") {
          return <span key={i}>{tok.value}</span>;
        }
        const isExternal = /^https?:\/\//.test(tok.href);
        if (isExternal) {
          return (
            <a
              key={i}
              href={tok.href}
              target="_blank"
              rel="noopener noreferrer"
              className="font-medium text-accent underline decoration-accent/40 decoration-[1.5px] underline-offset-[5px] transition hover:decoration-accent"
            >
              {tok.value}
            </a>
          );
        }
        return (
          <LocalizedLink
            key={i}
            href={tok.href}
            className="font-medium text-accent underline decoration-accent/40 decoration-[1.5px] underline-offset-[5px] transition hover:decoration-accent"
          >
            {tok.value}
          </LocalizedLink>
        );
      })}
    </p>
  );
}

// ---------------------------------------------------------------------------
// Page
// ---------------------------------------------------------------------------

export default async function BlogDetailPage({
  params,
}: {
  params: Promise<{ country: string; locale: string; slug: string }>;
}) {
  const { country, locale, slug } = await params;
  const base = getBlogPost(slug);
  if (!base) notFound();
  const loc = locale as Locale;
  const post = localizePost(base, loc);

  const t = getTranslation(loc);
  const ui = getBlogUi(loc);
  const prefix = `/${country.toLowerCase()}/${locale.toLowerCase()}`;
  const canonical = `${BASE_URL}${prefix}/blogs/${slug}`;
  const related = getRelatedPosts(slug, 3).map((p) => localizePost(p, loc));
  const adj = getAdjacentPosts(slug);
  const prev = adj.prev ? localizePost(adj.prev, loc) : null;
  const next = adj.next ? localizePost(adj.next, loc) : null;

  const wordCount = post.sections.reduce(
    (sum, s) => sum + s.paragraphs.join(" ").split(/\s+/).length,
    0
  );

  // ---------- JSON-LD ----------
  const articleLd = {
    "@context": "https://schema.org",
    "@type": "BlogPosting",
    "@id": canonical,
    headline: post.title,
    alternativeHeadline: post.subtitle,
    description: post.excerpt,
    image: [`${BASE_URL}/og.png`],
    datePublished: post.publishedAt,
    dateModified: post.updatedAt ?? post.publishedAt,
    wordCount,
    timeRequired: `PT${post.readTime}M`,
    inLanguage: locale,
    articleSection: categoryLabel(post.category),
    keywords: [post.keywords.primary, ...post.keywords.secondary, ...post.tags].join(", "),
    author: {
      "@type": "Person",
      name: post.author.name,
      jobTitle: post.author.role,
      url: `${BASE_URL}${prefix}/about`,
    },
    publisher: {
      "@type": "Organization",
      name: "Sanat Dynamo",
      url: BASE_URL,
      logo: {
        "@type": "ImageObject",
        url: `${BASE_URL}/og.png`,
      },
    },
    mainEntityOfPage: {
      "@type": "WebPage",
      "@id": canonical,
    },
    isPartOf: {
      "@type": "Blog",
      "@id": `${BASE_URL}${prefix}/blogs`,
    },
  };

  const breadcrumbLd = {
    "@context": "https://schema.org",
    "@type": "BreadcrumbList",
    itemListElement: [
      { "@type": "ListItem", position: 1, name: "Home", item: `${BASE_URL}${prefix}` },
      { "@type": "ListItem", position: 2, name: "Blog", item: `${BASE_URL}${prefix}/blogs` },
      { "@type": "ListItem", position: 3, name: post.title, item: canonical },
    ],
  };

  const faqLd = post.faq && post.faq.length > 0 && {
    "@context": "https://schema.org",
    "@type": "FAQPage",
    mainEntity: post.faq.map((f) => ({
      "@type": "Question",
      name: f.question,
      acceptedAnswer: { "@type": "Answer", text: f.answer },
    })),
  };

  // Twitter/LinkedIn share URLs (target="_blank")
  const shareUrl = encodeURIComponent(canonical);
  const shareTitle = encodeURIComponent(post.title);
  const twitterShare = `https://twitter.com/intent/tweet?url=${shareUrl}&text=${shareTitle}`;
  const linkedinShare = `https://www.linkedin.com/sharing/share-offsite/?url=${shareUrl}`;

  return (
    <>
      <script
        type="application/ld+json"
        dangerouslySetInnerHTML={{ __html: JSON.stringify(articleLd) }}
      />
      <script
        type="application/ld+json"
        dangerouslySetInnerHTML={{ __html: JSON.stringify(breadcrumbLd) }}
      />
      {faqLd && (
        <script
          type="application/ld+json"
          dangerouslySetInnerHTML={{ __html: JSON.stringify(faqLd) }}
        />
      )}

      <PageHero
        eyebrow={`Blog · ${categoryLabel(post.category)}`}
        title={post.title}
        subtitle={post.subtitle}
        breadcrumb={post.title}
      />

      {/* ================================================================ */}
      {/* Post meta strip                                                   */}
      {/* ================================================================ */}
      <Section className="pt-6 pb-0">
        <div className="flex flex-col gap-3 border-y border-border py-4 sm:flex-row sm:flex-wrap sm:items-center sm:justify-between sm:gap-4 sm:py-5">
          <div className="flex flex-wrap items-center gap-5 font-mono text-[10px] uppercase tracking-[0.22em] text-muted-foreground">
            <span className="flex items-center gap-1.5 text-foreground">
              <span className="h-1.5 w-1.5 rounded-full bg-accent" />
              {post.author.name}
            </span>
            <span>{post.author.role}</span>
            <span className="flex items-center gap-1.5">
              <Calendar size={11} />
              <time dateTime={post.publishedAt}>
                {formatDate(post.publishedAt, locale)}
              </time>
            </span>
            {post.updatedAt && (
              <span className="flex items-center gap-1.5 text-accent">
                <RefreshCw size={11} />
                {ui.updatedOn}{" "}
                <time dateTime={post.updatedAt}>
                  {formatDate(post.updatedAt, locale)}
                </time>
              </span>
            )}
            <span className="flex items-center gap-1.5">
              <Clock size={11} />
              {ui.readTime(post.readTime)} · {ui.wordsCount(wordCount)}
            </span>
          </div>
          <LocalizedLink
            href="/blogs"
            className="inline-flex items-center gap-2 font-mono text-[10px] uppercase tracking-[0.22em] text-muted-foreground transition hover:text-foreground"
          >
            <ArrowLeft size={11} />
            {ui.allPostsBackLink}
          </LocalizedLink>
        </div>
      </Section>

      {/* ================================================================ */}
      {/* Hero sketch — editorial field diagram                             */}
      {/* ================================================================ */}
      <Section className="pt-8 pb-0 sm:pt-10">
        <div className="relative overflow-hidden rounded-3xl border border-border bg-surface/40 p-4 pt-14 shadow-[0_1px_0_0_rgba(255,255,255,0.04)_inset] sm:p-12 sm:pt-14">
          {/* Ambient gradients */}
          <div
            className="pointer-events-none absolute inset-0 opacity-80"
            style={{
              backgroundImage:
                "radial-gradient(at 15% 0%, oklch(0.65 0.19 55 / 0.10) 0px, transparent 45%), radial-gradient(at 85% 100%, oklch(0.66 0.18 295 / 0.08) 0px, transparent 50%)",
            }}
          />
          {/* Corner hash-marks — a faint grid feel */}
          <div className="pointer-events-none absolute left-3 top-3 h-4 w-4 border-l border-t border-accent/40 sm:left-5 sm:top-5" />
          <div className="pointer-events-none absolute right-3 top-3 h-4 w-4 border-r border-t border-accent/40 sm:right-5 sm:top-5" />
          <div className="pointer-events-none absolute bottom-3 left-3 h-4 w-4 border-b border-l border-accent/40 sm:bottom-5 sm:left-5" />
          <div className="pointer-events-none absolute bottom-3 right-3 h-4 w-4 border-b border-r border-accent/40 sm:bottom-5 sm:right-5" />

          {/* Eyebrow chip */}
          <div className="pointer-events-none absolute left-4 top-4 flex items-center gap-2 rounded-full border border-border bg-background/70 px-2.5 py-1 font-mono text-[9px] uppercase tracking-[0.22em] text-muted-foreground backdrop-blur-sm sm:left-6 sm:top-6 sm:text-[10px]">
            <Sparkles size={11} className="text-accent" />
            <span>{ui.fieldSketch}</span>
            <span className="h-2.5 w-px bg-border" />
            <span className="text-accent">{post.heroSketch}</span>
          </div>

          <BlogSketch
            sketchKey={post.heroSketch}
            className="relative mx-auto h-auto w-full max-w-4xl"
          />
        </div>
      </Section>

      {/* ================================================================ */}
      {/* Main content layout: body + sticky TOC sidebar                    */}
      {/* ================================================================ */}
      <Section className="pt-10 sm:pt-12">
        <div className="grid gap-10 lg:grid-cols-[1fr_260px] lg:gap-12">
          {/* ---------- Article body ---------- */}
          <article className="prose-like max-w-3xl">
            {/* Mobile-only TOC: collapsible above the TLDR for small screens */}
            <details className="mb-6 rounded-2xl border border-border bg-surface/40 p-5 lg:hidden">
              <summary className="flex cursor-pointer items-center justify-between gap-4">
                <span className="font-mono text-[10px] uppercase tracking-[0.22em] text-accent-strong">
                  {ui.onThisPage}
                </span>
                <ChevronRight
                  size={14}
                  className="text-accent transition-transform group-open:rotate-90"
                />
              </summary>
              <ol className="mt-4 space-y-3">
                {post.sections.map((section, i) => (
                  <li key={section.heading}>
                    <a
                      href={`#${slugifyHeading(section.heading)}`}
                      className="flex gap-3 text-sm leading-snug text-muted-foreground transition hover:text-foreground"
                    >
                      <span className="font-mono text-[10px] text-accent-strong">
                        §{String(i + 1).padStart(2, "0")}
                      </span>
                      <span>{section.heading}</span>
                    </a>
                  </li>
                ))}
              </ol>
            </details>

            {/* TLDR — editorial summary card */}
            <div className="relative overflow-hidden rounded-3xl border border-border bg-gradient-to-br from-surface/70 via-surface/40 to-background/40 p-6 shadow-[0_1px_0_0_rgba(255,255,255,0.04)_inset] sm:p-8">
              <div
                className="pointer-events-none absolute inset-0 opacity-60"
                style={{
                  backgroundImage:
                    "radial-gradient(at 100% 0%, oklch(0.65 0.19 55 / 0.08) 0px, transparent 40%)",
                }}
              />
              <div className="relative flex items-center gap-2.5">
                <span className="flex h-6 w-6 items-center justify-center rounded-lg border border-accent/40 bg-accent/10 text-accent">
                  <Zap size={11} />
                </span>
                <span className="font-mono text-[10px] uppercase tracking-[0.26em] text-accent-strong">
                  {ui.tldr}
                </span>
              </div>
              <p className="relative mt-5 font-display text-lg leading-[1.55] tracking-tight text-foreground sm:text-xl">
                {post.excerpt}
              </p>
            </div>

            {/* Key takeaways — numbered editorial list */}
            <div className="relative mt-6 overflow-hidden rounded-3xl border border-accent/30 bg-gradient-to-br from-accent/10 via-accent/[0.03] to-transparent p-6 sm:p-8">
              <div
                className="pointer-events-none absolute inset-0 opacity-60"
                style={{
                  backgroundImage:
                    "radial-gradient(at 0% 100%, oklch(0.65 0.19 55 / 0.10) 0px, transparent 45%)",
                }}
              />
              <div className="relative flex items-center gap-2.5">
                <span className="flex h-6 w-6 items-center justify-center rounded-lg border border-accent/40 bg-background/60 text-accent">
                  <Bookmark size={11} />
                </span>
                <span className="font-mono text-[10px] uppercase tracking-[0.26em] text-accent-strong">
                  {ui.keyTakeaways}
                </span>
              </div>
              <ol className="relative mt-6 space-y-4">
                {post.takeaways.map((k, i) => (
                  <li
                    key={i}
                    className="flex items-start gap-4 text-[17px] leading-[1.6] text-foreground"
                  >
                    <span className="mt-0.5 flex h-7 w-7 flex-shrink-0 items-center justify-center rounded-full border border-accent/40 bg-background/70 font-mono text-[10px] font-semibold text-accent-strong">
                      {String(i + 1).padStart(2, "0")}
                    </span>
                    <span className="pt-0.5">{k}</span>
                  </li>
                ))}
              </ol>
            </div>

            {/* Keyword targeting strip */}
            <div className="mt-6 rounded-3xl border border-border bg-background/60 p-5 sm:p-6">
              <div className="flex items-center gap-2.5">
                <span className="flex h-6 w-6 items-center justify-center rounded-lg border border-border bg-surface/60 text-accent">
                  <Target size={11} />
                </span>
                <span className="font-mono text-[10px] uppercase tracking-[0.26em] text-muted-foreground">
                  {ui.whatThisPostIsFor}
                </span>
              </div>
              <div className="mt-5 grid gap-5 sm:grid-cols-2 sm:gap-6">
                <div className="rounded-2xl border border-border bg-surface/40 p-4">
                  <div className="font-mono text-[9px] uppercase tracking-[0.22em] text-muted-foreground">
                    {ui.primaryKeyword}
                  </div>
                  <div className="mt-2 font-display text-lg font-semibold leading-tight text-foreground">
                    {post.keywords.primary}
                  </div>
                  <div className="mt-2 inline-flex items-center gap-1.5 rounded-full border border-accent/30 bg-accent/5 px-2 py-0.5 font-mono text-[10px] uppercase tracking-[0.18em] text-accent-strong">
                    <span className="h-1 w-1 rounded-full bg-accent" />
                    ~{post.keywords.searchVolume.toLocaleString()} {ui.monthlySearchesLabel}
                  </div>
                </div>
                <div className="rounded-2xl border border-border bg-surface/40 p-4">
                  <div className="font-mono text-[9px] uppercase tracking-[0.22em] text-muted-foreground">
                    {ui.alsoAnswers}
                  </div>
                  <div className="mt-3 flex flex-wrap gap-1.5">
                    {post.keywords.secondary.map((kw) => (
                      <span
                        key={kw}
                        className="rounded-full border border-border bg-background/60 px-2.5 py-1 font-mono text-[9px] uppercase tracking-[0.15em] text-muted-foreground"
                      >
                        {kw}
                      </span>
                    ))}
                  </div>
                </div>
              </div>
            </div>

            {/* Sections */}
            <div className="mt-14 space-y-16 sm:mt-16 sm:space-y-20">
              {post.sections.map((section, i) => {
                const id = slugifyHeading(section.heading);
                const isFirst = i === 0;
                const sectionNum = String(i + 1).padStart(2, "0");
                return (
                  <section key={id} id={id} className="scroll-mt-28">
                    {/* Editorial section header — numbered badge + decorative rule */}
                    <header className="relative">
                      <div className="flex items-center gap-4">
                        <span className="relative flex h-11 w-11 flex-shrink-0 items-center justify-center rounded-xl border border-accent/40 bg-gradient-to-br from-accent/15 to-accent/5 font-mono text-[12px] font-semibold tracking-wider text-accent-strong shadow-[0_0_0_1px_rgba(255,255,255,0.04)_inset]">
                          {sectionNum}
                          <span className="pointer-events-none absolute -inset-1 rounded-[14px] border border-accent/15" />
                        </span>
                        <div className="flex-1">
                          <div className="font-mono text-[10px] uppercase tracking-[0.26em] text-muted-foreground">
                            Section {sectionNum} / {String(post.sections.length).padStart(2, "0")}
                          </div>
                          <div className="mt-1 h-px bg-gradient-to-r from-accent/40 via-border to-transparent" />
                        </div>
                      </div>
                      <h2 className="mt-5 font-display text-[26px] font-semibold leading-[1.12] tracking-tight text-foreground sm:text-[32px] lg:text-[38px]">
                        {section.heading}
                      </h2>
                    </header>

                    <div className="mt-6 space-y-5">
                      {section.paragraphs.map((p, pi) => (
                        <ParagraphWithLinks
                          key={pi}
                          text={p}
                          dropCap={isFirst && pi === 0}
                        />
                      ))}
                    </div>

                    {section.bullets && (
                      <ul className="relative mt-7 space-y-3 overflow-hidden rounded-2xl border border-border bg-gradient-to-br from-surface/60 to-surface/20 p-6 shadow-[0_1px_0_0_rgba(255,255,255,0.03)_inset]">
                        <div
                          className="pointer-events-none absolute inset-y-0 left-0 w-[3px] bg-gradient-to-b from-accent/50 via-accent/20 to-transparent"
                          aria-hidden
                        />
                        {section.bullets.map((b, bi) => (
                          <li
                            key={bi}
                            className="flex items-start gap-3 text-[16px] leading-[1.65] text-foreground"
                          >
                            <span className="mt-[10px] h-1.5 w-1.5 flex-shrink-0 rounded-full bg-accent shadow-[0_0_0_3px_oklch(0.65_0.19_55_/_0.12)]" />
                            <span>{b}</span>
                          </li>
                        ))}
                      </ul>
                    )}

                    {section.pullQuote && (
                      <figure className="relative mt-10 overflow-hidden rounded-3xl border border-accent/30 bg-gradient-to-br from-accent/[0.08] via-surface/40 to-transparent p-8 sm:p-10 sm:pl-14">
                        <div
                          className="pointer-events-none absolute inset-0 opacity-70"
                          style={{
                            backgroundImage:
                              "radial-gradient(at 10% 0%, oklch(0.65 0.19 55 / 0.14) 0px, transparent 45%), radial-gradient(at 90% 100%, oklch(0.66 0.18 295 / 0.10) 0px, transparent 50%)",
                          }}
                        />
                        <Quote
                          aria-hidden
                          className="pointer-events-none absolute -left-2 -top-2 text-accent/20 sm:left-2 sm:top-3"
                          size={96}
                          strokeWidth={1.4}
                        />
                        <blockquote className="relative font-display text-[22px] font-medium leading-[1.35] tracking-tight text-foreground sm:text-[28px] lg:text-[32px]">
                          <span className="text-accent/80">&ldquo;</span>
                          {section.pullQuote}
                          <span className="text-accent/80">&rdquo;</span>
                        </blockquote>
                        <figcaption className="relative mt-6 flex items-center gap-3 font-mono text-[10px] uppercase tracking-[0.26em] text-muted-foreground">
                          <span className="h-px w-8 bg-accent/50" />
                          <span className="text-foreground">{post.author.name}</span>
                          <span className="text-border">·</span>
                          <span>{post.author.role}</span>
                        </figcaption>
                      </figure>
                    )}

                    {section.callout && (
                      <aside className="relative mt-7 overflow-hidden rounded-2xl border border-accent/40 bg-gradient-to-br from-accent/[0.08] via-accent/[0.03] to-transparent p-5 sm:p-6">
                        <div className="flex items-start gap-3.5">
                          <span className="flex h-9 w-9 flex-shrink-0 items-center justify-center rounded-xl border border-accent/40 bg-background/60 text-accent">
                            <Sparkles size={14} />
                          </span>
                          <div className="flex-1">
                            <div className="font-mono text-[10px] uppercase tracking-[0.26em] text-accent-strong">
                              {section.callout.title}
                            </div>
                            <p className="mt-2 text-[16px] leading-[1.6] text-foreground">
                              {section.callout.body}
                            </p>
                          </div>
                        </div>
                      </aside>
                    )}
                  </section>
                );
              })}
            </div>

            {/* Cross-page internal links — the on-page SEO linking box */}
            {post.crossPageLinks && post.crossPageLinks.length > 0 && (
              <div className="relative mt-20 overflow-hidden rounded-3xl border border-border bg-gradient-to-br from-surface/60 to-surface/20 p-6 sm:p-8">
                <div
                  className="pointer-events-none absolute inset-0 opacity-60"
                  style={{
                    backgroundImage:
                      "radial-gradient(at 100% 100%, oklch(0.65 0.19 55 / 0.08) 0px, transparent 50%)",
                  }}
                />
                <div className="relative flex items-center gap-2.5">
                  <span className="flex h-6 w-6 items-center justify-center rounded-lg border border-accent/40 bg-background/60 text-accent">
                    <ExternalLink size={11} />
                  </span>
                  <span className="font-mono text-[10px] uppercase tracking-[0.26em] text-accent-strong">
                    {ui.takeNextStep}
                  </span>
                </div>
                <div className="relative mt-6 grid gap-3 sm:grid-cols-2 lg:grid-cols-3">
                  {post.crossPageLinks.map((link) => (
                    <LocalizedLink
                      key={link.href}
                      href={link.href}
                      className="group relative flex items-start gap-3 overflow-hidden rounded-2xl border border-border bg-background/70 p-4 transition-all hover:-translate-y-0.5 hover:border-accent/50 hover:bg-background"
                    >
                      <span
                        className="pointer-events-none absolute inset-x-0 top-0 h-px bg-gradient-to-r from-transparent via-accent/40 to-transparent opacity-0 transition-opacity group-hover:opacity-100"
                        aria-hidden
                      />
                      <span className="mt-1 flex h-6 w-6 flex-shrink-0 items-center justify-center rounded-md border border-accent/30 bg-accent/5 text-accent transition-transform group-hover:translate-x-0.5">
                        <ChevronRight size={12} />
                      </span>
                      <div className="flex-1">
                        <div className="font-display text-sm font-semibold leading-tight text-foreground transition-colors group-hover:text-accent-strong">
                          {link.label}
                        </div>
                        <div className="mt-1.5 text-xs leading-relaxed text-muted-foreground">
                          {link.note}
                        </div>
                      </div>
                    </LocalizedLink>
                  ))}
                </div>
              </div>
            )}

            {/* Post FAQ — feeds FAQPage schema and is real readable content */}
            {post.faq && post.faq.length > 0 && (
              <div className="mt-16">
                <div className="flex items-center gap-2.5">
                  <span className="flex h-6 w-6 items-center justify-center rounded-lg border border-accent/40 bg-accent/10 text-accent">
                    <BookOpen size={11} />
                  </span>
                  <span className="font-mono text-[10px] uppercase tracking-[0.26em] text-accent-strong">
                    {ui.frequentlyAsked}
                  </span>
                </div>
                <h2 className="mt-4 font-display text-[26px] font-semibold leading-[1.12] tracking-tight text-foreground sm:text-[32px] lg:text-[38px]">
                  {ui.faqIntro}
                </h2>
                <div className="mt-8 space-y-3.5">
                  {post.faq.map((f, i) => (
                    <details
                      key={i}
                      className="group overflow-hidden rounded-2xl border border-border bg-surface/40 transition-all hover:border-accent/40 open:border-accent/40 open:bg-surface/60"
                    >
                      <summary className="flex cursor-pointer items-start gap-4 p-5 sm:p-6">
                        <span className="flex h-7 w-7 flex-shrink-0 items-center justify-center rounded-lg border border-border bg-background/70 font-mono text-[10px] font-semibold text-muted-foreground transition-colors group-open:border-accent/40 group-open:text-accent-strong">
                          {String(i + 1).padStart(2, "0")}
                        </span>
                        <span className="flex-1 pt-0.5 font-display text-[17px] font-semibold leading-snug text-foreground sm:text-[19px]">
                          {f.question}
                        </span>
                        <ChevronRight
                          size={18}
                          className="mt-1 flex-shrink-0 text-muted-foreground transition-transform group-open:rotate-90 group-open:text-accent"
                        />
                      </summary>
                      <div className="border-t border-border/60 px-5 pb-6 pt-4 sm:px-6">
                        <p className="pl-11 text-[16px] leading-[1.7] text-muted-foreground">
                          {f.answer}
                        </p>
                      </div>
                    </details>
                  ))}
                </div>
              </div>
            )}

            {/* End of article */}
            <div className="mt-16 flex items-center gap-4 border-t border-border pt-10">
              <div className="h-1.5 w-1.5 rounded-full bg-accent" />
              <span className="font-mono text-[10px] uppercase tracking-[0.22em] text-muted-foreground">
                {ui.endOfPost} · {ui.readTime(post.readTime)} · {ui.wordsCount(wordCount)}
              </span>
              <div className="h-px flex-1 bg-border" />
            </div>

            {/* Share + tags */}
            <div className="mt-10 flex flex-wrap items-center gap-3">
              <span className="flex items-center gap-2 font-mono text-[10px] uppercase tracking-[0.22em] text-muted-foreground">
                {ui.share}
              </span>
              <a
                href={twitterShare}
                target="_blank"
                rel="noopener noreferrer"
                aria-label="Share on Twitter"
                className="inline-flex items-center gap-1.5 rounded-full border border-border bg-surface/60 px-3 py-1.5 font-mono text-[10px] uppercase tracking-[0.18em] text-muted-foreground transition hover:border-accent/50 hover:text-accent-strong"
              >
                <Twitter size={11} />
                Twitter
              </a>
              <a
                href={linkedinShare}
                target="_blank"
                rel="noopener noreferrer"
                aria-label="Share on LinkedIn"
                className="inline-flex items-center gap-1.5 rounded-full border border-border bg-surface/60 px-3 py-1.5 font-mono text-[10px] uppercase tracking-[0.18em] text-muted-foreground transition hover:border-accent/50 hover:text-accent-strong"
              >
                <Linkedin size={11} />
                LinkedIn
              </a>
              <span className="mx-2 h-4 w-px bg-border" />
              <span className="flex items-center gap-2 font-mono text-[10px] uppercase tracking-[0.22em] text-muted-foreground">
                <Tag size={11} className="text-accent" />
                {ui.tags}
              </span>
              {post.tags.map((tag) => (
                <span
                  key={tag}
                  className="rounded-full border border-border bg-surface/60 px-3 py-1.5 font-mono text-[10px] uppercase tracking-[0.18em] text-muted-foreground"
                >
                  #{tag}
                </span>
              ))}
            </div>

            {/* Author block — premium byline with halo avatar */}
            <div className="relative mt-12 overflow-hidden rounded-3xl border border-border bg-gradient-to-br from-surface/60 via-surface/30 to-background/40 p-6 sm:p-8">
              <div
                className="pointer-events-none absolute inset-0 opacity-60"
                style={{
                  backgroundImage:
                    "radial-gradient(at 0% 0%, oklch(0.65 0.19 55 / 0.08) 0px, transparent 45%)",
                }}
              />
              <div className="relative flex flex-col gap-5 sm:flex-row sm:items-start sm:gap-6">
                <div className="relative flex-shrink-0">
                  <span className="pointer-events-none absolute -inset-1.5 rounded-full bg-accent/20 blur-md" aria-hidden />
                  <div className="relative flex h-16 w-16 items-center justify-center rounded-full border border-accent/50 bg-gradient-to-br from-accent/20 via-accent/10 to-accent/5 font-display text-2xl font-semibold text-accent shadow-[0_0_0_1px_rgba(255,255,255,0.05)_inset]">
                    {post.author.name
                      .split(" ")
                      .map((n) => n[0])
                      .join("")}
                  </div>
                  <span
                    className="pointer-events-none absolute -inset-1 rounded-full border border-accent/20"
                    aria-hidden
                  />
                </div>
                <div className="flex-1">
                  <div className="font-mono text-[10px] uppercase tracking-[0.26em] text-accent-strong">
                    {ui.writtenBy}
                  </div>
                  <div className="mt-1.5 font-display text-xl font-semibold tracking-tight text-foreground sm:text-2xl">
                    {post.author.name}
                  </div>
                  <div className="mt-1 font-mono text-[10px] uppercase tracking-[0.22em] text-muted-foreground">
                    {post.author.role}
                  </div>
                  {post.author.bio && (
                    <p className="mt-4 max-w-xl text-[15px] leading-[1.65] text-muted-foreground">
                      {post.author.bio}
                    </p>
                  )}
                  <div className="mt-5 flex flex-wrap items-center gap-2">
                    <LocalizedLink
                      href="/contact"
                      className="inline-flex items-center gap-1.5 rounded-full border border-accent/40 bg-accent/10 px-3.5 py-1.5 font-mono text-[10px] uppercase tracking-[0.18em] text-accent-strong transition hover:border-accent/60 hover:bg-accent/15"
                    >
                      {ui.authorBookAudit}
                      <ArrowUpRight size={11} />
                    </LocalizedLink>
                    <LocalizedLink
                      href="/about"
                      className="inline-flex items-center gap-1.5 rounded-full border border-border bg-surface/60 px-3.5 py-1.5 font-mono text-[10px] uppercase tracking-[0.18em] text-muted-foreground transition hover:border-accent/40 hover:text-foreground"
                    >
                      {ui.authorReadStory}
                      <ArrowUpRight size={11} />
                    </LocalizedLink>
                  </div>
                </div>
              </div>
            </div>
          </article>

          {/* ---------- Sticky sidebar ---------- */}
          <aside className="hidden lg:block">
            <div className="sticky top-28 space-y-5">
              {/* Table of contents */}
              <div className="relative overflow-hidden rounded-3xl border border-border bg-gradient-to-br from-surface/60 to-surface/20 p-5 shadow-[0_1px_0_0_rgba(255,255,255,0.04)_inset]">
                <div
                  className="pointer-events-none absolute inset-0 opacity-50"
                  style={{
                    backgroundImage:
                      "radial-gradient(at 0% 0%, oklch(0.65 0.19 55 / 0.08) 0px, transparent 45%)",
                  }}
                />
                <div className="relative flex items-center gap-2">
                  <span className="flex h-5 w-5 items-center justify-center rounded-md border border-accent/40 bg-accent/10 text-accent">
                    <BookOpen size={10} />
                  </span>
                  <span className="font-mono text-[10px] uppercase tracking-[0.26em] text-accent-strong">
                    {ui.onThisPage}
                  </span>
                </div>
                <ol className="relative mt-5 space-y-3">
                  {post.sections.map((section, i) => (
                    <li key={section.heading}>
                      <a
                        href={`#${slugifyHeading(section.heading)}`}
                        className="group flex gap-3 rounded-lg py-1 text-sm leading-snug text-muted-foreground transition-colors hover:text-foreground"
                      >
                        <span className="mt-px flex h-5 w-5 flex-shrink-0 items-center justify-center rounded-md border border-border bg-background/60 font-mono text-[9px] font-semibold text-muted-foreground transition-colors group-hover:border-accent/40 group-hover:text-accent-strong">
                          {String(i + 1).padStart(2, "0")}
                        </span>
                        <span className="pt-0.5">{section.heading}</span>
                      </a>
                    </li>
                  ))}
                </ol>

                <div className="relative mt-6 rounded-2xl border border-border bg-background/60 p-4">
                  <div className="font-mono text-[9px] uppercase tracking-[0.22em] text-muted-foreground">
                    {ui.writtenBy}
                  </div>
                  <div className="mt-1.5 flex items-center gap-2.5">
                    <span className="flex h-8 w-8 flex-shrink-0 items-center justify-center rounded-full border border-accent/40 bg-accent/10 font-display text-[11px] font-semibold text-accent-strong">
                      {post.author.name
                        .split(" ")
                        .map((n) => n[0])
                        .join("")}
                    </span>
                    <div className="min-w-0">
                      <div className="truncate font-display text-sm font-semibold text-foreground">
                        {post.author.name}
                      </div>
                      <div className="truncate font-mono text-[9px] uppercase tracking-[0.18em] text-muted-foreground">
                        {post.author.role}
                      </div>
                    </div>
                  </div>
                </div>

                <LocalizedLink
                  href="/contact"
                  className="relative mt-4 inline-flex w-full items-center justify-center gap-2 rounded-full bg-accent-strong px-4 py-2.5 font-mono text-[10px] font-semibold uppercase tracking-[0.18em] text-accent-foreground shadow-[0_10px_30px_-10px_oklch(0.65_0.19_55_/_0.6)] transition hover:-translate-y-0.5"
                >
                  {ui.bookAudit}
                  <ArrowUpRight size={12} />
                </LocalizedLink>
              </div>

              {/* Related posts (explicit, from relatedSlugs) */}
              <div className="rounded-3xl border border-border bg-surface/40 p-5">
                <div className="flex items-center gap-2">
                  <span className="flex h-5 w-5 items-center justify-center rounded-md border border-accent/40 bg-accent/10 text-accent">
                    <ArrowRight size={10} />
                  </span>
                  <span className="font-mono text-[10px] uppercase tracking-[0.26em] text-accent-strong">
                    {ui.readNext}
                  </span>
                </div>
                <ul className="mt-5 space-y-5">
                  {related.slice(0, 3).map((rp, i) => (
                    <li key={rp.slug} className={i !== 0 ? "border-t border-border/60 pt-5" : ""}>
                      <LocalizedLink
                        href={`/blogs/${rp.slug}`}
                        className="group block"
                      >
                        <div className="flex items-center gap-2 font-mono text-[9px] uppercase tracking-[0.18em]">
                          <span className="rounded-full border border-accent/30 bg-accent/5 px-1.5 py-0.5 text-accent">
                            {categoryLabel(rp.category)}
                          </span>
                          <span className="text-muted-foreground">
                            {rp.readTime} {ui.minRead}
                          </span>
                        </div>
                        <div className="mt-2 font-display text-sm font-semibold leading-[1.3] text-foreground transition-colors group-hover:text-accent-strong">
                          {rp.title}
                        </div>
                      </LocalizedLink>
                    </li>
                  ))}
                </ul>
              </div>
            </div>
          </aside>
        </div>
      </Section>

      {/* ================================================================ */}
      {/* Prev / next navigation                                            */}
      {/* ================================================================ */}
      <Section className="pt-10 pb-0">
        <div className="grid gap-4 md:grid-cols-2">
          {prev ? (
            <LocalizedLink
              href={`/blogs/${prev.slug}`}
              className="group relative flex items-start gap-4 overflow-hidden rounded-3xl border border-border bg-gradient-to-br from-surface/60 to-surface/20 p-5 transition-all hover:-translate-y-0.5 hover:border-accent/40 hover:shadow-[0_20px_40px_-20px_oklch(0.65_0.19_55_/_0.2)] sm:p-6"
            >
              <span
                className="pointer-events-none absolute inset-x-0 top-0 h-px bg-gradient-to-r from-transparent via-accent/40 to-transparent opacity-0 transition-opacity group-hover:opacity-100"
                aria-hidden
              />
              <span className="flex h-10 w-10 flex-shrink-0 items-center justify-center rounded-xl border border-border bg-background/70 text-muted-foreground transition-all group-hover:-translate-x-0.5 group-hover:border-accent/40 group-hover:text-accent">
                <ArrowLeft size={14} />
              </span>
              <div className="flex-1">
                <div className="font-mono text-[10px] uppercase tracking-[0.26em] text-muted-foreground">
                  {ui.previousPost}
                </div>
                <div className="mt-2 font-display text-[17px] font-semibold leading-[1.25] text-foreground transition-colors group-hover:text-accent">
                  {prev.title}
                </div>
              </div>
            </LocalizedLink>
          ) : (
            <div className="hidden md:block" />
          )}
          {next ? (
            <LocalizedLink
              href={`/blogs/${next.slug}`}
              className="group relative flex items-start gap-4 overflow-hidden rounded-3xl border border-border bg-gradient-to-br from-surface/60 to-surface/20 p-5 text-right transition-all hover:-translate-y-0.5 hover:border-accent/40 hover:shadow-[0_20px_40px_-20px_oklch(0.65_0.19_55_/_0.2)] sm:p-6"
            >
              <span
                className="pointer-events-none absolute inset-x-0 top-0 h-px bg-gradient-to-r from-transparent via-accent/40 to-transparent opacity-0 transition-opacity group-hover:opacity-100"
                aria-hidden
              />
              <div className="flex-1">
                <div className="font-mono text-[10px] uppercase tracking-[0.26em] text-muted-foreground">
                  {ui.nextPost}
                </div>
                <div className="mt-2 font-display text-[17px] font-semibold leading-[1.25] text-foreground transition-colors group-hover:text-accent">
                  {next.title}
                </div>
              </div>
              <span className="flex h-10 w-10 flex-shrink-0 items-center justify-center rounded-xl border border-border bg-background/70 text-muted-foreground transition-all group-hover:translate-x-0.5 group-hover:border-accent/40 group-hover:text-accent">
                <ArrowRight size={14} />
              </span>
            </LocalizedLink>
          ) : (
            <div className="hidden md:block" />
          )}
        </div>
      </Section>

      {/* ================================================================ */}
      {/* Related posts grid                                                */}
      {/* ================================================================ */}
      <Section className="pt-10">
        <div className="mb-10 flex items-end justify-between gap-4">
          <div>
            <div className="flex items-center gap-2 font-mono text-[10px] uppercase tracking-[0.26em] text-accent-strong">
              <span className="h-1 w-1 rounded-full bg-accent" />
              {ui.keepReading}
            </div>
            <h2 className="mt-2 font-display text-xl font-semibold tracking-tight text-foreground sm:text-2xl lg:text-3xl">
              {ui.readNext}
            </h2>
          </div>
          <div className="hidden h-px flex-1 bg-gradient-to-r from-border to-transparent sm:block" />
        </div>
        <div className="grid gap-6 md:grid-cols-3">
          {related.map((rp) => (
            <LocalizedLink
              key={rp.slug}
              href={`/blogs/${rp.slug}`}
              className="group relative flex h-full flex-col overflow-hidden rounded-3xl border border-border bg-gradient-to-br from-surface/60 to-surface/20 transition-all duration-300 hover:-translate-y-1 hover:border-accent/40 hover:shadow-[0_20px_40px_-20px_oklch(0.65_0.19_55_/_0.25)]"
            >
              <span
                className="pointer-events-none absolute inset-x-0 top-0 h-px bg-gradient-to-r from-transparent via-accent/50 to-transparent opacity-0 transition-opacity group-hover:opacity-100"
                aria-hidden
              />
              <div className="relative overflow-hidden border-b border-border bg-background/60 p-5">
                <div
                  className="pointer-events-none absolute inset-0 opacity-50"
                  style={{
                    backgroundImage:
                      "radial-gradient(at 50% 0%, oklch(0.65 0.19 55 / 0.08) 0px, transparent 60%)",
                  }}
                />
                <BlogSketch sketchKey={rp.heroSketch} className="relative h-auto w-full" />
              </div>
              <div className="flex flex-1 flex-col p-5 sm:p-6">
                <div className="flex items-center gap-2 font-mono text-[9px] uppercase tracking-[0.22em]">
                  <span className="rounded-full border border-accent/30 bg-accent/5 px-2 py-0.5 text-accent">
                    {categoryLabel(rp.category)}
                  </span>
                  <span className="text-muted-foreground">
                    {rp.readTime} {ui.minRead}
                  </span>
                </div>
                <h3 className="mt-3 font-display text-[18px] font-semibold leading-[1.25] tracking-tight text-foreground transition-colors group-hover:text-accent sm:text-[19px]">
                  {rp.title}
                </h3>
                <p className="mt-3 flex-1 text-sm leading-[1.65] text-muted-foreground">
                  {rp.excerpt}
                </p>
                <div className="mt-5 inline-flex items-center gap-1.5 font-mono text-[10px] uppercase tracking-[0.22em] text-accent-strong">
                  {ui.featuredReadMore}
                  <ArrowUpRight
                    size={12}
                    className="transition-transform group-hover:translate-x-0.5 group-hover:-translate-y-0.5"
                  />
                </div>
              </div>
            </LocalizedLink>
          ))}
        </div>
      </Section>

      <Cta t={t} />
    </>
  );
}
