import type { Metadata } from "next";
import { IndiaGeoFooter } from "@/components/sections/IndiaGeoFooter";
import { type Locale } from "@/lib/i18n";
import { BASE_URL, isIndexable } from "@/lib/constants";
import { buildAlternates } from "@/lib/seo";
import { AUDIT } from "@/lib/offer";
import {
  NEWS_CATEGORY_KEYS, countPublishers, getAllNewsPosts, getLeadStory, getNewsByCategory, getTopStories, localizeNewsPost,
  type NewsCategory, type NewsPost,
} from "@/lib/news";
import { BlogMotion } from "@/components/blog/BlogMotion";
import { FinalCta, formatPostDate } from "@/components/blog/BlogPrimitives";
import { getNewsroomCopy } from "@/components/newsroom/copy/newsroom-copy";
import ns from "@/components/newsroom/Newsroom.module.css";
import {
  ArchiveSection, DesksSection, HowSection, LeadSection, NewsGeoFrame, NewsroomFaqSection, NewsroomHero, WireSection,
  type ArchiveGroup, type DeskCount, type DeskView,
} from "@/components/newsroom/NewsroomSections";

// Stories are written by the daily publisher; re-render at most every 5 minutes
// (and instantly through /api/revalidate/blog when a story lands).
export const revalidate = 300;

const NEWSROOM_KEYWORDS = [
  "industrial automation news india",
  "ai agents news",
  "manufacturing technology news india",
  "erp news india",
  "iot smart factory news",
  "msme business news",
  "policy updates indian business",
];

export async function generateMetadata({ params }: { params: Promise<{ country: string; locale: string }> }): Promise<Metadata> {
  const { country, locale } = await params;
  const alternates = buildAlternates({ country, locale, subPath: "newsroom" });
  const canonical = `${BASE_URL}${alternates.canonical}`;
  const title = "Newsroom · AI, Automation & Manufacturing News Decoded for Indian Operators";
  const description =
    "Daily, sourced stories on AI agents, industrial automation, manufacturing technology, ERP and business software — each one closed with what it means for Indian SMEs and plant heads.";
  return {
    title,
    description,
    keywords: NEWSROOM_KEYWORDS,
    alternates,
    openGraph: {
      title: "Savin Group · Newsroom", description, url: canonical, siteName: "Savin Group", type: "website",
      locale: `${locale}_${country.toUpperCase()}`,
      images: [{ url: `${BASE_URL}/og.png`, width: 1200, height: 630, alt: "Savin Group Newsroom" }],
    },
    twitter: { card: "summary_large_image", title: "Savin Group · Newsroom", description, images: [`${BASE_URL}/og.png`] },
    robots: isIndexable(country, locale)
      ? { index: true, follow: true, googleBot: { index: true, follow: true, "max-snippet": -1, "max-image-preview": "large", "max-video-preview": -1 } }
      : { index: false, follow: true, googleBot: { index: false, follow: true } },
  };
}

export default async function NewsroomPage({ params }: { params: Promise<{ country: string; locale: string }> }) {
  const { country, locale } = await params;
  const loc = locale as Locale;
  const copy = getNewsroomCopy(locale);
  const prefix = `/${country.toLowerCase()}/${locale.toLowerCase()}`;

  const ALL = await getAllNewsPosts();
  const posts = ALL.map((p) => localizeNewsPost(p, loc));
  const leadBase = getLeadStory(ALL);
  const lead = leadBase ? localizeNewsPost(leadBase, loc) : undefined;
  const afterLead = posts.filter((p) => p.slug !== lead?.slug);
  const secondary = afterLead.slice(0, 3);
  const wire = posts.slice(0, 8);
  const top = getTopStories(ALL, 5).map((p) => localizeNewsPost(p, loc));
  const newest = posts[0];

  const counts: DeskCount[] = [
    { key: "all", count: posts.length },
    ...NEWS_CATEGORY_KEYS.map((key) => ({ key, count: getNewsByCategory(ALL, key).length })),
  ];
  const desks: DeskView[] = NEWS_CATEGORY_KEYS.map((key) => {
    const onDesk = getNewsByCategory(posts, key);
    return { key, count: onDesk.length, latest: onDesk[0] };
  });
  const groups: ArchiveGroup[] = NEWS_CATEGORY_KEYS
    .map((key) => ({ key, posts: getNewsByCategory(posts, key) }))
    .filter((g) => g.posts.length > 0);
  const tags = Array.from(new Set(posts.flatMap((p) => p.tags))).slice(0, 40);
  const publishers = countPublishers(ALL);
  const desksWithStories = desks.filter((d) => d.count > 0).length;

  // ---- JSON-LD ----
  const collectionLd = {
    "@context": "https://schema.org",
    "@type": "CollectionPage",
    "@id": `${BASE_URL}${prefix}/newsroom`,
    name: "Savin Group Newsroom",
    description: "Daily, sourced industry news for Indian operators — AI, automation, manufacturing technology, software and policy, decoded.",
    url: `${BASE_URL}${prefix}/newsroom`,
    inLanguage: locale,
    isPartOf: { "@type": "WebSite", "@id": `${BASE_URL}/${country}/${locale}#website` },
    publisher: { "@type": "Organization", name: "Savin Group", url: BASE_URL, logo: { "@type": "ImageObject", url: `${BASE_URL}/og.png` } },
    hasPart: posts.slice(0, 30).map((p) => ({
      "@type": "NewsArticle",
      headline: p.title,
      description: p.excerpt,
      datePublished: p.publishedAt,
      dateModified: p.updatedAt ?? p.publishedAt,
      url: `${BASE_URL}${prefix}/newsroom/${p.slug}`,
      articleSection: copy.categories[p.category],
      author: { "@type": "Organization", name: p.author.name },
    })),
  };
  const breadcrumbLd = {
    "@context": "https://schema.org",
    "@type": "BreadcrumbList",
    itemListElement: [
      { "@type": "ListItem", position: 1, name: "Home", item: `${BASE_URL}${prefix}` },
      { "@type": "ListItem", position: 2, name: copy.breadcrumb, item: `${BASE_URL}${prefix}/newsroom` },
    ],
  };
  const faqLd = {
    "@context": "https://schema.org",
    "@type": "FAQPage",
    mainEntity: copy.faqs.map((f) => ({ "@type": "Question", name: f.question, acceptedAnswer: { "@type": "Answer", text: f.answer } })),
  };

  return (
    <>
      <script type="application/ld+json" dangerouslySetInnerHTML={{ __html: JSON.stringify(collectionLd) }} />
      <script type="application/ld+json" dangerouslySetInnerHTML={{ __html: JSON.stringify(breadcrumbLd) }} />
      <script type="application/ld+json" dangerouslySetInnerHTML={{ __html: JSON.stringify(faqLd) }} />

      <BlogMotion labels={copy.motion} className={ns.page}>
        <NewsroomHero copy={copy} total={posts.length} lead={lead ?? newest} updated={newest ? formatPostDate(newest.publishedAt, locale) : undefined} counts={counts} />
        <LeadSection copy={copy} locale={locale} lead={lead} rest={secondary} />
        <WireSection copy={copy} locale={locale} latest={wire} top={top} />
        <DesksSection copy={copy} desks={desks} />
        <HowSection
          copy={copy}
          stats={[
            { label: copy.statStories, value: posts.length, accent: true },
            { label: copy.statSources, value: publishers },
            { label: copy.statDesks, value: desksWithStories || NEWS_CATEGORY_KEYS.length },
            { label: copy.statUpdated, value: newest ? formatPostDate(newest.publishedAt, locale) : "—" },
          ]}
        />
        <ArchiveSection copy={copy} locale={locale} groups={groups} total={posts.length} tags={tags} />
        <NewsroomFaqSection copy={copy} />
        <NewsGeoFrame>
          <IndiaGeoFooter country={country} locale={locale} pageKey="newsroom" variant="compact" />
        </NewsGeoFrame>
        <FinalCta
          eyebrow={copy.finalEyebrow}
          question={copy.finalQuestion}
          lead={copy.finalLead}
          accent={copy.finalAccent}
          ctaLabel={copy.ctaLabel}
          note={copy.finalNote(AUDIT.minutes)}
          secondary={{ label: copy.wireAll, href: "#archive" }}
          circuitLabel={copy.circuitLabel}
          footer={{ left: "Savin Group", center: copy.footerCenter, backToTop: { label: copy.backToTop, href: "#newsroom-title" } }}
          id="newsroom-final-title"
        />
      </BlogMotion>
    </>
  );
}

export type { NewsCategory, NewsPost };
