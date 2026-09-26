import type { Metadata } from "next";
import { notFound } from "next/navigation";
import { ArrowDown, ArrowLeft, ArrowUpRight } from "lucide-react";
import LocalizedLink from "@/components/LocalizedLink";
import home from "@/components/home/IndustrialHome.module.css";
import blog from "@/components/blog/Blog.module.css";
import cat from "@/components/blog/category/Category.module.css";
import ns from "@/components/newsroom/Newsroom.module.css";
import { BlogMotion } from "@/components/blog/BlogMotion";
import { BlogFigure } from "@/components/blog/BlogFigures";
import { BlogEyebrow, BlogSection, Breadcrumbs, FinalCta, SectionHeading, TagList, formatPostDate } from "@/components/blog/BlogPrimitives";
import { IndiaGeoFooter } from "@/components/sections/IndiaGeoFooter";
import { getTranslation, type Locale } from "@/lib/i18n";
import { BASE_URL, isIndexable } from "@/lib/constants";
import { buildAlternates } from "@/lib/seo";
import { AUDIT, CTA_LABEL } from "@/lib/offer";
import { NEWS_CATEGORY_KEYS, NEWS_CATEGORY_SKETCH, getAllNewsPosts, getLeadStory, getNewsByCategory, localizeNewsPost, type NewsCategory } from "@/lib/news";
import { getNewsroomCopy } from "@/components/newsroom/copy/newsroom-copy";
import { DeskNav, NewsCard, NewsGrid, deskLabel } from "@/components/newsroom/NewsPrimitives";
import { DesksSection, NewsGeoFrame, type DeskView } from "@/components/newsroom/NewsroomSections";

export const revalidate = 300;

export async function generateStaticParams() {
  return NEWS_CATEGORY_KEYS.map((category) => ({ category }));
}

const isDesk = (v: string): v is NewsCategory => (NEWS_CATEGORY_KEYS as readonly string[]).includes(v);

export async function generateMetadata({ params }: { params: Promise<{ country: string; locale: string; category: string }> }): Promise<Metadata> {
  const { country, locale, category } = await params;
  if (!isDesk(category)) return { title: "Desk not found" };
  const copy = getNewsroomCopy(locale).desks[category];
  const alternates = buildAlternates({ country, locale, subPath: `newsroom/category/${category}` });
  const canonical = `${BASE_URL}${alternates.canonical}`;
  return {
    title: copy.metaTitle,
    description: copy.metaDescription,
    keywords: copy.keywords,
    alternates,
    openGraph: {
      title: copy.metaTitle, description: copy.metaDescription, url: canonical, siteName: "Savin Group", type: "website",
      locale: `${locale}_${country.toUpperCase()}`,
      images: [{ url: `${BASE_URL}/og.png`, width: 1200, height: 630, alt: copy.metaTitle }],
    },
    twitter: { card: "summary_large_image", title: copy.metaTitle, description: copy.metaDescription, images: [`${BASE_URL}/og.png`] },
    robots: isIndexable(country, locale)
      ? { index: true, follow: true, googleBot: { index: true, follow: true, "max-snippet": -1, "max-image-preview": "large", "max-video-preview": -1 } }
      : { index: false, follow: true, googleBot: { index: false, follow: true } },
  };
}

export default async function NewsDeskPage({ params }: { params: Promise<{ country: string; locale: string; category: string }> }) {
  const { country, locale, category } = await params;
  if (!isDesk(category)) notFound();
  const loc = locale as Locale;
  const t = getTranslation(loc);
  const copy = getNewsroomCopy(locale);
  const desk = copy.desks[category];
  const label = deskLabel(copy, category);
  const prefix = `/${country.toLowerCase()}/${locale.toLowerCase()}`;
  const canonical = `${BASE_URL}${prefix}/newsroom/category/${category}`;

  const ALL = await getAllNewsPosts();
  const onDesk = getNewsByCategory(ALL, category);
  const leadBase = getLeadStory(onDesk);
  const lead = leadBase ? localizeNewsPost(leadBase, loc) : undefined;
  const rest = onDesk.filter((p) => p.slug !== lead?.slug).map((p) => localizeNewsPost(p, loc));
  const counts: Partial<Record<NewsCategory | "all", number>> = { all: ALL.length };
  for (const key of NEWS_CATEGORY_KEYS) counts[key] = getNewsByCategory(ALL, key).length;
  const otherDesks: DeskView[] = NEWS_CATEGORY_KEYS.filter((key) => key !== category).map((key) => {
    const posts = getNewsByCategory(ALL, key);
    return { key, count: posts.length, latest: posts[0] ? localizeNewsPost(posts[0], loc) : undefined };
  });
  const totalRead = onDesk.reduce((sum, p) => sum + p.readTime, 0);
  const publishers = new Set(onDesk.flatMap((p) => p.sources.map((s) => s.publisher.toLowerCase()).filter(Boolean))).size;
  const latest = onDesk[0];

  const collectionLd = {
    "@context": "https://schema.org",
    "@type": "CollectionPage",
    "@id": canonical,
    name: desk.metaTitle,
    description: desk.metaDescription,
    url: canonical,
    inLanguage: locale,
    isPartOf: { "@type": "CollectionPage", "@id": `${BASE_URL}${prefix}/newsroom`, name: "Savin Group Newsroom" },
    about: desk.keywords.map((k) => ({ "@type": "Thing", name: k })),
    hasPart: onDesk.slice(0, 30).map((p) => ({
      "@type": "NewsArticle", headline: p.title, url: `${BASE_URL}${prefix}/newsroom/${p.slug}`,
      datePublished: p.publishedAt, dateModified: p.updatedAt ?? p.publishedAt, author: { "@type": "Organization", name: p.author.name },
    })),
  };
  const breadcrumbLd = {
    "@context": "https://schema.org",
    "@type": "BreadcrumbList",
    itemListElement: [
      { "@type": "ListItem", position: 1, name: "Home", item: `${BASE_URL}${prefix}` },
      { "@type": "ListItem", position: 2, name: copy.breadcrumb, item: `${BASE_URL}${prefix}/newsroom` },
      { "@type": "ListItem", position: 3, name: label, item: canonical },
    ],
  };
  const [allLead, allAccent] = copy.deskAllTitle(onDesk.length, label);

  return (
    <>
      <script type="application/ld+json" dangerouslySetInnerHTML={{ __html: JSON.stringify(collectionLd) }} />
      <script type="application/ld+json" dangerouslySetInnerHTML={{ __html: JSON.stringify(breadcrumbLd) }} />

      <BlogMotion labels={copy.motion} className={`${ns.page} ${cat.page}`}>
        <section className={`${blog.hero} ${cat.hero}`} id="desk-hero" aria-labelledby="desk-title">
          <div className={home.container}>
            <div className={cat.topbar}>
              <Breadcrumbs items={[{ label: copy.home, href: "/" }, { label: copy.breadcrumb, href: "/newsroom" }, { label }]} label={copy.breadcrumbAria} />
              <LocalizedLink href="/newsroom" className={cat.back}><ArrowLeft size={12} aria-hidden="true" />{copy.allStories}</LocalizedLink>
            </div>
            <BlogEyebrow edition={copy.storiesIn(onDesk.length, label)}>{copy.breadcrumb} · {label}</BlogEyebrow>
            <div className={`${blog.heroGrid} ${cat.heroGrid}`}>
              <div className={`${blog.heroCopy} ${cat.heroCopy}`}>
                <h1 id="desk-title" className={cat.title}><span>{desk.headline}</span><em>{desk.accent}</em></h1>
                <p className={`${blog.heroLead} ${cat.lead} ${cat.bidi}`}>{desk.description}</p>
                <div className={blog.heroActions}>
                  <a href="#desk-stories" className={home.textButton}>{copy.deskLead}<ArrowDown size={16} aria-hidden="true" /></a>
                </div>
              </div>
              <div className={blog.heroVisual}>
                <BlogFigure sketch={NEWS_CATEGORY_SKETCH[category]} number="FIG. 00" title={label} legend={[label, copy.deskCount(onDesk.length), copy.breadcrumb]} />
              </div>
            </div>
            <dl className={`${blog.stats} ${cat.stats}`}>
              <div className={blog.stat}><dt className={cat.statLabel}>{copy.statStories}</dt><dd className={cat.statValue}>{onDesk.length}</dd></div>
              <div className={blog.stat}><dt className={cat.statLabel}>{copy.statReading}</dt><dd className={cat.statValue}>{totalRead}<small>{copy.minRead}</small></dd></div>
              <div className={blog.stat}><dt className={cat.statLabel}>{copy.statLatest}</dt><dd className={cat.statValue}>{latest ? <time dateTime={latest.publishedAt}>{formatPostDate(latest.publishedAt, locale)}</time> : "—"}</dd></div>
              <div className={blog.stat}><dt className={cat.statLabel}>{copy.statPublishers}</dt><dd className={cat.statValue}>{publishers}</dd></div>
            </dl>
            <div className={cat.answers}>
              <span className={cat.answersLabel}><i aria-hidden="true" />{copy.deskAnswers}</span>
              <TagList tags={desk.keywords} label={copy.deskAnswers} />
            </div>
          </div>
        </section>

        <BlogSection id="desk-stories" labelledBy="desk-stories-title" className={cat.posts}>
          <SectionHeading className={cat.head} number={1} label={copy.deskAllEyebrow} lead={allLead} accent={allAccent} id="desk-stories-title" intro={copy.deskIntro} />
          <DeskNav copy={copy} active={category} counts={counts} className={cat.nav} />
          {lead ? (
            <>
              <div className={cat.leadPost}>
                <NewsCard post={lead} copy={copy} locale={locale} variant="feature" index={1} kicker={copy.leadKicker} />
              </div>
              {rest.length > 0 && <NewsGrid posts={rest} copy={copy} locale={locale} variant="row" startIndex={2} headingLevel={3} label={copy.deskAllEyebrow} />}
            </>
          ) : (
            <p className={cat.empty}>{copy.deskEmpty}</p>
          )}
        </BlogSection>

        <BlogSection tone="surface" id="other-desks" labelledBy="other-desks-title">
          <SectionHeading
            number={2}
            label={copy.otherDesks}
            lead={copy.otherDesksTitle}
            accent={copy.otherDesksAccent}
            id="other-desks-title"
            action={<LocalizedLink href="/newsroom" className={home.textButton}>{copy.allStories}<ArrowUpRight size={16} className={blog.arrow} aria-hidden="true" /></LocalizedLink>}
          />
          <DesksSection copy={copy} desks={otherDesks} embedded />
        </BlogSection>

        <NewsGeoFrame>
          <IndiaGeoFooter country={country} locale={locale} pageKey="newsroom" variant="compact" />
        </NewsGeoFrame>

        <FinalCta
          id="desk-final-title"
          className={cat.finalCta}
          eyebrow={t.cta.eyebrow}
          question={t.cta.subtitle}
          lead={copy.finalLead}
          accent={copy.finalAccent}
          ctaLabel={CTA_LABEL}
          ctaHref="/contact"
          note={AUDIT.supportLine}
          secondary={{ label: t.cta.secondary, href: "/case-studies" }}
          circuitLabel={copy.circuitLabel}
          footer={{ left: "Savin Group", center: copy.footerCenter, backToTop: { label: copy.backToTop, href: "#desk-hero" } }}
        />
      </BlogMotion>
    </>
  );
}
