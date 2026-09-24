import type { Metadata } from "next";
import { notFound } from "next/navigation";
import {
  ArrowLeft,
  ArrowUpRight,
  ChevronRight,
  Clock,
  Sparkles,
  Tag,
} from "lucide-react";
import { PageHero } from "@/components/sections/PageHero";
import { Section, SectionHeader } from "@/components/primitives/section";
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
  getPostsByCategory,
  localizePost,
  TOPIC_CLUSTERS,
  type BlogCategory,
} from "@/lib/blogs";
import { getBlogUi } from "@/lib/blog-i18n";
import { BlogSketch } from "@/components/illustrations";

// ---------------------------------------------------------------------------
// Static params + per-category copy
// ---------------------------------------------------------------------------

const VALID_CATEGORIES: BlogCategory[] = [
  "growth",
  "automation",
  "seo",
  "case-study",
  "ops",
];

type CategoryCopy = {
  headline: string;
  accent: string;
  description: string;
  keywords: string[];
  metaTitle: string;
  metaDescription: string;
};

const CATEGORY_COPY: Record<BlogCategory, CategoryCopy> = {
  growth: {
    headline: "Growth & conversion posts —",
    accent: "where revenue actually lives.",
    description:
      "Revenue audits, CRO, landing page engineering, D2C catalog optimization, and the 2-hour fixes that move an SME from 1.9% CVR to 4%+ without touching the design.",
    keywords: [
      "revenue audit",
      "website conversion rate optimization",
      "landing page conversion",
      "d2c product listing page optimization",
      "hero section conversion",
      "sme growth india",
    ],
    metaTitle:
      "Growth & Conversion Blog · Revenue Audits, CRO, Landing Pages for SMEs",
    metaDescription:
      "Long-form field notes on revenue audits, conversion rate optimization, landing page engineering and D2C catalog optimization — written for founders of Indian SMEs.",
  },
  automation: {
    headline: "WhatsApp & sales automation —",
    accent: "the cheapest closing channel in India.",
    description:
      "Why WhatsApp out-converts email 4-6×, the three-tier bot→RM→human stack, the WhatsApp-as-CRM architecture, and the industry-specific playbooks for D2C, real estate, and clinics.",
    keywords: [
      "whatsapp sales automation",
      "whatsapp crm",
      "whatsapp business api",
      "sales automation india",
      "clinic appointment automation",
      "real estate lead scoring",
    ],
    metaTitle:
      "WhatsApp Automation Blog · Sales Agents, CRM, Lead Scoring for SMEs",
    metaDescription:
      "How Indian SMEs ship always-on WhatsApp sales agents, turn WhatsApp into a real CRM, and automate receptionist and lead-scoring workflows — the 7-day rollout and the architecture behind it.",
  },
  seo: {
    headline: "SEO & organic growth —",
    accent: "rankings that actually compound.",
    description:
      "The three signals Google trusts, how we build topical authority in 90 days, Core Web Vitals for SMEs, AI-assisted copywriting, and the paid + organic interplay that compounds over six months.",
    keywords: [
      "seo strategy india",
      "topical authority",
      "core web vitals optimization",
      "ai copywriting tools",
      "google ads for small business india",
      "seo for small business",
    ],
    metaTitle:
      "SEO & Organic Growth Blog · Topical Authority, CWV, AI Copy for SMEs",
    metaDescription:
      "The three signals Google actually trusts, the 90-day topical authority playbook, Core Web Vitals remediation, and AI-assisted copywriting — written for Indian SME founders.",
  },
  "case-study": {
    headline: "Case studies —",
    accent: "real businesses. Real numbers.",
    description:
      "Before-and-after anatomy of the revenue systems we've shipped — the 1.9% → 4.3% CVR skincare brand, the ₹30L real estate WhatsApp bot, the clinic that cut no-shows from 31% to 7.2% in eight weeks.",
    keywords: [
      "sme case study",
      "conversion rate case study",
      "whatsapp automation case study",
      "d2c case study india",
    ],
    metaTitle:
      "Case Studies Blog · Revenue System Outcomes for Indian SMEs",
    metaDescription:
      "Before-and-after anatomy of revenue systems shipped for Indian SMEs — conversion rate, WhatsApp automation, and retention outcomes with real numbers.",
  },
  ops: {
    headline: "Operations & systems —",
    accent: "the unglamorous work that compounds.",
    description:
      "The 5-layer revenue stack, the systems thinking behind every audit, and the operational glue that keeps attention, conversion, qualification, nurture and retention working as one engine.",
    keywords: [
      "sme revenue stack",
      "revenue system",
      "marketing operations",
      "sme growth architecture",
    ],
    metaTitle:
      "Ops & Systems Blog · The 5-Layer Revenue Stack for SMEs",
    metaDescription:
      "The 5-layer revenue stack and the operational glue that keeps an SME's attention, conversion, qualification, nurture and retention working as one engine.",
  },
};

export async function generateStaticParams() {
  return VALID_CATEGORIES.map((c) => ({ category: c }));
}

export async function generateMetadata({
  params,
}: {
  params: Promise<{ country: string; locale: string; category: string }>;
}): Promise<Metadata> {
  const { country, locale, category } = await params;
  if (!VALID_CATEGORIES.includes(category as BlogCategory)) {
    return { title: "Category not found" };
  }
  const copy = CATEGORY_COPY[category as BlogCategory];
  const alternates = buildAlternates({
    country,
    locale,
    subPath: `blogs/category/${category}`,
  });
  const canonical = `${BASE_URL}${alternates.canonical}`;

  return {
    title: copy.metaTitle,
    description: copy.metaDescription,
    keywords: copy.keywords,
    alternates,
    openGraph: {
      title: copy.metaTitle,
      description: copy.metaDescription,
      url: canonical,
      siteName: "Savin Group",
      type: "website",
      locale: `${locale}_${country.toUpperCase()}`,
      images: [
        { url: `${BASE_URL}/og.png`, width: 1200, height: 630, alt: copy.metaTitle },
      ],
    },
    twitter: {
      card: "summary_large_image",
      title: copy.metaTitle,
      description: copy.metaDescription,
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

export default async function BlogCategoryPage({
  params,
}: {
  params: Promise<{ country: string; locale: string; category: string }>;
}) {
  const { country, locale, category } = await params;
  if (!VALID_CATEGORIES.includes(category as BlogCategory)) notFound();

  const cat = category as BlogCategory;
  const loc = locale as Locale;
  const t = getTranslation(loc);
  const ui = getBlogUi(loc);
  const copy = CATEGORY_COPY[cat];
  const prefix = `/${country.toLowerCase()}/${locale.toLowerCase()}`;
  const canonical = `${BASE_URL}${prefix}/blogs/category/${cat}`;

  const posts = getPostsByCategory(cat).map((p) => localizePost(p, loc));
  const otherCategories = VALID_CATEGORIES.filter((c) => c !== cat && getPostsByCategory(c).length > 0);

  // ---- JSON-LD ----
  const collectionLd = {
    "@context": "https://schema.org",
    "@type": "CollectionPage",
    "@id": canonical,
    name: copy.metaTitle,
    description: copy.metaDescription,
    url: canonical,
    inLanguage: locale,
    isPartOf: {
      "@type": "Blog",
      "@id": `${BASE_URL}${prefix}/blogs`,
      name: "Savin Group Blog",
    },
    about: copy.keywords.map((k) => ({ "@type": "Thing", name: k })),
    hasPart: posts.map((p) => ({
      "@type": "BlogPosting",
      headline: p.title,
      url: `${BASE_URL}${prefix}/blogs/${p.slug}`,
      datePublished: p.publishedAt,
      dateModified: p.updatedAt ?? p.publishedAt,
      author: { "@type": "Person", name: p.author.name },
      keywords: [p.keywords.primary, ...p.keywords.secondary].join(", "),
    })),
  };

  const breadcrumbLd = {
    "@context": "https://schema.org",
    "@type": "BreadcrumbList",
    itemListElement: [
      { "@type": "ListItem", position: 1, name: "Home", item: `${BASE_URL}${prefix}` },
      {
        "@type": "ListItem",
        position: 2,
        name: ui.breadcrumb,
        item: `${BASE_URL}${prefix}/blogs`,
      },
      {
        "@type": "ListItem",
        position: 3,
        name: categoryLabel(cat),
        item: canonical,
      },
    ],
  };

  // Find clusters that contain posts from this category
  const relevantClusters = TOPIC_CLUSTERS.filter((cluster) =>
    cluster.slugs.some((slug) =>
      BLOG_POSTS.find((p) => p.slug === slug && p.category === cat)
    )
  );

  return (
    <>
      <script
        type="application/ld+json"
        dangerouslySetInnerHTML={{ __html: JSON.stringify(collectionLd) }}
      />
      <script
        type="application/ld+json"
        dangerouslySetInnerHTML={{ __html: JSON.stringify(breadcrumbLd) }}
      />

      <PageHero
        eyebrow={`Blog · ${categoryLabel(cat)}`}
        title={
          <>
            {copy.headline}{" "}
            <span className="text-accent">{copy.accent}</span>
          </>
        }
        subtitle={copy.description}
        breadcrumb={categoryLabel(cat)}
      />

      {/* ============================================================= */}
      {/* Meta strip — count + back link                                 */}
      {/* ============================================================= */}
      <Section className="pt-6 pb-0">
        <div className="flex flex-wrap items-center justify-between gap-4 border-y border-border py-5">
          <div className="flex flex-wrap items-center gap-5 font-mono text-[10px] uppercase tracking-[0.22em] text-muted-foreground">
            <span className="flex items-center gap-1.5 text-foreground">
              <span className="h-1.5 w-1.5 rounded-full bg-accent" />
              {posts.length} {posts.length === 1 ? "post" : "posts"} in {categoryLabel(cat)}
            </span>
            <span className="flex items-center gap-1.5">
              <Tag size={11} className="text-accent" />
              {copy.keywords.slice(0, 3).join(" · ")}
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

      {/* ============================================================= */}
      {/* Keyword strip — showcases what this page targets for SEO       */}
      {/* ============================================================= */}
      <Section className="pt-8 pb-0">
        <div className="rounded-2xl border border-border bg-surface/40 p-5 sm:p-6">
          <div className="flex items-center gap-2 font-mono text-[10px] uppercase tracking-[0.22em] text-accent-strong">
            <Sparkles size={11} />
            This page answers
          </div>
          <div className="mt-4 flex flex-wrap gap-2">
            {copy.keywords.map((kw) => (
              <span
                key={kw}
                className="rounded-full border border-border bg-background/60 px-3 py-1.5 font-mono text-[10px] uppercase tracking-[0.18em] text-muted-foreground"
              >
                {kw}
              </span>
            ))}
          </div>
        </div>
      </Section>

      {/* ============================================================= */}
      {/* Posts grid                                                     */}
      {/* ============================================================= */}
      <Section className="pt-10">
        <SectionHeader
          eyebrow="All posts in this category"
          title={
            <>
              {posts.length} field {posts.length === 1 ? "note" : "notes"} on{" "}
              <span className="text-accent">{categoryLabel(cat).toLowerCase()}.</span>
            </>
          }
          align="left"
        />
        <div className="mt-10 grid gap-6 md:grid-cols-2 xl:grid-cols-3">
          {posts.map((post) => (
            <LocalizedLink
              key={post.slug}
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
                <time
                  dateTime={post.publishedAt}
                  className="font-mono uppercase tracking-[0.18em]"
                >
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
          ))}
        </div>
      </Section>

      {/* ============================================================= */}
      {/* Related topic clusters                                         */}
      {/* ============================================================= */}
      {relevantClusters.length > 0 && (
        <Section className="pt-4">
          <div className="rounded-2xl border border-border bg-surface/40 p-6 sm:p-8">
            <div className="flex items-center gap-2 font-mono text-[10px] uppercase tracking-[0.22em] text-accent-strong">
              <Sparkles size={11} />
              {ui.topicClustersEyebrow}
            </div>
            <h2 className="mt-3 font-display text-2xl font-semibold leading-tight tracking-tight text-foreground sm:text-3xl">
              How these posts {" "}
              <span className="text-accent">connect.</span>
            </h2>
            <div className="mt-6 grid gap-4 md:grid-cols-2">
              {relevantClusters.map((cluster) => (
                <div
                  key={cluster.key}
                  className="rounded-xl border border-border bg-background/60 p-5"
                >
                  <div className="font-mono text-[10px] uppercase tracking-[0.22em] text-accent-strong">
                    Cluster · {cluster.primaryKeyword}
                  </div>
                  <h3 className="mt-2 font-display text-base font-semibold text-foreground">
                    {cluster.title}
                  </h3>
                  <ul className="mt-4 space-y-2">
                    {cluster.slugs.map((slug) => {
                      const post = BLOG_POSTS.find((p) => p.slug === slug);
                      if (!post) return null;
                      return (
                        <li key={slug}>
                          <LocalizedLink
                            href={`/blogs/${slug}`}
                            className="group flex items-start gap-2 text-xs leading-snug text-muted-foreground transition hover:text-foreground"
                          >
                            <ChevronRight
                              size={10}
                              className="mt-1 flex-shrink-0 text-accent transition-transform group-hover:translate-x-0.5"
                            />
                            <span>{localizePost(post, loc).title}</span>
                          </LocalizedLink>
                        </li>
                      );
                    })}
                  </ul>
                </div>
              ))}
            </div>
          </div>
        </Section>
      )}

      {/* ============================================================= */}
      {/* Other categories — internal linking hub                       */}
      {/* ============================================================= */}
      <Section className="pt-4">
        <div className="mb-6 flex items-center gap-3">
          <span className="font-mono text-[10px] uppercase tracking-[0.22em] text-accent-strong">
            Browse other categories
          </span>
          <div className="h-px flex-1 bg-border" />
        </div>
        <div className="grid gap-4 md:grid-cols-2 lg:grid-cols-4">
          {otherCategories.map((oc) => {
            const ocCopy = CATEGORY_COPY[oc];
            const ocCount = getPostsByCategory(oc).length;
            return (
              <LocalizedLink
                key={oc}
                href={`/blogs/category/${oc}`}
                className="group flex h-full flex-col rounded-2xl border border-border bg-surface/40 p-5 transition hover:-translate-y-0.5 hover:border-accent/40 hover:bg-surface"
              >
                <div className="font-mono text-[10px] uppercase tracking-[0.22em] text-accent-strong">
                  {categoryLabel(oc)}
                </div>
                <h3 className="mt-3 font-display text-base font-semibold leading-tight tracking-tight text-foreground">
                  {ocCopy.headline} <span className="text-accent">{ocCopy.accent}</span>
                </h3>
                <div className="mt-auto flex items-center justify-between border-t border-border pt-4 text-xs text-muted-foreground">
                  <span className="font-mono uppercase tracking-[0.18em]">
                    {ocCount} posts
                  </span>
                  <ArrowUpRight
                    size={12}
                    className="text-accent transition-transform group-hover:translate-x-0.5 group-hover:-translate-y-0.5"
                  />
                </div>
              </LocalizedLink>
            );
          })}
        </div>
      </Section>

      <Cta t={t} />
    </>
  );
}
