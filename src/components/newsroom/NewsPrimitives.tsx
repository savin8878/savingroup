import type { ComponentProps, ReactElement, ReactNode } from "react";
import { ArrowUpRight } from "lucide-react";
import LocalizedLink from "@/components/LocalizedLink";
import blog from "@/components/blog/Blog.module.css";
import { BlogFigure, FigureArt } from "@/components/blog/BlogFigures";
import { MetaLine, formatPostDate, revealStyle } from "@/components/blog/BlogPrimitives";
import type { NewsCategory, NewsPost } from "@/lib/news";
import type { NewsroomCopy } from "./copy/newsroom-copy";

/**
 * Server-safe building blocks for the newsroom, sharing the blog's card, row
 * and feature styles so the two sections read as one design system. Render
 * them inside <BlogMotion>. Pass already-localized stories.
 */

const Link = LocalizedLink as unknown as (props: ComponentProps<typeof LocalizedLink> & { "aria-current"?: "page" | "location" | "true"; rel?: string }) => ReactElement;
const cx = (...names: (string | false | null | undefined)[]) => names.filter(Boolean).join(" ");
const pad = (n: number) => String(n).padStart(2, "0");

export const newsHref = (slug: string) => `/newsroom/${slug}`;
export const deskHref = (key: NewsCategory | "all") => (key === "all" ? "/newsroom" : `/newsroom/category/${key}`);
export const deskLabel = (copy: NewsroomCopy, key: NewsCategory | "all") => copy.categories[key];

/** Short date for a story ("Sep 25, 2026"); pinned to UTC like the blog. */
export const formatNewsDate = (iso: string, locale: string) => formatPostDate(iso, locale);

/** Publisher of the first cited source, for kickers and legends. */
export function primaryPublisher(post: NewsPost): string {
  return post.sources[0]?.publisher ?? "";
}

function Heading({ level, className, children }: { level: 2 | 3 | 4; className: string; children: ReactNode }) {
  const Tag = `h${level}` as "h2" | "h3" | "h4";
  return <Tag className={className}>{children}</Tag>;
}

export type NewsCardVariant = "feature" | "card" | "row";

export interface NewsCardProps {
  post: NewsPost;
  copy: NewsroomCopy;
  locale: string;
  variant?: NewsCardVariant;
  index?: number;
  headingLevel?: 2 | 3 | 4;
  showExcerpt?: boolean;
  kicker?: ReactNode;
  className?: string;
}

export function NewsCard({ post, copy, locale, variant = "card", index, headingLevel = 3, showExcerpt = true, kicker, className }: NewsCardProps) {
  const href = newsHref(post.slug);
  const desk = deskLabel(copy, post.category);
  const date = formatNewsDate(post.publishedAt, locale);
  const readTime = copy.readTime(post.readTime);
  const publisher = primaryPublisher(post);

  if (variant === "row") {
    return (
      <article className={cx(blog.row, className)} data-figure-hover="">
        <span className={blog.rowIndex}>{index !== undefined ? pad(index) : ""}</span>
        <span className={blog.rowCategory}>{desk}</span>
        <div className={blog.rowMain}>
          <Heading level={headingLevel} className={blog.rowTitle}><Link href={href}>{post.title}</Link></Heading>
          {showExcerpt && <p className={blog.rowExcerpt}>{post.dek || post.excerpt}</p>}
        </div>
        <MetaLine date={date} dateTime={post.publishedAt} readTime={readTime} extra={publisher ? [publisher] : undefined} />
        <ArrowUpRight size={17} className={blog.arrow} aria-hidden="true" />
      </article>
    );
  }

  if (variant === "feature") {
    return (
      <article className={cx(blog.feature, className)} data-figure-hover="">
        <div className={blog.featureFigure}>
          <BlogFigure sketch={post.heroSketch} number={index ?? 1} alt={false} />
        </div>
        <div className={blog.featureBody}>
          <div className={blog.cardKicker}><span>{kicker ?? desk}</span>{index !== undefined && <span>{pad(index)}</span>}</div>
          <Heading level={headingLevel} className={blog.featureTitle}><Link href={href}>{post.title}</Link></Heading>
          <p className={blog.featureSubtitle}>{post.dek || post.excerpt}</p>
          <MetaLine className={blog.featureMeta} category={kicker ? desk : undefined} date={date} dateTime={post.publishedAt} readTime={readTime} extra={publisher ? [publisher] : undefined} />
          <span className={blog.featureLink} aria-hidden="true">{copy.readStory}<ArrowUpRight size={16} className={blog.arrow} /></span>
        </div>
        <aside className={blog.featureAside} aria-label={readTime}>
          <strong>{post.readTime}<small>{copy.minRead}</small></strong>
          <span>{copy.sourceCount(post.sources.length)}</span>
          {post.takeaways[0] && <p><span className={blog.srOnly}>{copy.whatItMeans}: </span>{post.takeaways[0]}</p>}
        </aside>
      </article>
    );
  }

  return (
    <article className={cx(blog.card, className)} data-figure-hover="">
      <div className={blog.cardFigure}>
        {index !== undefined && <span className={blog.cardFigLabel} aria-hidden="true">FIG. {pad(index)}</span>}
        <span className={blog.cardFigCode} aria-hidden="true">{desk}</span>
        <FigureArt sketch={post.heroSketch} compact />
      </div>
      <div className={blog.cardBody}>
        <div className={blog.cardKicker}><span>{desk}</span>{index !== undefined && <span>{pad(index)}</span>}</div>
        <Heading level={headingLevel} className={blog.cardTitle}><Link href={href}>{post.title}</Link></Heading>
        <p className={blog.cardExcerpt}>{post.excerpt || post.dek}</p>
        <div className={blog.cardFoot}>
          <MetaLine date={date} dateTime={post.publishedAt} readTime={readTime} />
          <ArrowUpRight size={17} className={blog.arrow} aria-hidden="true" />
        </div>
      </div>
    </article>
  );
}

export function NewsGrid({ posts, copy, locale, variant = "card", columns = 3, startIndex = 1, headingLevel = 3, showExcerpt, reveal = true, label, className, itemAttr }: {
  posts: NewsPost[]; copy: NewsroomCopy; locale: string; variant?: "card" | "row"; columns?: 2 | 3;
  startIndex?: number; headingLevel?: 2 | 3 | 4; showExcerpt?: boolean; reveal?: boolean; label?: string; className?: string;
  /** When set, each <li> carries data-library-item=<slug> for the archive filter. */
  itemAttr?: boolean;
}) {
  const ListTag = variant === "row" ? "ol" : "ul";
  return (
    <ListTag className={cx(variant === "row" ? blog.rows : blog.grid, variant === "card" && columns === 2 && blog.grid2, className)} aria-label={label}>
      {posts.map((post, i) => (
        <li key={post.slug} data-library-item={itemAttr ? post.slug : undefined} data-blog-reveal={reveal ? "" : undefined} style={reveal ? revealStyle(variant === "row" ? Math.min(i, 6) : i % columns) : undefined}>
          <NewsCard post={post} copy={copy} locale={locale} variant={variant} index={startIndex + i} headingLevel={headingLevel} showExcerpt={showExcerpt} />
        </li>
      ))}
    </ListTag>
  );
}

/** Desk chips linking to /newsroom and /newsroom/category/<key>. */
export function DeskNav({ copy, active, counts, keys, className }: {
  copy: NewsroomCopy; active: NewsCategory | "all"; counts?: Partial<Record<NewsCategory | "all", number>>;
  keys?: (NewsCategory | "all")[]; className?: string;
}) {
  const list = keys ?? (["all", "ai", "automation", "manufacturing", "software", "markets", "policy"] as const);
  return (
    <nav aria-label={copy.desksEyebrow} className={className}>
      <ul className={blog.filter}>
        {list.map((key) => (
          <li key={key}>
            <Link href={deskHref(key)} className={blog.chip} aria-current={key === active ? "page" : undefined}>
              {deskLabel(copy, key)}{counts?.[key] !== undefined && <small>{pad(counts[key] ?? 0)}</small>}
            </Link>
          </li>
        ))}
      </ul>
    </nav>
  );
}

/** Newer / older story links. */
export function NewsPager({ prev, next, copy, className }: { prev: NewsPost | null; next: NewsPost | null; copy: NewsroomCopy; className?: string }) {
  if (!prev && !next) return null;
  return (
    <nav className={cx(blog.pager, className)} aria-label={`${copy.newerStory} / ${copy.olderStory}`}>
      {prev ? <Link href={newsHref(prev.slug)} rel="prev"><span className={blog.mono}>← {copy.newerStory}</span><strong>{prev.title}</strong></Link> : <span aria-hidden="true" />}
      {next ? <Link href={newsHref(next.slug)} rel="next"><span className={blog.mono}>{copy.olderStory} →</span><strong>{next.title}</strong></Link> : <span aria-hidden="true" />}
    </nav>
  );
}
