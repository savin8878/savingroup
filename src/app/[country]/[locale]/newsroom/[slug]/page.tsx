import type { Metadata } from "next";
import { notFound } from "next/navigation";
import { ArrowLeft, ArrowUpRight, ExternalLink, Plus } from "lucide-react";
import LocalizedLink from "@/components/LocalizedLink";
import home from "@/components/home/IndustrialHome.module.css";
import blog from "@/components/blog/Blog.module.css";
import s from "@/components/blog/article/Article.module.css";
import ns from "@/components/newsroom/Newsroom.module.css";
import { BlogMotion } from "@/components/blog/BlogMotion";
import { BlogFigure } from "@/components/blog/BlogFigures";
import {
  AuthorCard, BlogSection, Breadcrumbs, Callout, FinalCta, InlineText, MetaLine, ProseHeading, PullQuote, SectionHeading, TagList, Takeaways,
  authorInitials, formatPostDate,
} from "@/components/blog/BlogPrimitives";
import { ArticleToc, type TocItem } from "@/components/blog/article/ArticleToc";
import { ArticleProgress } from "@/components/blog/article/ArticleProgress";
import { ArticleSidebarScroll } from "@/components/blog/article/ArticleSidebarScroll";
import { ArticleShare } from "@/components/blog/article/ArticleShare";
import { ArticleMobileBar } from "@/components/blog/article/ArticleMobileBar";
import { getTranslation, type Locale } from "@/lib/i18n";
import { BASE_URL, isIndexable } from "@/lib/constants";
import { buildAlternates } from "@/lib/seo";
import { slugifyHeading } from "@/lib/blogs";
import { getAdjacentNews, getAllNewsPosts, getNewsPost, getRelatedNews, localizeNewsPost } from "@/lib/news";
import { getNewsroomCopy } from "@/components/newsroom/copy/newsroom-copy";
import { NewsGrid, NewsPager, deskHref, deskLabel } from "@/components/newsroom/NewsPrimitives";

// Stories come from Supabase; re-render at most every 5 minutes (instantly via the revalidate hook).
export const revalidate = 300;

export async function generateStaticParams() {
  const posts = await getAllNewsPosts();
  return posts.map((p) => ({ slug: p.slug }));
}

export async function generateMetadata({ params }: { params: Promise<{ country: string; locale: string; slug: string }> }): Promise<Metadata> {
  const { country, locale, slug } = await params;
  const base = getNewsPost(await getAllNewsPosts(), slug);
  if (!base) return { title: "Story not found" };
  const post = localizeNewsPost(base, locale as Locale);
  const copy = getNewsroomCopy(locale);
  const alternates = buildAlternates({ country, locale, subPath: `newsroom/${slug}` });
  const canonical = `${BASE_URL}${alternates.canonical}`;
  const description = post.excerpt || post.dek;
  return {
    title: post.title,
    description,
    keywords: [post.keywords.primary, ...post.keywords.secondary, ...post.tags],
    authors: [{ name: post.author.name, url: `${BASE_URL}/${country}/${locale}/newsroom` }],
    alternates,
    openGraph: {
      title: post.title, description, url: canonical, siteName: "Savin Group", type: "article",
      publishedTime: post.publishedAt, modifiedTime: post.updatedAt ?? post.publishedAt, authors: [post.author.name],
      section: copy.categories[post.category], tags: [post.keywords.primary, ...post.keywords.secondary, ...post.tags],
      locale: `${locale}_${country.toUpperCase()}`,
      images: [{ url: `${BASE_URL}/og.png`, width: 1200, height: 630, alt: post.title }],
    },
    twitter: { card: "summary_large_image", title: post.title, description, images: [`${BASE_URL}/og.png`] },
    robots: isIndexable(country, locale)
      ? { index: true, follow: true, googleBot: { index: true, follow: true, "max-snippet": -1, "max-image-preview": "large", "max-video-preview": -1 } }
      : { index: false, follow: true, googleBot: { index: false, follow: true } },
    other: {
      "article:published_time": post.publishedAt,
      "article:modified_time": post.updatedAt ?? post.publishedAt,
      "article:section": post.category,
      "article:tag": [post.keywords.primary, ...post.keywords.secondary].join(","),
    },
  };
}

const pad = (n: number) => String(n).padStart(2, "0");
const isAnalysisHeading = (heading: string) => /what it means|our read|savin group take|for indian operators/i.test(heading);

export default async function NewsStoryPage({ params }: { params: Promise<{ country: string; locale: string; slug: string }> }) {
  const { country, locale, slug } = await params;
  const ALL = await getAllNewsPosts();
  const base = getNewsPost(ALL, slug);
  if (!base) notFound();
  const loc = locale as Locale;
  const post = localizeNewsPost(base, loc);
  const t = getTranslation(loc);
  const copy = getNewsroomCopy(locale);
  const prefix = `/${country.toLowerCase()}/${locale.toLowerCase()}`;
  const canonical = `${BASE_URL}${prefix}/newsroom/${slug}`;
  const related = getRelatedNews(ALL, slug, 3).map((p) => localizeNewsPost(p, loc));
  const adj = getAdjacentNews(ALL, slug);
  const prev = adj.prev ? localizeNewsPost(adj.prev, loc) : null;
  const next = adj.next ? localizeNewsPost(adj.next, loc) : null;
  const desk = deskLabel(copy, post.category);
  const published = formatPostDate(post.publishedAt, locale);
  const updated = post.updatedAt && post.updatedAt !== post.publishedAt ? formatPostDate(post.updatedAt, locale) : null;
  const wordCount = post.sections.reduce((sum, sec) => sum + sec.paragraphs.join(" ").split(/\s+/).length, 0);
  const hasFaq = Boolean(post.faq && post.faq.length > 0);
  const tocItems: TocItem[] = [
    ...post.sections.map((section) => ({ id: slugifyHeading(section.heading), label: section.heading })),
    ...(post.sources.length > 0 ? [{ id: "sources", label: copy.sources }] : []),
    ...(hasFaq ? [{ id: "faq", label: copy.faqLabel }] : []),
  ];
  const isOrg = /newsroom|desk|team/i.test(post.author.name);

  // ---------- JSON-LD ----------
  const articleLd = {
    "@context": "https://schema.org",
    "@type": "NewsArticle",
    "@id": canonical,
    headline: post.title,
    alternativeHeadline: post.dek,
    description: post.excerpt,
    image: [`${BASE_URL}/og.png`],
    datePublished: post.publishedAt,
    dateModified: post.updatedAt ?? post.publishedAt,
    wordCount,
    timeRequired: `PT${post.readTime}M`,
    inLanguage: locale,
    articleSection: desk,
    keywords: [post.keywords.primary, ...post.keywords.secondary, ...post.tags].join(", "),
    author: isOrg ? { "@type": "Organization", name: post.author.name, url: `${BASE_URL}${prefix}/newsroom` } : { "@type": "Person", name: post.author.name, jobTitle: post.author.role, url: `${BASE_URL}${prefix}/about` },
    publisher: { "@type": "Organization", name: "Savin Group", url: BASE_URL, logo: { "@type": "ImageObject", url: `${BASE_URL}/og.png` } },
    mainEntityOfPage: { "@type": "WebPage", "@id": canonical },
    isPartOf: { "@type": "CollectionPage", "@id": `${BASE_URL}${prefix}/newsroom` },
    ...(post.sources.length ? { citation: post.sources.map((src) => ({ "@type": "CreativeWork", name: src.title, url: src.url, publisher: src.publisher })) } : {}),
  };
  const breadcrumbLd = {
    "@context": "https://schema.org",
    "@type": "BreadcrumbList",
    itemListElement: [
      { "@type": "ListItem", position: 1, name: "Home", item: `${BASE_URL}${prefix}` },
      { "@type": "ListItem", position: 2, name: copy.breadcrumb, item: `${BASE_URL}${prefix}/newsroom` },
      { "@type": "ListItem", position: 3, name: desk, item: `${BASE_URL}${prefix}/newsroom/category/${post.category}` },
      { "@type": "ListItem", position: 4, name: post.title, item: canonical },
    ],
  };
  const faqLd = hasFaq && {
    "@context": "https://schema.org",
    "@type": "FAQPage",
    mainEntity: post.faq!.map((f) => ({ "@type": "Question", name: f.question, acceptedAnswer: { "@type": "Answer", text: f.answer } })),
  };

  let figureNumber = 1;
  let chapter = post.sections.length;

  return (
    <BlogMotion skipTo="#article-body" skipLabel={copy.onThisPage} labels={copy.motion} className={ns.page}>
      <script type="application/ld+json" dangerouslySetInnerHTML={{ __html: JSON.stringify(articleLd) }} />
      <script type="application/ld+json" dangerouslySetInnerHTML={{ __html: JSON.stringify(breadcrumbLd) }} />
      {faqLd && <script type="application/ld+json" dangerouslySetInnerHTML={{ __html: JSON.stringify(faqLd) }} />}

      <div className={s.page}>
        {/* Hero */}
        <header className={blog.articleHero} data-blog-scene="">
          <div className={home.container}>
            <div className={s.heroTop}>
              <Breadcrumbs
                label={copy.breadcrumbAria}
                items={[{ label: t.nav.home, href: "/" }, { label: copy.breadcrumb, href: "/newsroom" }, { label: desk, href: deskHref(post.category) }, { label: post.title }]}
              />
              <LocalizedLink href="/newsroom" className={s.backLink}><ArrowLeft size={12} aria-hidden="true" />{copy.allStories}</LocalizedLink>
            </div>
            <div className={blog.articleHeroGrid}>
              <div>
                <MetaLine
                  category={desk}
                  date={published}
                  dateTime={post.publishedAt}
                  readTime={copy.readTime(post.readTime)}
                  updated={updated ? <>{copy.updated} <time dateTime={post.updatedAt}>{updated}</time></> : undefined}
                />
                <h1 className={blog.articleTitle} data-length={post.title.length > 64 ? "long" : undefined}>{post.title}</h1>
                {post.dek && <p className={blog.articleSubtitle}>{post.dek}</p>}
                <div className={blog.byline}>
                  <span className={`${blog.avatar} ${s.bylineAvatar}`} aria-hidden="true">{authorInitials(post.author.name)}</span>
                  <div><strong>{post.author.name}</strong><span>{post.author.role}</span></div>
                </div>
              </div>
              <div className={s.heroFigure}>
                <BlogFigure sketch={post.heroSketch} number={figureNumber++} legend={[desk, copy.readTime(post.readTime), post.sources[0]?.publisher ?? copy.breadcrumb]} />
              </div>
            </div>
            <dl className={s.facts}>
              <div className={s.fact}><dt>{copy.published}</dt><dd><strong><time dateTime={post.publishedAt}>{published}</time></strong></dd></div>
              <div className={s.fact}><dt>{copy.readTime(post.readTime)}</dt><dd><strong>{wordCount.toLocaleString(locale === "hi" ? "hi-IN" : "en-US")}<small>{copy.words}</small></strong></dd></div>
              <div className={s.fact}><dt>{copy.sources}</dt><dd><strong>{pad(post.sources.length)}</strong></dd></div>
              <div className={s.fact}><dt>{copy.desk}</dt><dd><strong>{desk}</strong></dd></div>
            </dl>
          </div>
        </header>

        {/* Body */}
        <div className={s.body}>
          <div className={`${home.container} ${s.grid}`}>
            <ArticleMobileBar items={tocItems} title={copy.onThisPage} locale={locale} />

            <article id="article-body" className={s.main} data-article-body="" aria-label={post.title}>
              {post.excerpt && <p className={s.lede}>{post.excerpt}</p>}

              {post.takeaways.length > 0 && (
                <Takeaways id="operator-briefing" className={`${s.takeaways} ${ns.briefing}`} label={copy.whatItMeansLabel} title={copy.whatItMeans} items={post.takeaways} />
              )}

              <div className={blog.prose}>
                {post.sections.map((section, i) => {
                  const id = slugifyHeading(section.heading);
                  const analysis = isAnalysisHeading(section.heading);
                  return (
                    <section key={id} id={id} className={`${blog.proseSection}${analysis ? ` ${ns.analysis}` : ""}`} aria-labelledby={`${id}-title`}>
                      <ProseHeading id={`${id}-title`} number={i + 1}>{section.heading}</ProseHeading>
                      {section.paragraphs.map((paragraph, pi) => <p key={pi}><InlineText text={paragraph} /></p>)}
                      {section.bullets && section.bullets.length > 0 && (
                        <ul>{section.bullets.map((bullet, bi) => <li key={bi}><InlineText text={bullet} /></li>)}</ul>
                      )}
                      {section.pullQuote && <PullQuote cite={`${post.author.name} · ${post.author.role}`}>{section.pullQuote}</PullQuote>}
                      {section.callout && (
                        <Callout label={section.callout.title}><p><InlineText text={section.callout.body} /></p></Callout>
                      )}
                    </section>
                  );
                })}
              </div>

              <p className={s.endRule}>{copy.endOfStory} · {copy.readTime(post.readTime)} · {copy.wordsCount(wordCount)}</p>

              {post.sources.length > 0 && (
                <section className={s.block} id="sources" aria-labelledby="sources-label">
                  <div className={s.blockLabel} id="sources-label"><i aria-hidden="true" />{copy.sources}</div>
                  <p className={ns.sourcesIntro}>{copy.sourcesIntro}</p>
                  <ol className={ns.sources}>
                    {post.sources.map((src, i) => (
                      <li key={src.url}>
                        <a href={src.url} target="_blank" rel="noopener noreferrer nofollow">
                          <span aria-hidden="true">{pad(i + 1)}</span>
                          <span><strong>{src.title}</strong><small>{src.publisher || copy.originalReport}</small></span>
                          <ExternalLink size={15} aria-hidden="true" />
                        </a>
                      </li>
                    ))}
                  </ol>
                </section>
              )}

              {post.tags.length > 0 && (
                <div className={s.block}>
                  <div className={s.blockLabel}><i aria-hidden="true" />{copy.tags}</div>
                  <TagList tags={post.tags.map((tag) => `#${tag}`)} label={copy.tags} />
                </div>
              )}

              <AuthorCard
                className={s.authorBlock}
                label={copy.reportedBy}
                name={post.author.name}
                role={post.author.role}
                bio={post.author.bio}
                action={
                  <div className={s.authorActions}>
                    <LocalizedLink href="/contact" className={home.textButton}>{copy.bookAudit}<ArrowUpRight size={15} aria-hidden="true" /></LocalizedLink>
                    <LocalizedLink href="/newsroom" className={home.textButton}>{copy.allStories}<ArrowUpRight size={15} aria-hidden="true" /></LocalizedLink>
                  </div>
                }
              />
            </article>

            <aside className={s.aside} aria-label={copy.onThisPage}>
              <div className={s.sticky}>
                <ArticleProgress locale={locale} readTime={post.readTime} />
                <ArticleSidebarScroll className={s.stickyScroll}>
                  <ArticleToc items={tocItems} title={copy.onThisPage} />
                  <div className={s.panel}>
                    <div className={s.panelHead}><span>{copy.share}</span></div>
                    <ArticleShare url={canonical} title={post.title} locale={locale} label={copy.share} />
                  </div>
                  <div className={`${s.panel} ${s.ctaPanel}`}>
                    <div className={s.cta}>
                      <strong>{copy.ctaTitle}</strong>
                      <p>{copy.ctaBody}</p>
                      <LocalizedLink href="/contact" className={home.primaryButton}>{copy.bookAudit}<ArrowUpRight size={17} aria-hidden="true" /></LocalizedLink>
                    </div>
                  </div>
                </ArticleSidebarScroll>
              </div>
            </aside>
          </div>
        </div>

        {hasFaq && (
          <BlogSection tone="surface" id="faq" labelledBy="faq-title">
            <div className={s.faqGrid}>
              <div>
                <SectionHeading number={++chapter} label={copy.faqLabel} lead={copy.storyFaqLead} id="faq-title" />
                <p className={s.faqIntro}>{post.dek || post.excerpt}</p>
              </div>
              <div className={`${home.faqList} ${s.faqList}`}>
                {post.faq!.map((f, i) => (
                  <details key={i} open={i === 0}>
                    <summary>{f.question}<Plus size={18} aria-hidden="true" /></summary>
                    <p>{f.answer}</p>
                  </details>
                ))}
              </div>
            </div>
          </BlogSection>
        )}

        <BlogSection id="keep-reading" labelledBy="keep-reading-title">
          <SectionHeading number={++chapter} label={copy.keepReading} lead={copy.readNext} id="keep-reading-title" />
          <NewsPager prev={prev} next={next} copy={copy} className={`${s.pagerWrap} ${prev && next ? "" : s.pagerSingle}`} />
          {related.length > 0 && <NewsGrid posts={related} copy={copy} locale={locale} />}
        </BlogSection>

        <FinalCta
          id="story-final-title"
          eyebrow={t.cta.eyebrow}
          question={t.cta.subtitle}
          lead={t.cta.title}
          accent=""
          ctaLabel={t.cta.primary}
          secondary={{ label: t.cta.secondary, href: "/case-studies" }}
          note={t.cta.trustNote}
        />
      </div>
    </BlogMotion>
  );
}
