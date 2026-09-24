import type { CSSProperties, ReactNode } from "react";
import { ArrowDown, ArrowUpRight, Plus } from "lucide-react";
import LocalizedLink from "@/components/LocalizedLink";
import home from "@/components/home/IndustrialHome.module.css";
import type { BlogCategory, BlogPost } from "@/lib/blogs";
import type { BlogUiStrings } from "@/lib/blog-i18n";
import blog from "../Blog.module.css";
import { BlogFigure } from "../BlogFigures";
import {
  AuthorCard, BlogEyebrow, BlogSection, Breadcrumbs, Chapter, MetaLine, PostCard, PostGrid, SectionHeading, TagList,
  categoryHref, getCategoryLabel, postHref, revealStyle,
} from "../BlogPrimitives";
import type { BlogIndexCopy } from "../copy/index-copy";
import { LibraryFilter, type LibraryEntry } from "./LibraryFilter";
import s from "./BlogIndex.module.css";

/**
 * Sections of the blog index (/blogs). Server components; render them inside
 * <BlogMotion>. Pass already-localized posts.
 */

export interface IndexContext { ui: BlogUiStrings; copy: BlogIndexCopy; locale: string }
export type CategoryKey = BlogCategory | "all";
export interface CategoryCount { key: CategoryKey; count: number }

const pad = (n: number) => String(n).padStart(2, "0");
const cx = (...names: (string | false | null | undefined)[]) => names.filter(Boolean).join(" ");

/* ── 00 · Hero ─────────────────────────────────────────────────────────── */

export function IndexHero({ ctx, total, lead, lastShipped, counts }: {
  ctx: IndexContext; total: number; lead?: BlogPost; lastShipped?: string; counts: CategoryCount[];
}) {
  const { ui, copy } = ctx;
  return (
    <section className={blog.hero} aria-labelledby="blog-index-title" id="blog-index-hero">
      <div className={home.container}>
        <Breadcrumbs className={s.crumbs} items={[{ label: copy.home, href: "/" }, { label: ui.breadcrumb }]} />
        <BlogEyebrow edition={copy.edition}>{ui.blogEyebrow}</BlogEyebrow>
        <div className={blog.heroGrid}>
          <div className={blog.heroCopy}>
            <h1 id="blog-index-title"><span>{ui.blogTitleLead}</span><em>{ui.blogTitleAccent}</em></h1>
            <p className={blog.heroLead}>{ui.blogSubtitle}</p>
            <div className={blog.heroActions}>
              {lead && <LocalizedLink href={postHref(lead.slug)} className={home.primaryButton}>{copy.heroPrimary}<ArrowUpRight size={18} aria-hidden="true" /></LocalizedLink>}
              <a href="#library" className={home.textButton}>{ui.byCategoryEyebrow}<ArrowDown size={16} aria-hidden="true" /></a>
            </div>
            {lastShipped && <p className={s.heroNote}><span aria-hidden="true" />{copy.heroNote(total, lastShipped)}</p>}
          </div>
          <div className={blog.heroVisual}>
            <BlogFigure sketch="workshop" number={1} title={copy.figureTitle} alt={copy.figureAlt} count={total} legend={copy.legend} />
          </div>
        </div>
        <nav className={s.band} aria-label={ui.byCategoryEyebrow}>
          <p className={s.bandLabel}>{copy.bandLabel[0]}<br /><strong>{copy.bandLabel[1]}</strong></p>
          <ul className={s.bandList}>
            {counts.map(({ key, count }) => (
              <li key={key}>
                <LocalizedLink href={key === "all" ? "#library" : categoryHref(key)} className={s.bandLink}>
                  <strong>{pad(count)}</strong>
                  <span>{getCategoryLabel(ui, key)}</span>
                  <ArrowUpRight size={14} className={blog.arrow} aria-hidden="true" />
                </LocalizedLink>
              </li>
            ))}
          </ul>
        </nav>
      </div>
    </section>
  );
}

/* ── 01 · Featured ─────────────────────────────────────────────────────── */

export function FeaturedSection({ ctx, lead, rest, count }: { ctx: IndexContext; lead?: BlogPost; rest: BlogPost[]; count: number }) {
  const { ui, copy, locale } = ctx;
  if (!lead) return null;
  const fill3 = (3 - (rest.length % 3)) % 3;
  const fill2 = (2 - (rest.length % 2)) % 2;
  return (
    <BlogSection tone="surface" id="featured" labelledBy="featured-title">
      <SectionHeading
        number={1}
        label={ui.featuredEyebrow}
        lead={ui.featuredTitle}
        accent={ui.featuredTitleAccent}
        id="featured-title"
        action={<p className={s.headNote}>{copy.featuredCount(count)}<i aria-hidden="true" />{copy.editorsPick}</p>}
      />
      <div className={s.featureWrap} data-blog-reveal="">
        <PostCard post={lead} ui={ui} locale={locale} variant="feature" index={2} />
      </div>
      {rest.length > 0 && (
        <ul className={cx(blog.grid, s.cardGrid)}>
          {rest.map((post, i) => (
            <li key={post.slug} data-blog-reveal="" style={revealStyle(i % 3)}>
              <PostCard post={post} ui={ui} locale={locale} index={i + 3} />
            </li>
          ))}
          {(fill3 > 0 || fill2 > 0) && (
            <li className={s.filler} data-fill3={fill3} data-fill2={fill2} style={{ "--fill3": fill3, "--fill2": fill2 } as CSSProperties}>
              <div className={s.fillerInner}>
                <span className={s.fillerEyebrow}>{ui.allPostsEyebrow}</span>
                <p className={s.fillerTitle}>{copy.fillerTitle}</p>
                <a href="#library" className={home.textButton}>{copy.fillerLink}<ArrowDown size={16} aria-hidden="true" /></a>
              </div>
            </li>
          )}
        </ul>
      )}
    </BlogSection>
  );
}

/* ── 02 · Latest + most read ───────────────────────────────────────────── */

export function LatestSection({ ctx, latest, mostRead }: { ctx: IndexContext; latest: BlogPost[]; mostRead: BlogPost[] }) {
  const { ui, copy, locale } = ctx;
  return (
    <BlogSection id="latest" labelledBy="latest-title">
      <SectionHeading number={2} label={ui.latestEyebrow} lead={ui.latestTitle} accent={ui.latestTitleAccent} id="latest-title" />
      <div className={s.latestLayout}>
        <PostGrid posts={latest} ui={ui} locale={locale} columns={2} label={ui.latestEyebrow} className={s.cardGrid} />
        <aside className={s.mostRead} aria-labelledby="most-read-title">
          <p className={s.mostReadEyebrow}><i aria-hidden="true" />{ui.mostReadEyebrow}</p>
          <h3 id="most-read-title" className={s.mostReadTitle}>{ui.mostReadTitle}</h3>
          <ol className={s.mostReadList}>
            {mostRead.map((post, i) => (
              <li key={post.slug} data-blog-reveal="" style={revealStyle(i)}>
                <article className={s.mrItem} data-figure-hover="">
                  <span className={s.rank} aria-hidden="true">{pad(i + 1)}</span>
                  <div className={s.mrMain}>
                    <MetaLine category={getCategoryLabel(ui, post.category)} readTime={ui.readTime(post.readTime)} />
                    <h4 className={s.mrTitle}><LocalizedLink href={postHref(post.slug)}>{post.title}</LocalizedLink></h4>
                  </div>
                  <ArrowUpRight size={15} className={blog.arrow} aria-hidden="true" />
                </article>
              </li>
            ))}
          </ol>
        </aside>
      </div>
      <div className={blog.sectionFoot}>
        <span>{ui.allPostsTitle} {ui.allPostsTitleAccent}</span>
        <a href="#library">{copy.latestAll}<ArrowDown size={16} className={blog.arrow} aria-hidden="true" /></a>
      </div>
    </BlogSection>
  );
}

/* ── 03 · Topic clusters ───────────────────────────────────────────────── */

export interface ClusterView { key: string; title: string; description: string; primaryKeyword: string; posts: BlogPost[] }

export function TopicClustersSection({ ctx, clusters }: { ctx: IndexContext; clusters: ClusterView[] }) {
  const { ui, copy } = ctx;
  return (
    <BlogSection tone="surface" id="topics" labelledBy="topics-title">
      <SectionHeading number={3} label={ui.topicClustersEyebrow} lead={ui.topicClustersTitle} accent={ui.topicClustersTitleAccent} id="topics-title" intro={ui.topicClustersSubtitle} />
      <ol className={s.clusters}>
        {clusters.map((cluster, i) => (
          <li key={cluster.key} className={s.cluster} data-blog-reveal="" style={revealStyle(i)}>
            <span className={s.clusterIndex} aria-hidden="true">{pad(i + 1)}</span>
            <div className={s.clusterCopy}>
              <p className={s.clusterMeta}>{copy.clusterLabel} · {cluster.primaryKeyword}</p>
              <h3 className={s.clusterTitle}>{cluster.title}</h3>
              <p className={s.clusterDesc}>{cluster.description}</p>
              <span className={s.clusterCount}>{copy.postsCount(cluster.posts.length)}</span>
            </div>
            <ul className={s.clusterLinks}>
              {cluster.posts.map((post, k) => (
                <li key={post.slug}>
                  <LocalizedLink href={postHref(post.slug)}>
                    <span aria-hidden="true">{pad(k + 1)}</span>
                    <span>{post.title}</span>
                    <ArrowUpRight size={14} className={blog.arrow} aria-hidden="true" />
                  </LocalizedLink>
                </li>
              ))}
            </ul>
          </li>
        ))}
      </ol>
    </BlogSection>
  );
}

/* ── 04 · Why we write (dark band) ─────────────────────────────────────── */

export interface IndexStat { label: string; value: ReactNode; unit?: string; accent?: boolean }

export function WhyWeWriteSection({ ctx, stats }: { ctx: IndexContext; stats: IndexStat[] }) {
  const { ui, copy } = ctx;
  return (
    <BlogSection tone="dark" id="why-we-write" labelledBy="why-title">
      <div className={s.whyGrid}>
        <div>
          <Chapter number={4}>{ui.whyWeWriteEyebrow}</Chapter>
          <h2 id="why-title">{ui.whyWeWriteTitle}<br /><em>{ui.whyWeWriteAccent}</em></h2>
          <div className={s.whyBody}>
            <p>{ui.whyWeWriteBody1}</p>
            <p>{ui.whyWeWriteBody2}</p>
          </div>
          <div className={s.whyByline}>
            <span>{copy.whyByline}</span>
            <LocalizedLink href="/about" className={home.textButton}>{copy.whyTeamLink}<ArrowUpRight size={16} className={blog.arrow} aria-hidden="true" /></LocalizedLink>
          </div>
        </div>
        <div className={s.numbers} data-blog-reveal="">
          <p className={s.numbersTitle}><span className={home.signal} aria-hidden="true" />{copy.numbersTitle}</p>
          <dl>
            {stats.map((stat) => (
              <div key={stat.label} className={stat.accent ? s.numberAccent : undefined}>
                <dt>{stat.label}</dt>
                <dd>{stat.value}{stat.unit && <small>{stat.unit}</small>}</dd>
              </div>
            ))}
          </dl>
        </div>
      </div>
    </BlogSection>
  );
}

/* ── 05 · Library, grouped by category ─────────────────────────────────── */

export interface LibraryGroup { key: BlogCategory; posts: BlogPost[] }

export function LibrarySection({ ctx, groups, total, tags }: { ctx: IndexContext; groups: LibraryGroup[]; total: number; tags: string[] }) {
  const { ui, copy, locale } = ctx;
  const entries: LibraryEntry[] = groups.flatMap((group) => group.posts.map((post) => ({
    slug: post.slug,
    category: group.key,
    text: [post.title, post.excerpt, post.subtitle, post.keywords.primary, getCategoryLabel(ui, post.category), ...post.tags].join(" ").toLowerCase(),
  })));
  const options = [{ key: "all", label: getCategoryLabel(ui, "all"), count: total }, ...groups.map((g) => ({ key: g.key, label: getCategoryLabel(ui, g.key), count: g.posts.length }))];

  return (
    <BlogSection id="library" labelledBy="library-title">
      <SectionHeading number={5} label={ui.byCategoryEyebrow} lead={ui.byCategoryTitle} accent={ui.byCategoryAccent} id="library-title" intro={copy.libraryIntro} />
      <LibraryFilter
        options={options}
        entries={entries}
        labels={{ filter: ui.filterLabel, search: copy.searchLabel, placeholder: copy.searchPlaceholder, results: copy.results, empty: copy.empty, clear: copy.clear }}
      >
        {groups.map((group, g) => (
          <div key={group.key} id={`cat-${group.key}`} className={s.group} data-library-group={group.key}>
            <div className={s.groupHead}>
              <h3 className={s.groupTitle}><span aria-hidden="true">{pad(g + 1)}</span>{getCategoryLabel(ui, group.key)}</h3>
              <span className={s.groupCount}>{copy.postsCount(group.posts.length)}</span>
              <LocalizedLink href={categoryHref(group.key)} className={s.groupLink}>{copy.viewCategory}<ArrowUpRight size={14} className={blog.arrow} aria-hidden="true" /></LocalizedLink>
            </div>
            <ol className={blog.rows}>
              {group.posts.map((post, i) => (
                <li key={post.slug} data-library-item={post.slug} data-blog-reveal="" style={revealStyle(Math.min(i, 6))}>
                  <PostCard post={post} ui={ui} locale={locale} variant="row" index={i + 1} headingLevel={4} />
                </li>
              ))}
            </ol>
          </div>
        ))}
      </LibraryFilter>
      {tags.length > 0 && (
        <div className={s.tagCloud}>
          <p className={s.tagCloudLabel}><i aria-hidden="true" />{ui.tagCloudLabel}</p>
          <TagList tags={tags} label={ui.tagCloudLabel} />
        </div>
      )}
    </BlogSection>
  );
}

/* ── 06 · Writer + newsletter ──────────────────────────────────────────── */

export function WriterSection({ ctx, prefix }: { ctx: IndexContext; prefix: string }) {
  const { ui, copy } = ctx;
  return (
    <BlogSection tone="surface" id="newsletter" labelledBy="newsletter-title" tight>
      <div className={s.writerGrid}>
        <div className={s.writer}>
          <Chapter number={6}>{ui.authorEyebrow}</Chapter>
          <AuthorCard
            className={s.author}
            name={copy.authorName}
            role={copy.authorRole}
            bio={copy.authorBio}
            action={
              <div className={s.writerLinks}>
                <LocalizedLink href="/about" className={home.textButton}>{ui.authorReadStory}<ArrowUpRight size={15} className={blog.arrow} aria-hidden="true" /></LocalizedLink>
                <LocalizedLink href="/contact" className={home.textButton}>{ui.authorBookAudit}<ArrowUpRight size={15} className={blog.arrow} aria-hidden="true" /></LocalizedLink>
              </div>
            }
          />
        </div>
        <div className={s.newsletter}>
          <p className={s.newsEyebrow}><span className={home.signal} aria-hidden="true" />{ui.newsletterEyebrow}</p>
          <h2 id="newsletter-title" className={s.newsTitle}>{ui.newsletterTitle}<br /><em>{ui.newsletterTitleAccent}</em></h2>
          <p className={s.newsBody}>{ui.newsletterBody}</p>
          <form className={s.form} action={`${prefix}/contact`} method="get">
            <label htmlFor="newsletter-email" className={s.formLabel}>{ui.newsletterEmailLabel}</label>
            <div className={s.formRow}>
              <input id="newsletter-email" name="email" type="email" required placeholder={ui.newsletterEmailPlaceholder} className={s.input} autoComplete="email" />
              <button type="submit" className={cx(home.primaryButton, s.submit)}>{ui.newsletterSubmit}<ArrowUpRight size={16} aria-hidden="true" /></button>
            </div>
            <p className={s.privacy}>{ui.newsletterPrivacy}</p>
          </form>
        </div>
      </div>
    </BlogSection>
  );
}

/* ── 07 · FAQ ──────────────────────────────────────────────────────────── */

/** Renders exactly `ui.listFaqs` — the same array the FAQPage JSON-LD is built from. */
export function IndexFaqSection({ ctx }: { ctx: IndexContext }) {
  const { ui, copy } = ctx;
  return (
    <BlogSection id="faq" labelledBy="faq-title">
      <div className={home.faqGrid}>
        <div>
          <Chapter number={7}>{ui.faqEyebrow}</Chapter>
          <h2 id="faq-title">{ui.faqTitle}<br /><em>{ui.faqTitleAccent}</em></h2>
          <p className={home.bodyCopy}>{copy.faqBody}</p>
          <LocalizedLink href="/contact" className={home.textButton}>{copy.faqLink}<ArrowUpRight size={17} className={blog.arrow} aria-hidden="true" /></LocalizedLink>
        </div>
        <div className={cx(home.faqList, s.faqList)}>
          {ui.listFaqs.map((faq) => (
            <details key={faq.question}>
              <summary>{faq.question}<Plus size={18} aria-hidden="true" /></summary>
              <p>{faq.answer}</p>
            </details>
          ))}
        </div>
      </div>
    </BlogSection>
  );
}

/** Keeps the shared (Tailwind) India geo footer legible inside the blog root. */
export function GeoFooterFrame({ children }: { children: ReactNode }) {
  return <div className={s.geo}>{children}</div>;
}
