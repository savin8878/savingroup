import type { Metadata } from "next";
import { IndiaGeoFooter } from "@/components/sections/IndiaGeoFooter";
import { type Locale } from "@/lib/i18n";
import {
  BASE_URL,
  isIndexable,
} from "@/lib/constants";
import { buildAlternates } from "@/lib/seo";
import { AUDIT } from "@/lib/offer";
import {
  BLOG_CATEGORIES,
  TOPIC_CLUSTERS,
  getAllBlogPosts,
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
import { BlogMotion } from "@/components/blog/BlogMotion";
import { FinalCta, formatPostDate } from "@/components/blog/BlogPrimitives";
import { getBlogIndexCopy } from "@/components/blog/copy/index-copy";
import indexStyles from "@/components/blog/index/BlogIndex.module.css";
import {
  FeaturedSection,
  GeoFooterFrame,
  IndexFaqSection,
  IndexHero,
  LatestSection,
  LibrarySection,
  TopicClustersSection,
  WhyWeWriteSection,
  WriterSection,
  type CategoryCount,
  type ClusterView,
  type IndexContext,
} from "@/components/blog/index/IndexSections";

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

// Posts come from Supabase; re-render at most every 5 minutes so edits show up.
export const revalidate = 300;

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

/** English category label — used for JSON-LD `articleSection` (unchanged). */
function categoryLabel(key: BlogCategory) {
  return BLOG_CATEGORIES.find((c) => c.key === key)?.label ?? key;
}

/** Every real category, in the order the site lists them. */
const CATEGORY_ORDER = BLOG_CATEGORIES.map((c) => c.key).filter(
  (key): key is BlogCategory => key !== "all"
);

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
  const ui = getBlogUi(loc);
  const copy = getBlogIndexCopy(locale);
  const prefix = `/${country.toLowerCase()}/${locale.toLowerCase()}`;
  const ctx: IndexContext = { ui, copy, locale };

  // ---- Localized post collections ----
  const BLOG_POSTS = await getAllBlogPosts();
  const postsLocalized = BLOG_POSTS.map((p) => localizePost(p, loc));
  const featuredPosts = getFeaturedPosts(BLOG_POSTS).map((p) => localizePost(p, loc));
  const latestPosts = getLatestPosts(BLOG_POSTS, 6).map((p) => localizePost(p, loc));
  const mostRead = getMostReadPosts(BLOG_POSTS, 5).map((p) => localizePost(p, loc));
  const totalSearchVolume = BLOG_POSTS.reduce(
    (sum, p) => sum + p.keywords.searchVolume,
    0
  );
  const avgReadTime = BLOG_POSTS.length
    ? Math.round(BLOG_POSTS.reduce((s, p) => s + p.readTime, 0) / BLOG_POSTS.length)
    : 0;

  // Newest featured post leads; the rest follow in the grid.
  const [featuredLead, ...featuredRest] = getLatestPosts(featuredPosts, featuredPosts.length);
  const newest = latestPosts[0];

  const groups = CATEGORY_ORDER.map((key) => ({
    key,
    posts: getPostsByCategory(BLOG_POSTS, key).map((p) => localizePost(p, loc)),
  })).filter((g) => g.posts.length > 0);
  const counts: CategoryCount[] = [
    { key: "all", count: BLOG_POSTS.length },
    ...CATEGORY_ORDER.map((key) => ({
      key,
      count: BLOG_POSTS.filter((p) => p.category === key).length,
    })),
  ];

  const clusters: ClusterView[] = TOPIC_CLUSTERS.map((cluster) => ({
    key: cluster.key,
    title: cluster.title,
    description: cluster.description,
    primaryKeyword: cluster.primaryKeyword,
    posts: cluster.slugs
      .map((slug) => getBlogPost(BLOG_POSTS, slug))
      .filter((p): p is BlogPost => !!p)
      .map((p) => localizePost(p, loc)),
  }));

  const tags = Array.from(new Set(postsLocalized.flatMap((p) => p.tags)));

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

      <BlogMotion labels={copy.motion} className={indexStyles.page}>
        <IndexHero
          ctx={ctx}
          total={BLOG_POSTS.length}
          lead={featuredLead ?? newest}
          lastShipped={newest ? formatPostDate(newest.publishedAt, locale) : undefined}
          counts={counts}
        />
        <FeaturedSection ctx={ctx} lead={featuredLead} rest={featuredRest} count={featuredPosts.length} />
        <LatestSection ctx={ctx} latest={latestPosts.slice(0, 4)} mostRead={mostRead} />
        <TopicClustersSection ctx={ctx} clusters={clusters} />
        <WhyWeWriteSection
          ctx={ctx}
          stats={[
            { label: ui.statsLongForm, value: BLOG_POSTS.length },
            { label: ui.statsAvgRead, value: avgReadTime, unit: ui.minRead },
            { label: ui.statsTopics, value: TOPIC_CLUSTERS.length },
            { label: ui.statsMonthlySearches, value: totalSearchVolume.toLocaleString(), accent: true },
          ]}
        />
        <LibrarySection ctx={ctx} groups={groups} total={BLOG_POSTS.length} tags={tags} />
        <WriterSection ctx={ctx} prefix={prefix} />
        <IndexFaqSection ctx={ctx} />
        <GeoFooterFrame>
          <IndiaGeoFooter country={country} locale={locale} pageKey="blogs" />
        </GeoFooterFrame>
        <FinalCta
          className={indexStyles.final}
          eyebrow={copy.finalEyebrow}
          question={copy.finalQuestion}
          lead={copy.finalLead}
          accent={copy.finalAccent}
          ctaLabel={copy.ctaLabel}
          note={copy.finalNote(AUDIT.minutes)}
          secondary={{ label: copy.fillerLink, href: "#library" }}
          circuitLabel={copy.circuitLabel}
          footer={{
            left: "Savin Group",
            center: copy.footerCenter,
            backToTop: { label: copy.backToTop, href: "#blog-index-title" },
          }}
        />
      </BlogMotion>
    </>
  );
}
