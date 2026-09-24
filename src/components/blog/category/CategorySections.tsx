import type { ReactNode } from "react";
import { ArrowDown, ArrowLeft, ArrowUpRight } from "lucide-react";
import LocalizedLink from "@/components/LocalizedLink";
import home from "@/components/home/IndustrialHome.module.css";
import blog from "@/components/blog/Blog.module.css";
import { BlogFigure, FigureArt, type BlogFigureKey } from "@/components/blog/BlogFigures";
import { BlogEyebrow, Breadcrumbs, PostCard, TagList, categoryHref, postHref, revealStyle } from "@/components/blog/BlogPrimitives";
import type { BlogCategory, BlogPost } from "@/lib/blogs";
import type { BlogUiStrings } from "@/lib/blog-i18n";
import c from "./Category.module.css";

/**
 * Pieces of /blogs/category/<category> that the shared primitives don't
 * cover: the hero, the topic-cluster rows and the "other categories" grid.
 * Server components; render inside <BlogMotion>.
 */

const cx = (...names: (string | false | null | undefined)[]) => names.filter(Boolean).join(" ");
const pad = (n: number) => String(n).padStart(2, "0");
/**
 * Keeps "&" and "—" on the line of the word before them, so a display line never
 * starts with one. Wraps the pair in a nowrap span; the text itself is unchanged.
 */
function tidy(text: string): ReactNode {
  const parts = text.split(/(\S+ (?:&|—))/);
  if (parts.length === 1) return text;
  return parts.map((part, i) => (i % 2 ? <span key={i} className={c.keep}>{part}</span> : part));
}

/** The drawing that stands for each category (hero figure + directory thumbnail). */
export const CATEGORY_SKETCH: Record<BlogCategory, BlogFigureKey> = {
  growth: "leakyFunnel",
  automation: "whatsappFlow",
  seo: "seoPeakGraph",
  "case-study": "auditLens",
  ops: "layerStack",
};

/* ── Hero ───────────────────────────────────────────────────────────── */

export interface CategoryHeroProps {
  id: string;
  titleId: string;
  breadcrumbs: { label: string; href?: string }[];
  breadcrumbLabel: string;
  back: { label: string; href: string };
  eyebrow: string;
  edition: string;
  headline: string;
  accent: string;
  description: string;
  readLead: { label: string; href: string };
  figure: { sketch: BlogFigureKey; title: string; legend: string[] };
  stats: { value: ReactNode; label: string }[];
  keywords: { label: string; items: string[] };
}

export function CategoryHero({ id, titleId, breadcrumbs, breadcrumbLabel, back, eyebrow, edition, headline, accent, description, readLead, figure, stats, keywords }: CategoryHeroProps) {
  return (
    <section className={cx(blog.hero, c.hero)} id={id} aria-labelledby={titleId}>
      <div className={home.container}>
        <div className={c.topbar}>
          <Breadcrumbs items={breadcrumbs} label={breadcrumbLabel} />
          <LocalizedLink href={back.href} className={c.back}><ArrowLeft size={12} aria-hidden="true" />{back.label}</LocalizedLink>
        </div>
        <BlogEyebrow edition={edition}>{eyebrow}</BlogEyebrow>
        <div className={cx(blog.heroGrid, c.heroGrid)}>
          <div className={cx(blog.heroCopy, c.heroCopy)}>
            <h1 id={titleId} className={c.title}><span>{tidy(headline)}</span><em>{tidy(accent)}</em></h1>
            <p className={cx(blog.heroLead, c.lead, c.bidi)}>{description}</p>
            <div className={blog.heroActions}>
              <a href={readLead.href} className={home.textButton}>{readLead.label}<ArrowDown size={16} aria-hidden="true" /></a>
            </div>
          </div>
          <div className={blog.heroVisual}>
            <BlogFigure sketch={figure.sketch} number="FIG. 00" title={figure.title} legend={figure.legend} />
          </div>
        </div>
        <dl className={cx(blog.stats, c.stats)}>
          {stats.map((stat) => (
            <div key={stat.label} className={blog.stat}>
              <dt className={c.statLabel}>{stat.label}</dt>
              <dd className={c.statValue}>{stat.value}</dd>
            </div>
          ))}
        </dl>
        <div className={c.answers}>
          <span className={c.answersLabel}><i aria-hidden="true" />{keywords.label}</span>
          <TagList tags={keywords.items} label={keywords.label} />
        </div>
      </div>
    </section>
  );
}

/* ── Post grid with a closing "all posts" cell ──────────────────────── */

/**
 * The foundation hairline grid (same classes and reveal as PostGrid). When the
 * last row is short, the empty slots become one link to the full library so the
 * grid never ends in a notch.
 */
export function CategoryPostGrid({ posts, ui, locale, columns, startIndex = 1, label, filler }: {
  posts: BlogPost[]; ui: BlogUiStrings; locale: string; columns: 2 | 3; startIndex?: number; label?: string;
  filler: { kicker: string; lead: string; accent: string; count: number; meta: string; action: string; href: string };
}) {
  // Empty slots in the last row at the desktop column count and at the 2-column
  // tablet grid. CSS shows the cell only where it closes a gap (never on 1 column).
  const empty = (columns - (posts.length % columns)) % columns;
  const emptyTablet = posts.length % 2;
  return (
    <ul className={cx(blog.grid, columns === 2 && blog.grid2, c.postGrid)} aria-label={label}>
      {posts.map((post, i) => (
        <li key={post.slug} data-blog-reveal="" style={revealStyle(i % columns)}>
          <PostCard post={post} ui={ui} locale={locale} variant="card" index={startIndex + i} />
        </li>
      ))}
      {(empty > 0 || emptyTablet > 0) && (
        <li
          className={c.fillerItem}
          data-fill={empty}
          data-fill-tablet={emptyTablet}
          style={{ ["--fill" as string]: Math.max(empty, 1) }}
          data-blog-reveal=""
        >
          <div className={c.filler}>
            <span className={c.fillerKicker}>{filler.kicker}</span>
            <span className={c.fillerCount} aria-hidden="true">{pad(filler.count)}</span>
            <span className={c.fillerMeta}>{filler.meta}</span>
            <p className={cx(c.fillerTitle, c.bidi)}>
              <LocalizedLink href={filler.href}>{filler.lead} <em>{filler.accent}</em></LocalizedLink>
            </p>
            <div className={c.dirFoot} aria-hidden="true"><span>{filler.action}</span><ArrowUpRight size={16} className={blog.arrow} /></div>
          </div>
        </li>
      )}
    </ul>
  );
}

/* ── Topic clusters as numbered rows ────────────────────────────────── */

export interface ClusterRow {
  key: string;
  title: string;
  description: string;
  primaryKeyword: string;
  posts: { slug: string; title: string; inCategory: boolean }[];
}

export function ClusterRows({ clusters, clusterLabel, inThisCategory, count }: {
  clusters: ClusterRow[];
  clusterLabel: string;
  inThisCategory: string;
  count: (total: number, here: number) => string;
}) {
  return (
    <ol className={c.clusters}>
      {clusters.map((cluster, i) => {
        const here = cluster.posts.filter((post) => post.inCategory).length;
        const headingId = `cluster-${cluster.key}`;
        return (
          <li key={cluster.key} className={c.cluster} data-blog-reveal="" style={revealStyle(i)}>
            <span className={c.clusterIndex} aria-hidden="true">{pad(i + 1)}</span>
            <div className={c.clusterHead}>
              <span className={c.clusterKicker}>{clusterLabel} · {cluster.primaryKeyword}</span>
              <h3 id={headingId} className={c.bidi}>{cluster.title}</h3>
              <p className={c.bidi}>{cluster.description}</p>
              <span className={c.clusterMeta}>{count(cluster.posts.length, here)}</span>
            </div>
            <ol className={c.clusterPosts} aria-labelledby={headingId}>
              {cluster.posts.map((post, k) => (
                <li key={post.slug}>
                  <LocalizedLink href={postHref(post.slug)} className={cx(c.clusterLink, post.inCategory && c.clusterLinkHere)}>
                    <span className={c.clusterLinkIndex} aria-hidden="true">{pad(k + 1)}</span>
                    <span className={cx(c.clusterLinkTitle, c.bidi)}>{post.title}</span>
                    {post.inCategory ? <span className={c.here}>{inThisCategory}</span> : <span aria-hidden="true" />}
                    <ArrowUpRight size={14} className={blog.arrow} aria-hidden="true" />
                  </LocalizedLink>
                </li>
              ))}
            </ol>
          </li>
        );
      })}
    </ol>
  );
}

/* ── Other categories: hairline grid with counts ────────────────────── */

export interface DirectoryItem {
  key: BlogCategory;
  label: string;
  headline: string;
  accent: string;
  count: number;
  countLabel: string;
}

export function CategoryDirectory({ items, label }: { items: DirectoryItem[]; label?: string }) {
  return (
    <ul className={cx(c.directory, items.length === 3 && c.directory3, items.length <= 2 && c.directory2)} aria-label={label}>
      {items.map((item, i) => (
        <li key={item.key} data-blog-reveal="" style={revealStyle(i)}>
          <article className={c.dirCell} data-figure-hover="">
            <div className={c.dirFigure} aria-hidden="true">
              <FigureArt sketch={CATEGORY_SKETCH[item.key]} compact />
            </div>
            <div className={c.dirBody}>
              <div className={c.dirKicker}><span>{item.label}</span><span>{pad(item.count)}</span></div>
              <h3 className={cx(c.dirTitle, c.bidi)}>
                <LocalizedLink href={categoryHref(item.key)}>{tidy(item.headline)} <em>{tidy(item.accent)}</em></LocalizedLink>
              </h3>
              <div className={c.dirFoot}>
                <span>{item.countLabel}</span>
                <ArrowUpRight size={16} className={blog.arrow} aria-hidden="true" />
              </div>
            </div>
          </article>
        </li>
      ))}
    </ul>
  );
}
