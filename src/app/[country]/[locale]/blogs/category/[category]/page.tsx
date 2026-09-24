import type { Metadata } from "next";
import { notFound } from "next/navigation";
import { ArrowUpRight } from "lucide-react";
import LocalizedLink from "@/components/LocalizedLink";
import home from "@/components/home/IndustrialHome.module.css";
import { BlogMotion } from "@/components/blog/BlogMotion";
import {
  BlogSection,
  CategoryNav,
  FinalCta,
  PostCard,
  SectionHeading,
  getCategoryLabel,
} from "@/components/blog/BlogPrimitives";
import {
  CATEGORY_SKETCH,
  CategoryDirectory,
  CategoryPostGrid,
  CategoryHero,
  ClusterRows,
} from "@/components/blog/category/CategorySections";
import categoryStyles from "@/components/blog/category/Category.module.css";
import { getCategoryCopy } from "@/components/blog/copy/category-copy";
import { IndiaGeoFooter } from "@/components/sections/IndiaGeoFooter";
import { getTranslation, type Locale } from "@/lib/i18n";
import {
  BASE_URL,
  isIndexable,
} from "@/lib/constants";
import { buildAlternates } from "@/lib/seo";
import { AUDIT, CTA_LABEL } from "@/lib/offer";
import {
  BLOG_CATEGORIES,
  getAllBlogPosts,
  getFeaturedPosts,
  getPostsByCategory,
  localizePost,
  TOPIC_CLUSTERS,
  type BlogCategory,
} from "@/lib/blogs";
import { getBlogUi } from "@/lib/blog-i18n";

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

// Posts come from Supabase; re-render at most every 5 minutes so edits show up.
export const revalidate = 300;

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

/** English label from BLOG_CATEGORIES — the JSON-LD breadcrumb keeps using it. */
function categoryLabel(key: BlogCategory) {
  return BLOG_CATEGORIES.find((c) => c.key === key)?.label ?? key;
}

/** "38K"-style count for the stats row. */
function compactCount(n: number) {
  if (n >= 10000) return `${Math.round(n / 1000)}K`;
  if (n >= 1000) return `${(n / 1000).toFixed(1).replace(/\.0$/, "")}K`;
  return String(n);
}

/** Month + year ("Sep 2026"), pinned to UTC like formatPostDate. */
function formatMonth(iso: string, locale: string) {
  const date = new Date(iso);
  if (Number.isNaN(date.getTime())) return iso;
  return date.toLocaleDateString(locale === "hi" ? "hi-IN" : "en-US", {
    month: "short",
    year: "numeric",
    timeZone: "UTC",
  });
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
  const pageCopy = getCategoryCopy(loc);
  const copy = CATEGORY_COPY[cat];
  const prefix = `/${country.toLowerCase()}/${locale.toLowerCase()}`;
  const canonical = `${BASE_URL}${prefix}/blogs/category/${cat}`;

  const BLOG_POSTS = await getAllBlogPosts();
  const posts = getPostsByCategory(BLOG_POSTS, cat).map((p) => localizePost(p, loc));
  const otherCategories = VALID_CATEGORIES.filter((c) => c !== cat && getPostsByCategory(BLOG_POSTS, c).length > 0);

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

  // ---- Display data ----
  const label = getCategoryLabel(ui, cat);
  const figure = pageCopy.figures[cat];
  // Lead post: the category's featured post, else the first in editorial order.
  const leadPost = getFeaturedPosts(posts)[0] ?? posts[0];
  const rest = posts.filter((p) => p !== leadPost);
  const restColumns = rest.length % 3 === 0 || rest.length >= 5 ? 3 : 2;
  const [notesLead, notesAccent] = pageCopy.notesHeading(posts.length, label);

  const totalRead = posts.reduce((sum, p) => sum + p.readTime, 0);
  const avgRead = posts.length ? Math.round(totalRead / posts.length) : 0;
  const searches = posts.reduce((sum, p) => sum + (p.keywords.searchVolume || 0), 0);
  const lastTouched = posts.reduce<string | undefined>((latest, p) => {
    const iso = p.updatedAt ?? p.publishedAt;
    return !latest || new Date(iso).getTime() > new Date(latest).getTime() ? iso : latest;
  }, undefined);

  const counts: Partial<Record<BlogCategory | "all", number>> = { all: BLOG_POSTS.length };
  for (const c of VALID_CATEGORIES) counts[c] = getPostsByCategory(BLOG_POSTS, c).length;

  const clusterRows = relevantClusters.map((cluster) => ({
    key: cluster.key,
    title: cluster.title,
    description: cluster.description,
    primaryKeyword: cluster.primaryKeyword,
    posts: cluster.slugs.flatMap((slug) => {
      const post = BLOG_POSTS.find((p) => p.slug === slug);
      return post ? [{ slug, title: localizePost(post, loc).title, inCategory: post.category === cat }] : [];
    }),
  }));

  const directory = otherCategories.map((oc) => {
    const count = counts[oc] ?? 0;
    return {
      key: oc,
      label: getCategoryLabel(ui, oc),
      headline: CATEGORY_COPY[oc].headline,
      accent: CATEGORY_COPY[oc].accent,
      count,
      countLabel: pageCopy.postCount(count),
    };
  });

  const clustersChapter = 2;
  const otherChapter = clusterRows.length > 0 ? 3 : 2;

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

      <BlogMotion labels={pageCopy.motion} className={categoryStyles.page}>
        <CategoryHero
          id="category-hero"
          titleId="category-title"
          breadcrumbs={[
            { label: pageCopy.home, href: "/" },
            { label: ui.breadcrumb, href: "/blogs" },
            { label },
          ]}
          breadcrumbLabel={pageCopy.breadcrumbAria}
          back={{ label: ui.allPostsBackLink, href: "/blogs" }}
          eyebrow={`${ui.breadcrumb} · ${label}`}
          edition={pageCopy.postsIn(posts.length, label)}
          headline={copy.headline}
          accent={copy.accent}
          description={copy.description}
          readLead={{ label: pageCopy.readLead, href: "#category-posts" }}
          figure={{ sketch: CATEGORY_SKETCH[cat], title: figure.title, legend: figure.legend }}
          stats={[
            { value: posts.length, label: pageCopy.statPosts },
            { value: <>{totalRead}<small>{ui.minRead}</small></>, label: pageCopy.statReading },
            {
              value: lastTouched ? <time dateTime={lastTouched}>{formatMonth(lastTouched, locale)}</time> : "—",
              label: pageCopy.statUpdated,
            },
            searches > 0
              ? { value: compactCount(searches), label: ui.statsMonthlySearches }
              : { value: <>{avgRead}<small>{ui.minRead}</small></>, label: ui.statsAvgRead },
          ]}
          keywords={{ label: pageCopy.pageAnswers, items: copy.keywords }}
        />

        {/* 01 — every post in the category: the lead post, then the rest */}
        <BlogSection id="category-posts" labelledBy="category-posts-title" className={categoryStyles.posts}>
          <SectionHeading
            className={categoryStyles.head}
            number={1}
            label={pageCopy.allPostsEyebrow}
            lead={notesLead}
            accent={notesAccent}
            id="category-posts-title"
            intro={posts.length === 1 ? pageCopy.postsIntroSingle : pageCopy.postsIntro}
          />
          <CategoryNav ui={ui} active={cat} counts={counts} className={categoryStyles.nav} />
          {leadPost ? (
            <>
              <div className={categoryStyles.leadPost}>
                <PostCard post={leadPost} ui={ui} locale={locale} variant="feature" index={1} kicker={pageCopy.leadKicker} />
              </div>
              {/* One remaining post reads better full width than as a lone half-width card. */}
              {rest.length === 1 && (
                <div data-blog-reveal="">
                  <PostCard post={rest[0]} ui={ui} locale={locale} variant="feature" index={2} />
                </div>
              )}
              {rest.length > 1 && (
                <CategoryPostGrid
                  posts={rest}
                  ui={ui}
                  locale={locale}
                  columns={restColumns}
                  startIndex={2}
                  label={pageCopy.moreLabel}
                  filler={{
                    kicker: ui.allPostsEyebrow,
                    lead: ui.allPostsTitle,
                    accent: ui.allPostsTitleAccent,
                    count: BLOG_POSTS.length,
                    meta: pageCopy.postCount(BLOG_POSTS.length),
                    action: ui.allPostsBackLink,
                    href: "/blogs",
                  }}
                />
              )}
            </>
          ) : (
            <p className={categoryStyles.empty}>{pageCopy.empty}</p>
          )}
        </BlogSection>

        {/* 02 — topic clusters that include this category */}
        {clusterRows.length > 0 && (
          <BlogSection tone="dark" id="category-clusters" labelledBy="category-clusters-title" scene>
            <SectionHeading
              className={categoryStyles.head}
              number={clustersChapter}
              label={ui.topicClustersEyebrow}
              lead={pageCopy.clustersLead}
              accent={pageCopy.clustersAccent}
              id="category-clusters-title"
              intro={<bdi>{ui.topicClustersSubtitle}</bdi>}
            />
            <ClusterRows
              clusters={clusterRows}
              clusterLabel={pageCopy.clusterLabel}
              inThisCategory={pageCopy.inThisCategory}
              count={pageCopy.clusterCount}
            />
          </BlogSection>
        )}

        {/* 03 — the other categories (internal linking hub) */}
        {directory.length > 0 && (
          <BlogSection tone="surface" id="category-other" labelledBy="category-other-title">
            <SectionHeading
              className={categoryStyles.head}
              number={otherChapter}
              label={pageCopy.otherEyebrow}
              lead={<bdi>{ui.byCategoryTitle}</bdi>}
              accent={<bdi>{ui.byCategoryAccent}</bdi>}
              id="category-other-title"
              action={
                <LocalizedLink href="/blogs" className={home.textButton}>
                  {ui.allPostsBackLink}
                  <ArrowUpRight size={16} aria-hidden="true" />
                </LocalizedLink>
              }
            />
            <CategoryDirectory items={directory} label={pageCopy.otherEyebrow} />
          </BlogSection>
        )}

        <div className={categoryStyles.geo}>
          <IndiaGeoFooter country={country} locale={locale} pageKey="blogs" variant="compact" />
        </div>

        <FinalCta
          id="category-final-title"
          className={categoryStyles.finalCta}
          eyebrow={t.cta.eyebrow}
          question={t.cta.subtitle}
          lead={pageCopy.finalLead}
          accent={pageCopy.finalAccent}
          ctaLabel={CTA_LABEL}
          ctaHref="/contact"
          note={<bdi>{AUDIT.supportLine}</bdi>}
          secondary={{ label: t.cta.secondary, href: "/case-studies" }}
          circuitLabel={pageCopy.circuitLabel}
          footer={{
            left: "Savin Group",
            center: pageCopy.footerCenter,
            backToTop: { label: pageCopy.backToTop, href: "#category-hero" },
          }}
        />
      </BlogMotion>
    </>
  );
}
