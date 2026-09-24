import { Fragment, type ComponentProps, type CSSProperties, type ReactElement, type ReactNode } from "react";
import { ArrowUpRight, Check } from "lucide-react";
import LocalizedLink from "@/components/LocalizedLink";
import home from "@/components/home/IndustrialHome.module.css";
import { parseInlineLinks, type BlogCategory, type BlogPost } from "@/lib/blogs";
import type { BlogUiStrings } from "@/lib/blog-i18n";
import { BlogFigure, FigureArt } from "./BlogFigures";
import styles from "./Blog.module.css";

/**
 * Server-safe building blocks for the blog pages. Render them inside
 * <BlogMotion>; several rules rely on its root class for specificity.
 * Pass already-localized posts (`localizePost`) and `getBlogUi(locale)`.
 */

/**
 * LocalizedLink spreads extra props onto next/link (and so onto the <a>), but its
 * prop type omits aria-current / rel. Same component, wider type.
 */
const Link = LocalizedLink as unknown as (props: ComponentProps<typeof LocalizedLink> & { "aria-current"?: "page" | "location" | "true"; rel?: string }) => ReactElement;

const cx = (...names: (string | false | null | undefined)[]) => names.filter(Boolean).join(" ");
const pad = (n: number) => String(n).padStart(2, "0");

/* ── Utilities ──────────────────────────────────────────────────────── */

/** Same format the blog has always used: "Mar 4, 2026" (Hindi: hi-IN). Pinned to UTC so a date never shifts. */
export function formatPostDate(iso: string, locale: string) {
  const date = new Date(iso);
  if (Number.isNaN(date.getTime())) return iso;
  return date.toLocaleDateString(locale === "hi" ? "hi-IN" : "en-US", { month: "short", day: "numeric", year: "numeric", timeZone: "UTC" });
}

/** Category label from the localized UI strings ("case-study" → ui.categories.caseStudy). */
export function getCategoryLabel(ui: BlogUiStrings, key: BlogCategory | "all") {
  return key === "case-study" ? ui.categories.caseStudy : ui.categories[key];
}

/** Locale-less paths; LocalizedLink adds /<country>/<locale>. */
export const postHref = (slug: string) => `/blogs/${slug}`;
export const categoryHref = (key: BlogCategory | "all") => (key === "all" ? "/blogs" : `/blogs/category/${key}`);

/** Stagger for [data-blog-reveal] siblings: style={revealStyle(i)}. */
export const revealStyle = (index: number): CSSProperties => ({ ["--reveal-index" as string]: index });

export function authorInitials(name: string) {
  return name.split(/\s+/).filter(Boolean).slice(0, 2).map((part) => part[0]?.toUpperCase() ?? "").join("");
}

/* ── Layout ─────────────────────────────────────────────────────────── */

export type SectionTone = "paper" | "surface" | "dark";

/** A full-width band with the 1184px container. `scene` pauses its animations off-screen. */
export function BlogSection({ tone = "paper", id, labelledBy, className, containerClassName, flush, tight, scene, children }: {
  tone?: SectionTone; id?: string; labelledBy?: string; className?: string; containerClassName?: string;
  /** No top hairline. */ flush?: boolean;
  /** Less vertical padding. */ tight?: boolean;
  /** Adds data-blog-scene (pause animations when off-screen). */ scene?: boolean;
  children: ReactNode;
}) {
  return (
    <section id={id} aria-labelledby={labelledBy} className={cx(styles.section, tone === "surface" && styles.surface, tone === "dark" && styles.dark, flush && styles.flush, tight && styles.tight, className)} data-blog-scene={scene ? "" : undefined}>
      <div className={cx(home.container, containerClassName)}>{children}</div>
    </section>
  );
}

export function Chapter({ number, children, className }: { number: number | string; children: ReactNode; className?: string }) {
  return <div className={cx(home.chapter, className)}><span>{typeof number === "number" ? pad(number) : number}</span><span>{children}</span></div>;
}

/** Hero eyebrow row: signal dot · label · optional edition at the inline end. */
export function BlogEyebrow({ children, edition, className }: { children: ReactNode; edition?: ReactNode; className?: string }) {
  return <div className={cx(styles.eyebrow, className)}><span className={home.signal} /><span>{children}</span>{edition && <span className={styles.edition}>{edition}</span>}</div>;
}

/** Chapter + two-line display heading (second line in <em>) + optional side paragraph or action. */
export function SectionHeading({ number, label, lead, accent, id, intro, action, as: Tag = "h2", className }: {
  number: number | string; label: ReactNode; lead: ReactNode; accent?: ReactNode; id?: string;
  intro?: ReactNode; action?: ReactNode; as?: "h1" | "h2"; className?: string;
}) {
  return (
    <div className={cx(styles.sectionHead, className)}>
      <div>
        <Chapter number={number}>{label}</Chapter>
        <Tag id={id}>{lead}{accent && <><br /><em>{accent}</em></>}</Tag>
      </div>
      {intro && <p>{intro}</p>}
      {action && <div className={styles.sectionAction}>{action}</div>}
    </div>
  );
}

/** Mono meta line: category · date · read time (· anything else). Pass localized strings. */
export function MetaLine({ category, date, dateTime, readTime, updated, extra, className }: {
  category?: ReactNode; date?: ReactNode; dateTime?: string; readTime?: ReactNode; updated?: ReactNode; extra?: ReactNode[]; className?: string;
}) {
  return (
    <p className={cx(styles.meta, className)}>
      {category && <span className={styles.metaAccent}>{category}</span>}
      {date && (dateTime ? <time dateTime={dateTime}>{date}</time> : <span>{date}</span>)}
      {updated && <span>{updated}</span>}
      {readTime && <span>{readTime}</span>}
      {extra?.map((item, i) => <span key={i}>{item}</span>)}
    </p>
  );
}

/** Visual breadcrumb trail (the JSON-LD BreadcrumbList stays in the page). Last item is the current page. */
export function Breadcrumbs({ items, label = "Breadcrumb", className }: { items: { label: string; href?: string }[]; label?: string; className?: string }) {
  return (
    <nav aria-label={label} className={className}>
      <ol className={styles.breadcrumb}>
        {items.map((item, i) => {
          const last = i === items.length - 1;
          return <li key={`${item.label}-${i}`}>{item.href && !last ? <Link href={item.href}>{item.label}</Link> : <span aria-current={last ? "page" : undefined} title={last ? item.label : undefined}>{item.label}</span>}</li>;
        })}
      </ol>
    </nav>
  );
}

/** Category chips linking to /blogs and /blogs/category/<key>. */
export function CategoryNav({ ui, active, counts, label, keys, className }: {
  ui: BlogUiStrings; active: BlogCategory | "all"; counts?: Partial<Record<BlogCategory | "all", number>>;
  label?: string; keys?: (BlogCategory | "all")[]; className?: string;
}) {
  const list = keys ?? (["all", "growth", "automation", "seo", "case-study", "ops"] as const);
  return (
    <nav aria-label={label ?? ui.byCategoryEyebrow} className={className}>
      <ul className={styles.filter}>
        {list.map((key) => <li key={key}><Link href={categoryHref(key)} className={styles.chip} aria-current={key === active ? "page" : undefined}>
          {getCategoryLabel(ui, key)}{counts?.[key] !== undefined && <small>{pad(counts[key] ?? 0)}</small>}
        </Link></li>)}
      </ul>
    </nav>
  );
}

/** Tag pills (plain spans). */
export function TagList({ tags, label, className }: { tags: string[]; label?: string; className?: string }) {
  return <ul className={cx(styles.tags, className)} aria-label={label}>{tags.map((tag) => <li key={tag} className={styles.tag}>{tag}</li>)}</ul>;
}

/* ── Post cards ─────────────────────────────────────────────────────── */

export type PostCardVariant = "feature" | "card" | "row";

export interface PostCardProps {
  /** Already localized (localizePost). */
  post: BlogPost;
  ui: BlogUiStrings;
  locale: string;
  variant?: PostCardVariant;
  /** 1-based position; shown as "01" on cards/rows and "FIG. 01" on the thumbnail. */
  index?: number;
  headingLevel?: 2 | 3 | 4;
  /** Row variant only: show the excerpt under the title (default true). */
  showExcerpt?: boolean;
  /** Feature variant only: kicker text above the meta (e.g. ui.featuredEyebrow). */
  kicker?: ReactNode;
  className?: string;
}

function Heading({ level, className, children }: { level: 2 | 3 | 4; className: string; children: ReactNode }) {
  const Tag = `h${level}` as "h2" | "h3" | "h4";
  return <Tag className={className}>{children}</Tag>;
}

export function PostCard({ post, ui, locale, variant = "card", index, headingLevel = 3, showExcerpt = true, kicker, className }: PostCardProps) {
  const href = postHref(post.slug);
  const category = getCategoryLabel(ui, post.category);
  const date = formatPostDate(post.publishedAt, locale);
  const readTime = ui.readTime(post.readTime);

  if (variant === "row") {
    return (
      <article className={cx(styles.row, className)} data-figure-hover="">
        <span className={styles.rowIndex}>{index !== undefined ? pad(index) : ""}</span>
        <span className={styles.rowCategory}>{category}</span>
        <div className={styles.rowMain}>
          <Heading level={headingLevel} className={styles.rowTitle}><Link href={href}>{post.title}</Link></Heading>
          {showExcerpt && <p className={styles.rowExcerpt}>{post.excerpt}</p>}
        </div>
        <MetaLine date={date} dateTime={post.publishedAt} readTime={readTime} />
        <ArrowUpRight size={17} className={styles.arrow} aria-hidden="true" />
      </article>
    );
  }

  if (variant === "feature") {
    return (
      <article className={cx(styles.feature, className)} data-figure-hover="">
        <div className={styles.featureFigure}>
          <BlogFigure sketch={post.heroSketch} number={index ?? 1} alt={false} />
        </div>
        <div className={styles.featureBody}>
          <div className={styles.cardKicker}><span>{kicker ?? category}</span>{index !== undefined && <span>{pad(index)}</span>}</div>
          <Heading level={headingLevel} className={styles.featureTitle}><Link href={href}>{post.title}</Link></Heading>
          <p className={styles.featureSubtitle}>{post.subtitle || post.excerpt}</p>
          <MetaLine className={styles.featureMeta} category={kicker ? category : undefined} date={date} dateTime={post.publishedAt} readTime={readTime} />
          <span className={styles.featureLink} aria-hidden="true">{ui.featuredReadMore}<ArrowUpRight size={16} className={styles.arrow} /></span>
        </div>
        <aside className={styles.featureAside} aria-label={readTime}>
          <strong>{post.readTime}<small>{ui.minRead}</small></strong>
          <span>{readTime}</span>
          {post.takeaways[0] && <p><span className={styles.srOnly}>{ui.keyTakeaways}: </span>{post.takeaways[0]}</p>}
        </aside>
      </article>
    );
  }

  return (
    <article className={cx(styles.card, className)} data-figure-hover="">
      <div className={styles.cardFigure}>
        {index !== undefined && <span className={styles.cardFigLabel} aria-hidden="true">FIG. {pad(index)}</span>}
        <span className={styles.cardFigCode} aria-hidden="true">{category}</span>
        <FigureArt sketch={post.heroSketch} compact />
      </div>
      <div className={styles.cardBody}>
        <div className={styles.cardKicker}><span>{category}</span>{index !== undefined && <span>{pad(index)}</span>}</div>
        <Heading level={headingLevel} className={styles.cardTitle}><Link href={href}>{post.title}</Link></Heading>
        <p className={styles.cardExcerpt}>{post.excerpt}</p>
        <div className={styles.cardFoot}>
          <MetaLine date={date} dateTime={post.publishedAt} readTime={readTime} />
          <ArrowUpRight size={17} className={styles.arrow} aria-hidden="true" />
        </div>
      </div>
    </article>
  );
}

/** A list of posts with correct list semantics. `card` → hairline grid, `row` → numbered rows. */
export function PostGrid({ posts, ui, locale, variant = "card", columns = 3, startIndex = 1, headingLevel = 3, showExcerpt, reveal = true, label, className }: {
  posts: BlogPost[]; ui: BlogUiStrings; locale: string; variant?: "card" | "row"; columns?: 2 | 3;
  startIndex?: number; headingLevel?: 2 | 3 | 4; showExcerpt?: boolean;
  /** Staggered one-shot reveal on each item (default true). */ reveal?: boolean;
  label?: string; className?: string;
}) {
  const ListTag = variant === "row" ? "ol" : "ul";
  return (
    <ListTag className={cx(variant === "row" ? styles.rows : styles.grid, variant === "card" && columns === 2 && styles.grid2, className)} aria-label={label}>
      {posts.map((post, i) => <li key={post.slug} data-blog-reveal={reveal ? "" : undefined} style={reveal ? revealStyle(variant === "row" ? Math.min(i, 6) : i % columns) : undefined}>
        <PostCard post={post} ui={ui} locale={locale} variant={variant} index={startIndex + i} headingLevel={headingLevel} showExcerpt={showExcerpt} />
      </li>)}
    </ListTag>
  );
}

/* ── Article pieces ─────────────────────────────────────────────────── */

/** Renders `[anchor](/path)` links: relative → LocalizedLink, http(s) → new tab. Use inside <p>. */
export function InlineText({ text }: { text: string }) {
  return <>{parseInlineLinks(text).map((token, i) => {
    if (token.kind === "text") return <Fragment key={i}>{token.value}</Fragment>;
    if (/^https?:\/\//.test(token.href)) return <a key={i} href={token.href} target="_blank" rel="noopener noreferrer">{token.value}</a>;
    return <Link key={i} href={token.href}>{token.value}</Link>;
  })}</>;
}

/** Numbered prose heading: a mono "01 ────" rule above the display-font title. */
export function ProseHeading({ id, number, children, as: Tag = "h2", className }: { id?: string; number?: number | string; children: ReactNode; as?: "h2" | "h3"; className?: string }) {
  return <Tag id={id} className={className}>{number !== undefined && <span className={styles.proseNumber} aria-hidden="true">{typeof number === "number" ? pad(number) : number}</span>}{children}</Tag>;
}

/** Hairline box with an accent label and a 2px accent tick on the top edge. */
export function Callout({ label, title, children, className }: { label: ReactNode; title?: ReactNode; children?: ReactNode; className?: string }) {
  return (
    <aside className={cx(styles.callout, className)}>
      <div className={styles.calloutLabel}><i aria-hidden="true" />{label}</div>
      {title && <p className={styles.calloutTitle}>{title}</p>}
      {children}
    </aside>
  );
}

export function PullQuote({ children, cite, className }: { children: ReactNode; cite?: ReactNode; className?: string }) {
  return <blockquote className={cx(styles.pullQuote, className)}><p>{children}</p>{cite && <footer>{cite}</footer>}</blockquote>;
}

/** TL;DR / key takeaways: label + heading on one side, numbered hairline list on the other. */
export function Takeaways({ label, title, items, tone = "light", headingLevel = 2, id, className }: {
  label: ReactNode; title?: ReactNode; items: ReactNode[]; tone?: "light" | "dark"; headingLevel?: 2 | 3; id?: string; className?: string;
}) {
  const Tag = headingLevel === 2 ? "h2" : "h3";
  return (
    <section className={cx(styles.takeaways, tone === "dark" && styles.takeawaysDark, className)} aria-labelledby={id}>
      <div><div className={styles.calloutLabel}><i aria-hidden="true" />{label}</div>{title && <Tag id={id}>{title}</Tag>}</div>
      <ol>{items.map((item, i) => <li key={i}><span>{pad(i + 1)}</span><span>{item}</span></li>)}</ol>
    </section>
  );
}

/** Table of contents. BlogMotion highlights the section in view; the rail fills with progress when `progress` is on. */
export function Toc({ title, items, meta, footer, className }: { title: string; items: { id: string; label: string }[]; meta?: string; footer?: ReactNode; className?: string }) {
  return (
    <nav className={cx(styles.toc, className)} aria-label={title} data-blog-toc="">
      <div className={styles.tocTitle}><span>{title}</span>{meta && <span>{meta}</span>}</div>
      <ol className={styles.tocList} data-blog-progress="">
        {items.map((item, i) => <li key={item.id}><a href={`#${item.id}`}><span>{pad(i + 1)}</span><span>{item.label}</span></a></li>)}
      </ol>
      {footer && <div className={styles.tocFoot}>{footer}</div>}
    </nav>
  );
}

/** Author block (square monogram, name, role, bio, optional action). */
export function AuthorCard({ name, role, bio, label, action, className }: { name: string; role: string; bio?: string; label?: ReactNode; action?: ReactNode; className?: string }) {
  return (
    <div className={cx(styles.author, className)}>
      <span className={styles.avatar} aria-hidden="true">{authorInitials(name)}</span>
      <div>
        {label && <div className={styles.mono}>{label}</div>}
        <strong>{name}</strong>
        <span className={styles.mono}>{role}</span>
        {bio && <p>{bio}</p>}
        {action}
      </div>
    </div>
  );
}

/** Previous / next post links. */
export function PostPager({ prev, next, ui, className }: { prev: BlogPost | null; next: BlogPost | null; ui: BlogUiStrings; className?: string }) {
  if (!prev && !next) return null;
  return (
    <nav className={cx(styles.pager, className)} aria-label={`${ui.previousPost} / ${ui.nextPost}`}>
      {prev ? <Link href={postHref(prev.slug)} rel="prev"><span className={styles.mono}>← {ui.previousPost}</span><strong>{prev.title}</strong></Link> : <span aria-hidden="true" />}
      {next ? <Link href={postHref(next.slug)} rel="next"><span className={styles.mono}>{ui.nextPost} →</span><strong>{next.title}</strong></Link> : <span aria-hidden="true" />}
    </nav>
  );
}

/* ── Final CTA ──────────────────────────────────────────────────────── */

export interface FinalCtaProps {
  /** Mono eyebrow, e.g. "The next connection starts with a conversation". */
  eyebrow: ReactNode;
  /** Small line above the headline. */
  question?: ReactNode;
  /** Headline before the accent, e.g. "Let’s". */
  lead: ReactNode;
  /** Accent part of the headline, e.g. "engineer it." */
  accent: ReactNode;
  ctaLabel: ReactNode;
  /** Locale-less path (default "/contact"). */
  ctaHref?: string;
  note?: ReactNode;
  secondary?: { label: ReactNode; href: string };
  /** Caption under the circuit drawing. */
  circuitLabel?: string;
  footer?: { left?: ReactNode; center?: ReactNode; backToTop?: { label: ReactNode; href: string } };
  id?: string;
  className?: string;
}

/** Home-style closing band (light sand in both themes) with an animated circuit. */
export function FinalCta({ eyebrow, question, lead, accent, ctaLabel, ctaHref = "/contact", note, secondary, circuitLabel = "Your next chapter", footer, id = "blog-final-title", className }: FinalCtaProps) {
  return (
    <section className={cx(styles.final, className)} aria-labelledby={id} data-blog-scene="">
      <div className={home.container}>
        <div className={styles.finalEyebrow}><span className={home.signal} />{eyebrow}</div>
        <div className={styles.finalGrid}>
          <div>
            {question && <p className={styles.finalQuestion}>{question}</p>}
            <h2 id={id}>{lead} <em>{accent}</em></h2>
            <div className={styles.finalActions}>
              <Link href={ctaHref} className={home.primaryButton}>{ctaLabel}<ArrowUpRight size={19} aria-hidden="true" /></Link>
              {secondary && <Link href={secondary.href} className={home.textButton}>{secondary.label}<ArrowUpRight size={16} className={styles.arrow} aria-hidden="true" /></Link>}
            </div>
            {note && <span className={styles.finalNote}><Check size={14} aria-hidden="true" />{note}</span>}
          </div>
          <div className={styles.finalCircuit} aria-hidden="true">
            <svg viewBox="0 0 300 230">
              <path d="M0 50H85V115H165M0 180H85V115M165 115H230V30H300M230 115V200H300" />
              <path className={styles.circuitFlow} d="M0 50H85V115H230V30H300" />
              <path className={`${styles.circuitFlow} ${styles.circuitFlowB}`} d="M0 180H85V115H230V200H300" />
              <circle cx="165" cy="115" r="32" />
              <path className={styles.circuitCheck} d="m150 115 10 10 21-23" />
            </svg>
            <span>{circuitLabel}</span>
          </div>
        </div>
        {footer && <div className={styles.finalFooter}>
          <span>{footer.left}</span><span>{footer.center}</span>
          {footer.backToTop && <a href={footer.backToTop.href}>{footer.backToTop.label}<ArrowUpRight size={13} aria-hidden="true" /></a>}
        </div>}
      </div>
    </section>
  );
}
