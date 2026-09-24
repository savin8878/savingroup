import type { Metadata } from "next";
import { notFound } from "next/navigation";
import { ArrowLeft, ArrowUpRight, Plus } from "lucide-react";
import LocalizedLink from "@/components/LocalizedLink";
import home from "@/components/home/IndustrialHome.module.css";
import blog from "@/components/blog/Blog.module.css";
import { BlogMotion } from "@/components/blog/BlogMotion";
import { BlogFigure } from "@/components/blog/BlogFigures";
import { ProcurementWalkthrough } from "@/components/blog/ProcurementWalkthrough";
import {
  AuthorCard,
  BlogSection,
  Breadcrumbs,
  Callout,
  FinalCta,
  InlineText,
  MetaLine,
  PostGrid,
  PostPager,
  ProseHeading,
  PullQuote,
  SectionHeading,
  TagList,
  Takeaways,
  authorInitials,
  categoryHref,
  formatPostDate,
  getCategoryLabel,
} from "@/components/blog/BlogPrimitives";
import { ArticleToc, type TocItem } from "@/components/blog/article/ArticleToc";
import { ArticleProgress } from "@/components/blog/article/ArticleProgress";
import { ArticleSidebarScroll } from "@/components/blog/article/ArticleSidebarScroll";
import { ArticleShare } from "@/components/blog/article/ArticleShare";
import { ArticleMobileBar } from "@/components/blog/article/ArticleMobileBar";
import { getArticleCopy } from "@/components/blog/copy/article-copy";
import s from "@/components/blog/article/Article.module.css";
import { getTranslation, type Locale } from "@/lib/i18n";
import {
  BASE_URL,
  isIndexable,
} from "@/lib/constants";
import { buildAlternates } from "@/lib/seo";
import {
  BLOG_CATEGORIES,
  getAllBlogPosts,
  getAdjacentPosts,
  getBlogPost,
  getRelatedPosts,
  localizePost,
  slugifyHeading,
  type BlogCategory,
} from "@/lib/blogs";
import { getBlogUi } from "@/lib/blog-i18n";

// ---------------------------------------------------------------------------
// Static params & metadata
// ---------------------------------------------------------------------------

// Posts come from Supabase; re-render at most every 5 minutes so edits show up.
export const revalidate = 300;

export async function generateStaticParams() {
  const BLOG_POSTS = await getAllBlogPosts();
  return BLOG_POSTS.map((p) => ({ slug: p.slug }));
}

export async function generateMetadata({
  params,
}: {
  params: Promise<{ country: string; locale: string; slug: string }>;
}): Promise<Metadata> {
  const { country, locale, slug } = await params;
  const base = getBlogPost(await getAllBlogPosts(), slug);
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
      siteName: "Savin Group",
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

/** English category label — used by the JSON-LD `articleSection` (unchanged). */
function categoryLabel(key: BlogCategory) {
  return BLOG_CATEGORIES.find((c) => c.key === key)?.label ?? key;
}

const pad = (n: number) => String(n).padStart(2, "0");

// ---------------------------------------------------------------------------
// Page
// ---------------------------------------------------------------------------

export default async function BlogDetailPage({
  params,
}: {
  params: Promise<{ country: string; locale: string; slug: string }>;
}) {
  const { country, locale, slug } = await params;
  const BLOG_POSTS = await getAllBlogPosts();
  const base = getBlogPost(BLOG_POSTS, slug);
  if (!base) notFound();
  const loc = locale as Locale;
  const post = localizePost(base, loc);

  const t = getTranslation(loc);
  const ui = getBlogUi(loc);
  const copy = getArticleCopy(locale);
  const prefix = `/${country.toLowerCase()}/${locale.toLowerCase()}`;
  const canonical = `${BASE_URL}${prefix}/blogs/${slug}`;
  const related = getRelatedPosts(BLOG_POSTS, slug, 3).map((p) => localizePost(p, loc));
  const adj = getAdjacentPosts(BLOG_POSTS, slug);
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
      name: "Savin Group",
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

  // ---------- Derived display data ----------
  const category = getCategoryLabel(ui, post.category);
  const published = formatPostDate(post.publishedAt, locale);
  const updated = post.updatedAt && post.updatedAt !== post.publishedAt ? formatPostDate(post.updatedAt, locale) : null;
  const hasFaq = Boolean(post.faq && post.faq.length > 0);
  const tocItems: TocItem[] = [
    ...post.sections.map((section) => ({ id: slugifyHeading(section.heading), label: section.heading })),
    ...(hasFaq ? [{ id: "faq", label: copy.faqLabel }] : []),
  ];
  let figureNumber = 1;

  return (
    <BlogMotion skipTo="#article-body" skipLabel={ui.onThisPage}>
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

      <div className={s.page}>
        {/* ============================================================ */}
        {/* Hero                                                          */}
        {/* ============================================================ */}
        <header className={blog.articleHero} data-blog-scene="">
          <div className={home.container}>
            <div className={s.heroTop}>
              <Breadcrumbs
                label={ui.breadcrumb}
                items={[
                  { label: t.nav.home, href: "/" },
                  { label: ui.breadcrumb, href: "/blogs" },
                  { label: category, href: categoryHref(post.category) },
                  { label: post.title },
                ]}
              />
              <LocalizedLink href="/blogs" className={s.backLink}>
                <ArrowLeft size={12} aria-hidden="true" />
                {ui.allPostsBackLink}
              </LocalizedLink>
            </div>

            <div className={blog.articleHeroGrid}>
              <div>
                <MetaLine
                  category={category}
                  date={published}
                  dateTime={post.publishedAt}
                  readTime={ui.readTime(post.readTime)}
                  updated={updated ? <>{ui.updatedOn} <time dateTime={post.updatedAt}>{updated}</time></> : undefined}
                />
                <h1 className={blog.articleTitle} data-length={post.title.length > 64 ? "long" : undefined}>{post.title}</h1>
                {post.subtitle && <p className={blog.articleSubtitle}>{post.subtitle}</p>}
                <div className={blog.byline}>
                  <span className={`${blog.avatar} ${s.bylineAvatar}`} aria-hidden="true">{authorInitials(post.author.name)}</span>
                  <div>
                    <strong>{post.author.name}</strong>
                    <span>{post.author.role}</span>
                  </div>
                </div>
              </div>
              <div className={s.heroFigure}>
                <BlogFigure sketch={post.heroSketch} number={figureNumber++} legend={[category, ui.readTime(post.readTime), post.keywords.primary]} />
              </div>
            </div>

            <dl className={s.facts}>
              <div className={s.fact}><dt>{copy.published}</dt><dd><strong><time dateTime={post.publishedAt}>{published}</time></strong></dd></div>
              <div className={s.fact}><dt>{ui.readTime(post.readTime)}</dt><dd><strong>{wordCount.toLocaleString(locale === "hi" ? "hi-IN" : "en-US")}<small>{copy.words}</small></strong></dd></div>
              <div className={s.fact}><dt>{copy.sections}</dt><dd><strong>{pad(post.sections.length)}</strong></dd></div>
              <div className={s.fact}><dt>{ui.primaryKeyword}</dt><dd><strong>{post.keywords.primary}</strong></dd></div>
            </dl>
          </div>
        </header>

        {/* ============================================================ */}
        {/* Body: article column + right sticky sidebar                   */}
        {/* ============================================================ */}
        <div className={s.body}>
          <div className={`${home.container} ${s.grid}`}>
            <ArticleMobileBar items={tocItems} title={ui.onThisPage} locale={locale} />

            <article id="article-body" className={s.main} data-article-body="" aria-label={post.title}>
              {post.excerpt && <p className={s.lede}>{post.excerpt}</p>}

              {post.takeaways.length > 0 && (
                <Takeaways
                  id="key-takeaways"
                  className={s.takeaways}
                  label={ui.tldr}
                  title={ui.keyTakeaways}
                  items={post.takeaways}
                />
              )}

              <div className={blog.prose}>
                {post.sections.map((section, i) => {
                  const id = slugifyHeading(section.heading);
                  return (
                    <section key={id} id={id} className={blog.proseSection} aria-labelledby={`${id}-title`}>
                      <ProseHeading id={`${id}-title`} number={i + 1}>{section.heading}</ProseHeading>
                      {section.paragraphs.map((paragraph, pi) => (
                        <p key={pi}><InlineText text={paragraph} /></p>
                      ))}
                      {section.bullets && section.bullets.length > 0 && (
                        <ul>
                          {section.bullets.map((bullet, bi) => <li key={bi}><InlineText text={bullet} /></li>)}
                        </ul>
                      )}
                      {section.pullQuote && (
                        <PullQuote cite={`${post.author.name} · ${post.author.role}`}>{section.pullQuote}</PullQuote>
                      )}
                      {section.callout && (
                        <Callout label={section.callout.title}>
                          <p><InlineText text={section.callout.body} /></p>
                        </Callout>
                      )}
                      {section.embed === "procurement" && (
                        <div className={s.embed} data-embed="">
                          <ProcurementWalkthrough figure={`FIG. ${pad(++figureNumber)}`} id={`${id}-walkthrough`} />
                        </div>
                      )}
                    </section>
                  );
                })}
              </div>

              <p className={s.endRule}>
                {ui.endOfPost} · {ui.readTime(post.readTime)} · {ui.wordsCount(wordCount)}
              </p>

              {/* What this post is for — keyword targeting */}
              <section className={s.block} aria-labelledby="post-keywords">
                <div className={s.blockLabel} id="post-keywords"><i aria-hidden="true" />{ui.whatThisPostIsFor}</div>
                <div className={s.keywords}>
                  <div>
                    <h3>{ui.primaryKeyword}</h3>
                    <strong>{post.keywords.primary}</strong>
                    <p>~{post.keywords.searchVolume.toLocaleString()} {ui.monthlySearchesLabel}</p>
                  </div>
                  <div>
                    <h3>{ui.alsoAnswers}</h3>
                    <ul>{post.keywords.secondary.map((kw) => <li key={kw}>{kw}</li>)}</ul>
                  </div>
                </div>
              </section>

              {/* Cross-page internal links */}
              {post.crossPageLinks && post.crossPageLinks.length > 0 && (
                <section className={s.block} aria-labelledby="post-next-step">
                  <div className={s.blockLabel} id="post-next-step"><i aria-hidden="true" />{ui.takeNextStep}</div>
                  <ul className={s.links}>
                    {post.crossPageLinks.map((link) => (
                      <li key={link.href}>
                        <LocalizedLink href={link.href}>
                          <strong>{link.label}</strong>
                          <span>{link.note}</span>
                          <ArrowUpRight size={17} aria-hidden="true" />
                        </LocalizedLink>
                      </li>
                    ))}
                  </ul>
                </section>
              )}

              {post.tags.length > 0 && (
                <div className={s.block}>
                  <div className={s.blockLabel}><i aria-hidden="true" />{ui.tags}</div>
                  <TagList tags={post.tags.map((tag) => `#${tag}`)} label={ui.tags} />
                </div>
              )}

              <AuthorCard
                className={s.authorBlock}
                label={ui.writtenBy}
                name={post.author.name}
                role={post.author.role}
                bio={post.author.bio}
                action={
                  <div className={s.authorActions}>
                    <LocalizedLink href="/contact" className={home.textButton}>{ui.authorBookAudit}<ArrowUpRight size={15} aria-hidden="true" /></LocalizedLink>
                    <LocalizedLink href="/about" className={home.textButton}>{ui.authorReadStory}<ArrowUpRight size={15} aria-hidden="true" /></LocalizedLink>
                  </div>
                }
              />
            </article>

            {/* ---------- Right sticky sidebar ---------- */}
            <aside className={s.aside} aria-label={ui.onThisPage}>
              <div className={s.sticky}>
                <ArticleProgress locale={locale} readTime={post.readTime} />
                <ArticleSidebarScroll className={s.stickyScroll}>
                  <ArticleToc items={tocItems} title={ui.onThisPage} />

                  <div className={s.panel}>
                    <div className={s.panelHead}><span>{ui.share}</span></div>
                    <ArticleShare url={canonical} title={post.title} locale={locale} label={ui.share} />
                  </div>

                  <div className={`${s.panel} ${s.ctaPanel}`}>
                    <div className={s.cta}>
                      <strong>{copy.ctaTitle}</strong>
                      <p>{copy.ctaBody}</p>
                      <LocalizedLink href="/contact" className={home.primaryButton}>{ui.bookAudit}<ArrowUpRight size={17} aria-hidden="true" /></LocalizedLink>
                    </div>
                  </div>
                </ArticleSidebarScroll>
              </div>
            </aside>
          </div>
        </div>

        {/* ============================================================ */}
        {/* FAQ                                                           */}
        {/* ============================================================ */}
        {hasFaq && (
          <BlogSection tone="surface" id="faq" labelledBy="faq-title">
            <div className={s.faqGrid}>
              <div>
                <SectionHeading number={post.sections.length + 1} label={ui.frequentlyAsked} lead={ui.faqIntro} id="faq-title" />
                <p className={s.faqIntro}>{post.excerpt}</p>
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

        {/* ============================================================ */}
        {/* Keep reading                                                  */}
        {/* ============================================================ */}
        <BlogSection id="keep-reading" labelledBy="keep-reading-title">
          <SectionHeading number={hasFaq ? post.sections.length + 2 : post.sections.length + 1} label={ui.keepReading} lead={ui.readNext} id="keep-reading-title" />
          <PostPager prev={prev} next={next} ui={ui} className={`${s.pagerWrap} ${prev && next ? "" : s.pagerSingle}`} />
          {related.length > 0 && <PostGrid posts={related} ui={ui} locale={locale} />}
        </BlogSection>

        <FinalCta
          id="article-final-title"
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
